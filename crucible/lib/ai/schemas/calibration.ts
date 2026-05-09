import { z } from "zod";
import {
  ConfidenceSchema,
  NonEmptyStringSchema,
  ReplyOutcomeSchema,
} from "./common";

export const ArchetypeStatsSchema = z.object({
  archetypeId: NonEmptyStringSchema,
  archetypeName: NonEmptyStringSchema,
  sentCount: z.number().int().min(0),
  replyCount: z.number().int().min(0),
  predictionAccuracy: ConfidenceSchema,
  unpredictedObjectionRate: ConfidenceSchema,
  hostileOrUnsubscribeRate: ConfidenceSchema,
  newObjectionClusterCount: z.number().int().min(0),
  observedOutcomes: z.array(ReplyOutcomeSchema).default([]),
  predictedObjections: z.array(NonEmptyStringSchema).default([]),
  observedObjections: z.array(NonEmptyStringSchema).default([]),
});
export type ArchetypeStats = z.infer<typeof ArchetypeStatsSchema>;

export const CalibrationInputSchema = z.object({
  archetypeId: NonEmptyStringSchema,
  archetypeName: NonEmptyStringSchema,
  stats: ArchetypeStatsSchema,
  oldPredictedObjections: z.array(NonEmptyStringSchema).default([]),
  oldPreferredAngles: z.array(NonEmptyStringSchema).default([]),
});
export type CalibrationInput = z.infer<typeof CalibrationInputSchema>;

export const PredictionPairSchema = z.object({
  predicted: ReplyOutcomeSchema,
  actual: ReplyOutcomeSchema,
});
export type PredictionPair = z.infer<typeof PredictionPairSchema>;

export const CalibrationOutputSchema = z.object({
  archetypeId: NonEmptyStringSchema,
  shouldUpdate: z.boolean(),
  reason: NonEmptyStringSchema,
  oldPredictions: z.object({
    objections: z.array(NonEmptyStringSchema).default([]),
    angles: z.array(NonEmptyStringSchema).default([]),
  }),
  observedReality: z.object({
    objections: z.array(NonEmptyStringSchema).default([]),
    outcomes: z.array(ReplyOutcomeSchema).default([]),
  }),
  newPredictedObjections: z.array(NonEmptyStringSchema).max(8).default([]),
  newPreferredAngles: z.array(NonEmptyStringSchema).max(6).default([]),
  phrasesToUse: z.array(NonEmptyStringSchema).max(8).default([]),
  phrasesToAvoid: z.array(NonEmptyStringSchema).max(8).default([]),
  confidenceAfter: ConfidenceSchema,
});
export type CalibrationOutput = z.infer<typeof CalibrationOutputSchema>;
