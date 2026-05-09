import { describe, expect, it } from "vitest";

/**
 * Shape test: confirms every repository module compiles and exports the
 * functions the API workstream expects. We do not connect to a database
 * here; integration tests against a real Postgres live in tests/integration/
 * and are owned by the API workstream.
 */
describe("repositories export the expected surface", () => {
  it("offers", async () => {
    const r = await import("../../lib/db/repositories/offers");
    expect(typeof r.createOffer).toBe("function");
    expect(typeof r.getOffer).toBe("function");
    expect(typeof r.getOfferOrThrow).toBe("function");
    expect(typeof r.listOffersByWorkspace).toBe("function");
    expect(typeof r.getOfferWithHypotheses).toBe("function");
    expect(typeof r.getOfferRunFull).toBe("function");
  });

  it("archetypes", async () => {
    const r = await import("../../lib/db/repositories/archetypes");
    expect(typeof r.createArchetypeWithVersion).toBe("function");
    expect(typeof r.listArchetypes).toBe("function");
    expect(typeof r.getArchetype).toBe("function");
    expect(typeof r.getArchetypeByName).toBe("function");
    expect(typeof r.appendVersionAndActivate).toBe("function");
  });

  it("prospects", async () => {
    const r = await import("../../lib/db/repositories/prospects");
    expect(typeof r.createProspect).toBe("function");
    expect(typeof r.bulkCreateProspects).toBe("function");
    expect(typeof r.listProspects).toBe("function");
    expect(typeof r.getProspect).toBe("function");
    expect(typeof r.getProspectByEmail).toBe("function");
    expect(typeof r.upsertMatch).toBe("function");
    expect(typeof r.setPreflightPrediction).toBe("function");
  });

  it("campaigns", async () => {
    const r = await import("../../lib/db/repositories/campaigns");
    expect(typeof r.createCampaign).toBe("function");
    expect(typeof r.getCampaign).toBe("function");
    expect(typeof r.listCampaignsByOffer).toBe("function");
    expect(typeof r.createCohort).toBe("function");
    expect(typeof r.nextCohortNumber).toBe("function");
    expect(typeof r.getCohort).toBe("function");
    expect(typeof r.setCohortStatus).toBe("function");
    expect(typeof r.createNextCohortPlan).toBe("function");
  });

  it("emails", async () => {
    const r = await import("../../lib/db/repositories/emails");
    expect(typeof r.createOutboundEmail).toBe("function");
    expect(typeof r.bulkCreateOutboundEmails).toBe("function");
    expect(typeof r.getEmail).toBe("function");
    expect(typeof r.listEmailsByCohort).toBe("function");
    expect(typeof r.approveEmail).toBe("function");
    expect(typeof r.attachGmailDraft).toBe("function");
    expect(typeof r.markSent).toBe("function");
    expect(typeof r.recordEvent).toBe("function");
    expect(typeof r.findEmailByProspectEmailInCohort).toBe("function");
  });

  it("replies", async () => {
    const r = await import("../../lib/db/repositories/replies");
    expect(typeof r.upsertReplyAnalysis).toBe("function");
    expect(typeof r.getReply).toBe("function");
    expect(typeof r.listRepliesByCohort).toBe("function");
  });

  it("calibration", async () => {
    const r = await import("../../lib/db/repositories/calibration");
    expect(typeof r.createCalibrationRun).toBe("function");
    expect(typeof r.createPersonaUpdate).toBe("function");
    expect(typeof r.getCalibrationRun).toBe("function");
    expect(typeof r.listCalibrationRunsByCohort).toBe("function");
  });

  it("suppression", async () => {
    const r = await import("../../lib/db/repositories/suppression");
    expect(typeof r.isSuppressed).toBe("function");
    expect(typeof r.addSuppression).toBe("function");
    expect(typeof r.listSuppression).toBe("function");
  });

  it("aggregate index re-exports the repositories", async () => {
    const r = await import("../../lib/db");
    expect(r.prisma).toBeDefined();
    expect(r.offersRepo.createOffer).toBeTypeOf("function");
    expect(r.archetypesRepo.createArchetypeWithVersion).toBeTypeOf("function");
    expect(r.prospectsRepo.bulkCreateProspects).toBeTypeOf("function");
    expect(r.campaignsRepo.createCampaign).toBeTypeOf("function");
    expect(r.emailsRepo.createOutboundEmail).toBeTypeOf("function");
    expect(r.repliesRepo.upsertReplyAnalysis).toBeTypeOf("function");
    expect(r.calibrationRepo.createCalibrationRun).toBeTypeOf("function");
    expect(r.suppressionRepo.isSuppressed).toBeTypeOf("function");
  });
});
