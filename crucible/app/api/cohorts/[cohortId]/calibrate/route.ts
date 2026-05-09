import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { cohortsRepo } from "@/lib/db/repositories/campaigns";
import { calibrateCohort } from "@/lib/ai/workflows/calibrate";

export const runtime = "nodejs";
export const maxDuration = 60;

const inputSchema = z.object({
  triggeredBy: z.string().min(2).max(80).optional(),
  demoThresholds: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { cohortId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const cohort = cohortsRepo.findById(params.cohortId);
    if (!cohort) return fail(ERROR_CODES.NOT_FOUND, `Cohort not found: ${params.cohortId}`, { traceId });

    const parsed = await parseJsonBody(req, inputSchema.optional().default({}), traceId);
    if (!parsed.ok) return parsed.response;

    try {
      const { run, personaUpdates, warnings } = await calibrateCohort(cohort.id, {
        triggeredBy: parsed.data?.triggeredBy ?? "manual",
        demoThresholds: parsed.data?.demoThresholds ?? true,
      });
      cohortsRepo.setStatus(cohort.id, "calibrated");
      return ok(
        {
          calibrationRun: run,
          personaUpdates,
          updatedArchetypeCount: personaUpdates.length,
        },
        { traceId, warnings, status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Calibration failed.";
      return fail(ERROR_CODES.PRECONDITION_FAILED, message, { traceId });
    }
  });
}
