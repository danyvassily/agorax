"use client";

/**
 * Agorax — Unified Auth & Profile Management
 * Gère l'authentification (Création de compte, Connexion, Déconnexion),
 * la synchronisation avec Supabase Auth (si configuré) et le mode Local-First.
 * 100% sûr pour Vercel : ne stocke JAMAIS de base64/image dans les métadonnées Auth/cookies JWT
 * pour éviter l'erreur 494 REQUEST_HEADER_TOO_LARGE.
 */
import { useEffect } from "react";
import { create } from "zustand";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getOrCreateDeviceToken,
  getCachedProfileId,
  resolvePlayerProfiles,
  setCachedProfileId,
} from "@/lib/identity/identity-service";
import { useGameStore } from "@/lib/store/game";
import { useLanguageStore } from "@/lib/store/language";
import type { UILanguage } from "@/lib/i18n";
import {
  MIN_ACCOUNT_PASSWORD_LENGTH,
  passwordRecoveryRedirect,
} from "@/lib/auth/password";

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  isAnonymous: boolean;
  avatarColor: number;
  avatarUrl?: string | null;
  createdAt?: string;
  eloRating?: number;
  eloGamesPlayed?: number;
}

const LOCAL_AUTH_KEY = "Agorax_auth_user";
const PASSWORD_RECOVERY_SESSION_KEY = "Agorax_password_recovery_started_at";
const PASSWORD_RECOVERY_MAX_AGE_MS = 30 * 60 * 1000;

function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, val: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, val);
  } catch {
    // ignore
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function markPasswordRecoveryStarted(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PASSWORD_RECOVERY_SESSION_KEY, String(Date.now()));
  } catch {
    // La session Supabase reste l'autorité si le stockage navigateur est indisponible.
  }
}

function hasFreshPasswordRecoveryIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const startedAt = Number(sessionStorage.getItem(PASSWORD_RECOVERY_SESSION_KEY));
    return (
      Number.isFinite(startedAt) &&
      startedAt > 0 &&
      Date.now() - startedAt <= PASSWORD_RECOVERY_MAX_AGE_MS
    );
  } catch {
    return false;
  }
}

function clearPasswordRecoveryIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PASSWORD_RECOVERY_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Compresse et recadre en carré une image sélectionnée par l'utilisateur
 * (format WebP 256x256 léger < 30 Ko)
 */
