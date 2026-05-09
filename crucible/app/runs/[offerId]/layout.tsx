import { RunNav } from "@/components/run-nav";
import { offer } from "@/components/seed/data";

export default function RunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ offerId: string }>;
}) {
  return <RunLayoutContent children={children} params={params} />;
}

async function RunLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return (
    <div>
      <RunNav offerId={offerId} title={offer.title} />
      {children}
    </div>
  );
}
