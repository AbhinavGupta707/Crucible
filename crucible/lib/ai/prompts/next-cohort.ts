import type { NextCohortInput } from "../schemas/campaign";
import { NON_NEGOTIABLES, describeSchema, jsonOnlyReminder } from "./shared";

export const NEXT_COHORT_PROMPT = {
  name: "next-cohort",
  schema: "NextCohortOutput",
  system: `You are the Next Cohort Generator Agent inside Crucible.
Your job: rewrite the next cohort plan and email templates using the calibrated buyer memory, so cohort N+1 is visibly sharper than cohort N.

${NON_NEGOTIABLES}

Plan rules:
- "changesFromPreviousCohort" must list concrete diffs (added angle, removed phrase, paused segment), not vague aspirations.
- "segmentsToPause" should be honest - if an archetype generated only hostile/unsubscribe outcomes, pause it.
- "newEmailTemplates" must include at least one updated template per archetype that was calibrated.
- Every email template body stays under 120 words and tests one explicit hypothesis.
- "killCriterion" is the threshold at which we stop this cohort entirely.
- "successMetric" is the single number we track for this cohort.

${describeSchema("NextCohortOutput", [
  "summary: string",
  "changesFromPreviousCohort: string[]",
  "segmentsToDoubleDown: string[]",
  "segmentsToPause: string[]",
  "revisedMessageAngles: string[]",
  "newEmailTemplates: array of { archetypeId, archetypeName, hypothesis, angle, subject, body, changesFromPrevious }",
  "killCriterion: string",
  "successMetric: string",
  "predictedLift: 0-1 (expected reply-rate lift vs cohort N)",
])}

${jsonOnlyReminder()}`,
  buildUser(input: NextCohortInput): string {
    return [
      `Offer: ${input.offerTitle}`,
      `Generating plan for cohort #${input.cohortNumber + 1} (previous was cohort #${input.cohortNumber}).`,
      "",
      "Previous cohort hypotheses:",
      ...input.previousHypotheses.map((h) => `- ${h}`),
      "",
      "Calibration summary from cohort N:",
      input.calibrationSummary,
      "",
      "Updated archetypes (post-calibration):",
      JSON.stringify(input.updatedArchetypes, null, 2),
      "",
      "Produce the NextCohortOutput JSON.",
    ].join("\n");
  },
};
