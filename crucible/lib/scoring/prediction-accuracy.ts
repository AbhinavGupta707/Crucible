/**
 * Prediction accuracy scoring for predicted-vs-actual replies.
 *
 * Score (from spec section 12):
 *   exact match               -> 1.0
 *   same family match         -> 0.6
 *   wrong but same sentiment  -> 0.3
 *   wrong                     -> 0.0
 *   no_reply                  -> excluded (low-confidence bucket)
 */

import type { ReplyOutcome } from "../ai/schemas/common";
import { round } from "./common";

export type OutcomeFamily =
  | "positive"
  | "soft_interest"
  | "negative_fit"
  | "objection"
  | "hard_negative"
  | "bounce"
  | "no_reply";

export const OUTCOME_FAMILY: Record<ReplyOutcome, OutcomeFamily> = {
  positive: "positive",
  interested_later: "soft_interest",
  wrong_person: "negative_fit",
  not_relevant: "negative_fit",
  competitor_locked: "negative_fit",
  pricing_objection: "objection",
  trust_objection: "objection",
  unsubscribe: "hard_negative",
  hostile: "hard_negative",
  bounce: "bounce",
  no_reply: "no_reply",
};

export type Sentiment = "positive" | "neutral" | "negative";

export const OUTCOME_SENTIMENT: Record<ReplyOutcome, Sentiment> = {
  positive: "positive",
  interested_later: "positive",
  wrong_person: "neutral",
  not_relevant: "neutral",
  competitor_locked: "neutral",
  pricing_objection: "negative",
  trust_objection: "negative",
  unsubscribe: "negative",
  hostile: "negative",
  bounce: "neutral",
  no_reply: "neutral",
};

export interface PredictionPair {
  predicted: ReplyOutcome;
  actual: ReplyOutcome;
}

export interface AccuracyResult {
  /** Mean accuracy across scored pairs. 0 when no pairs were scored. */
  accuracy: number;
  /** Number of pairs that contributed to the score (excludes no_reply actuals). */
  scoredCount: number;
  /** Number of pairs with actual=no_reply, kept separately. */
  noReplyCount: number;
  /** Per-pair score in the same order as inputs (no_reply -> null). */
  scores: Array<number | null>;
  /** Confusion matrix keyed by `${predicted}->${actual}`. */
  confusion: Record<string, number>;
}

export function scorePair(pair: PredictionPair): number | null {
  if (pair.actual === "no_reply") return null;
  if (pair.predicted === pair.actual) return 1.0;
  if (OUTCOME_FAMILY[pair.predicted] === OUTCOME_FAMILY[pair.actual]) return 0.6;
  if (OUTCOME_SENTIMENT[pair.predicted] === OUTCOME_SENTIMENT[pair.actual])
    return 0.3;
  return 0.0;
}

export function scorePredictionAccuracy(
  pairs: PredictionPair[]
): AccuracyResult {
  const scores: Array<number | null> = [];
  const confusion: Record<string, number> = {};
  let sum = 0;
  let scored = 0;
  let noReply = 0;

  for (const pair of pairs) {
    const key = `${pair.predicted}->${pair.actual}`;
    confusion[key] = (confusion[key] ?? 0) + 1;

    const s = scorePair(pair);
    scores.push(s);
    if (s === null) {
      noReply += 1;
    } else {
      sum += s;
      scored += 1;
    }
  }

  return {
    accuracy: scored === 0 ? 0 : round(sum / scored),
    scoredCount: scored,
    noReplyCount: noReply,
    scores,
    confusion,
  };
}

/**
 * Per-archetype rollup of accuracy. Useful for the calibration trigger
 * and the UI's "accuracy by archetype" panel.
 */
export interface ArchetypeAccuracyInput {
  archetypeId: string;
  pairs: PredictionPair[];
}

export interface ArchetypeAccuracyRow {
  archetypeId: string;
  accuracy: number;
  scoredCount: number;
  noReplyCount: number;
  confusion: Record<string, number>;
}

export function rollUpByArchetype(
  rows: ArchetypeAccuracyInput[]
): ArchetypeAccuracyRow[] {
  return rows.map((row) => {
    const r = scorePredictionAccuracy(row.pairs);
    return {
      archetypeId: row.archetypeId,
      accuracy: r.accuracy,
      scoredCount: r.scoredCount,
      noReplyCount: r.noReplyCount,
      confusion: r.confusion,
    };
  });
}
