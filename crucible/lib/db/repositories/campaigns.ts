import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { Campaign, CampaignCohort } from "../types";

export const campaignsRepo = {
  create(offerId: string, name: string): Campaign {
    const campaign: Campaign = {
      id: `cmp_${nanoid(10)}`,
      offerId,
      name,
      createdAt: new Date().toISOString(),
    };
    getStore().campaigns.set(campaign.id, campaign);
    return campaign;
  },

  upsert(campaign: Campaign): Campaign {
    getStore().campaigns.set(campaign.id, campaign);
    return campaign;
  },

  findById(id: string): Campaign | undefined {
    return getStore().campaigns.get(id);
  },

  listByOffer(offerId: string): Campaign[] {
    return Array.from(getStore().campaigns.values()).filter((c) => c.offerId === offerId);
  },
};

export const cohortsRepo = {
  create(campaignId: string, cohortNumber?: number): CampaignCohort {
    const store = getStore();
    const existing = Array.from(store.cohorts.values()).filter(
      (c) => c.campaignId === campaignId,
    );
    const next = cohortNumber ?? existing.length + 1;
    const cohort: CampaignCohort = {
      id: `co_${nanoid(10)}`,
      campaignId,
      cohortNumber: next,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    store.cohorts.set(cohort.id, cohort);
    return cohort;
  },

  upsert(cohort: CampaignCohort): CampaignCohort {
    getStore().cohorts.set(cohort.id, cohort);
    return cohort;
  },

  findById(id: string): CampaignCohort | undefined {
    return getStore().cohorts.get(id);
  },

  setStatus(id: string, status: CampaignCohort["status"]): CampaignCohort | undefined {
    const cohort = getStore().cohorts.get(id);
    if (!cohort) return undefined;
    cohort.status = status;
    getStore().cohorts.set(id, cohort);
    return cohort;
  },

  listByCampaign(campaignId: string): CampaignCohort[] {
    return Array.from(getStore().cohorts.values())
      .filter((c) => c.campaignId === campaignId)
      .sort((a, b) => a.cohortNumber - b.cohortNumber);
  },
};
