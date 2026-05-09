import type { GmailConnection, GmailTokens } from "./types";
import { prisma } from "../db/prisma";

export interface TokenStore {
  upsert(input: {
    workspaceId: string;
    emailAddress: string;
    tokens: GmailTokens;
  }): Promise<GmailConnection>;

  getByWorkspace(workspaceId: string): Promise<GmailConnection | null>;

  updateTokens(id: string, tokens: GmailTokens): Promise<GmailConnection>;

  delete(id: string): Promise<void>;
}

class InMemoryTokenStore implements TokenStore {
  private byId = new Map<string, GmailConnection>();
  private byWorkspace = new Map<string, string>();

  async upsert(input: {
    workspaceId: string;
    emailAddress: string;
    tokens: GmailTokens;
  }): Promise<GmailConnection> {
    const existingId = this.byWorkspace.get(input.workspaceId);
    const now = new Date();
    if (existingId) {
      const existing = this.byId.get(existingId)!;
      const updated: GmailConnection = {
        ...existing,
        emailAddress: input.emailAddress,
        tokens: { ...existing.tokens, ...input.tokens },
        updatedAt: now,
      };
      this.byId.set(existingId, updated);
      return updated;
    }
    const id = `gmail_conn_${Math.random().toString(36).slice(2, 10)}`;
    const created: GmailConnection = {
      id,
      workspaceId: input.workspaceId,
      emailAddress: input.emailAddress,
      tokens: input.tokens,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(id, created);
    this.byWorkspace.set(input.workspaceId, id);
    return created;
  }

  async getByWorkspace(workspaceId: string): Promise<GmailConnection | null> {
    const id = this.byWorkspace.get(workspaceId);
    return id ? this.byId.get(id) ?? null : null;
  }

  async updateTokens(id: string, tokens: GmailTokens): Promise<GmailConnection> {
    const existing = this.byId.get(id);
    if (!existing) throw new Error(`Unknown GmailConnection: ${id}`);
    const updated: GmailConnection = {
      ...existing,
      tokens: { ...existing.tokens, ...tokens },
      updatedAt: new Date(),
    };
    this.byId.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = this.byId.get(id);
    if (!existing) return;
    this.byId.delete(id);
    if (this.byWorkspace.get(existing.workspaceId) === id) {
      this.byWorkspace.delete(existing.workspaceId);
    }
  }
}

let override: TokenStore | null = null;
const inMemory = new InMemoryTokenStore();
let prismaStore: TokenStore | null = null;

export function setTokenStore(store: TokenStore | null): void {
  override = store;
}

export function getTokenStore(): TokenStore {
  if (override) return override;
  if (!process.env.DATABASE_URL) return inMemory;
  prismaStore ??= new PrismaTokenStore();
  return prismaStore;
}

class PrismaTokenStore implements TokenStore {
  async upsert(input: {
    workspaceId: string;
    emailAddress: string;
    tokens: GmailTokens;
  }): Promise<GmailConnection> {
    await ensureWorkspace(input.workspaceId);

    const existing = await prisma.gmailConnection.findFirst({
      where: { workspaceId: input.workspaceId },
      orderBy: { updatedAt: "desc" },
    });

    const tokenData = toPrismaTokenData(input.tokens, existing ?? undefined);
    const row = existing
      ? await prisma.gmailConnection.update({
          where: { id: existing.id },
          data: {
            email: input.emailAddress,
            status: "connected",
            ...tokenData,
          },
        })
      : await prisma.gmailConnection.create({
          data: {
            workspaceId: input.workspaceId,
            email: input.emailAddress,
            status: "connected",
            ...tokenData,
          },
        });

    return fromPrisma(row);
  }

  async getByWorkspace(workspaceId: string): Promise<GmailConnection | null> {
    const row = await prisma.gmailConnection.findFirst({
      where: {
        workspaceId,
        status: "connected",
        accessToken: { not: null },
      },
      orderBy: { updatedAt: "desc" },
    });
    return row ? fromPrisma(row) : null;
  }

  async updateTokens(
    id: string,
    tokens: GmailTokens,
  ): Promise<GmailConnection> {
    const existing = await prisma.gmailConnection.findUnique({ where: { id } });
    if (!existing) throw new Error(`Unknown GmailConnection: ${id}`);

    const row = await prisma.gmailConnection.update({
      where: { id },
      data: toPrismaTokenData(tokens, existing),
    });
    return fromPrisma(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.gmailConnection.delete({ where: { id } }).catch((err) => {
      if (isRecordNotFound(err)) return;
      throw err;
    });
  }
}

type PrismaGmailConnection = Awaited<
  ReturnType<typeof prisma.gmailConnection.findFirst>
> & {};

function fromPrisma(row: NonNullable<PrismaGmailConnection>): GmailConnection {
  if (!row.accessToken) {
    throw new Error(`GmailConnection ${row.id} is missing an access token`);
  }
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    emailAddress: row.email,
    tokens: {
      accessToken: row.accessToken,
      refreshToken: row.refreshToken ?? undefined,
      expiryDate: row.tokenExpiresAt?.getTime(),
      scope: row.scopes.join(" ") || undefined,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPrismaTokenData(
  tokens: GmailTokens,
  existing?: NonNullable<PrismaGmailConnection>,
) {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? existing?.refreshToken ?? null,
    tokenExpiresAt: tokens.expiryDate
      ? new Date(tokens.expiryDate)
      : existing?.tokenExpiresAt ?? null,
    scopes: tokens.scope ? parseScopes(tokens.scope) : existing?.scopes ?? [],
  };
}

async function ensureWorkspace(workspaceId: string): Promise<void> {
  const slug = workspaceId === "default" ? "default" : `gmail-${workspaceId}`;
  await prisma.workspace.upsert({
    where: { id: workspaceId },
    create: {
      id: workspaceId,
      slug: slug.slice(0, 80),
      name:
        workspaceId === "default"
          ? "Default Crucible Workspace"
          : "Crucible Gmail Workspace",
    },
    update: {},
  });
}

function parseScopes(scope: string): string[] {
  return scope
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isRecordNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "P2025"
  );
}
