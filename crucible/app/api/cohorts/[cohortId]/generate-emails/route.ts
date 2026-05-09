import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { campaignsRepo, cohortsRepo } from "@/lib/db/repositories/campaigns";
import { emailsRepo } from "@/lib/db/repositories/emails";
import { generateEmailsForCohort } from "@/lib/ai/workflows/generate-emails";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: { cohortId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const cohort = cohortsRepo.findById(params.cohortId);
    if (!cohort) return fail(ERROR_CODES.NOT_FOUND, `Cohort not found: ${params.cohortId}`, { traceId });
    const campaign = campaignsRepo.findById(cohort.campaignId);
    if (!campaign) return fail(ERROR_CODES.PRECONDITION_FAILED, "Cohort has no campaign.", { traceId });

    const existing = emailsRepo.listByCohort(cohort.id);
    if (existing.length > 0) {
      return ok(
        { emails: existing, source: "existing" as const },
        {
          traceId,
          warnings: [`Cohort already has ${existing.length} email(s); returning existing set.`],
        },
      );
    }

    const { emails, warnings } = await generateEmailsForCohort(cohort.id, campaign.offerId);
    cohortsRepo.setStatus(cohort.id, "ready");
    return ok(
      { emails, count: emails.length, source: "generated" as const },
      { traceId, warnings, status: 201 },
    );
  });
}
