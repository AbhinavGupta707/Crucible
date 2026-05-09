import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { repliesRepo } from "@/lib/db/repositories/replies";
import { emailsRepo } from "@/lib/db/repositories/emails";
import { prospectsRepo } from "@/lib/db/repositories/prospects";
import { suppressionRepo } from "@/lib/db/repositories/suppression";
import { parseReply } from "@/lib/ai/workflows/parse-reply";

export const runtime = "nodejs";

const inputSchema = z
  .object({
    rawText: z.string().min(2).optional(),
  })
  .optional()
  .default({});

export async function POST(
  req: NextRequest,
  { params }: { params: { replyId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const reply = repliesRepo.findById(params.replyId);
    if (!reply) return fail(ERROR_CODES.NOT_FOUND, `Reply not found: ${params.replyId}`, { traceId });

    const parsed = await parseJsonBody(req, inputSchema, traceId);
    if (!parsed.ok) return parsed.response;
    const rawText = parsed.data?.rawText ?? reply.rawText;

    const email = emailsRepo.findById(reply.emailId);
    const result = parseReply(rawText);
    const predictedFamily = email?.predictedObjection.toLowerCase() ?? "";
    const actualObjection = (result.objectionType ?? result.outcome).toLowerCase();
    const predictedWasCorrect =
      predictedFamily.length > 0 &&
      (predictedFamily.includes(actualObjection) || actualObjection.includes(predictedFamily));

    const updated = repliesRepo.upsertForEmail({
      emailId: reply.emailId,
      rawText,
      outcome: result.outcome,
      sentiment: result.sentiment,
      objectionType: result.objectionType,
      funnelStage: result.funnelStage,
      volunteeredInfo: result.volunteeredInfo,
      predictedWasCorrect,
      mismatchReason: predictedWasCorrect
        ? null
        : `Predicted ${email?.predictedObjection ?? "unknown"}; observed ${result.objectionType ?? result.outcome}.`,
      confidence: result.confidence,
    });

    if (email && (result.outcome === "unsubscribe" || result.outcome === "hostile" || result.outcome === "bounce")) {
      const prospect = prospectsRepo.findById(email.prospectId);
      if (prospect) suppressionRepo.add(prospect.email, result.outcome);
    }

    return ok({ reply: updated }, { traceId });
  });
}
