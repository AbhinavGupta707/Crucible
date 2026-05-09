import type {
  PreflightOutput,
  ProspectMatcherOutput,
} from "../schemas/prospect";

export const CACHED_PROSPECT_MATCHER: ProspectMatcherOutput = {
  prospectId: "prospect_demo_001",
  archetypeId: "archetype_tool_fatigued_operator",
  confidence: 0.74,
  reasoning:
    "Title is COO of a 22-person agency, notes mention 'killed two CRMs in 18 months', strong fit with Tool-Fatigued Operator. Trigger 'rolled back HubSpot' is the classic signal.",
  matchedSignals: [
    "Title: COO at a 22-person agency",
    "Notes: 'killed two CRMs in 18 months'",
    "Trigger: 'rolled back HubSpot last quarter'",
    "Industry: digital agency",
  ],
  riskFlags: [
    "May treat this email as 'just another tool' on first read.",
  ],
  llmJudgmentScore: 0.72,
};

export const CACHED_PREFLIGHT: PreflightOutput = {
  prospectId: "prospect_demo_001",
  archetypeId: "archetype_tool_fatigued_operator",
  replyLikelihood: 0.18,
  predictedOutcome: "pricing_objection",
  predictedObjection:
    "Pricing - we already pay for tools nobody uses.",
  bestAngle: "Implementation-light (we draft, you approve)",
  phrasesToUse: [
    "we draft, you approve",
    "no setup",
    "15-minute fit check",
  ],
  phrasesToAvoid: [
    "automation platform",
    "all-in-one",
    "scale your outreach",
  ],
  confidence: 0.62,
};
