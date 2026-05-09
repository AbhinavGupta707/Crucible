import { Sparkles, ShieldAlert, Target } from "lucide-react";
import type { Archetype } from "./seed/types";

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

function confTone(c: Archetype["confidence"]) {
  if (c === "high") return "chip-good";
  if (c === "medium") return "chip-info";
  return "chip-warn";
}

export function ArchetypeCard({ archetype }: { archetype: Archetype }) {
  return (
    <div className="surface group relative h-full overflow-hidden p-5 transition hover:border-white/15 hover:shadow-glow">
      {archetype.hasUpdatedVersion ? (
        <div className="absolute right-3 top-3 chip-ember">
          <Sparkles className="h-3 w-3" /> v2 available
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">{archetype.segment}</div>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white">{archetype.name}</h3>
          <div className="mt-0.5 text-xs text-white/50">{archetype.role}</div>
        </div>
        <div className="chip">v{archetype.version}</div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/70 line-clamp-3">{archetype.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Stat label="Reply likelihood" value={pct(archetype.predictedReplyLikelihood)} />
        <Stat label="Buying power" value={archetype.buyingPower} />
        <Stat label="Risk tolerance" value={archetype.riskTolerance} />
        <Stat label="Confidence" value={archetype.confidence} tone={confTone(archetype.confidence)} />
      </div>

      <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
        <Row icon={<ShieldAlert className="h-3.5 w-3.5 text-signal-amber" />} label="Top objection">
          {archetype.topObjection}
        </Row>
        <Row icon={<Target className="h-3.5 w-3.5 text-plasma-400" />} label="Best angle">
          {archetype.bestAngle}
        </Row>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      {tone ? (
        <div className={`mt-1 ${tone} capitalize`}>{value}</div>
      ) : (
        <div className="mt-0.5 text-sm font-medium capitalize text-white/85">{value}</div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div className="text-xs">
        <span className="text-white/40">{label}: </span>
        <span className="text-white/85">{children}</span>
      </div>
    </div>
  );
}
