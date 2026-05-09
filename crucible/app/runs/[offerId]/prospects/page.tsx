type Params = Promise<{ offerId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { offerId } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">prospects</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Placeholder for run {offerId}. UI will be implemented by the
        app-shell workstream.
      </p>
    </main>
  );
}
