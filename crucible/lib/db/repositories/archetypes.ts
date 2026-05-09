import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
