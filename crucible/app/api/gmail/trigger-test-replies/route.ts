import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  ReplySimulatorNotConfiguredError,
  triggerReplySimulator,
} from "../../../../lib/gmail/reply-simulator";
import { fail, ok } from "../../../../lib/gmail/response";
import { resolveWorkspaceId } from "../../../../lib/gmail/workspace";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const inputSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  cohortId: z.string().min(1).optional(),
  recipients: z.array(z.string().email()).max(25).optional(),
  sentEmailIds: z.array(z.string().min(1)).max(25).optional(),
  scenario: z.string().min(1).max(80).optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    const body = await req.json().catch(() => ({}));
    parsed = inputSchema.safeParse(body ?? {});
  } catch {
    return fail("VALIDATION_ERROR", "Body must be valid JSON.", 400);
  }

  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  try {
    const result = await triggerReplySimulator({
      workspaceId: resolveWorkspaceId(parsed.data.workspaceId),
      cohortId: parsed.data.cohortId,
      recipients: parsed.data.recipients,
      sentEmailIds: parsed.data.sentEmailIds,
      scenario: parsed.data.scenario,
    });

    return ok({
      triggered: result.triggered,
      replied: result.replied,
      details: result.details,
      warnings: result.warnings,
    });
  } catch (err) {
    if (err instanceof ReplySimulatorNotConfiguredError) {
      return fail("REPLY_SIMULATOR_NOT_CONFIGURED", err.message, 409);
    }
    return fail(
      "REPLY_SIMULATOR_FAILED",
      err instanceof Error ? err.message : "Reply simulator trigger failed.",
      502,
    );
  }
}
