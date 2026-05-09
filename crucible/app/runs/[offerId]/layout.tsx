import { RunNav } from "@/components/run-nav";
import { offer } from "@/components/seed/data";

export default function RunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { offerId: string };
}) {
  return (
    <div>
      <RunNav offerId={params.offerId} title={offer.title} />
      {children}
    </div>
  );
}
