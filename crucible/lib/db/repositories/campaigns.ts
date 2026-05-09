import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { Campaign, CampaignCohort } from "../types";

export type CampaignCreateInput = Prisma.CampaignCreateInput;
export type CohortCreateInput = Prisma.CampaignCohortCreateInput;

export async function createCampaign(data: CampaignCreateInput) {
  return prisma.campaign.create({ data });
}

export async function getCampaign(campaignId: string) {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { cohorts: { orderBy: { cohortNumber: "asc" } } },
  });
}

export async function listCampaignsByOffer(offerId: string) {
  return prisma.campaign.findMany({
    where: { offerId },
    include: { cohorts: { orderBy: { cohortNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCohort(data: {
  campaignId: string;
  cohortNumber: number;
  hypothesis?: string | null;
  notes?: string | null;
}) {
  return prisma.campaignCohort.create({
    data: {
      campaign: { connect: { id: data.campaignId } },
      cohortNumber: data.cohortNumber,
      hypothesis: data.hypothesis ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function nextCohortNumber(campaignId: string): Promise<number> {
  const last = await prisma.campaignCohort.findFirst({
    where: { campaignId },
    orderBy: { cohortNumber: "desc" },
  });
  return (last?.cohortNumber ?? 0) + 1;
}

export async function getCohort(cohortId: string) {
  return prisma.campaignCohort.findUnique({
    where: { id: cohortId },
    include: {
      outboundEmails: {
        include: {
          prospect: true,
          match: { include: { archetype: { include: { activeVersion: true } } } },
          reply: true,
          events: true,
        },
      },
      calibrationRuns: { include: { personaUpdates: true } },
      nextCohortPlans: true,
      campaign: true,
    },
  });
}

export async function setCohortStatus(cohortId: string, status: string) {
  return prisma.campaignCohort.update({
    where: { id: cohortId },
    data: { status },
  });
}

export async function createNextCohortPlan(
  data: Prisma.NextCohortPlanUncheckedCreateInput,
) {
  return prisma.nextCohortPlan.create({ data });
}

function now() {
  return new Date().toISOString();
}

export const campaignsRepo = {
  create(offerId: string, name = "Pilot Cohort"): Campaign {
    const campaign: Campaign = {
      id: `camp_${nanoid(8)}`,
      offerId,
      name,
      createdAt: now(),
    };
    getStore().campaigns.set(campaign.id, campaign);
    return campaign;
  },

  findById(campaignId: string) {
    return getStore().campaigns.get(campaignId) ?? null;
  },

  listByOffer(offerId: string) {
    return Array.from(getStore().campaigns.values()).filter(
      (c) => c.offerId === offerId,
    );
  },
};

export const cohortsRepo = {
  create(campaignId: string, cohortNumber?: number): CampaignCohort {
    const existing = this.listByCampaign(campaignId);
    const cohort: CampaignCohort = {
      id: `cohort_${nanoid(8)}`,
      campaignId,
      cohortNumber:
        cohortNumber ??
        (existing.reduce((max, c) => Math.max(max, c.cohortNumber), 0) + 1),
      status: "draft",
      createdAt: now(),
    };
    getStore().cohorts.set(cohort.id, cohort);
    return cohort;
  },

  findById(cohortId: string) {
    return getStore().cohorts.get(cohortId) ?? null;
  },

  listByCampaign(campaignId: string) {
    return Array.from(getStore().cohorts.values())
      .filter((c) => c.campaignId === campaignId)
      .sort((a, b) => a.cohortNumber - b.cohortNumber);
  },

  setStatus(cohortId: string, status: CampaignCohort["status"]) {
    const cohort = getStore().cohorts.get(cohortId);
    if (!cohort) return null;
    cohort.status = status;
    getStore().cohorts.set(cohort.id, cohort);
    return cohort;
  },
};
