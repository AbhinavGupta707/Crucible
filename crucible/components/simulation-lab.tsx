"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PersonaReaction,
  PersonaStatus,
  simulationSeed,
} from "./seed/simulation";

interface Props {
  coldEmail: string;
  productIdea: string;
  targetBuyer: string;
  onComplete: () => void;
  onAbort: () => void;
}

const ACCENT_MAP: Record<
  PersonaReaction["accent"],
  { ring: string; bg: string; text: string; glow: string }
> = {
  amber: {
    ring: "ring-amber-400/40",
    bg: "bg-amber-400/10",
    text: "text-amber",
    glow: "shadow-[0_0_30px_-8px_rgba(255,181,71,0.45)]",
  },
  cyan: {
    ring: "ring-cyan-400/40",
    bg: "bg-cyan-400/10",
    text: "text-cyan",
    glow: "shadow-[0_0_30px_-8px_rgba(91,227,255,0.4)]",
  },
  rose: {
    ring: "ring-rose-400/40",
    bg: "bg-rose-400/10",
    text: "text-rose-300",
    glow: "shadow-[0_0_30px_-8px_rgba(244,114,182,0.35)]",
  },
  mint: {
    ring: "ring-emerald-400/40",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    glow: "shadow-[0_0_30px_-8px_rgba(74,222,128,0.35)]",
  },
  violet: {
    ring: "ring-violet-400/40",
    bg: "bg-violet-400/10",
    text: "text-violet-300",
    glow: "shadow-[0_0_30px_-8px_rgba(167,139,250,0.35)]",
  },
  slate: {
    ring: "ring-slate-400/30",
    bg: "bg-slate-400/10",
    text: "text-slate-300",
    glow: "shadow-[0_0_30px_-8px_rgba(148,163,184,0.3)]",
  },
};

const STAGE_ORDER: PersonaStatus[] = [
  "idle",
  "thinking",
  "typing",
  "responding",
  "complete",
];

const START_DELAY_MS = 550;
const PERSONA_STAGGER_MS = 900;
const STAGE_MS = 1500;
const WRAP_UP_MS = 1000;
const TICK_MS = 100;

