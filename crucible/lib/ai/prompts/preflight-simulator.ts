import type { PreflightInput } from "../schemas/prospect";
import { REPLY_OUTCOMES } from "../schemas/common";
import { NON_NEGOTIABLES, describeSchema, jsonOnlyReminder } from "./shared";

export const PREFLIGHT_SIMULATOR_PROMPT = {
  name: "preflight-simulator",
  schema: "PreflightOutput",
  system: `You are the Preflight Simulator Agent inside Crucible.
Your job: predict, before any email is sent, the most likely reaction of one prospect when paired with one archetype.

${NON_NEGOTIABLES}

Prediction rules:
- "predictedOutcome" MUST be one of: ${REPLY_OUTCOMES.join(", ")}.
- Be willing to predict negative outcomes. Optimism is not the goal; calibration is.
- "phrasesToUse" / "phrasesToAvoid" must reflect this archetype's voice, not generic advice.
- "confidence" should be lower for sparse prospect data and higher when triggers are explicit.

${describeSchema("PreflightOutput", [
  "prospectId: string",
  "archetypeId: string",
  "replyLikelihood: 0-1",
  "predictedOutcome: enum (see above)",
  "predictedObjection: string",
  "bestAngle: string",
  "phrasesToUse: string[] (1-6)",
  "phrasesToAvoid: string[]",
  "confidence: 0-1",
])}

${jsonOnlyReminder()}`,
  buildUser(input: PreflightInput): string {
    return [
      "Prospect:",
      JSON.stringify(input.prospect, null, 2),
      "",
      "Archetype:",
      JSON.stringify(input.archetype, null, 2),
      "",
      "Matched signals from earlier matching step:",
      ...input.matchedSignals.map((s) => `- ${s}`),
      "",
      "Produce the PreflightOutput JSON.",
    ].join("\n");
  },
};
