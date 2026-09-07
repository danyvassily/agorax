"use client";

import { useLanguageStore } from "@/lib/store/language";
import { useAuth } from "@/lib/auth/use-auth";
import type { UILanguage } from "@/lib/i18n";

export function LanguageSelector({
  variant = "compact",
  className = "",
}: {
  variant?: "compact" | "pills" | "dropdown";
  className?: string;
}) {
  const { language, setLanguage } = useLanguageStore();
  const { isLoggedIn, updateLanguage } = useAuth();

  const handleSelect = async (newLang: UILanguage) => {
    if (newLang === language) return;
    setLanguage(newLang);
    if (isLoggedIn) {
      try {
        await updateLanguage(newLang);
      } catch {
        // Ignorer les erreurs réseau silencieuses
      }
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center rounded-xl bg-black/[0.05] p-0.5 text-xs font-bold ${className}`}
        role="group"
        aria-label="Sélection de la langue / Language selection"
      >
        <button
          type="button"
          onClick={() => void handleSelect("fr")}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-all ${
            language === "fr"
              ? "bg-white text-fp-text shadow-xs"
              : "text-fp-text-dim hover:text-fp-text"
          }`}
          aria-pressed={language === "fr"}
        >
          <span className="text-sm">🇫🇷</span>
          <span>FR</span>
        </button>
        <button
          type="button"
          onClick={() => void handleSelect("en")}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-all ${
            language === "en"
              ? "bg-white text-fp-text shadow-xs"
              : "text-fp-text-dim hover:text-fp-text"
          }`}
          aria-pressed={language === "en"}
        >
          <span className="text-sm">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`flex gap-2.5 ${className}`} role="group" aria-label="Langue / Language">
        <button
          type="button"
          onClick={() => void handleSelect("fr")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-bold transition-all ${
            language === "fr"
              ? "bg-fp-primary text-white shadow-md scale-[1.02]"
              : "border border-black/10 bg-white text-fp-text hover:bg-black/[0.03]"
          }`}
        >
          <span className="text-base">🇫🇷</span>
          <span>Français</span>
        </button>
        <button
          type="button"
          onClick={() => void handleSelect("en")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-bold transition-all ${
            language === "en"
              ? "bg-fp-primary text-white shadow-md scale-[1.02]"
              : "border border-black/10 bg-white text-fp-text hover:bg-black/[0.03]"
          }`}
        >
          <span className="text-base">🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => void handleSelect(e.target.value as UILanguage)}
      className={`fp-input text-xs font-bold py-1.5 px-2.5 rounded-xl ${className}`}
      aria-label="Langue / Language"
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}
