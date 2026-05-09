export function isDemoSafeMode(env: Partial<NodeJS.ProcessEnv> = process.env): boolean {
  const v = (env.DEMO_SAFE_MODE ?? "true").trim().toLowerCase();
  return v !== "false" && v !== "0" && v !== "no";
}

export function gmailIsConfigured(env: Partial<NodeJS.ProcessEnv> = process.env): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET &&
      env.GOOGLE_REDIRECT_URI,
  );
}
