"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

type GmailStatus = {
  safeMode: boolean;
  canSend: boolean;
};

export function DemoModeToggle() {
  const [status, setStatus] = useState<GmailStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.ok) setStatus(json.data as GmailStatus);
      } catch {
        if (!cancelled) setStatus({ safeMode: true, canSend: false });
      }
    }

    void loadStatus();
    const onFocus = () => void loadStatus();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const safeMode = status?.safeMode ?? true;
  const label = safeMode ? "Demo Safe Mode" : "Live Gmail Mode";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
        safeMode
          ? "border-signal-green/40 bg-signal-green/10 text-signal-green"
          : "border-signal-amber/40 bg-signal-amber/10 text-signal-amber"
      }`}
      title={
        safeMode
          ? "Server env has DEMO_SAFE_MODE enabled, so real sends are blocked."
          : "Server env has DEMO_SAFE_MODE disabled, so allowlisted live sends are enabled."
      }
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{safeMode ? "Safe" : "Live"}</span>
      <span
        className={`ml-1 inline-block h-2 w-2 rounded-full ${
          safeMode ? "bg-signal-green animate-pulse-soft" : "bg-signal-amber"
        }`}
      />
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {safeMode ? "ON" : "LIVE"}
      </span>
    </div>
  );
}
