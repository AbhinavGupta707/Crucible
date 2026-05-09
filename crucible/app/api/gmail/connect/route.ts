import { NextResponse, type NextRequest } from "next/server";
import {
  GmailNotConfiguredError,
  OAUTH_STATE_COOKIE,
  buildAuthUrl,
} from "../../../../lib/gmail/oauth";
import { gmailIsConfigured } from "../../../../lib/gmail/safe-mode";
import { fail, ok } from "../../../../lib/gmail/response";
import { resolveWorkspaceId } from "../../../../lib/gmail/workspace";

export const dynamic = "force-dynamic";

async function startOAuth(workspaceIdHint: string | undefined) {
  if (!gmailIsConfigured()) {
    return fail(
      "GMAIL_NOT_CONFIGURED",
      "Gmail is not configured. The app remains in demo safe mode.",
      200,
    );
  }

  const workspaceId = resolveWorkspaceId(workspaceIdHint);
  try {
    const { authUrl, stateToken } = buildAuthUrl(workspaceId);
    const res = ok({ authUrl });
    res.cookies.set(OAUTH_STATE_COOKIE, stateToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });
    return res;
  } catch (err) {
    if (err instanceof GmailNotConfiguredError) {
      return fail("GMAIL_NOT_CONFIGURED", err.message, 200);
    }
    return fail(
      "GMAIL_AUTH_URL_FAILED",
      err instanceof Error ? err.message : "Failed to build auth URL",
      500,
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let hint: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as
      | { workspaceId?: string }
      | null;
    hint = body?.workspaceId;
  } catch {
    // ignore body parse errors
  }
  return startOAuth(hint);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const hint =
    new URL(req.url).searchParams.get("workspaceId") ?? undefined;
  return startOAuth(hint);
}
