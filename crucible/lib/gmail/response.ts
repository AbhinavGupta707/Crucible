import { NextResponse } from "next/server";

export type ApiOk<T> = {
  ok: true;
  data: T;
  warnings: string[];
  traceId: string;
};

export type ApiErr = {
  ok: false;
  error: { code: string; message: string };
  warnings: string[];
  traceId: string;
};

function newTraceId(): string {
  return `trace_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function ok<T>(data: T, warnings: string[] = []): NextResponse<ApiOk<T>> {
  return NextResponse.json({
    ok: true,
    data,
    warnings,
    traceId: newTraceId(),
  });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  warnings: string[] = [],
): NextResponse<ApiErr> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
      warnings,
      traceId: newTraceId(),
    },
    { status },
  );
}
