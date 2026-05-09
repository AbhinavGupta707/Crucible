import fs from "node:fs";
import path from "node:path";

const DEMO_DIR = path.join(process.cwd(), "lib", "demo");

export const DEMO_IDS = {
  workspace: "00000000-0000-4000-8000-000000000001",
  offer: "00000000-0000-4000-8000-000000000002",
  campaign: "00000000-0000-4000-8000-000000000003",
  cohort: "00000000-0000-4000-8000-000000000004",
} as const;

export const DEMO_WORKSPACE_SLUG = "demo";
export const DEMO_WORKSPACE_NAME = "Crucible Demo Workspace";
export const DEMO_TONE = "founder-led";

export interface RawLead {
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
  industry: string;
  company_size: string;
  notes: string;
  trigger: string;
  website: string;
  linkedin_summary: string;
}

export function loadSampleOfferText(): string {
  return fs.readFileSync(path.join(DEMO_DIR, "sample-offer.txt"), "utf8");
}

export function loadSampleLeadsCsv(): string {
  return fs.readFileSync(path.join(DEMO_DIR, "sample-leads.csv"), "utf8");
}

export function loadSampleReplies(): {
  description: string;
  replies: Array<{
    id: string;
    prospectEmail: string;
    senderEmail: string;
    senderName: string;
    receivedAt: string;
    rawText: string;
    expected: {
      outcome: string;
      sentiment: string;
      objectionType: string | null;
      funnelStage: string | null;
      predictedWasCorrect: boolean;
      mismatchReason: string | null;
      parserConfidence: number;
      volunteeredInfo: string[];
    };
  }>;
} {
  const raw = fs.readFileSync(
    path.join(DEMO_DIR, "sample-replies.json"),
    "utf8",
  );
  return JSON.parse(raw);
}

export type CachedAiOutput = {
  hypothesis: Record<string, unknown>;
  personaSynthesizer: { archetypes: Array<Record<string, unknown> & { name: string }> };
  prospectMatcher: {
    matches: Array<{
      prospectEmail: string;
      archetypeName: string;
      confidence: number;
      matchedSignals: string[];
      riskFlags: string[];
    }>;
  };
  preflightSimulator: {
    predictions: Record<
      string,
      {
        predictedOutcome: string;
        predictedObjection: string | null;
        recommendedAngle: string | null;
        phrasesToUse: string[];
        phrasesToAvoid: string[];
        predictedReplyLikelihood: number;
        confidence: number;
      }
    >;
  };
  outreachGenerator: {
    emails: Array<{
      prospectEmail: string;
      hypothesis: string;
      angle: string;
      subject: string;
      body: string;
      followUp1: string;
      followUp2: string;
      ctaText: string;
      complianceFooter: string;
      predictedReplyLikelihood: number;
      predictedObjection: string | null;
      riskWarnings: string[];
    }>;
  };
  responseParser: { byReplyId: Record<string, unknown> };
  calibrationAgent: Record<string, unknown>;
  nextCohort: Record<string, unknown>;
};

export function loadCachedAiOutput(): CachedAiOutput {
  const raw = fs.readFileSync(
    path.join(DEMO_DIR, "cached-ai-output.json"),
    "utf8",
  );
  return JSON.parse(raw) as CachedAiOutput;
}

/**
 * Pure CSV parser that handles quoted fields. Used by the seed and the
 * /api/prospects/upload-csv route. Does not depend on papaparse.
 */
export function parseLeadsCsv(content: string): RawLead[] {
  const rows = parseCsv(content);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const expected = [
    "first_name",
    "last_name",
    "email",
    "title",
    "company",
    "industry",
    "company_size",
    "notes",
    "trigger",
    "website",
    "linkedin_summary",
  ];
  for (const col of expected) {
    if (!header.includes(col)) {
      throw new Error(`sample-leads.csv missing required column: ${col}`);
    }
  }
  return rows.slice(1).filter((r) => r.length > 1 && r[0] !== "").map((row) => {
    const lookup = (key: string) => {
      const idx = header.indexOf(key);
      return idx === -1 ? "" : (row[idx] ?? "").trim();
    };
    return {
      first_name: lookup("first_name"),
      last_name: lookup("last_name"),
      email: lookup("email"),
      title: lookup("title"),
      company: lookup("company"),
      industry: lookup("industry"),
      company_size: lookup("company_size"),
      notes: lookup("notes"),
      trigger: lookup("trigger"),
      website: lookup("website"),
      linkedin_summary: lookup("linkedin_summary"),
    };
  });
}

/**
 * Minimal RFC-4180-ish CSV parser. Supports double-quoted fields with embedded
 * commas, newlines, and "" escapes. Sufficient for the demo and seed; the API
 * layer should use papaparse for richer error reporting.
 */
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  while (i < content.length) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
