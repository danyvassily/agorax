import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ callback: undefined as undefined | ((payload: { new: unknown }) => void) }));
vi.mock("@/lib/supabase/client", () => ({ getSupabaseBrowser: () => ({
  channel: () => ({ on: (_event: unknown, _filter: unknown, callback: typeof state.callback) => {
    state.callback = callback;
    return { subscribe: () => ({}) };
  } }),
  removeChannel: vi.fn(),
}) }));
import { subscribeSession } from "@/lib/online/room";

describe("room network ordering", () => {
  afterEach(() => vi.useRealTimers());
  it("ignores stale, duplicate and post-unmount updates", () => {
    vi.useFakeTimers();
    const listener = vi.fn();
    const unsubscribe = subscribeSession("test-room", listener);
    state.callback?.({ new: { state_version: 4, question_index: 3 } });
    state.callback?.({ new: { state_version: 2, question_index: 1 } });
    state.callback?.({ new: { state_version: 4, question_index: 3 } });
    expect(listener).toHaveBeenCalledTimes(1);
    state.callback?.({ new: { state_version: 5, question_index: 4 } });
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    state.callback?.({ new: { state_version: 6 } });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
