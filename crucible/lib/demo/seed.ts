// Idempotent demo seed. Creates the workspace's offer, archetypes, prospects,
// matches, campaign, and an empty cohort. Re-running returns the existing IDs.

import { archetypesRepo } from "../db/repositories/archetypes";
import { campaignsRepo, cohortsRepo } from "../db/repositories/campaigns";
import { offersRepo } from "../db/repositories/offers";
import { prospectsRepo } from "../db/repositories/prospects";
import { buildBuyerMemory } from "../ai/workflows/build-buyer-memory";
import { matchProspect } from "../ai/workflows/match-prospect";
import { SAMPLE_OFFER } from "./sample-offer";
import { SAMPLE_LEADS } from "./sample-leads";
import type { BuyerArchetype, Campaign, CampaignCohort, Offer, Prospect } from "../db/types";

export type DemoSeedResult = {
  offer: Offer;
  archetypes: BuyerArchetype[];
  prospects: Prospect[];
  campaign: Campaign;
  cohort: CampaignCohort;
  created: boolean;
};

const DEMO_OFFER_TITLE = SAMPLE_OFFER.title;
const DEMO_CAMPAIGN_NAME = "Pilot Cohort";

export async function seedDemo(): Promise<DemoSeedResult> {
  const existingOffer = offersRepo.list().find((o) => o.title === DEMO_OFFER_TITLE);
  if (existingOffer) {
    const archetypes = archetypesRepo.listByOffer(existingOffer.id);
    const prospects = prospectsRepo.listByOffer(existingOffer.id);
    const campaign =
      campaignsRepo.listByOffer(existingOffer.id).find((c) => c.name === DEMO_CAMPAIGN_NAME) ??
      campaignsRepo.create(existingOffer.id, DEMO_CAMPAIGN_NAME);
    const cohorts = cohortsRepo.listByCampaign(campaign.id);
    const cohort = cohorts[0] ?? cohortsRepo.create(campaign.id);
    return { offer: existingOffer, archetypes, prospects, campaign, cohort, created: false };
  }

  const offer = offersRepo.create({
    rawFounderInput: SAMPLE_OFFER.rawFounderInput,
    title: SAMPLE_OFFER.title,
    productSummary: SAMPLE_OFFER.productSummary,
    icpGuess: SAMPLE_OFFER.icpGuess,
    desiredCta: SAMPLE_OFFER.desiredCta,
    tone: SAMPLE_OFFER.tone,
    painClaim: SAMPLE_OFFER.painClaim,
    proofPoint: SAMPLE_OFFER.proofPoint,
    likelyBuyer: SAMPLE_OFFER.likelyBuyer,
    likelyUser: SAMPLE_OFFER.likelyUser,
    champion: SAMPLE_OFFER.champion,
    messageAngles: SAMPLE_OFFER.messageAngles,
    riskyAssumptions: SAMPLE_OFFER.riskyAssumptions,
  });

  const memory = await buildBuyerMemory({ offerId: offer.id });

  const prospects: Prospect[] = SAMPLE_LEADS.map((lead) =>
    prospectsRepo.create({
      offerId: offer.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      title: lead.title,
      company: lead.company,
      industry: lead.industry,
      companySize: lead.companySize,
      notes: lead.notes,
      trigger: lead.trigger,
      website: lead.website,
      linkedinSummary: lead.linkedinSummary,
    }),
  );

  for (const p of prospects) {
    await matchProspect(p);
  }

  const campaign = campaignsRepo.create(offer.id, DEMO_CAMPAIGN_NAME);
  const cohort = cohortsRepo.create(campaign.id);

  return {
    offer,
    archetypes: memory.archetypes,
    prospects,
    campaign,
    cohort,
    created: true,
  };
}
