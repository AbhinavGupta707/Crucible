import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { campaignsRepo, cohortsRepo } from "@/lib/db/repositories/campaigns";
import { prospectsRepo } from "@/lib/db/repositories/prospects";
import { generatePreflight } from "@/lib/ai/workflows/preflight";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { cohortId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const cohort = cohortsRepo.findById(params.cohortId);
    if (!cohort) return fail(ERROR_CODES.NOT_FOUND, `Cohort not found: ${params.cohortId}`, { traceId });

    const campaign = campaignsRepo.findById(cohort.campaignId);
    if (!campaign) {
      return fail(ERROR_CODES.PRECONDITION_FAILED, "Cohort has no campaign.", { traceId });
    }

    const prospects = prospectsRepo.listByOffer(campaign.offerId);
    if (prospects.length === 0) {
      return fail(
        ERROR_CODES.PRECONDITION_FAILED,
        "No prospects exist for this offer; upload CSV first.",
        { traceId },
      );
    }

    const { predictions, warnings } = await generatePreflight(
      campaign.offerId,
      prospects.map((p) => p.id),
    );
    cohortsRepo.setStatus(cohort.id, "preflight");
    return ok(
      { cohortId: cohort.id, predictions, count: predictions.length },
      { traceId, warnings },
    );
  });
}
