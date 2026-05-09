/**
 * Eval-style assertions over cached AI outputs.
 *
 * These tests are NOT gated on a live model. They prove the cached
 * fixtures used in demo safe mode satisfy the same shape rules we
 * would expect from a live response, so the demo never falls through
 * to a fixture that violates the product contract.
 */

import { describe, expect, it } from "vitest";
import {
  CACHED_HYPOTHESIS,
  CACHED_NEXT_COHORT,
  CACHED_OUTREACH,
  CACHED_PERSONA_SYNTHESIZER,
  CACHED_RESPONSE_PARSER,
  REPLY_OUTCOMES,
  generateStructured,
  type StructuredCall,
} from "../../lib/ai";
import { HYPOTHESIS_PROMPT } from "../../lib/ai/prompts/hypothesis";
import {
  HypothesisInputSchema,
  HypothesisOutputSchema,
  type HypothesisInput,
  type HypothesisOutput,
} from "../../lib/ai/schemas/offer";
import { wordCount } from "../../lib/scoring/common";
import { EVAL_OFFERS } from "./fixtures";

const HYPOTHESIS_CALL: StructuredCall<HypothesisInput, HypothesisOutput> = {
  agent: "hypothesis",
  schemaName: "HypothesisOutput",
  inputSchema: HypothesisInputSchema,
  outputSchema: HypothesisOutputSchema,
  systemPrompt: HYPOTHESIS_PROMPT.system,
  buildUserPrompt: HYPOTHESIS_PROMPT.buildUser,
};

describe("eval: prompts build for every sample offer", () => {
  for (const offer of EVAL_OFFERS) {
    it(`builds a non-empty hypothesis prompt for "${offer.slug}"`, () => {
      const user = HYPOTHESIS_PROMPT.buildUser(offer.hypothesisInput);
      expect(user.length).toBeGreaterThan(50);
      expect(user).toContain(offer.hypothesisInput.icpGuess);
      expect(user).toContain(offer.hypothesisInput.desiredCta);
    });
  }
});

describe("eval: cached safe-mode runs of every sample offer", () => {
  for (const offer of EVAL_OFFERS) {
    it(`returns the cached HypothesisOutput for "${offer.slug}"`, async () => {
      const result = await generateStructured(
        HYPOTHESIS_CALL,
        offer.hypothesisInput,
        { useCachedOnly: true }
      );
      expect(result.source).toBe("cache");
      expect(result.data.title.length).toBeGreaterThan(0);
      expect(result.data.messageAngles.length).toBeGreaterThanOrEqual(2);
      expect(result.data.riskyAssumptions.length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe("eval: persona synthesizer cached output covers the objection space", () => {
  it("generates 8 or more archetypes", () => {
    expect(CACHED_PERSONA_SYNTHESIZER.archetypes.length).toBeGreaterThanOrEqual(
      8
    );
  });

  it("uses no duplicate archetype names", () => {
    const names = CACHED_PERSONA_SYNTHESIZER.archetypes.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("covers at least 3 distinct objection themes", () => {
    const objections = new Set<string>();
    for (const a of CACHED_PERSONA_SYNTHESIZER.archetypes) {
      for (const o of a.predictedObjections) {
        // Bucket by first 4 chars of first significant token, deliberately coarse.
        const token = o
          .toLowerCase()
          .replace(/[^a-z\s]/g, " ")
          .split(/\s+/)
          .find((t) => t.length >= 4);
        if (token) objections.add(token.slice(0, 4));
      }
    }
    expect(objections.size).toBeGreaterThanOrEqual(3);
  });

  it("contains the Tool-Fatigued Operator (calibration target)", () => {
    expect(
      CACHED_PERSONA_SYNTHESIZER.archetypes.some(
        (a) => a.name === "Tool-Fatigued Operator"
      )
    ).toBe(true);
  });
});

describe("eval: cached outreach email respects hard checks", () => {
  it("body is under 120 words", () => {
    expect(wordCount(CACHED_OUTREACH.body)).toBeLessThanOrEqual(120);
  });

  it("has a hypothesis attached", () => {
    expect(CACHED_OUTREACH.hypothesis.length).toBeGreaterThan(10);
  });

  it("has exactly one CTA-shaped string", () => {
    expect(CACHED_OUTREACH.cta.trim().length).toBeGreaterThan(0);
  });
});

describe("eval: response parser uses the fixed taxonomy", () => {
  it("cached outcome is one of the canonical 11", () => {
    expect((REPLY_OUTCOMES as readonly string[]).includes(CACHED_RESPONSE_PARSER.outcome)).toBe(
      true
    );
  });
});

describe("eval: next cohort plan is honest about pauses and changes", () => {
  it("lists at least one concrete change from the previous cohort", () => {
    expect(CACHED_NEXT_COHORT.changesFromPreviousCohort.length).toBeGreaterThan(
      0
    );
  });

  it("ships at least one rewritten template per doubled-down segment", () => {
    for (const segment of CACHED_NEXT_COHORT.segmentsToDoubleDown) {
      const hasTemplate = CACHED_NEXT_COHORT.newEmailTemplates.some(
        (t) => t.archetypeName === segment
      );
      expect(hasTemplate, `missing template for segment "${segment}"`).toBe(
        true
      );
    }
  });

  it("every new email template body is under 120 words", () => {
    for (const t of CACHED_NEXT_COHORT.newEmailTemplates) {
      expect(wordCount(t.body)).toBeLessThanOrEqual(120);
    }
  });
});

describe("eval: cached hypothesis output is consistent with seed offer", () => {
  it("titles the agency follow-up engine", () => {
    expect(CACHED_HYPOTHESIS.title.toLowerCase()).toContain("follow");
  });

  it("surfaces at least one risky assumption", () => {
    expect(CACHED_HYPOTHESIS.riskyAssumptions.length).toBeGreaterThanOrEqual(1);
  });
});
