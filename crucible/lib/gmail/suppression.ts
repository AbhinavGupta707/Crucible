export interface SuppressionChecker {
  isSuppressed(email: string): Promise<boolean>;
}

class NoopSuppressionChecker implements SuppressionChecker {
  async isSuppressed(): Promise<boolean> {
    return false;
  }
}

let override: SuppressionChecker | null = null;
const fallback = new NoopSuppressionChecker();

export function setSuppressionChecker(checker: SuppressionChecker | null): void {
  override = checker;
}

export function getSuppressionChecker(): SuppressionChecker {
  return override ?? fallback;
}
