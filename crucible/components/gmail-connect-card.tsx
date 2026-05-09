"use client";

import { useCallback, useEffect, useState } from "react";

type GmailStatus = {
  configured: boolean;
  connected: boolean;
  safeMode: boolean;
  allowlistSize: number;
  emailAddress?: string;
  canSend: boolean;
};

type Props = {
  workspaceId?: string;
  className?: string;
};

export function GmailConnectCard({ workspaceId, className }: Props) {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.set("workspaceId", workspaceId);
      const res = await fetch(
        `/api/gmail/status${params.size ? `?${params}` : ""}`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "status failed");
      setStatus(json.data as GmailStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const startConnect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspaceId ? { workspaceId } : {}),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message ?? "connect failed");
      }
      const authUrl = json.data?.authUrl as string | undefined;
      if (!authUrl) throw new Error("Missing auth URL");
      window.location.assign(authUrl);
    } catch (err) {
      setConnecting(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [workspaceId]);

  return (
    <section
      className={
        className ??
        "rounded-lg border border-zinc-700 bg-zinc-900/60 p-4 text-zinc-100"
      }
      aria-label="Gmail connection"
    >
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide">
          Gmail connection
        </h3>
        <span
          className={
            status?.connected
              ? "rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300"
              : "rounded-full bg-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300"
          }
        >
          {loading
            ? "Checking..."
            : status?.connected
              ? "Connected"
              : "Optional"}
        </span>
      </header>

      <p className="mt-2 text-xs text-zinc-400">
        Gmail is optional. The demo loop runs in safe mode without it. Connect
        a controlled Gmail account to create drafts or send to approved
        recipients.
      </p>

      {status && (
        <ul className="mt-3 space-y-1 text-xs text-zinc-300">
          <li>
            Demo safe mode:{" "}
            <span className={status.safeMode ? "text-amber-300" : "text-zinc-100"}>
              {status.safeMode ? "ON (sends blocked)" : "off"}
            </span>
          </li>
          <li>
            OAuth credentials:{" "}
            <span className={status.configured ? "text-zinc-100" : "text-zinc-500"}>
              {status.configured ? "configured" : "missing"}
            </span>
          </li>
          <li>
            Controlled recipients allowlist:{" "}
            <span className="text-zinc-100">{status.allowlistSize}</span>
          </li>
          {status.emailAddress && (
            <li>
              Connected as:{" "}
              <span className="text-zinc-100">{status.emailAddress}</span>
            </li>
          )}
          <li>
            Live send permitted:{" "}
            <span className={status.canSend ? "text-emerald-300" : "text-zinc-500"}>
              {status.canSend ? "yes" : "no"}
            </span>
          </li>
        </ul>
      )}

      {error && (
        <p className="mt-3 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startConnect}
          disabled={connecting || !status?.configured}
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {connecting
            ? "Redirecting..."
            : status?.connected
              ? "Reconnect Gmail"
              : "Connect Gmail"}
        </button>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {!status?.configured && !loading && (
        <p className="mt-3 text-xs text-zinc-500">
          Set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>,{" "}
          and <code>GOOGLE_REDIRECT_URI</code> in your env to enable Gmail. The
          demo continues to work without them.
        </p>
      )}
    </section>
  );
}

export default GmailConnectCard;
