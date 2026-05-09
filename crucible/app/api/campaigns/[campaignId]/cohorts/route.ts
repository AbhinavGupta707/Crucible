import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { campaignsRepo, cohortsRepo } from "@/lib/db/repositories/campaigns";

export const runtime = "nodejs";

const inputSchema = z.object({
  cohortNumber: z.number().int().positive().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const campaign = campaignsRepo.findById(params.campaignId);
    if (!campaign) {
      return fail(ERROR_CODES.NOT_FOUND, `Campaign not found: ${params.campaignId}`, { traceId });
    }
    const parsed = await parseJsonBody(req, inputSchema.optional().default({}), traceId);
    if (!parsed.ok) return parsed.response;
    const cohort = cohortsRepo.create(campaign.id, parsed.data?.cohortNumber);
    return ok({ cohort }, { traceId, status: 201 });
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const campaign = campaignsRepo.findById(params.campaignId);
    if (!campaign) {
      return fail(ERROR_CODES.NOT_FOUND, `Campaign not found: ${params.campaignId}`, { traceId });
    }
    return ok({ cohorts: cohortsRepo.listByCampaign(campaign.id) }, { traceId });
  });
}
