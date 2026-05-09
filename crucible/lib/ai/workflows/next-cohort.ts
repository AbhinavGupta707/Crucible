// Generates the next cohort plan and rewritten email templates from the most
// recent calibration run. Cached safe-mode behavior; workstream 3 will replace
// the body templating with the live Next Cohort Generator.

import { archetypesRepo } from "../../db/repositories/archetypes";
import { calibrationRepo } from "../../db/repositories/calibration";
import { campaignsRepo, cohortsRepo } from "../../db/repositories/campaigns";
import type { CampaignCohort, NextCohortPlan } from "../../db/types";
import { TOOL_FATIGUED_OPERATOR_NAME } from "../../demo/sample-archetypes";

function buildTemplate(opts: {
  archetypeName: string;
  preferredAngle: string;
}): { subject: string; body: string } {
  if (opts.archetypeName === TOOL_FATIGUED_OPERATOR_NAME) {
    return {
      subject: "Never lose another warm lead - we draft, you approve",
      body: [
        "Hi {{firstName}},",
        "",
        "Never lose a warm lead because you forgot the second follow-up - we draft, you approve, then it sends.",
        "",
        "Implementation-light: no new tool, no engineering setup, nothing to migrate. We read your call notes; you stay in control.",
        "",
        "Worth a 15-min fit check this week?",
        "",
        "If this is not relevant, reply 'unsubscribe' and we will remove you immediately.",
      ].join("\n"),
    };
  }
  return {
    subject: "Recovering quiet inbound leads",
    body: [
      "Hi {{firstName}},",
      "",
      `${opts.preferredAngle}.`,
      "",
      "We help agencies recover warm leads that go quiet between discovery calls. Drafts only - approval stays with you.",
      "",
      "Worth a 15-minute call this week?",
      "",
      "If this is not relevant, reply 'unsubscribe' and we will remove you immediately.",
    ].join("\n"),
  };
}

export type NextCohortResult = {
  plan: NextCohortPlan;
  nextCohort: CampaignCohort;
  warnings: string[];
};

export async function planNextCohort(currentCohortId: string): Promise<NextCohortResult> {
  const warnings: string[] = [];
  const cohort = cohortsRepo.findById(currentCohortId);
  if (!cohort) throw new Error(`Cohort not found: ${currentCohortId}`);

  const runs = calibrationRepo.listRunsByCohort(currentCohortId);
  const latest = runs[runs.length - 1];
  if (!latest) {
    warnings.push("No calibration run exists for this cohort yet; using v1 archetype state.");
  }

  const updates = latest ? calibrationRepo.listPersonaUpdates(latest.personaUpdateIds) : [];
  const segmentsToDoubleDown: string[] = [];
  const segmentsToPause: string[] = [];
  const revisedMessageAngles: string[] = [];
  const newEmailTemplates: NextCohortPlan["newEmailTemplates"] = [];

  for (const u of updates) {
    const archetype = archetypesRepo.findById(u.archetypeId);
    if (!archetype) continue;
    const v = archetypesRepo.activeVersion(archetype);
    if (archetype.name === TOOL_FATIGUED_OPERATOR_NAME) {
      segmentsToDoubleDown.push(archetype.name);
    }
    if (archetype.name === "Wrong-Person Gatekeeper") {
      segmentsToPause.push(archetype.name);
    }
    revisedMessageAngles.push(v.preferredAngles[0] ?? "Pipeline recovery");
    const tpl = buildTemplate({
      archetypeName: archetype.name,
      preferredAngle: v.preferredAngles[0] ?? "Pipeline recovery",
    });
    newEmailTemplates.push({ archetypeId: archetype.id, subject: tpl.subject, body: tpl.body });
  }

  const nextCohort = cohortsRepo.create(cohort.campaignId);
  cohortsRepo.setStatus(currentCohortId, "next-planned");

  const summary =
    updates.length === 0
      ? "No archetype updates this round; rerunning with same hypotheses."
      : `Updated ${updates.length} archetype(s); message angles revised based on observed objections.`;

  const plan = calibrationRepo.createNextCohortPlan({
    cohortId: currentCohortId,
    nextCohortId: nextCohort.id,
    summary,
    changesFromPreviousCohort: updates.flatMap((u) => u.added),
    segmentsToDoubleDown,
    segmentsToPause,
    revisedMessageAngles: Array.from(new Set(revisedMessageAngles)),
    newEmailTemplates,
    killCriterion:
      "If reply-likelihood does not improve by 20% after 10 sends, pause this cohort and revisit hypotheses.",
    successMetric: "Cohort 2 reply-likelihood >= 25% on Tool-Fatigued Operator segment.",
  });

  return { plan, nextCohort, warnings };
}

// Avoid unused import warning until campaignsRepo is referenced elsewhere here.
void campaignsRepo;
