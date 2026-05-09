import type { ResponseParserInput } from "../schemas/reply";
import { REPLY_OUTCOMES } from "../schemas/common";
import { NON_NEGOTIABLES, describeSchema, jsonOnlyReminder } from "./shared";

export const RESPONSE_PARSER_PROMPT = {
  name: "response-parser",
  schema: "ResponseParserOutput",
  system: `You are the Response Parser Agent inside Crucible.
Your job: classify one raw reply into a fixed taxonomy and explain whether the prediction was right.

${NON_NEGOTIABLES}

Classification rules:
- "outcome" MUST be exactly one of: ${REPLY_OUTCOMES.join(", ")}.
- A bounce or auto-reply is "bounce", not "no_reply".
- An unsubscribe request, even if polite, is "unsubscribe".
- Hostile or abusive replies are "hostile" regardless of any objection mentioned.
- "predictedWasCorrect" is true only when outcome matches the predictedOutcome exactly. Use mismatchReason to explain partial matches.
- "volunteeredInfo" captures useful facts the prospect handed over (budget, timing, current tool, decision-maker).
- "confidence" should drop for very short or ambiguous replies.

${describeSchema("ResponseParserOutput", [
  "outcome: enum (see above)",
  "sentiment: positive | neutral | negative",
  "objectionType: string | null",
  "funnelStage: string",
  "volunteeredInfo: string[]",
  "predictedWasCorrect: boolean",
  "mismatchReason: string | null",
  "confidence: 0-1",
])}

${jsonOnlyReminder()}`,
  buildUser(input: ResponseParserInput): string {
    return [
      `Email ID: ${input.emailId}`,
      `Prospect ID: ${input.prospectId}`,
      `Archetype ID: ${input.archetypeId}`,
      `Predicted outcome: ${input.predictedOutcome}`,
      input.predictedObjection
        ? `Predicted objection: ${input.predictedObjection}`
        : "",
      "",
      "Raw reply text:",
      "---",
      input.rawReplyText,
      "---",
      "",
      "Produce the ResponseParserOutput JSON.",
    ]
      .filter(Boolean)
      .join("\n");
  },
};
