import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { Offer, Tone } from "../types";

export type OfferInput = {
  workspaceId?: string;
  title: string;
  productSummary: string;
  rawFounderInput: string;
  icpGuess: string;
  desiredCta: string;
  tone: Tone;
  painClaim?: string;
  proofPoint?: string;
  likelyBuyer?: string;
  likelyUser?: string;
  champion?: string;
  messageAngles?: string[];
  riskyAssumptions?: string[];
};

export const offersRepo = {
  create(input: OfferInput): Offer {
    const store = getStore();
    const offer: Offer = {
      id: `offer_${nanoid(10)}`,
      workspaceId: input.workspaceId ?? store.workspaceId,
      title: input.title,
      productSummary: input.productSummary,
      rawFounderInput: input.rawFounderInput,
      icpGuess: input.icpGuess,
      desiredCta: input.desiredCta,
      tone: input.tone,
      painClaim: input.painClaim ?? "",
      proofPoint: input.proofPoint ?? "",
      likelyBuyer: input.likelyBuyer ?? "",
      likelyUser: input.likelyUser ?? "",
      champion: input.champion ?? "",
      messageAngles: input.messageAngles ?? [],
      riskyAssumptions: input.riskyAssumptions ?? [],
      createdAt: new Date().toISOString(),
    };
    store.offers.set(offer.id, offer);
    return offer;
  },

  upsert(offer: Offer): Offer {
    getStore().offers.set(offer.id, offer);
    return offer;
  },

  findById(id: string): Offer | undefined {
    return getStore().offers.get(id);
  },

  list(): Offer[] {
    return Array.from(getStore().offers.values());
  },
};
