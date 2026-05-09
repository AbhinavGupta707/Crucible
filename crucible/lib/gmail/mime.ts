import type { OutboundMimeInput, RecipientAddress } from "./types";

const CRLF = "\r\n";
const ASCII_PRINTABLE = /^[\x20-\x7E]*$/;

export function base64UrlEncode(input: string | Uint8Array): string {
  const buf =
    typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlDecodeToString(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
  return Buffer.from(padded + "=".repeat(padding), "base64").toString("utf8");
}

function encodeHeaderWord(value: string): string {
  if (ASCII_PRINTABLE.test(value)) return value;
  const b64 = Buffer.from(value, "utf8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
}

function quoteDisplayName(name: string): string {
  const escaped = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function formatAddress(addr: RecipientAddress): string {
  const email = addr.email.trim();
  if (!addr.name) return email;
  const name = addr.name.trim();
  if (!name) return email;
  if (ASCII_PRINTABLE.test(name)) {
    return `${quoteDisplayName(name)} <${email}>`;
  }
  return `${encodeHeaderWord(name)} <${email}>`;
}

export function formatAddressList(addrs: RecipientAddress[]): string {
  return addrs.map(formatAddress).join(", ");
}

function foldHeader(name: string, value: string): string {
  const raw = `${name}: ${value}`;
  if (raw.length <= 998) return raw;
  const parts: string[] = [];
  let remaining = raw;
  while (remaining.length > 76) {
    let breakAt = remaining.lastIndexOf(" ", 76);
    if (breakAt <= name.length + 2) breakAt = 76;
    parts.push(remaining.slice(0, breakAt));
    remaining = remaining.slice(breakAt).trimStart();
  }
  if (remaining.length > 0) parts.push(remaining);
  return parts.join(`${CRLF} `);
}

function rfc2822Date(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = days[d.getUTCDay()];
  const date = pad(d.getUTCDate());
  const mon = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${day}, ${date} ${mon} ${year} ${hh}:${mm}:${ss} +0000`;
}

function generateMessageId(fromEmail: string): string {
  const domain = fromEmail.includes("@")
    ? fromEmail.split("@")[1]
    : "crucible.local";
  const rand =
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36);
  return `<${rand}@${domain}>`;
}

function generateBoundary(): string {
  return `=_crucible_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`;
}

function normalizeBody(body: string): string {
  return body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, CRLF);
}

export type BuiltMime = {
  raw: string;
  rawBase64Url: string;
  messageId: string;
  headers: Record<string, string>;
};

export function buildMime(input: OutboundMimeInput): BuiltMime {
  if (!input.from?.email) throw new Error("MIME: missing from.email");
  if (!input.to || input.to.length === 0)
    throw new Error("MIME: at least one To recipient required");
  if (!input.subject) throw new Error("MIME: subject required");
  if (typeof input.text !== "string")
    throw new Error("MIME: text body required");

  const date = input.date ?? new Date();
  const messageId = input.messageId ?? generateMessageId(input.from.email);

  const headerEntries: Array<[string, string]> = [];
  headerEntries.push(["From", formatAddress(input.from)]);
  headerEntries.push(["To", formatAddressList(input.to)]);
  if (input.cc && input.cc.length > 0)
    headerEntries.push(["Cc", formatAddressList(input.cc)]);
  if (input.bcc && input.bcc.length > 0)
    headerEntries.push(["Bcc", formatAddressList(input.bcc)]);
  headerEntries.push(["Subject", encodeHeaderWord(input.subject)]);
  headerEntries.push(["Date", rfc2822Date(date)]);
  headerEntries.push(["Message-ID", messageId]);
  if (input.inReplyTo) headerEntries.push(["In-Reply-To", input.inReplyTo]);
  if (input.references && input.references.length > 0) {
    headerEntries.push(["References", input.references.join(" ")]);
  }
  headerEntries.push(["MIME-Version", "1.0"]);

  const text = normalizeBody(input.text);

  let bodyBlock: string;
  if (input.html) {
    const boundary = generateBoundary();
    headerEntries.push([
      "Content-Type",
      `multipart/alternative; boundary="${boundary}"`,
    ]);
    const html = normalizeBody(input.html);
    bodyBlock = [
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      text,
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      html,
      `--${boundary}--`,
      "",
    ].join(CRLF);
  } else {
    headerEntries.push(["Content-Type", "text/plain; charset=UTF-8"]);
    headerEntries.push(["Content-Transfer-Encoding", "8bit"]);
    bodyBlock = text;
  }

  const headerLines = headerEntries.map(([k, v]) => foldHeader(k, v));
  const raw = `${headerLines.join(CRLF)}${CRLF}${CRLF}${bodyBlock}`;
  const rawBase64Url = base64UrlEncode(raw);

  const headers: Record<string, string> = {};
  for (const [k, v] of headerEntries) headers[k] = v;

  return { raw, rawBase64Url, messageId, headers };
}
