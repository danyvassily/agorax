"use client";

import { useLanguageStore } from "@/lib/store/language";

export function LocalizedText({ fr, en }: { fr: string; en: string }) {
  return useLanguageStore(s => s.language) === "en" ? en : fr;
}
