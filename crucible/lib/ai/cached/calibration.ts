import type { CalibrationOutput } from "../schemas/calibration";

export const CACHED_CALIBRATION: CalibrationOutput = {
  archetypeId: "archetype_tool_fatigued_operator",
  shouldUpdate: true,
  reason:
    "Across 6 sent emails, we predicted pricing_objection 5 times and observed it 0 times. Implementation/timing objections appeared 3 times. Prediction accuracy 0.33 - below the 0.65 threshold - and a new objection cluster (set-up time) appeared.",
  oldPredictions: {
    objections: [
      "Pricing - we already pay for tools nobody uses.",
      "Implementation - I do not have time to roll this out.",
    ],
    angles: ["Implementation-light", "Voice-mirroring"],
  },
  observedReality: {
    objections: [
      "Set-up time concerns",
      "Open to revisit after current rollout",
    ],
    outcomes: [
      "trust_objection",
      "interested_later",
      "interested_later",
      "no_reply",
      "no_reply",
      "trust_objection",
    ],
  },
  newPredictedObjections: [
    "I do not have time to set up another tool.",
    "Where does this fit on top of what we already run?",
  ],
  newPreferredAngles: [
    "Implementation-light (we draft, you approve)",
    "15-minute fit check (not a demo)",
  ],
  phrasesToUse: [
    "we draft, you approve",
    "no setup",
    "15-minute fit check",
  ],
  phrasesToAvoid: [
    "automation platform",
    "book a demo",
    "all-in-one",
  ],
  confidenceAfter: 0.72,
};
