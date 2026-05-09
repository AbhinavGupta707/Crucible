import { describe, expect, it } from "vitest";
import { scoreProspectMatch } from "../../lib/scoring/match-score";

describe("match-score", () => {
  const goodProspect = {
    title: "Chief Operating Officer",
    company: "Pinwheel Studio",
    industry: "Digital agency",
    companySize: "20-50",
    notes: "Killed two CRMs in the last 18 months. Set-up time matters more than price.",
    trigger: "Rolled back HubSpot last quarter",
  };

  const toolFatiguedArchetype = {
    role: "Operations or COO",
    segment: "10-30 person agency",
    predictedObjections: [
      "Pricing - we already pay for tools nobody use.",
      "Implementation - I do not have time to roll this out.",
    ],
    preferredAngles: ["Implementation-light", "Voice-mirroring"],
    industryHints: ["agency", "studio"],
    companySizeHints: ["20", "30"],
  };

  it("returns higher score for a strong fit than a weak one", () => {
    const strong = scoreProspectMatch(goodProspect, toolFatiguedArchetype, 0.8);
    const weak = scoreProspectMatch(
      {
        title: "Backend Engineer",
        company: "Rocket Inc",
        industry: "Aerospace",
        companySize: "5000+",
        notes: "",
        trigger: "",
      },
      toolFatiguedArchetype,
      0.1
    );
    expect(strong.total).toBeGreaterThan(weak.total);
  });

  it("respects the documented weights", () => {
    const result = scoreProspectMatch(goodProspect, toolFatiguedArchetype, 1.0);
    const expected =
      0.35 * result.parts.roleSimilarity +
      0.25 * result.parts.segmentSimilarity +
      0.2 * result.parts.triggerSimilarity +
      0.1 * result.parts.industryFit +
      0.1 * result.parts.llmJudgment;
    expect(Math.abs(result.total - expected)).toBeLessThan(0.001);
  });

  it("clamps llm judgment outside [0, 1]", () => {
    const out = scoreProspectMatch(goodProspect, toolFatiguedArchetype, 5);
    expect(out.parts.llmJudgment).toBe(1);
    const out2 = scoreProspectMatch(goodProspect, toolFatiguedArchetype, -2);
    expect(out2.parts.llmJudgment).toBe(0);
  });

  it("returns total in [0, 1]", () => {
    const out = scoreProspectMatch(goodProspect, toolFatiguedArchetype, 0.5);
    expect(out.total).toBeGreaterThanOrEqual(0);
    expect(out.total).toBeLessThanOrEqual(1);
  });

  it("falls back to segment overlap when archetype has no industry hints", () => {
    const noHints = {
      ...toolFatiguedArchetype,
      industryHints: undefined,
      companySizeHints: undefined,
    };
    const out = scoreProspectMatch(goodProspect, noHints, 0.5);
    expect(out.parts.industryFit).toBeGreaterThanOrEqual(0);
    expect(out.parts.industryFit).toBeLessThanOrEqual(1);
  });
});
