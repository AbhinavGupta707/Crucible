import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import type { ReplyAnalysis } from "./seed/types";

const OUTCOME_LABEL: Record<string, string> = {
  positive: "Positive",
  interested_later: "Interested later",
  wrong_person: "Wrong person",
  not_relevant: "Not relevant",
  pricing_objection: "Pricing objection",
  trust_objection: "Trust objection",
  competitor_locked: "Competitor locked",
  unsubscribe: "Unsubscribe",
  hostile: "Hostile",
  bounce: "Bounce",
  no_reply: "No reply",
  timing_objection: "Timing objection",
  implementation_objection: "Implementation objection",
};

function outcomeChip(o: string) {
  if (o === "positive") return "chip-good";
  if (o === "no_reply" || o === "bounce" || o === "wrong_person") return "chip";
  if (o === "interested_later" || o === "timing_objection") return "chip-info";
  if (o === "competitor_locked") return "chip-warn";
  if (o === "hostile" || o === "unsubscribe") return "chip-bad";
  return "chip-warn";
}

export function ReplyCard({ reply }: { reply: ReplyAnalysis }) {
  const correct = reply.predictionWasCorrect;
  const isNoReply = reply.actualOutcome === "no_reply";
  return (
    <article className={`surface p-5 ${!correct ? "ring-1 ring-signal-amber/30" : ""}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">Reply from</div>
          <div className="mt-0.5 font-mono text-sm text-white/85">{reply.sender}</div>
        </div>
        <span
          className={
            correct ? "chip-good" : "chip-warn"
          }
          title={correct ? "Prediction matched actual" : "Prediction did not match - feeds calibration"}
        >
          {correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {correct ? "Predicted correctly" : "Mismatch"}
        </span>
      </header>

      {isNoReply ? (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-white/60">
          <div className="text-xs uppercase tracking-wider text-white/40">Observed</div>
          <div className="mt-1">No reply</div>
          <div className="mt-2 text-xs text-white/45">
            Confidence: low. Possible causes: timing, deliverability, weak relevance, wrong buyer, weak CTA.
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/40">
            <MessageSquare className="h-3 w-3" /> Reply snippet
          </div>
          <p className="mt-2 italic leading-relaxed text-white/80">"{reply.rawSnippet}"</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <div className="label">Predicted</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={outcomeChip(reply.predictedOutcome)}>
              {OUTCOME_LABEL[reply.predictedOutcome]}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/60">{reply.predictedObjection}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <div className="label">Actual</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={outcomeChip(reply.actualOutcome)}>
              {OUTCOME_LABEL[reply.actualOutcome]}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/60">{reply.actualObjection}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/50">
        <div>
          Parser confidence: <span className="text-white/80">{Math.round(reply.parserConfidence * 100)}%</span>
        </div>
        {reply.volunteeredInfo.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1">
            {reply.volunteeredInfo.map((v) => (
              <span key={v} className="chip">
                {v}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
