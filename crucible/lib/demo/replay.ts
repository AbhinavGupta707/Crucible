import { prisma } from "../db/prisma";
import { DEMO_IDS, loadCachedAiOutput, loadSampleReplies } from "./sample-data";

type AnyRecord = Record<string, unknown>;

/**
 * Loads staged replies into the given cohort and runs the cached parser.
 * Used by POST /api/demo/replay-replies. Idempotent: existing replies are
 * upserted by emailId.
 *
 * The default cohortId is the demo cohort. Pass an explicit cohortId for
 * non-demo flows (e.g. integration tests).
 */
export async function replayRepliesIntoCohort(args: {
  cohortId?: string;
} = {}): Promise<{ replyCount: number; mismatchCount: number }> {
  const cohortId = args.cohortId ?? DEMO_IDS.cohort;
  const repliesFile = loadSampleReplies();
  const cached = loadCachedAiOutput();
  const parserMap = cached.responseParser.byReplyId as Record<string, AnyRecord>;

  let replyCount = 0;
  let mismatchCount = 0;

  for (const r of repliesFile.replies) {
    const email = await prisma.outboundEmail.findFirst({
      where: { cohortId, prospect: { email: r.prospectEmail } },
    });
    if (!email) continue;

    const parsed = parserMap[r.id] ?? {};
    const predictedWasCorrect = Boolean(
      parsed.predictedWasCorrect ?? r.expected.predictedWasCorrect,
    );
    if (!predictedWasCorrect) mismatchCount += 1;

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
        volunteeredInfo: r.expected.volunteeredInfo as unknown as object,
        predictedWasCorrect,
        mismatchReason:
          (parsed.mismatchReason as string | null | undefined) ??
          r.expected.mismatchReason,
        parserConfidence: Number(parsed.confidence ?? r.expected.parserConfidence),
      },
      update: {
        rawText: r.rawText,
        outcome: String(parsed.outcome ?? r.expected.outcome),
        sentiment: String(parsed.sentiment ?? r.expected.sentiment),
        objectionType:
          (parsed.objectionType as string | null | undefined) ??
          r.expected.objectionType,
        predictedWasCorrect,
      },
    });
    await prisma.outboundEmail.update({
      where: { id: email.id },
      data: { status: "replied" },
    });
    await prisma.emailEvent.create({
      data: {
        emailId: email.id,
        type: "replay_imported",
        payload: { replyId: r.id, source: "sample-replies.json" },
      },
    });
    replyCount += 1;
  }

  return { replyCount, mismatchCount };
}
