"use client";

import { motion } from "framer-motion";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { Archetype, PersonaUpdate } from "./seed/types";

export function VersionDiff({
  archetype,
  update,
  v2,
}: {
  archetype: Archetype;
  update: PersonaUpdate;
  v2: { name: string; predictedObjections: string[]; preferredAngles: string[]; confidence: string };
}) {
  return (
    <div className="surface-raised relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px divider-glow" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ember-400" />
            Calibration event · {archetype.name}
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            v{archetype.version} <ArrowRight className="inline h-4 w-4 text-white/40" /> v
            {update.toVersion}
          </h3>
        </div>
        <div className="text-xs text-white/55">{update.reason}</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* v1 */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-white/5 bg-ink-900/80 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-white/40">v{archetype.version}</div>
            <span className="chip">{archetype.confidence} confidence</span>
          </div>
          <h4 className="mt-2 text-base font-semibold text-white/85">{archetype.name}</h4>
          <Section title="Predicted objections" items={archetype.predictedObjections} muted />
          <Section title="Preferred angles" items={archetype.preferredAngles} muted />
        </motion.div>

        {/* v2 */}
        <motion.div
          initial={{ opacity: 0, x: 8, scale: 0.99 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="rounded-2xl border border-ember-400/30 bg-ember-500/[0.06] p-5 shadow-ember"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-ember-400/80">v{update.toVersion}</div>
            <span className="chip-ember">{v2.confidence} confidence</span>
          </div>
          <h4 className="mt-2 text-base font-semibold text-white">{v2.name}</h4>
          <Section title="Predicted objections" items={v2.predictedObjections} highlight />
          <Section title="Preferred angles" items={v2.preferredAngles} highlight />
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DiffList
          title="Added"
          icon={<Plus className="h-3.5 w-3.5" />}
          items={update.added}
          tone="add"
        />
        <DiffList
          title="Removed or downweighted"
          icon={<Minus className="h-3.5 w-3.5" />}
          items={update.removed}
          tone="remove"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PhraseList title="Phrases to use" items={update.phrasesToUse} tone="good" />
        <PhraseList title="Phrases to avoid" items={update.phrasesToAvoid} tone="bad" />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  highlight,
  muted,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="label">{title}</div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it) => (
          <li
            key={it}
            className={`flex gap-2 leading-snug ${
              highlight ? "text-white" : muted ? "text-white/60 line-through decoration-white/20" : "text-white/80"
            }`}
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                highlight ? "bg-ember-400" : "bg-white/30"
              }`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiffList({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: "add" | "remove";
}) {
  const toneClass =
    tone === "add"
      ? "border-signal-green/30 bg-signal-green/5 text-signal-green"
      : "border-signal-red/30 bg-signal-red/5 text-signal-red";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
        {icon} {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-white/85">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "add" ? "bg-signal-green" : "bg-signal-red"
              }`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhraseList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" }) {
  return (
    <div className="surface p-4">
      <div className="label">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((p) => (
          <span key={p} className={tone === "good" ? "chip-good" : "chip-bad"}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
