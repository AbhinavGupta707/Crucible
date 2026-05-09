export * from "./common";
export * from "./offer";
export * from "./archetype";
export * from "./prospect";
export * from "./email";
export * from "./reply";
export * from "./calibration";
export * from "./campaign";

import { HypothesisInputSchema, HypothesisOutputSchema } from "./offer";
import {
  PersonaSynthesizerInputSchema,
  PersonaSynthesizerOutputSchema,
} from "./archetype";
import {
  PreflightInputSchema,
  PreflightOutputSchema,
  ProspectMatcherInputSchema,
  ProspectMatcherOutputSchema,
} from "./prospect";
import { OutreachInputSchema, OutreachOutputSchema } from "./email";
import { ResponseParserInputSchema, ResponseParserOutputSchema } from "./reply";
import { CalibrationInputSchema, CalibrationOutputSchema } from "./calibration";
import { NextCohortInputSchema, NextCohortOutputSchema } from "./campaign";

export const AGENT_SCHEMAS = {
  hypothesis: { input: HypothesisInputSchema, output: HypothesisOutputSchema },
  "persona-synthesizer": {
    input: PersonaSynthesizerInputSchema,
    output: PersonaSynthesizerOutputSchema,
  },
  "prospect-matcher": {
    input: ProspectMatcherInputSchema,
    output: ProspectMatcherOutputSchema,
  },
  "preflight-simulator": {
    input: PreflightInputSchema,
    output: PreflightOutputSchema,
  },
  "outreach-generator": {
    input: OutreachInputSchema,
    output: OutreachOutputSchema,
  },
  "response-parser": {
    input: ResponseParserInputSchema,
    output: ResponseParserOutputSchema,
  },
  "calibration-agent": {
    input: CalibrationInputSchema,
    output: CalibrationOutputSchema,
  },
  "next-cohort": {
    input: NextCohortInputSchema,
    output: NextCohortOutputSchema,
  },
} as const;

export type AgentName = keyof typeof AGENT_SCHEMAS;
export const AGENT_NAMES: readonly AgentName[] = Object.keys(
  AGENT_SCHEMAS
) as AgentName[];
