import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema, ZodTypeAny, z } from "zod";
import { ERROR_CODES, fail } from "./response";
import { newTraceId } from "./trace";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export async function parseJsonBody<T extends ZodTypeAny>(
  req: NextRequest,
  schema: T,
  traceId: string = newTraceId(),
): Promise<ParseResult<z.infer<T>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: fail(ERROR_CODES.VALIDATION_ERROR, "Request body must be valid JSON.", {
        traceId,
      }),
    };
  }
  return parseValue(raw, schema, traceId);
}

export function parseValue<T extends ZodTypeAny>(
  raw: unknown,
  schema: T,
  traceId: string = newTraceId(),
): ParseResult<z.infer<T>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: fail(ERROR_CODES.VALIDATION_ERROR, formatZodError(parsed.error), {
        traceId,
      }),
    };
  }
  return { ok: true, data: parsed.data };
}

export function parseSearchParams<T extends ZodTypeAny>(
  url: URL | string,
  schema: T,
  traceId: string = newTraceId(),
): ParseResult<z.infer<T>> {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return parseValue(obj, schema, traceId);
}

export function requireParam(
  value: string | undefined,
  name: string,
  traceId: string = newTraceId(),
): ParseResult<string> {
  if (!value || value.trim().length === 0) {
    return {
      ok: false,
      response: fail(ERROR_CODES.VALIDATION_ERROR, `Missing route parameter: ${name}`, {
        traceId,
      }),
    };
  }
  return { ok: true, data: value };
}

export { z };
export type { ZodSchema };
