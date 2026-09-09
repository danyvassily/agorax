"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, House, LogIn, Search, UsersRound } from "lucide-react";
import { useAuth } from "@/lib/auth/use-auth";
import { PlayerDot } from "@/components/ui/primitives";
import { useLanguageStore } from "@/lib/store/language";
import { LanguageSelector } from "@/components/ui/language-selector";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="jx-wordmark shrink-0" aria-label="AGORAX">{compact ? "AGX" : "AGORAX"}</Link>;
}

type NavigationSection = "home" | "play" | "online" | "solo" | "account";
type NavigationItem = {
  href: string;
  fr: string;
  en: string;
  icon: typeof House;
  section: NavigationSection;
};

const mainItems: NavigationItem[] = [
  { href: "/", fr: "Accueil", en: "Home", icon: House, section: "home" },
  { href: "/play/local", fr: "Jouer", en: "Play", icon: Gamepad2, section: "play" },
  { href: "/play/online", fr: "En ligne", en: "Online", icon: UsersRound, section: "online" },
  { href: "/play/solo", fr: "Découvrir", en: "Explore", icon: Search, section: "solo" },
];

export function isNavigationSectionActive(path: string, section: NavigationSection): boolean {
  if (section === "home") return path === "/";
  if (section === "account") {
    return path.startsWith("/profile") || path.startsWith("/settings") || path.startsWith("/auth");
  }
  if (section === "online") return path.startsWith("/play/online");
  if (section === "solo") {
    return path.startsWith("/play/solo") || path.startsWith("/play/discovery") || path.startsWith("/quiz") || path.startsWith("/daily");
  }
  return path === "/play" || path.startsWith("/play/local");
}

function useNavigationState() {
  const path = usePathname() || "/";
  const en = useLanguageStore((state) => state.language) === "en";
  const { user, isLoggedIn } = useAuth();
  return { path, en, user, isLoggedIn };
}

export function AppNavigation() {
  const { path, en, user, isLoggedIn } = useNavigationState();

  return (
    <header className="jx-header">
      <div>
        <BrandMark />
        <nav aria-label={en ? "Main navigation" : "Navigation principale"} className="jx-desktop-nav">
          {mainItems.map(({ href, fr, en: english, icon: Icon, section }) => {
            const selected = isNavigationSectionActive(path, section);
            return (
              <Link key={href} href={href} aria-current={selected ? "page" : undefined} className={selected ? "is-active" : ""}>
                <Icon size={21} />
                <span>{en ? english : fr}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSelector variant="compact" />
          {!isLoggedIn ? (
            <Link href="/auth" className="hidden sm:flex fp-btn-primary text-xs py-2 px-3.5 items-center gap-1.5 shadow-sm shrink-0">
              <LogIn size={15} />
              <span>{en ? "Sign in" : "Connexion"}</span>
            </Link>
          ) : null}
          <Link
            href="/profile"
            aria-label={en ? "My profile" : "Mon profil"}
            className="jx-profile-link shrink-0"
            title={isLoggedIn ? (user?.email || user?.name || "Profil") : (en ? "Guest profile" : "Profil invité")}
          >
            <PlayerDot name={user?.name ?? "J"} avatarUrl={user?.avatarUrl ?? "/images/team/milo.png"} size={38} loading="eager" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Persistent mobile navigation, mounted once by the root layout. */
export function MobileTabBar() {
  const { path, en, user, isLoggedIn } = useNavigationState();
  const accountHref = isLoggedIn ? "/profile" : "/auth";
  const accountLabel = isLoggedIn ? (en ? "Profile" : "Profil") : (en ? "Sign in" : "Connexion");
  const accountSelected = isNavigationSectionActive(path, "account");

  return (
    <nav className="jx-mobile-nav" aria-label={en ? "Main navigation" : "Navigation principale"}>
      {mainItems.map(({ href, fr, en: english, icon: Icon, section }) => {
        const selected = isNavigationSectionActive(path, section);
        const label = en ? english : fr;
        return (
          <Link key={href} href={href} aria-label={label} title={label} aria-current={selected ? "page" : undefined} className={selected ? "is-active" : ""}>
            <Icon aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
      <Link
        href={accountHref}
        aria-label={accountLabel}
        title={accountLabel}
        aria-current={accountSelected ? "page" : undefined}
        className={`jx-mobile-profile${accountSelected ? " is-active" : ""}`}
      >
        <PlayerDot name={user?.name ?? "J"} avatarUrl={user?.avatarUrl ?? "/images/team/milo.png"} size={30} />
        <span className="sr-only">{accountLabel}</span>
      </Link>
    </nav>
  );
}
