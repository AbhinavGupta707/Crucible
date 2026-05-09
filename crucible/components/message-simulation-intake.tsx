"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { exampleInputs } from "./seed/simulation";

export interface IntakeValues {
  productIdea: string;
  targetBuyer: string;
  coldEmail: string;
  desiredReply: string;
}

interface Props {
  initial?: Partial<IntakeValues>;
  onRun: (values: IntakeValues) => void;
}

const FIELDS: {
  key: keyof IntakeValues;
  label: string;
  hint: string;
  type: "input" | "textarea";
  placeholder: string;
}[] = [
  {
    key: "productIdea",
    label: "Startup / product",
    hint: "What you're building",
    type: "textarea",
    placeholder:
      "e.g. We help SaaS founders simulate cold outbound on synthetic buyers before sending.",
  },
  {
    key: "targetBuyer",
    label: "Target buyer",
    hint: "Who you sell to",
    type: "input",
    placeholder:
      "e.g. Founders & growth leads at 5–50 person B2B SaaS companies.",
  },
  {
    key: "coldEmail",
    label: "Current cold email",
    hint: "Paste the draft you'd send today",
    type: "textarea",
    placeholder: "Subject: …\n\nHi {first_name}, …",
  },
  {
    key: "desiredReply",
    label: "Desired reply / CTA",
    hint: "What does success look like?",
    type: "input",
    placeholder: "e.g. 'Yes, send details' or '15-min intro next week'.",
  },
];

export function MessageSimulationIntake({ initial, onRun }: Props) {
  const [values, setValues] = useState<IntakeValues>({
    productIdea: initial?.productIdea ?? "",
    targetBuyer: initial?.targetBuyer ?? "",
    coldEmail: initial?.coldEmail ?? "",
    desiredReply: initial?.desiredReply ?? "",
  });

  const filled = Object.values(values).filter((v) => v.trim().length > 0)
    .length;
  const canRun = filled >= 3;

  const useExample = () => setValues({ ...exampleInputs });
  const clearAll = () =>
    setValues({
      productIdea: "",
      targetBuyer: "",
      coldEmail: "",
      desiredReply: "",
    });

  return (
    <section className="cockpit-grid relative w-full px-6 sm:px-10 lg:px-16 pt-10 pb-16">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left — narrative */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5"
        >
          <div className="inline-flex items-center gap-2 chip chip-amber mb-6">
            <span className="pulse-dot" />
            AI GTM Simulator
          </div>
          <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.02] tracking-tight">
            Simulate.
            <br />
            <span className="text-amber">Refine.</span>
            <br />
            Win more deals.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted leading-relaxed">
            Test your messaging, cold emails, and positioning against synthetic
            buyer personas before you ever hit send. Crucible runs your draft
            through a market lab — so you go to market with confidence.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted">
            {[
              "Realistic buyer personas & reply simulation",
              "Instant feedback on clarity, trust, and intent",
              "Refined outbound, ready to ship",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-4">
            <button onClick={useExample} className="btn-ghost text-sm">
              <SparkIcon /> Use example draft
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-dim hover:text-muted transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-[11px] tracking-widest uppercase text-dim">
            <span>Powered by</span>
            <span>Crucible Lab</span>
            <span>·</span>
            <span>Hypothesis-first</span>
            <span>·</span>
            <span>Demo safe-mode</span>
          </div>
        </motion.div>

        {/* Right — form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div className="glass-strong rounded-3xl p-6 sm:p-8 relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Run your GTM simulation
                </h2>
                <p className="text-sm text-muted mt-1">
                  Give us your offer plus a realistic buyer reply.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 chip chip-cyan">
                <span className="pulse-dot pulse-dot--cyan" />
                Demo safe-mode
              </div>
            </div>

            <div className="space-y-4">
              {FIELDS.map((f, i) => {
                const v = values[f.key];
                const filledThis = v.trim().length > 0;
                return (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * i }}
                    className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold border",
                            filledThis
                              ? "border-amber-400/50 bg-amber-400/10 text-amber"
                              : "border-white/15 text-dim",
                          ].join(" ")}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <label className="text-sm font-medium">{f.label}</label>
                      </div>
                      <span className="text-[11px] text-dim">{f.hint}</span>
                    </div>
                    {f.type === "textarea" ? (
                      <textarea
                        value={v}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        className="field-input field-textarea"
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <input
                        value={v}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        className="field-input"
                        placeholder={f.placeholder}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="text-xs text-dim">
                <span className="text-muted">{filled}</span>/4 fields ready
                {filled < 3 ? (
                  <span className="ml-2 text-amber/80">
                    · need at least 3 to simulate
                  </span>
                ) : null}
              </div>
              <button
                disabled={!canRun}
                onClick={() => canRun && onRun(values)}
                className="btn-primary"
              >
                <BoltIcon />
                Run market simulation
              </button>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-dim text-right">
            No emails are sent. Synthetic personas only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M5.6 5.6l2.8 2.8" />
      <path d="M15.6 15.6l2.8 2.8" />
      <path d="M5.6 18.4l2.8-2.8" />
      <path d="M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2L3 14h7l-1 8 11-14h-7l0-6z" />
    </svg>
  );
}
