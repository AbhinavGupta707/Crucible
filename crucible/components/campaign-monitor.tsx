"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MailSearch, PlayCircle } from "lucide-react";
import { outboundEmails, replyAnalyses } from "./seed/data";
import { ReplyCard } from "./reply-card";

type GmailPolledReply = {
  messageId: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  receivedAt: string;
  plainText: string;
  snippet: string;
};

type GmailReplyAnalysis = {
  emailId: string | null;
  outcome: string;
  sentiment: string;
  objectionType: string | null;
  volunteeredInfo: string[];
  predictedWasCorrect: boolean;
  mismatchReason: string | null;
  parserConfidence: number;
};

export function CampaignMonitor({ offerId }: { offerId: string }) {
  const [replayed, setReplayed] = useState(false);
  const [gmailBusy, setGmailBusy] = useState(false);
  const [gmailReplies, setGmailReplies] = useState<GmailPolledReply[]>([]);
  const [gmailAnalyses, setGmailAnalyses] = useState<GmailReplyAnalysis[]>([]);
  const [gmailMessage, setGmailMessage] = useState<string | null>(null);

  const replies = useMemo(() => (replayed ? replyAnalyses : []), [replayed]);
  const firstApproved = outboundEmails.find((email) => email.approved);
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

  async function pollGmailReplies() {
    setGmailBusy(true);
    setGmailMessage(null);
    try {
      const res = await fetch("/api/gmail/poll-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newerThanDays: 1,
          maxMessages: 50,
          analyze: true,
          prediction: firstApproved
            ? {
                emailId: firstApproved.id,
                predictedObjection: firstApproved.predictedObjection,
                predictedOutcome: "positive",
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message ?? "Gmail poll failed.");
      }
      setGmailReplies(json.data?.replies ?? []);
      setGmailAnalyses(json.data?.analyzedReplies ?? []);
      const warnings = Array.isArray(json.warnings) ? json.warnings : [];
      setGmailMessage(
        warnings[0] ??
          `Polled Gmail: ${json.data?.scannedCount ?? 0} messages scanned, ${
            json.data?.replies?.length ?? 0
          } replies found.`,
      );
    } catch (err) {
      setGmailMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setGmailBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Reply monitor - Signal Cohort 1</div>
          <h2 className="mt-1 text-lg font-semibold">
            {replayed ? `${replies.length} replies parsed` : "No replies yet"}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Poll controlled Gmail replies, or replay seeded replies to unlock the guaranteed learning-loop moment.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!replayed ? (
            <button onClick={() => setReplayed(true)} className="btn-primary">
              <PlayCircle className="h-4 w-4" /> Replay seeded replies
            </button>
          ) : (
            <Link href={`/runs/${offerId}/calibration`} className="btn-primary">
              Run learning loop <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => void pollGmailReplies()}
            disabled={gmailBusy}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <MailSearch className="h-4 w-4" />
            {gmailBusy ? "Polling..." : "Poll Gmail replies"}
          </button>
        </div>
      </div>

      {gmailMessage ? (
        <div className="surface border-l-4 border-plasma-400/50 px-4 py-3 text-sm text-white/70">
          {gmailMessage}
        </div>
      ) : null}

      {gmailReplies.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {gmailReplies.map((reply, index) => (
            <LiveGmailReply
              key={reply.messageId}
              reply={reply}
              analysis={gmailAnalyses[index]}
            />
          ))}
        </section>
      ) : null}

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
            <div className="text-ember-400">Learning trigger fired</div>
            <p className="mt-1 max-w-xl">
              The Tool-Fatigued Operator archetype produced 4 implementation-objection replies vs a
              predicted pricing objection. Accuracy below 65% on a sent-count of 6.
            </p>
          </div>
          <Link href={`/runs/${offerId}/calibration`} className="btn-primary shrink-0">
            See learning loop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function LiveGmailReply({
  reply,
  analysis,
}: {
  reply: GmailPolledReply;
  analysis?: GmailReplyAnalysis;
}) {
  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">Gmail reply</div>
          <h3 className="mt-1 text-sm font-semibold text-white/90">
            {reply.fromName ?? reply.fromEmail}
          </h3>
          <p className="mt-0.5 text-xs text-white/40">{reply.subject}</p>
        </div>
        {analysis ? (
          <span className={analysis.predictedWasCorrect ? "chip-good" : "chip-ember"}>
            {analysis.predictedWasCorrect ? "Prediction matched" : "Mismatch"}
          </span>
        ) : null}
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/75">
        {reply.plainText || reply.snippet}
      </p>
      {analysis ? (
        <div className="mt-4 grid gap-3 border-t border-white/5 pt-4 text-xs sm:grid-cols-3">
          <Stat label="Outcome" value={analysis.outcome.replace(/_/g, " ")} />
          <Stat
            label="Objection"
            value={(analysis.objectionType ?? "none").replace(/_/g, " ")}
          />
          <Stat
            label="Parser confidence"
            value={`${Math.round(analysis.parserConfidence * 100)}%`}
          />
        </div>
      ) : null}
      {analysis?.mismatchReason ? (
        <p className="mt-3 text-xs text-signal-amber">{analysis.mismatchReason}</p>
      ) : null}
    </article>
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
          replies</strong> to feed them through the parser and unlock the learning-loop moment.
        </p>
      </div>
    </div>
  );
}
