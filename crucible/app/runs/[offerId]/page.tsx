type Params = Promise<{ offerId: string }>;

export default async function RunOverviewPage({ params }: { params: Params }) {
  const { offerId } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Run {offerId}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Placeholder page. UI will be implemented by the app-shell workstream.
      </p>
    </main>
  );
}
