import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { Offer } from "../types";

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

function now() {
  return new Date().toISOString();
}

export const DEMO_WORKSPACE_ID = "ws_demo";

export type SafeModeOfferInput = Partial<Offer> &
  Pick<Offer, "rawFounderInput" | "icpGuess" | "desiredCta" | "tone">;

export const offersRepo = {
  create(data: SafeModeOfferInput): Offer {
    const offer: Offer = {
      id: data.id ?? `offer_${nanoid(8)}`,
      workspaceId: data.workspaceId ?? DEMO_WORKSPACE_ID,
      title: data.title ?? "Untitled offer",
      productSummary:
        data.productSummary ?? data.rawFounderInput.slice(0, 200),
      rawFounderInput: data.rawFounderInput,
      icpGuess: data.icpGuess,
      desiredCta: data.desiredCta,
      tone: data.tone,
      painClaim: data.painClaim ?? "",
      proofPoint: data.proofPoint ?? "",
      likelyBuyer: data.likelyBuyer ?? "",
      likelyUser: data.likelyUser ?? "",
      champion: data.champion ?? "",
      messageAngles: data.messageAngles ?? [],
      riskyAssumptions: data.riskyAssumptions ?? [],
      createdAt: data.createdAt ?? now(),
    };
    getStore().offers.set(offer.id, offer);
    return offer;
  },

  findById(offerId: string) {
    return getStore().offers.get(offerId) ?? null;
  },

  list() {
    return Array.from(getStore().offers.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },
};
