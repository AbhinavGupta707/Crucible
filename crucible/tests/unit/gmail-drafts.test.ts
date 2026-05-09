import { describe, expect, it } from "vitest";
import { createDrafts } from "../../lib/gmail/drafts";
import type { ApprovedEmail } from "../../lib/gmail/types";

describe("createDrafts batch", () => {
  it("rejects unapproved emails up front without calling Gmail", async () => {
    const emails: ApprovedEmail[] = [
      {
        emailId: "e1",
        to: { email: "demo@example.com" },
        subject: "hi",
        body: "body",
        approved: false,
      },
    ];
    const result = await createDrafts({ workspaceId: "ws_1", emails });
    expect(result.created).toEqual([]);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].failure.reason).toBe("not_approved");
  });

  it("falls back to api_error when no Gmail connection exists", async () => {
    const emails: ApprovedEmail[] = [
      {
        emailId: "e1",
        to: { email: "demo@example.com" },
        subject: "hi",
        body: "body",
        approved: true,
      },
    ];
    const result = await createDrafts({ workspaceId: "ws_no_conn", emails });
    expect(result.created).toEqual([]);
    expect(result.failed).toHaveLength(1);
    expect(["api_error", "not_connected"]).toContain(
      result.failed[0].failure.reason,
    );
  });
});
