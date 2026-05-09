/**
 * Deterministic prospect-to-archetype match score.
 *
 * Blend (from spec section 11):
 *   0.35 role/title similarity
 * + 0.25 company/segment similarity
 * + 0.20 trigger/notes similarity
 * + 0.10 industry/company-size fit
 * + 0.10 LLM judgment score
 *
 * The deterministic part runs without an LLM call so the demo
 * remains usable when AI is unavailable; the LLM judgment is
 * passed in by the caller.
 */

import { clamp, jaccard, round, tokenize } from "./common";

export interface MatchProspect {
  title: string;
  company: string;
  industry: string;
  companySize: string;
  notes: string;
  trigger: string;
}

export interface MatchArchetype {
  role: string;
  segment: string;
  predictedObjections: string[];
  preferredAngles: string[];
  /** Optional industry/size hints. */
  industryHints?: string[];
  companySizeHints?: string[];
}

export interface MatchScoreBreakdown {
  total: number;
  parts: {
    roleSimilarity: number;
    segmentSimilarity: number;
    triggerSimilarity: number;
    industryFit: number;
    llmJudgment: number;
  };
}

const WEIGHTS = {
  role: 0.35,
  segment: 0.25,
  trigger: 0.2,
  industry: 0.1,
  llm: 0.1,
} as const;

export function scoreProspectMatch(
  prospect: MatchProspect,
  archetype: MatchArchetype,
  llmJudgmentScore: number
): MatchScoreBreakdown {
  const roleSimilarity = jaccard(
    tokenize(prospect.title),
    tokenize(archetype.role)
  );

  const segmentSimilarity = jaccard(
    tokenize(`${prospect.company} ${prospect.companySize}`),
    tokenize(archetype.segment)
  );

  const triggerCorpus = `${prospect.trigger} ${prospect.notes}`;
  const archetypeCorpus = [
    ...archetype.predictedObjections,
    ...archetype.preferredAngles,
  ].join(" ");
  const triggerSimilarity = jaccard(
    tokenize(triggerCorpus),
    tokenize(archetypeCorpus)
  );

  const industryFit = computeIndustryFit(prospect, archetype);
  const llm = clamp(llmJudgmentScore);

  const total =
    WEIGHTS.role * roleSimilarity +
    WEIGHTS.segment * segmentSimilarity +
    WEIGHTS.trigger * triggerSimilarity +
    WEIGHTS.industry * industryFit +
    WEIGHTS.llm * llm;

  return {
    total: round(clamp(total)),
    parts: {
      roleSimilarity: round(roleSimilarity),
      segmentSimilarity: round(segmentSimilarity),
      triggerSimilarity: round(triggerSimilarity),
      industryFit: round(industryFit),
      llmJudgment: round(llm),
    },
  };
}

function computeIndustryFit(
  prospect: MatchProspect,
  archetype: MatchArchetype
): number {
  const industryHints = archetype.industryHints ?? [];
  const sizeHints = archetype.companySizeHints ?? [];

  let hits = 0;
  let checked = 0;

  if (industryHints.length > 0) {
    checked += 1;
    const tokens = tokenize(prospect.industry);
    if (industryHints.some((h) => hasOverlap(tokens, tokenize(h)))) hits += 1;
  }

  if (sizeHints.length > 0) {
    checked += 1;
    if (
      sizeHints.some((h) =>
        prospect.companySize.toLowerCase().includes(h.toLowerCase())
      )
    ) {
      hits += 1;
    }
  }

  if (checked === 0) {
    // No archetype hints at all - fall back to a generic similarity
    // between prospect industry/size and archetype segment.
    return jaccard(
      tokenize(`${prospect.industry} ${prospect.companySize}`),
      tokenize(archetype.segment)
    );
  }

  return hits / checked;
}

function hasOverlap(a: Set<string>, b: Set<string>): boolean {
  for (const t of a) if (b.has(t)) return true;
  return false;
}
