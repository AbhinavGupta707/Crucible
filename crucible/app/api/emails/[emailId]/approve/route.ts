import type { NextRequest } from "next/server";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { emailsRepo } from "@/lib/db/repositories/emails";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { emailId: string } },
) {
  return withEnvelope(async ({ traceId }) => {
    const email = emailsRepo.findById(params.emailId);
    if (!email) return fail(ERROR_CODES.NOT_FOUND, `Email not found: ${params.emailId}`, { traceId });
    if (email.status === "approved" || email.status === "sent" || email.status === "drafted-in-gmail") {
      return ok(
        { email },
        { traceId, warnings: [`Email is already ${email.status}; no change.`] },
      );
    }
    const updated = emailsRepo.approve(email.id);
    return ok({ email: updated }, { traceId });
  });
}
