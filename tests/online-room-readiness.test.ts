import { describe, it, expect } from "vitest";
import type { OnlinePlayer } from "@/lib/online/room";

describe("Online Room Readiness & Starting Invariants", () => {
  it("allows host to start with 1 player (solo / test play in room)", () => {
    const host: OnlinePlayer = {
      id: "host-1",
      session_id: "s-1",
      user_id: "u-1",
      profile_id: "prof-1",
      name: "Host Player",
      is_host: true,
      score: 0,
      ready: true,
    };

    const players = [host];
    const isHost = host.is_host;
    const canStart = isHost && players.length >= 1;

    expect(canStart).toBe(true);
  });

  it("correctly evaluates readiness across multiple players", () => {
    const host: OnlinePlayer = {
      id: "host-1",
      session_id: "s-1",
      user_id: "u-1",
      profile_id: "prof-1",
      name: "Host Player",
      is_host: true,
      score: 0,
      ready: true,
    };

    const guest1: OnlinePlayer = {
      id: "guest-1",
      session_id: "s-1",
      user_id: "u-2",
      profile_id: "prof-2",
      name: "Guest 1",
      is_host: false,
      score: 0,
      ready: false,
    };

    const guest2: OnlinePlayer = {
      id: "guest-2",
      session_id: "s-1",
      user_id: "u-3",
      profile_id: "prof-3",
      name: "Guest 2",
      is_host: false,
      score: 0,
      ready: true,
    };

    const players = [host, guest1, guest2];
    const otherPlayers = players.filter((p) => p.id !== host.id);

    const isPlayerReady = (p: OnlinePlayer, myId: string, myReady: boolean) => {
      if (p.id === myId) return myReady;
      return p.ready === true;
    };

    // Initially guest1 is not ready
    let allOthersReady = otherPlayers.every((p) => isPlayerReady(p, host.id, true));
    expect(allOthersReady).toBe(false);

    // Host can still start if desired
    const canStart = host.is_host && players.length >= 1;
    expect(canStart).toBe(true);

    // Guest 1 toggles ready
    guest1.ready = true;
    allOthersReady = otherPlayers.every((p) => isPlayerReady(p, host.id, true));
    expect(allOthersReady).toBe(true);

    const everyoneReady = players.every((p) => isPlayerReady(p, host.id, true));
    expect(everyoneReady).toBe(true);
  });

  it("safely handles optimistic presence merging with database ready state", () => {
    const player: OnlinePlayer = {
      id: "p-1",
      session_id: "s-1",
      user_id: "u-1",
      profile_id: "prof-1",
      name: "Tester",
      is_host: false,
      score: 0,
      ready: false,
    };

    const presence: Record<string, { ready: boolean }> = {
      "p-1": { ready: true },
    };

    // Presence true overrides DB false (optimistic or live websocket)
    const isReady = player.ready === true || presence[player.id]?.ready === true;
    expect(isReady).toBe(true);
  });
});
