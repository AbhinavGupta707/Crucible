import { type NextRequest } from "next/server";
import { z } from "zod";
import { createDrafts } from "../../../../lib/gmail/drafts";
import { fail, ok } from "../../../../lib/gmail/response";
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
  emails: z.array(emailSchema).min(1),
});

export async function POST(req: NextRequest) {
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
  const result = await createDrafts({
    workspaceId,
    emails: parsed.data.emails,
  });

  const warnings = result.failed.map(
    (f) => `Email ${f.emailId}: ${f.failure.reason} - ${f.failure.message}`,
  );

  return ok(
    {
      created: result.created,
      failed: result.failed.map((f) => ({
        emailId: f.emailId,
        reason: f.failure.reason,
        message: f.failure.message,
      })),
    },
    warnings,
  );
}
