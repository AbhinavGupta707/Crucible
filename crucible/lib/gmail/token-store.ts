import type { GmailConnection, GmailTokens } from "./types";

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

export function setTokenStore(store: TokenStore | null): void {
  override = store;
}

export function getTokenStore(): TokenStore {
  return override ?? inMemory;
}
