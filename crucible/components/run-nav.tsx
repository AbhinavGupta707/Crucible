"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Inbox,
  Library,
  LineChart,
  Mail,
  RefreshCcw,
  Send,
  Sparkles,
} from "lucide-react";

type Step = {
  slug: string;
  label: string;
  icon: typeof Library;
  n: number;
  highlight?: boolean;
};

const STEPS: Step[] = [
  { slug: "prospects", label: "Signal Radar", icon: Inbox, n: 2 },
  { slug: "library", label: "Buyer Memory", icon: Library, n: 3 },
  { slug: "forge", label: "Signal Forge", icon: Send, n: 4 },
  { slug: "monitor", label: "Monitor", icon: ClipboardList, n: 5 },
  { slug: "calibration", label: "Learning Loop", icon: LineChart, n: 6, highlight: true },
  { slug: "next-cohort", label: "Next Signal Cohort", icon: RefreshCcw, n: 7 },
];

export function RunNav({ offerId, title }: { offerId: string; title: string }) {
  const pathname = usePathname();
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-ember-400" /> Active run
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings/gmail"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Gmail
          </Link>
          <Link
            href={`/runs/${offerId}`}
            className="text-xs text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
          >
            Run overview
          </Link>
        </div>
      </div>
      <nav className="surface flex overflow-x-auto p-1.5 scrollbar-thin">
        {STEPS.map(({ slug, label, icon: Icon, n, highlight }) => {
          const href = `/runs/${offerId}/${slug}`;
          const active = pathname === href;
          return (
            <Link
              key={slug}
              href={href}
              className={`group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/10 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              } ${highlight && !active ? "text-ember-400/80 hover:text-ember-400" : ""}`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded text-[10px] font-semibold ${
                  active ? "bg-ember-500/20 text-ember-400" : "bg-white/5 text-white/50"
                }`}
              >
                {n}
              </span>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
