import { beforeEach, describe, expect, it, vi } from "vitest";

class MockStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

// Setup browser globals for Node test environment
const mockLocal = new MockStorage();
const mockSession = new MockStorage();
vi.stubGlobal("localStorage", mockLocal);
vi.stubGlobal("sessionStorage", mockSession);
vi.stubGlobal("window", {
  location: { origin: "http://localhost:3000" },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

// Mock Supabase browser client
vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
  getSupabaseBrowser: vi.fn(),
}));

// Mock identity service
vi.mock("@/lib/identity/identity-service", () => ({
  getOrCreateDeviceToken: vi.fn().mockResolvedValue("test-device-token-12345678"),
  getCachedProfileId: vi.fn().mockReturnValue("prof_test_123"),
  setCachedProfileId: vi.fn(),
  resolvePlayerProfiles: vi.fn().mockResolvedValue([
    { device_token: "test-device-token-12345678", profile_id: "prof_test_123" },
  ]),
}));

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/auth/use-auth";
import { useGameStore } from "@/lib/store/game";

describe("avatar and profile persistence", () => {
  beforeEach(() => {
    mockLocal.clear();
    mockSession.clear();
    vi.clearAllMocks();
  });

  it("preserves guest avatar across refreshUser calls without deleting LOCAL_AUTH_KEY", async () => {
    const mockSb = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "prof_test_123",
                nickname: "GuestPlayer",
                avatar_url: "/images/team/milo.webp",
                language: "fr",
              },
            }),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      storage: {
        from: vi.fn(),
      },
    };
    vi.mocked(getSupabaseBrowser).mockReturnValue(mockSb as unknown as ReturnType<typeof getSupabaseBrowser>);

    // Initial guest profile update
    await useAuthStore.getState().updateProfile({
      name: "GuestPlayer",
      avatarUrl: "/images/team/milo.webp",
      language: "fr",
    });

    // Check store and localStorage
    expect(useAuthStore.getState().user?.avatarUrl).toBe("/images/team/milo.webp");
    expect(mockLocal.getItem("Agorax_auth_user")).not.toBeNull();

    // Trigger refreshUser (as happens on window focus / tab change / reload)
    await useAuthStore.getState().refreshUser();

    // Verify avatar is NOT lost and LOCAL_AUTH_KEY is NOT deleted
    const currentUser = useAuthStore.getState().user;
    expect(currentUser?.avatarUrl).toBe("/images/team/milo.webp");
    expect(currentUser?.name).toBe("GuestPlayer");
    expect(mockLocal.getItem("Agorax_auth_user")).not.toBeNull();

    const storedInLocal = JSON.parse(mockLocal.getItem("Agorax_auth_user")!);
    expect(storedInLocal.avatarUrl).toBe("/images/team/milo.webp");
  });

  it("recovers Google OAuth avatar when player_profiles avatar_url is initially null", async () => {
    const googleAvatarUrl = "https://lh3.googleusercontent.com/a/ACg8ocTestGooglePhoto=s96-c";
    const mockSb = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "auth-uuid-google-1",
              email: "dany@example.com",
              is_anonymous: false,
              created_at: new Date().toISOString(),
              user_metadata: {
                avatar_url: googleAvatarUrl,
                picture: googleAvatarUrl,
                full_name: "Dany Google",
              },
            },
          },
        }),
        updateUser: vi.fn().mockResolvedValue({}),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "prof_test_google_1",
                nickname: "dany",
                avatar_url: null, // remote DB not yet initialized with avatar
                language: "fr",
              },
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            catch: vi.fn(),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      storage: {
        from: vi.fn(),
      },
    };
    vi.mocked(getSupabaseBrowser).mockReturnValue(mockSb as unknown as ReturnType<typeof getSupabaseBrowser>);

    await useAuthStore.getState().refreshUser();

    const user = useAuthStore.getState().user;
    expect(user?.avatarUrl).toBe(googleAvatarUrl);
    expect(user?.name).toBe("dany");
    expect(user?.isAnonymous).toBe(false);

    // Verify it was stored in local storage
    const cached = JSON.parse(mockLocal.getItem("Agorax_auth_user")!);
    expect(cached.avatarUrl).toBe(googleAvatarUrl);

    // Verify that Google avatar was NOT removed via sb.auth.updateUser
    expect(mockSb.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates game store player avatar when profile is updated", async () => {
    const mockSb = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(getSupabaseBrowser).mockReturnValue(mockSb as unknown as ReturnType<typeof getSupabaseBrowser>);

    await useAuthStore.getState().updateProfile({
      name: "Captain",
      avatarUrl: "/images/team/luna.webp",
      language: "fr",
    });

    const firstPlayer = useGameStore.getState().players[0];
    expect(firstPlayer.name).toBe("Captain");
    expect(firstPlayer.avatarUrl).toBe("/images/team/luna.webp");
  });

  it("recovers avatar from LOCAL_AUTH_KEY when remote player_profiles query fails or is offline", async () => {
    // Simulate offline or network failure where sb is unavailable or returns error
    vi.mocked(getSupabaseBrowser).mockReturnValue(null);

    mockLocal.setItem(
      "Agorax_auth_user",
      JSON.stringify({
        id: "anon_local_test",
        name: "OfflineHero",
        isAnonymous: true,
        avatarColor: 2,
        avatarUrl: "/images/team/alex.webp",
      })
    );

    await useAuthStore.getState().refreshUser();

    const user = useAuthStore.getState().user;
    expect(user?.name).toBe("OfflineHero");
    expect(user?.avatarUrl).toBe("/images/team/alex.webp");
  });
});
