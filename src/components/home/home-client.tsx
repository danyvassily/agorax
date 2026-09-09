"use client";
import Link from 'next/link';
import { ArrowRight, ScanLine, CalendarDays, Sparkles, UserPlus } from 'lucide-react';
import { AppNavigation } from '@/components/ui/app-navigation';
import { KawaiiMascot } from '@/components/ui/kawaii-mascot';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useAuth } from '@/lib/auth/use-auth';
import { useLanguageStore } from '@/lib/store/language';
import { CHARACTERS } from '@/lib/characters';
import { GsapAnimatedTitle } from '@/components/ui/gsap-animated-title';
import { GsapScrollReveal } from '@/components/ui/gsap-scroll-reveal';

export function HomeClient() {
  const { user, isLoggedIn, signInWithGoogle } = useAuth();
  const en = useLanguageStore(s => s.language) === 'en';

  return (
    <>
      <AppNavigation />
      <main className="jx-page">
        <header className="jx-page-title">
          <p className="animate-fade">
            {en ? 'Hello' : 'Salut'}
            {user?.name && !/^Joueur/.test(user.name) ? ` ${user.name}` : ''} !
          </p>
          <GsapAnimatedTitle as="h1" variant="slide-up">
            {en ? 'What shall we play?' : 'On joue à quoi ?'}
          </GsapAnimatedTitle>
          <p className="animate-fade">{en ? 'A solo challenge or a night together.' : 'Un défi solo ou une soirée ensemble.'}</p>
        </header>

        {/* Bannière Connexion / Inscription si non connecté */}
        {!isLoggedIn && (
          <section className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-black/5 bg-gradient-to-r from-orange-50/70 via-white to-pink-50/50 p-4 sm:p-5 shadow-xs max-w-full overflow-hidden">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Sparkles size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-fp-text">
                  {en ? 'Play online & save your stats' : 'Joue en ligne et sauvegarde tes statistiques'}
                </h2>
                <p className="text-xs text-fp-text-dim">
                  {en
                    ? 'Connect with Google in 1 click or create an account.'
                    : 'Connexion en 1 clic avec Google ou création de compte.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-fp-text shadow-xs hover:bg-black/[0.02] active:scale-95 transition"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Google</span>
              </button>
              <Link
                href="/auth?mode=register"
                className="fp-btn-primary flex-1 sm:flex-initial justify-center text-xs py-2.5 px-3.5 flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>{en ? 'Register' : 'Créer un compte'}</span>
              </Link>
            </div>
          </section>
        )}

        <GsapScrollReveal className="jx-home-grid" stagger={0.12} duration={0.65}>
          <section className="jx-hero jx-aqua">
            <div className="jx-hero-copy">
              <span className="jx-eyebrow">{en ? 'MAKE IT A GAME NIGHT' : 'LA SOIRÉE COMMENCE ICI'}</span>
              <GsapAnimatedTitle as="h2" variant="pop" delay={0.2} stagger={0.07}>
                {en ? 'Better together.' : 'C’est mieux ensemble.'}
              </GsapAnimatedTitle>
              <p>
                {en
                  ? '2 to 8 players. A little rivalry, a lot of fun.'
                  : '2 à 8 joueurs. Un peu de rivalité, beaucoup de complicité.'}
              </p>
            </div>
            <div className="jx-hero-team" aria-hidden="true">
              <KawaiiMascot theme="milo" size={210} />
              <KawaiiMascot theme="poppy" size={190} />
            </div>
            <div className="jx-hero-actions">
              <Link href="/play/local" className="fp-btn-primary transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                {en ? 'Play together' : 'Jouer ensemble'}
                <ArrowRight size={18} />
              </Link>
              <Link href="/play/online" className="fp-btn-secondary transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <ScanLine size={18} />
                {en ? 'Join with a code' : 'Rejoindre avec un code'}
              </Link>
            </div>
          </section>

          <div className="jx-home-side">
            <Link href="/play/solo" className="jx-feature jx-yellow transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="jx-eyebrow">{en ? 'YOUR MOMENT' : 'TON MOMENT À TOI'}</span>
                <h2>{en ? 'My solo challenge' : 'Mon défi solo'}</h2>
                <ArrowRight size={23} />
              </div>
              <KawaiiMascot theme="neo" size={140} />
            </Link>
            <Link href="/daily" className="jx-feature transition-transform duration-200 hover:-translate-y-1">
              <div>
                <CalendarDays size={24} />
                <h2>{en ? 'Daily challenge' : 'Défi du jour'}</h2>
                <p>{en ? '10 questions · One new challenge every day' : '10 questions · Un nouveau défi chaque jour'}</p>
              </div>
              <ArrowRight size={23} />
            </Link>
          </div>
        </GsapScrollReveal>

        <section className="jx-team-section">
          <div>
            <GsapAnimatedTitle as="h2" variant="slide-up" scrollTrigger>
              {en ? 'Your crew is waiting' : 'Ton équipe t’attend'}
            </GsapAnimatedTitle>
            <p>{en ? 'Five personalities. Find your favourite.' : 'Cinq personnalités. Trouve la tienne.'}</p>
          </div>
          <GsapScrollReveal className="jx-team-row" stagger={0.06} y={18}>
            {CHARACTERS.map(c => (
              <Link
                href={`/profile?character=${c.id}`}
                key={c.id}
                style={{ background: c.color }}
                className="transition-transform duration-200 hover:-translate-y-1.5"
              >
                <KawaiiMascot theme={c.id} size={88} />
                <strong>{c.name}</strong>
                <span>{en ? c.roleEn : c.role}</span>
              </Link>
            ))}
          </GsapScrollReveal>
        </section>
      </main>
    </>
  );
}
