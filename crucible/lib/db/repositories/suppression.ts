import { prisma } from "../prisma";
import { nanoid } from "nanoid";
import { getStore } from "../store";

export async function isSuppressed(workspaceId: string, email: string) {
  const hit = await prisma.suppressionEntry.findUnique({
    where: { workspaceId_email: { workspaceId, email } },
  });
  return Boolean(hit);
}

export async function addSuppression(args: {
  workspaceId: string;
  email: string;
  reason: string;
  notes?: string | null;
}) {
  return prisma.suppressionEntry.upsert({
    where: {
      workspaceId_email: {
        workspaceId: args.workspaceId,
        email: args.email,
      },
    },
    create: {
      workspaceId: args.workspaceId,
      email: args.email,
      reason: args.reason,
      notes: args.notes ?? null,
    },
    update: {
      reason: args.reason,
      notes: args.notes ?? null,
    },
  });
}

export async function listSuppression(workspaceId: string) {
  return prisma.suppressionEntry.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export const suppressionRepo = {
  add(email: string, reason: string) {
    const entry = {
      id: `supp_${nanoid(8)}`,
      email,
      reason: reason as "unsubscribe" | "hostile" | "bounce" | "manual",
      createdAt: new Date().toISOString(),
    };
    getStore().suppression.set(email.toLowerCase(), entry);
    return entry;
  },

  isSuppressed(email: string) {
    return getStore().suppression.has(email.toLowerCase());
  },
};
