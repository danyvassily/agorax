import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { flushExposures, useExposureOutbox } from "@/lib/questions/exposure-outbox";

const entry = { sessionId: "00000000-0000-4000-8000-000000000001", participantTokens: ["device-123456789"], questionId: "q123", familyId: "family.a" };
describe("durable exposure delivery", () => {
  beforeEach(() => useExposureOutbox.setState({ pending: [] }));
  afterEach(() => vi.unstubAllGlobals());
  it("retains HTTP failures and retries successfully without duplicating", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(Response.json({ synced: true }));
    vi.stubGlobal("fetch", fetchMock);
    useExposureOutbox.getState().enqueue(entry);
    useExposureOutbox.getState().enqueue(entry);
    await flushExposures(async () => ({}));
    expect(useExposureOutbox.getState().pending).toHaveLength(1);
    await flushExposures(async () => ({}));
    expect(useExposureOutbox.getState().pending).toHaveLength(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("does not mistake offline 200 responses for persistence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ synced: false })));
    useExposureOutbox.getState().enqueue(entry);
    await flushExposures(async () => ({}));
    expect(useExposureOutbox.getState().pending).toHaveLength(1);
  });
  it("retains entries on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    useExposureOutbox.getState().enqueue(entry);
    await flushExposures(async () => ({}));
    expect(useExposureOutbox.getState().pending).toHaveLength(1);
  });
});
