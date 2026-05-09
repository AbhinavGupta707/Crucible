import { z } from "zod";
import { ConfidenceSchema, NonEmptyStringSchema } from "./common";

export const NextCohortInputSchema = z.object({
  cohortNumber: z.number().int().min(1),
  offerTitle: NonEmptyStringSchema,
  previousHypotheses: z.array(NonEmptyStringSchema).default([]),
  calibrationSummary: NonEmptyStringSchema,
  updatedArchetypes: z
    .array(
      z.object({
        archetypeId: NonEmptyStringSchema,
        archetypeName: NonEmptyStringSchema,
        newAngles: z.array(NonEmptyStringSchema).default([]),
        newObjections: z.array(NonEmptyStringSchema).default([]),
      })
    )
    .min(1),
});
export type NextCohortInput = z.infer<typeof NextCohortInputSchema>;

export const NextCohortEmailTemplateSchema = z.object({
  archetypeId: NonEmptyStringSchema,
  archetypeName: NonEmptyStringSchema,
  hypothesis: NonEmptyStringSchema,
  angle: NonEmptyStringSchema,
  subject: z.string().min(1).max(120),
  body: NonEmptyStringSchema,
  changesFromPrevious: z.array(NonEmptyStringSchema).default([]),
});
export type NextCohortEmailTemplate = z.infer<
  typeof NextCohortEmailTemplateSchema
>;

export const NextCohortOutputSchema = z.object({
  summary: NonEmptyStringSchema,
  changesFromPreviousCohort: z.array(NonEmptyStringSchema).min(1),
  segmentsToDoubleDown: z.array(NonEmptyStringSchema).default([]),
  segmentsToPause: z.array(NonEmptyStringSchema).default([]),
  revisedMessageAngles: z.array(NonEmptyStringSchema).min(1),
  newEmailTemplates: z.array(NextCohortEmailTemplateSchema).min(1),
  killCriterion: NonEmptyStringSchema,
  successMetric: NonEmptyStringSchema,
  predictedLift: ConfidenceSchema,
});
export type NextCohortOutput = z.infer<typeof NextCohortOutputSchema>;
