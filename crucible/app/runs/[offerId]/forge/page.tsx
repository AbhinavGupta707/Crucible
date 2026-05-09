import { OutboundForge } from "@/components/outbound-forge";

export default function ForgePage({ params }: { params: { offerId: string } }) {
  return <OutboundForge offerId={params.offerId} />;
}
