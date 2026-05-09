function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

export function isDemoSafeMode(): boolean {
  return readBool(process.env.DEMO_SAFE_MODE, true);
}

export function useCachedAi(): boolean {
  return readBool(process.env.USE_CACHED_AI, true);
}
