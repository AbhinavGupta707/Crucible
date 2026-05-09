// Preflight predictions per cohort. In safe mode, derived from each prospect's
// matched archetype. Prediction is stored on the OutboundEmail later.

import { archetypesRepo } from "../../db/repositories/archetypes";
import { matchesRepo, prospectsRepo } from "../../db/repositories/prospects";
import type { ProspectMatch } from "../../db/types";

export type PreflightPrediction = {
  prospectId: string;
  archetypeId: string;
  predictedReplyLikelihood: number;
  predictedOutcome: string;
  predictedObjection: string;
  bestAngle: string;
  phrasesToUse: string[];
  phrasesToAvoid: string[];
  confidence: number;
};

export async function generatePreflight(
  offerId: string,
  prospectIds: string[],
): Promise<{ predictions: PreflightPrediction[]; warnings: string[] }> {
  const warnings: string[] = [];
  const predictions: PreflightPrediction[] = [];
  for (const id of prospectIds) {
    const prospect = prospectsRepo.findById(id);
    if (!prospect || prospect.offerId !== offerId) {
      warnings.push(`Prospect not found or out-of-scope: ${id}`);
      continue;
    }
    const match: ProspectMatch | null = matchesRepo.findByProspect(id);
    if (!match) {
      warnings.push(`No match for prospect: ${id}`);
      continue;
    }
    const archetype = archetypesRepo.findById(match.archetypeId);
    if (!archetype) {
      warnings.push(`Archetype missing for match: ${id}`);
      continue;
    }
    const v = archetypesRepo.activeVersion(archetype);
    const replyLikelihood = Math.max(
      0.05,
      Math.min(0.95, match.confidence * 0.6 + v.painIntensity * 0.4),
    );
    predictions.push({
      prospectId: id,
      archetypeId: archetype.id,
      predictedReplyLikelihood: Math.round(replyLikelihood * 100) / 100,
      predictedOutcome: archetype.name === "Wrong-Person Gatekeeper" ? "wrong_person" : "interested_later",
      predictedObjection: v.predictedObjections[0] ?? "Unknown",
      bestAngle: v.preferredAngles[0] ?? "Pipeline recovery",
      phrasesToUse: v.preferredAngles.slice(0, 2),
      phrasesToAvoid: v.dislikedPhrases,
      confidence: v.confidence,
    });
  }
  return { predictions, warnings };
}
