/**
 * Email quality scoring + hard rejects.
 *
 * Score (from spec section 12, 0-10 each):
 *   relevance, specificity, brevity, ctaClarity, objectionPreemption
 * Plus pass/fail truthfulness and compliance.
 *
 * Hard rejects:
 *   - invented fact (caller signals via flagsInventedProof)
 *   - fake familiarity ("as we discussed", "great catching up", etc.)
 *   - deceptive subject (subject promises what body doesn't deliver - caller flags)
 *   - too long (body word count > 120)
 *   - no CTA
 *   - no opt-out line when externalSend=true
 */

import { round, wordCount } from "./common";

export interface EmailQualityInput {
  subject: string;
  body: string;
  cta: string;
  /** Hypothesis being tested. Used for relevance and specificity hints. */
  hypothesis: string;
  /** Predicted objection the body should pre-empt. */
  predictedObjection: string;
  /** Voice/style cues for this archetype. Used for relevance scoring. */
  archetypePreferredAngles: string[];
  archetypeDislikedPhrases: string[];
  /** Concrete facts available about the prospect (title, company, trigger). */
  prospectKnownFacts: string[];
  /** True when the body contains any invented proof (caller asserts). */
  flagsInventedProof?: boolean;
  /** True when the subject does not match the body's promise. */
  flagsDeceptiveSubject?: boolean;
  /** True when this email will leave Crucible's domain to a real recipient. */
  externalSend: boolean;
  /** Opt-out address present in body? Caller can pass an explicit boolean. */
  optOutPresent?: boolean;
}

export interface EmailQualityResult {
  /** Overall pass/fail. False if any hard reject fired. */
  pass: boolean;
  /** Hard reject reasons. */
  rejectReasons: string[];
  /** Soft warnings that should surface in the UI but not block. */
  warnings: string[];
  /** Sub-scores 0-10 each. */
  scores: {
    relevance: number;
    specificity: number;
    brevity: number;
    ctaClarity: number;
    objectionPreemption: number;
  };
  /** Aggregate 0-10 quality score (mean of sub-scores). */
  total: number;
  /** Pass/fail flags. */
  truthfulness: "pass" | "fail";
  compliance: "pass" | "fail";
}

const FAKE_FAMILIARITY_PHRASES = [
  "as we discussed",
  "as we spoke",
  "great catching up",
  "great chatting",
  "following up on our chat",
  "hope you remember",
  "loved our conversation",
  "as promised",
];

const HYPE_PHRASES = [
  "revolutionary",
  "game-changing",
  "synergy",
  "world-class",
  "unparalleled",
  "10x your",
  "supercharge",
];

export function detectFakeFamiliarity(text: string): string[] {
  const lower = text.toLowerCase();
  return FAKE_FAMILIARITY_PHRASES.filter((p) => lower.includes(p));
}

export function detectHype(text: string): string[] {
  const lower = text.toLowerCase();
  return HYPE_PHRASES.filter((p) => lower.includes(p));
}

function scoreRelevance(input: EmailQualityInput): number {
  const corpus = `${input.subject} ${input.body}`.toLowerCase();
  const angleHits = input.archetypePreferredAngles.filter((a) =>
    corpus.includes(a.toLowerCase().split("(")[0]!.trim().slice(0, 20))
  ).length;
  const hypothesisHits = input.hypothesis
    .toLowerCase()
    .split(/[\s.,]+/)
    .filter((w) => w.length >= 5)
    .filter((w) => corpus.includes(w)).length;
  const raw = angleHits * 2 + hypothesisHits * 0.5;
  return Math.min(10, raw);
}

function scoreSpecificity(input: EmailQualityInput): number {
  if (input.prospectKnownFacts.length === 0) return 5;
  const corpus = input.body.toLowerCase();
  const factHits = input.prospectKnownFacts.filter((f) => {
    const tokens = f.toLowerCase().split(/\s+/).filter((t) => t.length >= 4);
    return tokens.some((t) => corpus.includes(t));
  }).length;
  // Ideal: at least 1-2 specific facts cited in the body.
  const ratio = factHits / Math.max(1, input.prospectKnownFacts.length);
  return Math.min(10, Math.round(ratio * 10));
}

