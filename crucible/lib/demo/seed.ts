import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import {
  DEMO_IDS,
  DEMO_TONE,
  DEMO_WORKSPACE_NAME,
  DEMO_WORKSPACE_SLUG,
  loadCachedAiOutput,
  loadSampleLeadsCsv,
  loadSampleOfferText,
  parseLeadsCsv,
} from "./sample-data";

type AnyRecord = Record<string, unknown>;

function asJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

/**
 * Idempotent seed routine. Called by:
 *   - prisma/seed.ts via `prisma db seed`
 *   - GET /api/demo/seed in the safe-mode demo
 *
 * The function is safe to call repeatedly: it deletes the demo workspace cascade
 * and rebuilds. IDs for workspace/offer/campaign/cohort are stable so URLs
 * survive re-seeds.
 */
export async function seedDemoWorkspace(): Promise<{
  workspaceId: string;
  offerId: string;
  campaignId: string;
  cohortId: string;
  archetypeIds: Record<string, string>;
  prospectCount: number;
  emailCount: number;
  replyCount: number;
}> {
  const cached = loadCachedAiOutput();
  const offerText = loadSampleOfferText();
  const csv = loadSampleLeadsCsv();
  const leads = parseLeadsCsv(csv);

  // Cascade-delete previous demo workspace if present.
  await prisma.workspace.deleteMany({ where: { id: DEMO_IDS.workspace } });

  // 1. Workspace
  await prisma.workspace.create({
    data: {
      id: DEMO_IDS.workspace,
      slug: DEMO_WORKSPACE_SLUG,
      name: DEMO_WORKSPACE_NAME,
    },
  });

  // 2. Offer + hypotheses
  const hypothesis = cached.hypothesis as AnyRecord;
  await prisma.offer.create({
    data: {
      id: DEMO_IDS.offer,
      workspaceId: DEMO_IDS.workspace,
      rawFounderInput: offerText,
      title: String(hypothesis.title),
      productSummary: String(hypothesis.productSummary),
      icpGuess: String(hypothesis.icpGuess),
      likelyBuyer: String(hypothesis.likelyBuyer),
      likelyUser: String(hypothesis.likelyUser),
      champion: String(hypothesis.champion),
      painClaim: String(hypothesis.painClaim),
      proofPoint: hypothesis.proofPoint ? String(hypothesis.proofPoint) : null,
      desiredCta: String(hypothesis.desiredCta),
      tone: DEMO_TONE,
      messageAngles: asJson(hypothesis.messageAngles ?? []),
      riskyAssumptions: asJson(hypothesis.riskyAssumptions ?? []),
    },
  });

  await prisma.experimentHypothesis.createMany({
    data: [
      {
        offerId: DEMO_IDS.offer,
        statement:
          "Agency owners respond better to missed-revenue framing than AI automation framing.",
        rationale:
          "Owners self-identify lost warm deals; that framing is a directly named pain.",
      },
      {
        offerId: DEMO_IDS.offer,
        statement:
          "Tool-fatigued operators need low-implementation language before they engage.",
        rationale:
          "These prospects have abandoned multiple tools recently and are explicit about setup overhead.",
      },
      {
        offerId: DEMO_IDS.offer,
        statement:
          "Growth-focused founders respond to pipeline recovery more than time savings.",
      },
      {
        offerId: DEMO_IDS.offer,
        statement:
          "Trust-first buyers need proof and human approval before automation language.",
      },
    ],
  });

  // 3. Archetypes (and v1 versions)
  const archetypeIds: Record<string, string> = {};
  for (const a of cached.personaSynthesizer.archetypes) {
    const archetype = await prisma.buyerArchetype.create({
      data: {
        offerId: DEMO_IDS.offer,
        name: String(a.name),
      },
    });
    const version = await prisma.buyerArchetypeVersion.create({
      data: {
        archetypeId: archetype.id,
        versionNumber: 1,
        segment: String(a.segment),
        role: String(a.role),
        description: String(a.description),
        currentWorkflow: a.currentWorkflow ? String(a.currentWorkflow) : null,
        painIntensity: Number(a.painIntensity),
        buyingPower: String(a.buyingPower),
        riskTolerance: String(a.riskTolerance),
        voiceStyle: a.voiceStyle ? String(a.voiceStyle) : null,
        predictedReplyLikelihood: Number(a.predictedReplyLikelihood),
        topObjection: a.topObjection ? String(a.topObjection) : null,
        bestAngle: a.bestAngle ? String(a.bestAngle) : null,
        confidence: Number(a.confidence),
        predictedObjections: asJson(a.predictedObjections ?? []),
        preferredAngles: asJson(a.preferredAngles ?? []),
        dislikedPhrases: asJson(a.dislikedPhrases ?? []),
        likelyReplyPatterns: asJson(a.likelyReplyPatterns ?? []),
      },
    });
    await prisma.buyerArchetype.update({
      where: { id: archetype.id },
      data: { activeVersionId: version.id },
    });
    archetypeIds[String(a.name)] = archetype.id;
  }

  // 4. Prospects
  for (const lead of leads) {
    await prisma.prospect.create({
      data: {
        offerId: DEMO_IDS.offer,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        title: lead.title,
        company: lead.company,
        industry: lead.industry || null,
        companySize: lead.company_size || null,
        notes: lead.notes || null,
        trigger: lead.trigger || null,
        website: lead.website || null,
        linkedinSummary: lead.linkedin_summary || null,
      },
    });
  }

  // 5. Matches
  for (const m of cached.prospectMatcher.matches) {
    const prospect = await prisma.prospect.findUnique({
      where: { offerId_email: { offerId: DEMO_IDS.offer, email: m.prospectEmail } },
    });
    const archetypeId = archetypeIds[m.archetypeName];
    if (!prospect || !archetypeId) continue;
    const reasoning = `Matched on ${m.matchedSignals.join(", ")}.`;
    await prisma.prospectMatch.create({
      data: {
        prospectId: prospect.id,
        archetypeId,
        confidence: m.confidence,
        reasoning,
        matchedSignals: asJson(m.matchedSignals),
        riskFlags: asJson(m.riskFlags),
      },
    });
  }

  // 6. Apply preflight predictions to the matches that will be in cohort 1.
  for (const [email, p] of Object.entries(cached.preflightSimulator.predictions)) {
    const prospect = await prisma.prospect.findUnique({
      where: { offerId_email: { offerId: DEMO_IDS.offer, email } },
      include: { matches: true },
    });
    if (!prospect || prospect.matches.length === 0) continue;
    const match = prospect.matches[0];
    await prisma.prospectMatch.update({
      where: { id: match.id },
      data: {
        predictedOutcome: p.predictedOutcome,
        predictedObjection: p.predictedObjection,
        recommendedAngle: p.recommendedAngle,
        predictedReplyLikelihood: p.predictedReplyLikelihood,
        predictionConfidence: p.confidence,
        phrasesToUse: asJson(p.phrasesToUse),
        phrasesToAvoid: asJson(p.phrasesToAvoid),
      },
    });
  }

  // 7. Campaign + cohort 1
  await prisma.campaign.create({
    data: {
      id: DEMO_IDS.campaign,
      offerId: DEMO_IDS.offer,
      name: "Demo Campaign",
      status: "active",
    },
  });

  await prisma.campaignCohort.create({
    data: {
      id: DEMO_IDS.cohort,
      campaignId: DEMO_IDS.campaign,
      cohortNumber: 1,
      status: "calibrated",
      hypothesis:
        "Agency owners respond to missed-revenue framing; tool-fatigued operators object on price.",
      notes:
        "Seeded cohort. Expect a Tool-Fatigued Operator mismatch: predicted pricing, actual implementation time.",
    },
  });

  // 8. Outbound emails (one per cached email entry)
  let emailCount = 0;
  for (const e of cached.outreachGenerator.emails) {
    const prospect = await prisma.prospect.findUnique({
      where: { offerId_email: { offerId: DEMO_IDS.offer, email: e.prospectEmail } },
      include: { matches: true },
    });
    if (!prospect) continue;
    const match = prospect.matches[0];
    await prisma.outboundEmail.create({
      data: {
        cohortId: DEMO_IDS.cohort,
        prospectId: prospect.id,
        matchId: match?.id ?? null,
        hypothesis: e.hypothesis,
        angle: e.angle,
        subject: e.subject,
        body: e.body,
        followUp1: e.followUp1,
        followUp2: e.followUp2,
        ctaText: e.ctaText,
        complianceFooter: e.complianceFooter,
        predictedReplyLikelihood: e.predictedReplyLikelihood,
        predictedObjection: e.predictedObjection ?? null,
        riskWarnings: asJson(e.riskWarnings ?? []),
        qualityScores: asJson({
          relevance: 8,
          specificity: 7,
          brevity: 9,
          ctaClarity: 9,
          objectionPreEmption: 7,
          truthfulness: "pass",
          compliance: "pass",
        }),
        status: "sent",
        approvedAt: new Date("2026-05-09T13:30:00Z"),
        approvedBy: "demo-founder",
        sentAt: new Date("2026-05-09T13:45:00Z"),
        gmailMessageId: `demo-msg-${prospect.id.slice(0, 8)}`,
        gmailThreadId: `demo-thread-${prospect.id.slice(0, 8)}`,
      },
    });
    emailCount += 1;
  }

  // 9. Reply analyses (from cached parser output keyed by reply id, but we
  // attach by prospect email via the staged replies file).
  const repliesFile = (await import("./sample-data")).loadSampleReplies();
  const parserMap = cached.responseParser.byReplyId as Record<string, AnyRecord>;
  let replyCount = 0;
  for (const r of repliesFile.replies) {
    const email = await prisma.outboundEmail.findFirst({
      where: {
        cohortId: DEMO_IDS.cohort,
        prospect: { email: r.prospectEmail },
      },
    });
    if (!email) continue;
    const parsed = parserMap[r.id] ?? {};
    await prisma.replyAnalysis.upsert({
      where: { emailId: email.id },
      create: {
        emailId: email.id,
        rawText: r.rawText,
        receivedAt: new Date(r.receivedAt),
        senderEmail: r.senderEmail,
        senderName: r.senderName,
        source: "replay",
        outcome: String(parsed.outcome ?? r.expected.outcome),
        sentiment: String(parsed.sentiment ?? r.expected.sentiment),
        objectionType:
          (parsed.objectionType as string | null | undefined) ??
          r.expected.objectionType,
        funnelStage:
          (parsed.funnelStage as string | null | undefined) ??
          r.expected.funnelStage,
        volunteeredInfo: asJson(r.expected.volunteeredInfo),
        predictedWasCorrect: Boolean(
          parsed.predictedWasCorrect ?? r.expected.predictedWasCorrect,
        ),
        mismatchReason:
          (parsed.mismatchReason as string | null | undefined) ??
          r.expected.mismatchReason,
        parserConfidence: Number(parsed.confidence ?? r.expected.parserConfidence),
      },
      update: {
        rawText: r.rawText,
      },
    });
    await prisma.outboundEmail.update({
      where: { id: email.id },
      data: { status: "replied" },
    });
    replyCount += 1;
  }

  // 10. Calibration run + persona update for Tool-Fatigued Operator
  const calibration = cached.calibrationAgent as AnyRecord;
  const metrics = (calibration.metrics ?? {}) as AnyRecord;
  const calRun = await prisma.calibrationRun.create({
    data: {
      cohortId: DEMO_IDS.cohort,
      triggeredBy: "threshold",
      sentCount: Number(metrics.sentCount ?? emailCount),
      replyCount: Number(metrics.replyCount ?? replyCount),
      predictionAccuracy: Number(metrics.predictionAccuracy ?? 0.57),
      unpredictedObjectionRate: Number(metrics.unpredictedObjectionRate ?? 0.43),
      hostileOrUnsubscribeRate: Number(metrics.hostileOrUnsubscribeRate ?? 0),
      newObjectionClusterCount: Number(metrics.newObjectionClusterCount ?? 1),
      predictionAccuracyByArchetype: asJson(
        metrics.predictionAccuracyByArchetype ?? {},
      ),
      objectionConfusionMatrix: asJson(metrics.objectionConfusionMatrix ?? []),
      anglePerformanceByArchetype: asJson(
        metrics.anglePerformanceByArchetype ?? {},
      ),
      ctaPerformance: asJson(metrics.ctaPerformance ?? {}),
      phrasesToAvoid: asJson(metrics.phrasesToAvoid ?? []),
      newUnpredictedObjections: asJson(metrics.newUnpredictedObjections ?? []),
      summary: String(calibration.summary ?? ""),
    },
  });

  const updates = (calibration.updates ?? []) as Array<AnyRecord>;
  for (const u of updates) {
    const archetypeId = archetypeIds[String(u.archetypeName)];
    if (!archetypeId) continue;
    const archetype = await prisma.buyerArchetype.findUnique({
      where: { id: archetypeId },
      include: { activeVersion: true },
    });
    if (!archetype || !archetype.activeVersion) continue;
    const fromVersion = archetype.activeVersion;

    const newVersion = await prisma.buyerArchetypeVersion.create({
      data: {
        archetypeId,
        versionNumber: fromVersion.versionNumber + 1,
        segment: fromVersion.segment,
        role: fromVersion.role,
        description: fromVersion.description,
        currentWorkflow: fromVersion.currentWorkflow,
        painIntensity: fromVersion.painIntensity,
        buyingPower: fromVersion.buyingPower,
        riskTolerance: fromVersion.riskTolerance,
        voiceStyle: fromVersion.voiceStyle,
        predictedReplyLikelihood: 0.42,
        topObjection: "implementation_time",
        bestAngle: "one-evening setup, drafts only",
        confidence: Number(u.confidenceAfter ?? 0.78),
        predictedObjections: asJson(u.newPredictedObjections ?? []),
        preferredAngles: asJson(u.newPreferredAngles ?? []),
        dislikedPhrases: asJson(u.phrasesToAvoid ?? []),
        likelyReplyPatterns: asJson([
          "explicitly disclaims price",
          "asks about install time",
          "mentions tool freeze",
        ]),
        changeReason: String(u.reason ?? ""),
      },
    });

    await prisma.buyerArchetype.update({
      where: { id: archetypeId },
      data: { activeVersionId: newVersion.id },
    });

    await prisma.personaUpdate.create({
      data: {
        calibrationRunId: calRun.id,
        archetypeId,
        fromVersionId: fromVersion.id,
        toVersionId: newVersion.id,
        reason: String(u.reason ?? ""),
        oldPredictions: asJson(u.oldPredictions ?? {}),
        observedReality: asJson(u.observedReality ?? {}),
        newPredictedObjections: asJson(u.newPredictedObjections ?? []),
        newPreferredAngles: asJson(u.newPreferredAngles ?? []),
        phrasesToUse: asJson(u.phrasesToUse ?? []),
        phrasesToAvoid: asJson(u.phrasesToAvoid ?? []),
        confidenceAfter: Number(u.confidenceAfter ?? 0.78),
        diffSummary: asJson(u.diff ?? { added: [], removed: [], downweighted: [] }),
      },
    });
  }

  // 11. Next cohort plan
  const next = cached.nextCohort as AnyRecord;
  await prisma.nextCohortPlan.create({
    data: {
      fromCohortId: DEMO_IDS.cohort,
      summary: String(next.summary ?? ""),
      changesFromPreviousCohort: asJson(next.changesFromPreviousCohort ?? []),
      segmentsToDoubleDown: asJson(next.segmentsToDoubleDown ?? []),
      segmentsToPause: asJson(next.segmentsToPause ?? []),
      revisedMessageAngles: asJson(next.revisedMessageAngles ?? []),
      newEmailTemplates: asJson(next.newEmailTemplates ?? []),
      killCriterion: String(next.killCriterion ?? ""),
      successMetric: String(next.successMetric ?? ""),
      beforeEmailExample: next.beforeEmail ? String(next.beforeEmail) : null,
      afterEmailExample: next.afterEmail ? String(next.afterEmail) : null,
    },
  });

  return {
    workspaceId: DEMO_IDS.workspace,
    offerId: DEMO_IDS.offer,
    campaignId: DEMO_IDS.campaign,
    cohortId: DEMO_IDS.cohort,
    archetypeIds,
    prospectCount: leads.length,
    emailCount,
    replyCount,
  };
}
