/**
 * Provider adapter.
 *
 * The structured layer talks to a single `Provider` interface.
 * Concrete providers (openai, anthropic, mock) implement `complete()`
 * and return a raw string the caller will parse + Zod-validate.
 *
 * Live SDK imports happen at the call site to keep this module
 * runtime-agnostic and to keep the demo flow alive when the SDKs
 * are not installed yet (USE_CACHED_AI=true is the default).
 */

export type ProviderName = "openai" | "anthropic" | "mock";

export interface ProviderRequest {
  system: string;
  user: string;
  agent: string;
  schemaName: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ProviderResponse {
  raw: string;
  provider: ProviderName;
  model: string;
  latencyMs: number;
}

export interface Provider {
  readonly name: ProviderName;
  readonly model: string;
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}

export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

/**
 * MockProvider: deterministic, never makes a network call.
 * Used in demo safe mode and unit tests. The structured helper
 * will see its (intentionally empty) output, fail schema validation,
 * and fall through to the cached fixture path - which is exactly
 * the production behaviour when a real provider goes down.
 */
export class MockProvider implements Provider {
  readonly name: ProviderName = "mock";
  readonly model: string;
  private readonly canned: Map<string, string>;

  constructor(opts: { model?: string; canned?: Record<string, string> } = {}) {
    this.model = opts.model ?? "mock-1";
    this.canned = new Map(Object.entries(opts.canned ?? {}));
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();
    const raw = this.canned.get(req.agent) ?? "{}";
    return {
      raw,
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - start,
    };
  }
}

export class OpenAIProvider implements Provider {
  readonly name: ProviderName = "openai";
  readonly model: string;
  private readonly apiKey: string;

  constructor(opts: { apiKey: string; model?: string }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "gpt-4o-mini";
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: req.temperature ?? 0.2,
        max_tokens: req.maxOutputTokens ?? 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.user },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ProviderUnavailableError(
        `OpenAI HTTP ${res.status}: ${body.slice(0, 200)}`
      );
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    return {
      raw,
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - start,
    };
  }
}

export class AnthropicProvider implements Provider {
  readonly name: ProviderName = "anthropic";
  readonly model: string;
  private readonly apiKey: string;

  constructor(opts: { apiKey: string; model?: string }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "claude-sonnet-4-6";
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: req.maxOutputTokens ?? 1500,
        temperature: req.temperature ?? 0.2,
        system: req.system,
        messages: [{ role: "user", content: req.user }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ProviderUnavailableError(
        `Anthropic HTTP ${res.status}: ${body.slice(0, 200)}`
      );
    }
    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const raw =
      json.content?.find((b) => b.type === "text")?.text ?? "";
    return {
      raw,
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - start,
    };
  }
}

export interface ProviderConfig {
  provider?: ProviderName;
  model?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  /** Force the demo-safe path: never call a real provider. */
  useCachedOnly?: boolean;
}

/**
 * Build a Provider from explicit config (preferred) or from env vars.
 * Returns a MockProvider whenever useCachedOnly is true OR the
 * requested provider's API key is missing - so demo safe mode never
 * crashes from missing credentials.
 */
export function buildProvider(config: ProviderConfig = {}): Provider {
  if (config.useCachedOnly) return new MockProvider({ model: "cache-only" });

  const name =
    config.provider ?? (process.env.AI_PROVIDER as ProviderName | undefined);

  if (name === "openai") {
    const apiKey = config.openaiApiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) return new MockProvider({ model: "openai-missing-key" });
    return new OpenAIProvider({
      apiKey,
      model: config.model ?? process.env.AI_MODEL,
    });
  }

  if (name === "anthropic") {
    const apiKey = config.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new MockProvider({ model: "anthropic-missing-key" });
    return new AnthropicProvider({
      apiKey,
      model: config.model ?? process.env.AI_MODEL,
    });
  }

  return new MockProvider({ model: config.model ?? "default-mock" });
}
