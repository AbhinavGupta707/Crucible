"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Loading parsed replies",
  "Computing prediction accuracy by archetype",
  "Detecting unpredicted objection clusters",
  "Drafting persona update v2",
];

export function CalibrationAnimation({
  onDone,
  visible,
}: {
  onDone: () => void;
  visible: boolean;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!visible) return;
    setStep(0);
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setStep(i + 1);
        if (i === STEPS.length - 1) setTimeout(onDone, 350);
      }, 350 + i * 450),
    );
    return () => timers.forEach(clearTimeout);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="surface-raised relative overflow-hidden p-6"
    >
      <div className="shimmer pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <div className="label">Calibrating</div>
        <ul className="mt-3 space-y-2">
          {STEPS.map((label, i) => {
            const done = step > i;
            const active = step === i;
            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${
                    done
                      ? "border-signal-green/50 bg-signal-green/15 text-signal-green"
                      : active
                      ? "border-plasma-400/50 bg-plasma-400/15 text-plasma-300 animate-pulse-soft"
                      : "border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={done ? "text-white/85" : active ? "text-white" : "text-white/45"}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}
