import { type NextRequest } from "next/server";
import { z } from "zod";
import { GmailNotConnectedError } from "../../../../lib/gmail/client";
import { pollReplies } from "../../../../lib/gmail/poll";
import { parseReply } from "../../../../lib/ai/workflows/parse-reply";
import { fail, ok } from "../../../../lib/gmail/response";
import { gmailIsConfigured } from "../../../../lib/gmail/safe-mode";
import { resolveWorkspaceId } from "../../../../lib/gmail/workspace";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  threadIds: z.array(z.string().min(1)).optional(),
  newerThanDays: z.number().int().min(1).max(30).optional(),
  maxMessages: z.number().int().min(1).max(100).optional(),
  analyze: z.boolean().optional(),
  prediction: z
    .object({
      emailId: z.string().min(1).optional(),
      predictedOutcome: z.string().min(1).optional(),
      predictedObjection: z.string().min(1).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  if (!gmailIsConfigured()) {
    return ok(
      { replies: [], scannedCount: 0, gmailConfigured: false },
      ["Gmail not configured; running in safe mode."],
    );
  }

  let parsed;
  try {
    const body = await req.json().catch(() => ({}));
    parsed = inputSchema.safeParse(body ?? {});
  } catch {
    return fail("VALIDATION_ERROR", "Body must be valid JSON.", 400);
  }
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.issues.map((i) => i.message).join("; "),
      400,
    );
  }

  const workspaceId = resolveWorkspaceId(parsed.data.workspaceId);
  try {
    const result = await pollReplies({
      workspaceId,
      threadIds: parsed.data.threadIds,
      newerThanDays: parsed.data.newerThanDays,
      maxMessages: parsed.data.maxMessages,
    });
    if (!result.ok) {
      return ok(
        { replies: [], scannedCount: 0, gmailConfigured: true },
        [`Gmail poll soft-failed: ${result.reason} - ${result.message}`],
      );
    }
    const analyzedReplies = parsed.data.analyze
      ? result.data.replies.map((reply) =>
          analyzeGmailReply(reply.plainText || reply.snippet, parsed.data.prediction),
        )
      : [];
    return ok({ ...result.data, gmailConfigured: true, analyzedReplies });
  } catch (err) {
    if (err instanceof GmailNotConnectedError) {
      return ok(
        { replies: [], scannedCount: 0, gmailConfigured: true },
        ["No Gmail connection; staying in safe mode."],
      );
    }
    return ok(
      { replies: [], scannedCount: 0, gmailConfigured: true },
      [
        `Gmail poll soft-failed: ${err instanceof Error ? err.message : String(err)}`,
      ],
    );
  }
}

function analyzeGmailReply(
  rawText: string,
  prediction: z.infer<typeof inputSchema>["prediction"],
) {
  const parsed = parseReply(rawText);
  const predicted = (
    prediction?.predictedObjection ??
    prediction?.predictedOutcome ??
    ""
  ).toLowerCase();
  const actual = (parsed.objectionType ?? parsed.outcome).toLowerCase();
  const predictedWasCorrect =
    predicted.length > 0 &&
    (predicted.includes(actual) || actual.includes(predicted));

  return {
    emailId: prediction?.emailId ?? null,
    outcome: parsed.outcome,
    sentiment: parsed.sentiment,
    objectionType: parsed.objectionType,
    funnelStage: parsed.funnelStage,
    volunteeredInfo: parsed.volunteeredInfo,
    predictedWasCorrect,
    mismatchReason: predictedWasCorrect
      ? null
      : `Predicted ${prediction?.predictedObjection ?? prediction?.predictedOutcome ?? "unknown"}; observed ${
          parsed.objectionType ?? parsed.outcome
        }.`,
    parserConfidence: parsed.confidence,
  };
}
