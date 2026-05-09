// End-to-end safe-mode test that drives every route handler in the order the
// demo runs. Proves: standard envelope, input validation, replay-replies +
// calibration, archetype v1 -> v2, next-cohort plan with rewritten template.

import { describe, it, expect, beforeEach } from "vitest";
import { resetStore } from "../../lib/db/store";
import { archetypesRepo } from "../../lib/db/repositories/archetypes";
import { TOOL_FATIGUED_OPERATOR_NAME } from "../../lib/demo/sample-archetypes";
import { SAMPLE_LEADS } from "../../lib/demo/sample-leads";

import { POST as createOffer } from "../../app/api/offers/route";
import { POST as generateArchetypes } from "../../app/api/offers/[offerId]/archetypes/generate/route";
import { POST as uploadCsv } from "../../app/api/prospects/upload-csv/route";
import { POST as matchProspect } from "../../app/api/prospects/[prospectId]/match/route";
import { POST as createCampaign } from "../../app/api/campaigns/route";
import { POST as createCohort } from "../../app/api/campaigns/[campaignId]/cohorts/route";
import { POST as runPreflight } from "../../app/api/cohorts/[cohortId]/preflight/route";
import { POST as generateEmails } from "../../app/api/cohorts/[cohortId]/generate-emails/route";
import { POST as approveEmail } from "../../app/api/emails/[emailId]/approve/route";
import { POST as replayReplies } from "../../app/api/demo/replay-replies/route";
import { POST as calibrate } from "../../app/api/cohorts/[cohortId]/calibrate/route";
import { POST as nextCohort } from "../../app/api/cohorts/[cohortId]/next/route";
import { GET as demoSeed } from "../../app/api/demo/seed/route";

function buildRequest(url: string, init: { method: string; body?: unknown } = { method: "POST" }) {
  const headers = new Headers({ "content-type": "application/json" });
  return new Request(url, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    // @ts-expect-error duplex required by undici for body streams
    duplex: "half",
  }) as unknown as import("next/server").NextRequest;
}

type Envelope<T> =
  | { ok: true; data: T; warnings: string[]; traceId: string }
  | { ok: false; error: { code: string; message: string }; warnings: string[]; traceId: string };

async function readEnv<T>(res: Response): Promise<Envelope<T>> {
  return (await res.json()) as Envelope<T>;
}

function assertOk<T>(env: Envelope<T>): asserts env is Extract<Envelope<T>, { ok: true }> {
  if (!env.ok) {
    throw new Error(`expected success envelope, got error: ${env.error.code}: ${env.error.message}`);
  }
}

const SAMPLE_CSV = [
  "first_name,last_name,email,title,company,industry,company_size,notes,trigger,website,linkedin_summary",
  ...SAMPLE_LEADS.map((l) =>
    [
      l.firstName,
      l.lastName,
      l.email,
      l.title,
      l.company,
      l.industry,
      l.companySize,
      JSON.stringify(l.notes),
      JSON.stringify(l.trigger),
      l.website,
      JSON.stringify(l.linkedinSummary),
    ].join(","),
  ),
].join("\n");

