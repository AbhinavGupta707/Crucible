// UI-only types for the seeded demo. The real schemas live in lib/ai/schemas
// (owned by the AI workstream) and will replace these once integration begins.

export type Confidence = "low" | "medium" | "high";

export type Offer = {
  id: string;
  title: string;
  productSummary: string;
  icpGuess: string;
  likelyBuyer: string;
  likelyUser: string;
  champion: string;
  painClaim: string;
  proofPoint: string;
  desiredCta: string;
  tone: "concise" | "founder-led" | "warm" | "direct" | "technical";
  messageAngles: string[];
  riskyAssumptions: string[];
};

export type Archetype = {
  id: string;
  name: string;
  version: 1 | 2;
  segment: string;
  role: string;
  description: string;
  predictedReplyLikelihood: number; // 0-1
  topObjection: string;
  bestAngle: string;
  confidence: Confidence;
  riskTolerance: "low" | "medium" | "high";
  buyingPower: "low" | "medium" | "high";
  predictedObjections: string[];
  preferredAngles: string[];
  dislikedPhrases: string[];
  hasUpdatedVersion?: boolean;
};

export type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  industry: string;
  companySize: string;
  trigger: string;
  notes: string;
  match: {
    archetypeId: string;
    archetypeName: string;
    confidence: number; // 0-1
    matchedSignals: string[];
    predictedObjection: string;
    recommendedAngle: string;
    riskFlags: string[];
  };
};

export type OutboundEmail = {
  id: string;
  prospectId: string;
  archetypeId: string;
  hypothesis: string;
  angle: string;
  subject: string;
  body: string;
  predictedReplyLikelihood: number;
  predictedObjection: string;
  ctaQuality: number; // 0-10
  complianceWarnings: string[];
  approved: boolean;
  status: "draft" | "approved" | "drafted_in_gmail" | "sent";
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
  | "no_reply"
  | "timing_objection"
  | "implementation_objection";

export type ReplyAnalysis = {
  id: string;
  emailId: string;
  prospectId: string;
  sender: string;
  rawSnippet: string;
  predictedOutcome: ReplyOutcome;
  actualOutcome: ReplyOutcome;
  predictedObjection: string;
  actualObjection: string;
  predictionWasCorrect: boolean;
  parserConfidence: number; // 0-1
  volunteeredInfo: string[];
};

export type CalibrationCell = {
  predicted: ReplyOutcome;
  actual: ReplyOutcome;
  count: number;
};

export type ArchetypeAccuracy = {
  archetypeId: string;
  archetypeName: string;
  sentCount: number;
  correctCount: number;
  accuracy: number; // 0-1
  shouldUpdate: boolean;
  triggerReason?: string;
};

export type PersonaUpdate = {
  archetypeId: string;
  fromVersion: number;
  toVersion: number;
  added: string[];
  removed: string[];
  newConfidence: Confidence;
  reason: string;
  newPredictedObjections: string[];
  newPreferredAngles: string[];
  phrasesToUse: string[];
  phrasesToAvoid: string[];
};

export type NextCohortPlan = {
  summary: string;
  changesFromPreviousCohort: string[];
  segmentsToDoubleDown: string[];
  segmentsToPause: string[];
  revisedHypothesis: string;
  successMetric: string;
  killCriterion: string;
  beforeEmail: { subject: string; body: string };
  afterEmail: { subject: string; body: string };
};
