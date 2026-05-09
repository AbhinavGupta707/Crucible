import { describe, expect, it } from "vitest";
import {
  loadCachedAiOutput,
  loadSampleLeadsCsv,
  loadSampleReplies,
  parseLeadsCsv,
} from "../../lib/demo/sample-data";

/**
 * These tests guard the demo data contract that the AI, API, and UI
 * workstreams depend on. If they fail, the safe-mode demo will not reach
 * calibration cleanly.
 */
describe("demo fixtures", () => {
  it("ships 8-12 archetypes with the required calibration target", () => {
    const cached = loadCachedAiOutput();
    const archetypes = cached.personaSynthesizer.archetypes;
    expect(archetypes.length).toBeGreaterThanOrEqual(8);
    expect(archetypes.length).toBeLessThanOrEqual(12);
    const names = archetypes.map((a) => a.name);
    // Spec section 14: required v1 -> v2 diff is on Tool-Fatigued Operator.
    expect(names).toContain("Tool-Fatigued Operator");
    // No duplicates.
    expect(new Set(names).size).toBe(names.length);
  });

  it("matches every cached prospect to a real archetype name", () => {
    const cached = loadCachedAiOutput();
    const archetypeNames = new Set(
      cached.personaSynthesizer.archetypes.map((a) => a.name),
    );
    const leads = parseLeadsCsv(loadSampleLeadsCsv());
    const leadEmails = new Set(leads.map((l) => l.email));
    for (const m of cached.prospectMatcher.matches) {
      expect(
        archetypeNames.has(m.archetypeName),
        `match for ${m.prospectEmail} points to unknown archetype "${m.archetypeName}"`,
      ).toBe(true);
      expect(
        leadEmails.has(m.prospectEmail),
        `match references prospect not in CSV: ${m.prospectEmail}`,
      ).toBe(true);
    }
    // Every CSV lead has a match.
    const matchedEmails = new Set(cached.prospectMatcher.matches.map((m) => m.prospectEmail));
    for (const lead of leads) {
      expect(
        matchedEmails.has(lead.email),
        `lead ${lead.email} has no cached match`,
      ).toBe(true);
    }
  });

  it("seeds 5-10 outbound emails, all with hypotheses and CTAs", () => {
    const cached = loadCachedAiOutput();
    const emails = cached.outreachGenerator.emails;
    expect(emails.length).toBeGreaterThanOrEqual(5);
    expect(emails.length).toBeLessThanOrEqual(10);
    for (const e of emails) {
      expect(e.hypothesis).toBeTruthy();
      expect(e.subject).toBeTruthy();
      expect(e.body).toBeTruthy();
      expect(e.ctaText).toBeTruthy();
      // Spec: emails under 120 words.
      const words = e.body.split(/\s+/).filter(Boolean).length;
      expect(words).toBeLessThanOrEqual(120);
    }
  });

  it("seeds 5-8 replies with one clear prediction mismatch on Tool-Fatigued Operator", () => {
    const replies = loadSampleReplies().replies;
    expect(replies.length).toBeGreaterThanOrEqual(5);
    expect(replies.length).toBeLessThanOrEqual(8);

    // The seeded mismatch from spec section 14: predicted pricing, actual
    // implementation/timing, on Tool-Fatigued Operator prospects. The demo
    // needs >= 1 such mismatch to drive calibration.
    const toolFatigueMismatches = replies.filter(
      (r) =>
        ["marcus@verdant-ops.com", "aisling@deltabranch.co", "tomasz@signalboost.studio"]
          .includes(r.prospectEmail) &&
        r.expected.predictedWasCorrect === false,
    );
    expect(toolFatigueMismatches.length).toBeGreaterThanOrEqual(1);

    // Outcome taxonomy must be from the fixed taxonomy.
    const taxonomy = new Set([
      "positive",
      "interested_later",
      "wrong_person",
      "not_relevant",
      "pricing_objection",
      "trust_objection",
      "competitor_locked",
      "unsubscribe",
      "hostile",
      "bounce",
      "no_reply",
    ]);
    for (const r of replies) {
      expect(
        taxonomy.has(r.expected.outcome),
        `reply ${r.id} has out-of-taxonomy outcome "${r.expected.outcome}"`,
      ).toBe(true);
    }
  });

  it("aligns parser output with reply ids and matches replies to seeded emails", () => {
    const cached = loadCachedAiOutput();
    const replies = loadSampleReplies().replies;
    const emailRecipients = new Set(
      cached.outreachGenerator.emails.map((e) => e.prospectEmail),
    );
    for (const r of replies) {
      expect(
        emailRecipients.has(r.prospectEmail),
        `reply ${r.id} cannot be attached: no seeded email to ${r.prospectEmail}`,
      ).toBe(true);
      expect(
        Object.prototype.hasOwnProperty.call(
          cached.responseParser.byReplyId,
          r.id,
        ),
        `reply ${r.id} has no cached parser output`,
      ).toBe(true);
    }
  });

  it("calibration metrics imply the trigger threshold is met", () => {
    const cached = loadCachedAiOutput();
    const m = (cached.calibrationAgent as { metrics: Record<string, number> })
      .metrics;
    // Spec section 12 demo thresholds: sentCount >= 5 and predictionAccuracy < 0.65.
    expect(m.sentCount).toBeGreaterThanOrEqual(5);
    expect(m.predictionAccuracy).toBeLessThan(0.65);
  });

  it("next-cohort plan shows a visible before/after rewrite", () => {
    const cached = loadCachedAiOutput();
    const next = cached.nextCohort as Record<string, string>;
    expect(next.beforeEmail).toBeTruthy();
    expect(next.afterEmail).toBeTruthy();
    expect(next.beforeEmail).not.toBe(next.afterEmail);
  });
});