export async function compressProfilePhoto(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      reject(new Error("Le fichier doit être une image."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        const targetDim = Math.min(maxSize, minDim);
        canvas.width = targetDim;
        canvas.height = targetDim;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible de préparer cette image."));
          return;
        }
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetDim, targetDim);
        try {
          const webp = canvas.toDataURL("image/webp", 0.85);
          resolve(webp);
        } catch {
          const jpeg = canvas.toDataURL("image/jpeg", 0.85);
          resolve(jpeg);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export interface ProfileUpdate { name: string; avatarUrl: string | null; language: UILanguage; }

export interface AuthState {
  updateProfile: (profile: ProfileUpdate) => Promise<void>;
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
  signUp: (params: {
    email: string;
    password: string;
    name: string;
    avatarUrl?: string | null;
    language?: UILanguage;
  }) => Promise<{ user: AuthUser; message?: string }>;
  signIn: (params: { email: string; password: string }) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  changePassword: (params: { currentPassword: string; newPassword: string }) => Promise<void>;
  completePasswordRecovery: (newPassword: string) => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;
  updateLanguage: (newLang: UILanguage) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isLoggedIn: false,

  refreshUser: async () => {
    if (typeof window === "undefined") {
      set({ loading: false });
      return;
    }

    set({ loading: true });

    try {
      const sb = getSupabaseBrowser();
      if (sb && isSupabaseConfigured) {
        const { data } = await sb.auth.getUser();
        if (data.user && !data.user.is_anonymous) {
          const authUserId = data.user.id;
          const email = data.user.email;
          const metadata = data.user.user_metadata ?? {};

          if (metadata.avatar_url && String(metadata.avatar_url).startsWith("data:")) {
            sb.auth.updateUser({ data: { avatar_url: null } }).catch(() => {});
          }

          const resolved = await resolvePlayerProfiles([await getOrCreateDeviceToken()]);
          const resolvedProfileId = resolved[0]?.profile_id;
          const profileQuery = sb.from("player_profiles").select("*");
          const { data: prof } = resolvedProfileId
            ? await profileQuery.eq("id", resolvedProfileId).maybeSingle()
            : await profileQuery.eq("user_id", authUserId).maybeSingle();

          const name = prof?.nickname || metadata.username || metadata.name || email?.split("@")[0] || "Joueur";
          const avatarColor = prof?.avatar_color ?? 0;
          const avatarUrl = prof?.avatar_url || null;

          const activeUser: AuthUser = {
            id: prof?.id || authUserId,
            email,
            name,
            isAnonymous: false,
            avatarColor,
            avatarUrl,
            createdAt: data.user.created_at,
            eloRating: prof?.elo_rating ?? 1000,
            eloGamesPlayed: prof?.elo_games_played ?? 0,
          };

          set({ user: activeUser, isLoggedIn: true });
          setCachedProfileId(activeUser.id);
          
          if (prof?.language) {
            useLanguageStore.getState().setLanguage(prof.language as UILanguage);
          } else if (authUserId) {
            const { data: legacyProf } = await sb.from("profiles").select("language").eq("id", authUserId).maybeSingle();
            if (legacyProf?.language) {
              useLanguageStore.getState().setLanguage(legacyProf.language as UILanguage);
            }
          }
          
          safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(activeUser));
          set({ loading: false });
          return;
        }

        const resolved = await resolvePlayerProfiles([await getOrCreateDeviceToken()]);
        if (resolved[0]?.profile_id) {
          const currentName = useGameStore.getState().players[0]?.name || "Joueur";
          const currentAvatar = useGameStore.getState().players[0]?.avatarUrl || null;
          const anonymousUser: AuthUser = {
            id: resolved[0].profile_id,
            name: currentName,
            isAnonymous: true,
            avatarColor: 0,
            avatarUrl: currentAvatar,
          };
          set({ user: anonymousUser, isLoggedIn: false });
          setCachedProfileId(anonymousUser.id);
          safeRemoveStorage(LOCAL_AUTH_KEY);
          set({ loading: false });
          return;
        }
      }

      const cached = safeGetStorage(LOCAL_AUTH_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as AuthUser;
          set({ user: parsed, isLoggedIn: !parsed.isAnonymous });
          setCachedProfileId(parsed.id);
          set({ loading: false });
          return;
        } catch {}
      }

      const deviceToken = await getOrCreateDeviceToken();
      const cachedProfId = getCachedProfileId();
      const currentName = useGameStore.getState().players[0]?.name || "Joueur";
      const currentAvatar = useGameStore.getState().players[0]?.avatarUrl || null;

      const anonUser: AuthUser = {
        id: cachedProfId || `anon_${deviceToken.slice(0, 12)}`,
        name: currentName,
        isAnonymous: true,
        avatarColor: 0,
        avatarUrl: currentAvatar,
      };
      
      set({ user: anonUser, isLoggedIn: false });
    } catch (err) {
      console.error("[useAuth] Erreur lors du chargement:", err);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (params) => {
    const { email, password, name, avatarUrl, language = "fr" } = params;
    if (password.length < MIN_ACCOUNT_PASSWORD_LENGTH) {
      throw new Error(`Le mot de passe doit contenir au moins ${MIN_ACCOUNT_PASSWORD_LENGTH} caractères.`);
    }
    const cleanName = name.trim().slice(0, 24) || email.split("@")[0];
    const deviceToken = await getOrCreateDeviceToken();

    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured) {
      const { data: currentIdentity } = await sb.auth.getUser();
      if (currentIdentity.user?.is_anonymous) {
        await sb.auth.signOut({ scope: "local" });
      }
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
          data: { username: cleanName, language },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userId = data.user.id;
        const resolved = data.session ? await resolvePlayerProfiles([deviceToken]) : [];
        const profileId = resolved[0]?.profile_id ?? userId;

        if (data.session) {
          try {
            await sb.from("player_profiles").update({ nickname: cleanName, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) }).eq("id", profileId);
          } catch {}
        }

        const newUser: AuthUser = {
          id: profileId,
          email,
          name: cleanName,
          isAnonymous: false,
          avatarColor: 0,
          avatarUrl: avatarUrl ?? null,
          createdAt: data.user.created_at,
        };

        if (data.session) {
          set({ user: newUser, isLoggedIn: true });
          safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(newUser));
        }

        const players = useGameStore.getState().players;
        const updatedPlayers = players.map((p, i) => i === 0 ? { ...p, name: cleanName, avatarUrl: avatarUrl || undefined } : p);
        useGameStore.getState().setPlayers(updatedPlayers);
        if (language) useLanguageStore.getState().setLanguage(language);

        return {
          user: newUser,
          message: data.session ? undefined : language === "fr" ? `Compte créé ! Un email de confirmation a été envoyé à ${email}.` : `Account created! A confirmation email was sent to ${email}.`,
        };
      }
    }

    const localUserId = `user_${Date.now()}`;
    const newUser: AuthUser = {
      id: localUserId,
      email,
      name: cleanName,
      isAnonymous: false,
      avatarColor: 0,
      avatarUrl: avatarUrl ?? null,
      createdAt: new Date().toISOString(),
    };

    set({ user: newUser, isLoggedIn: true });
    setCachedProfileId(localUserId);
    safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(newUser));
    safeSetStorage(`Agorax_device_${deviceToken}`, localUserId);

    const players = useGameStore.getState().players;
    const updatedPlayers = players.map((p, i) => i === 0 ? { ...p, name: cleanName, avatarUrl: avatarUrl || undefined } : p);
    useGameStore.getState().setPlayers(updatedPlayers);
    if (language) useLanguageStore.getState().setLanguage(language);

    return { user: newUser };
  },

  signIn: async (params) => {
    const { email, password } = params;
    const deviceToken = await getOrCreateDeviceToken();

    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured) {
      const { data: currentIdentity } = await sb.auth.getUser();
      if (currentIdentity.user?.is_anonymous) {
        await sb.auth.signOut({ scope: "local" });
      }
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Erreur de connexion");

      const userId = data.user.id;
      const resolved = await resolvePlayerProfiles([deviceToken]);
      const profileId = resolved[0]?.profile_id ?? userId;
      const metadata = data.user.user_metadata ?? {};
      const name = metadata.username || metadata.name || email.split("@")[0];

      if (metadata.avatar_url) {
        sb.auth.updateUser({ data: { avatar_url: null } }).catch(() => {});
      }

      await sb.from("player_profiles").update({ nickname: name }).eq("id", profileId);

      const { data: prof } = await sb.from("player_profiles").select("avatar_url, nickname, language").eq("id", profileId).maybeSingle();
      const avatarUrl = prof?.avatar_url || null;

      const activeUser: AuthUser = {
        id: profileId,
        email,
        name: prof?.nickname || name,
        isAnonymous: false,
        avatarColor: 0,
        avatarUrl,
        createdAt: data.user.created_at,
      };

      set({ user: activeUser, isLoggedIn: true });
      setCachedProfileId(profileId);
      safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(activeUser));

      if (prof?.language) {
        useLanguageStore.getState().setLanguage(prof.language as UILanguage);
      }

      const players = useGameStore.getState().players;
      const updatedPlayers = players.map((p, i) => i === 0 ? { ...p, name, avatarUrl: avatarUrl || undefined } : p);
      useGameStore.getState().setPlayers(updatedPlayers);

      return activeUser;
    }

    const cached = safeGetStorage(LOCAL_AUTH_KEY);
    let activeUser: AuthUser;
    if (cached) {
      activeUser = JSON.parse(cached);
      activeUser.email = email;
    } else {
      activeUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0],
        isAnonymous: false,
        avatarColor: 0,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
    }

    set({ user: activeUser, isLoggedIn: true });
    setCachedProfileId(activeUser.id);
    safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(activeUser));
    return activeUser;
  },

  signInWithGoogle: async () => {
    const sb = getSupabaseBrowser();
    if (!sb || !isSupabaseConfigured) {
      throw new Error("Supabase n'est pas configuré");
    }
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured) {
      const { error } = await sb.auth.signOut({ scope: "local" });
      if (error) throw error;
    }

    safeRemoveStorage(LOCAL_AUTH_KEY);
    const deviceToken = await getOrCreateDeviceToken();
    const resolved = sb && isSupabaseConfigured ? await resolvePlayerProfiles([deviceToken]) : [];
    const anonId = resolved[0]?.profile_id ?? `anon_${deviceToken.slice(0, 12)}`;
    setCachedProfileId(anonId);

    set({
      user: {
        id: anonId,
        name: "Joueur",
        isAnonymous: true,
        avatarColor: 0,
        avatarUrl: null,
      },
      isLoggedIn: false
    });
  },

  requestPasswordReset: async (email) => {
    const sb = getSupabaseBrowser();
    if (!sb || !isSupabaseConfigured) {
      throw new Error("La récupération du mot de passe nécessite la connexion à Supabase.");
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error("Saisissez votre adresse email.");
    const { error } = await sb.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: passwordRecoveryRedirect(window.location.origin),
    });
    if (error) throw error;
  },

  changePassword: async (params) => {
    if (params.newPassword.length < MIN_ACCOUNT_PASSWORD_LENGTH) {
      throw new Error(`Le nouveau mot de passe doit contenir au moins ${MIN_ACCOUNT_PASSWORD_LENGTH} caractères.`);
    }
    const user = get().user;
    if (!user?.email || user.isAnonymous) {
      throw new Error("Connectez-vous à votre compte pour modifier le mot de passe.");
    }
    const sb = getSupabaseBrowser();
    if (!sb || !isSupabaseConfigured) {
      throw new Error("La modification du mot de passe nécessite la connexion à Supabase.");
    }
    const { error: verificationError } = await sb.auth.signInWithPassword({
      email: user.email,
      password: params.currentPassword,
    });
    if (verificationError) throw new Error("Le mot de passe actuel est incorrect.");
    const { error } = await sb.auth.updateUser({ password: params.newPassword });
    if (error) throw error;
  },

  completePasswordRecovery: async (newPassword) => {
    if (newPassword.length < MIN_ACCOUNT_PASSWORD_LENGTH) {
      throw new Error(`Le nouveau mot de passe doit contenir au moins ${MIN_ACCOUNT_PASSWORD_LENGTH} caractères.`);
    }
    const sb = getSupabaseBrowser();
    if (!sb || !isSupabaseConfigured) {
      throw new Error("Le lien de récupération ne peut pas être validé hors ligne.");
    }
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session || sessionData.session.user.is_anonymous || !hasFreshPasswordRecoveryIntent()) {
      throw new Error("Ce lien a expiré. Demandez un nouveau lien de récupération.");
    }
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
    clearPasswordRecoveryIntent();
  },

  updateProfile: async ({ name, avatarUrl, language }) => {
    const user = get().user;
    if (!user) throw new Error("Profil indisponible");
    const clean = name.trim().slice(0, 24);
    if (!clean || !["fr", "en"].includes(language)) throw new Error("Profil invalide");
    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured && !user.isAnonymous) {
      // One database write: a failed save must not publish optimistic local success.
      const { error } = await sb.from("player_profiles")
        .update({ nickname: clean, avatar_url: avatarUrl, language })
        .eq("id", user.id).select("id").single();
      if (error) throw error;
    }
    const updatedUser = { ...user, name: clean, avatarUrl };
    set({ user: updatedUser });
    safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(updatedUser));
    useLanguageStore.getState().setLanguage(language);
    useGameStore.getState().setPlayers(useGameStore.getState().players.map((p, i) =>
      i === 0 ? { ...p, name: clean, avatarUrl: avatarUrl || undefined, language } : p));
  },
  updateName: async (name) => {
    const user = get().user;
    if (!user) throw new Error("Profil indisponible");
    await get().updateProfile({ name, avatarUrl: user.avatarUrl ?? null, language: useLanguageStore.getState().language });
  },
  updateAvatar: async (avatarUrl) => {
    const user = get().user;
    if (!user) throw new Error("Profil indisponible");
    await get().updateProfile({ name: user.name, avatarUrl, language: useLanguageStore.getState().language });
  },
  updateLanguage: async (language) => {
    const user = get().user;
    if (!user) { useLanguageStore.getState().setLanguage(language); return; }
    await get().updateProfile({ name: user.name, avatarUrl: user.avatarUrl ?? null, language });
  },
}));

export function AuthHydrator() {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) await useAuthStore.getState().refreshUser();
    };
    init();

    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured) {
      const { data: sub } = sb.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" && typeof window !== "undefined") {
          markPasswordRecoveryStarted();
        }
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED" ||
          event === "PASSWORD_RECOVERY"
        ) {
          setTimeout(() => { if (mounted) void useAuthStore.getState().refreshUser(); }, 0);
        }
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}

export function useAuth() {
  return useAuthStore();
}
