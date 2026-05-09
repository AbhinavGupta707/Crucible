import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { ReplyAnalysis } from "../types";

export type ReplyAnalysisCreateInput = Prisma.ReplyAnalysisUncheckedCreateInput;

export async function upsertReplyAnalysis(args: {
  emailId: string;
  data: Omit<ReplyAnalysisCreateInput, "emailId">;
}) {
  return prisma.replyAnalysis.upsert({
    where: { emailId: args.emailId },
    create: { emailId: args.emailId, ...args.data },
    update: { ...args.data },
  });
}

export async function getReply(replyId: string) {
  return prisma.replyAnalysis.findUnique({
    where: { id: replyId },
    include: { email: { include: { prospect: true, match: true } } },
  });
}

export async function listRepliesByCohort(cohortId: string) {
  return prisma.replyAnalysis.findMany({
    where: { email: { cohortId } },
    include: { email: { include: { prospect: true, match: true } } },
    orderBy: { receivedAt: "asc" },
  });
}

function now() {
  return new Date().toISOString();
}

type SafeModeReplyInput = Omit<
  ReplyAnalysis,
  "id" | "createdAt"
> & { id?: string; createdAt?: string };

export const repliesRepo = {
  upsertForEmail(data: SafeModeReplyInput): ReplyAnalysis {
    const existing = Array.from(getStore().replies.values()).find(
      (reply) => reply.emailId === data.emailId,
    );
    const reply: ReplyAnalysis = {
      ...existing,
      ...data,
      id: existing?.id ?? data.id ?? `reply_${nanoid(8)}`,
      createdAt: existing?.createdAt ?? data.createdAt ?? now(),
    };
    getStore().replies.set(reply.id, reply);
    return reply;
  },

  findById(replyId: string) {
    return getStore().replies.get(replyId) ?? null;
  },

  listByCohort(cohortId: string) {
    const emailIds = new Set(
      Array.from(getStore().emails.values())
        .filter((email) => email.cohortId === cohortId)
        .map((email) => email.id),
    );
    return Array.from(getStore().replies.values()).filter((reply) =>
      emailIds.has(reply.emailId),
    );
  },
};
