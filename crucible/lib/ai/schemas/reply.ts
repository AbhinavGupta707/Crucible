import { z } from "zod";
import {
  ConfidenceSchema,
  NonEmptyStringSchema,
  ReplyOutcomeSchema,
  SentimentSchema,
} from "./common";

export const ResponseParserInputSchema = z.object({
  emailId: NonEmptyStringSchema,
  prospectId: NonEmptyStringSchema,
  archetypeId: NonEmptyStringSchema,
  predictedOutcome: ReplyOutcomeSchema,
  predictedObjection: NonEmptyStringSchema.optional(),
  rawReplyText: z.string().min(1),
});
export type ResponseParserInput = z.infer<typeof ResponseParserInputSchema>;

export const ResponseParserOutputSchema = z.object({
  outcome: ReplyOutcomeSchema,
  sentiment: SentimentSchema,
  objectionType: z.string().nullable().default(null),
  funnelStage: z.string().default("unknown"),
  volunteeredInfo: z.array(NonEmptyStringSchema).max(10).default([]),
  predictedWasCorrect: z.boolean(),
  mismatchReason: z.string().nullable().default(null),
  confidence: ConfidenceSchema,
});
export type ResponseParserOutput = z.infer<typeof ResponseParserOutputSchema>;
