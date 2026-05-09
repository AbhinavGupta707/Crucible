import { ok } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { seedDemo } from "@/lib/demo/seed";

export const runtime = "nodejs";

export async function GET() {
  return withEnvelope(async ({ traceId }) => {
    const result = await seedDemo();
    return ok(
      {
        offerId: result.offer.id,
        campaignId: result.campaign.id,
        cohortId: result.cohort.id,
        archetypeCount: result.archetypes.length,
        prospectCount: result.prospects.length,
        created: result.created,
      },
      { traceId },
    );
  });
}

export async function POST() {
  return GET();
}
