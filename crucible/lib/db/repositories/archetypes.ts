import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { ArchetypeVersion, BuyerArchetype } from "../types";

export type ArchetypeSeed = Omit<BuyerArchetype, "id" | "activeVersionId" | "versions" | "createdAt"> & {
  initialVersion: Omit<ArchetypeVersion, "id" | "archetypeId" | "createdAt" | "versionNumber" | "reason">;
};

export const archetypesRepo = {
  createWithInitialVersion(seed: ArchetypeSeed): BuyerArchetype {
    const store = getStore();
    const archetypeId = `arch_${nanoid(10)}`;
    const versionId = `arv_${nanoid(10)}`;
    const now = new Date().toISOString();

    const v1: ArchetypeVersion = {
      id: versionId,
      archetypeId,
      versionNumber: 1,
      reason: null,
      createdAt: now,
      ...seed.initialVersion,
    };

    const archetype: BuyerArchetype = {
      id: archetypeId,
      offerId: seed.offerId,
      name: seed.name,
      segment: seed.segment,
      role: seed.role,
      activeVersionId: versionId,
      versions: [v1],
      createdAt: now,
    };

    store.archetypes.set(archetype.id, archetype);
    return archetype;
  },

  upsert(archetype: BuyerArchetype): BuyerArchetype {
    getStore().archetypes.set(archetype.id, archetype);
    return archetype;
  },

  findById(id: string): BuyerArchetype | undefined {
    return getStore().archetypes.get(id);
  },

  listByOffer(offerId: string): BuyerArchetype[] {
    return Array.from(getStore().archetypes.values()).filter((a) => a.offerId === offerId);
  },

  appendVersion(
    archetypeId: string,
    next: Omit<ArchetypeVersion, "id" | "archetypeId" | "createdAt" | "versionNumber">,
  ): { archetype: BuyerArchetype; previousVersion: ArchetypeVersion; newVersion: ArchetypeVersion } {
    const store = getStore();
    const archetype = store.archetypes.get(archetypeId);
    if (!archetype) throw new Error(`Archetype not found: ${archetypeId}`);
    const previousVersion = archetype.versions[archetype.versions.length - 1];
    const versionId = `arv_${nanoid(10)}`;
    const newVersion: ArchetypeVersion = {
      id: versionId,
      archetypeId,
      versionNumber: previousVersion.versionNumber + 1,
      createdAt: new Date().toISOString(),
      ...next,
    };
    archetype.versions.push(newVersion);
    archetype.activeVersionId = versionId;
    store.archetypes.set(archetype.id, archetype);
    return { archetype, previousVersion, newVersion };
  },

  activeVersion(archetype: BuyerArchetype): ArchetypeVersion {
    return (
      archetype.versions.find((v) => v.id === archetype.activeVersionId) ??
      archetype.versions[archetype.versions.length - 1]
    );
  },
};
