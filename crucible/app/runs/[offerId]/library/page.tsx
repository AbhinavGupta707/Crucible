import { ArchetypeLibrary } from "@/components/archetype-library";

export default function LibraryPage({ params }: { params: { offerId: string } }) {
  return <ArchetypeLibrary offerId={params.offerId} />;
}
