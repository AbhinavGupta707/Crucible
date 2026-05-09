import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { SuppressionEntry } from "../types";

export const suppressionRepo = {
  add(email: string, reason: SuppressionEntry["reason"]): SuppressionEntry {
    const existing = Array.from(getStore().suppression.values()).find(
      (e) => e.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) return existing;
    const entry: SuppressionEntry = {
      id: `sup_${nanoid(10)}`,
      email,
      reason,
      createdAt: new Date().toISOString(),
    };
    getStore().suppression.set(entry.id, entry);
    return entry;
  },

  isSuppressed(email: string): boolean {
    return Array.from(getStore().suppression.values()).some(
      (e) => e.email.toLowerCase() === email.toLowerCase(),
    );
  },

  list(): SuppressionEntry[] {
    return Array.from(getStore().suppression.values());
  },
};
