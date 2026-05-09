/**
 * Structured generation helper.
 *
 * generateStructured() runs one AI agent call and guarantees a
 * Zod-validated output, with this contract:
 *
 *   1. If useCachedAi() returns true OR the provider is mock-only,
 *      skip the live call and return the cached fixture.
 *   2. Otherwise call the provider once.
 *      - On schema-valid output: return source="live".
 *   3. On JSON or schema failure: retry ONCE with a stricter
 *      "you returned malformed JSON, here is the validator error"
 *      reminder.
 *      - On second-attempt success: return source="retry".
 *   4. On second failure or thrown ProviderUnavailableError:
 *      fall back to the cached fixture and return source="cache".
 *      The cached fixture itself is Zod-validated; if the registry
 *      is missing or invalid we throw - we never return unvalidated data.
 *
 * AI functions never touch the database. Persistence is the
 * caller's responsibility.
 */

import type { z, ZodSchema } from "zod";
import { CACHED_AGENT_OUTPUTS, type CachedRegistry } from "./cached";
import {
  buildProvider,
  MockProvider,
  type Provider,
  type ProviderConfig,
  ProviderUnavailableError,
} from "./provider";

export type StructuredSource = "live" | "retry" | "cache";

export interface StructuredCall<TInput, TOutput> {
  agent: string;
  schemaName: string;
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;
  systemPrompt: string;
  buildUserPrompt: (input: TInput) => string;
  /** Override the cached-fixture lookup key. Defaults to `agent`. */
  cacheKey?: string;
}

export interface StructuredOptions {
  provider?: Provider;
  providerConfig?: ProviderConfig;
  /** When true, skip live call and return cached output. */
  useCachedOnly?: boolean;
  /** Inject a registry for tests. Falls back to bundled fixtures. */
  cachedRegistry?: CachedRegistry;
  /** Hook for structured logging. Called once per attempt + final result. */
  log?: (event: StructuredLogEvent) => void;
  traceId?: string;
}

export interface StructuredLogEvent {
  type:
    | "live_attempt"
    | "live_success"
    | "live_invalid"
    | "retry_attempt"
    | "retry_success"
    | "retry_invalid"
    | "provider_error"
    | "cache_used"
    | "cache_missing";
  agent: string;
  schemaName: string;
  traceId?: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  message?: string;
}

export interface StructuredResult<TOutput> {
  data: TOutput;
  source: StructuredSource;
  agent: string;
  provider: string;
  model: string;
  latencyMs: number;
  warnings: string[];
}

const DEFAULT_LOG = (_e: StructuredLogEvent) => {
  /* no-op by default */
};

/** Read USE_CACHED_AI / DEMO_SAFE_MODE env flags. Defaults to demo-safe. */
export function useCachedAi(): boolean {
  const cached = process.env.USE_CACHED_AI;
  const safe = process.env.DEMO_SAFE_MODE;
  if (cached === "false" || safe === "false") return false;
  return true;
}

function tryParseJson(raw: string): unknown {
  // Be forgiving about ```json fences a model might emit despite instructions.
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1] ?? trimmed;
  return JSON.parse(candidate);
}

function summariseZodError(err: z.ZodError): string {
  return err.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}

interface CachedLookup<TOutput> {
  agent: string;
  cacheKey?: string;
  outputSchema: ZodSchema<TOutput>;
}

function loadCachedOutput<TOutput>(
  call: CachedLookup<TOutput>,
  registry: CachedRegistry
): TOutput {
  const key = call.cacheKey ?? call.agent;
  const fixture = registry[key];
  if (fixture === undefined) {
    throw new Error(
      `No cached fixture found for agent "${call.agent}" (key "${key}"). ` +
        `Demo safe mode requires a cached fallback for every agent.`
    );
  }
  const parsed = call.outputSchema.safeParse(fixture);
  if (!parsed.success) {
    throw new Error(
      `Cached fixture for agent "${call.agent}" failed schema validation: ${summariseZodError(
        parsed.error
      )}`
    );
  }
  return parsed.data;
}

