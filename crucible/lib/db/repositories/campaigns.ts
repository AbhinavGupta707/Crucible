import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
