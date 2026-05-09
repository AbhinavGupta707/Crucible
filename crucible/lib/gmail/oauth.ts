import crypto from "node:crypto";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { gmailIsConfigured } from "./safe-mode";
import { getTokenStore } from "./token-store";
import type { GmailConnection, GmailTokens } from "./types";

export const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export const OAUTH_STATE_COOKIE = "crucible_gmail_oauth_state";

export class GmailNotConfiguredError extends Error {
  constructor() {
    super("Gmail OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.");
    this.name = "GmailNotConfiguredError";
  }
}

export function createOAuthClient(
  env: NodeJS.ProcessEnv = process.env,
): OAuth2Client {
  if (!gmailIsConfigured(env)) throw new GmailNotConfiguredError();
  return new google.auth.OAuth2({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  });
}

export type StartAuthResult = {
  authUrl: string;
  stateToken: string;
};

export function buildAuthUrl(workspaceId: string): StartAuthResult {
  const oauth = createOAuthClient();
  const stateToken = crypto.randomBytes(24).toString("hex");
  const state = encodeState({ workspaceId, nonce: stateToken });
  const authUrl = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_OAUTH_SCOPES,
    include_granted_scopes: true,
    state,
  });
  return { authUrl, stateToken };
}

type StatePayload = { workspaceId: string; nonce: string };

function encodeState(payload: StatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeState(state: string): StatePayload {
  const padded = state.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
  const json = Buffer.from(padded + "=".repeat(padding), "base64").toString(
    "utf8",
  );
  const parsed = JSON.parse(json) as StatePayload;
  if (
    !parsed ||
    typeof parsed.workspaceId !== "string" ||
    typeof parsed.nonce !== "string"
  ) {
    throw new Error("Invalid OAuth state payload");
  }
  return parsed;
}

export type CompleteAuthInput = {
  code: string;
  receivedState: string;
  expectedNonce: string | undefined;
};

export async function completeAuth(
  input: CompleteAuthInput,
): Promise<GmailConnection> {
  const payload = decodeState(input.receivedState);
  if (!input.expectedNonce || payload.nonce !== input.expectedNonce) {
    throw new Error("OAuth state mismatch");
  }

  const oauth = createOAuthClient();
  const { tokens } = await oauth.getToken(input.code);
  oauth.setCredentials(tokens);

  if (!tokens.access_token) {
    throw new Error("Gmail OAuth: no access token returned");
  }

  const profile = await google
    .oauth2({ version: "v2", auth: oauth })
    .userinfo.get();
  const emailAddress = profile.data.email;
  if (!emailAddress) throw new Error("Gmail OAuth: profile missing email");

  const stored: GmailTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
    scope: tokens.scope ?? undefined,
    tokenType: tokens.token_type ?? undefined,
    idToken: tokens.id_token ?? undefined,
  };

  return getTokenStore().upsert({
    workspaceId: payload.workspaceId,
    emailAddress,
    tokens: stored,
  });
}

export async function refreshIfNeeded(
  connection: GmailConnection,
): Promise<GmailConnection> {
  if (!connection.tokens.refreshToken) return connection;

  const expiry = connection.tokens.expiryDate ?? 0;
  const fiveMinutes = 5 * 60 * 1000;
  if (expiry - fiveMinutes > Date.now()) return connection;

  const oauth = createOAuthClient();
  oauth.setCredentials({
    access_token: connection.tokens.accessToken,
    refresh_token: connection.tokens.refreshToken,
    expiry_date: connection.tokens.expiryDate,
  });

  const { credentials } = await oauth.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Gmail token refresh failed: no access token");
  }
  return getTokenStore().updateTokens(connection.id, {
    accessToken: credentials.access_token,
    refreshToken:
      credentials.refresh_token ?? connection.tokens.refreshToken,
    expiryDate: credentials.expiry_date ?? undefined,
    scope: credentials.scope ?? connection.tokens.scope,
    tokenType: credentials.token_type ?? connection.tokens.tokenType,
    idToken: credentials.id_token ?? connection.tokens.idToken,
  });
}
