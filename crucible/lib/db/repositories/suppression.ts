import { prisma } from "../prisma";

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
