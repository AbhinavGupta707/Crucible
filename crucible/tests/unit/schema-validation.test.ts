import { describe, expect, it } from "vitest";
import {
  AGENT_NAMES,
  AGENT_SCHEMAS,
  CACHED_AGENT_OUTPUTS,
} from "../../lib/ai";

describe("schema-validation: cached AI outputs", () => {
  it("registers a fixture for every declared agent", () => {
    const fixtureKeys = Object.keys(CACHED_AGENT_OUTPUTS).sort();
    const agentKeys = [...AGENT_NAMES].sort();
    expect(fixtureKeys).toEqual(agentKeys);
  });

  for (const agent of AGENT_NAMES) {
    it(`cached "${agent}" output validates against ${agent} output schema`, () => {
      const schema = AGENT_SCHEMAS[agent].output;
      const fixture = CACHED_AGENT_OUTPUTS[agent];
      const result = schema.safeParse(fixture);
      if (!result.success) {
        // Print the issues so failures are debuggable.
        // eslint-disable-next-line no-console
        console.error(agent, JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });
  }

  it("rejects malformed hypothesis output (missing required fields)", () => {
    const schema = AGENT_SCHEMAS.hypothesis.output;
    const result = schema.safeParse({ title: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects reply outcomes outside the fixed taxonomy", () => {
    const schema = AGENT_SCHEMAS["response-parser"].output;
    const result = schema.safeParse({
      outcome: "definitely_buying",
      sentiment: "positive",
      objectionType: null,
      funnelStage: "demo",
      volunteeredInfo: [],
      predictedWasCorrect: true,
      mismatchReason: null,
      confidence: 0.9,
    });
    expect(result.success).toBe(false);
  });

  it("rejects archetype confidence > 1", () => {
    const schema = AGENT_SCHEMAS["persona-synthesizer"].output;
    const broken = JSON.parse(
      JSON.stringify(CACHED_AGENT_OUTPUTS["persona-synthesizer"])
    ) as { archetypes: Array<{ confidence: number }> };
    broken.archetypes[0]!.confidence = 2.5;
    const result = schema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects email subject longer than 120 chars", () => {
    const schema = AGENT_SCHEMAS["outreach-generator"].output;
    const broken = {
      ...(CACHED_AGENT_OUTPUTS["outreach-generator"] as object),
      subject: "x".repeat(121),
    };
    const result = schema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("requires at least 8 archetypes", () => {
    const schema = AGENT_SCHEMAS["persona-synthesizer"].output;
    const broken = { archetypes: [] };
    expect(schema.safeParse(broken).success).toBe(false);
  });
});
