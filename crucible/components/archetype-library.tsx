import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { archetypes } from "./seed/data";
import { ArchetypeCard } from "./archetype-card";

export function ArchetypeLibrary({ offerId }: { offerId: string }) {
  return (
    <div className="space-y-6">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Buyer Memory - v1</div>
          <h2 className="mt-1 text-lg font-semibold">{archetypes.length} archetypes generated</h2>
          <p className="mt-1 text-sm text-white/55">
            Each card is a hypothesis. Calibration after replies will flip at least one to v2.
          </p>
        </div>
        <Link href={`/runs/${offerId}/prospects`} className="btn-primary">
          Back to Signal Radar <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {archetypes.map((a) => (
          <ArchetypeCard key={a.id} archetype={a} />
        ))}
      </div>
    </div>
  );
}
