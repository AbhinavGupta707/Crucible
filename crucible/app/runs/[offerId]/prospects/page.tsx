import { ProspectTable } from "@/components/prospect-table";

export default async function ProspectsPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <ProspectTable offerId={offerId} />;
}
