import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { ArchetypeVersion, BuyerArchetype } from "../types";

export type ArchetypeCreateInput = Prisma.BuyerArchetypeCreateInput;
export type ArchetypeVersionCreateInput =
  Prisma.BuyerArchetypeVersionCreateInput;

export async function createArchetypeWithVersion(args: {
  offerId: string;
  name: string;
  version: Omit<
    Prisma.BuyerArchetypeVersionCreateInput,
    "archetype" | "versionNumber"
  >;
}) {
  const archetype = await prisma.buyerArchetype.create({
    data: { name: args.name, offerId: args.offerId },
  });
  const version = await prisma.buyerArchetypeVersion.create({
    data: {
      ...args.version,
      versionNumber: 1,
      archetype: { connect: { id: archetype.id } },
    },
  });
  await prisma.buyerArchetype.update({
    where: { id: archetype.id },
    data: { activeVersionId: version.id },
  });
  return { archetype, version };
}

export async function listArchetypes(offerId: string) {
  return prisma.buyerArchetype.findMany({
    where: { offerId },
    include: {
      activeVersion: true,
      versions: { orderBy: { versionNumber: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getArchetype(archetypeId: string) {
  return prisma.buyerArchetype.findUnique({
    where: { id: archetypeId },
    include: {
      activeVersion: true,
      versions: { orderBy: { versionNumber: "asc" } },
    },
  });
}

export async function getArchetypeByName(offerId: string, name: string) {
  return prisma.buyerArchetype.findUnique({
    where: { offerId_name: { offerId, name } },
    include: { activeVersion: true },
  });
}

/**
 * Append a new version and set it active. The previous active version remains
 * in the versions list so the UI can render a v1 -> v2 diff.
 */
export async function appendVersionAndActivate(args: {
  archetypeId: string;
  data: Omit<
    Prisma.BuyerArchetypeVersionCreateInput,
    "archetype" | "versionNumber"
  >;
}) {
  const last = await prisma.buyerArchetypeVersion.findFirst({
    where: { archetypeId: args.archetypeId },
    orderBy: { versionNumber: "desc" },
  });
  const nextNumber = (last?.versionNumber ?? 0) + 1;
  const created = await prisma.buyerArchetypeVersion.create({
    data: {
      ...args.data,
      versionNumber: nextNumber,
      archetype: { connect: { id: args.archetypeId } },
    },
  });
  await prisma.buyerArchetype.update({
    where: { id: args.archetypeId },
    data: { activeVersionId: created.id },
  });
  return created;
}

function now() {
  return new Date().toISOString();
}

export type ArchetypeSeed = {
  offerId: string;
  name: string;
  segment: string;
  role: string;
  initialVersion: Omit<
    ArchetypeVersion,
    "id" | "archetypeId" | "versionNumber" | "createdAt" | "reason"
  > & { reason?: string | null };
};

export const archetypesRepo = {
  createWithInitialVersion(seed: ArchetypeSeed): BuyerArchetype {
    const archetypeId = `arch_${nanoid(8)}`;
    const versionId = `archv_${nanoid(8)}`;
    const version: ArchetypeVersion = {
      id: versionId,
      archetypeId,
      versionNumber: 1,
      reason: seed.initialVersion.reason ?? null,
      description: seed.initialVersion.description,
      currentWorkflow: seed.initialVersion.currentWorkflow,
      painIntensity: seed.initialVersion.painIntensity,
      buyingPower: seed.initialVersion.buyingPower,
      riskTolerance: seed.initialVersion.riskTolerance,
      voiceStyle: seed.initialVersion.voiceStyle,
      predictedObjections: seed.initialVersion.predictedObjections,
      preferredAngles: seed.initialVersion.preferredAngles,
      dislikedPhrases: seed.initialVersion.dislikedPhrases,
      likelyReplyPatterns: seed.initialVersion.likelyReplyPatterns,
      confidence: seed.initialVersion.confidence,
      createdAt: now(),
    };
    const archetype: BuyerArchetype = {
      id: archetypeId,
      offerId: seed.offerId,
      name: seed.name,
      segment: seed.segment,
      role: seed.role,
      activeVersionId: versionId,
      versions: [version],
      createdAt: now(),
    };
    getStore().archetypes.set(archetype.id, archetype);
    return archetype;
  },

  listByOffer(offerId: string) {
    return Array.from(getStore().archetypes.values()).filter(
      (a) => a.offerId === offerId,
    );
  },

  findById(archetypeId: string) {
    return getStore().archetypes.get(archetypeId) ?? null;
  },

  activeVersion(archetype: BuyerArchetype) {
    return (
      archetype.versions.find((v) => v.id === archetype.activeVersionId) ??
      archetype.versions[archetype.versions.length - 1]
    );
  },

  appendVersion(
    archetypeId: string,
    data: Omit<ArchetypeVersion, "id" | "archetypeId" | "versionNumber" | "createdAt">,
  ) {
    const archetype = getStore().archetypes.get(archetypeId);
    if (!archetype) throw new Error(`Archetype not found: ${archetypeId}`);
    const previousVersion = this.activeVersion(archetype);
    const newVersion: ArchetypeVersion = {
      id: `archv_${nanoid(8)}`,
      archetypeId,
      versionNumber: previousVersion.versionNumber + 1,
      reason: data.reason ?? null,
      description: data.description,
      currentWorkflow: data.currentWorkflow,
      painIntensity: data.painIntensity,
      buyingPower: data.buyingPower,
      riskTolerance: data.riskTolerance,
      voiceStyle: data.voiceStyle,
      predictedObjections: data.predictedObjections,
      preferredAngles: data.preferredAngles,
      dislikedPhrases: data.dislikedPhrases,
      likelyReplyPatterns: data.likelyReplyPatterns,
      confidence: data.confidence,
      createdAt: now(),
    };
    archetype.versions.push(newVersion);
    archetype.activeVersionId = newVersion.id;
    getStore().archetypes.set(archetype.id, archetype);
    return { previousVersion, newVersion };
  },
};
