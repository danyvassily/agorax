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
import {
  isInlineAvatar,
  isStoredAvatar,
  removeProfileAvatar,
  resolveProfileAvatar,
  uploadProfileAvatar,
} from "@/lib/auth/avatar-storage";

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  isAnonymous: boolean;
  avatarColor: number;
  avatarUrl?: string | null;
  avatarStorageValue?: string | null;
  createdAt?: string;
  eloRating?: number;
  eloGamesPlayed?: number;
  language?: UILanguage;
}

const LOCAL_AUTH_KEY = "Agorax_auth_user";
const PENDING_AVATAR_KEY = "Agorax_pending_avatar";
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

function getInitialGuestUser(): AuthUser {
  if (typeof window !== "undefined") {
    const cached = safeGetStorage(LOCAL_AUTH_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as AuthUser;
      } catch {}
    }
  }
  return {
    id: "guest",
    name: "Joueur",
    isAnonymous: true,
    avatarColor: 0,
    avatarUrl: null,
  };
}

let isRefreshing = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialGuestUser(),
  loading: false,
  isLoggedIn: typeof window !== "undefined" && !getInitialGuestUser().isAnonymous,

  refreshUser: async () => {
    if (typeof window === "undefined") {
      set({ loading: false });
      return;
    }

    if (isRefreshing) return;
    isRefreshing = true;

    try {
      const sb = getSupabaseBrowser();
      if (sb && isSupabaseConfigured) {
        const { data } = await sb.auth.getUser();
        if (data.user && !data.user.is_anonymous) {
          const authUserId = data.user.id;
          const email = data.user.email;
          const metadata = data.user.user_metadata ?? {};
          const oauthAvatar =
            typeof metadata.avatar_url === "string" && !isInlineAvatar(metadata.avatar_url)
              ? metadata.avatar_url
              : typeof metadata.picture === "string" && !isInlineAvatar(metadata.picture)
              ? metadata.picture
              : null;

          const legacyMetadataAvatar = isInlineAvatar(String(metadata.avatar_url ?? ""))
            ? String(metadata.avatar_url)
            : null;

          if (legacyMetadataAvatar) {
            sb.auth.updateUser({ data: { avatar_url: null } }).catch(() => {});
          }

          const deviceToken = await getOrCreateDeviceToken();
          const resolved = await resolvePlayerProfiles([deviceToken]);
          const resolvedProfileId = resolved[0]?.profile_id;
          const profileQuery = sb.from("player_profiles").select("*");
          const { data: prof } = resolvedProfileId
            ? await profileQuery.eq("id", resolvedProfileId).maybeSingle()
            : await profileQuery.eq("user_id", authUserId).maybeSingle();

          const name = prof?.nickname || metadata.username || metadata.name || email?.split("@")[0] || "Joueur";
          const avatarColor = prof?.avatar_color ?? 0;
          let avatarStorageValue = prof?.avatar_url || oauthAvatar || null;
          let avatarUrl = await resolveProfileAvatar(avatarStorageValue);

          // Si le profil distant n'a pas encore d'avatar mais que OAuth en fournit un, persister en base
          if (!prof?.avatar_url && oauthAvatar && prof?.id) {
            try {
              await sb.from("player_profiles").update({ avatar_url: oauthAvatar }).eq("id", prof.id);
            } catch {}
          }

          const pendingAvatar = safeGetStorage(PENDING_AVATAR_KEY);
          const inlineAvatar = isInlineAvatar(avatarStorageValue)
            ? avatarStorageValue
            : isInlineAvatar(pendingAvatar) ? pendingAvatar : legacyMetadataAvatar;
          if (inlineAvatar && prof?.id) {
            try {
              const storedAvatar = await uploadProfileAvatar(inlineAvatar);
              const { error: avatarError } = await sb.from("player_profiles")
                .update({ avatar_url: storedAvatar.storageValue })
                .eq("id", prof.id)
                .select("id")
                .single();
              if (!avatarError) {
                avatarStorageValue = storedAvatar.storageValue;
                avatarUrl = storedAvatar.displayUrl;
                safeRemoveStorage(PENDING_AVATAR_KEY);
              }
            } catch {
              // Keep the pending image locally and retry after the next authenticated refresh.
            }
          }

          const activeUser: AuthUser = {
            id: prof?.id || authUserId,
            email,
            name,
            isAnonymous: false,
            avatarColor,
            avatarUrl,
            avatarStorageValue: isStoredAvatar(avatarStorageValue) ? avatarStorageValue : null,
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

        const deviceToken = await getOrCreateDeviceToken();
        const resolved = await resolvePlayerProfiles([deviceToken]);
        const resolvedProfileId = resolved[0]?.profile_id;

        let prof: { id: string; nickname?: string; avatar_url?: string | null; language?: string; avatar_color?: number } | null = null;
        if (resolvedProfileId) {
          const { data: remoteProf } = await sb.from("player_profiles").select("*").eq("id", resolvedProfileId).maybeSingle();
          prof = remoteProf;
        }

        const cachedRaw = safeGetStorage(LOCAL_AUTH_KEY);
        let cachedUser: AuthUser | null = null;
        if (cachedRaw) {
          try { cachedUser = JSON.parse(cachedRaw); } catch {}
        }

        const currentName = prof?.nickname && prof.nickname !== "Joueur"
          ? prof.nickname
          : cachedUser?.name && cachedUser.name !== "Joueur"
          ? cachedUser.name
          : useGameStore.getState().players[0]?.name || "Joueur";

        const rawAvatar = prof?.avatar_url || cachedUser?.avatarUrl || useGameStore.getState().players[0]?.avatarUrl || null;
        const resolvedAvatar = await resolveProfileAvatar(rawAvatar);

        // Si le cache local possédait un avatar non encore synchronisé avec le profil distant, le synchroniser
        if (!prof?.avatar_url && rawAvatar && resolvedProfileId) {
          try {
            await sb.rpc("save_player_profile", {
              p_profile_id: resolvedProfileId,
              p_nickname: currentName,
              p_avatar_url: rawAvatar,
              p_language: prof?.language || useLanguageStore.getState().language,
              p_device_token: deviceToken,
            });
          } catch {}
        }

        const anonymousUser: AuthUser = {
          id: resolvedProfileId || cachedUser?.id || `anon_${deviceToken.slice(0, 12)}`,
          name: currentName,
          isAnonymous: true,
          avatarColor: prof?.avatar_color ?? cachedUser?.avatarColor ?? 0,
          avatarUrl: resolvedAvatar,
          avatarStorageValue: isStoredAvatar(rawAvatar) ? rawAvatar : null,
        };

        set({ user: anonymousUser, isLoggedIn: false });
        setCachedProfileId(anonymousUser.id);
        safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(anonymousUser));

        if (prof?.language) {
          useLanguageStore.getState().setLanguage(prof.language as UILanguage);
        } else if (cachedUser?.language) {
          useLanguageStore.getState().setLanguage(cachedUser.language as UILanguage);
        }

        useGameStore.getState().setPlayers(
          useGameStore.getState().players.map((p, i) =>
            i === 0 ? { ...p, name: currentName, avatarUrl: resolvedAvatar || undefined } : p
          )
        );

        set({ loading: false });
        return;
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
      safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(anonUser));
    } catch (err) {
      console.error("[useAuth] Erreur lors du chargement:", err);
    } finally {
      isRefreshing = false;
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
        let storedAvatarValue = avatarUrl ?? null;
        let displayAvatarUrl = avatarUrl ?? null;

        if (isInlineAvatar(avatarUrl)) {
          if (data.session) {
            try {
              const storedAvatar = await uploadProfileAvatar(avatarUrl);
              storedAvatarValue = storedAvatar.storageValue;
              displayAvatarUrl = storedAvatar.displayUrl;
              safeRemoveStorage(PENDING_AVATAR_KEY);
            } catch {
              safeSetStorage(PENDING_AVATAR_KEY, avatarUrl);
              storedAvatarValue = null;
            }
          } else {
            safeSetStorage(PENDING_AVATAR_KEY, avatarUrl);
            storedAvatarValue = null;
          }
        }

        if (data.session) {
          try {
            await sb.from("player_profiles").update({ nickname: cleanName, ...(storedAvatarValue ? { avatar_url: storedAvatarValue } : {}) }).eq("id", profileId);
          } catch {}
        }

        const newUser: AuthUser = {
          id: profileId,
          email,
          name: cleanName,
          isAnonymous: false,
          avatarColor: 0,
          avatarUrl: displayAvatarUrl,
          avatarStorageValue: isStoredAvatar(storedAvatarValue) ? storedAvatarValue : null,
          createdAt: data.user.created_at,
        };

        if (data.session) {
          set({ user: newUser, isLoggedIn: true });
          safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(newUser));
        }

        const players = useGameStore.getState().players;
        const updatedPlayers = players.map((p, i) => i === 0 ? { ...p, name: cleanName, avatarUrl: displayAvatarUrl || undefined } : p);
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

      if (metadata.avatar_url && isInlineAvatar(metadata.avatar_url)) {
        sb.auth.updateUser({ data: { avatar_url: null } }).catch(() => {});
      }

      await sb.from("player_profiles").update({ nickname: name }).eq("id", profileId);

      const { data: prof } = await sb.from("player_profiles").select("avatar_url, nickname, language").eq("id", profileId).maybeSingle();
      const oauthAvatar =
        typeof metadata.avatar_url === "string" && !isInlineAvatar(metadata.avatar_url)
          ? metadata.avatar_url
          : typeof metadata.picture === "string" && !isInlineAvatar(metadata.picture)
          ? metadata.picture
          : null;
      const avatarStorageValue = prof?.avatar_url || oauthAvatar || null;
      const avatarUrl = await resolveProfileAvatar(avatarStorageValue);

      if (!prof?.avatar_url && oauthAvatar && profileId) {
        try {
          await sb.from("player_profiles").update({ avatar_url: oauthAvatar }).eq("id", profileId);
        } catch {}
      }

      const activeUser: AuthUser = {
        id: profileId,
        email,
        name: prof?.nickname || name,
        isAnonymous: false,
        avatarColor: 0,
        avatarUrl,
        avatarStorageValue: isStoredAvatar(avatarStorageValue) ? avatarStorageValue : null,
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
    let storedAvatarValue = avatarUrl;
    let displayAvatarUrl = avatarUrl;

    if (sb && isSupabaseConfigured) {
      if (!user.isAnonymous) {
        if (isInlineAvatar(avatarUrl)) {
          const storedAvatar = await uploadProfileAvatar(avatarUrl);
          storedAvatarValue = storedAvatar.storageValue;
          displayAvatarUrl = storedAvatar.displayUrl;
        } else if (avatarUrl === user.avatarUrl && user.avatarStorageValue) {
          storedAvatarValue = user.avatarStorageValue;
        }
        // Pour les comptes connectés : persistance via RPC save_player_profile ou match direct
        const { error: rpcError } = await sb.rpc("save_player_profile", {
          p_profile_id: user.id,
          p_nickname: clean,
          p_avatar_url: storedAvatarValue,
          p_language: language,
        });
        if (rpcError) {
          const { error } = await sb.from("player_profiles")
            .update({ nickname: clean, avatar_url: storedAvatarValue, language })
            .or(`id.eq.${user.id},user_id.eq.${user.id}`);
          if (error) throw error;
        }
        safeRemoveStorage(PENDING_AVATAR_KEY);
        if (!storedAvatarValue || storedAvatarValue.startsWith("/images/team/")) {
          try { await removeProfileAvatar(); } catch { /* The profile is already saved; orphan cleanup can retry later. */ }
        }
      } else {
        // Mode invité : persistance distante via device_token
        const deviceToken = await getOrCreateDeviceToken();
        const { error: rpcError } = await sb.rpc("save_player_profile", {
          p_profile_id: user.id,
          p_nickname: clean,
          p_avatar_url: storedAvatarValue,
          p_language: language,
          p_device_token: deviceToken,
        });
        if (rpcError) {
          console.warn("[updateProfile] persistance distante invité différée:", rpcError.message);
        }
      }
    }

    const updatedUser = {
      ...user,
      name: clean,
      avatarUrl: displayAvatarUrl,
      avatarStorageValue: isStoredAvatar(storedAvatarValue) ? storedAvatarValue : null,
    };
    set({ user: updatedUser });
    safeSetStorage(LOCAL_AUTH_KEY, JSON.stringify(updatedUser));
    useLanguageStore.getState().setLanguage(language);
    useGameStore.getState().setPlayers(useGameStore.getState().players.map((p, i) =>
      i === 0 ? { ...p, name: clean, avatarUrl: displayAvatarUrl || undefined, language } : p));
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

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_AUTH_KEY && event.newValue) {
        try {
          const syncedUser = JSON.parse(event.newValue) as AuthUser;
          useAuthStore.setState({ user: syncedUser, isLoggedIn: !syncedUser.isAnonymous });
          useGameStore.getState().setPlayers(
            useGameStore.getState().players.map((p, i) =>
              i === 0
                ? {
                    ...p,
                    name: syncedUser.name,
                    avatarUrl: syncedUser.avatarUrl || undefined,
                  }
                : p
            )
          );
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    const sb = getSupabaseBrowser();
    if (sb && isSupabaseConfigured) {
      const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && typeof window !== "undefined") {
          markPasswordRecoveryStarted();
        }
        if (event === "SIGNED_IN" && session?.user?.is_anonymous) {
          return;
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
        window.removeEventListener("storage", handleStorage);
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}

export function useAuth() {
  return useAuthStore();
}
