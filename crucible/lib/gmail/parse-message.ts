import type { gmail_v1 } from "googleapis";
import { base64UrlDecodeToString } from "./mime";
import type { GmailReply } from "./types";

type Part = gmail_v1.Schema$MessagePart;

export function decodeMessagePartData(part: Part | undefined): string {
  const data = part?.body?.data;
  if (!data) return "";
  try {
    return base64UrlDecodeToString(data);
  } catch {
    return "";
  }
}

export function findPartByMimeType(
  part: Part | undefined,
  mimeType: string,
): Part | undefined {
  if (!part) return undefined;
  if (part.mimeType === mimeType && part.body?.data) return part;
  for (const child of part.parts ?? []) {
    const hit = findPartByMimeType(child, mimeType);
    if (hit) return hit;
  }
  return undefined;
}

export function extractPlainText(message: gmail_v1.Schema$Message): string {
  const root = message.payload;
  if (!root) return "";

  const plain = findPartByMimeType(root, "text/plain");
  if (plain) {
    const decoded = decodeMessagePartData(plain);
    if (decoded) return stripQuotedReply(decoded).trim();
  }

  const html = findPartByMimeType(root, "text/html");
  if (html) {
    const decoded = decodeMessagePartData(html);
    if (decoded) return stripQuotedReply(htmlToText(decoded)).trim();
  }

  if (root.body?.data) {
    return stripQuotedReply(base64UrlDecodeToString(root.body.data)).trim();
  }

  return (message.snippet ?? "").trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function stripQuotedReply(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^On .+ wrote:\s*$/i.test(line)) break;
    if (/^-----\s?Original Message\s?-----/i.test(line)) break;
    if (/^From: .+/i.test(line) && out.length > 0) break;
    out.push(line);
  }
  return out.join("\n");
}

function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const h of headers) {
    if ((h.name ?? "").toLowerCase() === lower) return h.value ?? undefined;
  }
  return undefined;
}

export function parseAddressHeader(
  raw: string | undefined,
): { email: string; name?: string }[] {
  if (!raw) return [];
  return raw.split(",").map((part) => {
    const trimmed = part.trim();
    const angle = trimmed.match(/^(.*)<([^>]+)>\s*$/);
    if (angle) {
      const name = angle[1].trim().replace(/^"|"$/g, "");
      return { email: angle[2].trim(), name: name || undefined };
    }
    return { email: trimmed };
  });
}

export function parseReferences(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toGmailReply(
  message: gmail_v1.Schema$Message,
): GmailReply | null {
  const headers = message.payload?.headers ?? [];
  const fromHeader = parseAddressHeader(getHeader(headers, "From"))[0];
  const toHeader = parseAddressHeader(getHeader(headers, "To"));
  if (!fromHeader || !message.id) return null;

  const dateMs = message.internalDate
    ? Number(message.internalDate)
    : Date.now();

  return {
    messageId: message.id,
    threadId: message.threadId ?? message.id,
    fromEmail: fromHeader.email,
    fromName: fromHeader.name,
    toEmails: toHeader.map((t) => t.email),
    subject: getHeader(headers, "Subject") ?? "",
    receivedAt: new Date(dateMs),
    inReplyTo: getHeader(headers, "In-Reply-To") ?? undefined,
    references: parseReferences(getHeader(headers, "References")),
    plainText: extractPlainText(message),
    snippet: message.snippet ?? "",
  };
}
