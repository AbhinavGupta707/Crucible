import type { ReplyOutcome } from "../db/types";

export type DemoReply = {
  // Match by archetype hint or by prospect email; whichever is in scope.
  prospectEmail: string;
  archetypeHint: string;
  rawText: string;
  outcome: ReplyOutcome;
  sentiment: "positive" | "neutral" | "negative";
  objectionType: string | null;
  funnelStage: string;
  volunteeredInfo: string[];
  // Used for predicted-vs-actual: was the email-level prediction correct?
  // Filled in at replay time using each email's predictedObjection.
  confidence: number;
};

// 8 replies covering positive, soft interest, mismatch, and hard negatives.
// At least three Tool-Fatigued Operator replies show the seeded mismatch:
// predicted pricing objection vs actual implementation/timing objection.
export const SAMPLE_REPLIES: DemoReply[] = [
  {
    prospectEmail: "sloane@junipergroup.test",
    archetypeHint: "Tool-Fatigued Operator",
    rawText:
      "Honestly the pricing is fine. What kills me is onboarding. Last tool we tried took six weeks before it was useful. I do not have time to set up another tool.",
    outcome: "trust_objection",
    sentiment: "negative",
    objectionType: "implementation_effort",
    funnelStage: "discovery",
    volunteeredInfo: ["Onboarding effort is the deal-breaker, not pricing."],
    confidence: 0.85,
  },
  {
    prospectEmail: "marcus@harborgrove.test",
    archetypeHint: "Tool-Fatigued Operator",
    rawText:
      "Cost is not the issue. Implementation is. We do not have engineering bandwidth this half. If this were a 15-min fit check and you handled the setup, maybe.",
    outcome: "interested_later",
    sentiment: "neutral",
    objectionType: "implementation_effort",
    funnelStage: "consideration",
    volunteeredInfo: ["No engineering bandwidth", "Open to a 15-min fit check"],
    confidence: 0.8,
  },
  {
    prospectEmail: "quinn@walterspartners.test",
    archetypeHint: "Tool-Fatigued Operator",
    rawText:
      "Have heard this pitch before. Pricing aside, the issue is always the time-to-first-value. If you can show me a working draft in 24 hours, I will listen.",
    outcome: "interested_later",
    sentiment: "neutral",
    objectionType: "implementation_effort",
    funnelStage: "consideration",
    volunteeredInfo: ["Time-to-first-value is the gate", "Open to a working demo"],
    confidence: 0.78,
  },
  {
    prospectEmail: "ravi@latticegrowth.test",
    archetypeHint: "Growth-Focused Founder",
    rawText:
      "Yes, this is exactly the leak I am tracking. Send me a 10-min slot this week.",
    outcome: "positive",
    sentiment: "positive",
    objectionType: null,
    funnelStage: "ready",
    volunteeredInfo: ["Wants a 10-min slot this week"],
    confidence: 0.9,
  },
  {
    prospectEmail: "kai@compassgrowth.test",
    archetypeHint: "Growth-Focused Founder",
    rawText:
      "Interested. What is the actual recovery rate you have seen across pilot agencies?",
    outcome: "positive",
    sentiment: "positive",
    objectionType: null,
    funnelStage: "ready",
    volunteeredInfo: ["Wants pilot recovery numbers"],
    confidence: 0.85,
  },
  {
    prospectEmail: "elena@assist.test",
    archetypeHint: "Wrong-Person Gatekeeper",
    rawText: "Hi, I handle Karen's inbox. Please reach out to ops@brightlinegroup.test instead.",
    outcome: "wrong_person",
    sentiment: "neutral",
    objectionType: null,
    funnelStage: "redirect",
    volunteeredInfo: ["Correct contact: ops@brightlinegroup.test"],
    confidence: 0.95,
  },
  {
    prospectEmail: "felix@altitudepartners.test",
    archetypeHint: "Competitor-Locked Buyer",
    rawText:
      "Already on a 12-month contract with Followly. Worth a chat in November.",
    outcome: "competitor_locked",
    sentiment: "neutral",
    objectionType: "competitor_lock",
    funnelStage: "deferred",
    volunteeredInfo: ["Locked in until November", "Uses Followly"],
    confidence: 0.85,
  },
  {
    prospectEmail: "owen@petrovconsulting.test",
    archetypeHint: "Skeptical Solo Consultant",
    rawText:
      "Please remove me from this list. I do not engage with cold outbound about AI tools.",
    outcome: "unsubscribe",
    sentiment: "negative",
    objectionType: null,
    funnelStage: "out",
    volunteeredInfo: ["Unsubscribe request"],
    confidence: 0.99,
  },
];
