import type { ResponseParserOutput } from "../schemas/reply";

export const CACHED_RESPONSE_PARSER: ResponseParserOutput = {
  outcome: "trust_objection",
  sentiment: "neutral",
  objectionType: "implementation_time",
  funnelStage: "early_objection",
  volunteeredInfo: [
    "Tried two CRMs in the last 18 months.",
    "Real concern is set-up time, not price.",
    "Open to a 15-minute call after rollout next month.",
  ],
  predictedWasCorrect: false,
  mismatchReason:
    "Predicted pricing_objection but the reply explicitly says price is fine and the blocker is set-up time / implementation effort.",
  confidence: 0.78,
};
