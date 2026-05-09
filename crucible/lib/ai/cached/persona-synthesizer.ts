import type { PersonaSynthesizerOutput } from "../schemas/archetype";

export const CACHED_PERSONA_SYNTHESIZER: PersonaSynthesizerOutput = {
  archetypes: [
    {
      name: "Overworked Agency Owner",
      segment: "5-15 person service agency",
      role: "Owner / Managing Partner",
      description:
        "Wears every hat. Takes the discovery call themselves. Forgets the second follow-up because Tuesday eats the calendar.",
      currentWorkflow:
        "Manual follow-ups in Gmail, Calendly link in signature, occasional CRM use that lapses after week two.",
      painIntensity: 5,
      buyingPower: "high",
      riskTolerance: "medium",
      voiceStyle: "Short, friendly, slightly harried.",
      predictedObjections: [
        "I do not have time to set up another tool.",
        "I want to keep my voice in every email.",
      ],
      preferredAngles: [
        "Missed-revenue framing",
        "Implementation-light (we draft, you approve)",
      ],
      dislikedPhrases: ["automation platform", "fully autonomous"],
      likelyReplyPatterns: [
        "Yes - what is involved on my end?",
        "Send me a 5-minute Loom.",
      ],
      predictedReplyLikelihood: 0.32,
      confidence: 0.7,
    },
    {
      name: "Skeptical Solo Consultant",
      segment: "Independent consultant",
      role: "Founder",
      description:
        "Allergic to tools that touch their voice. Will not let AI sound like them without proof.",
      currentWorkflow: "Inbox, Notion, occasional Loom. No CRM.",
      painIntensity: 3,
      buyingPower: "medium",
      riskTolerance: "low",
      voiceStyle: "Direct, terse, judgement-first.",
      predictedObjections: [
        "AI cannot match my voice.",
        "I do not want generic follow-ups going out under my name.",
      ],
      preferredAngles: ["Trust-first proof", "Voice-mirroring"],
      dislikedPhrases: ["AI-generated", "scale your outreach"],
      likelyReplyPatterns: [
        "Send a sample on my voice first.",
        "Pass.",
      ],
      predictedReplyLikelihood: 0.18,
      confidence: 0.6,
    },
    {
      name: "Ops-Minded Studio Manager",
      segment: "10-25 person creative or dev studio",
      role: "Operations / Studio Manager",
      description:
        "Owns process, not the cheque. Sees the dropped-follow-up problem clearly because they triage it weekly.",
      currentWorkflow:
        "HubSpot or Pipedrive, weekly pipeline review, Slack reminders to AMs.",
      painIntensity: 4,
      buyingPower: "medium",
      riskTolerance: "medium",
      voiceStyle: "Process-oriented, asks for evidence.",
      predictedObjections: [
        "How does this fit our existing pipeline review?",
        "Who owns the approval step?",
      ],
      preferredAngles: ["Pipeline recovery", "Implementation-light"],
      dislikedPhrases: ["replace your sales team"],
      likelyReplyPatterns: [
        "Can you show how this slots into HubSpot?",
        "Send a one-pager I can share with the partner.",
      ],
      predictedReplyLikelihood: 0.28,
      confidence: 0.65,
    },
    {
      name: "Growth-Focused Founder",
      segment: "Series-pre-seed agency or productized service",
      role: "Founder / CEO",
      description:
        "Talks in pipeline numbers. Cares about lift, not features.",
      currentWorkflow:
        "CRM with custom dashboards, weekly pipeline standup, growth ops contractor.",
      painIntensity: 4,
      buyingPower: "high",
      riskTolerance: "medium",
      voiceStyle: "Numbers-first, pragmatic.",
      predictedObjections: [
        "What lift do you typically see?",
        "How is this different from generic email automation?",
      ],
      preferredAngles: ["Pipeline recovery", "Missed-revenue framing"],
      dislikedPhrases: ["personalized at scale"],
      likelyReplyPatterns: [
        "What lift have you seen in similar agencies?",
        "Send the data.",
      ],
      predictedReplyLikelihood: 0.3,
      confidence: 0.65,
    },
    {
      name: "Tool-Fatigued Operator",
      segment: "10-30 person agency",
      role: "Operations or COO",
      description:
        "Has bought, churned from, or shelved at least three sales tools. Allergic to anything called a platform.",
      currentWorkflow:
        "Lightweight CRM + spreadsheets + Slack reminders. Killed the last tool because nobody used it.",
      painIntensity: 4,
      buyingPower: "medium",
      riskTolerance: "low",
      voiceStyle: "Tired, blunt, allergic to jargon.",
      predictedObjections: [
        "Pricing - we already pay for tools nobody uses.",
        "Implementation - I do not have time to roll this out.",
      ],
      preferredAngles: ["Implementation-light", "Voice-mirroring"],
      dislikedPhrases: ["automation platform", "all-in-one"],
      likelyReplyPatterns: [
        "How long until we see value?",
        "Not another tool.",
      ],
      predictedReplyLikelihood: 0.16,
      confidence: 0.6,
    },
    {
      name: "Budget-Sensitive Operator",
      segment: "5-15 person agency",
      role: "Owner-operator",
      description:
        "Bootstrap. Every monthly subscription gets justified line by line.",
      currentWorkflow: "Free tools, Google Workspace, careful spend control.",
      painIntensity: 3,
      buyingPower: "low",
      riskTolerance: "low",
      voiceStyle: "Thrifty, asks about price up front.",
      predictedObjections: [
        "How much per month?",
        "Is there a free trial?",
      ],
      preferredAngles: ["Missed-revenue framing"],
      dislikedPhrases: ["enterprise", "annual contract"],
      likelyReplyPatterns: [
        "How much?",
        "Not in budget right now.",
      ],
      predictedReplyLikelihood: 0.14,
      confidence: 0.55,
    },
    {
      name: "Trust-First Buyer",
      segment: "Regulated-industry agency (legal, finance)",
      role: "Founder",
      description:
        "Will not let AI write to clients without human review. Treats trust as the product.",
      currentWorkflow: "Manual everything, client approval per message, audit trail.",
      painIntensity: 3,
      buyingPower: "medium",
      riskTolerance: "low",
      voiceStyle: "Cautious, detailed.",
      predictedObjections: [
        "Trust - my clients cannot get AI-written emails.",
        "Audit and compliance.",
      ],
      preferredAngles: ["Trust-first proof", "Implementation-light"],
      dislikedPhrases: ["sends automatically", "no human in the loop"],
      likelyReplyPatterns: [
        "How is this reviewed before it goes out?",
        "What does the audit trail look like?",
      ],
      predictedReplyLikelihood: 0.2,
      confidence: 0.6,
    },
    {
      name: "Wrong-Person Gatekeeper",
      segment: "Mid-size agency",
      role: "Executive assistant or office manager",
      description:
        "Reads the founder's inbox. Forwards or deflects.",
      currentWorkflow: "Email triage, calendar, screening.",
      painIntensity: 1,
      buyingPower: "low",
      riskTolerance: "low",
      voiceStyle: "Polite, brief, directive.",
      predictedObjections: [
        "I am not the right person.",
        "Please contact via the website form.",
      ],
      preferredAngles: ["Direct ask"],
      dislikedPhrases: ["personalised", "warm intro"],
      likelyReplyPatterns: [
        "I will pass this along.",
        "Wrong person - try sales@.",
      ],
      predictedReplyLikelihood: 0.4,
      confidence: 0.55,
    },
    {
      name: "Competitor-Locked Buyer",
      segment: "Mid-size agency",
      role: "Owner",
      description:
        "Already on a competing follow-up tool with an annual contract. Not switching mid-cycle.",
      currentWorkflow: "Existing competitor tool, integrated CRM.",
      painIntensity: 2,
      buyingPower: "high",
      riskTolerance: "medium",
      voiceStyle: "Polite, decisive.",
      predictedObjections: [
        "We already use [competitor].",
        "Locked in until renewal.",
      ],
      preferredAngles: ["Differentiation", "Renewal-time pre-emption"],
      dislikedPhrases: ["switch in a day"],
      likelyReplyPatterns: [
        "Already using X.",
        "Ping me near our renewal.",
      ],
      predictedReplyLikelihood: 0.22,
      confidence: 0.6,
    },
    {
      name: "Interested-But-Later Buyer",
      segment: "Growth-stage agency",
      role: "Founder",
      description:
        "Curious but not in market this quarter. Will respond positively then go quiet.",
      currentWorkflow: "Manual follow-up, planning Q-next initiatives.",
      painIntensity: 3,
      buyingPower: "high",
      riskTolerance: "medium",
      voiceStyle: "Friendly, future-tense.",
      predictedObjections: [
        "Timing - revisit next quarter.",
        "Mid-implementation of something else.",
      ],
      preferredAngles: ["Pipeline recovery", "Light-touch nurture"],
      dislikedPhrases: ["this week only"],
      likelyReplyPatterns: [
        "Interesting - circle back in Q3?",
        "Bookmarking this.",
      ],
      predictedReplyLikelihood: 0.34,
      confidence: 0.6,
    },
  ],
};
