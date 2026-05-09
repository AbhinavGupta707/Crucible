import type { ProspectMatcherInput } from "../schemas/prospect";
import { NON_NEGOTIABLES, describeSchema, jsonOnlyReminder } from "./shared";

export const PROSPECT_MATCHER_PROMPT = {
  name: "prospect-matcher",
  schema: "ProspectMatcherOutput",
  system: `You are the Prospect Matcher Agent inside Crucible.
Your job: pick the single best buyer archetype for one prospect, with explicit reasoning and risk flags.

${NON_NEGOTIABLES}

Matching rules:
- Use only signals present in the prospect record. Do not invent triggers, headcounts, or tech stacks.
- "matchedSignals" must quote or paraphrase concrete prospect fields (title, company, trigger, notes).
- "riskFlags" should call out wrong-person risk, gatekeeper risk, or signal-light prospects.
- "llmJudgmentScore" is your independent 0-1 confidence used by the deterministic blender.

${describeSchema("ProspectMatcherOutput", [
  "prospectId: string",
  "archetypeId: string (must be one of the provided archetype IDs)",
  "confidence: 0-1",
  "reasoning: string",
  "matchedSignals: string[] (1-8)",
  "riskFlags: string[]",
  "llmJudgmentScore: 0-1",
])}

${jsonOnlyReminder()}`,
  buildUser(input: ProspectMatcherInput): string {
    const p = input.prospect;
    return [
      "Prospect record:",
      JSON.stringify(p, null, 2),
      "",
      "Candidate archetypes:",
      JSON.stringify(input.archetypes, null, 2),
      "",
      "Pick the single best archetype and produce ProspectMatcherOutput JSON.",
    ].join("\n");
  },
};
