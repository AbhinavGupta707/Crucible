import { nanoid } from "nanoid";
import { getStore } from "../store";
import type { EmailStatus, OutboundEmail } from "../types";

export type EmailInput = Omit<OutboundEmail, "id" | "createdAt" | "approvedAt" | "status"> & {
  status?: EmailStatus;
};

export const emailsRepo = {
  create(input: EmailInput): OutboundEmail {
    const email: OutboundEmail = {
      id: `eml_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      status: input.status ?? "draft",
      ...input,
    };
    getStore().emails.set(email.id, email);
    return email;
  },

  upsert(email: OutboundEmail): OutboundEmail {
    getStore().emails.set(email.id, email);
    return email;
  },

  findById(id: string): OutboundEmail | undefined {
    return getStore().emails.get(id);
  },

  listByCohort(cohortId: string): OutboundEmail[] {
    return Array.from(getStore().emails.values()).filter((e) => e.cohortId === cohortId);
  },

  approve(id: string): OutboundEmail | undefined {
    const email = getStore().emails.get(id);
    if (!email) return undefined;
    email.status = "approved";
    email.approvedAt = new Date().toISOString();
    getStore().emails.set(id, email);
    return email;
  },

  setStatus(id: string, status: EmailStatus): OutboundEmail | undefined {
    const email = getStore().emails.get(id);
    if (!email) return undefined;
    email.status = status;
    getStore().emails.set(id, email);
    return email;
  },
};
