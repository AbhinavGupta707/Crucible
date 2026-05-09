// Response parser. Cached safe-mode classifier; workstream 3 will swap in the
// structured LLM call.

import type { ReplyAnalysis, ReplyOutcome } from "../../db/types";

const KEYWORDS: { outcome: ReplyOutcome; keywords: string[] }[] = [
  { outcome: "unsubscribe", keywords: ["unsubscribe", "remove me from this list", "do not contact"] },
  { outcome: "hostile", keywords: ["spam", "stop emailing", "leave me alone"] },
  { outcome: "bounce", keywords: ["delivery failed", "address not found", "mailer-daemon"] },
  { outcome: "wrong_person", keywords: ["wrong person", "please reach", "i handle"] },
  { outcome: "competitor_locked", keywords: ["already on a", "we use", "12-month contract"] },
  { outcome: "pricing_objection", keywords: ["too expensive", "pricing is high", "cannot justify the price"] },
  { outcome: "trust_objection", keywords: ["onboarding", "implementation", "setup", "do not have time to set up"] },
  { outcome: "interested_later", keywords: ["next quarter", "reach out later", "in november", "later this year", "in q3", "open to a"] },
  { outcome: "positive", keywords: ["yes", "send me a", "let's chat", "interested", "10-min slot", "send me a 10-min"] },
  { outcome: "not_relevant", keywords: ["not a fit", "not relevant"] },
];

export type ParseReplyResult = {
  outcome: ReplyOutcome;
  sentiment: ReplyAnalysis["sentiment"];
  objectionType: string | null;
  funnelStage: string;
  volunteeredInfo: string[];
  confidence: number;
};

const FUNNEL_STAGE: Record<ReplyOutcome, string> = {
  positive: "ready",
  interested_later: "consideration",
  wrong_person: "redirect",
  not_relevant: "out",
  pricing_objection: "objection",
  trust_objection: "objection",
  competitor_locked: "deferred",
  unsubscribe: "out",
  hostile: "out",
  bounce: "out",
  no_reply: "unknown",
};

const SENTIMENT: Record<ReplyOutcome, ReplyAnalysis["sentiment"]> = {
  positive: "positive",
  interested_later: "neutral",
  wrong_person: "neutral",
  not_relevant: "negative",
  pricing_objection: "negative",
  trust_objection: "negative",
  competitor_locked: "neutral",
  unsubscribe: "negative",
  hostile: "negative",
  bounce: "neutral",
  no_reply: "neutral",
};

export function parseReply(rawText: string): ParseReplyResult {
  const text = rawText.toLowerCase();
  let bestOutcome: ReplyOutcome = "no_reply";
  let bestHits = 0;
  for (const { outcome, keywords } of KEYWORDS) {
    let hits = 0;
    for (const k of keywords) {
      if (text.includes(k)) hits += 1;
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestOutcome = outcome;
    }
  }
  const confidence = bestHits === 0 ? 0.4 : Math.min(0.99, 0.6 + bestHits * 0.15);

  let objectionType: string | null = null;
  if (bestOutcome === "trust_objection") objectionType = "implementation_effort";
  else if (bestOutcome === "pricing_objection") objectionType = "pricing";
  else if (bestOutcome === "competitor_locked") objectionType = "competitor_lock";

  // Crude volunteered-info extraction: keep first sentence that mentions a key noun.
  const sentences = rawText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const volunteeredInfo = sentences
    .filter((s) => /(onboarding|setup|implementation|pricing|engineering|fit check|contract|q3|november|november\.)/i.test(s))
    .slice(0, 3);

  return {
    outcome: bestOutcome,
    sentiment: SENTIMENT[bestOutcome],
    objectionType,
    funnelStage: FUNNEL_STAGE[bestOutcome],
    volunteeredInfo,
    confidence,
  };
}
