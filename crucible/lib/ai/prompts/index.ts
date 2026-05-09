import { CALIBRATION_AGENT_PROMPT } from "./calibration-agent";
import { HYPOTHESIS_PROMPT } from "./hypothesis";
import { NEXT_COHORT_PROMPT } from "./next-cohort";
import { OUTREACH_GENERATOR_PROMPT } from "./outreach-generator";
import { PERSONA_SYNTHESIZER_PROMPT } from "./persona-synthesizer";
import { PREFLIGHT_SIMULATOR_PROMPT } from "./preflight-simulator";
import { PROSPECT_MATCHER_PROMPT } from "./prospect-matcher";
import { RESPONSE_PARSER_PROMPT } from "./response-parser";

export {
  CALIBRATION_AGENT_PROMPT,
  HYPOTHESIS_PROMPT,
  NEXT_COHORT_PROMPT,
  OUTREACH_GENERATOR_PROMPT,
  PERSONA_SYNTHESIZER_PROMPT,
  PREFLIGHT_SIMULATOR_PROMPT,
  PROSPECT_MATCHER_PROMPT,
  RESPONSE_PARSER_PROMPT,
};

export const AGENT_PROMPTS = {
  hypothesis: HYPOTHESIS_PROMPT,
  "persona-synthesizer": PERSONA_SYNTHESIZER_PROMPT,
  "prospect-matcher": PROSPECT_MATCHER_PROMPT,
  "preflight-simulator": PREFLIGHT_SIMULATOR_PROMPT,
  "outreach-generator": OUTREACH_GENERATOR_PROMPT,
  "response-parser": RESPONSE_PARSER_PROMPT,
  "calibration-agent": CALIBRATION_AGENT_PROMPT,
  "next-cohort": NEXT_COHORT_PROMPT,
} as const;
