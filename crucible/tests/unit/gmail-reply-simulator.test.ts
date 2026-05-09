import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ReplySimulatorNotConfiguredError,
  replySimulatorIsConfigured,
  triggerReplySimulator,
} from "../../lib/gmail/reply-simulator";

describe("replySimulatorIsConfigured", () => {
  it("requires both webhook URL and secret", () => {
    expect(replySimulatorIsConfigured({})).toBe(false);
    expect(
      replySimulatorIsConfigured({
        GMAIL_REPLY_SIMULATOR_URL: "https://example.com/webhook",
      }),
    ).toBe(false);
    expect(
      replySimulatorIsConfigured({
        GMAIL_REPLY_SIMULATOR_URL: "https://example.com/webhook",
        GMAIL_REPLY_SIMULATOR_SECRET: "secret",
      }),
    ).toBe(true);
  });
});

describe("triggerReplySimulator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses to trigger when webhook config is missing", async () => {
    await expect(
      triggerReplySimulator({ env: {} }),
    ).rejects.toBeInstanceOf(ReplySimulatorNotConfiguredError);
  });

  it("posts controlled demo payload with the shared secret", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ replied: 2 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await triggerReplySimulator({
      recipients: ["receiver+ops@example.com"],
      sentEmailIds: ["eml_1"],
      env: {
        GMAIL_REPLY_SIMULATOR_URL: "https://example.com/webhook",
        GMAIL_REPLY_SIMULATOR_SECRET: "shared-secret",
      },
    });

    expect(result.triggered).toBe(true);
    expect(result.replied).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/webhook?secret=shared-secret",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer shared-secret",
          "X-Crucible-Reply-Simulator-Secret": "shared-secret",
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.mode).toBe("controlled-gmail-demo");
    expect(body.secret).toBe("shared-secret");
    expect(body.recipients).toEqual(["receiver+ops@example.com"]);
    expect(body.sentEmailIds).toEqual(["eml_1"]);
  });
});
