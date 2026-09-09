import { describe, expect, it } from "vitest";
import { createServerSafeAuthSnapshot } from "@/lib/auth/use-auth";

describe("auth hydration", () => {
  it("uses the same deterministic guest snapshot for SSR and the first client render", () => {
    expect(createServerSafeAuthSnapshot()).toEqual({
      user: {
        id: "guest",
        name: "Joueur",
        isAnonymous: true,
        avatarColor: 0,
        avatarUrl: null,
      },
      isLoggedIn: false,
      loading: true,
    });
  });
});
