"use client";

import { useCallback, useEffect, useState } from "react";

type GmailStatus = {
  configured: boolean;
  connected: boolean;
  safeMode: boolean;
  allowlistSize: number;
  allowlist?: string[];
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
        "surface p-5 text-white"
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

      <p className="mt-2 text-sm text-white/55">
        Controlled Gmail proof account for drafts, sends, and reply polling.
      </p>

      {status && (
        <div className="mt-4 grid gap-2 text-xs text-white/70">
          <StatusLine
            label="Sender"
            value={status.emailAddress ?? "Not connected"}
            good={status.connected}
          />
          <StatusLine
            label="Live sends"
            value={status.canSend ? "Ready" : status.safeMode ? "Blocked by safe mode" : "Not ready"}
            good={status.canSend}
          />
          <StatusLine
            label="Test recipients"
            value={`${status.allowlistSize} allowlisted`}
            good={status.allowlistSize > 0}
          />
        </div>
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
          className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-ink-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
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
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
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

function StatusLine({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-white/45">{label}</span>
      <span className={good ? "text-signal-green" : "text-signal-amber"}>
        {value}
      </span>
    </div>
  );
}
