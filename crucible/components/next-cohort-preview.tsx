"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { nextCohortPlan } from "./seed/data";

export function NextCohortPreview({ offerId }: { offerId: string }) {
  const plan = nextCohortPlan;
  return (
    <div className="space-y-6">
      <section className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Cohort 2 plan</div>
          <h2 className="mt-1 text-lg font-semibold">Rewritten with the v2 buyer memory</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{plan.summary}</p>
        </div>
        <Link href={`/runs/${offerId}/calibration`} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to calibration
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <EmailCard
          tone="muted"
          tag="Cohort 1 · before"
          tagTone="chip"
          subject={plan.beforeEmail.subject}
          body={plan.beforeEmail.body}
          footer="Cohort 1 simulated quality · honest label, not a market result"
        />
        <EmailCard
          tone="bright"
          tag="Cohort 2 · after"
          tagTone="chip-ember"
          subject={plan.afterEmail.subject}
          body={plan.afterEmail.body}
          footer="Cohort 2 plan after calibration · still synthetic, ready for human approval"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          title="Changes from cohort 1"
          icon={<TrendingUp className="h-4 w-4 text-plasma-300" />}
          items={plan.changesFromPreviousCohort}
        />
        <PlanCard
          title="Double down on"
          icon={<Play className="h-4 w-4 text-signal-green" />}
          items={plan.segmentsToDoubleDown}
          tone="good"
        />
        <PlanCard
          title="Pause"
          icon={<Pause className="h-4 w-4 text-signal-amber" />}
          items={plan.segmentsToPause}
          tone="warn"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <div className="label">Revised hypothesis</div>
          <p className="mt-2 text-sm text-white/85">{plan.revisedHypothesis}</p>
        </div>
        <div className="grid gap-3">
          <div className="surface p-4">
            <div className="label flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-signal-green" /> Success metric
            </div>
            <p className="mt-1 text-sm text-white/85">{plan.successMetric}</p>
          </div>
          <div className="surface p-4">
            <div className="label flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-signal-red" /> Kill criterion
            </div>
            <p className="mt-1 text-sm text-white/85">{plan.killCriterion}</p>
          </div>
        </div>
      </section>

      <section className="surface-raised p-6 text-center">
        <p className="text-sm text-white/60">
          Outbound tools personalize. <span className="text-white">Crucible learns.</span>
        </p>
      </section>
    </div>
  );
}

function EmailCard({
  tag,
  tagTone,
  subject,
  body,
  footer,
  tone,
}: {
  tag: string;
  tagTone: string;
  subject: string;
  body: string;
  footer: string;
  tone: "muted" | "bright";
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`surface p-5 ${
        tone === "bright" ? "border-ember-400/30 bg-ember-500/[0.04] shadow-ember" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={tagTone}>{tag}</span>
      </div>
      <div className="mt-3">
        <div className="label">Subject</div>
        <div className={`mt-1 font-mono text-sm ${tone === "bright" ? "text-white" : "text-white/60"}`}>
          {subject}
        </div>
      </div>
      <div className="mt-3">
        <div className="label">Body</div>
        <p
          className={`mt-1 whitespace-pre-line text-sm leading-relaxed ${
            tone === "bright" ? "text-white/90" : "text-white/55"
          }`}
        >
          {body}
        </p>
      </div>
      <div className="mt-4 border-t border-white/5 pt-3 text-[11px] text-white/40">{footer}</div>
    </motion.article>
  );
}

function PlanCard({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone?: "good" | "warn";
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
        {icon} {title}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-white/85">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "good" ? "bg-signal-green" : tone === "warn" ? "bg-signal-amber" : "bg-plasma-400"
              }`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
