import { getGmailClientForWorkspace } from "./client";
import { toGmailReply } from "./parse-message";
import type { GmailFailure, GmailReply, GmailResult } from "./types";

export type PollRepliesInput = {
  workspaceId: string;
  threadIds?: string[];
  newerThanDays?: number;
  maxMessages?: number;
};

export type PollRepliesResult = {
  replies: GmailReply[];
  scannedCount: number;
};

export async function pollReplies(
  input: PollRepliesInput,
): Promise<GmailResult<PollRepliesResult>> {
  try {
    const { client } = await getGmailClientForWorkspace(input.workspaceId);
    const max = input.maxMessages ?? 25;
    const replies: GmailReply[] = [];
    const seen = new Set<string>();

    if (input.threadIds && input.threadIds.length > 0) {
      for (const threadId of input.threadIds) {
        const thread = await client.users.threads.get({
          userId: "me",
          id: threadId,
          format: "full",
        });
        for (const msg of thread.data.messages ?? []) {
          if (!msg.id || seen.has(msg.id)) continue;
          if (isFromMe(msg.labelIds)) continue;
          seen.add(msg.id);
          const parsed = toGmailReply(msg);
          if (parsed) replies.push(parsed);
          if (replies.length >= max) break;
        }
        if (replies.length >= max) break;
      }
      return {
        ok: true,
        data: { replies, scannedCount: replies.length },
      };
    }

    const days = Math.max(1, input.newerThanDays ?? 7);
    const list = await client.users.messages.list({
      userId: "me",
      q: `in:inbox newer_than:${days}d -from:me`,
      maxResults: max,
    });

    const ids = (list.data.messages ?? []).map((m) => m.id).filter(
      (id): id is string => typeof id === "string",
    );

    let scanned = 0;
    for (const id of ids) {
      scanned += 1;
      const full = await client.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });
      if (isFromMe(full.data.labelIds)) continue;
      const parsed = toGmailReply(full.data);
      if (parsed) replies.push(parsed);
      if (replies.length >= max) break;
    }

    return { ok: true, data: { replies, scannedCount: scanned } };
  } catch (err) {
    const failure: GmailFailure = {
      ok: false,
      reason: "api_error",
      message: "Gmail poll failed",
      details: err,
    };
    return failure;
  }
}

function isFromMe(labelIds: string[] | null | undefined): boolean {
  if (!labelIds) return false;
  return labelIds.includes("SENT") && !labelIds.includes("INBOX");
}
