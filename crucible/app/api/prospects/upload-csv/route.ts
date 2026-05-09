import type { NextRequest } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { ok, ERROR_CODES, fail } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { offersRepo } from "@/lib/db/repositories/offers";
import { prospectsRepo } from "@/lib/db/repositories/prospects";

export const runtime = "nodejs";

const REQUIRED_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "title",
  "company",
] as const;

const ALL_COLUMNS = [
  ...REQUIRED_COLUMNS,
  "industry",
  "company_size",
  "notes",
  "trigger",
  "website",
  "linkedin_summary",
] as const;

const bodySchema = z.object({
  offerId: z.string().min(3),
  csv: z.string().min(10, "csv body must be a non-empty string."),
});

type Row = Record<string, string>;

function validateRow(row: Row, index: number): { ok: true } | { ok: false; reason: string } {
  for (const col of REQUIRED_COLUMNS) {
    if (!row[col] || row[col].trim().length === 0) {
      return { ok: false, reason: `Row ${index + 1} missing required column: ${col}` };
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return { ok: false, reason: `Row ${index + 1} has invalid email: ${row.email}` };
  }
  return { ok: true };
}

export async function POST(req: NextRequest) {
  return withEnvelope(async ({ traceId }) => {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return fail(ERROR_CODES.VALIDATION_ERROR, "Request body must be valid JSON.", { traceId });
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return fail(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues.map((i) => i.message).join("; "), {
        traceId,
      });
    }
    const { offerId, csv } = parsed.data;

    const offer = offersRepo.findById(offerId);
    if (!offer) return fail(ERROR_CODES.NOT_FOUND, `Offer not found: ${offerId}`, { traceId });

    const result = Papa.parse<Row>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (result.errors.length > 0) {
      return fail(
        ERROR_CODES.VALIDATION_ERROR,
        `CSV parse error: ${result.errors[0].message}`,
        { traceId },
      );
    }

    const headers = result.meta.fields ?? [];
    for (const required of REQUIRED_COLUMNS) {
      if (!headers.includes(required)) {
        return fail(
          ERROR_CODES.VALIDATION_ERROR,
          `Missing required CSV column: ${required}. Required: ${REQUIRED_COLUMNS.join(", ")}.`,
          { traceId },
        );
      }
    }

    const warnings: string[] = [];
    const created = [];
    let skipped = 0;
    for (let i = 0; i < result.data.length; i += 1) {
      const row = result.data[i];
      const v = validateRow(row, i);
      if (!v.ok) {
        warnings.push(v.reason);
        skipped += 1;
        continue;
      }
      created.push(
        prospectsRepo.create({
          offerId,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          title: row.title,
          company: row.company,
          industry: row.industry ?? "",
          companySize: row.company_size ?? "",
          notes: row.notes ?? "",
          trigger: row.trigger ?? "",
          website: row.website ?? "",
          linkedinSummary: row.linkedin_summary ?? "",
        }),
      );
    }

    return ok(
      {
        offerId,
        prospectsCreated: created.length,
        skipped,
        prospects: created,
        knownColumns: ALL_COLUMNS,
      },
      { traceId, warnings, status: 201 },
    );
  });
}
