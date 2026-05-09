import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { cohortsRepo } from "@/lib/db/repositories/campaigns";
import { calibrationRepo } from "@/lib/db/repositories/calibration";
import { replayReplies } from "@/lib/demo/replay";
import { calibrateCohort } from "@/lib/ai/workflows/calibrate";

export const runtime = "nodejs";

const inputSchema = z.object({
  cohortId: z.string().min(3),
  triggerCalibration: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  return withEnvelope(async ({ traceId }) => {
    const parsed = await parseJsonBody(req, inputSchema, traceId);
    if (!parsed.ok) return parsed.response;
    const { cohortId, triggerCalibration } = parsed.data;

    const cohort = cohortsRepo.findById(cohortId);
    if (!cohort) return fail(ERROR_CODES.NOT_FOUND, `Cohort not found: ${cohortId}`, { traceId });

    const warnings: string[] = [];
    let replies;
    try {
      const r = await replayReplies(cohortId);
      replies = r.replies;
      warnings.push(...r.warnings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Replay failed.";
      return fail(ERROR_CODES.PRECONDITION_FAILED, message, { traceId });
    }

    let calibrationRunId: string | null = null;
    let updatedArchetypeCount = 0;
    if (triggerCalibration) {
      try {
        const result = await calibrateCohort(cohortId, {
          triggeredBy: "replay-replies",
          demoThresholds: true,
        });
        cohortsRepo.setStatus(cohortId, "calibrated");
        calibrationRunId = result.run.id;
        updatedArchetypeCount = result.personaUpdates.length;
        warnings.push(...result.warnings);
      } catch (err) {
        warnings.push(
          `Auto-calibration after replay failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else {
      const latest = calibrationRepo.listRunsByCohort(cohortId);
      calibrationRunId = latest[latest.length - 1]?.id ?? null;
    }

    return ok(
      {
        cohortId,
        repliesCount: replies.length,
        replies,
        calibrationRunId,
        updatedArchetypeCount,
      },
      { traceId, warnings, status: 201 },
    );
  });
}
