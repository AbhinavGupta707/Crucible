export function MatchBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const tone =
    confidence >= 0.7 ? "chip-good" : confidence >= 0.55 ? "chip-info" : "chip-warn";
  return <span className={tone}>{pct}% match</span>;
}
