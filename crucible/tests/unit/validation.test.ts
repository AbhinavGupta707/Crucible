import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseJsonBody, parseValue, requireParam } from "../../lib/api/validation";

function buildJsonRequest(body: unknown): import("next/server").NextRequest {
  return new Request("http://test/api/x", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    // @ts-expect-error duplex required by undici
    duplex: "half",
  }) as unknown as import("next/server").NextRequest;
}

describe("parseJsonBody", () => {
  it("returns parsed data on success", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = await parseJsonBody(buildJsonRequest({ name: "ada" }), schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe("ada");
  });

  it("returns 400 envelope when schema fails", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = await parseJsonBody(buildJsonRequest({}), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = (await result.response.json()) as {
        ok: boolean;
        error: { code: string };
      };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("parseValue", () => {
  it("validates raw values against the schema", () => {
    const schema = z.object({ n: z.number() });
    const ok = parseValue({ n: 1 }, schema);
    expect(ok.ok).toBe(true);
    const bad = parseValue({ n: "x" }, schema);
    expect(bad.ok).toBe(false);
  });
});

describe("requireParam", () => {
  it("rejects empty params", () => {
    const r = requireParam("", "id");
    expect(r.ok).toBe(false);
  });

  it("accepts non-empty params", () => {
    const r = requireParam("abc", "id");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe("abc");
  });
});
