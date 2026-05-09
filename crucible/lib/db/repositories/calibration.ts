import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getStore } from "../store";
import type { CalibrationRun, NextCohortPlan, PersonaUpdate } from "../types";

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

function now() {
  return new Date().toISOString();
}

type SafeModePersonaUpdateInput = Omit<
  PersonaUpdate,
  "id" | "createdAt"
> & { id?: string; createdAt?: string };

type SafeModeCalibrationInput = Omit<
  CalibrationRun,
  "id" | "createdAt"
> & { id?: string; createdAt?: string };

type SafeModeNextCohortPlanInput = Omit<
  NextCohortPlan,
  "id" | "createdAt"
> & { id?: string; createdAt?: string };

export const calibrationRepo = {
  createRun(data: SafeModeCalibrationInput): CalibrationRun {
    const run: CalibrationRun = {
      ...data,
      id: data.id ?? `cal_${nanoid(8)}`,
      createdAt: data.createdAt ?? now(),
    };
    getStore().calibrationRuns.set(run.id, run);
    return run;
  },

  listRunsByCohort(cohortId: string) {
    return Array.from(getStore().calibrationRuns.values()).filter(
      (run) => run.cohortId === cohortId,
    );
  },

  createPersonaUpdate(data: SafeModePersonaUpdateInput): PersonaUpdate {
    const update: PersonaUpdate = {
      ...data,
      id: data.id ?? `pupdate_${nanoid(8)}`,
      createdAt: data.createdAt ?? now(),
    };
    getStore().personaUpdates.set(update.id, update);
    return update;
  },

  listPersonaUpdates(ids: string[]) {
    return ids
      .map((id) => getStore().personaUpdates.get(id))
      .filter((u): u is PersonaUpdate => Boolean(u));
  },

  createNextCohortPlan(data: SafeModeNextCohortPlanInput): NextCohortPlan {
    const plan: NextCohortPlan = {
      ...data,
      id: data.id ?? `next_${nanoid(8)}`,
      createdAt: data.createdAt ?? now(),
    };
    getStore().nextCohortPlans.set(plan.id, plan);
    return plan;
  },
};
