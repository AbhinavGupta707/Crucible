import { type NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "../../../../lib/gmail/response";
import { isDemoSafeMode } from "../../../../lib/gmail/safe-mode";
import { sendApproved } from "../../../../lib/gmail/send";
import { resolveWorkspaceId } from "../../../../lib/gmail/workspace";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const emailSchema = z.object({
  emailId: z.string().min(1),
  to: recipientSchema,
  subject: z.string().min(1),
  body: z.string().min(1),
  approved: z.boolean(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
});

const inputSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  email: emailSchema,
});

export async function POST(req: NextRequest) {
  if (isDemoSafeMode()) {
    return fail(
      "DEMO_SAFE_MODE",
      "Refusing to send: DEMO_SAFE_MODE is enabled.",
      403,
    );
  }

  let parsed;
  try {
    const body = await req.json();
    parsed = inputSchema.safeParse(body);
  } catch {
    return fail("VALIDATION_ERROR", "Body must be valid JSON.", 400);
  }
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.issues.map((i) => i.message).join("; "),
      400,
    );
  }

  const workspaceId = resolveWorkspaceId(parsed.data.workspaceId);
  const result = await sendApproved({ workspaceId, email: parsed.data.email });

  if (!result.ok) {
    const status = mapFailureToStatus(result.reason);
    return fail(`GMAIL_${result.reason.toUpperCase()}`, result.message, status);
  }

  return ok(result.data);
}

function mapFailureToStatus(reason: string): number {
  switch (reason) {
    case "demo_safe_mode":
    case "not_approved":
    case "outside_allowlist":
    case "suppressed":
      return 403;
    case "not_connected":
    case "missing_credentials":
      return 409;
    case "invalid_input":
      return 400;
    default:
      return 502;
  }
}
