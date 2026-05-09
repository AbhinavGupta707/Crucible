function parseAddressList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getControlledRecipients(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return parseAddressList(env.GMAIL_CONTROLLED_RECIPIENTS);
}

export function isAllowedRecipient(
  email: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const allowlist = getControlledRecipients(env);
  if (allowlist.length === 0) return false;
  const normalized = email.trim().toLowerCase();
  return allowlist.some((entry) => matchesAllowlistEntry(normalized, entry));
}

function matchesAllowlistEntry(email: string, entry: string): boolean {
  if (entry.startsWith("@")) {
    return email.endsWith(entry);
  }
  return email === entry;
}

export function partitionAllowlistViolations(
  emails: string[],
  env: NodeJS.ProcessEnv = process.env,
): { allowed: string[]; blocked: string[] } {
  const allowed: string[] = [];
  const blocked: string[] = [];
  for (const e of emails) {
    if (isAllowedRecipient(e, env)) allowed.push(e);
    else blocked.push(e);
  }
  return { allowed, blocked };
}
