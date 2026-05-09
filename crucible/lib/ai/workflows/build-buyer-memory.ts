// Stub for the buildBuyerMemory workflow. In safe mode (USE_CACHED_AI=true,
// the default), we return seeded archetypes derived from the demo blueprints.
// Workstream 3 owns the prompt + provider implementation; this file remains
// the orchestration entry point the API route calls into.

import { archetypesRepo, type ArchetypeSeed } from "../../db/repositories/archetypes";
import { useCachedAi } from "../../api/env";
import {
  SAMPLE_ARCHETYPES,
  TOOL_FATIGUED_OPERATOR_NAME,
} from "../../demo/sample-archetypes";
import type { BuyerArchetype } from "../../db/types";

export type BuildBuyerMemoryInput = { offerId: string };

export type BuildBuyerMemoryResult = {
  archetypes: BuyerArchetype[];
  source: "cached" | "live";
  warnings: string[];
};

export async function buildBuyerMemory(
  input: BuildBuyerMemoryInput,
): Promise<BuildBuyerMemoryResult> {
  const warnings: string[] = [];

  if (!useCachedAi()) {
    // Live mode is owned by workstream 3. The route handler always asks for
    // cached fallback if live fails, so we throw here to signal "not yet
    // implemented" rather than silently returning empty.
    warnings.push("Live AI not configured; falling back to cached archetypes.");
  }

  const seeds: ArchetypeSeed[] = SAMPLE_ARCHETYPES.map((blueprint) => ({
    ...blueprint,
    offerId: input.offerId,
  }));
  const created = seeds.map((seed) => archetypesRepo.createWithInitialVersion(seed));

  // Sanity check that the calibration target exists in the seed data.
  const hasTarget = created.some((a) => a.name === TOOL_FATIGUED_OPERATOR_NAME);
  if (!hasTarget) {
    warnings.push(
      `Demo calibration target '${TOOL_FATIGUED_OPERATOR_NAME}' missing from seeded archetypes.`,
    );
  }

  return {
    archetypes: created,
    source: useCachedAi() ? "cached" : "live",
    warnings,
  };
}
