import { google, type gmail_v1 } from "googleapis";
import { createOAuthClient, refreshIfNeeded } from "./oauth";
import { getTokenStore } from "./token-store";
import type { GmailConnection } from "./types";

export type GmailClient = gmail_v1.Gmail;

export class GmailNotConnectedError extends Error {
  constructor(workspaceId: string) {
    super(`No Gmail connection for workspace ${workspaceId}`);
    this.name = "GmailNotConnectedError";
  }
}

export async function getGmailClientForWorkspace(
  workspaceId: string,
): Promise<{ client: GmailClient; connection: GmailConnection }> {
  const stored = await getTokenStore().getByWorkspace(workspaceId);
  if (!stored) throw new GmailNotConnectedError(workspaceId);
  return getGmailClientForConnection(stored);
}

export async function getGmailClientForConnection(
  connection: GmailConnection,
): Promise<{ client: GmailClient; connection: GmailConnection }> {
  const refreshed = await refreshIfNeeded(connection);
  const oauth = createOAuthClient();
  oauth.setCredentials({
    access_token: refreshed.tokens.accessToken,
    refresh_token: refreshed.tokens.refreshToken,
    expiry_date: refreshed.tokens.expiryDate,
    scope: refreshed.tokens.scope,
    token_type: refreshed.tokens.tokenType,
    id_token: refreshed.tokens.idToken,
  });
  const client = google.gmail({ version: "v1", auth: oauth });
  return { client, connection: refreshed };
}
