"use client";

import { motion } from "framer-motion";

export type SimStage = "intake" | "simulating" | "rewrite" | "handoff";

const STAGES: { key: SimStage; label: string; sub: string }[] = [
  { key: "intake", label: "Message intake", sub: "Capture offer & buyer" },
  { key: "simulating", label: "Simulation Lab", sub: "Synthetic buyer reactions" },
  { key: "rewrite", label: "Refined rewrite", sub: "Before vs. after" },
  { key: "handoff", label: "Signal Radar", sub: "Real lead routing" },
];

export function SimulationProgressRail({ stage }: { stage: SimStage }) {
  const activeIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3 overflow-x-auto">
      <span className="label-eyebrow shrink-0">Pipeline</span>
      <div className="flex items-center gap-3">
        {STAGES.map((s, i) => {
          const state =
            i < activeIdx ? "done" : i === activeIdx ? "active" : "upcoming";
          return (
            <div key={s.key} className="flex items-center gap-3 shrink-0">
              <div
                className={[
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs",
                  state === "active"
                    ? "border-amber-400/50 bg-amber-400/10 text-amber"
                    : state === "done"
                      ? "border-cyan-400/40 bg-cyan-400/5 text-cyan"
                      : "border-white/10 text-dim",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold",
                    state === "active"
                      ? "bg-amber-400/25 text-amber"
                      : state === "done"
                        ? "bg-cyan-400/20 text-cyan"
                        : "bg-white/5 text-dim",
                  ].join(" ")}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="font-medium tracking-wide">{s.label}</span>
                {state === "active" ? (
                  <span className="pulse-dot ml-1" />
                ) : null}
              </div>
              {i < STAGES.length - 1 ? (
                <div className="relative h-px w-10 bg-white/10 overflow-hidden rounded-full">
                  {i < activeIdx ? (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/60 to-amber-400/60"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
