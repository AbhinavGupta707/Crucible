import { CACHED_CALIBRATION } from "./calibration";
import { CACHED_HYPOTHESIS } from "./hypothesis";
import { CACHED_NEXT_COHORT } from "./next-cohort";
import { CACHED_OUTREACH } from "./email";
import { CACHED_PERSONA_SYNTHESIZER } from "./persona-synthesizer";
import { CACHED_PREFLIGHT, CACHED_PROSPECT_MATCHER } from "./prospect";
import { CACHED_RESPONSE_PARSER } from "./reply";

export {
  CACHED_CALIBRATION,
  CACHED_HYPOTHESIS,
  CACHED_NEXT_COHORT,
  CACHED_OUTREACH,
  CACHED_PERSONA_SYNTHESIZER,
  CACHED_PREFLIGHT,
  CACHED_PROSPECT_MATCHER,
  CACHED_RESPONSE_PARSER,
};

export type CachedRegistry = Record<string, unknown>;

/**
 * Fixtures keyed by agent name. Each fixture is the canonical demo
 * output for that agent against the seed offer ("Agency Follow-Up Engine").
 *
 * The structured helper validates these against their schema before
 * returning them, so a malformed fixture fails loudly.
 */
export const CACHED_AGENT_OUTPUTS: CachedRegistry = {
  hypothesis: CACHED_HYPOTHESIS,
  "persona-synthesizer": CACHED_PERSONA_SYNTHESIZER,
  "prospect-matcher": CACHED_PROSPECT_MATCHER,
  "preflight-simulator": CACHED_PREFLIGHT,
  "outreach-generator": CACHED_OUTREACH,
  "response-parser": CACHED_RESPONSE_PARSER,
  "calibration-agent": CACHED_CALIBRATION,
  "next-cohort": CACHED_NEXT_COHORT,
};
