"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { replyAnalyses } from "./seed/data";
import { ReplyCard } from "./reply-card";

export function CampaignMonitor({ offerId }: { offerId: string }) {
  const [replayed, setReplayed] = useState(false);

  const replies = useMemo(() => (replayed ? replyAnalyses : []), [replayed]);
  const summary = useMemo(() => {
    if (replies.length === 0) return null;
    const correct = replies.filter((r) => r.predictionWasCorrect).length;
    const total = replies.length;
    const noReply = replies.filter((r) => r.actualOutcome === "no_reply").length;
    return {
      total,
      correct,
      mismatch: total - correct,
      noReply,
      accuracy: correct / total,
    };
  }, [replies]);

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Campaign monitor · cohort 1</div>
          <h2 className="mt-1 text-lg font-semibold">
            {replayed ? `${replies.length} replies parsed` : "No replies yet"}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Demo Safe Mode replays seeded replies through the real parser. Live Gmail polling is opt-in
            and never required for the demo.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!replayed ? (
            <button onClick={() => setReplayed(true)} className="btn-primary">
              <PlayCircle className="h-4 w-4" /> Replay seeded replies
            </button>
          ) : (
            <Link href={`/runs/${offerId}/calibration`} className="btn-primary">
              Run calibration <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {summary ? (
        <div className="surface grid grid-cols-2 gap-px overflow-hidden bg-white/5 sm:grid-cols-4">
          <Stat label="Replies" value={summary.total} />
          <Stat label="Predicted correctly" value={summary.correct} tone="text-signal-green" />
          <Stat label="Mismatches" value={summary.mismatch} tone="text-signal-amber" />
          <Stat label="Parser confidence avg" value={`${Math.round((replies.reduce((a, r) => a + r.parserConfidence, 0) / replies.length) * 100)}%`} />
        </div>
      ) : (
        <EmptyState />
      )}

      {summary ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {replies.map((r) => (
            <ReplyCard key={r.id} reply={r} />
          ))}
        </div>
      ) : null}

      {summary ? (
        <div className="surface flex flex-col items-start gap-2 border-l-4 border-ember-400/60 p-5 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-ember-400">Calibration trigger fired</div>
            <p className="mt-1 max-w-xl">
              The Tool-Fatigued Operator archetype produced 4 implementation-objection replies vs a
              predicted pricing objection. Accuracy below 65% on a sent-count of 6.
            </p>
          </div>
          <Link href={`/runs/${offerId}/calibration`} className="btn-primary shrink-0">
            See calibration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="bg-ink-900/70 px-5 py-4">
      <div className="label">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? "text-white"}`}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="surface grid place-items-center p-12 text-center">
      <div className="max-w-md space-y-2">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-white/40">
          <PlayCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-medium text-white/85">Waiting on replies</h3>
        <p className="text-sm text-white/55">
          In Demo Safe Mode, replies are seeded. Click <strong className="text-white/80">Replay seeded
          replies</strong> to feed them through the parser and unlock the calibration moment.
        </p>
      </div>
    </div>
  );
}
