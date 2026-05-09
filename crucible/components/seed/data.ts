import type {
  Archetype,
  ArchetypeAccuracy,
  CalibrationCell,
  NextCohortPlan,
  Offer,
  OutboundEmail,
  PersonaUpdate,
  Prospect,
  ReplyAnalysis,
} from "./types";

export const DEMO_OFFER_ID = "ofr_agency_followup";

export const offer: Offer = {
  id: DEMO_OFFER_ID,
  title: "Lead Recovery for Agencies",
  productSummary:
    "We help small agencies automatically follow up with inbound leads who go quiet after a discovery call. We read your call notes and draft personalized follow-ups so founders stop losing warm prospects.",
  icpGuess: "Boutique digital and creative agencies, 5-25 people, founder-led sales.",
  likelyBuyer: "Agency founder or managing partner",
  likelyUser: "Agency founder, account lead, or ops manager",
  champion: "Operations lead who feels the missed-revenue pain weekly",
  painClaim: "Warm leads go quiet after the discovery call and never get a second touch.",
  proofPoint: "Pilot agencies recovered 1-3 stalled deals per month within the first 30 days.",
  desiredCta: "15-minute fit check this week",
  tone: "founder-led",
  messageAngles: [
    "Missed revenue, not AI automation",
    "We draft, you approve",
    "Pipeline recovery beats new top-of-funnel",
  ],
  riskyAssumptions: [
    "Agencies actually log structured call notes after discovery calls",
    "Founders will trust an AI draft enough to send it",
    "Implementation effort is the real blocker, not pricing",
  ],
};

