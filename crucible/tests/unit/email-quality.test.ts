import { describe, expect, it } from "vitest";
import {
  detectFakeFamiliarity,
  detectHype,
  scoreEmailQuality,
  type EmailQualityInput,
} from "../../lib/scoring/email-quality";

const goodEmail: EmailQualityInput = {
  subject: "Never lose a warm lead because you forgot the second follow-up",
  body: [
    "Hi Priya,",
    "",
    "Saw you rolled back HubSpot last quarter - so this is the opposite of another tool.",
    "",
    "We read your discovery-call notes and draft the second follow-up that usually never gets sent. You approve from your phone or skip it. No setup, no integration, no new login for the team.",
    "",
    "Worth a 15-minute fit check next week to see if it would have caught the leads that went quiet on you in April?",
    "",
    "- Sam",
  ].join("\n"),
  cta: "15-minute fit check next week",
  hypothesis:
    "Tool-fatigued operators only engage when the message says 'no setup, we draft, you approve.'",
  predictedObjection: "Pricing - we already pay for tools nobody uses.",
  archetypePreferredAngles: [
    "Implementation-light (we draft, you approve)",
    "Voice-mirroring",
  ],
  archetypeDislikedPhrases: ["automation platform", "all-in-one"],
  prospectKnownFacts: [
    "Title: COO at Pinwheel Studio",
    "Trigger: Rolled back HubSpot last quarter",
  ],
  externalSend: false,
};

describe("email-quality: detectors", () => {
  it("flags fake familiarity phrases", () => {
    expect(detectFakeFamiliarity("Hi - as we discussed last week...")).toEqual([
      "as we discussed",
    ]);
    expect(detectFakeFamiliarity("normal cold email")).toEqual([]);
  });

  it("flags hype words", () => {
    expect(detectHype("This is a revolutionary 10x your pipeline tool")).toEqual([
      "revolutionary",
      "10x your",
    ]);
  });
});

describe("email-quality: scoreEmailQuality", () => {
  it("passes a good cold email", () => {
    const out = scoreEmailQuality(goodEmail);
    expect(out.pass).toBe(true);
    expect(out.rejectReasons).toHaveLength(0);
    expect(out.scores.brevity).toBeGreaterThan(5);
    expect(out.truthfulness).toBe("pass");
    expect(out.compliance).toBe("pass");
  });

  it("hard-rejects bodies over 120 words", () => {
    const longBody = Array(140).fill("word").join(" ");
    const out = scoreEmailQuality({ ...goodEmail, body: longBody });
    expect(out.pass).toBe(false);
    expect(out.rejectReasons.some((r) => r.includes("> 120"))).toBe(true);
  });

  it("hard-rejects fake familiarity", () => {
    const out = scoreEmailQuality({
      ...goodEmail,
      body: "Hi Priya, as we discussed last week, here is a quick follow-up.",
    });
    expect(out.pass).toBe(false);
    expect(out.truthfulness).toBe("fail");
  });

  it("hard-rejects external sends without an opt-out", () => {
    const out = scoreEmailQuality({
      ...goodEmail,
      externalSend: true,
      optOutPresent: false,
    });
    expect(out.pass).toBe(false);
    expect(out.compliance).toBe("fail");
  });

  it("hard-rejects missing CTA", () => {
    const out = scoreEmailQuality({ ...goodEmail, cta: "" });
    expect(out.pass).toBe(false);
    expect(out.rejectReasons).toContain("missing CTA");
  });

  it("hard-rejects flagged invented proof", () => {
    const out = scoreEmailQuality({ ...goodEmail, flagsInventedProof: true });
    expect(out.pass).toBe(false);
    expect(out.truthfulness).toBe("fail");
  });

  it("warns (not rejects) on archetype disliked phrases", () => {
    const out = scoreEmailQuality({
      ...goodEmail,
      body: goodEmail.body + "\nThis is an automation platform.",
    });
    expect(out.pass).toBe(true);
    expect(out.warnings.some((w) => w.includes("automation platform"))).toBe(
      true
    );
  });

  it("warns on hype words but does not reject", () => {
    const out = scoreEmailQuality({
      ...goodEmail,
      body: goodEmail.body + "\nThis is revolutionary, honestly.",
    });
    expect(out.pass).toBe(true);
    expect(out.warnings.some((w) => w.includes("hype"))).toBe(true);
  });
});
