import { OutboundForge } from "@/components/outbound-forge";

export default async function ForgePage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <OutboundForge offerId={offerId} />;
}
