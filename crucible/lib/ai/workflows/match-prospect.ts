// Deterministic prospect matcher with optional LLM judgment slot.
// The match score formula matches the spec section 11.

import { archetypesRepo } from "../../db/repositories/archetypes";
import { matchesRepo } from "../../db/repositories/prospects";
import type { BuyerArchetype, Prospect, ProspectMatch } from "../../db/types";

const TITLE_SIGNALS: Record<string, string[]> = {
  "Overworked Agency Owner": ["founder", "managing director", "owner"],
  "Skeptical Solo Consultant": ["consultant", "advisor"],
  "Ops-Minded Studio Manager": ["operations", "ops", "manager"],
  "Growth-Focused Founder": ["founder", "head of growth"],
  "Tool-Fatigued Operator": ["coo", "operations", "head of operations"],
  "Budget-Sensitive Operator": ["founder", "owner"],
  "Trust-First Buyer": ["partner", "director"],
  "Wrong-Person Gatekeeper": ["assistant", "executive assistant"],
  "Competitor-Locked Buyer": ["founder", "managing director"],
  "Interested-But-Later Buyer": ["founder", "managing director"],
};

function titleScore(prospect: Prospect, archetype: BuyerArchetype): number {
  const signals = TITLE_SIGNALS[archetype.name] ?? [];
  const t = prospect.title.toLowerCase();
  const hit = signals.some((s) => t.includes(s));
  return hit ? 1 : 0.2;
}

function segmentScore(prospect: Prospect, archetype: BuyerArchetype): number {
  const seg = (archetype.segment ?? "").toLowerCase();
  const ind = prospect.industry.toLowerCase();
  const company = prospect.company.toLowerCase();
  if (seg.split(/\s+/).some((tok) => tok && (ind.includes(tok) || company.includes(tok)))) {
    return 1;
  }
  return 0.3;
}

function triggerScore(prospect: Prospect, archetype: BuyerArchetype): number {
  const text = `${prospect.notes} ${prospect.trigger}`.toLowerCase();
  const v = archetypesRepo.activeVersion(archetype);
  const angles = v.preferredAngles.map((a) => a.toLowerCase());
  const objections = v.predictedObjections.map((o) => o.toLowerCase());
  const tokens = new Set<string>([...angles, ...objections]);
  let hits = 0;
  for (const tok of tokens) {
    const word = tok.split(/\W+/)[0];
    if (word && text.includes(word)) hits += 1;
  }
  return Math.min(1, hits / 3);
}

function industryFitScore(prospect: Prospect, archetype: BuyerArchetype): number {
  const size = parseInt(prospect.companySize, 10);
  if (Number.isNaN(size)) return 0.4;
  if (archetype.name === "Wrong-Person Gatekeeper" && size > 30) return 0.9;
  if (archetype.name === "Competitor-Locked Buyer" && size > 40) return 0.9;
  if (archetype.name === "Budget-Sensitive Operator" && size <= 5) return 0.9;
  if (size >= 5 && size <= 35) return 0.7;
  return 0.4;
}

function llmJudgment(prospect: Prospect, archetype: BuyerArchetype): number {
  // Stub. Workstream 3 plugs in the structured generator. Until then, give
  // the seeded hint a small boost when notes mention the archetype's keywords.
  const t = prospect.notes.toLowerCase();
  if (t.includes(archetype.name.toLowerCase())) return 1;
  return 0.5;
}

export function scoreMatch(prospect: Prospect, archetype: BuyerArchetype): number {
  return (
    0.35 * titleScore(prospect, archetype) +
    0.25 * segmentScore(prospect, archetype) +
    0.2 * triggerScore(prospect, archetype) +
    0.1 * industryFitScore(prospect, archetype) +
    0.1 * llmJudgment(prospect, archetype)
  );
}

function reasoningFor(prospect: Prospect, archetype: BuyerArchetype): string {
  const v = archetypesRepo.activeVersion(archetype);
  return `Title "${prospect.title}" and notes around "${prospect.trigger}" align with ${archetype.name}: ${v.description}`;
}

function signalsFor(prospect: Prospect, archetype: BuyerArchetype): string[] {
  return [
    `title:${prospect.title}`,
    `industry:${prospect.industry}`,
    `size:${prospect.companySize}`,
    `archetype-segment:${archetype.segment}`,
  ];
}

function riskFlagsFor(prospect: Prospect, archetype: BuyerArchetype): string[] {
  const flags: string[] = [];
  if (archetype.name === "Wrong-Person Gatekeeper") flags.push("likely_redirect");
  if (archetype.name === "Competitor-Locked Buyer") flags.push("competitor_lock");
  if (parseInt(prospect.companySize, 10) > 100) flags.push("enterprise_buyer");
  return flags;
}

export type MatchProspectResult = {
  match: ProspectMatch;
  topScore: number;
  warnings: string[];
};

export async function matchProspect(prospect: Prospect): Promise<MatchProspectResult> {
  const archetypes = archetypesRepo.listByOffer(prospect.offerId);
  if (archetypes.length === 0) {
    throw new Error("No archetypes available; run buildBuyerMemory first.");
  }

  let best: BuyerArchetype | null = null;
  let bestScore = -1;
  for (const archetype of archetypes) {
    const s = scoreMatch(prospect, archetype);
    if (s > bestScore) {
      bestScore = s;
      best = archetype;
    }
  }
  if (!best) throw new Error("Could not match prospect.");

  const v = archetypesRepo.activeVersion(best);
  const match = matchesRepo.upsertForProspect({
    prospectId: prospect.id,
    archetypeId: best.id,
    confidence: Math.round(bestScore * 100) / 100,
    reasoning: reasoningFor(prospect, best),
    matchedSignals: signalsFor(prospect, best),
    riskFlags: riskFlagsFor(prospect, best),
    predictedObjection: v.predictedObjections[0] ?? "Unknown",
    recommendedAngle: v.preferredAngles[0] ?? "Pipeline recovery",
  });

  return { match, topScore: bestScore, warnings: [] };
}
