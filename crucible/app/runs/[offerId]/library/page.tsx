import { ArchetypeLibrary } from "@/components/archetype-library";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <ArchetypeLibrary offerId={offerId} />;
}
