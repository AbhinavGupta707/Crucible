// Replay seeded replies onto the most recent cohort. Each reply maps onto the
// outbound email for its prospect (or, if explicit prospect not found, onto an
// email whose archetype matches the seed hint).

import { emailsRepo } from "../db/repositories/emails";
import { prospectsRepo } from "../db/repositories/prospects";
import { repliesRepo } from "../db/repositories/replies";
import { archetypesRepo } from "../db/repositories/archetypes";
import { suppressionRepo } from "../db/repositories/suppression";
import { parseReply } from "../ai/workflows/parse-reply";
import { SAMPLE_REPLIES } from "./sample-replies";
import type { ReplyAnalysis } from "../db/types";

export type ReplayRepliesResult = {
  replies: ReplyAnalysis[];
  warnings: string[];
};

export async function replayReplies(cohortId: string): Promise<ReplayRepliesResult> {
  const warnings: string[] = [];
  const emails = emailsRepo.listByCohort(cohortId);
  if (emails.length === 0) {
    throw new Error(`No emails for cohort ${cohortId}; cannot replay replies.`);
  }

  const replies: ReplyAnalysis[] = [];

  for (const seed of SAMPLE_REPLIES) {
    let email = emails.find((e) => {
      const p = prospectsRepo.findById(e.prospectId);
      return p?.email.toLowerCase() === seed.prospectEmail.toLowerCase();
    });

    if (!email) {
      const archetype = Array.from(
        archetypesRepo.listByOffer(emails[0] ? prospectsRepo.findById(emails[0].prospectId)?.offerId ?? "" : ""),
      ).find((a) => a.name === seed.archetypeHint);
      if (archetype) {
        email = emails.find((e) => e.archetypeId === archetype.id);
      }
    }

    if (!email) {
      warnings.push(`No matching email for seeded reply (${seed.prospectEmail}, ${seed.archetypeHint}).`);
      continue;
    }

    const parsed = parseReply(seed.rawText);
    const predictedFamily = email.predictedObjection.toLowerCase();
    const actualObjection = (parsed.objectionType ?? parsed.outcome).toLowerCase();
    const predictedWasCorrect =
      predictedFamily.includes(actualObjection) || actualObjection.includes(predictedFamily);

    const reply = repliesRepo.upsertForEmail({
      emailId: email.id,
      rawText: seed.rawText,
      outcome: parsed.outcome,
      sentiment: parsed.sentiment,
      objectionType: parsed.objectionType,
      funnelStage: parsed.funnelStage,
      volunteeredInfo: parsed.volunteeredInfo.length > 0 ? parsed.volunteeredInfo : seed.volunteeredInfo,
      predictedWasCorrect,
      mismatchReason: predictedWasCorrect
        ? null
        : `Predicted ${email.predictedObjection}; observed ${parsed.objectionType ?? parsed.outcome}.`,
      confidence: Math.max(parsed.confidence, seed.confidence),
    });
    replies.push(reply);

    // Honor unsubscribe / hostile / bounce by adding to suppression.
    const prospect = prospectsRepo.findById(email.prospectId);
    if (prospect && (parsed.outcome === "unsubscribe" || parsed.outcome === "hostile" || parsed.outcome === "bounce")) {
      suppressionRepo.add(prospect.email, parsed.outcome);
    }
  }

  return { replies, warnings };
}
