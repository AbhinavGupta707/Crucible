import { NextResponse } from "next/server";
import { newTraceId } from "./trace";

export type Warning = string;

export type SuccessEnvelope<T> = {
  ok: true;
  data: T;
  warnings: Warning[];
  traceId: string;
};

export type ErrorEnvelope = {
  ok: false;
  error: { code: string; message: string };
  warnings: Warning[];
  traceId: string;
};

export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  INTERNAL: "INTERNAL",
  UPSTREAM_FAILURE: "UPSTREAM_FAILURE",
  GMAIL_UNAVAILABLE: "GMAIL_UNAVAILABLE",
  DEMO_MODE_BLOCKED: "DEMO_MODE_BLOCKED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const STATUS_FOR_CODE: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  INTERNAL: 500,
  UPSTREAM_FAILURE: 502,
  GMAIL_UNAVAILABLE: 503,
  DEMO_MODE_BLOCKED: 403,
};

export type OkOptions = {
  warnings?: Warning[];
  traceId?: string;
  status?: number;
};

export function ok<T>(data: T, options: OkOptions = {}): NextResponse {
  const body: SuccessEnvelope<T> = {
    ok: true,
    data,
    warnings: options.warnings ?? [],
    traceId: options.traceId ?? newTraceId(),
  };
  return NextResponse.json(body, { status: options.status ?? 200 });
}

export type FailOptions = {
  warnings?: Warning[];
  traceId?: string;
  status?: number;
};

export function fail(
  code: ErrorCode | string,
  message: string,
  options: FailOptions = {},
): NextResponse {
  const body: ErrorEnvelope = {
    ok: false,
    error: { code, message },
    warnings: options.warnings ?? [],
    traceId: options.traceId ?? newTraceId(),
  };
  const status = options.status ?? STATUS_FOR_CODE[code] ?? 500;
  return NextResponse.json(body, { status });
}
