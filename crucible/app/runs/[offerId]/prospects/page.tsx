import { ProspectTable } from "@/components/prospect-table";

export default function ProspectsPage({ params }: { params: { offerId: string } }) {
  return <ProspectTable offerId={params.offerId} />;
}
