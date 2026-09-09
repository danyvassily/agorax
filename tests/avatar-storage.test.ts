import { describe, expect, it } from "vitest";
import {
  avatarObjectPath,
  avatarStorageValue,
  isInlineAvatar,
  isStoredAvatar,
} from "../src/lib/auth/avatar-storage";

describe("avatar storage", () => {
  it("detects supported inline image payloads without accepting ordinary URLs", () => {
    expect(isInlineAvatar("data:image/webp;base64,AAAA")).toBe(true);
    expect(isInlineAvatar("data:image/jpeg;base64,AAAA")).toBe(true);
    expect(isInlineAvatar("https://example.com/avatar.webp")).toBe(false);
    expect(isInlineAvatar("/images/team/milo.png")).toBe(false);
    expect(isInlineAvatar(null)).toBe(false);
  });

  it("keeps each authenticated user's avatar in an isolated folder", () => {
    expect(avatarObjectPath("user-a")).toBe("user-a/avatar.webp");
    expect(avatarObjectPath("user-b")).not.toBe(avatarObjectPath("user-a"));
  });

  it("distinguishes private storage references from display URLs", () => {
    expect(avatarStorageValue("user-a/avatar.webp")).toBe("avatars/user-a/avatar.webp");
    expect(isStoredAvatar("avatars/user-a/avatar.webp")).toBe(true);
    expect(isStoredAvatar("https://example.com/avatar.webp")).toBe(false);
  });
});
