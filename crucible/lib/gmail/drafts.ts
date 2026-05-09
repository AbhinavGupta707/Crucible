import { getGmailClientForWorkspace } from "./client";
import { buildMime } from "./mime";
import type {
  ApprovedEmail,
  GmailDraftResult,
  GmailFailure,
  GmailResult,
  RecipientAddress,
} from "./types";

export type CreateDraftInput = {
  workspaceId: string;
  email: ApprovedEmail;
  fromOverride?: RecipientAddress;
};

export async function createDraft(
  input: CreateDraftInput,
): Promise<GmailResult<GmailDraftResult>> {
  try {
    const { client, connection } = await getGmailClientForWorkspace(
      input.workspaceId,
    );
    const from: RecipientAddress = input.fromOverride ?? {
      email: connection.emailAddress,
    };

    const built = buildMime({
      from,
      to: [input.email.to],
      subject: input.email.subject,
      text: input.email.body,
      inReplyTo: input.email.inReplyTo,
      references: input.email.inReplyTo ? [input.email.inReplyTo] : undefined,
    });

    const res = await client.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: built.rawBase64Url,
          threadId: input.email.threadId,
        },
      },
    });

    const draftId = res.data.id ?? undefined;
    if (!draftId) {
      return apiError("Gmail draft response missing id", res.data);
    }
    return {
      ok: true,
      data: {
        draftId,
        threadId: res.data.message?.threadId ?? undefined,
        messageId: res.data.message?.id ?? undefined,
      },
    };
  } catch (err) {
    return apiError("Gmail draft creation failed", err);
  }
}

export async function createDrafts(input: {
  workspaceId: string;
  emails: ApprovedEmail[];
}): Promise<{
  created: GmailDraftResult[];
  failed: Array<{ emailId: string; failure: GmailFailure }>;
}> {
  const created: GmailDraftResult[] = [];
  const failed: Array<{ emailId: string; failure: GmailFailure }> = [];
  for (const email of input.emails) {
    if (!email.approved) {
      failed.push({
        emailId: email.emailId,
        failure: {
          ok: false,
          reason: "not_approved",
          message: `Email ${email.emailId} is not approved.`,
        },
      });
      continue;
    }
    const result = await createDraft({ workspaceId: input.workspaceId, email });
    if (result.ok) created.push(result.data);
    else failed.push({ emailId: email.emailId, failure: result });
  }
  return { created, failed };
}

function apiError(message: string, details: unknown): GmailFailure {
  return { ok: false, reason: "api_error", message, details };
}
