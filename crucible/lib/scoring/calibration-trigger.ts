/**
 * Deterministic calibration trigger.
 *
 * Triggers an archetype update when sentCount >= 5 AND any one of:
 *   - predictionAccuracy < 0.65
 *   - unpredictedObjectionRate >= 0.30
 *   - hostileOrUnsubscribeRate >= 0.10
 *   - newObjectionClusterCount >= 2
 *
 * The demo can lower the sentCount floor via `minSent` so a calibration
 * fires after 5-8 staged replies.
 */

export interface ArchetypeStats {
  sentCount: number;
  predictionAccuracy: number;
  unpredictedObjectionRate: number;
  hostileOrUnsubscribeRate: number;
  newObjectionClusterCount: number;
}

export interface CalibrationThresholds {
  minSent: number;
  accuracyFloor: number;
  unpredictedObjectionRate: number;
  hostileOrUnsubscribeRate: number;
  newObjectionClusterCount: number;
}

export const DEFAULT_THRESHOLDS: CalibrationThresholds = {
  minSent: 5,
  accuracyFloor: 0.65,
  unpredictedObjectionRate: 0.3,
  hostileOrUnsubscribeRate: 0.1,
  newObjectionClusterCount: 2,
};

export interface CalibrationDecision {
  shouldCalibrate: boolean;
  /** Specific reasons that fired. Empty when shouldCalibrate is false. */
  reasons: string[];
  thresholds: CalibrationThresholds;
}

export function shouldCalibrate(
  stats: ArchetypeStats,
  thresholds: Partial<CalibrationThresholds> = {}
): CalibrationDecision {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const reasons: string[] = [];

  if (stats.sentCount < t.minSent) {
    return {
      shouldCalibrate: false,
      reasons: [`sentCount ${stats.sentCount} < minSent ${t.minSent}`],
      thresholds: t,
    };
  }

  if (stats.predictionAccuracy < t.accuracyFloor) {
    reasons.push(
      `predictionAccuracy ${stats.predictionAccuracy.toFixed(
        2
      )} < ${t.accuracyFloor}`
    );
  }
  if (stats.unpredictedObjectionRate >= t.unpredictedObjectionRate) {
    reasons.push(
      `unpredictedObjectionRate ${stats.unpredictedObjectionRate.toFixed(
        2
      )} >= ${t.unpredictedObjectionRate}`
    );
  }
  if (stats.hostileOrUnsubscribeRate >= t.hostileOrUnsubscribeRate) {
    reasons.push(
      `hostileOrUnsubscribeRate ${stats.hostileOrUnsubscribeRate.toFixed(
        2
      )} >= ${t.hostileOrUnsubscribeRate}`
    );
  }
  if (stats.newObjectionClusterCount >= t.newObjectionClusterCount) {
    reasons.push(
      `newObjectionClusterCount ${stats.newObjectionClusterCount} >= ${t.newObjectionClusterCount}`
    );
  }

  return {
    shouldCalibrate: reasons.length > 0,
    reasons,
    thresholds: t,
  };
}
