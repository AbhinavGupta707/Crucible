import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { Prospect, ProspectMatch } from "../types";

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
  signalContribution?: number;
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
      signalContribution: args.signalContribution,
    },
  });
}

function now() {
  return new Date().toISOString();
}

type SafeModeProspectInput = Partial<Prospect> &
  Pick<Prospect, "offerId" | "firstName" | "lastName" | "email" | "title" | "company">;

export const prospectsRepo = {
  create(data: SafeModeProspectInput): Prospect {
    const prospect: Prospect = {
      id: data.id ?? `prospect_${nanoid(8)}`,
      offerId: data.offerId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      title: data.title,
      company: data.company,
      industry: data.industry ?? "",
      companySize: data.companySize ?? "",
      notes: data.notes ?? "",
      trigger: data.trigger ?? "",
      website: data.website ?? "",
      linkedinSummary: data.linkedinSummary ?? "",
      signalType: data.signalType ?? null,
      signalSummary: data.signalSummary ?? null,
      signalSource: data.signalSource ?? null,
      signalDate: data.signalDate ?? null,
      signalStrength: data.signalStrength ?? null,
      signalUrl: data.signalUrl ?? null,
      intentScore: data.intentScore ?? null,
      icpFitScore: data.icpFitScore ?? null,
      signalFreshnessScore: data.signalFreshnessScore ?? null,
      leadPriorityScore: data.leadPriorityScore ?? null,
      whyNow: data.whyNow ?? null,
      recommendedAngle: data.recommendedAngle ?? null,
      createdAt: data.createdAt ?? now(),
    };
    getStore().prospects.set(prospect.id, prospect);
    return prospect;
  },

  findById(prospectId: string) {
    return getStore().prospects.get(prospectId) ?? null;
  },

  listByOffer(offerId: string) {
    return Array.from(getStore().prospects.values()).filter(
      (p) => p.offerId === offerId,
    );
  },
};

type SafeModeMatchInput = Omit<
  ProspectMatch,
  "id" | "createdAt"
> & { id?: string; createdAt?: string };

export const matchesRepo = {
  upsertForProspect(data: SafeModeMatchInput): ProspectMatch {
    const store = getStore();
    const existing = Array.from(store.matches.values()).find(
      (m) =>
        m.prospectId === data.prospectId &&
        m.archetypeId === data.archetypeId,
    );
    const match: ProspectMatch = {
      ...existing,
      ...data,
      id: existing?.id ?? data.id ?? `match_${nanoid(8)}`,
      createdAt: existing?.createdAt ?? data.createdAt ?? now(),
    };
    store.matches.set(match.id, match);
    return match;
  },

  findByProspect(prospectId: string) {
    return (
      Array.from(getStore().matches.values()).find(
        (m) => m.prospectId === prospectId,
      ) ?? null
    );
  },
};
