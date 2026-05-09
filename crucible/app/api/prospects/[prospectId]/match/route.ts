import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { prospectsRepo } from "@/lib/db/repositories/prospects";
import { matchProspect } from "@/lib/ai/workflows/match-prospect";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { prospectId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const prospect = prospectsRepo.findById(params.prospectId);
    if (!prospect) {
      return fail(ERROR_CODES.NOT_FOUND, `Prospect not found: ${params.prospectId}`, { traceId });
    }
    try {
      const { match, topScore, warnings } = await matchProspect(prospect);
      return ok(
        { match, topScore, prospectId: prospect.id },
        { traceId, warnings },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to match prospect.";
      return fail(ERROR_CODES.PRECONDITION_FAILED, message, { traceId });
    }
  });
}
