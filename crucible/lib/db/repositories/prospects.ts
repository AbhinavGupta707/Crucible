import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { Prospect, ProspectMatch } from "../types";

export type ProspectInput = Omit<Prospect, "id" | "createdAt">;

export const prospectsRepo = {
  create(input: ProspectInput): Prospect {
    const prospect: Prospect = {
      id: `pro_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    getStore().prospects.set(prospect.id, prospect);
    return prospect;
  },

  upsert(prospect: Prospect): Prospect {
    getStore().prospects.set(prospect.id, prospect);
    return prospect;
  },

  findById(id: string): Prospect | undefined {
    return getStore().prospects.get(id);
  },

  listByOffer(offerId: string): Prospect[] {
    return Array.from(getStore().prospects.values()).filter((p) => p.offerId === offerId);
  },
};

export type MatchInput = Omit<ProspectMatch, "id" | "createdAt">;

export const matchesRepo = {
  upsertForProspect(input: MatchInput): ProspectMatch {
    const store = getStore();
    const existing = Array.from(store.matches.values()).find(
      (m) => m.prospectId === input.prospectId,
    );
    const match: ProspectMatch = existing
      ? { ...existing, ...input, createdAt: new Date().toISOString() }
      : {
          id: `match_${nanoid(10)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
    store.matches.set(match.id, match);
    return match;
  },

  findByProspect(prospectId: string): ProspectMatch | undefined {
    return Array.from(getStore().matches.values()).find((m) => m.prospectId === prospectId);
  },

  listByProspects(prospectIds: string[]): ProspectMatch[] {
    const set = new Set(prospectIds);
    return Array.from(getStore().matches.values()).filter((m) => set.has(m.prospectId));
  },
};
