import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), authenticated: true }));
vi.mock("@/lib/supabase/request", () => ({ getRequestSupabase: () => mocks.authenticated ? { rpc: mocks.rpc } : null }));
vi.mock("@/lib/server/request-security", () => ({ getRequestClientKey: () => "test", consumeRateLimit: () => ({ allowed: true }), consumeAuthenticatedAiQuota: vi.fn() }));
import { POST } from "@/app/api/questions/route";

const body = { count: 2, participantTokens: ["device-123456789"], sessionId: "00000000-0000-4000-8000-000000000001", onlineSessionId: "00000000-0000-4000-8000-000000000001" };
describe("API history guarantees", () => {
  beforeEach(() => { mocks.authenticated = true; mocks.rpc.mockReset(); });
  it("never falls back to host-only history on reservation failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "database unavailable" } });
    const response = await POST(new Request("http://localhost/api/questions", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "HISTORY_UNAVAILABLE" });
  });
  it("rejects an online game without an authenticated history", async () => {
    mocks.authenticated = false;
    const response = await POST(new Request("http://localhost/api/questions", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("also fails closed in solo when authentication is unavailable", async () => {
    mocks.authenticated = false;
    const response = await POST(new Request("http://localhost/api/questions", { method: "POST", body: JSON.stringify({ ...body, onlineSessionId: undefined }) }));
    expect(response.status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not substitute unrelated questions for an exhausted public pack", async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    const response = await POST(new Request("http://localhost/api/questions", { method: "POST", body: JSON.stringify({ ...body, questionIds: ["nonexistent-pack-question"] }) }));
    expect(await response.json()).toMatchObject({ questions: [], poolExhausted: true });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("bounds ingestion and reports exhaustion rather than repeating", async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    const response = await POST(new Request("http://localhost/api/questions", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ questions: [], poolExhausted: true });
    expect(mocks.rpc.mock.calls.length).toBeGreaterThan(1);
    for (const [, args] of mocks.rpc.mock.calls) expect(args.p_candidates.length).toBeLessThanOrEqual(300);
  });
});
