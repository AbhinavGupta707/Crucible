import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type CalibrationRunCreateInput =
  Prisma.CalibrationRunUncheckedCreateInput;
export type PersonaUpdateCreateInput =
  Prisma.PersonaUpdateUncheckedCreateInput;

export async function createCalibrationRun(data: CalibrationRunCreateInput) {
  return prisma.calibrationRun.create({ data });
}

export async function createPersonaUpdate(data: PersonaUpdateCreateInput) {
  return prisma.personaUpdate.create({ data });
}

export async function getCalibrationRun(runId: string) {
  return prisma.calibrationRun.findUnique({
    where: { id: runId },
    include: {
      personaUpdates: {
        include: { archetype: true, fromVersion: true, toVersion: true },
      },
      cohort: true,
    },
  });
}

export async function listCalibrationRunsByCohort(cohortId: string) {
  return prisma.calibrationRun.findMany({
    where: { cohortId },
    include: { personaUpdates: true },
    orderBy: { createdAt: "desc" },
  });
}
