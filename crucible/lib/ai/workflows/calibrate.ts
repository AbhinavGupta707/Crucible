// Calibration. Computes prediction accuracy by archetype, decides whether each
// archetype should update, and -- for the seeded mismatch (Tool-Fatigued
// Operator) -- creates a v2 archetype version + persona update record.

import { archetypesRepo } from "../../db/repositories/archetypes";
import { calibrationRepo } from "../../db/repositories/calibration";
import { emailsRepo } from "../../db/repositories/emails";
import { repliesRepo } from "../../db/repositories/replies";
import {
  TOOL_FATIGUED_OPERATOR_NAME,
  TOOL_FATIGUED_OPERATOR_V2,
} from "../../demo/sample-archetypes";
import type {
  CalibrationRun,
  PersonaUpdate,
  ReplyOutcome,
} from "../../db/types";

const FAMILY: Record<ReplyOutcome, string> = {
  positive: "positive",
  interested_later: "soft_interest",
  wrong_person: "negative_fit",
  not_relevant: "negative_fit",
  pricing_objection: "objection",
  trust_objection: "objection",
  competitor_locked: "negative_fit",
  unsubscribe: "hard_negative",
  hostile: "hard_negative",
  bounce: "hard_negative",
  no_reply: "no_reply",
};

function predictedFamilyFromObjection(predictedObjection: string): string {
  const t = predictedObjection.toLowerCase();
  if (t.includes("price") || t.includes("pricing")) return "objection";
  if (t.includes("trust") || t.includes("compliance")) return "objection";
  if (t.includes("wrong")) return "negative_fit";
  if (t.includes("competitor")) return "negative_fit";
  if (t.includes("timing")) return "soft_interest";
  return "objection";
}

function accuracyScore(predictedFamily: string, actual: ReplyOutcome): number {
  const actualFamily = FAMILY[actual];
  if (actual === "no_reply") return 0.3;
  if (predictedFamily === actualFamily) return 0.6;
  return 0.0;
}

export type CalibrateOptions = {
  triggeredBy?: string;
  // Lower the demo-mode thresholds so 5-8 staged replies can trigger.
  demoThresholds?: boolean;
};

export type CalibrateResult = {
  run: CalibrationRun;
  personaUpdates: PersonaUpdate[];
  warnings: string[];
};

