import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { offersRepo } from "@/lib/db/repositories/offers";
import { archetypesRepo } from "@/lib/db/repositories/archetypes";
import { buildBuyerMemory } from "@/lib/ai/workflows/build-buyer-memory";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: { offerId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const offer = offersRepo.findById(params.offerId);
    if (!offer) {
      return fail(ERROR_CODES.NOT_FOUND, `Offer not found: ${params.offerId}`, { traceId });
    }

    const existing = archetypesRepo.listByOffer(offer.id);
    if (existing.length > 0) {
      return ok(
        { archetypes: existing, source: "existing" as const },
        {
          traceId,
          warnings: [`Offer already has ${existing.length} archetype(s); returning existing set.`],
        },
      );
    }

    const result = await buildBuyerMemory({ offerId: offer.id });
    return ok(
      { archetypes: result.archetypes, source: result.source },
      { traceId, warnings: result.warnings, status: 201 },
    );
  });
}
