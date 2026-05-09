import { describe, expect, it } from "vitest";
import {
  rollUpByArchetype,
  scorePair,
  scorePredictionAccuracy,
} from "../../lib/scoring/prediction-accuracy";

describe("prediction-accuracy: scorePair", () => {
  it("scores 1.0 on exact match", () => {
    expect(scorePair({ predicted: "positive", actual: "positive" })).toBe(1.0);
  });

  it("scores 0.6 on same-family match", () => {
    expect(
      scorePair({ predicted: "pricing_objection", actual: "trust_objection" })
    ).toBe(0.6);
  });

  it("scores 0.3 on same-sentiment but different family", () => {
    // unsubscribe (negative) vs pricing_objection (negative) -> different family, same sentiment
    expect(
      scorePair({ predicted: "unsubscribe", actual: "pricing_objection" })
    ).toBe(0.3);
  });

  it("scores 0.0 on a wrong cross-sentiment guess", () => {
    expect(scorePair({ predicted: "positive", actual: "hostile" })).toBe(0.0);
  });

  it("excludes no_reply by returning null", () => {
    expect(scorePair({ predicted: "pricing_objection", actual: "no_reply" })).toBeNull();
  });
});

describe("prediction-accuracy: scorePredictionAccuracy", () => {
  it("averages over scored pairs only and tracks no_reply separately", () => {
    const out = scorePredictionAccuracy([
      { predicted: "positive", actual: "positive" }, // 1.0
      { predicted: "pricing_objection", actual: "trust_objection" }, // 0.6
      { predicted: "positive", actual: "no_reply" }, // null
      { predicted: "positive", actual: "hostile" }, // 0.0
    ]);
    expect(out.scoredCount).toBe(3);
    expect(out.noReplyCount).toBe(1);
    expect(Math.abs(out.accuracy - (1.0 + 0.6 + 0.0) / 3)).toBeLessThan(0.001);
  });

  it("returns 0 accuracy when there are no scored pairs", () => {
    const out = scorePredictionAccuracy([
      { predicted: "positive", actual: "no_reply" },
      { predicted: "positive", actual: "no_reply" },
    ]);
    expect(out.accuracy).toBe(0);
    expect(out.scoredCount).toBe(0);
    expect(out.noReplyCount).toBe(2);
  });

  it("populates the confusion matrix", () => {
    const out = scorePredictionAccuracy([
      { predicted: "positive", actual: "positive" },
      { predicted: "positive", actual: "positive" },
      { predicted: "positive", actual: "no_reply" },
    ]);
    expect(out.confusion["positive->positive"]).toBe(2);
    expect(out.confusion["positive->no_reply"]).toBe(1);
  });
});

describe("prediction-accuracy: rollUpByArchetype", () => {
  it("computes per-archetype accuracy", () => {
    const rows = rollUpByArchetype([
      {
        archetypeId: "a",
        pairs: [
          { predicted: "positive", actual: "positive" },
          { predicted: "positive", actual: "hostile" },
        ],
      },
      {
        archetypeId: "b",
        pairs: [{ predicted: "pricing_objection", actual: "pricing_objection" }],
      },
    ]);
    const a = rows.find((r) => r.archetypeId === "a")!;
    const b = rows.find((r) => r.archetypeId === "b")!;
    expect(a.accuracy).toBe(0.5);
    expect(b.accuracy).toBe(1);
  });
});
