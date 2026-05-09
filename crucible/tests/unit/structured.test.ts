import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  generateStructured,
  type StructuredCall,
  type StructuredLogEvent,
} from "../../lib/ai/structured";
import {
  type Provider,
  type ProviderResponse,
  ProviderUnavailableError,
} from "../../lib/ai/provider";
import { CACHED_AGENT_OUTPUTS } from "../../lib/ai/cached";
import { HYPOTHESIS_PROMPT } from "../../lib/ai/prompts/hypothesis";
import {
  HypothesisInputSchema,
  HypothesisOutputSchema,
} from "../../lib/ai/schemas/offer";

// Vitest sets process.env.NODE_ENV; force USE_CACHED_AI off for live-path tests.
const ORIGINAL_ENV = { ...process.env };
function withEnv<T>(env: Record<string, string | undefined>, fn: () => T): T {
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    process.env = { ...ORIGINAL_ENV };
  }
}

const HYPOTHESIS_CALL: StructuredCall<
  z.infer<typeof HypothesisInputSchema>,
  z.infer<typeof HypothesisOutputSchema>
> = {
  agent: "hypothesis",
  schemaName: "HypothesisOutput",
  inputSchema: HypothesisInputSchema,
  outputSchema: HypothesisOutputSchema,
  systemPrompt: HYPOTHESIS_PROMPT.system,
  buildUserPrompt: HYPOTHESIS_PROMPT.buildUser,
};

const VALID_INPUT: z.infer<typeof HypothesisInputSchema> = {
  rawFounderInput:
    "We help small agencies follow up with quiet inbound leads.",
  icpGuess: "5-25 person service agencies",
  desiredCta: "15-minute fit check",
  tone: "concise",
};

class StubProvider implements Provider {
  readonly name = "openai" as const;
  readonly model = "stub-model";
  public calls: ProviderResponse[] = [];
  constructor(private readonly responses: Array<string | Error>) {}
  async complete(): Promise<ProviderResponse> {
    const next = this.responses.shift();
    if (next === undefined) throw new Error("no more stubbed responses");
    if (next instanceof Error) throw next;
    const r: ProviderResponse = {
      raw: next,
      provider: "openai",
      model: this.model,
      latencyMs: 1,
    };
    this.calls.push(r);
    return r;
  }
}

describe("structured: input validation", () => {
  it("throws when input does not match the input schema", async () => {
    await expect(
      generateStructured(HYPOTHESIS_CALL, { tone: "concise" } as never, {
        useCachedOnly: true,
      })
    ).rejects.toThrow(/Invalid input/);
  });
});

describe("structured: cached/demo-safe path", () => {
  it("returns the cached fixture immediately when useCachedOnly=true", async () => {
    const events: StructuredLogEvent[] = [];
    const result = await generateStructured(HYPOTHESIS_CALL, VALID_INPUT, {
      useCachedOnly: true,
      log: (e) => events.push(e),
    });
    expect(result.source).toBe("cache");
    expect(result.data.title).toBe("Agency Follow-Up Engine");
    expect(events.some((e) => e.type === "cache_used")).toBe(true);
  });
});

describe("structured: live path", () => {
  it("returns source=live when the provider returns valid JSON on first try", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const provider = new StubProvider([
          JSON.stringify(CACHED_AGENT_OUTPUTS.hypothesis),
        ]);
        const events: StructuredLogEvent[] = [];
        const result = await generateStructured(
          HYPOTHESIS_CALL,
          VALID_INPUT,
          {
            provider,
            useCachedOnly: false,
            log: (e) => events.push(e),
          }
        );
        expect(result.source).toBe("live");
        expect(events.some((e) => e.type === "live_success")).toBe(true);
      }
    );
  });

  it("retries once on schema failure and returns source=retry on success", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const provider = new StubProvider([
          JSON.stringify({ title: "missing other fields" }),
          JSON.stringify(CACHED_AGENT_OUTPUTS.hypothesis),
        ]);
        const events: StructuredLogEvent[] = [];
        const result = await generateStructured(
          HYPOTHESIS_CALL,
          VALID_INPUT,
          {
            provider,
            useCachedOnly: false,
            log: (e) => events.push(e),
          }
        );
        expect(result.source).toBe("retry");
        expect(events.some((e) => e.type === "live_invalid")).toBe(true);
        expect(events.some((e) => e.type === "retry_success")).toBe(true);
      }
    );
  });

  it("falls back to cache after live + retry both fail", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const provider = new StubProvider([
          "not json at all",
          JSON.stringify({ title: "still wrong" }),
        ]);
        const events: StructuredLogEvent[] = [];
        const result = await generateStructured(
          HYPOTHESIS_CALL,
          VALID_INPUT,
          {
            provider,
            useCachedOnly: false,
            log: (e) => events.push(e),
          }
        );
        expect(result.source).toBe("cache");
        expect(result.data.title).toBe("Agency Follow-Up Engine");
        expect(events.filter((e) => e.type === "cache_used")).toHaveLength(1);
        expect(events.some((e) => e.type === "live_invalid")).toBe(true);
        expect(events.some((e) => e.type === "retry_invalid")).toBe(true);
      }
    );
  });

  it("falls back to cache when the provider throws ProviderUnavailableError", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const provider = new StubProvider([
          new ProviderUnavailableError("upstream 503"),
        ]);
        const result = await generateStructured(
          HYPOTHESIS_CALL,
          VALID_INPUT,
          {
            provider,
            useCachedOnly: false,
          }
        );
        expect(result.source).toBe("cache");
      }
    );
  });

  it("strips ```json fences before parsing", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const fenced = "```json\n" + JSON.stringify(CACHED_AGENT_OUTPUTS.hypothesis) + "\n```";
        const provider = new StubProvider([fenced]);
        const result = await generateStructured(HYPOTHESIS_CALL, VALID_INPUT, {
          provider,
          useCachedOnly: false,
        });
        expect(result.source).toBe("live");
      }
    );
  });

  it("throws when the cache registry is missing the agent (no silent unvalidated return)", async () => {
    await withEnv(
      { USE_CACHED_AI: "false", DEMO_SAFE_MODE: "false" },
      async () => {
        const provider = new StubProvider([
          new ProviderUnavailableError("down"),
        ]);
        await expect(
          generateStructured(HYPOTHESIS_CALL, VALID_INPUT, {
            provider,
            useCachedOnly: false,
            cachedRegistry: {},
          })
        ).rejects.toThrow(/No cached fixture/);
      }
    );
  });
});

describe("structured: provider hook is called once when cached path is used", () => {
  it("never touches the provider in cached-only mode", async () => {
    const provider = new StubProvider([]);
    const spy = vi.spyOn(provider, "complete");
    const result = await generateStructured(HYPOTHESIS_CALL, VALID_INPUT, {
      provider,
      useCachedOnly: true,
    });
    expect(result.source).toBe("cache");
    expect(spy).not.toHaveBeenCalled();
  });
});
