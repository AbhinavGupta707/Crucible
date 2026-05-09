import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type OfferCreateInput = Prisma.OfferCreateInput;

export async function createOffer(data: OfferCreateInput) {
  return prisma.offer.create({ data });
}

export async function getOffer(offerId: string) {
  return prisma.offer.findUnique({ where: { id: offerId } });
}

export async function getOfferOrThrow(offerId: string) {
  return prisma.offer.findUniqueOrThrow({ where: { id: offerId } });
}

export async function listOffersByWorkspace(workspaceId: string) {
  return prisma.offer.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOfferWithHypotheses(offerId: string) {
  return prisma.offer.findUnique({
    where: { id: offerId },
    include: { hypotheses: true },
  });
}

/**
 * Returns the entire run for an offer in one query: offer, hypotheses,
 * archetypes (with active version), prospects, matches, campaigns, cohorts,
 * outbound emails, replies, calibration runs, persona updates, next-cohort
 * plans. Used by the UI to hydrate a full run from one fetch.
 */
export async function getOfferRunFull(offerId: string) {
  return prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      hypotheses: true,
      archetypes: {
        include: {
          activeVersion: true,
          versions: { orderBy: { versionNumber: "asc" } },
        },
      },
      prospects: {
        include: {
          matches: { include: { archetype: true } },
        },
      },
      campaigns: {
        include: {
          cohorts: {
            include: {
              outboundEmails: {
                include: {
                  prospect: true,
                  match: true,
                  reply: true,
                  events: true,
                },
              },
              calibrationRuns: {
                include: {
                  personaUpdates: {
                    include: {
                      archetype: true,
                      fromVersion: true,
                      toVersion: true,
                    },
                  },
                },
              },
              nextCohortPlans: true,
            },
            orderBy: { cohortNumber: "asc" },
          },
        },
      },
    },
  });
}
