import { isAllowedRecipient } from "./allowlist";
import { getGmailClientForWorkspace } from "./client";
import { buildMime } from "./mime";
import { isDemoSafeMode } from "./safe-mode";
import { getSuppressionChecker } from "./suppression";
import type {
  ApprovedEmail,
  GmailFailure,
  GmailResult,
  GmailSendResult,
  RecipientAddress,
} from "./types";

export type SendApprovedInput = {
  workspaceId: string;
  email: ApprovedEmail;
  fromOverride?: RecipientAddress;
  env?: NodeJS.ProcessEnv;
};

export async function sendApproved(
  input: SendApprovedInput,
): Promise<GmailResult<GmailSendResult>> {
  const env = input.env ?? process.env;

  if (isDemoSafeMode(env)) {
    return failure(
      "demo_safe_mode",
      "Refusing to send: DEMO_SAFE_MODE is enabled.",
    );
  }
  if (!input.email.approved) {
    return failure(
      "not_approved",
      `Email ${input.email.emailId} is not approved.`,
    );
  }
  const recipient = input.email.to.email;
  if (!isAllowedRecipient(recipient, env)) {
    return failure(
      "outside_allowlist",
      `Recipient ${recipient} is not in GMAIL_CONTROLLED_RECIPIENTS.`,
    );
  }
  if (await getSuppressionChecker().isSuppressed(recipient)) {
    return failure(
      "suppressed",
      `Recipient ${recipient} is on the suppression list.`,
    );
  }

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

    const res = await client.users.messages.send({
      userId: "me",
      requestBody: {
        raw: built.rawBase64Url,
        threadId: input.email.threadId,
      },
    });

    if (!res.data.id || !res.data.threadId) {
      return apiError("Gmail send response missing ids", res.data);
    }
    return {
      ok: true,
      data: { messageId: res.data.id, threadId: res.data.threadId },
    };
  } catch (err) {
    return apiError("Gmail send failed", err);
  }
}

function failure(
  reason: GmailFailure["reason"],
  message: string,
): GmailFailure {
  return { ok: false, reason, message };
}

function apiError(message: string, details: unknown): GmailFailure {
  return { ok: false, reason: "api_error", message, details };
}