export const archetypes: Archetype[] = [
  {
    id: "arc_overworked_owner",
    name: "Overworked Agency Owner",
    version: 1,
    segment: "Boutique agency, 5-15 people",
    role: "Founder / Managing Partner",
    description:
      "Wears every hat. Sales, delivery, hiring. Discovery calls happen but follow-up is the first thing to fall off.",
    predictedReplyLikelihood: 0.34,
    topObjection: "No bandwidth to evaluate another tool",
    bestAngle: "Missed revenue, not new top-of-funnel",
    confidence: "medium",
    riskTolerance: "medium",
    buyingPower: "high",
    predictedObjections: ["No bandwidth", "Already tried sequencers", "Trust in AI"],
    preferredAngles: ["Missed revenue", "We draft, you approve"],
    dislikedPhrases: ["AI-powered", "10x your outbound"],
  },
  {
    id: "arc_skeptical_solo",
    name: "Skeptical Solo Consultant",
    version: 1,
    segment: "Solo consultant or 2-3 person shop",
    role: "Independent Consultant",
    description:
      "Has been burned by tools. High taste, low patience, low budget. Will reply if you respect their time.",
    predictedReplyLikelihood: 0.18,
    topObjection: "Tools never live up to the marketing",
    bestAngle: "Specific outcome, no fluff",
    confidence: "low",
    riskTolerance: "low",
    buyingPower: "low",
    predictedObjections: ["Skepticism of AI claims", "Pricing", "Setup time"],
    preferredAngles: ["Specific outcome", "Plain-language proof"],
    dislikedPhrases: ["Game-changing", "Revolutionary"],
  },
  {
    id: "arc_ops_studio",
    name: "Ops-Minded Studio Manager",
    version: 1,
    segment: "Design / dev studio, 10-25 people",
    role: "Operations Manager / COO",
    description:
      "Owns the CRM, owns the process. Cares about clean handoffs and reporting more than copy.",
    predictedReplyLikelihood: 0.42,
    topObjection: "Has to fit our pipeline stages",
    bestAngle: "Process fit, predictable handoff",
    confidence: "high",
    riskTolerance: "medium",
    buyingPower: "medium",
    predictedObjections: ["Process fit", "Reporting", "Permissions"],
    preferredAngles: ["Process fit", "Predictable handoff"],
    dislikedPhrases: ["Set it and forget it"],
  },
  {
    id: "arc_growth_founder",
    name: "Growth-Focused Founder",
    version: 1,
    segment: "Performance / growth agency, 8-20 people",
    role: "Founder",
    description:
      "Thinks in pipeline numbers. Will engage if you show stalled-deal recovery, not generic follow-up.",
    predictedReplyLikelihood: 0.46,
    topObjection: "Show me the pipeline math",
    bestAngle: "Stalled-deal recovery math",
    confidence: "high",
    riskTolerance: "high",
    buyingPower: "high",
    predictedObjections: ["Attribution", "Pipeline math", "Comparison vs Apollo"],
    preferredAngles: ["Pipeline recovery", "Quantified outcome"],
    dislikedPhrases: ["Top-of-funnel automation"],
  },
  {
    id: "arc_tool_fatigued",
    name: "Tool-Fatigued Operator",
    version: 1,
    segment: "Mid-size agency, 15-30 people",
    role: "Head of Ops / RevOps",
    description:
      "Has bought too many tools that promised the moon. Will not engage with anything that smells like another platform to roll out.",
    predictedReplyLikelihood: 0.22,
    topObjection: "Pricing and procurement friction",
    bestAngle: "Cheaper than your current stack",
    confidence: "medium",
    riskTolerance: "low",
    buyingPower: "medium",
    predictedObjections: ["Pricing", "Yet another tool", "Procurement"],
    preferredAngles: ["ROI vs current stack", "No long contract"],
    dislikedPhrases: ["Automation platform", "All-in-one"],
    hasUpdatedVersion: true,
  },
  {
    id: "arc_budget_sensitive",
    name: "Budget-Sensitive Operator",
    version: 1,
    segment: "Small agency, 5-10 people",
    role: "Owner / Operator",
    description: "Every dollar is scrutinized. Will reply only if the ROI is obvious in the subject line.",
    predictedReplyLikelihood: 0.16,
    topObjection: "Cost vs incremental revenue",
    bestAngle: "Pay-after-recovery framing",
    confidence: "low",
    riskTolerance: "low",
    buyingPower: "low",
    predictedObjections: ["Cost", "Lock-in", "Hidden fees"],
    preferredAngles: ["Outcome-priced", "Free pilot"],
    dislikedPhrases: ["Enterprise-grade"],
  },
  {
    id: "arc_trust_first",
    name: "Trust-First Buyer",
    version: 1,
    segment: "Established agency, 12-25 people",
    role: "Founder / Partner",
    description:
      "Cares about brand voice and client trust above all. Will not allow auto-send of anything to clients.",
    predictedReplyLikelihood: 0.31,
    topObjection: "Risk to client relationship",
    bestAngle: "Human-approved drafts only",
    confidence: "medium",
    riskTolerance: "low",
    buyingPower: "high",
    predictedObjections: ["Auto-send risk", "Brand voice", "Compliance"],
    preferredAngles: ["Drafts you approve", "Voice match"],
    dislikedPhrases: ["Hands-off", "Auto-send"],
  },
  {
    id: "arc_wrong_person",
    name: "Wrong-Person Gatekeeper",
    version: 1,
    segment: "Any agency, mis-titled in CSV",
    role: "EA / Office Manager",
    description: "Will forward, will reply 'wrong person', or will ignore. Useful signal for ICP miss.",
    predictedReplyLikelihood: 0.09,
    topObjection: "Not the decision maker",
    bestAngle: "Easy forward to the right person",
    confidence: "high",
    riskTolerance: "low",
    buyingPower: "low",
    predictedObjections: ["Wrong person"],
    preferredAngles: ["Easy forward"],
    dislikedPhrases: ["You should consider"],
  },
  {
    id: "arc_competitor_locked",
    name: "Competitor-Locked Buyer",
    version: 1,
    segment: "Any agency",
    role: "Founder / Ops",
    description: "Already on a competitor. Will reply only if a sharp differentiator exists.",
    predictedReplyLikelihood: 0.21,
    topObjection: "Already use HubSpot Sequences / Apollo",
    bestAngle: "Specific gap in current tool",
    confidence: "medium",
    riskTolerance: "medium",
    buyingPower: "medium",
    predictedObjections: ["Already covered", "Switching cost"],
    preferredAngles: ["Specific gap", "Run alongside, not instead of"],
    dislikedPhrases: ["Better than X"],
  },
  {
    id: "arc_interested_later",
    name: "Interested-But-Later Buyer",
    version: 1,
    segment: "Agency in transition",
    role: "Founder / Ops",
    description: "Engaged tone, polite, will not commit now. Useful nurture signal.",
    predictedReplyLikelihood: 0.38,
    topObjection: "Bad timing right now",
    bestAngle: "Light nurture, no pressure",
    confidence: "medium",
    riskTolerance: "medium",
    buyingPower: "medium",
    predictedObjections: ["Timing", "Internal priorities"],
    preferredAngles: ["Stay in touch", "Quick value share"],
    dislikedPhrases: ["Last chance"],
  },
];

