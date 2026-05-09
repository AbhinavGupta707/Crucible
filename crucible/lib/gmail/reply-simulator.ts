export type TriggerReplySimulatorInput = {
  recipients?: string[];
  sentEmailIds?: string[];
  cohortId?: string;
  workspaceId?: string;
  scenario?: string;
  env?: Partial<NodeJS.ProcessEnv>;
};

export type TriggerReplySimulatorResult = {
  triggered: boolean;
  replied: number;
  details: unknown;
  warnings: string[];
};

export class ReplySimulatorNotConfiguredError extends Error {
  constructor() {
    super(
      "Gmail reply simulator is not configured. Set GMAIL_REPLY_SIMULATOR_URL and GMAIL_REPLY_SIMULATOR_SECRET.",
    );
    this.name = "ReplySimulatorNotConfiguredError";
  }
}

export function replySimulatorIsConfigured(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): boolean {
  return Boolean(
    env.GMAIL_REPLY_SIMULATOR_URL?.trim() &&
      env.GMAIL_REPLY_SIMULATOR_SECRET?.trim(),
  );
}

export async function triggerReplySimulator(
  input: TriggerReplySimulatorInput = {},
): Promise<TriggerReplySimulatorResult> {
  const env = input.env ?? process.env;
  const url = env.GMAIL_REPLY_SIMULATOR_URL?.trim();
  const secret = env.GMAIL_REPLY_SIMULATOR_SECRET?.trim();

  if (!url || !secret) throw new ReplySimulatorNotConfiguredError();

  const targetUrl = new URL(url);
  targetUrl.searchParams.set("secret", secret);

  const res = await fetch(targetUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
      "X-Crucible-Reply-Simulator-Secret": secret,
    },
    body: JSON.stringify({
      source: "crucible",
      mode: "controlled-gmail-demo",
      secret,
      recipients: input.recipients ?? [],
      sentEmailIds: input.sentEmailIds ?? [],
      cohortId: input.cohortId,
      workspaceId: input.workspaceId,
      scenario: input.scenario ?? "alias-personas",
      triggeredAt: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const details = await readResponseBody(res);
  if (!res.ok) {
    return {
      triggered: false,
      replied: 0,
      details,
      warnings: [`Reply simulator returned HTTP ${res.status}.`],
    };
  }

  const replied = extractReplyCount(details);
  return {
    triggered: true,
    replied,
    details,
    warnings: replied === 0 ? ["Reply simulator did not report any replies."] : [],
  };
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractReplyCount(details: unknown): number {
  if (!details || typeof details !== "object") return 0;
  const record = details as Record<string, unknown>;
  const candidates = [record.replied, record.replyCount, record.repliesSent];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return Math.max(0, Math.floor(candidate));
    }
  }
  if (Array.isArray(record.replies)) return record.replies.length;
  if (Array.isArray(record.results)) {
    return record.results.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const status = (item as Record<string, unknown>).status;
      return status === "replied" || status === "sent" || status === true;
    }).length;
  }
  return 0;
}
