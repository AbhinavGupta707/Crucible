import { z } from "zod";
import { NonEmptyStringSchema, ToneSchema } from "./common";

export const HypothesisInputSchema = z.object({
  rawFounderInput: NonEmptyStringSchema,
  icpGuess: NonEmptyStringSchema,
  desiredCta: NonEmptyStringSchema,
  tone: ToneSchema,
});
export type HypothesisInput = z.infer<typeof HypothesisInputSchema>;

export const MessageAngleSchema = z.object({
  name: NonEmptyStringSchema,
  hypothesis: NonEmptyStringSchema,
});
export type MessageAngle = z.infer<typeof MessageAngleSchema>;

export const HypothesisOutputSchema = z.object({
  title: NonEmptyStringSchema,
  productSummary: NonEmptyStringSchema,
  icpGuess: NonEmptyStringSchema,
  likelyBuyer: NonEmptyStringSchema,
  likelyUser: NonEmptyStringSchema,
  champion: NonEmptyStringSchema,
  painClaim: NonEmptyStringSchema,
  proofPoint: NonEmptyStringSchema,
  desiredCta: NonEmptyStringSchema,
  messageAngles: z.array(MessageAngleSchema).min(2).max(8),
  riskyAssumptions: z.array(NonEmptyStringSchema).min(1).max(10),
});
export type HypothesisOutput = z.infer<typeof HypothesisOutputSchema>;