const PROSPECT_FIRST = [
  "Maya", "Daniel", "Priya", "Marcus", "Lena", "Theo", "Aiyana", "Jonas",
  "Nadia", "Felix", "Camila", "Owen", "Sofia", "Hiro", "Eliza", "Kojo",
  "Anya", "Bram", "Yusuf", "Iris", "Reza", "Tessa", "Kai", "Noor",
];
const PROSPECT_LAST = [
  "Okafor", "Bell", "Iyer", "Reyes", "Arnesen", "Whitlock", "Begay", "Pereira",
  "Haddad", "Moreau", "Vega", "Calder", "Petrov", "Nakamura", "Ben-David", "Mensah",
  "Volkov", "de Vries", "Karim", "Lindgren", "Shahidi", "Holt", "Sato", "Khan",
];
const COMPANIES = [
  "Northstar Studio", "Peak Lane", "Holm & Co", "Glasshouse Labs", "Atlas Forge",
  "Beacon Creative", "Loom Partners", "Caldera Group", "Tilt Agency", "Field & Frame",
  "Rivulet Studio", "Cobalt Hill", "Marlow Works", "Cinder Co", "Borealis Co",
  "Salt Pier", "Gradient Studio", "Hold Steady Co", "Outfit Lane", "Quartz Group",
  "Sequoia Lane", "Telegraph Studio", "Untitled Studio", "Verse Agency",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

const matchTemplates: Array<{
  archetypeId: string;
  archetypeName: string;
  confidence: number;
  signals: string[];
  predictedObjection: string;
  recommendedAngle: string;
  riskFlags: string[];
}> = [
  {
    archetypeId: "arc_overworked_owner",
    archetypeName: "Overworked Agency Owner",
    confidence: 0.82,
    signals: ["Founder title", "5-15 employees", "Notes mention 'too many hats'"],
    predictedObjection: "No bandwidth to evaluate another tool",
    recommendedAngle: "Missed revenue, we draft you approve",
    riskFlags: [],
  },
  {
    archetypeId: "arc_growth_founder",
    archetypeName: "Growth-Focused Founder",
    confidence: 0.78,
    signals: ["Performance agency", "Pipeline language in trigger"],
    predictedObjection: "Show me the pipeline math",
    recommendedAngle: "Stalled-deal recovery quantified",
    riskFlags: [],
  },
  {
    archetypeId: "arc_ops_studio",
    archetypeName: "Ops-Minded Studio Manager",
    confidence: 0.71,
    signals: ["Operations title", "Owns CRM"],
    predictedObjection: "Has to fit our pipeline stages",
    recommendedAngle: "Predictable handoff into your stages",
    riskFlags: [],
  },
  {
    archetypeId: "arc_tool_fatigued",
    archetypeName: "Tool-Fatigued Operator",
    confidence: 0.69,
    signals: ["RevOps title", "Mentions stack consolidation"],
    predictedObjection: "Pricing and procurement friction",
    recommendedAngle: "Cheaper than current stack, no long contract",
    riskFlags: ["Possible procurement gate"],
  },
  {
    archetypeId: "arc_skeptical_solo",
    archetypeName: "Skeptical Solo Consultant",
    confidence: 0.64,
    signals: ["Solo consultant", "No team listed"],
    predictedObjection: "Tools never live up to the marketing",
    recommendedAngle: "Specific outcome with plain-language proof",
    riskFlags: ["Low buying power"],
  },
  {
    archetypeId: "arc_trust_first",
    archetypeName: "Trust-First Buyer",
    confidence: 0.74,
    signals: ["Established brand", "Notes mention client trust"],
    predictedObjection: "Risk to client relationship",
    recommendedAngle: "Drafts you approve, never auto-send",
    riskFlags: [],
  },
  {
    archetypeId: "arc_competitor_locked",
    archetypeName: "Competitor-Locked Buyer",
    confidence: 0.58,
    signals: ["Mentions HubSpot in notes"],
    predictedObjection: "Already use HubSpot Sequences",
    recommendedAngle: "Run alongside HubSpot, fill the follow-up gap",
    riskFlags: ["Switching cost"],
  },
  {
    archetypeId: "arc_interested_later",
    archetypeName: "Interested-But-Later Buyer",
    confidence: 0.61,
    signals: ["In transition", "Recent funding round"],
    predictedObjection: "Bad timing right now",
    recommendedAngle: "Light nurture, no pressure",
    riskFlags: [],
  },
  {
    archetypeId: "arc_budget_sensitive",
    archetypeName: "Budget-Sensitive Operator",
    confidence: 0.55,
    signals: ["Small agency", "Owner-operator"],
    predictedObjection: "Cost vs incremental revenue",
    recommendedAngle: "Outcome-priced framing",
    riskFlags: ["Low buying power"],
  },
  {
    archetypeId: "arc_wrong_person",
    archetypeName: "Wrong-Person Gatekeeper",
    confidence: 0.42,
    signals: ["Title mismatch", "Office manager"],
    predictedObjection: "Not the decision maker",
    recommendedAngle: "Easy forward to the right person",
    riskFlags: ["ICP miss"],
  },
];

export const prospects: Prospect[] = Array.from({ length: 24 }, (_, i) => {
  const m = matchTemplates[i % matchTemplates.length]!;
  const first = pick(PROSPECT_FIRST, i);
  const last = pick(PROSPECT_LAST, i + 3);
  const company = pick(COMPANIES, i);
  return {
    id: `prs_${i + 1}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@${company
      .toLowerCase()
      .replace(/[^a-z]/g, "")}.com`,
    title:
      i % 4 === 0
        ? "Founder"
        : i % 4 === 1
        ? "Head of Ops"
        : i % 4 === 2
        ? "Managing Partner"
        : "RevOps Lead",
    company,
    industry: i % 3 === 0 ? "Creative" : i % 3 === 1 ? "Performance Marketing" : "Design / Dev Studio",
    companySize: i % 3 === 0 ? "6-15" : i % 3 === 1 ? "16-30" : "31-60",
    trigger:
      i % 5 === 0
        ? "Posted about pipeline leak last week"
        : i % 5 === 1
        ? "Hiring a sales lead on LinkedIn"
        : i % 5 === 2
        ? "Recent rebrand"
        : i % 5 === 3
        ? "Featured in agency newsletter"
        : "Booked discovery call last Tuesday",
    notes:
      i % 3 === 0
        ? "Discovery call notes mention follow-up gaps"
        : i % 3 === 1
        ? "Uses HubSpot, frustrated with sequencing"
        : "Owner-operator, very lean stack",
    match: {
      archetypeId: m.archetypeId,
      archetypeName: m.archetypeName,
      confidence: Math.min(0.95, m.confidence + ((i % 5) - 2) * 0.03),
      matchedSignals: m.signals,
      predictedObjection: m.predictedObjection,
      recommendedAngle: m.recommendedAngle,
      riskFlags: m.riskFlags,
    },
  };
});

export const outboundEmails: OutboundEmail[] = [
  {
    id: "eml_1",
    prospectId: "prs_1",
    archetypeId: "arc_overworked_owner",
    hypothesis:
      "Overworked agency owners respond better to missed-revenue framing than to AI automation framing.",
    angle: "Missed revenue, not AI automation",
    subject: "the second follow-up most agencies forget",
    body:
      "Maya - quick one. Agencies your size usually lose 1-3 warm deals a month not because the pitch was wrong, but because the second follow-up never went out. We draft those follow-ups from your call notes so you can approve and send in under a minute. Worth a 15-minute fit check this week?",
    predictedReplyLikelihood: 0.34,
    predictedObjection: "No bandwidth",
    ctaQuality: 8,
    complianceWarnings: [],
    approved: true,
    status: "approved",
  },
  {
    id: "eml_2",
    prospectId: "prs_2",
    archetypeId: "arc_growth_founder",
    hypothesis: "Growth-focused founders engage on stalled-deal pipeline math.",
    angle: "Pipeline recovery math",
    subject: "what 3 stalled deals a month is worth to you",
    body:
      "Daniel - if your pipeline is anything like the agencies we work with, three discovery-call deals a month go quiet and never get a real second touch. We draft those from your call notes so you stop losing them. Open to a 15-min fit check?",
    predictedReplyLikelihood: 0.46,
    predictedObjection: "Show me the pipeline math",
    ctaQuality: 9,
    complianceWarnings: [],
    approved: true,
    status: "approved",
  },
  {
    id: "eml_3",
    prospectId: "prs_3",
    archetypeId: "arc_ops_studio",
    hypothesis: "Ops-minded buyers will engage when handoff and process fit are visible upfront.",
    angle: "Process fit",
    subject: "fits between discovery and proposal in your CRM",
    body:
      "Priya - this lives between your discovery and proposal stages, not in place of either. Reads call notes, drafts the next touch, hands back to your CRM. Worth a 15-min walk-through?",
    predictedReplyLikelihood: 0.42,
    predictedObjection: "Has to fit our pipeline stages",
    ctaQuality: 8,
    complianceWarnings: [],
    approved: false,
    status: "draft",
  },
  {
    id: "eml_4",
    prospectId: "prs_4",
    archetypeId: "arc_tool_fatigued",
    hypothesis: "Tool-fatigued operators respond to pricing/ROI vs current stack.",
    angle: "Cheaper than current stack",
    subject: "probably cheaper than the seat you don't use",
    body:
      "Marcus - I know you've heard pitches like this. Short version: this slots between your CRM and Gmail, drafts the second follow-up from your call notes, and costs less than one underused seat in your current stack. 15-min fit check?",
    predictedReplyLikelihood: 0.22,
    predictedObjection: "Pricing and procurement friction",
    ctaQuality: 7,
    complianceWarnings: ["Pricing claim - verify before send"],
    approved: false,
    status: "draft",
  },
  {
    id: "eml_5",
    prospectId: "prs_5",
    archetypeId: "arc_skeptical_solo",
    hypothesis: "Skeptical solos engage with one specific outcome and no marketing language.",
    angle: "Specific outcome",
    subject: "one stalled deal a month",
    body:
      "Lena - one outcome: recover one stalled discovery-call deal a month. We read your call notes and draft the follow-up. You approve in Gmail. That is the whole product. 15-min fit check this week?",
    predictedReplyLikelihood: 0.18,
    predictedObjection: "Tools never live up to the marketing",
    ctaQuality: 9,
    complianceWarnings: [],
    approved: true,
    status: "approved",
  },
  {
    id: "eml_6",
    prospectId: "prs_6",
    archetypeId: "arc_trust_first",
    hypothesis: "Trust-first buyers need explicit human approval framing before they engage.",
    angle: "Drafts you approve",
    subject: "drafts you approve - never auto-send",
    body:
      "Theo - we never send anything to your clients. We draft the second follow-up from your call notes, you approve it in Gmail, you send it. Brand voice match is the first thing we tune. 15-min fit check?",
    predictedReplyLikelihood: 0.31,
    predictedObjection: "Risk to client relationship",
    ctaQuality: 8,
    complianceWarnings: [],
    approved: false,
    status: "draft",
  },
  {
    id: "eml_7",
    prospectId: "prs_7",
    archetypeId: "arc_competitor_locked",
    hypothesis: "Competitor-locked buyers respond when positioned as adjacent, not replacement.",
    angle: "Run alongside",
    subject: "the gap HubSpot Sequences leaves",
    body:
      "Aiyana - HubSpot Sequences nails templated outreach. The gap is the personalized second touch from a real discovery call. We fill that, hand back to HubSpot. 15-min fit check?",
    predictedReplyLikelihood: 0.21,
    predictedObjection: "Already use HubSpot Sequences",
    ctaQuality: 7,
    complianceWarnings: [],
    approved: false,
    status: "draft",
  },
  {
    id: "eml_8",
    prospectId: "prs_8",
    archetypeId: "arc_interested_later",
    hypothesis: "Interested-later buyers engage on light nurture without commitment language.",
    angle: "Light nurture",
    subject: "no ask - sharing what worked for similar studios",
    body:
      "Jonas - no ask. Sharing a one-pager on the second-follow-up pattern that recovered 1-3 stalled deals/month for studios in transition like yours. Useful?",
    predictedReplyLikelihood: 0.38,
    predictedObjection: "Bad timing right now",
    ctaQuality: 6,
    complianceWarnings: [],
    approved: false,
    status: "draft",
  },
];

export const replyAnalyses: ReplyAnalysis[] = [
  {
    id: "rep_1",
    emailId: "eml_1",
    prospectId: "prs_1",
    sender: "maya.bell@northstarstudio.com",
    rawSnippet:
      "Interesting - but the real blocker is setup time. Last tool took us a week to wire in. If you can show me a 30-min setup, I'll bite.",
    predictedOutcome: "pricing_objection",
    actualOutcome: "implementation_objection",
    predictedObjection: "No bandwidth / pricing",
    actualObjection: "Setup time / implementation",
    predictionWasCorrect: false,
    parserConfidence: 0.86,
    volunteeredInfo: ["Cares about setup time", "Open if implementation is light"],
  },
  {
    id: "rep_2",
    emailId: "eml_2",
    prospectId: "prs_2",
    sender: "daniel.iyer@peaklane.com",
    rawSnippet: "Yes - send a 15-min slot. Pipeline recovery is exactly what I'm focused on this quarter.",
    predictedOutcome: "positive",
    actualOutcome: "positive",
    predictedObjection: "Pipeline math",
    actualObjection: "None - asked for slot",
    predictionWasCorrect: true,
    parserConfidence: 0.94,
    volunteeredInfo: ["Quarter goal: pipeline recovery"],
  },
  {
    id: "rep_3",
    emailId: "eml_4",
    prospectId: "prs_4",
    sender: "marcus.reyes@glasshouselabs.com",
    rawSnippet:
      "Honestly - it's not about the price. We just don't have time to onboard another tool. Ping me in Q3.",
    predictedOutcome: "pricing_objection",
    actualOutcome: "implementation_objection",
    predictedObjection: "Pricing",
    actualObjection: "Setup / implementation time",
    predictionWasCorrect: false,
    parserConfidence: 0.91,
    volunteeredInfo: ["Open in Q3", "Onboarding time is the blocker"],
  },
  {
    id: "rep_4",
    emailId: "eml_5",
    prospectId: "prs_5",
    sender: "lena.arnesen@atlasforge.com",
    rawSnippet: "Like the framing. Send the link.",
    predictedOutcome: "no_reply",
    actualOutcome: "positive",
    predictedObjection: "Skepticism",
    actualObjection: "None",
    predictionWasCorrect: false,
    parserConfidence: 0.88,
    volunteeredInfo: ["Liked plain-language framing"],
  },
  {
    id: "rep_5",
    emailId: "eml_6",
    prospectId: "prs_6",
    sender: "theo.whitlock@beaconcreative.com",
    rawSnippet:
      "Appreciate the no auto-send line - that's what kills these for us usually. Curious. What's the setup look like?",
    predictedOutcome: "trust_objection",
    actualOutcome: "implementation_objection",
    predictedObjection: "Auto-send risk",
    actualObjection: "Setup time",
    predictionWasCorrect: false,
    parserConfidence: 0.89,
    volunteeredInfo: ["Trust framing landed", "Asks about setup"],
  },
  {
    id: "rep_6",
    emailId: "eml_7",
    prospectId: "prs_7",
    sender: "aiyana.begay@loompartners.com",
    rawSnippet: "We're locked into HubSpot for at least 12 more months. Try me next year.",
    predictedOutcome: "competitor_locked",
    actualOutcome: "competitor_locked",
    predictedObjection: "Already use HubSpot",
    actualObjection: "Locked-in contract",
    predictionWasCorrect: true,
    parserConfidence: 0.93,
    volunteeredInfo: ["12-month lock-in"],
  },
  {
    id: "rep_7",
    emailId: "eml_8",
    prospectId: "prs_8",
    sender: "jonas.pereira@caldera.com",
    rawSnippet: "One-pager looks useful. Not buying anything this quarter though.",
    predictedOutcome: "interested_later",
    actualOutcome: "interested_later",
    predictedObjection: "Timing",
    actualObjection: "Timing - not this quarter",
    predictionWasCorrect: true,
    parserConfidence: 0.92,
    volunteeredInfo: ["Open next quarter"],
  },
  {
    id: "rep_8",
    emailId: "eml_3",
    prospectId: "prs_3",
    sender: "priya.iyer@holm.com",
    rawSnippet: "",
    predictedOutcome: "positive",
    actualOutcome: "no_reply",
    predictedObjection: "Process fit",
    actualObjection: "—",
    predictionWasCorrect: false,
    parserConfidence: 0.42,
    volunteeredInfo: [],
  },
];

// Confusion matrix: predicted (rows) vs actual (cols), counts.
// Used by prediction-actual-matrix component.
export const calibrationMatrix: CalibrationCell[] = [
  { predicted: "pricing_objection", actual: "implementation_objection", count: 2 },
  { predicted: "pricing_objection", actual: "pricing_objection", count: 0 },
  { predicted: "trust_objection", actual: "implementation_objection", count: 1 },
  { predicted: "trust_objection", actual: "trust_objection", count: 0 },
  { predicted: "no_reply", actual: "positive", count: 1 },
  { predicted: "positive", actual: "positive", count: 1 },
  { predicted: "positive", actual: "no_reply", count: 1 },
  { predicted: "competitor_locked", actual: "competitor_locked", count: 1 },
  { predicted: "interested_later", actual: "interested_later", count: 1 },
];

export const archetypeAccuracy: ArchetypeAccuracy[] = [
  {
    archetypeId: "arc_overworked_owner",
    archetypeName: "Overworked Agency Owner",
    sentCount: 1,
    correctCount: 0,
    accuracy: 0.0,
    shouldUpdate: false,
    triggerReason: "Below 5 sent - not enough evidence",
  },
  {
    archetypeId: "arc_growth_founder",
    archetypeName: "Growth-Focused Founder",
    sentCount: 1,
    correctCount: 1,
    accuracy: 1.0,
    shouldUpdate: false,
    triggerReason: "Holding up - keep angle",
  },
  {
    archetypeId: "arc_ops_studio",
    archetypeName: "Ops-Minded Studio Manager",
    sentCount: 1,
    correctCount: 0,
    accuracy: 0.0,
    shouldUpdate: false,
    triggerReason: "Below 5 sent - not enough evidence",
  },
  {
    archetypeId: "arc_tool_fatigued",
    archetypeName: "Tool-Fatigued Operator",
    sentCount: 6,
    correctCount: 1,
    accuracy: 0.17,
    shouldUpdate: true,
    triggerReason:
      "Prediction accuracy 17% (< 65%) and unpredicted objection cluster (implementation) appeared in 4 of 6 replies.",
  },
  {
    archetypeId: "arc_skeptical_solo",
    archetypeName: "Skeptical Solo Consultant",
    sentCount: 1,
    correctCount: 0,
    accuracy: 0.0,
    shouldUpdate: false,
    triggerReason: "Below 5 sent - not enough evidence",
  },
  {
    archetypeId: "arc_trust_first",
    archetypeName: "Trust-First Buyer",
    sentCount: 1,
    correctCount: 0,
    accuracy: 0.0,
    shouldUpdate: false,
    triggerReason: "Below 5 sent - not enough evidence",
  },
  {
    archetypeId: "arc_competitor_locked",
    archetypeName: "Competitor-Locked Buyer",
    sentCount: 1,
    correctCount: 1,
    accuracy: 1.0,
    shouldUpdate: false,
    triggerReason: "Holding up - keep angle",
  },
  {
    archetypeId: "arc_interested_later",
    archetypeName: "Interested-But-Later Buyer",
    sentCount: 1,
    correctCount: 1,
    accuracy: 1.0,
    shouldUpdate: false,
    triggerReason: "Holding up - keep angle",
  },
];

export const personaUpdate: PersonaUpdate = {
  archetypeId: "arc_tool_fatigued",
  fromVersion: 1,
  toVersion: 2,
  added: [
    "I do not have time to set up another tool.",
    "Prefers 'we draft, you approve' framing.",
    "Prefers implementation-light messaging.",
    "Responds better to '15-min fit check' than 'book a demo'.",
  ],
  removed: [
    "Over-weighted pricing objection.",
    "Disliked 'automation platform' (still true, but pricing is no longer the lead objection).",
  ],
  newConfidence: "high",
  reason:
    "4 of 6 replies on this archetype objected to setup/implementation time, not price. Pricing-led framing is producing low-quality replies.",
  newPredictedObjections: [
    "Implementation / setup time",
    "Yet another tool to onboard",
    "Cost (secondary, not primary)",
  ],
  newPreferredAngles: [
    "30-minute setup, no IT lift",
    "We draft, you approve in Gmail",
    "Run alongside your current stack",
  ],
  phrasesToUse: ["30-min setup", "we draft, you approve", "fit check", "no rollout"],
  phrasesToAvoid: ["automation platform", "all-in-one", "rollout", "implementation phase"],
};

export const nextCohortPlan: NextCohortPlan = {
  summary:
    "Cohort 2 leads with implementation-light language and the 'we draft, you approve' framing. Pricing language is removed from the subject line entirely.",
  changesFromPreviousCohort: [
    "Subject line no longer leads with cost.",
    "Body opens with setup time, not pricing.",
    "CTA changed from 'book a demo' to '15-min fit check'.",
    "Tool-Fatigued Operator angle rewritten end-to-end.",
  ],
  segmentsToDoubleDown: ["Tool-Fatigued Operator v2", "Growth-Focused Founder", "Interested-But-Later"],
  segmentsToPause: ["Wrong-Person Gatekeeper", "Budget-Sensitive Operator (until pricing page lands)"],
  revisedHypothesis:
    "Tool-fatigued operators object to setup time more than to price. Lead with '30-min setup, no rollout' and the 'we draft, you approve' guarantee.",
  successMetric: "Reply rate >= 22% on Tool-Fatigued Operator with non-objection or implementation-objection only.",
  killCriterion: "If reply rate < 12% after 8 sends, retire the archetype and reassign prospects.",
  beforeEmail: {
    subject: "AI follow-up automation for agencies",
    body:
      "Marcus - we built an AI follow-up automation platform for agencies. It plugs into your CRM and runs sequences automatically. Pricing starts at $X/seat. Want to book a demo?",
  },
  afterEmail: {
    subject: "never lose a warm lead because you forgot the second follow-up",
    body:
      "Marcus - we draft the second follow-up from your discovery call notes. You approve it in Gmail in under a minute. Setup takes about 30 minutes - no IT lift, no rollout. Worth a 15-min fit check this week?",
  },
};
