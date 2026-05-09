import { CampaignMonitor } from "@/components/campaign-monitor";

export default function MonitorPage({ params }: { params: { offerId: string } }) {
  return <CampaignMonitor offerId={params.offerId} />;
}
