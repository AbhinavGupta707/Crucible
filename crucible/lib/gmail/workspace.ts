export function resolveWorkspaceId(
  override?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromOverride = override?.trim();
  if (fromOverride) return fromOverride;
  return env.CRUCIBLE_WORKSPACE_ID?.trim() || "default";
}