export function SimulationLab({
  coldEmail,
  productIdea,
  targetBuyer,
  onComplete,
  onAbort,
}: Props) {
  const personas = simulationSeed.personas;
  const [statuses, setStatuses] = useState<PersonaStatus[]>(
    () => personas.map(() => "idle"),
  );
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const completedRef = useRef(false);

  // Drive each persona through its lifecycle with staggered offsets
  useEffect(() => {
    completedRef.current = false;
    const start = Date.now();
    const startOffsets = personas.map(
      (_, i) => START_DELAY_MS + i * PERSONA_STAGGER_MS,
    );

    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      setTick(Math.floor(elapsed / TICK_MS));

      const next = personas.map((_, i) => {
        const e = elapsed - startOffsets[i];
        if (e < 0) return "idle" as PersonaStatus;
        const stageIdx = Math.min(
          STAGE_ORDER.length - 1,
          1 + Math.floor(e / STAGE_MS),
        );
        return STAGE_ORDER[stageIdx];
      });
      setStatuses(next);

      const totalDuration =
        startOffsets[startOffsets.length - 1] +
        STAGE_MS * (STAGE_ORDER.length - 1) +
        WRAP_UP_MS;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);

      if (
        !completedRef.current &&
        next.every((s) => s === "complete") &&
        elapsed > totalDuration - 200
      ) {
        completedRef.current = true;
        setProgress(100);
        clearInterval(id);
      }
    }, TICK_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insightsReady = statuses.every((s) => s === "complete");

  const overallReply = useMemo(() => {
    const completed = personas.filter((_, i) => statuses[i] === "complete");
    if (completed.length === 0) return 0;
    const avg =
      completed.reduce((sum, p) => sum + p.replyLikelihood, 0) /
      completed.length;
    return Math.round(avg);
  }, [statuses, personas]);

  return (
    <section className="cockpit-grid relative w-full px-6 sm:px-10 lg:px-14 pt-8 pb-14">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 chip chip-amber mb-3">
              <span className="pulse-dot" />
              Live simulation
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              AI Simulation Lab
            </h2>
            <p className="text-sm text-muted mt-1">
              Market Reaction Simulation - Founder-led outbound
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 chip">
              <span className="font-mono">{formatElapsed(tick * TICK_MS)}</span>
              <span className="text-dim">elapsed</span>
            </div>
            <button onClick={onAbort} className="btn-ghost text-xs">
              <PauseIcon />
              Pause & edit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="label-eyebrow">Simulation progress</span>
            <span className="font-mono text-amber">{progress}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
            {progress < 100 ? (
              <motion.div
                className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-10%", "110%"] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ left: 0 }}
              />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: source message */}
          <div className="xl:col-span-3 space-y-6">
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="label-eyebrow">Source message</span>
                <span className="chip">v1</span>
              </div>
              <pre className="font-mono text-[12px] leading-relaxed text-muted whitespace-pre-wrap max-h-[260px] overflow-y-auto">
{coldEmail || "(no message provided)"}
              </pre>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <FieldLine label="Product" value={productIdea} />
                <FieldLine label="Buyer" value={targetBuyer} />
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="label-eyebrow">Sent to</span>
                <span className="chip chip-amber">{personas.length} personas</span>
              </div>
              <div className="space-y-2">
                {personas.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted truncate">{p.role}</span>
                    <StatusBadge status={statuses[i]} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: persona reactions */}
          <div className="xl:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personas.map((p, i) => (
                <PersonaCard
                  key={p.id}
                  persona={p}
                  status={statuses[i]}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Right: insights */}
          <div className="xl:col-span-3 space-y-4">
            <InsightCard
              label="Overall reply likelihood"
              value={`${overallReply}%`}
              accent="amber"
              spark
            />
            <InsightCard
              label="Personas analysed"
              value={`${statuses.filter((s) => s === "complete").length}/${personas.length}`}
              accent="cyan"
            />
            <ObjectionsCard ready={insightsReady} />
            <WeaknessesCard ready={insightsReady} />
          </div>
        </div>

        <AnimatePresence>
          {insightsReady ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 glass-strong rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="pulse-dot pulse-dot--cyan" />
                <div>
                  <div className="text-sm font-medium">
                    Reactions complete - rewrite is ready
                  </div>
                  <div className="text-xs text-muted">
                    Synthesising message strengths and rewriting against{" "}
                    {simulationSeed.objections.length} objection clusters.
                  </div>
                </div>
              </div>
              <button type="button" onClick={onComplete} className="btn-primary shrink-0">
                Reveal refined template
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px] leading-snug">
      <div className="label-eyebrow text-[10px] mb-0.5">{label}</div>
      <div className="text-muted line-clamp-2">{value || "—"}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: PersonaStatus }) {
  const map: Record<
    PersonaStatus,
    { label: string; cls: string; dot?: boolean }
  > = {
    idle: { label: "queued", cls: "text-dim border-white/10" },
    thinking: {
      label: "thinking",
      cls: "text-amber border-amber-400/30 bg-amber-400/5",
      dot: true,
    },
    typing: {
      label: "typing",
      cls: "text-amber border-amber-400/30 bg-amber-400/10",
      dot: true,
    },
    responding: {
      label: "responding",
      cls: "text-cyan border-cyan-400/30 bg-cyan-400/10",
      dot: true,
    },
    complete: {
      label: "complete",
      cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
    },
  };
  const v = map[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider",
        v.cls,
      ].join(" ")}
    >
      {v.dot ? <span className="pulse-dot" style={{ width: 6, height: 6 }} /> : null}
      {v.label}
    </span>
  );
}

