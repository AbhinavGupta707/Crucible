import { describe, expect, it } from "vitest";
import {
  base64UrlDecodeToString,
  base64UrlEncode,
  buildMime,
  formatAddress,
  formatAddressList,
} from "../../lib/gmail/mime";

describe("base64UrlEncode", () => {
  it("uses URL-safe alphabet without padding", () => {
    const out = base64UrlEncode("Hello world?>");
    expect(out).not.toMatch(/[+/=]/);
    expect(base64UrlDecodeToString(out)).toBe("Hello world?>");
  });

  it("round-trips UTF-8 content", () => {
    const txt = "Privet — мир — 漢字 — café";
    expect(base64UrlDecodeToString(base64UrlEncode(txt))).toBe(txt);
  });

  it("accepts a Uint8Array", () => {
    const bytes = new TextEncoder().encode("bytes-in");
    expect(base64UrlDecodeToString(base64UrlEncode(bytes))).toBe("bytes-in");
  });
});

describe("formatAddress", () => {
  it("returns bare email when no name is given", () => {
    expect(formatAddress({ email: "ada@example.com" })).toBe(
      "ada@example.com",
    );
  });

  it("quotes ASCII display names", () => {
    expect(
      formatAddress({ name: "Ada Lovelace", email: "ada@example.com" }),
    ).toBe('"Ada Lovelace" <ada@example.com>');
  });

  it("escapes embedded quotes in display name", () => {
    expect(
      formatAddress({ name: 'Ada "Hacker" Lovelace', email: "ada@example.com" }),
    ).toBe('"Ada \\"Hacker\\" Lovelace" <ada@example.com>');
  });

  it("encodes non-ASCII display names with RFC 2047", () => {
    const out = formatAddress({ name: "Adä Lövelace", email: "ada@example.com" });
    expect(out.startsWith("=?UTF-8?B?")).toBe(true);
    expect(out.endsWith("?= <ada@example.com>")).toBe(true);
  });

  it("formats lists comma-separated", () => {
    expect(
      formatAddressList([
        { email: "a@example.com" },
        { name: "B", email: "b@example.com" },
      ]),
    ).toBe('a@example.com, "B" <b@example.com>');
  });
});

describe("buildMime", () => {
  const baseInput = {
    from: { email: "founder@crucible.test", name: "Founder" },
    to: [{ email: "lead@example.com", name: "Lead Person" }],
    subject: "Quick question",
    text: "Hi there,\nWanted to ask one thing.\n",
    date: new Date("2026-05-09T12:34:56Z"),
    messageId: "<fixed-id@crucible.test>",
  };

  it("emits required headers in CRLF format", () => {
    const built = buildMime(baseInput);
    expect(built.raw.includes("\r\n")).toBe(true);
    expect(built.raw).toMatch(/^From: "Founder" <founder@crucible.test>\r\n/);
    expect(built.raw).toContain('To: "Lead Person" <lead@example.com>');
    expect(built.raw).toContain("Subject: Quick question");
    expect(built.raw).toContain("MIME-Version: 1.0");
    expect(built.raw).toContain("Content-Type: text/plain; charset=UTF-8");
    expect(built.raw).toContain("Date: Sat, 09 May 2026 12:34:56 +0000");
    expect(built.raw).toContain("Message-ID: <fixed-id@crucible.test>");
  });

  it("separates headers from body with a blank CRLF line", () => {
    const built = buildMime(baseInput);
    const split = built.raw.indexOf("\r\n\r\n");
    expect(split).toBeGreaterThan(0);
    const body = built.raw.slice(split + 4);
    expect(body).toContain("Wanted to ask one thing.");
  });

  it("encodes non-ASCII subject with RFC 2047", () => {
    const built = buildMime({ ...baseInput, subject: "café — résumé" });
    expect(built.raw).toMatch(/Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/);
  });

  it("normalizes LF body to CRLF", () => {
    const built = buildMime({ ...baseInput, text: "line1\nline2\nline3" });
    expect(built.raw).toContain("line1\r\nline2\r\nline3");
  });

  it("includes In-Reply-To and References when threading", () => {
    const built = buildMime({
      ...baseInput,
      inReplyTo: "<orig@example.com>",
      references: ["<orig@example.com>", "<earlier@example.com>"],
    });
    expect(built.raw).toContain("In-Reply-To: <orig@example.com>");
    expect(built.raw).toContain(
      "References: <orig@example.com> <earlier@example.com>",
    );
  });

  it("emits multipart/alternative when html is provided", () => {
    const built = buildMime({
      ...baseInput,
      html: "<p>Hi <strong>there</strong></p>",
    });
    expect(built.raw).toMatch(
      /Content-Type: multipart\/alternative; boundary="[^"]+"/,
    );
    expect(built.raw).toContain("Content-Type: text/plain; charset=UTF-8");
    expect(built.raw).toContain("Content-Type: text/html; charset=UTF-8");
    expect(built.raw).toContain("<p>Hi <strong>there</strong></p>");
  });

  it("includes Cc and Bcc headers when present", () => {
    const built = buildMime({
      ...baseInput,
      cc: [{ email: "cc@example.com" }],
      bcc: [{ email: "bcc@example.com" }],
    });
    expect(built.raw).toContain("Cc: cc@example.com");
    expect(built.raw).toContain("Bcc: bcc@example.com");
  });

  it("returns a base64URL-encoded raw payload that round-trips", () => {
    const built = buildMime(baseInput);
    expect(built.rawBase64Url).not.toMatch(/[+/=]/);
    expect(base64UrlDecodeToString(built.rawBase64Url)).toBe(built.raw);
  });

  it("rejects missing recipients", () => {
    expect(() => buildMime({ ...baseInput, to: [] })).toThrow(/To recipient/);
  });

  it("rejects missing from address", () => {
    expect(() =>
      buildMime({ ...baseInput, from: { email: "" } }),
    ).toThrow(/from\.email/);
  });
});
