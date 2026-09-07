"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, UsersRound, CircleDot, UserRound, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { PlayerDot } from '@/components/ui/primitives';
import { useLanguageStore } from '@/lib/store/language';
import { LanguageSelector } from '@/components/ui/language-selector';

export function BrandMark({compact=false}:{compact?:boolean}) {
  return <Link href="/" className="jx-wordmark" aria-label="AGORAX">{compact?'AGX':'AGORAX'}</Link>;
}

export function AppNavigation() {
  const path = usePathname();
  const en = useLanguageStore(s => s.language) === 'en';
  const { user, isLoggedIn } = useAuth();

  const navItems = [
    { href: '/', fr: 'Accueil', en: 'Home', icon: House },
    { href: '/play/local', fr: 'Ensemble', en: 'Together', icon: UsersRound },
    { href: '/play/solo', fr: 'Solo', en: 'Solo', icon: CircleDot },
    { href: '/profile', fr: 'Profil', en: 'Profile', icon: UserRound },
  ];

  const active = (href: string) =>
    href === '/'
      ? path === '/'
      : href === '/profile'
      ? path.startsWith('/profile') || path.startsWith('/settings')
      : href === '/auth'
      ? path.startsWith('/auth')
      : href === '/play/solo'
      ? path.startsWith(href) || path.startsWith('/quiz') || path.startsWith('/daily')
      : path.startsWith('/play/local') || path.startsWith('/play/online');

  const links = navItems.map(({ href, fr, en: english, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      aria-current={active(href) ? 'page' : undefined}
      className={active(href) ? 'is-active' : ''}
    >
      <Icon size={21} />
      <span>{en ? english : fr}</span>
    </Link>
  ));

  const mobileNavItems = [
    { href: '/', fr: 'Accueil', en: 'Home', icon: House },
    { href: '/play/local', fr: 'Ensemble', en: 'Together', icon: UsersRound },
    { href: '/play/solo', fr: 'Solo', en: 'Solo', icon: CircleDot },
    isLoggedIn
      ? { href: '/profile', fr: 'Profil', en: 'Profile', icon: UserRound }
      : { href: '/auth', fr: 'Connexion', en: 'Sign in', icon: LogIn },
  ];

  const mobileLinks = mobileNavItems.map(({ href, fr, en: english, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      aria-current={active(href) ? 'page' : undefined}
      className={active(href) ? 'is-active' : ''}
    >
      <Icon size={21} />
      <span>{en ? english : fr}</span>
    </Link>
  ));

  return (
    <>
      <header className="jx-header">
        <div>
          <BrandMark />
          <nav aria-label={en ? 'Main navigation' : 'Navigation principale'} className="jx-desktop-nav">
            {links}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector variant="compact" />
            {!isLoggedIn ? (
              <Link
                href="/auth"
                className="fp-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              >
                <LogIn size={15} />
                <span>{en ? 'Sign in' : 'Connexion'}</span>
              </Link>
            ) : null}
            <Link
              href="/profile"
              aria-label={en ? 'My profile' : 'Mon profil'}
              className="jx-profile-link"
              title={isLoggedIn ? (user?.email || user?.name || 'Profil') : (en ? 'Guest profile' : 'Profil invité')}
            >
              <PlayerDot
                name={user?.name ?? 'J'}
                avatarUrl={user?.avatarUrl ?? '/images/team/milo.png'}
                size={40}
              />
            </Link>
          </div>
        </div>
      </header>
      <nav className="jx-mobile-nav" aria-label={en ? 'Mobile navigation' : 'Navigation mobile'}>
        {mobileLinks}
      </nav>
    </>
  );
}
