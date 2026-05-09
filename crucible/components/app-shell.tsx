import Link from "next/link";
import { Flame } from "lucide-react";
import { DemoModeToggle } from "./demo-mode-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ember-500/15 text-ember-400 ring-1 ring-ember-500/30">
              <Flame className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">Crucible</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Outbound that learns</div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <DemoModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</div>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-[11px] text-white/30">
        Crucible MVP · Demo data is synthetic. Synthetic predictions are not real market proof.
      </footer>
    </div>
  );
}
