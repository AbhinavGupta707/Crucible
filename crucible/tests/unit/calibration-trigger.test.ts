import { describe, expect, it } from "vitest";
import { shouldCalibrate } from "../../lib/scoring/calibration-trigger";

describe("calibration-trigger", () => {
  const baseStats = {
    sentCount: 6,
    predictionAccuracy: 0.9,
    unpredictedObjectionRate: 0.1,
    hostileOrUnsubscribeRate: 0.0,
    newObjectionClusterCount: 0,
  };

  it("does not calibrate below sentCount floor", () => {
    const out = shouldCalibrate({ ...baseStats, sentCount: 4 });
    expect(out.shouldCalibrate).toBe(false);
  });

  it("calibrates when prediction accuracy drops below 0.65", () => {
    const out = shouldCalibrate({ ...baseStats, predictionAccuracy: 0.4 });
    expect(out.shouldCalibrate).toBe(true);
    expect(out.reasons.some((r) => r.includes("predictionAccuracy"))).toBe(true);
  });

  it("calibrates when unpredicted objection rate >= 0.30", () => {
    const out = shouldCalibrate({
      ...baseStats,
      unpredictedObjectionRate: 0.3,
    });
    expect(out.shouldCalibrate).toBe(true);
    expect(out.reasons.some((r) => r.includes("unpredictedObjectionRate"))).toBe(true);
  });

  it("calibrates when hostile/unsubscribe rate >= 0.10", () => {
    const out = shouldCalibrate({
      ...baseStats,
      hostileOrUnsubscribeRate: 0.15,
    });
    expect(out.shouldCalibrate).toBe(true);
  });

  it("calibrates when 2+ new objection clusters appear", () => {
    const out = shouldCalibrate({ ...baseStats, newObjectionClusterCount: 2 });
    expect(out.shouldCalibrate).toBe(true);
  });

  it("does NOT calibrate when all signals are healthy", () => {
    const out = shouldCalibrate(baseStats);
    expect(out.shouldCalibrate).toBe(false);
    expect(out.reasons).toHaveLength(0);
  });

  it("respects a lowered minSent for the demo", () => {
    const out = shouldCalibrate(
      { ...baseStats, sentCount: 5, predictionAccuracy: 0.4 },
      { minSent: 5 }
    );
    expect(out.shouldCalibrate).toBe(true);
  });

  it("returns the full reason list when multiple thresholds fire", () => {
    const out = shouldCalibrate({
      sentCount: 8,
      predictionAccuracy: 0.4,
      unpredictedObjectionRate: 0.5,
      hostileOrUnsubscribeRate: 0.2,
      newObjectionClusterCount: 3,
    });
    expect(out.shouldCalibrate).toBe(true);
    expect(out.reasons.length).toBe(4);
  });
});
