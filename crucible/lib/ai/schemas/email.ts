import { z } from "zod";
import {
  ConfidenceSchema,
  NonEmptyStringSchema,
  ToneSchema,
} from "./common";
import { ArchetypeRefSchema, ProspectRecordSchema } from "./prospect";

export const OutreachInputSchema = z.object({
  prospect: ProspectRecordSchema,
  archetype: ArchetypeRefSchema,
  hypothesis: NonEmptyStringSchema,
  angle: NonEmptyStringSchema,
  predictedObjection: NonEmptyStringSchema,
  desiredCta: NonEmptyStringSchema,
  tone: ToneSchema,
  externalSend: z.boolean().default(false),
  senderName: NonEmptyStringSchema,
  senderCompany: NonEmptyStringSchema,
  optOutAddress: z.string().optional(),
});
export type OutreachInput = z.infer<typeof OutreachInputSchema>;

export const OutreachOutputSchema = z.object({
  hypothesis: NonEmptyStringSchema,
  angle: NonEmptyStringSchema,
  subject: z.string().min(1).max(120),
  body: NonEmptyStringSchema,
  followUp1: NonEmptyStringSchema,
  followUp2: NonEmptyStringSchema,
  predictedReplyLikelihood: ConfidenceSchema,
  predictedObjection: NonEmptyStringSchema,
  cta: NonEmptyStringSchema,
  complianceFooter: z.string().default(""),
  riskWarnings: z.array(NonEmptyStringSchema).max(8).default([]),
});
export type OutreachOutput = z.infer<typeof OutreachOutputSchema>;
