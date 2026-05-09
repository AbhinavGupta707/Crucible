import { NextCohortPreview } from "@/components/next-cohort-preview";

export default async function NextCohortPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <NextCohortPreview offerId={offerId} />;
}