export async function generateStructured<TInput, TOutput>(
  call: StructuredCall<TInput, TOutput>,
  input: TInput,
  options: StructuredOptions = {}
): Promise<StructuredResult<TOutput>> {
  const log = options.log ?? DEFAULT_LOG;
  const registry = options.cachedRegistry ?? CACHED_AGENT_OUTPUTS;
  const warnings: string[] = [];

  // Validate input first - we never send malformed input to a model.
  const inputCheck = call.inputSchema.safeParse(input);
  if (!inputCheck.success) {
    throw new Error(
      `Invalid input for agent "${call.agent}": ${summariseZodError(
        inputCheck.error
      )}`
    );
  }
  const safeInput = inputCheck.data;

  const provider =
    options.provider ??
    buildProvider({
      ...options.providerConfig,
      useCachedOnly: options.useCachedOnly ?? options.providerConfig?.useCachedOnly,
    });

  // Demo safe mode / mock provider goes straight to cache.
  const goStraightToCache =
    options.useCachedOnly === true ||
    (options.useCachedOnly !== false &&
      (provider instanceof MockProvider || useCachedAi()));

  if (goStraightToCache) {
    const data = loadCachedOutput(call, registry);
    log({
      type: "cache_used",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: provider.name,
      model: provider.model,
      message: "demo-safe mode or cached-only flag",
    });
    return {
      data,
      source: "cache",
      agent: call.agent,
      provider: provider.name,
      model: provider.model,
      latencyMs: 0,
      warnings: ["used cached output (demo-safe mode)"],
    };
  }

  const userPrompt = call.buildUserPrompt(safeInput);

  // Attempt 1: live.
  log({
    type: "live_attempt",
    agent: call.agent,
    schemaName: call.schemaName,
    traceId: options.traceId,
    provider: provider.name,
    model: provider.model,
  });
  let liveLatency = 0;
  try {
    const res = await provider.complete({
      system: call.systemPrompt,
      user: userPrompt,
      agent: call.agent,
      schemaName: call.schemaName,
    });
    liveLatency = res.latencyMs;
    const parsed = parseAndValidate(res.raw, call.outputSchema);
    if (parsed.ok) {
      log({
        type: "live_success",
        agent: call.agent,
        schemaName: call.schemaName,
        traceId: options.traceId,
        provider: res.provider,
        model: res.model,
        latencyMs: res.latencyMs,
      });
      return {
        data: parsed.data,
        source: "live",
        agent: call.agent,
        provider: res.provider,
        model: res.model,
        latencyMs: res.latencyMs,
        warnings,
      };
    }
    log({
      type: "live_invalid",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: res.provider,
      model: res.model,
      latencyMs: res.latencyMs,
      message: parsed.error,
    });
    warnings.push(`live output invalid: ${parsed.error}`);

    // Attempt 2: retry with a stricter reminder.
    const retrySystem = `${call.systemPrompt}

The previous response was rejected by the validator with:
${parsed.error}

Return JSON that strictly matches the schema. No extra fields. No prose.`;
    log({
      type: "retry_attempt",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: res.provider,
      model: res.model,
    });
    const retry = await provider.complete({
      system: retrySystem,
      user: userPrompt,
      agent: call.agent,
      schemaName: call.schemaName,
      temperature: 0,
    });
    const retryParsed = parseAndValidate(retry.raw, call.outputSchema);
    if (retryParsed.ok) {
      log({
        type: "retry_success",
        agent: call.agent,
        schemaName: call.schemaName,
        traceId: options.traceId,
        provider: retry.provider,
        model: retry.model,
        latencyMs: retry.latencyMs,
      });
      return {
        data: retryParsed.data,
        source: "retry",
        agent: call.agent,
        provider: retry.provider,
        model: retry.model,
        latencyMs: res.latencyMs + retry.latencyMs,
        warnings,
      };
    }
    log({
      type: "retry_invalid",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: retry.provider,
      model: retry.model,
      latencyMs: retry.latencyMs,
      message: retryParsed.error,
    });
    warnings.push(`retry output invalid: ${retryParsed.error}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log({
      type: "provider_error",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: provider.name,
      model: provider.model,
      message,
    });
    warnings.push(`provider error: ${message}`);
    if (!(err instanceof ProviderUnavailableError) && !(err instanceof SyntaxError)) {
      // Unknown error type still falls back to cache, but surface it.
      warnings.push("falling back to cache after unexpected provider error");
    }
  }

  // Attempt 3: cache fallback.
  try {
    const data = loadCachedOutput(call, registry);
    log({
      type: "cache_used",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: provider.name,
      model: provider.model,
      message: "fallback after live + retry failure",
    });
    return {
      data,
      source: "cache",
      agent: call.agent,
      provider: provider.name,
      model: provider.model,
      latencyMs: liveLatency,
      warnings,
    };
  } catch (err) {
    log({
      type: "cache_missing",
      agent: call.agent,
      schemaName: call.schemaName,
      traceId: options.traceId,
      provider: provider.name,
      model: provider.model,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

function parseAndValidate<T>(
  raw: string,
  schema: ZodSchema<T>
): { ok: true; data: T } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = tryParseJson(raw);
  } catch (e) {
    return {
      ok: false,
      error: `JSON.parse failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: summariseZodError(result.error) };
  }
  return { ok: true, data: result.data };
}
