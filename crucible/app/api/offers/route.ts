import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api/response";
import { withEnvelope } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validation";
import { offersRepo } from "@/lib/db/repositories/offers";

export const runtime = "nodejs";

const TONES = ["concise", "founder-led", "warm", "direct", "technical"] as const;

const offerInputSchema = z.object({
  rawFounderInput: z.string().min(20, "rawFounderInput must be at least 20 characters."),
  icpGuess: z.string().min(3),
  desiredCta: z.string().min(2),
  tone: z.enum(TONES),
  title: z.string().min(2).optional(),
  productSummary: z.string().min(10).optional(),
  painClaim: z.string().optional(),
  proofPoint: z.string().optional(),
  likelyBuyer: z.string().optional(),
  likelyUser: z.string().optional(),
  champion: z.string().optional(),
  messageAngles: z.array(z.string()).optional(),
  riskyAssumptions: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  return withEnvelope(async ({ traceId }) => {
    const parsed = await parseJsonBody(req, offerInputSchema, traceId);
    if (!parsed.ok) return parsed.response;

    const offer = offersRepo.create({
      rawFounderInput: parsed.data.rawFounderInput,
      icpGuess: parsed.data.icpGuess,
      desiredCta: parsed.data.desiredCta,
      tone: parsed.data.tone,
      title: parsed.data.title ?? "Untitled offer",
      productSummary: parsed.data.productSummary ?? parsed.data.rawFounderInput.slice(0, 200),
      painClaim: parsed.data.painClaim,
      proofPoint: parsed.data.proofPoint,
      likelyBuyer: parsed.data.likelyBuyer,
      likelyUser: parsed.data.likelyUser,
      champion: parsed.data.champion,
      messageAngles: parsed.data.messageAngles,
      riskyAssumptions: parsed.data.riskyAssumptions,
    });

    return ok(
      {
        offer,
        hypotheses: [],
        riskyAssumptions: offer.riskyAssumptions,
      },
      { traceId, status: 201 },
    );
  });
}

export async function GET() {
  return withEnvelope(async ({ traceId }) => {
    return ok({ offers: offersRepo.list() }, { traceId });
  });
}

