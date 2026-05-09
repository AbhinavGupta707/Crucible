import { Beaker } from "lucide-react";

export function HypothesisPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-start gap-1.5 rounded-lg border border-plasma-400/25 bg-plasma-400/5 px-2.5 py-1 text-[11px] leading-snug text-plasma-300">
      <Beaker className="mt-px h-3 w-3 shrink-0" />
      <span>
        <span className="text-plasma-400/70">Hypothesis: </span>
        {children}
      </span>
    </span>
  );
}
