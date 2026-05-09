import { NextResponse, type NextRequest } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  completeAuth,
} from "../../../../lib/gmail/oauth";
import { gmailIsConfigured } from "../../../../lib/gmail/safe-mode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!gmailIsConfigured()) {
    return redirectWithStatus(req, "gmail_not_configured");
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) return redirectWithStatus(req, `oauth_error:${errorParam}`);
  if (!code || !state) return redirectWithStatus(req, "missing_params");

  const expectedNonce = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  try {
    const connection = await completeAuth({
      code,
      receivedState: state,
      expectedNonce,
    });
    const res = redirectWithStatus(req, "ok", connection.emailAddress);
    res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    return redirectWithStatus(
      req,
      "oauth_failed",
      err instanceof Error ? err.message : undefined,
    );
  }
}

function redirectWithStatus(
  req: NextRequest,
  status: string,
  detail?: string,
): NextResponse {
  const target = new URL("/settings/gmail", req.url);
  target.searchParams.set("gmail_status", status);
  if (detail) target.searchParams.set("gmail_detail", detail);
  return NextResponse.redirect(target);
}
