import { describe, expect, it } from "vitest";
import {
  getControlledRecipients,
  isAllowedRecipient,
  partitionAllowlistViolations,
} from "../../lib/gmail/allowlist";

const env = (value: string | undefined): Partial<NodeJS.ProcessEnv> => ({
  GMAIL_CONTROLLED_RECIPIENTS: value,
});

describe("controlled recipient allowlist", () => {
  it("treats empty/missing config as no recipients allowed", () => {
    expect(getControlledRecipients(env(undefined))).toEqual([]);
    expect(getControlledRecipients(env(""))).toEqual([]);
    expect(isAllowedRecipient("any@example.com", env(undefined))).toBe(false);
  });

  it("matches exact addresses case-insensitively", () => {
    const e = env("Allowed@Example.com,other@example.com");
    expect(isAllowedRecipient("allowed@example.com", e)).toBe(true);
    expect(isAllowedRecipient("ALLOWED@example.com", e)).toBe(true);
    expect(isAllowedRecipient("notallowed@example.com", e)).toBe(false);
  });

  it("supports domain wildcards prefixed with @", () => {
    const e = env("@example.com");
    expect(isAllowedRecipient("anyone@example.com", e)).toBe(true);
    expect(isAllowedRecipient("anyone@other.com", e)).toBe(false);
  });

  it("partitions allowed/blocked", () => {
    const e = env("a@example.com,@allowed.com");
    const { allowed, blocked } = partitionAllowlistViolations(
      ["a@example.com", "stranger@unknown.com", "user@allowed.com"],
      e,
    );
    expect(allowed).toEqual(["a@example.com", "user@allowed.com"]);
    expect(blocked).toEqual(["stranger@unknown.com"]);
  });
});
