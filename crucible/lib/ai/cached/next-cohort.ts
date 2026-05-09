import type { NextCohortOutput } from "../schemas/campaign";

export const CACHED_NEXT_COHORT: NextCohortOutput = {
  summary:
    "Cohort 2 doubles down on implementation-light framing for tool-fatigued operators and pauses budget-sensitive operators. Drops 'automation platform' wording everywhere. Replaces 'book a demo' CTA with '15-minute fit check'.",
  changesFromPreviousCohort: [
    "Removed 'automation platform' and 'all-in-one' from every template.",
    "Replaced 'book a demo' CTA with '15-minute fit check'.",
    "Added explicit 'we draft, you approve' line to all templates.",
    "Paused Budget-Sensitive Operator segment after 0 replies in cohort 1.",
    "Doubled down on Tool-Fatigued Operator with implementation-light angle.",
  ],
  segmentsToDoubleDown: [
    "Tool-Fatigued Operator",
    "Overworked Agency Owner",
  ],
  segmentsToPause: ["Budget-Sensitive Operator"],
  revisedMessageAngles: [
    "Implementation-light (we draft, you approve)",
    "Missed-revenue framing tied to a specific dropped lead",
    "Trust-first proof for regulated agencies",
  ],
  newEmailTemplates: [
    {
      archetypeId: "archetype_tool_fatigued_operator",
      archetypeName: "Tool-Fatigued Operator",
      hypothesis:
        "Tool-fatigued operators only engage when the message says 'no setup, we draft, you approve.'",
      angle: "Implementation-light (we draft, you approve)",
      subject:
        "Never lose a warm lead because you forgot the second follow-up - we draft it, you approve it",
      body: [
        "Hi {{firstName}},",
        "",
        "Quick context, not a pitch: we draft the second follow-up to leads who went quiet after a discovery call, you approve it from your phone, and you skip the ones that don't feel right.",
        "",
        "No setup. No integration. No new login for the team. The whole point is that it does not become another tool you have to roll out.",
        "",
        "Worth a 15-minute fit check next week?",
        "",
        "- Sam",
      ].join("\n"),
      changesFromPrevious: [
        "Subject now leads with the dropped-lead pain, not the tool.",
        "Body explicitly negates 'another tool to roll out'.",
        "CTA changed from 'book a demo' to '15-minute fit check'.",
      ],
    },
    {
      archetypeId: "archetype_overworked_agency_owner",
      archetypeName: "Overworked Agency Owner",
      hypothesis:
        "Agency owners respond better to lost-revenue framing than to AI automation framing.",
      angle: "Missed-revenue framing tied to a specific dropped lead",
      subject: "The second follow-up that usually doesn't get sent",
      body: [
        "Hi {{firstName}},",
        "",
        "Most warm inbound leads we look at die at the second follow-up - not the first. The first one is muscle memory; the second one is the one Tuesday eats.",
        "",
        "We draft that second follow-up from your discovery-call notes. You approve from your phone, in your voice. Skip the ones that don't feel right.",
        "",
        "Open to a 15-minute fit check next week?",
        "",
        "- Sam",
      ].join("\n"),
      changesFromPrevious: [
        "Body opens with the missed-revenue moment, not a feature list.",
        "Reinforces 'in your voice' to address voice-mirroring concern.",
      ],
    },
  ],
  killCriterion:
    "If cohort 2 reply rate is below 8 percent across the doubled-down segments after 30 sends, kill the implementation-light angle and revisit the offer hypothesis.",
  successMetric:
    "Reply rate on Tool-Fatigued Operator + Overworked Agency Owner segments combined.",
  predictedLift: 0.35,
};
