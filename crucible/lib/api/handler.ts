import { NextResponse } from "next/server";
import { ERROR_CODES, fail } from "./response";
import { newTraceId } from "./trace";

export type HandlerContext = { traceId: string };

export async function withEnvelope(
  fn: (ctx: HandlerContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  const traceId = newTraceId();
  try {
    return await fn({ traceId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    console.error(`[${traceId}] handler error`, err);
    return fail(ERROR_CODES.INTERNAL, message, { traceId });
  }
}
