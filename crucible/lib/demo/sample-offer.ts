export const SAMPLE_OFFER = {
  rawFounderInput:
    "We help small agencies automatically follow up with inbound leads who go quiet after a discovery call. It reads call notes and drafts personalized follow-ups so founders stop losing warm prospects.",
  title: "Follow-up Copilot for Agencies",
  productSummary:
    "Reads agency call notes, drafts personalized follow-ups for quiet inbound leads, and asks the founder to approve before sending.",
  icpGuess: "Founders of 5-25 person agencies that take inbound discovery calls.",
  desiredCta: "15-minute fit check call",
  tone: "founder-led" as const,
  painClaim:
    "Warm inbound leads go cold because founders forget the second follow-up between client work.",
  proofPoint:
    "Three pilot agencies recovered 11-18% of stale inbound leads in the first three weeks.",
  likelyBuyer: "Agency owner / managing director",
  likelyUser: "Agency owner or growth lead",
  champion: "Operations manager",
  messageAngles: [
    "Pipeline recovery, not new outbound",
    "We draft, you approve",
    "Implementation-light, no new tool to learn",
  ],
  riskyAssumptions: [
    "Agencies treat warm leads going quiet as a real revenue problem.",
    "Founders prefer drafting copilot over fully automated send.",
    "15-minute fit check converts better than book-a-demo.",
  ],
};

export const SAMPLE_HYPOTHESES = [
  "Agency owners respond better to missed-revenue framing than AI automation framing.",
  "Tool-fatigued operators need low-implementation language before they engage.",
  "Growth-focused founders respond to pipeline recovery more than time savings.",
  "Trust-first buyers need proof and human approval before automation language.",
];
