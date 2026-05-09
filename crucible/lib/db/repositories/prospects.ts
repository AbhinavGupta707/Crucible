import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type ProspectCreateInput = Prisma.ProspectCreateInput;
export type ProspectUncheckedCreateInput = Prisma.ProspectUncheckedCreateInput;
export type MatchCreateInput = Prisma.ProspectMatchCreateInput;

export async function createProspect(data: ProspectCreateInput) {
  return prisma.prospect.create({ data });
}

export async function bulkCreateProspects(data: ProspectUncheckedCreateInput[]) {
  if (data.length === 0) return { count: 0 };
  return prisma.prospect.createMany({ data, skipDuplicates: true });
}

export async function listProspects(offerId: string) {
  return prisma.prospect.findMany({
    where: { offerId },
    include: { matches: { include: { archetype: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProspect(prospectId: string) {
  return prisma.prospect.findUnique({
    where: { id: prospectId },
    include: { matches: { include: { archetype: true } } },
  });
}

export async function getProspectByEmail(offerId: string, email: string) {
  return prisma.prospect.findUnique({
    where: { offerId_email: { offerId, email } },
  });
}

export async function upsertMatch(args: {
  prospectId: string;
  archetypeId: string;
  data: Omit<
    Prisma.ProspectMatchUncheckedCreateInput,
    "prospectId" | "archetypeId"
  >;
}) {
  return prisma.prospectMatch.upsert({
    where: {
      prospectId_archetypeId: {
        prospectId: args.prospectId,
        archetypeId: args.archetypeId,
      },
    },
    create: {
      prospectId: args.prospectId,
      archetypeId: args.archetypeId,
      ...args.data,
    },
    update: { ...args.data },
  });
}

export async function setPreflightPrediction(args: {
  matchId: string;
  predictedOutcome: string;
  predictedObjection: string | null;
  recommendedAngle: string | null;
  predictedReplyLikelihood: number;
  predictionConfidence: number;
  phrasesToUse: string[];
  phrasesToAvoid: string[];
}) {
  return prisma.prospectMatch.update({
    where: { id: args.matchId },
    data: {
      predictedOutcome: args.predictedOutcome,
      predictedObjection: args.predictedObjection,
      recommendedAngle: args.recommendedAngle,
      predictedReplyLikelihood: args.predictedReplyLikelihood,
      predictionConfidence: args.predictionConfidence,
      phrasesToUse: args.phrasesToUse,
      phrasesToAvoid: args.phrasesToAvoid,
    },
  });
}
