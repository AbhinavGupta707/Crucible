import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
