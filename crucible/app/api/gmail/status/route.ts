import { type NextRequest } from "next/server";
import { ok } from "../../../../lib/gmail/response";
import {
  gmailIsConfigured,
  isDemoSafeMode,
} from "../../../../lib/gmail/safe-mode";
import { getControlledRecipients } from "../../../../lib/gmail/allowlist";
import { getTokenStore } from "../../../../lib/gmail/token-store";
import { resolveWorkspaceId } from "../../../../lib/gmail/workspace";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const workspaceId = resolveWorkspaceId(
    new URL(req.url).searchParams.get("workspaceId"),
  );
  const configured = gmailIsConfigured();
  const safeMode = isDemoSafeMode();
  const allowlist = getControlledRecipients();

  let connected = false;
  let emailAddress: string | undefined;
  if (configured) {
    const conn = await getTokenStore().getByWorkspace(workspaceId);
    if (conn) {
      connected = true;
      emailAddress = conn.emailAddress;
    }
  }

  return ok({
    configured,
    connected,
    safeMode,
    allowlistSize: allowlist.length,
    allowlist,
    emailAddress,
    canSend: configured && connected && !safeMode && allowlist.length > 0,
  });
}
