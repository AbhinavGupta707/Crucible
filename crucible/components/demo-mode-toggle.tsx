"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "crucible:demo-safe-mode";

export function useDemoSafeMode() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "false") setEnabled(false);
  }, []);
  const set = (next: boolean) => {
    setEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    }
  };
  return [enabled, set] as const;
}

export function DemoModeToggle() {
  const [enabled, setEnabled] = useDemoSafeMode();
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        enabled
          ? "border-signal-green/40 bg-signal-green/10 text-signal-green hover:bg-signal-green/15"
          : "border-signal-amber/40 bg-signal-amber/10 text-signal-amber hover:bg-signal-amber/15"
      }`}
      title={
        enabled
          ? "Demo Safe Mode: no Gmail, no live AI, no real sends. Click to flip to Live Mode (UI demo only)."
          : "Live Mode (UI demo only). Click to return to Demo Safe Mode."
      }
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Demo Safe Mode</span>
      <span className="sm:hidden">Safe Mode</span>
      <span
        className={`ml-1 inline-block h-2 w-2 rounded-full ${
          enabled ? "bg-signal-green animate-pulse-soft" : "bg-signal-amber"
        }`}
      />
      <span className="text-[10px] uppercase tracking-wider opacity-70">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
