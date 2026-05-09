import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { ReplyAnalysis } from "../types";

export type ReplyInput = Omit<ReplyAnalysis, "id" | "createdAt">;

export const repliesRepo = {
  upsertForEmail(input: ReplyInput): ReplyAnalysis {
    const store = getStore();
    const existing = Array.from(store.replies.values()).find((r) => r.emailId === input.emailId);
    const reply: ReplyAnalysis = existing
      ? { ...existing, ...input, createdAt: new Date().toISOString() }
      : {
          id: `rep_${nanoid(10)}`,
          createdAt: new Date().toISOString(),
          ...input,
        };
    store.replies.set(reply.id, reply);
    return reply;
  },

  findById(id: string): ReplyAnalysis | undefined {
    return getStore().replies.get(id);
  },

  findByEmail(emailId: string): ReplyAnalysis | undefined {
    return Array.from(getStore().replies.values()).find((r) => r.emailId === emailId);
  },

  listByCohort(cohortId: string): ReplyAnalysis[] {
    const store = getStore();
    const cohortEmailIds = new Set(
      Array.from(store.emails.values())
        .filter((e) => e.cohortId === cohortId)
        .map((e) => e.id),
    );
    return Array.from(store.replies.values()).filter((r) => cohortEmailIds.has(r.emailId));
  },
};
