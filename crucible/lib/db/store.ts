// Process-local in-memory store. Workstream 2 will replace this with Prisma.
// Kept here so the API integration workstream can ship a working safe-mode
// path independently. The store is reset whenever the Node process restarts.

import type {
  BuyerArchetype,
  Campaign,
  CampaignCohort,
  CalibrationRun,
  NextCohortPlan,
  Offer,
  OutboundEmail,
  PersonaUpdate,
  Prospect,
  ProspectMatch,
  ReplyAnalysis,
  SuppressionEntry,
} from "./types";

export type Store = {
  workspaceId: string;
  offers: Map<string, Offer>;
  archetypes: Map<string, BuyerArchetype>;
  prospects: Map<string, Prospect>;
  matches: Map<string, ProspectMatch>;
  campaigns: Map<string, Campaign>;
  cohorts: Map<string, CampaignCohort>;
  emails: Map<string, OutboundEmail>;
  replies: Map<string, ReplyAnalysis>;
  calibrationRuns: Map<string, CalibrationRun>;
  personaUpdates: Map<string, PersonaUpdate>;
  nextCohortPlans: Map<string, NextCohortPlan>;
  suppression: Map<string, SuppressionEntry>;
};

const globalKey = Symbol.for("crucible.store");
const globalRef = globalThis as unknown as { [globalKey]?: Store };

function createStore(): Store {
  return {
    workspaceId: "ws_demo",
    offers: new Map(),
    archetypes: new Map(),
    prospects: new Map(),
    matches: new Map(),
    campaigns: new Map(),
    cohorts: new Map(),
    emails: new Map(),
    replies: new Map(),
    calibrationRuns: new Map(),
    personaUpdates: new Map(),
    nextCohortPlans: new Map(),
    suppression: new Map(),
  };
}

export function getStore(): Store {
  if (!globalRef[globalKey]) {
    globalRef[globalKey] = createStore();
  }
  return globalRef[globalKey]!;
}

export function resetStore(): void {
  globalRef[globalKey] = createStore();
}
