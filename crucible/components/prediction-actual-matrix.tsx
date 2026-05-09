import type { CalibrationCell, ReplyOutcome } from "./seed/types";

const SHORT_LABEL: Partial<Record<ReplyOutcome, string>> = {
  positive: "Positive",
  interested_later: "Later",
  pricing_objection: "Pricing",
  trust_objection: "Trust",
  competitor_locked: "Competitor",
  implementation_objection: "Implementation",
  timing_objection: "Timing",
  no_reply: "No reply",
  wrong_person: "Wrong person",
  not_relevant: "Not relevant",
  unsubscribe: "Unsubscribe",
  hostile: "Hostile",
  bounce: "Bounce",
};

function label(o: ReplyOutcome) {
  return SHORT_LABEL[o] ?? o;
}

export function PredictionActualMatrix({ cells }: { cells: CalibrationCell[] }) {
  const predictedSet = Array.from(new Set(cells.map((c) => c.predicted)));
  const actualSet = Array.from(new Set(cells.map((c) => c.actual)));

  // Order so positive/expected stays top-left, mismatches read clearly.
  const order: ReplyOutcome[] = [
    "positive",
    "interested_later",
    "pricing_objection",
    "trust_objection",
    "implementation_objection",
    "timing_objection",
    "competitor_locked",
    "no_reply",
    "wrong_person",
    "not_relevant",
    "unsubscribe",
    "hostile",
    "bounce",
  ];
  const predicted = order.filter((o) => predictedSet.includes(o));
  const actual = order.filter((o) => actualSet.includes(o));

  const map = new Map<string, number>();
  for (const c of cells) map.set(`${c.predicted}|${c.actual}`, c.count);

  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="surface overflow-x-auto p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-white/50">
        <div>
          <span className="text-white/40">Rows: </span>predicted outcome
        </div>
        <div>
          <span className="text-white/40">Cols: </span>actual outcome
        </div>
      </div>
      <div
        className="grid gap-1.5 text-[11px]"
        style={{ gridTemplateColumns: `minmax(140px,140px) repeat(${actual.length}, minmax(72px,1fr))` }}
      >
        <div />
        {actual.map((a) => (
          <div key={a} className="px-1 pb-1 text-center font-medium text-white/60">
            {label(a)}
          </div>
        ))}
        {predicted.map((p) => (
          <FragmentRow
            key={p}
            label={label(p)}
            cells={actual.map((a) => {
              const count = map.get(`${p}|${a}`) ?? 0;
              const isDiagonal = p === a;
              return { count, isDiagonal };
            })}
            max={max}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-white/40">
        <Legend color="bg-signal-green/40 ring-signal-green/60" label="Correct (diagonal)" />
        <Legend color="bg-signal-red/30 ring-signal-red/60" label="Mismatch" />
        <Legend color="bg-white/5 ring-white/10" label="Empty" />
      </div>
    </div>
  );
}

function FragmentRow({
  label,
  cells,
  max,
}: {
  label: string;
  cells: { count: number; isDiagonal: boolean }[];
  max: number;
}) {
  return (
    <>
      <div className="flex items-center pr-2 text-right font-medium text-white/60">{label}</div>
      {cells.map((c, i) => {
        const intensity = c.count > 0 ? Math.max(0.25, c.count / max) : 0;
        const tone =
          c.count === 0
            ? "bg-white/5 ring-1 ring-inset ring-white/5 text-white/30"
            : c.isDiagonal
            ? "ring-1 ring-inset ring-signal-green/60 text-signal-green"
            : "ring-1 ring-inset ring-signal-red/60 text-signal-red";
        const style: React.CSSProperties =
          c.count === 0
            ? {}
            : c.isDiagonal
            ? { backgroundColor: `rgba(61, 220, 151, ${0.18 + intensity * 0.35})` }
            : { backgroundColor: `rgba(255, 92, 122, ${0.18 + intensity * 0.4})` };
        return (
          <div
            key={i}
            className={`grid h-12 place-items-center rounded-md text-sm font-semibold tabular-nums ${tone}`}
            style={style}
            title={c.count === 0 ? "—" : `${c.count} ${c.isDiagonal ? "correct" : "mismatch"}`}
          >
            {c.count === 0 ? "·" : c.count}
          </div>
        );
      })}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-sm ring-1 ring-inset ${color}`} />
      {label}
    </span>
  );
}
