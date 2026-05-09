/**
 * Deterministic reply-likelihood score for one (email, archetype, prospect)
 * triple. Used by the UI before any send and by email-quality scoring.
 *
 * Blend (from spec section 12):
 *   0.25 persona_angle_fit
 * + 0.20 pain_relevance
 * + 0.15 trigger_strength
 * + 0.15 CTA_clarity
 * + 0.10 trust_risk_inverse
 * + 0.10 prospect_match_confidence
 * + 0.05 brevity_score
 */

import { clamp, round, wordCount } from "./common";

export interface ReplyLikelihoodInput {
  /** 0-1: how well the email's angle fits this archetype's preferredAngles. */
  personaAngleFit: number;
  /** 0-1: how strongly the body addresses the prospect's pain. */
  painRelevance: number;
  /** 0-1: how strong the prospect's trigger signal is. */
  triggerStrength: number;
  /** 0-1: clarity and singularity of the CTA. */
  ctaClarity: number;
  /** 0-1: 1 - trust risk. Higher when no fake familiarity, no invented proof. */
  trustRiskInverse: number;
  /** 0-1: confidence from the prospect-matcher step. */
  prospectMatchConfidence: number;
  /** Email body, used to compute brevity. */
  body: string;
}

export interface ReplyLikelihoodBreakdown {
  total: number;
  parts: {
    personaAngleFit: number;
    painRelevance: number;
    triggerStrength: number;
    ctaClarity: number;
    trustRiskInverse: number;
    prospectMatchConfidence: number;
    brevity: number;
  };
}

const WEIGHTS = {
  personaAngleFit: 0.25,
  painRelevance: 0.2,
  triggerStrength: 0.15,
  ctaClarity: 0.15,
  trustRiskInverse: 0.1,
  prospectMatchConfidence: 0.1,
  brevity: 0.05,
} as const;

/**
 * Brevity score: 1.0 in the sweet spot (50-100 words),
 * tapers to 0 at >=180 words, also penalises ultra-short bodies.
 */
export function brevityScore(body: string): number {
  const words = wordCount(body);
  if (words === 0) return 0;
  if (words < 30) return clamp(words / 30);
  if (words <= 100) return 1;
  if (words >= 180) return 0;
  // Linear taper from 100 -> 180 words.
  return clamp(1 - (words - 100) / 80);
}

export function scoreReplyLikelihood(
  input: ReplyLikelihoodInput
): ReplyLikelihoodBreakdown {
  const parts = {
    personaAngleFit: clamp(input.personaAngleFit),
    painRelevance: clamp(input.painRelevance),
    triggerStrength: clamp(input.triggerStrength),
    ctaClarity: clamp(input.ctaClarity),
    trustRiskInverse: clamp(input.trustRiskInverse),
    prospectMatchConfidence: clamp(input.prospectMatchConfidence),
    brevity: brevityScore(input.body),
  };

  const total =
    WEIGHTS.personaAngleFit * parts.personaAngleFit +
    WEIGHTS.painRelevance * parts.painRelevance +
    WEIGHTS.triggerStrength * parts.triggerStrength +
    WEIGHTS.ctaClarity * parts.ctaClarity +
    WEIGHTS.trustRiskInverse * parts.trustRiskInverse +
    WEIGHTS.prospectMatchConfidence * parts.prospectMatchConfidence +
    WEIGHTS.brevity * parts.brevity;

  return {
    total: round(clamp(total)),
    parts: {
      personaAngleFit: round(parts.personaAngleFit),
      painRelevance: round(parts.painRelevance),
      triggerStrength: round(parts.triggerStrength),
      ctaClarity: round(parts.ctaClarity),
      trustRiskInverse: round(parts.trustRiskInverse),
      prospectMatchConfidence: round(parts.prospectMatchConfidence),
      brevity: round(parts.brevity),
    },
  };
}
