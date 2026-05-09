import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { cohortsRepo } from "@/lib/db/repositories/campaigns";
import { planNextCohort } from "@/lib/ai/workflows/next-cohort";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: { cohortId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const cohort = cohortsRepo.findById(params.cohortId);
    if (!cohort) return fail(ERROR_CODES.NOT_FOUND, `Cohort not found: ${params.cohortId}`, { traceId });

    try {
      const { plan, nextCohort, warnings } = await planNextCohort(cohort.id);
      return ok(
        {
          plan,
          nextCohort,
        },
        { traceId, warnings, status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Next-cohort planning failed.";
      return fail(ERROR_CODES.PRECONDITION_FAILED, message, { traceId });
    }
  });
}
