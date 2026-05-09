import type { HypothesisOutput } from "../schemas/offer";

export const CACHED_HYPOTHESIS: HypothesisOutput = {
  title: "Agency Follow-Up Engine",
  productSummary:
    "Drafts personalized follow-ups from discovery-call notes so agency founders stop losing warm inbound leads.",
  icpGuess: "Founders of 5-25 person service agencies handling inbound leads",
  likelyBuyer: "Agency owner or managing partner",
  likelyUser: "Agency owner or head of new business",
  champion: "Operations lead or a frustrated senior account manager",
  painClaim:
    "Warm leads from discovery calls go quiet because the second follow-up never gets sent.",
  proofPoint: "none yet",
  desiredCta: "15-minute fit check",
  messageAngles: [
    {
      name: "Missed-revenue framing",
      hypothesis:
        "Agency owners respond better to lost-revenue framing than to AI automation framing.",
    },
    {
      name: "Implementation-light",
      hypothesis:
        "Tool-fatigued operators only engage when the message says 'no setup, we draft, you approve.'",
    },
    {
      name: "Pipeline recovery",
      hypothesis:
        "Growth-focused founders respond more to pipeline-recovery framing than to time-savings framing.",
    },
    {
      name: "Trust-first proof",
      hypothesis:
        "Trust-first buyers need a human-in-the-loop framing before they will open an automation conversation.",
    },
  ],
  riskyAssumptions: [
    "Agency owners actually feel the pain of dropped follow-ups (vs. accepting it as normal).",
    "Agency owners are willing to let an AI draft messages on their voice.",
    "The pain is acute enough that 'we draft, you approve' beats 'we send for you'.",
    "Discovery-call notes exist in a usable form, not just in someone's head.",
  ],
};
