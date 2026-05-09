import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendApproved } from "../../lib/gmail/send";
import {
  gmailIsConfigured,
  isDemoSafeMode,
} from "../../lib/gmail/safe-mode";
import type { ApprovedEmail } from "../../lib/gmail/types";

const baseEmail: ApprovedEmail = {
  emailId: "email_1",
  to: { email: "demo@example.com" },
  subject: "hi",
  body: "hello",
  approved: true,
};

describe("isDemoSafeMode", () => {
  it("defaults to true when DEMO_SAFE_MODE is unset", () => {
    expect(isDemoSafeMode({} as NodeJS.ProcessEnv)).toBe(true);
  });

  it("treats 'false', '0', 'no' as off", () => {
    for (const v of ["false", "FALSE", "0", "no"]) {
      expect(
        isDemoSafeMode({ DEMO_SAFE_MODE: v } as NodeJS.ProcessEnv),
      ).toBe(false);
    }
  });

  it("treats anything else as on", () => {
    for (const v of ["true", "1", "yes", "anything"]) {
      expect(
        isDemoSafeMode({ DEMO_SAFE_MODE: v } as NodeJS.ProcessEnv),
      ).toBe(true);
    }
  });
});

describe("gmailIsConfigured", () => {
  it("requires all three OAuth env vars", () => {
    expect(gmailIsConfigured({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      gmailIsConfigured({
        GOOGLE_CLIENT_ID: "x",
        GOOGLE_CLIENT_SECRET: "y",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      gmailIsConfigured({
        GOOGLE_CLIENT_ID: "x",
        GOOGLE_CLIENT_SECRET: "y",
        GOOGLE_REDIRECT_URI: "z",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });
});

describe("sendApproved guardrails", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refuses to send when DEMO_SAFE_MODE is on, regardless of allowlist", async () => {
    const result = await sendApproved({
      workspaceId: "ws_1",
      email: baseEmail,
      env: {
        DEMO_SAFE_MODE: "true",
        GMAIL_CONTROLLED_RECIPIENTS: "demo@example.com",
      } as NodeJS.ProcessEnv,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("demo_safe_mode");
  });

  it("refuses to send unapproved emails when safe mode is off", async () => {
    const result = await sendApproved({
      workspaceId: "ws_1",
      email: { ...baseEmail, approved: false },
      env: {
        DEMO_SAFE_MODE: "false",
        GMAIL_CONTROLLED_RECIPIENTS: "demo@example.com",
      } as NodeJS.ProcessEnv,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_approved");
  });

  it("refuses to send to recipients outside the allowlist", async () => {
    const result = await sendApproved({
      workspaceId: "ws_1",
      email: { ...baseEmail, to: { email: "stranger@unknown.com" } },
      env: {
        DEMO_SAFE_MODE: "false",
        GMAIL_CONTROLLED_RECIPIENTS: "demo@example.com",
      } as NodeJS.ProcessEnv,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("outside_allowlist");
  });

  it("refuses to send when allowlist is empty", async () => {
    const result = await sendApproved({
      workspaceId: "ws_1",
      email: baseEmail,
      env: {
        DEMO_SAFE_MODE: "false",
        GMAIL_CONTROLLED_RECIPIENTS: "",
      } as NodeJS.ProcessEnv,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("outside_allowlist");
  });
});
