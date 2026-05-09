import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { archetypes, offer, prospects, replyAnalyses } from "@/components/seed/data";

export default async function RunOverviewPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const stats = [
    { label: "Buyer memories", value: archetypes.length },
    { label: "Priority leads", value: prospects.length },
    { label: "Replies parsed", value: replyAnalyses.filter((r) => r.actualOutcome !== "no_reply").length },
    { label: "Calibration events", value: 1 },
  ];
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-8">
        <div className="label">Offer hypothesis</div>
        <h2 className="mt-2 text-xl font-semibold">{offer.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">{offer.productSummary}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Card label="Likely buyer" value={offer.likelyBuyer} />
          <Card label="Champion" value={offer.champion} />
          <Card label="Desired CTA" value={offer.desiredCta} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface px-5 py-4">
            <div className="label">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RiskyCard items={offer.riskyAssumptions} />
        <AnglesCard items={offer.messageAngles} />
      </section>

      <Link
        href={`/runs/${offerId}/prospects`}
        className="btn-primary mx-auto mt-4 w-full sm:w-auto"
      >
        Open Signal Radar <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface px-4 py-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-sm text-white/85">{value}</div>
    </div>
  );
}

function RiskyCard({ items }: { items: string[] }) {
  return (
    <div className="surface p-5">
      <div className="label">Risky assumptions to test</div>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-signal-amber" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
function AnglesCard({ items }: { items: string[] }) {
  return (
    <div className="surface p-5">
      <div className="label">Message angles to test</div>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-plasma-400" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
