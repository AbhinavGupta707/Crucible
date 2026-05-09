// Shared domain types used by the API integration layer.
// Workstream 2 owns the Prisma schema; these mirror that shape so route
// handlers do not depend on Prisma directly. When real repositories land,
// the types stay (or are re-exported from generated client types).

export type Tone = "concise" | "founder-led" | "warm" | "direct" | "technical";

export type Offer = {
  id: string;
  workspaceId: string;
  title: string;
  productSummary: string;
  rawFounderInput: string;
  icpGuess: string;
  desiredCta: string;
  tone: Tone;
  painClaim: string;
  proofPoint: string;
  likelyBuyer: string;
  likelyUser: string;
  champion: string;
  messageAngles: string[];
  riskyAssumptions: string[];
  createdAt: string;
};

export type ArchetypeVersion = {
  id: string;
  archetypeId: string;
  versionNumber: number;
  reason: string | null;
  description: string;
  currentWorkflow: string;
  painIntensity: number;
  buyingPower: number;
  riskTolerance: number;
  voiceStyle: string;
  predictedObjections: string[];
  preferredAngles: string[];
  dislikedPhrases: string[];
  likelyReplyPatterns: string[];
  confidence: number;
  createdAt: string;
};

export type BuyerArchetype = {
  id: string;
  offerId: string;
  name: string;
  segment?: string;
  role?: string;
  activeVersionId: string;
  versions: ArchetypeVersion[];
  createdAt: string;
};

export type Prospect = {
  id: string;
  offerId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  industry: string;
  companySize: string;
  notes: string;
  trigger: string;
  website: string;
  linkedinSummary: string;
  signalType?: string | null;
  signalSummary?: string | null;
  signalSource?: string | null;
  signalDate?: string | null;
  signalStrength?: number | null;
  signalUrl?: string | null;
  intentScore?: number | null;
  icpFitScore?: number | null;
  signalFreshnessScore?: number | null;
  leadPriorityScore?: number | null;
  whyNow?: string | null;
  recommendedAngle?: string | null;
  createdAt: string;
};

export type ProspectMatch = {
  id: string;
  prospectId: string;
  archetypeId: string;
  confidence: number;
  reasoning: string;
  matchedSignals: string[];
  riskFlags: string[];
  predictedObjection: string;
  recommendedAngle: string;
  predictedOutcome?: string | null;
  predictedReplyLikelihood?: number | null;
  predictionConfidence?: number | null;
  phrasesToUse?: string[];
  phrasesToAvoid?: string[];
  signalContribution?: number | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  offerId: string;
  name: string;
  createdAt: string;
};

export type CampaignCohort = {
  id: string;
  campaignId: string;
  cohortNumber: number;
  status: "draft" | "preflight" | "ready" | "sent" | "calibrated" | "next-planned";
  createdAt: string;
};

export type EmailStatus =
  | "draft"
  | "approved"
  | "queued"
  | "sent"
  | "drafted-in-gmail"
  | "failed";

export type OutboundEmail = {
  id: string;
  cohortId: string;
  prospectId: string;
  archetypeId: string;
  hypothesis: string;
  angle: string;
  subject: string;
  body: string;
  followUp1: string | null;
  followUp2: string | null;
  predictedReplyLikelihood: number;
  predictedObjection: string;
  cta: string;
  complianceFooter: string;
  riskWarnings: string[];
  qualityScore: number;
  status: EmailStatus;
  approvedAt: string | null;
  createdAt: string;
};

export type ReplyOutcome =
  | "positive"
  | "interested_later"
  | "wrong_person"
  | "not_relevant"
  | "pricing_objection"
  | "trust_objection"
  | "competitor_locked"
  | "unsubscribe"
  | "hostile"
  | "bounce"
  | "no_reply";

export type ReplyAnalysis = {
  id: string;
  emailId: string;
  rawText: string;
  outcome: ReplyOutcome;
  sentiment: "positive" | "neutral" | "negative";
  objectionType: string | null;
  funnelStage: string;
  volunteeredInfo: string[];
  predictedWasCorrect: boolean;
  mismatchReason: string | null;
  confidence: number;
  createdAt: string;
};

export type PersonaUpdate = {
  id: string;
  archetypeId: string;
  fromVersionId: string;
  toVersionId: string;
  reason: string;
  added: string[];
  removedOrDownweighted: string[];
  newConfidence: number;
  createdAt: string;
};

export type CalibrationRun = {
  id: string;
  cohortId: string;
  triggeredBy: string;
  predictionAccuracyByArchetype: Record<string, number>;
  objectionConfusion: Record<string, Record<string, number>>;
  personaUpdateIds: string[];
  signalPerformanceByType?: Record<string, unknown>;
  signalMemoryUpdates?: unknown[];
  messageMemoryUpdates?: unknown[];
  createdAt: string;
};

export type NextCohortPlan = {
  id: string;
  cohortId: string;
  nextCohortId: string;
  summary: string;
  changesFromPreviousCohort: string[];
  segmentsToDoubleDown: string[];
  segmentsToPause: string[];
  revisedMessageAngles: string[];
  signalTypesToDoubleDown?: string[];
  signalTypesToPause?: string[];
  reprioritisedLeadIds?: string[];
  newEmailTemplates: { archetypeId: string; subject: string; body: string }[];
  killCriterion: string;
  successMetric: string;
  createdAt: string;
};

export type SuppressionEntry = {
  id: string;
  email: string;
  reason: "unsubscribe" | "hostile" | "bounce" | "manual";
  createdAt: string;
};
