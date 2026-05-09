"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, CheckCircle2, FileText, Mail } from "lucide-react";
import { archetypes, outboundEmails, prospects } from "./seed/data";
import { HypothesisPill } from "./hypothesis-pill";

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function OutboundForge({ offerId }: { offerId: string }) {
  const [emails, setEmails] = useState(outboundEmails);

  const byProspect = useMemo(() => {
    const map = new Map(prospects.map((p) => [p.id, p]));
    return map;
  }, []);
  const byArchetype = useMemo(() => {
    const map = new Map(archetypes.map((a) => [a.id, a]));
    return map;
  }, []);

  const approvedCount = emails.filter((e) => e.approved).length;

  function toggleApprove(id: string) {
    setEmails((all) =>
      all.map((e) =>
        e.id === id
          ? {
              ...e,
              approved: !e.approved,
              status: !e.approved ? "approved" : "draft",
            }
          : e,
      ),
    );
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Signal-to-Message Forge - cohort 1</div>
          <h2 className="mt-1 text-lg font-semibold">
            {emails.length} signal-aware drafts - {approvedCount} approved
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Every email tests an explicit hypothesis. Nothing sends until you approve. Gmail draft creation
            is opt-in.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="btn-secondary"
            disabled
            title="Workstream 5 wires the optional Gmail draft creation"
          >
            <FileText className="h-4 w-4" /> Create Gmail drafts
          </button>
          <Link href={`/runs/${offerId}/monitor`} className="btn-primary">
            Open monitor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {emails.map((e) => {
          const prospect = byProspect.get(e.prospectId);
          const archetype = byArchetype.get(e.archetypeId);
          const wc = wordCount(e.body);
          const wcOk = wc <= 120;
          return (
            <article
              key={e.id}
              className={`surface flex flex-col gap-4 p-5 transition ${
                e.approved ? "ring-1 ring-signal-green/30" : ""
              }`}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/40">
                    To - {prospect?.firstName} {prospect?.lastName} - {prospect?.company}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/40">{prospect?.email}</div>
                </div>
                <span className={`chip ${e.approved ? "chip-good" : ""}`}>
                  {e.approved ? "Approved" : "Draft"}
                </span>
              </header>

              <HypothesisPill>{e.hypothesis}</HypothesisPill>

              <div>
                <div className="label">Subject</div>
                <div className="mt-1 font-mono text-sm text-white/90">{e.subject}</div>
              </div>

              <div>
                <div className="label">Body</div>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/85">{e.body}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs sm:grid-cols-4">
                <Stat label="Reply likelihood" value={`${Math.round(e.predictedReplyLikelihood * 100)}%`} />
                <Stat label="CTA quality" value={`${e.ctaQuality}/10`} />
                <Stat
                  label="Word count"
                  value={`${wc}/120`}
                  tone={wcOk ? "chip-good" : "chip-bad"}
                />
                <Stat label="Archetype" value={archetype?.name ?? "—"} />
              </div>

              <div className="text-xs">
                <span className="text-white/40">Predicted objection: </span>
                <span className="text-white/85">{e.predictedObjection}</span>
              </div>

              {e.complianceWarnings.length > 0 ? (
                <div className="rounded-lg border border-signal-amber/30 bg-signal-amber/10 px-3 py-2 text-xs text-signal-amber">
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  {e.complianceWarnings.join(" - ")}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2 text-sm text-white/85">
                  <input
                    type="checkbox"
                    checked={e.approved}
                    onChange={() => toggleApprove(e.id)}
                    className="h-4 w-4 rounded border-white/20 bg-ink-900 text-ember-500 focus:ring-ember-400"
                  />
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${e.approved ? "text-signal-green" : "text-white/30"}`}
                    />
                    Human approval
                  </span>
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                  <Mail className="h-3 w-3" /> {e.status.replace(/_/g, " ")}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      {tone ? (
        <div className={`mt-1 ${tone}`}>{value}</div>
      ) : (
        <div className="mt-0.5 text-sm font-medium text-white/85">{value}</div>
      )}
    </div>
  );
}
