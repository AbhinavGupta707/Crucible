import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { CalibrationRun, NextCohortPlan, PersonaUpdate } from "../types";

export const calibrationRepo = {
  createRun(input: Omit<CalibrationRun, "id" | "createdAt">): CalibrationRun {
    const run: CalibrationRun = {
      id: `cal_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    getStore().calibrationRuns.set(run.id, run);
    return run;
  },

  findRunById(id: string): CalibrationRun | undefined {
    return getStore().calibrationRuns.get(id);
  },

  listRunsByCohort(cohortId: string): CalibrationRun[] {
    return Array.from(getStore().calibrationRuns.values())
      .filter((r) => r.cohortId === cohortId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },

  createPersonaUpdate(input: Omit<PersonaUpdate, "id" | "createdAt">): PersonaUpdate {
    const update: PersonaUpdate = {
      id: `pup_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    getStore().personaUpdates.set(update.id, update);
    return update;
  },

  listPersonaUpdates(ids: string[]): PersonaUpdate[] {
    const set = new Set(ids);
    return Array.from(getStore().personaUpdates.values()).filter((u) => set.has(u.id));
  },

  createNextCohortPlan(input: Omit<NextCohortPlan, "id" | "createdAt">): NextCohortPlan {
    const plan: NextCohortPlan = {
      id: `ncp_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    getStore().nextCohortPlans.set(plan.id, plan);
    return plan;
  },

  findNextCohortPlanByCohort(cohortId: string): NextCohortPlan | undefined {
    return Array.from(getStore().nextCohortPlans.values()).find((p) => p.cohortId === cohortId);
  },
};
