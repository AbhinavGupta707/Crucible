"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ListChecks, Play } from "lucide-react";
import {
  archetypeAccuracy,
  archetypes,
  calibrationMatrix,
  personaUpdate,
} from "@/components/seed/data";
import { PredictionActualMatrix } from "@/components/prediction-actual-matrix";
import { VersionDiff } from "@/components/version-diff";
import { CalibrationAnimation } from "@/components/calibration-animation";

export default function CalibrationPage({ params }: { params: { offerId: string } }) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const archetype = archetypes.find((a) => a.id === personaUpdate.archetypeId)!;

  return (
    <div className="space-y-6">
      <section className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Calibration</div>
          <h2 className="mt-1 text-lg font-semibold">
            Predicted vs actual · cohort 1
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-white/55">
            This is the moment outbound becomes a learning loop. We compare what each archetype predicted
            against what the replies actually said, then update the buyer memory.
          </p>
        </div>
        {phase === "idle" ? (
          <button onClick={() => setPhase("running")} className="btn-primary">
            <Play className="h-4 w-4" /> Run calibration
          </button>
        ) : phase === "done" ? (
          <Link href={`/runs/${params.offerId}/next-cohort`} className="btn-primary">
            Generate next cohort <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>

      {phase === "running" ? (
        <CalibrationAnimation visible onDone={() => setPhase("done")} />
      ) : null}

      {phase === "idle" ? (
        <div className="surface grid place-items-center p-10 text-center">
          <div className="max-w-md space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-white/40">
              <ListChecks className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium text-white/85">Ready to calibrate</h3>
            <p className="text-sm text-white/55">
              The parser found 8 replies. One archetype hit its trigger thresholds. Click <strong className="text-white/80">Run calibration</strong> to see the matrix and the v1 → v2 update.
            </p>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <>
          <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <PredictionActualMatrix cells={calibrationMatrix} />
            <ArchetypeAccuracyList />
          </section>

          <section>
            <VersionDiff
              archetype={archetype}
              update={personaUpdate}
              v2={{
                name: archetype.name,
                predictedObjections: personaUpdate.newPredictedObjections,
                preferredAngles: personaUpdate.newPreferredAngles,
                confidence: personaUpdate.newConfidence,
              }}
            />
          </section>

          <section className="surface flex flex-col items-start gap-3 border-l-4 border-plasma-400/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-plasma-300">Buyer memory updated</div>
              <p className="mt-1 max-w-xl text-sm text-white/70">
                Tool-Fatigued Operator was wrong about pricing. It was right about exhaustion - just for
                the wrong reason. Cohort 2 leads with implementation language.
              </p>
            </div>
            <Link href={`/runs/${params.offerId}/next-cohort`} className="btn-primary shrink-0">
              See next cohort <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </>
      ) : null}
    </div>
  );
}

function ArchetypeAccuracyList() {
  return (
    <div className="surface p-5">
      <div className="label">Accuracy by archetype</div>
      <ul className="mt-3 space-y-2.5">
        {archetypeAccuracy.map((a) => {
          const pct = Math.round(a.accuracy * 100);
          const w = Math.max(4, pct);
          const tone =
            a.shouldUpdate
              ? "bg-signal-amber"
              : a.sentCount < 5
              ? "bg-white/30"
              : pct >= 65
              ? "bg-signal-green"
              : "bg-signal-red";
          return (
            <li key={a.archetypeId} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="text-white/90">{a.archetypeName}</span>
                  {a.shouldUpdate ? <span className="ml-2 chip-ember">trigger</span> : null}
                </div>
                <div className="shrink-0 tabular-nums text-white/70">
                  {a.correctCount}/{a.sentCount} · {pct}%
                </div>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${w}%` }} />
              </div>
              {a.triggerReason ? (
                <div className="mt-1 text-[11px] text-white/45">{a.triggerReason}</div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
