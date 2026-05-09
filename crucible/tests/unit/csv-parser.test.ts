import { describe, expect, it } from "vitest";
import {
  loadSampleLeadsCsv,
  parseLeadsCsv,
} from "../../lib/demo/sample-data";

describe("parseLeadsCsv", () => {
  it("parses the seeded sample-leads.csv with required columns", () => {
    const csv = loadSampleLeadsCsv();
    const leads = parseLeadsCsv(csv);
    // Spec: 20-30 leads. Acceptance: 25 in fixture.
    expect(leads.length).toBeGreaterThanOrEqual(20);
    expect(leads.length).toBeLessThanOrEqual(30);
    for (const lead of leads) {
      expect(lead.first_name).toBeTruthy();
      expect(lead.last_name).toBeTruthy();
      expect(lead.email).toMatch(/@/);
      expect(lead.title).toBeTruthy();
      expect(lead.company).toBeTruthy();
    }
  });

  it("includes the seeded calibration-mismatch prospects", () => {
    const leads = parseLeadsCsv(loadSampleLeadsCsv());
    const emails = leads.map((l) => l.email);
    // The Tool-Fatigued Operator archetype is the v1->v2 calibration target;
    // the demo needs at least three of these prospects so calibration has
    // statistical signal across the cohort.
    expect(emails).toContain("marcus@verdant-ops.com");
    expect(emails).toContain("aisling@deltabranch.co");
    expect(emails).toContain("tomasz@signalboost.studio");
  });

  it("handles quoted fields with commas inside notes", () => {
    const csv = [
      "first_name,last_name,email,title,company,industry,company_size,notes,trigger,website,linkedin_summary",
      'Test,User,test@example.com,CEO,Acme,Tech,10,"hello, world","trigger, here",example.com,summary',
    ].join("\n");
    const leads = parseLeadsCsv(csv);
    expect(leads).toHaveLength(1);
    expect(leads[0]?.notes).toBe("hello, world");
    expect(leads[0]?.trigger).toBe("trigger, here");
  });

  it("handles double-quote escapes inside quoted fields", () => {
    const csv = [
      "first_name,last_name,email,title,company,industry,company_size,notes,trigger,website,linkedin_summary",
      'A,B,a@b.co,CEO,Acme,Tech,5,"she said ""hi""",t,w,l',
    ].join("\n");
    const leads = parseLeadsCsv(csv);
    expect(leads[0]?.notes).toBe('she said "hi"');
  });

  it("throws if the header is missing a required column", () => {
    const csv = ["first_name,last_name,email\nA,B,a@b.co"].join("\n");
    expect(() => parseLeadsCsv(csv)).toThrow(/missing required column/);
  });
});
