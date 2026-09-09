"use client";

import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

export const AVATAR_BUCKET = "avatars";
const MAX_STORED_AVATAR_BYTES = 1024 * 1024;
const SIGNED_AVATAR_TTL_SECONDS = 24 * 60 * 60;
const STORAGE_AVATAR_PREFIX = `${AVATAR_BUCKET}/`;

export interface StoredAvatar {
  storageValue: string;
  displayUrl: string;
}

export function isInlineAvatar(value: string | null | undefined): value is string {
  return Boolean(value?.startsWith("data:image/"));
}

export function avatarObjectPath(authUserId: string): string {
  return `${authUserId}/avatar.webp`;
}

export function avatarStorageValue(path: string): string {
  return `${STORAGE_AVATAR_PREFIX}${path}`;
}

export function isStoredAvatar(value: string | null | undefined): value is string {
  return Boolean(value?.startsWith(STORAGE_AVATAR_PREFIX));
}

function avatarPathFromStorageValue(value: string): string {
  return value.slice(STORAGE_AVATAR_PREFIX.length);
}

function inlineAvatarToBlob(value: string): Blob {
  const match = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match) throw new Error("Format de photo non pris en charge.");
  const decoded = atob(match[2]);
  if (decoded.length > MAX_STORED_AVATAR_BYTES) throw new Error("La photo préparée est trop volumineuse.");
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) bytes[index] = decoded.charCodeAt(index);
  return new Blob([bytes], { type: match[1] });
}

export async function resolveProfileAvatar(value: string | null | undefined): Promise<string | null> {
  if (!value || !isStoredAvatar(value)) return value ?? null;
  const sb = getSupabaseBrowser();
  if (!sb || !isSupabaseConfigured) return null;
  const { data, error } = await sb.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(avatarPathFromStorageValue(value), SIGNED_AVATAR_TTL_SECONDS);
  if (error || !data.signedUrl) return null;
  return data.signedUrl;
}

/** Uploads a compressed client image and returns its private reference and temporary URL. */
export async function uploadProfileAvatar(value: string): Promise<StoredAvatar> {
  if (!isInlineAvatar(value)) {
    return { storageValue: value, displayUrl: (await resolveProfileAvatar(value)) ?? value };
  }
  const sb = getSupabaseBrowser();
  if (!sb || !isSupabaseConfigured) {
    throw new Error("Le stockage sécurisé des photos n’est pas configuré.");
  }
  const { data: auth, error: authError } = await sb.auth.getUser();
  if (authError || !auth.user || auth.user.is_anonymous) {
    throw new Error("Connecte-toi pour sauvegarder cette photo sur tous tes appareils.");
  }
  const path = avatarObjectPath(auth.user.id);
  const blob = inlineAvatarToBlob(value);
  const { error } = await sb.storage.from(AVATAR_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    contentType: blob.type,
    upsert: true,
  });
  if (error) throw new Error(`Impossible d’envoyer la photo : ${error.message}`);
  const storageValue = avatarStorageValue(path);
  const displayUrl = await resolveProfileAvatar(storageValue);
  if (!displayUrl) throw new Error("L’adresse temporaire de la photo est indisponible.");
  return { storageValue, displayUrl };
}

export async function removeProfileAvatar(): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb || !isSupabaseConfigured) return;
  const { data } = await sb.auth.getUser();
  if (!data.user || data.user.is_anonymous) return;
  const { error } = await sb.storage.from(AVATAR_BUCKET).remove([avatarObjectPath(data.user.id)]);
  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(`Impossible de supprimer la photo : ${error.message}`);
  }
}