function scoreBrevity(body: string): number {
  const words = wordCount(body);
  if (words === 0) return 0;
  if (words > 180) return 0;
  if (words > 120) return 3;
  if (words >= 50 && words <= 100) return 10;
  if (words < 30) return 5;
  // 30-49 or 101-120: linear-ish.
  if (words < 50) return Math.round(5 + ((words - 30) / 20) * 5);
  return Math.round(10 - ((words - 100) / 20) * 7);
}

function scoreCtaClarity(input: EmailQualityInput): number {
  const cta = input.cta.trim();
  if (!cta) return 0;
  const body = input.body;
  // Penalise multiple question-mark CTAs in body (suggests two CTAs).
  const questionMarks = (body.match(/\?/g) ?? []).length;
  let score = 8;
  if (cta.length < 80) score += 1;
  if (cta.length < 40) score += 1;
  if (questionMarks > 2) score -= 3;
  if (!body.toLowerCase().includes(cta.toLowerCase().slice(0, 12))) score -= 2;
  return Math.max(0, Math.min(10, score));
}

function scoreObjectionPreemption(input: EmailQualityInput): number {
  if (!input.predictedObjection) return 5;
  const objectionTokens = input.predictedObjection
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((w) => w.length >= 4);
  if (objectionTokens.length === 0) return 5;
  const lower = input.body.toLowerCase();
  const hits = objectionTokens.filter((t) => lower.includes(t)).length;
  const ratio = hits / objectionTokens.length;
  return Math.min(10, Math.round(ratio * 10));
}

export function scoreEmailQuality(
  input: EmailQualityInput
): EmailQualityResult {
  const rejectReasons: string[] = [];
  const warnings: string[] = [];

  // Hard rejects.
  const words = wordCount(input.body);
  if (words > 120) rejectReasons.push(`body length ${words} words > 120`);
  if (!input.cta.trim()) rejectReasons.push("missing CTA");
  if (input.flagsInventedProof) rejectReasons.push("invented proof flagged");
  if (input.flagsDeceptiveSubject)
    rejectReasons.push("subject does not match body promise");
  const fakeHits = detectFakeFamiliarity(input.body);
  if (fakeHits.length > 0)
    rejectReasons.push(`fake familiarity: "${fakeHits.join('", "')}"`);
  if (input.externalSend && !input.optOutPresent)
    rejectReasons.push("external send without opt-out line");

  // Disliked phrases for archetype -> warnings, not rejects.
  const lowerBody = input.body.toLowerCase();
  for (const phrase of input.archetypeDislikedPhrases) {
    if (lowerBody.includes(phrase.toLowerCase())) {
      warnings.push(`disliked phrase for archetype: "${phrase}"`);
    }
  }
  const hype = detectHype(input.body);
  if (hype.length > 0) warnings.push(`hype words: "${hype.join('", "')}"`);

  // Sub-scores.
  const scores = {
    relevance: scoreRelevance(input),
    specificity: scoreSpecificity(input),
    brevity: scoreBrevity(input.body),
    ctaClarity: scoreCtaClarity(input),
    objectionPreemption: scoreObjectionPreemption(input),
  };
  const total = round(
    (scores.relevance +
      scores.specificity +
      scores.brevity +
      scores.ctaClarity +
      scores.objectionPreemption) /
      5,
    2
  );

  const truthfulness: "pass" | "fail" =
    input.flagsInventedProof || fakeHits.length > 0 ? "fail" : "pass";
  const compliance: "pass" | "fail" =
    input.externalSend && !input.optOutPresent ? "fail" : "pass";

  return {
    pass: rejectReasons.length === 0,
    rejectReasons,
    warnings,
    scores,
    total,
    truthfulness,
    compliance,
  };
}
