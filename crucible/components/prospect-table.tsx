"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Upload } from "lucide-react";
import { archetypes, prospects } from "./seed/data";
import { MatchBadge } from "./prospect-match-badge";

export function ProspectTable({ offerId }: { offerId: string }) {
  const [q, setQ] = useState("");
  const [filterArchetype, setFilterArchetype] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return [...prospects].sort((a, b) => b.leadPriorityScore - a.leadPriorityScore).filter((p) => {
      if (filterArchetype !== "all" && p.match.archetypeId !== filterArchetype) return false;
      if (!needle) return true;
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(needle) ||
        p.company.toLowerCase().includes(needle) ||
        p.title.toLowerCase().includes(needle) ||
        p.signalType.toLowerCase().includes(needle) ||
        p.signalSummary.toLowerCase().includes(needle) ||
        p.match.archetypeName.toLowerCase().includes(needle)
      );
    });
  }, [q, filterArchetype]);

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Signal radar</div>
          <h2 className="mt-1 text-lg font-semibold">{prospects.length} leads ranked by why now</h2>
          <p className="mt-1 text-sm text-white/55">
            CSV columns: first_name, last_name, email, title, company, industry, company_size, notes,
            trigger, website, linkedin_summary, signal_type, signal_summary, signal_source,
            signal_date, signal_strength, intent_score, icp_fit_score.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button className="btn-secondary" disabled title="CSV upload wires in workstream 4">
            <Upload className="h-4 w-4" /> Upload CSV
          </button>
          <Link href={`/runs/${offerId}/forge`} className="btn-primary">
            Open signal forge <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, company, signal, title, archetype..."
            className="field pl-9"
          />
        </div>
        <select
          value={filterArchetype}
          onChange={(e) => setFilterArchetype(e.target.value)}
          className="field sm:w-72"
        >
          <option value="all">All archetypes</option>
          {archetypes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table on md+, cards on mobile */}
      <div className="hidden md:block">
        <div className="surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Signal</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Why now</th>
                <th className="px-4 py-3 font-medium">Buyer memory</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-white/5 ${i % 2 === 1 ? "bg-white/[0.015]" : ""}`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-white">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="text-xs text-white/50">
                      {p.title} - {p.company}
                    </div>
                    <div className="mt-1 text-[11px] text-white/35">{p.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-white/85">{p.signalType.replaceAll("_", " ")}</div>
                    <div className="mt-1 text-xs text-white/55">{p.signalSummary}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="chip-info">strength {p.signalStrength}</span>
                      <span className="chip">fresh {p.signalFreshness}</span>
                      <span className="chip">Fit {p.icpFitScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-2xl font-semibold text-ember-400">{p.leadPriorityScore}</div>
                    <MatchBadge confidence={p.match.confidence} />
                  </td>
                  <td className="px-4 py-3 align-top text-white/75">
                    <div>{p.whyNow}</div>
                    <div className="mt-1 text-xs text-plasma-300">{p.recommendedSignalAngle}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-white/75">
                    <div>{p.match.archetypeName}</div>
                    <div className="mt-1 text-xs text-white/45">{p.match.predictedObjection}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {p.match.riskFlags.length === 0 ? (
                      <span className="chip">none</span>
                    ) : (
                      p.match.riskFlags.map((r) => (
                        <span key={r} className="chip-warn mr-1">
                          {r}
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/50">
                    No leads match that filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-white">
                  {p.firstName} {p.lastName}
                </div>
                <div className="text-xs text-white/50">
                  {p.title} - {p.company}
                </div>
              </div>
              <MatchBadge confidence={p.match.confidence} />
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div>
                <span className="text-white/40">Signal: </span>
                <span className="text-white/85">{p.signalType.replaceAll("_", " ")}</span>
              </div>
              <div>
                <span className="text-white/40">Priority: </span>
                <span className="text-ember-400">{p.leadPriorityScore}</span>
              </div>
              <div>
                <span className="text-white/40">Why now: </span>
                <span className="text-white/85">{p.whyNow}</span>
              </div>
              <div>
                <span className="text-white/40">Buyer memory: </span>
                <span className="text-white/85">{p.match.archetypeName}</span>
              </div>
              <div>
                <span className="text-white/40">Predicted objection: </span>
                <span className="text-white/85">{p.match.predictedObjection}</span>
              </div>
              <div>
                <span className="text-white/40">Angle: </span>
                <span className="text-white/85">{p.match.recommendedAngle}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div className="surface p-6 text-center text-sm text-white/50">No leads match.</div>
        ) : null}
      </div>
    </div>
  );
}