export async function calibrateCohort(
  cohortId: string,
  options: CalibrateOptions = {},
): Promise<CalibrateResult> {
  const warnings: string[] = [];
  const emails = emailsRepo.listByCohort(cohortId);
  const replies = repliesRepo.listByCohort(cohortId);
  if (emails.length === 0) {
    throw new Error(`No emails for cohort ${cohortId}; cannot calibrate.`);
  }
  if (replies.length === 0) {
    warnings.push("No replies recorded; calibration will use no-reply as weak evidence only.");
  }

  // Group replies by archetype.
  const repliesByArchetype = new Map<string, { reply: typeof replies[number]; predictedFamily: string; predictedObjection: string }[]>();
  const sentByArchetype = new Map<string, number>();
  for (const email of emails) {
    sentByArchetype.set(email.archetypeId, (sentByArchetype.get(email.archetypeId) ?? 0) + 1);
    const reply = replies.find((r) => r.emailId === email.id);
    if (reply) {
      const arr = repliesByArchetype.get(email.archetypeId) ?? [];
      arr.push({
        reply,
        predictedFamily: predictedFamilyFromObjection(email.predictedObjection),
        predictedObjection: email.predictedObjection,
      });
      repliesByArchetype.set(email.archetypeId, arr);
    }
  }

  const accuracyByArchetype: Record<string, number> = {};
  const objectionConfusion: Record<string, Record<string, number>> = {};
  const personaUpdates: PersonaUpdate[] = [];

  const sentThreshold = options.demoThresholds ? 1 : 5;

  for (const [archetypeId, items] of repliesByArchetype) {
    const totalScore = items.reduce(
      (acc, it) => acc + accuracyScore(it.predictedFamily, it.reply.outcome),
      0,
    );
    const accuracy = items.length === 0 ? 0 : totalScore / items.length;
    accuracyByArchetype[archetypeId] = Math.round(accuracy * 100) / 100;

    objectionConfusion[archetypeId] = items.reduce<Record<string, number>>((m, it) => {
      const key = `${it.predictedObjection} -> ${it.reply.objectionType ?? it.reply.outcome}`;
      m[key] = (m[key] ?? 0) + 1;
      return m;
    }, {});

    const archetype = archetypesRepo.findById(archetypeId);
    if (!archetype) continue;
    const sent = sentByArchetype.get(archetypeId) ?? 0;
    const unpredicted = items.filter((it) => it.predictedFamily !== FAMILY[it.reply.outcome]).length;
    const hostileOrUnsubRate =
      items.filter((it) => it.reply.outcome === "hostile" || it.reply.outcome === "unsubscribe").length /
      Math.max(1, items.length);

    const shouldUpdate =
      sent >= sentThreshold &&
      (accuracy < 0.65 ||
        unpredicted / Math.max(1, items.length) >= 0.3 ||
        hostileOrUnsubRate >= 0.1);

    if (!shouldUpdate) continue;

    if (archetype.name === TOOL_FATIGUED_OPERATOR_NAME) {
      const { previousVersion, newVersion } = archetypesRepo.appendVersion(
        archetype.id,
        {
          reason: TOOL_FATIGUED_OPERATOR_V2.reason,
          description: TOOL_FATIGUED_OPERATOR_V2.description,
          currentWorkflow: TOOL_FATIGUED_OPERATOR_V2.currentWorkflow,
          painIntensity: TOOL_FATIGUED_OPERATOR_V2.painIntensity,
          buyingPower: TOOL_FATIGUED_OPERATOR_V2.buyingPower,
          riskTolerance: TOOL_FATIGUED_OPERATOR_V2.riskTolerance,
          voiceStyle: TOOL_FATIGUED_OPERATOR_V2.voiceStyle,
          predictedObjections: TOOL_FATIGUED_OPERATOR_V2.predictedObjections,
          preferredAngles: TOOL_FATIGUED_OPERATOR_V2.preferredAngles,
          dislikedPhrases: TOOL_FATIGUED_OPERATOR_V2.dislikedPhrases,
          likelyReplyPatterns: TOOL_FATIGUED_OPERATOR_V2.likelyReplyPatterns,
          confidence: TOOL_FATIGUED_OPERATOR_V2.confidence,
        },
      );
      personaUpdates.push(
        calibrationRepo.createPersonaUpdate({
          archetypeId: archetype.id,
          fromVersionId: previousVersion.id,
          toVersionId: newVersion.id,
          reason: TOOL_FATIGUED_OPERATOR_V2.reason,
          added: TOOL_FATIGUED_OPERATOR_V2.added,
          removedOrDownweighted: TOOL_FATIGUED_OPERATOR_V2.removedOrDownweighted,
          newConfidence: TOOL_FATIGUED_OPERATOR_V2.confidence,
        }),
      );
    } else {
      const v = archetypesRepo.activeVersion(archetype);
      const observedObjections = items
        .map((it) => it.reply.objectionType)
        .filter((x): x is string => Boolean(x));
      const merged = Array.from(new Set([...v.predictedObjections, ...observedObjections]));
      const { previousVersion, newVersion } = archetypesRepo.appendVersion(archetype.id, {
        reason: `Calibration adjustment from cohort ${cohortId}.`,
        description: v.description,
        currentWorkflow: v.currentWorkflow,
        painIntensity: v.painIntensity,
        buyingPower: v.buyingPower,
        riskTolerance: v.riskTolerance,
        voiceStyle: v.voiceStyle,
        predictedObjections: merged,
        preferredAngles: v.preferredAngles,
        dislikedPhrases: v.dislikedPhrases,
        likelyReplyPatterns: v.likelyReplyPatterns,
        confidence: Math.max(0.5, Math.min(0.95, v.confidence + (accuracy - 0.5) * 0.2)),
      });
      personaUpdates.push(
        calibrationRepo.createPersonaUpdate({
          archetypeId: archetype.id,
          fromVersionId: previousVersion.id,
          toVersionId: newVersion.id,
          reason: `Accuracy ${accuracy.toFixed(2)} below target; adjusting predicted objections.`,
          added: observedObjections,
          removedOrDownweighted: [],
          newConfidence: newVersion.confidence,
        }),
      );
    }
  }

  const run = calibrationRepo.createRun({
    cohortId,
    triggeredBy: options.triggeredBy ?? "manual",
    predictionAccuracyByArchetype: accuracyByArchetype,
    objectionConfusion,
    personaUpdateIds: personaUpdates.map((u) => u.id),
  });

  return { run, personaUpdates, warnings };
}