function PersonaCard({
  persona,
  status,
  index,
}: {
  persona: PersonaReaction;
  status: PersonaStatus;
  index: number;
}) {
  const accent = ACCENT_MAP[persona.accent];
  const showThinking = status === "thinking";
  const showTyping = status === "typing";
  const showResponse = status === "responding" || status === "complete";
  const showFull = status === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={[
        "relative glass-strong rounded-2xl p-4 transition-shadow duration-500",
        status !== "idle" ? accent.glow : "",
      ].join(" ")}
    >
      {showThinking || showTyping ? <div className="scan-sweep" /> : null}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              "h-9 w-9 rounded-xl ring-1 flex items-center justify-center text-sm font-semibold",
              accent.ring,
              accent.bg,
              accent.text,
            ].join(" ")}
          >
            {persona.initials}
          </div>
          <div>
            <div className="text-sm font-medium">{persona.name}</div>
            <div className="text-[11px] text-muted">{persona.role}</div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="min-h-[88px]">
        {status === "idle" ? (
          <div className="text-xs text-dim">Awaiting message...</div>
        ) : null}

        {showThinking ? (
          <div className="space-y-1.5">
            {persona.thinkingTrace.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.32 }}
                className="text-[11px] text-muted flex items-center gap-2"
              >
                <span className="h-1 w-1 rounded-full bg-amber" />
                {t}
              </motion.div>
            ))}
          </div>
        ) : null}

        {showTyping ? (
          <TypewriterLine text={persona.reaction} speedMs={22} />
        ) : null}

        {showResponse ? (
          <div className="text-[12.5px] leading-relaxed text-muted">
            {persona.reaction}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <ReplyDial value={showResponse ? persona.replyLikelihood : 0} accent={persona.accent} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-dim">
            <span>Reply likelihood</span>
            {showResponse ? (
              <span className={accent.text}>{persona.replyLikelihood}%</span>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="h-1 mt-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className={[
                "h-full",
                persona.accent === "amber"
                  ? "bg-amber-400"
                  : persona.accent === "cyan"
                    ? "bg-cyan-400"
                    : persona.accent === "rose"
                      ? "bg-rose-400"
                      : persona.accent === "mint"
                        ? "bg-emerald-400"
                        : persona.accent === "violet"
                          ? "bg-violet-400"
                          : "bg-slate-400",
              ].join(" ")}
              initial={{ width: 0 }}
              animate={{ width: showResponse ? `${persona.replyLikelihood}%` : "0%" }}
              transition={{ duration: 0.7 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFull ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4 }}
            className="mt-3 pt-3 border-t border-white/5 space-y-2 overflow-hidden"
          >
            <MicroLine icon="+" label="Liked" value={persona.liked} tone="mint" />
            <MicroLine icon="-" label="Disliked" value={persona.disliked} tone="rose" />
            <MicroLine icon="!" label="Objection" value={persona.objection} tone="amber" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {persona.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function MicroLine({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: "mint" | "rose" | "amber";
}) {
  const cls =
    tone === "mint"
      ? "border-emerald-400/30 text-emerald-300 bg-emerald-400/5"
      : tone === "rose"
        ? "border-rose-400/30 text-rose-300 bg-rose-400/5"
        : "border-amber-400/30 text-amber bg-amber-400/5";
  return (
    <div className="flex items-start gap-2 text-[11.5px] leading-relaxed">
      <span
        className={[
          "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-semibold",
          cls,
        ].join(" ")}
      >
        {icon}
      </span>
      <div className="text-muted">
        <span className="text-dim mr-1.5 uppercase tracking-wider text-[9.5px]">
          {label}
        </span>
        {value}
      </div>
    </div>
  );
}

function TypewriterLine({ text, speedMs }: { text: string; speedMs: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);
  return (
    <div className="text-[12.5px] leading-relaxed text-muted">
      <span className="typing-cursor">{shown}</span>
    </div>
  );
}

function ReplyDial({
  value,
  accent,
}: {
  value: number;
  accent: PersonaReaction["accent"];
}) {
  const stroke =
    accent === "amber"
      ? "#ffb547"
      : accent === "cyan"
        ? "#5be3ff"
        : accent === "rose"
          ? "#f472b6"
          : accent === "mint"
            ? "#4ade80"
            : accent === "violet"
              ? "#a78bfa"
              : "#94a3b8";
  const r = 16;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
          fill="none"
        />
        <motion.circle
          cx="20"
          cy="20"
          r={r}
          stroke={stroke}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 0.7 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted">
        {value}
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  accent,
  spark,
}: {
  label: string;
  value: string;
  accent: "amber" | "cyan";
  spark?: boolean;
}) {
  return (
    <div className="glass-strong rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="label-eyebrow">{label}</span>
        <span
          className={`h-2 w-2 rounded-full ${
            accent === "amber" ? "bg-ember-400" : "bg-plasma-300"
          }`}
        />
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      {spark ? <Sparkline /> : null}
    </div>
  );
}

function Sparkline() {
  const points = "0,18 12,16 24,14 36,12 48,9 60,10 72,7 84,5 96,3";
  return (
    <svg viewBox="0 0 96 22" className="w-full mt-2 h-6">
      <defs>
        <linearGradient id="sl" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,181,71,0.5)" />
          <stop offset="100%" stopColor="rgba(255,181,71,0)" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        stroke="#ffb547"
        strokeWidth="1.5"
        fill="none"
      />
      <polyline
        points={`${points} 96,22 0,22`}
        fill="url(#sl)"
        stroke="none"
      />
    </svg>
  );
}

function ObjectionsCard({ ready }: { ready: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="label-eyebrow">Top objection clusters</span>
        {ready ? (
          <span className="chip chip-amber">Ready</span>
        ) : (
          <span className="chip">Building...</span>
        )}
      </div>
      <div className="space-y-2.5">
        {simulationSeed.objections.map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: ready ? 1 : 0.4, x: 0 }}
            transition={{ delay: ready ? i * 0.07 : 0 }}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted">{o.label}</span>
              <span className="font-mono text-amber">{o.weight}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: ready ? `${o.weight}%` : 0 }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WeaknessesCard({ ready }: { ready: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="label-eyebrow">Message weaknesses</span>
      </div>
      <ul className="space-y-2">
        {simulationSeed.weaknesses.map((w, i) => (
          <motion.li
            key={w.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0.3 }}
            transition={{ delay: ready ? i * 0.08 : 0 }}
            className="text-[11.5px] leading-relaxed text-muted flex items-start gap-2"
          >
            <span
              className={[
                "mt-1 h-1.5 w-1.5 rounded-full",
                w.severity === "high"
                  ? "bg-rose-400"
                  : w.severity === "med"
                    ? "bg-amber"
                    : "bg-emerald-400",
              ].join(" ")}
            />
            <span>
              <span className="text-foreground">{w.label}.</span> {w.note}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `00:${m}:${s}`;
}
