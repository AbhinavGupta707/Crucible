import { CampaignMonitor } from "@/components/campaign-monitor";

export default async function MonitorPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <CampaignMonitor offerId={offerId} />;
}
