import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type OutboundEmailCreateInput = Prisma.OutboundEmailUncheckedCreateInput;

export async function createOutboundEmail(data: OutboundEmailCreateInput) {
  return prisma.outboundEmail.create({ data });
}

export async function bulkCreateOutboundEmails(
  data: OutboundEmailCreateInput[],
) {
  if (data.length === 0) return [] as Awaited<
    ReturnType<typeof prisma.outboundEmail.create>
  >[];
  // createMany skips returning rows; create one by one so callers get full records.
  const created = [] as Awaited<
    ReturnType<typeof prisma.outboundEmail.create>
  >[];
  for (const row of data) {
    created.push(await prisma.outboundEmail.create({ data: row }));
  }
  return created;
}

export async function getEmail(emailId: string) {
  return prisma.outboundEmail.findUnique({
    where: { id: emailId },
    include: { prospect: true, match: true, reply: true, events: true },
  });
}

export async function listEmailsByCohort(cohortId: string) {
  return prisma.outboundEmail.findMany({
    where: { cohortId },
    include: { prospect: true, match: true, reply: true, events: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveEmail(emailId: string, approvedBy: string) {
  return prisma.outboundEmail.update({
    where: { id: emailId },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedBy,
    },
  });
}

export async function attachGmailDraft(args: {
  emailId: string;
  gmailDraftId: string;
  gmailThreadId?: string | null;
}) {
  return prisma.outboundEmail.update({
    where: { id: args.emailId },
    data: {
      status: "drafted_in_gmail",
      gmailDraftId: args.gmailDraftId,
      gmailThreadId: args.gmailThreadId ?? null,
    },
  });
}

export async function markSent(args: {
  emailId: string;
  gmailMessageId: string;
  gmailThreadId: string;
  sentAt?: Date;
}) {
  return prisma.outboundEmail.update({
    where: { id: args.emailId },
    data: {
      status: "sent",
      gmailMessageId: args.gmailMessageId,
      gmailThreadId: args.gmailThreadId,
      sentAt: args.sentAt ?? new Date(),
    },
  });
}

export async function recordEvent(data: Prisma.EmailEventUncheckedCreateInput) {
  return prisma.emailEvent.create({ data });
}

export async function findEmailByProspectEmailInCohort(args: {
  cohortId: string;
  prospectEmail: string;
}) {
  return prisma.outboundEmail.findFirst({
    where: {
      cohortId: args.cohortId,
      prospect: { email: args.prospectEmail },
    },
    include: { prospect: true, match: true, reply: true },
  });
}
