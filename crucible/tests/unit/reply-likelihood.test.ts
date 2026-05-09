import { describe, expect, it } from "vitest";
import {
  brevityScore,
  scoreReplyLikelihood,
} from "../../lib/scoring/reply-likelihood";

const SHORT_BODY = "Hello there.";
const SWEET_SPOT = Array(60).fill("word").join(" "); // 60 words
const TOO_LONG = Array(220).fill("word").join(" "); // 220 words

describe("reply-likelihood: brevity", () => {
  it("scores 1 for the 50-100 word sweet spot", () => {
    expect(brevityScore(SWEET_SPOT)).toBe(1);
  });

  it("penalises very short bodies", () => {
    expect(brevityScore(SHORT_BODY)).toBeLessThan(0.5);
  });

  it("scores 0 for bodies >= 180 words", () => {
    expect(brevityScore(TOO_LONG)).toBe(0);
  });

  it("returns 0 for empty body", () => {
    expect(brevityScore("")).toBe(0);
  });
});

describe("reply-likelihood: scoreReplyLikelihood", () => {
  const baseInput = {
    personaAngleFit: 0.8,
    painRelevance: 0.7,
    triggerStrength: 0.6,
    ctaClarity: 0.9,
    trustRiskInverse: 0.9,
    prospectMatchConfidence: 0.7,
    body: SWEET_SPOT,
  };

  it("computes the documented weighted blend", () => {
    const out = scoreReplyLikelihood(baseInput);
    const expected =
      0.25 * 0.8 +
      0.2 * 0.7 +
      0.15 * 0.6 +
      0.15 * 0.9 +
      0.1 * 0.9 +
      0.1 * 0.7 +
      0.05 * 1; // brevity in sweet spot
    expect(Math.abs(out.total - expected)).toBeLessThan(0.001);
  });

  it("clamps inputs to [0, 1]", () => {
    const out = scoreReplyLikelihood({
      ...baseInput,
      personaAngleFit: 5,
      painRelevance: -1,
    });
    expect(out.parts.personaAngleFit).toBe(1);
    expect(out.parts.painRelevance).toBe(0);
  });

  it("drops to nearly 0 when every signal is 0 and body is too long", () => {
    const out = scoreReplyLikelihood({
      personaAngleFit: 0,
      painRelevance: 0,
      triggerStrength: 0,
      ctaClarity: 0,
      trustRiskInverse: 0,
      prospectMatchConfidence: 0,
      body: TOO_LONG,
    });
    expect(out.total).toBe(0);
  });
});
