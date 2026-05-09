import { z } from "zod";
import {
  ConfidenceSchema,
  LevelSchema,
  NonEmptyStringSchema,
  PainIntensitySchema,
} from "./common";

export const ArchetypeSchema = z.object({
  name: NonEmptyStringSchema,
  segment: NonEmptyStringSchema,
  role: NonEmptyStringSchema,
  description: NonEmptyStringSchema,
  currentWorkflow: NonEmptyStringSchema,
  painIntensity: PainIntensitySchema,
  buyingPower: LevelSchema,
  riskTolerance: LevelSchema,
  voiceStyle: NonEmptyStringSchema,
  predictedObjections: z.array(NonEmptyStringSchema).min(1).max(8),
  preferredAngles: z.array(NonEmptyStringSchema).min(1).max(6),
  dislikedPhrases: z.array(NonEmptyStringSchema).max(10).default([]),
  likelyReplyPatterns: z.array(NonEmptyStringSchema).min(1).max(6),
  predictedReplyLikelihood: ConfidenceSchema,
  confidence: ConfidenceSchema,
});
export type Archetype = z.infer<typeof ArchetypeSchema>;

export const PersonaSynthesizerInputSchema = z.object({
  offerTitle: NonEmptyStringSchema,
  productSummary: NonEmptyStringSchema,
  icpGuess: NonEmptyStringSchema,
  painClaim: NonEmptyStringSchema,
  desiredCta: NonEmptyStringSchema,
  riskyAssumptions: z.array(NonEmptyStringSchema).default([]),
  count: z.number().int().min(8).max(12).default(10),
});
export type PersonaSynthesizerInput = z.infer<
  typeof PersonaSynthesizerInputSchema
>;

export const PersonaSynthesizerOutputSchema = z.object({
  archetypes: z.array(ArchetypeSchema).min(8).max(12),
});
export type PersonaSynthesizerOutput = z.infer<
  typeof PersonaSynthesizerOutputSchema
>;
