import { z } from "zod";

export const ToneSchema = z.enum([
  "concise",
  "founder-led",
  "warm",
  "direct",
  "technical",
]);
export type Tone = z.infer<typeof ToneSchema>;

export const LevelSchema = z.enum(["low", "medium", "high"]);
export type Level = z.infer<typeof LevelSchema>;

export const SentimentSchema = z.enum(["positive", "neutral", "negative"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

export const ReplyOutcomeSchema = z.enum([
  "positive",
  "interested_later",
  "wrong_person",
  "not_relevant",
  "pricing_objection",
  "trust_objection",
  "competitor_locked",
  "unsubscribe",
  "hostile",
  "bounce",
  "no_reply",
]);
export type ReplyOutcome = z.infer<typeof ReplyOutcomeSchema>;

export const REPLY_OUTCOMES: readonly ReplyOutcome[] =
  ReplyOutcomeSchema.options;

export const ConfidenceSchema = z
  .number()
  .min(0, "confidence must be >= 0")
  .max(1, "confidence must be <= 1");

export const PainIntensitySchema = z.number().int().min(1).max(5);

export const NonEmptyStringSchema = z.string().min(1);
