import { describe, expect, it } from "vitest";
import {
  parseAddressHeader,
  parseReferences,
  toGmailReply,
} from "../../lib/gmail/parse-message";
import { base64UrlEncode } from "../../lib/gmail/mime";

describe("parseAddressHeader", () => {
  it("parses bare addresses", () => {
    expect(parseAddressHeader("foo@example.com")).toEqual([
      { email: "foo@example.com" },
    ]);
  });

  it("parses display-name + angle addresses", () => {
    expect(parseAddressHeader('"Lead Person" <lead@example.com>')).toEqual([
      { email: "lead@example.com", name: "Lead Person" },
    ]);
  });

  it("parses multiple addresses", () => {
    expect(
      parseAddressHeader("a@example.com, B <b@example.com>"),
    ).toEqual([
      { email: "a@example.com" },
      { email: "b@example.com", name: "B" },
    ]);
  });
});

describe("parseReferences", () => {
  it("splits whitespace-separated message ids", () => {
    expect(parseReferences("<a@x> <b@x>\n<c@x>")).toEqual([
      "<a@x>",
      "<b@x>",
      "<c@x>",
    ]);
  });

  it("returns empty for missing input", () => {
    expect(parseReferences(undefined)).toEqual([]);
  });
});

describe("toGmailReply", () => {
  it("extracts plain text body and headers", () => {
    const body = "Hi! Sounds good.\n\nOn Mon, Jan 1, 2026 at 1:00 PM Founder <me@x> wrote:\n> original";
    const reply = toGmailReply({
      id: "msg-1",
      threadId: "thread-1",
      internalDate: "1715000000000",
      snippet: "Hi! Sounds good.",
      payload: {
        headers: [
          { name: "From", value: '"Lead" <lead@example.com>' },
          { name: "To", value: "me@example.com" },
          { name: "Subject", value: "Re: Quick question" },
          { name: "In-Reply-To", value: "<orig@example.com>" },
          { name: "References", value: "<orig@example.com>" },
        ],
        mimeType: "text/plain",
        body: { data: base64UrlEncode(body) },
      },
    });

    expect(reply).not.toBeNull();
    expect(reply!.fromEmail).toBe("lead@example.com");
    expect(reply!.fromName).toBe("Lead");
    expect(reply!.subject).toBe("Re: Quick question");
    expect(reply!.inReplyTo).toBe("<orig@example.com>");
    expect(reply!.references).toEqual(["<orig@example.com>"]);
    expect(reply!.plainText).toContain("Sounds good");
    expect(reply!.plainText).not.toContain("> original");
  });

  it("falls back to HTML when no text/plain part exists", () => {
    const reply = toGmailReply({
      id: "msg-2",
      threadId: "thread-2",
      payload: {
        headers: [
          { name: "From", value: "lead@example.com" },
          { name: "To", value: "me@example.com" },
          { name: "Subject", value: "html only" },
        ],
        mimeType: "multipart/alternative",
        parts: [
          {
            mimeType: "text/html",
            body: {
              data: base64UrlEncode("<p>Hello <b>there</b></p>"),
            },
          },
        ],
      },
    });
    expect(reply!.plainText).toContain("Hello there");
  });

  it("returns null when message has no id", () => {
    expect(toGmailReply({ payload: { headers: [] } })).toBeNull();
  });
});
