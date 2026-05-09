import { describe, it, expect } from "vitest";
import { ok, fail, ERROR_CODES } from "../../lib/api/response";

async function readBody<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

describe("response envelope", () => {
  it("ok returns the success envelope shape", async () => {
    const res = ok({ hello: "world" });
    expect(res.status).toBe(200);
    const body = await readBody<{
      ok: boolean;
      data: { hello: string };
      warnings: string[];
      traceId: string;
    }>(res);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ hello: "world" });
    expect(body.warnings).toEqual([]);
    expect(body.traceId.startsWith("trace_")).toBe(true);
  });

  it("ok carries warnings and custom status", async () => {
    const res = ok({}, { warnings: ["dep_unavailable"], status: 201 });
    expect(res.status).toBe(201);
    const body = await readBody<{ warnings: string[] }>(res);
    expect(body.warnings).toEqual(["dep_unavailable"]);
  });

  it("fail returns the error envelope and maps known codes to HTTP status", async () => {
    const res = fail(ERROR_CODES.VALIDATION_ERROR, "Bad input");
    expect(res.status).toBe(400);
    const body = await readBody<{
      ok: boolean;
      error: { code: string; message: string };
      warnings: string[];
      traceId: string;
    }>(res);
    expect(body.ok).toBe(false);
    expect(body.error).toEqual({ code: "VALIDATION_ERROR", message: "Bad input" });
    expect(body.warnings).toEqual([]);
    expect(body.traceId.startsWith("trace_")).toBe(true);
  });

  it("fail honors explicit status override", async () => {
    const res = fail(ERROR_CODES.INTERNAL, "Boom", { status: 418 });
    expect(res.status).toBe(418);
  });
});
