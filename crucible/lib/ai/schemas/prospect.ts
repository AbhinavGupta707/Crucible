import { z } from "zod";
import {
  ConfidenceSchema,
  NonEmptyStringSchema,
  ReplyOutcomeSchema,
} from "./common";

export const ProspectRecordSchema = z.object({
  id: NonEmptyStringSchema,
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  email: z.string().email(),
  title: z.string().default(""),
  company: z.string().default(""),
  industry: z.string().default(""),
  companySize: z.string().default(""),
  notes: z.string().default(""),
  trigger: z.string().default(""),
  website: z.string().default(""),
  linkedinSummary: z.string().default(""),
});
export type ProspectRecord = z.infer<typeof ProspectRecordSchema>;

export const ArchetypeRefSchema = z.object({
  id: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  segment: NonEmptyStringSchema,
  role: NonEmptyStringSchema,
  preferredAngles: z.array(NonEmptyStringSchema).default([]),
  predictedObjections: z.array(NonEmptyStringSchema).default([]),
});
export type ArchetypeRef = z.infer<typeof ArchetypeRefSchema>;

export const ProspectMatcherInputSchema = z.object({
  prospect: ProspectRecordSchema,
  archetypes: z.array(ArchetypeRefSchema).min(1),
});
export type ProspectMatcherInput = z.infer<typeof ProspectMatcherInputSchema>;

export const ProspectMatcherOutputSchema = z.object({
  prospectId: NonEmptyStringSchema,
  archetypeId: NonEmptyStringSchema,
  confidence: ConfidenceSchema,
  reasoning: NonEmptyStringSchema,
  matchedSignals: z.array(NonEmptyStringSchema).min(1).max(8),
  riskFlags: z.array(NonEmptyStringSchema).max(8).default([]),
  llmJudgmentScore: ConfidenceSchema,
});
export type ProspectMatcherOutput = z.infer<typeof ProspectMatcherOutputSchema>;

export const PreflightInputSchema = z.object({
  prospect: ProspectRecordSchema,
  archetype: ArchetypeRefSchema,
  matchedSignals: z.array(NonEmptyStringSchema).default([]),
});
export type PreflightInput = z.infer<typeof PreflightInputSchema>;

export const PreflightOutputSchema = z.object({
  prospectId: NonEmptyStringSchema,
  archetypeId: NonEmptyStringSchema,
  replyLikelihood: ConfidenceSchema,
  predictedOutcome: ReplyOutcomeSchema,
  predictedObjection: NonEmptyStringSchema,
  bestAngle: NonEmptyStringSchema,
  phrasesToUse: z.array(NonEmptyStringSchema).min(1).max(6),
  phrasesToAvoid: z.array(NonEmptyStringSchema).max(6).default([]),
  confidence: ConfidenceSchema,
});
export type PreflightOutput = z.infer<typeof PreflightOutputSchema>;
