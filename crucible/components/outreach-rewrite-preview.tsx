"use client";

import { motion } from "framer-motion";
import { simulationSeed, RewriteBlock } from "./seed/simulation";

interface Props {
  onRunAgain: () => void;
  onContinue: () => void;
}

export function OutreachRewritePreview({ onRunAgain, onContinue }: Props) {
  const { rewrite, metrics } = simulationSeed;

  return (
    <section className="cockpit-grid relative w-full px-6 sm:px-10 lg:px-14 pt-8 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 chip chip-cyan mb-3">
              <span className="pulse-dot pulse-dot--cyan" />
              Analysis complete
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Outreach Rewrite
            </h2>
            <p className="text-sm text-muted mt-1">
              Signal-aware AI · {simulationSeed.personas.length} synthetic personas
              · {simulationSeed.objections.length} objection clusters covered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onRunAgain} className="btn-ghost text-xs">
              <RefreshIcon />
              Run simulation again
            </button>
          </div>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Rewrite delta"
            value={`+${metrics.rewriteDelta}`}
            sub="message strength"
            tone="amber"
            big
          />
          <MetricCard
            label="Confidence"
            value={`${metrics.confidenceBefore} → ${metrics.confidenceAfter}`}
            sub={`+${metrics.confidenceAfter - metrics.confidenceBefore} points`}
            tone="cyan"
          />
          <MetricCard
            label="Objection coverage"
            value={`${metrics.objectionCoverageBefore}% → ${metrics.objectionCoverageAfter}%`}
            sub="addressed by rewrite"
            tone="amber"
          />
          <MetricCard
            label="CTA clarity"
            value={`${metrics.ctaClarityBefore} → ${metrics.ctaClarityAfter}`}
            sub="lower-friction ask"
            tone="cyan"
          />
        </div>

        {/* Before / After */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RewritePanel
              side="before"
              subject={rewrite.subjectBefore}
              blocks={rewrite.before}
              score={metrics.confidenceBefore}
              replyLikelihood={metrics.overallReplyLikelihoodBefore}
            />
            <RewritePanel
              side="after"
              subject={rewrite.subjectAfter}
              blocks={rewrite.after}
              score={metrics.confidenceAfter}
              replyLikelihood={metrics.overallReplyLikelihoodAfter}
            />
          </div>

          {/* Right rail */}
          <div className="xl:col-span-3 space-y-4">
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="label-eyebrow">Message strength</span>
                <span className="chip chip-amber">+{metrics.rewriteDelta}</span>
              </div>
              <div className="flex items-end gap-4">
                <ScoreRing
                  value={metrics.confidenceBefore}
                  label="Before"
                  tone="muted"
                />
                <ScoreRing
                  value={metrics.confidenceAfter}
                  label="After"
                  tone="amber"
                />
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="label-eyebrow mb-3">Improvements</div>
              <ul className="space-y-3">
                {rewrite.improvements.map((imp, i) => (
                  <motion.li
                    key={imp.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-amber-400/15 text-amber border border-amber-400/40 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <div className="text-[12px] leading-relaxed">
                      <div className="font-medium">{imp.label}</div>
                      <div className="text-muted">{imp.detail}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="label-eyebrow">Live Gmail proof</span>
                <span className="chip">later</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-muted">
                Gmail send + reply tracking happens later in Signal Forge. The
                next stage routes this rewrite into real qualified leads from
                Signal Radar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-strong rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="text-sm font-medium">
              Ready to put this rewrite in front of real buyers?
            </div>
            <div className="text-xs text-muted mt-1">
              Signal Radar will surface live qualified accounts that match the
              objections this rewrite is built to dissolve.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onRunAgain} className="btn-ghost text-sm">
              <RefreshIcon />
              Run again
            </button>
            <button onClick={onContinue} className="btn-primary">
              Continue to Signal Radar
              <ArrowRightIcon />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RewritePanel({
  side,
  subject,
  blocks,
  score,
  replyLikelihood,
}: {
  side: "before" | "after";
  subject: string;
  blocks: RewriteBlock[];
  score: number;
  replyLikelihood: number;
}) {
  const isAfter = side === "after";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isAfter ? 0.12 : 0 }}
      className={[
        "glass-strong rounded-2xl p-5 relative",
        isAfter ? "amber-glow" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              "label-eyebrow",
              isAfter ? "text-amber" : "text-muted",
            ].join(" ")}
          >
            {isAfter ? "After · refined" : "Before · weak signal"}
          </span>
          {isAfter ? (
            <span className="chip chip-amber">higher signal</span>
          ) : (
            <span className="chip">lower signal</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span>
            Reply{" "}
            <span
              className={
                isAfter ? "text-amber font-mono" : "text-foreground font-mono"
              }
            >
              {replyLikelihood}%
            </span>
          </span>
          <span className="text-dim">·</span>
          <span>
            Score{" "}
            <span
              className={
                isAfter ? "text-amber font-mono" : "text-foreground font-mono"
              }
            >
              {score}
            </span>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="text-[11px] text-dim mb-1">Subject</div>
        <div
          className={[
            "text-sm font-medium mb-3",
            isAfter ? "text-foreground" : "text-muted",
          ].join(" ")}
        >
          {subject}
        </div>
        <div className="divider mb-3" />
        <div className="space-y-2.5 text-[13px] leading-relaxed">
          {blocks.map((b, i) => (
            <BlockLine key={i} block={b} isAfter={isAfter} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function BlockLine({ block, isAfter }: { block: RewriteBlock; isAfter: boolean }) {
  const cls =
    block.highlight === "improved"
      ? "bg-amber-400/8 border-l-2 border-amber-400/60 pl-3 py-1.5 rounded-r-md"
      : block.highlight === "removed"
        ? "bg-rose-400/5 border-l-2 border-rose-400/40 pl-3 py-1.5 rounded-r-md text-muted line-through decoration-rose-400/40"
        : block.highlight === "kept"
          ? "bg-cyan-400/5 border-l-2 border-cyan-400/40 pl-3 py-1.5 rounded-r-md"
          : "";
  return (
    <div className={cls || undefined}>
      <div
        className={[
          "whitespace-pre-wrap",
          block.highlight === "removed"
            ? "text-muted"
            : isAfter
              ? "text-foreground"
              : "text-muted",
        ].join(" ")}
      >
        {block.text}
      </div>
      {block.note ? (
        <div className="text-[10.5px] mt-1 text-dim italic">{block.note}</div>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone,
  big,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "amber" | "cyan";
  big?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl p-4 border relative overflow-hidden",
        tone === "amber"
          ? "border-amber-400/20 bg-amber-400/[0.04]"
          : "border-cyan-400/20 bg-cyan-400/[0.04]",
      ].join(" ")}
    >
      <div className="label-eyebrow mb-1">{label}</div>
      <div
        className={[
          "font-semibold tracking-tight",
          big ? "text-3xl" : "text-2xl",
          tone === "amber" ? "text-amber" : "text-cyan",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted mt-1">{sub}</div>
    </div>
  );
}

function ScoreRing({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "amber" | "muted";
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const stroke = tone === "amber" ? "#ffb547" : "#475569";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={r}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
            fill="none"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            stroke={stroke}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${dash} ${c}` }}
            transition={{ duration: 0.9 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {value}
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-dim">{label}</div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 11-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