describe("safe-mode API integration: offer -> next cohort", () => {
  beforeEach(() => {
    resetStore();
  });

  it("returns the standard envelope with traceId on every response", async () => {
    const res = await createOffer(
      buildRequest("http://test/api/offers", {
        method: "POST",
        body: {
          rawFounderInput: "We help small agencies follow up with quiet inbound leads automatically.",
          icpGuess: "Agency owners",
          desiredCta: "fit check",
          tone: "founder-led",
        },
      }),
    );
    expect(res.status).toBe(201);
    const env = await readEnv<{ offer: { id: string } }>(res);
    assertOk(env);
    expect(env.warnings).toEqual([]);
    expect(env.traceId).toMatch(/^trace_/);
    expect(env.data.offer.id.startsWith("offer_")).toBe(true);
  });

  it("rejects malformed JSON and bad input with VALIDATION_ERROR", async () => {
    const badJsonRes = await createOffer(
      // intentional bad body
      // @ts-expect-error force string body
      new Request("http://test/api/offers", { method: "POST", headers: { "content-type": "application/json" }, body: "{not json", duplex: "half" }) as unknown as import("next/server").NextRequest,
    );
    expect(badJsonRes.status).toBe(400);
    const badJsonEnv = await readEnv<unknown>(badJsonRes);
    expect(badJsonEnv.ok).toBe(false);

    const missingRes = await createOffer(
      buildRequest("http://test/api/offers", {
        method: "POST",
        body: { tone: "founder-led" },
      }),
    );
    expect(missingRes.status).toBe(400);
    const missingEnv = await readEnv<unknown>(missingRes);
    if (missingEnv.ok) throw new Error("expected validation error");
    expect(missingEnv.error.code).toBe("VALIDATION_ERROR");
  });

  it("404s missing offer for archetype generation", async () => {
    const res = await generateArchetypes(buildRequest("http://test/", { method: "POST" }), {
      params: { offerId: "offer_does_not_exist" },
    });
    expect(res.status).toBe(404);
    const env = await readEnv<unknown>(res);
    if (env.ok) throw new Error("expected NOT_FOUND");
    expect(env.error.code).toBe("NOT_FOUND");
  });

  it("walks every step from offer to next-cohort plan and replays replies trigger calibration", async () => {
    const offerRes = await createOffer(
      buildRequest("http://test/api/offers", {
        method: "POST",
        body: {
          rawFounderInput:
            "We help small agencies automatically follow up with inbound leads who go quiet after a discovery call.",
          icpGuess: "Founders of 5-25 person agencies",
          desiredCta: "fit check",
          tone: "founder-led",
          title: "Follow-up Copilot for Agencies",
        },
      }),
    );
    const offerEnv = await readEnv<{ offer: { id: string } }>(offerRes);
    assertOk(offerEnv);
    const offerId = offerEnv.data.offer.id;

    const archRes = await generateArchetypes(buildRequest("http://test/", { method: "POST" }), {
      params: { offerId },
    });
    const archEnv = await readEnv<{ archetypes: { id: string; name: string }[]; source: string }>(archRes);
    assertOk(archEnv);
    expect(archEnv.data.archetypes.length).toBeGreaterThanOrEqual(8);
    expect(archEnv.data.archetypes.some((a) => a.name === TOOL_FATIGUED_OPERATOR_NAME)).toBe(true);

    const csvRes = await uploadCsv(
      buildRequest("http://test/api/prospects/upload-csv", {
        method: "POST",
        body: { offerId, csv: SAMPLE_CSV },
      }),
    );
    const csvEnv = await readEnv<{ prospects: { id: string }[] }>(csvRes);
    assertOk(csvEnv);
    expect(csvEnv.data.prospects.length).toBe(SAMPLE_LEADS.length);

    for (const p of csvEnv.data.prospects) {
      const matchRes = await matchProspect(buildRequest("http://test/", { method: "POST" }), {
        params: { prospectId: p.id },
      });
      const matchEnv = await readEnv<{ match: { archetypeId: string } }>(matchRes);
      assertOk(matchEnv);
      expect(matchEnv.data.match.archetypeId.startsWith("arch_")).toBe(true);
    }

    const campaignRes = await createCampaign(
      buildRequest("http://test/api/campaigns", { method: "POST", body: { offerId } }),
    );
    const campaignEnv = await readEnv<{ campaign: { id: string } }>(campaignRes);
    assertOk(campaignEnv);
    const campaignId = campaignEnv.data.campaign.id;

    const cohortRes = await createCohort(
      buildRequest("http://test/", { method: "POST", body: {} }),
      { params: { campaignId } },
    );
    const cohortEnv = await readEnv<{ cohort: { id: string } }>(cohortRes);
    assertOk(cohortEnv);
    const cohortId = cohortEnv.data.cohort.id;

    const preflightRes = await runPreflight(buildRequest("http://test/", { method: "POST" }), {
      params: { cohortId },
    });
    const preflightEnv = await readEnv<{ count: number; predictions: unknown[] }>(preflightRes);
    assertOk(preflightEnv);
    expect(preflightEnv.data.count).toBeGreaterThan(0);

    const emailsRes = await generateEmails(buildRequest("http://test/", { method: "POST" }), {
      params: { cohortId },
    });
    const emailsEnv = await readEnv<{ emails: { id: string; status: string }[]; count: number }>(emailsRes);
    assertOk(emailsEnv);
    expect(emailsEnv.data.count).toBeGreaterThan(0);

    // Approve the first email; verify status transition.
    const firstEmailId = emailsEnv.data.emails[0].id;
    const approveRes = await approveEmail(buildRequest("http://test/", { method: "POST" }), {
      params: { emailId: firstEmailId },
    });
    const approveEnv = await readEnv<{ email: { status: string; approvedAt: string | null } }>(approveRes);
    assertOk(approveEnv);
    expect(approveEnv.data.email.status).toBe("approved");
    expect(approveEnv.data.email.approvedAt).not.toBeNull();

    // Replay replies WITH calibration trigger.
    const replayRes = await replayReplies(
      buildRequest("http://test/api/demo/replay-replies", {
        method: "POST",
        body: { cohortId, triggerCalibration: true },
      }),
    );
    const replayEnv = await readEnv<{
      repliesCount: number;
      calibrationRunId: string | null;
      updatedArchetypeCount: number;
    }>(replayRes);
    assertOk(replayEnv);
    expect(replayEnv.data.repliesCount).toBeGreaterThan(0);
    expect(replayEnv.data.calibrationRunId).not.toBeNull();
    expect(replayEnv.data.updatedArchetypeCount).toBeGreaterThan(0);

    // Tool-Fatigued Operator must have a v2 version after calibration.
    const archetypes = archetypesRepo.listByOffer(offerId);
    const tfo = archetypes.find((a) => a.name === TOOL_FATIGUED_OPERATOR_NAME);
    expect(tfo).toBeDefined();
    expect(tfo!.versions.length).toBeGreaterThanOrEqual(2);
    const v2 = tfo!.versions[tfo!.versions.length - 1];
    expect(v2.versionNumber).toBe(2);
    expect(v2.preferredAngles.join(" ").toLowerCase()).toContain("implementation");
    expect(tfo!.activeVersionId).toBe(v2.id);

    // Explicit calibrate is idempotent (still ok envelope).
    const calRes = await calibrate(
      buildRequest("http://test/", { method: "POST", body: { triggeredBy: "test" } }),
      { params: { cohortId } },
    );
    const calEnv = await readEnv<unknown>(calRes);
    assertOk(calEnv);

    const nextRes = await nextCohort(buildRequest("http://test/", { method: "POST" }), {
      params: { cohortId },
    });
    const nextEnv = await readEnv<{
      plan: {
        newEmailTemplates: { archetypeId: string; subject: string; body: string }[];
        segmentsToDoubleDown: string[];
      };
      nextCohort: { id: string; cohortNumber: number };
    }>(nextRes);
    assertOk(nextEnv);
    expect(nextEnv.data.nextCohort.cohortNumber).toBe(2);
    expect(nextEnv.data.plan.newEmailTemplates.length).toBeGreaterThan(0);
    expect(nextEnv.data.plan.segmentsToDoubleDown).toContain(TOOL_FATIGUED_OPERATOR_NAME);

    // Cohort 2 template for Tool-Fatigued Operator should reflect the v2 angle.
    const tfoTemplate = nextEnv.data.plan.newEmailTemplates.find((t) => t.archetypeId === tfo!.id);
    expect(tfoTemplate).toBeDefined();
    expect(tfoTemplate!.body.toLowerCase()).toContain("we draft, you approve");
  });

  it("demo seed is idempotent", async () => {
    const first = await demoSeed();
    const firstEnv = await readEnv<{ offerId: string; created: boolean }>(first);
    assertOk(firstEnv);
    expect(firstEnv.data.created).toBe(true);

    const second = await demoSeed();
    const secondEnv = await readEnv<{ offerId: string; created: boolean }>(second);
    assertOk(secondEnv);
    expect(secondEnv.data.created).toBe(false);
    expect(secondEnv.data.offerId).toBe(firstEnv.data.offerId);
  });
});
