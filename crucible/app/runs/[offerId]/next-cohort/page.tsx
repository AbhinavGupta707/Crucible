import { NextCohortPreview } from "@/components/next-cohort-preview";

export default function NextCohortPage({ params }: { params: { offerId: string } }) {
  return <NextCohortPreview offerId={params.offerId} />;
}
