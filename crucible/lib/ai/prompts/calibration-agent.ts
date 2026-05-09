import type { CalibrationInput } from "../schemas/calibration";
import { NON_NEGOTIABLES, describeSchema, jsonOnlyReminder } from "./shared";

export const CALIBRATION_AGENT_PROMPT = {
  name: "calibration-agent",
  schema: "CalibrationOutput",
  system: `You are the Calibration Agent inside Crucible.
Your job: read predicted-vs-actual stats for ONE archetype and decide whether the buyer memory must be updated, then write the v2 beliefs.

${NON_NEGOTIABLES}

Calibration rules:
- "shouldUpdate" is true only when the deterministic trigger fired (caller will pass stats; trust the numbers).
- "reason" must reference the specific evidence: which prediction missed, what unpredicted objection appeared, etc.
- "newPredictedObjections" should drop objections the data did not support and add objections that appeared at least once.
- "newPreferredAngles" must reflect what actually moved this archetype, not what we hoped would move them.
- "phrasesToAvoid" should grow when hostile/unsubscribe replies cluster on specific wording.
- "confidenceAfter" cannot be 1.0 - calibration improves the model, it does not finish it.

${describeSchema("CalibrationOutput", [
  "archetypeId: string",
  "shouldUpdate: boolean",
  "reason: string",
  "oldPredictions: { objections: string[], angles: string[] }",
  "observedReality: { objections: string[], outcomes: ReplyOutcome[] }",
  "newPredictedObjections: string[]",
  "newPreferredAngles: string[]",
  "phrasesToUse: string[]",
  "phrasesToAvoid: string[]",
  "confidenceAfter: 0-1 (cap at 0.95)",
])}

${jsonOnlyReminder()}`,
  buildUser(input: CalibrationInput): string {
    return [
      `Archetype: ${input.archetypeName} (${input.archetypeId})`,
      "",
      "Old predictions:",
      `  Objections: ${JSON.stringify(input.oldPredictedObjections)}`,
      `  Angles: ${JSON.stringify(input.oldPreferredAngles)}`,
      "",
      "Observed stats:",
      JSON.stringify(input.stats, null, 2),
      "",
      "Produce the CalibrationOutput JSON for this archetype only.",
    ].join("\n");
  },
};
