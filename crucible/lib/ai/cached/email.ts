import type { OutreachOutput } from "../schemas/email";

export const CACHED_OUTREACH: OutreachOutput = {
  hypothesis:
    "Tool-fatigued operators only engage when the message says 'no setup, we draft, you approve.'",
  angle: "Implementation-light (we draft, you approve)",
  subject: "Never lose a warm lead because you forgot the second follow-up",
  body: [
    "Hi Priya,",
    "",
    "Saw you rolled back HubSpot last quarter - so this is the opposite of another tool.",
    "",
    "We read your discovery-call notes and draft the second follow-up that usually never gets sent. You approve from your phone or skip it. No setup, no integration, no new login for the team.",
    "",
    "Worth a 15-minute fit check next week to see if it would have caught the leads that went quiet on you in April?",
    "",
    "- Sam",
  ].join("\n"),
  followUp1:
    "Following up - happy to send a 90-second Loom of the draft-and-approve flow on a real anonymized call note instead of a meeting if that's lighter.",
  followUp2:
    "Last note from me. If now is not the right time, I will check back at the start of Q3. If never, just reply 'never' and I'll close the loop.",
  predictedReplyLikelihood: 0.22,
  predictedObjection: "Pricing - we already pay for tools nobody uses.",
  cta: "15-minute fit check next week",
  complianceFooter: "",
  riskWarnings: [
    "Subject implies a specific pain - keep proof honest in body.",
  ],
};
