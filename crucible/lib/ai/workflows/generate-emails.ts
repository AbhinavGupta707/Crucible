// Generates one outbound email per prospect-match in a cohort. Cached safe-mode
// templating, with hooks for workstream 3 to swap in the live Outreach Generator.

import { archetypesRepo } from "../../db/repositories/archetypes";
import { matchesRepo, prospectsRepo } from "../../db/repositories/prospects";
import { offersRepo } from "../../db/repositories/offers";
import { emailsRepo } from "../../db/repositories/emails";
import type { OutboundEmail } from "../../db/types";
import { SAMPLE_HYPOTHESES } from "../../demo/sample-offer";

const COMPLIANCE_FOOTER =
  "If this is not relevant, reply 'unsubscribe' and we will remove you immediately.";

function pickHypothesis(archetypeName: string): string {
  const map: Record<string, string> = {
    "Tool-Fatigued Operator": SAMPLE_HYPOTHESES[1],
    "Growth-Focused Founder": SAMPLE_HYPOTHESES[2],
    "Trust-First Buyer": SAMPLE_HYPOTHESES[3],
  };
  return map[archetypeName] ?? SAMPLE_HYPOTHESES[0];
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function emailQualityScore(body: string): number {
  const words = wordCount(body);
  let score = 8;
  if (words > 120) score -= 3;
  if (!/\?/.test(body)) score -= 1;
  return Math.max(0, Math.min(10, score));
}

function templateBody(opts: {
  firstName: string;
  trigger: string;
  angle: string;
  cta: string;
  archetypeName: string;
}): { subject: string; body: string } {
  const subject = `Quick thought after ${opts.trigger.toLowerCase().slice(0, 60) || "your recent post"}`;
  const ctaLine =
    opts.archetypeName === "Tool-Fatigued Operator"
      ? "Would a 15-min fit check this week be useful?"
      : `Worth a 15-minute ${opts.cta.toLowerCase()} this week?`;
  const angleLine =
    opts.archetypeName === "Tool-Fatigued Operator"
      ? "Implementation-light: we draft, you approve. No new tool to learn."
      : opts.angle;
  const body = [
    `Hi ${opts.firstName},`,
    "",
    `${angleLine}`,
    "",
    `Most agencies we talk to are losing warm inbound because the second follow-up never happens. We read your call notes and draft the follow-up in your voice; you approve before anything sends.`,
    "",
    ctaLine,
    "",
    COMPLIANCE_FOOTER,
  ].join("\n");
  return { subject, body };
}

export type GenerateEmailsResult = {
  emails: OutboundEmail[];
  warnings: string[];
};

export async function generateEmailsForCohort(
  cohortId: string,
  offerId: string,
): Promise<GenerateEmailsResult> {
  const warnings: string[] = [];
  const offer = offersRepo.findById(offerId);
  if (!offer) throw new Error(`Offer not found: ${offerId}`);

  const prospects = prospectsRepo.listByOffer(offerId);
  const emails: OutboundEmail[] = [];
  for (const p of prospects) {
    const match = matchesRepo.findByProspect(p.id);
    if (!match) {
      warnings.push(`Skipping ${p.email}: no match`);
      continue;
    }
    const archetype = archetypesRepo.findById(match.archetypeId);
    if (!archetype) {
      warnings.push(`Skipping ${p.email}: archetype missing`);
      continue;
    }
    const v = archetypesRepo.activeVersion(archetype);
    const { subject, body } = templateBody({
      firstName: p.firstName,
      trigger: p.trigger || p.notes,
      angle: match.recommendedAngle,
      cta: offer.desiredCta || "fit check",
      archetypeName: archetype.name,
    });
    const wc = wordCount(body);
    if (wc > 120) warnings.push(`Email for ${p.email} exceeds 120 words (${wc}).`);

    const created = emailsRepo.create({
      cohortId,
      prospectId: p.id,
      archetypeId: archetype.id,
      hypothesis: pickHypothesis(archetype.name),
      angle: match.recommendedAngle,
      subject,
      body,
      followUp1: null,
      followUp2: null,
      predictedReplyLikelihood: Math.round(
        Math.max(0.05, Math.min(0.95, match.confidence * 0.6 + v.painIntensity * 0.4)) * 100,
      ) / 100,
      predictedObjection: match.predictedObjection,
      cta: offer.desiredCta || "Fit check",
      complianceFooter: COMPLIANCE_FOOTER,
      riskWarnings: match.riskFlags,
      qualityScore: emailQualityScore(body),
    });
    emails.push(created);
  }
  return { emails, warnings };
}
