export default function Home() {
  const safeMode = process.env.DEMO_SAFE_MODE !== "false";
  const cachedAi = process.env.USE_CACHED_AI !== "false";

  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-6 p-12 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">Crucible</h1>
      <p className="max-w-xl text-sm text-neutral-500">
        Outbound that learns. Scaffold only — UI, database, AI, and Gmail
        will be wired in by their respective workstreams. See
        IMPLEMENTATION_PLAN.md.
      </p>
      <ul className="text-xs text-neutral-500">
        <li>DEMO_SAFE_MODE: {safeMode ? "true" : "false"}</li>
        <li>USE_CACHED_AI: {cachedAi ? "true" : "false"}</li>
      </ul>
    </main>
  );
}
