import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { offersRepo } from "@/lib/db/repositories/offers";
import { campaignsRepo } from "@/lib/db/repositories/campaigns";

export const runtime = "nodejs";

const inputSchema = z.object({
  offerId: z.string().min(3),
  name: z.string().min(2).max(120).optional(),
});

export async function POST(req: NextRequest) {
  return withEnvelope(async ({ traceId }) => {
    const parsed = await parseJsonBody(req, inputSchema, traceId);
    if (!parsed.ok) return parsed.response;

    const offer = offersRepo.findById(parsed.data.offerId);
    if (!offer) return fail(ERROR_CODES.NOT_FOUND, `Offer not found: ${parsed.data.offerId}`, { traceId });

    const campaign = campaignsRepo.create(offer.id, parsed.data.name ?? "Pilot Cohort");
    return ok({ campaign }, { traceId, status: 201 });
  });
}
