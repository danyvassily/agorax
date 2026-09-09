"use client";
import { useState } from 'react';
import { DiscoveryLinks } from './discovery-links';
import Link from 'next/link';
import { ArrowRight, Smartphone, UsersRound, Search } from 'lucide-react';
import { AppNavigation } from '@/components/ui/app-navigation';
import { KawaiiMascot } from '@/components/ui/kawaii-mascot';
import { useLanguageStore } from '@/lib/store/language';
import { MODE_META, modeLabel } from '@/lib/game/modes';
import { type GameMode } from '@/lib/store/game';
import { GsapAnimatedTitle } from '@/components/ui/gsap-animated-title';
import { GsapScrollReveal } from '@/components/ui/gsap-scroll-reveal';
const roster:{mode:GameMode;character:string;fr:string;en:string}[]=[
  {mode:'classic',character:'luma',fr:'Culture générale, à chacun son tour.',en:'General knowledge, one turn at a time.'},
  {mode:'wyr',character:'poppy',fr:'Des choix impossibles qui lancent la discussion.',en:'Impossible choices to get everyone talking.'},
  {mode:'debate',character:'leo',fr:'Chacun son avis, tout le monde participe.',en:'Every opinion has a place.'},
  {mode:'rapidfire',character:'ziggy',fr:'20 questions, 6 secondes pour répondre.',en:'20 questions, 6 seconds per answer.'},
  {mode:'truefalse',character:'milo',fr:'Deux choix. Fais confiance à ton intuition.',en:'Two choices. Trust your instinct.'},
  {mode:'teambattle',character:'koa',fr:'Deux équipes, une seule victoire.',en:'Two teams, one winner.'},
  {mode:'timeline',character:'toby',fr:'Remets les événements dans le bon ordre.',en:'Put events in the right order.'},
  {mode:'guess',character:'barnaby',fr:'Un indice après l’autre.',en:'One clue at a time.'},
  {mode:'iq',character:'neo',fr:'Logique, suites et mémoire.',en:'Logic, patterns and memory.'},
  {mode:'psycho',character:'sora',fr:'Découvre ton profil en solo.',en:'Discover your personality solo.'}
];
export function LocalPlayClient({ solo = false }: { solo?: boolean }) {
  const en = useLanguageStore((s) => s.language) === 'en';
  const [group, setGroup] = useState(false);
  const [device, setDevice] = useState<'local' | 'online'>('local');
  const [search, setSearch] = useState('');
  const count = solo ? 1 : group ? 4 : 2;
  const href = (mode: GameMode) =>
    solo
      ? `/play/local/${mode}?solo=1`
      : device === 'online' && ['classic', 'rapidfire', 'truefalse', 'teambattle', 'agorax'].includes(mode)
      ? `/play/online?mode=${mode}&create=1`
      : `/play/local/${mode}?players=${count}`;
  const modes = roster
    .filter((c) =>
      solo
        ? MODE_META[c.mode].minPlayers === 1 && !['debate', 'wyr'].includes(c.mode)
        : MODE_META[c.mode].passAndPlay
    )
    .filter((c) =>
      modeLabel(c.mode, en ? 'en' : 'fr')
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
    );

  return (
    <>
      <AppNavigation />
      <main className="jx-page">
        <header className="jx-page-title">
          <span className="jx-eyebrow">
            {solo
              ? en
                ? 'NEO’S PLAYGROUND'
                : 'LE TERRAIN DE NEO'
              : en
              ? 'GATHER YOUR PEOPLE'
              : 'LES MEILLEURS MOMENTS SE PARTAGENT'}
          </span>
          <GsapAnimatedTitle as="h1" variant="slide-up">
            {solo
              ? en
                ? 'At your own pace.'
                : 'À ton rythme.'
              : en
              ? 'Two. Or a whole crew.'
              : 'À deux. À plusieurs.'}
          </GsapAnimatedTitle>
          <p>
            {solo
              ? en
                ? 'A break. A quiz. A new personal best.'
                : 'Une pause. Un quiz. Un nouveau record.'
              : en
              ? 'Find the game for your evening.'
              : 'Trouvez le jeu de votre soirée.'}
          </p>
        </header>

        {!solo && (
          <>
            <div className="jx-segments">
              <button aria-pressed={!group} onClick={() => setGroup(false)}>
                {en ? 'For two' : 'À deux'}
              </button>
              <button aria-pressed={group} onClick={() => setGroup(true)}>
                {en ? 'In a group' : 'En groupe'}
              </button>
            </div>
            <div className="jx-device-options">
              <button aria-pressed={device === 'local'} onClick={() => setDevice('local')}>
                <Smartphone size={21} />
                {en ? 'One shared phone' : 'Un seul téléphone'}
              </button>
              <button aria-pressed={device === 'online'} onClick={() => setDevice('online')}>
                <UsersRound size={21} />
                {en ? 'Everyone on their device' : 'Chacun son appareil'}
              </button>
            </div>
          </>
        )}

        <section className={`jx-catalog-hero ${solo ? 'jx-aqua' : 'jx-peach'}`}>
          <div>
            <span className="jx-eyebrow">
              {solo
                ? en
                  ? 'A LITTLE EVERY DAY'
                  : 'UN PEU CHAQUE JOUR'
                : en
                ? 'THE SIGNATURE GAME'
                : 'LE JEU SIGNATURE'}
            </span>
            <GsapAnimatedTitle as="h2" variant="pop" delay={0.15}>
              {solo ? (en ? 'The daily challenge' : 'Le défi du jour') : 'Quiz Party'}
            </GsapAnimatedTitle>
            <p>
              {solo
                ? en
                  ? '10 questions, one challenge shared by everyone.'
                  : '10 questions, un défi commun à tous.'
                : device === 'online'
                ? en
                  ? 'Take the buzzer before your friends.'
                  : 'Prends le buzzer avant tes amis.'
                : en
                ? 'Turns, buzzer and The Line finale.'
                : 'Des tours, du buzzer et une finale La Ligne.'}
            </p>
            <Link
              className="fp-btn-primary transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              href={solo ? '/daily' : href('agorax')}
            >
              {en ? 'Let’s play' : 'C’est parti'}
              <ArrowRight size={18} />
            </Link>
          </div>
          <KawaiiMascot theme={solo ? 'neo' : 'milo'} size={220} />
        </section>

        <div className="jx-section-heading">
          <GsapAnimatedTitle as="h2" variant="slide-up" scrollTrigger>
            {en ? 'Choose your adventure' : 'Choisis ton aventure'}
          </GsapAnimatedTitle>
          <label className="jx-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={en ? 'Find a game' : 'Trouver un jeu'}
              aria-label={en ? 'Find a game' : 'Trouver un jeu'}
            />
          </label>
        </div>

        <GsapScrollReveal
          className="jx-game-grid"
          stagger={0.045}
          duration={0.46}
          y={12}
          animationKey={`${solo}-${group}-${device}-${search}-${modes.map((mode) => mode.mode).join("-")}`}
        >
          {modes.map((c) => (
            <Link
              key={c.mode}
              href={href(c.mode)}
              className="jx-game-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <KawaiiMascot theme={c.character} size={96} />
              <div>
                <h3>{modeLabel(c.mode, en ? 'en' : 'fr')}</h3>
                <p>{en ? c.en : c.fr}</p>
                <small>
                  {solo
                    ? en
                      ? '1 player'
                      : '1 joueur'
                    : device === 'online' &&
                      !['classic', 'rapidfire', 'truefalse', 'teambattle', 'agorax'].includes(c.mode)
                    ? en
                      ? 'Shared phone'
                      : 'Téléphone partagé'
                    : en
                    ? '2–8 players'
                    : '2–8 joueurs'}
                </small>
              </div>
              <ArrowRight size={20} />
            </Link>
          ))}
        </GsapScrollReveal>

        {!modes.length && (
          <p className="py-8">{en ? 'No matching game. Try another name.' : 'Aucun jeu trouvé. Essaie un autre nom.'}</p>
        )}

        <DiscoveryLinks solo={solo} online={device === 'online'} count={count} en={en} search={search} />

        {solo && (
          <Link href="/quiz" className="fp-btn-secondary mt-7 transition-transform duration-200 hover:scale-[1.01]">
            {en ? 'Explore all quiz topics' : 'Explorer tous les thèmes de quiz'}
            <ArrowRight size={18} />
          </Link>
        )}
      </main>
    </>
  );
}
