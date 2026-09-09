"use client";
import { useState } from 'react';
import { ChevronLeft, Minus, Plus, ArrowRight, Globe } from 'lucide-react';
import { MAX_PLAYERS, newGameSessionId, resizePlayers, type GameConfig, type GameMode, type Player, type SupportedLanguage, type LanguageMode, useGameStore } from '@/lib/store/game';
import { useSettingsStore } from '@/lib/store/settings';
import { useAuth } from '@/lib/auth/use-auth';
import { useLanguageStore } from '@/lib/store/language';
import type { QuestionCategory } from '@/lib/questions/schema';
import { categoryLabel, MODE_META, QUESTION_COUNT_OPTIONS, modeLabel } from '@/lib/game/modes';
import { PlayerDot } from '@/components/ui/primitives';
import { KawaiiMascot } from '@/components/ui/kawaii-mascot';
import { CHARACTERS, characterImage } from '@/lib/characters';
import { TopicSelector } from '@/components/home/topic-selector';

function localizeDefaultPlayerName(name: string, index: number, language: 'fr' | 'en') {
  return language === 'en'
    ? name.replace(/^Joueur(?: (\d+))?$/, (_, number) => `Player ${number ?? index + 1}`)
    : name.replace(/^Player(?: (\d+))?$/, (_, number) => `Joueur ${number ?? index + 1}`);
}

export function GameSetup({
  mode,
  solo = false,
  initialCount,
  initialCategory,
  initialSubcategory,
  onBack,
  onLaunch,
}: {
  mode: GameMode;
  solo?: boolean;
  initialCount?: number;
  initialCategory?: QuestionCategory | 'mixed';
  initialSubcategory?: string;
  onBack: () => void;
  onLaunch: (config: GameConfig) => void;
}) {
  const meta = MODE_META[mode];
  const settings = useSettingsStore();
  const lang = useLanguageStore(s => s.language);
  const en = lang === 'en';
  const { user } = useAuth();
  const setPlayers = useGameStore(s => s.setPlayers);

  const [gameLanguageOverride, setGameLanguage] = useState<SupportedLanguage | null>(null);
  const gameLanguage: SupportedLanguage = gameLanguageOverride ?? lang;
  const [languageMode, setLanguageMode] = useState<LanguageMode>('shared');

  const [players, setDraft] = useState<Player[]>(() =>
    resizePlayers(
      useGameStore.getState().players,
      solo ? 1 : Math.max(meta.minPlayers, initialCount ?? 2)
    ).map((p, i) => ({
      ...p,
      ...(i === 0 && user ? { name: user.name, avatarUrl: user.avatarUrl ?? undefined } : {}),
      ...(!user || i > 0
        ? {
            name: localizeDefaultPlayerName(p.name, i, lang),
          }
        : {}),
      language: undefined,
    }))
  );

  const [category, setCategory] = useState<QuestionCategory | 'mixed'>(initialCategory ?? 'mixed');
  const [subcategory, setSubcategory] = useState<string | undefined>(initialSubcategory);
  const [count, setCount] = useState(settings.defaultQuestionCount);
  const [duration, setDuration] = useState<'express' | 'classic'>('express');
  const individualLanguage = ['classic', 'rapidfire', 'truefalse'].includes(mode);
  const min = solo ? 1 : Math.max(2, meta.minPlayers);

  function handleCategoryChange(newCat: QuestionCategory | 'mixed') {
    setCategory(newCat);
    if (newCat === 'mixed' || newCat !== category) {
      setSubcategory(undefined);
    }
  }

  function launch() {
    const final = players.map((p, i) => ({
      ...p,
      name:
        localizeDefaultPlayerName(p.name, i, lang).trim() ||
        (en ? `Player ${i + 1}` : `Joueur ${i + 1}`),
      language: languageMode === 'shared' ? gameLanguage : (p.language ?? gameLanguage),
    }));
    setPlayers(final);
    onLaunch({
      sessionId: newGameSessionId(),
      mode,
      category,
      subcategory,
      difficulty: 'mixed',
      players: final,
      questionCount: count,
      timePerQuestion:
        mode === 'rapidfire'
          ? settings.rapidFireTime
          : mode === 'truefalse'
          ? settings.trueFalseTime
          : settings.classicTime,
      debateMinutes: settings.debateMinutes,
      debateMode: 'standard',
      duration,
      gameLanguage,
      languageMode,
    });
  }

  return (
    <>
      <button className="fp-btn-ghost" onClick={onBack}>
        <ChevronLeft size={20} />
        {en ? 'Back to games' : 'Retour aux jeux'}
      </button>

      <header className="jx-page-title">
        <span className="jx-eyebrow">
          {solo
            ? en
              ? 'YOUR SOLO CHALLENGE'
              : 'TON DÉFI SOLO'
            : en
            ? 'ONE PHONE · TAKE TURNS'
            : 'UN TÉLÉPHONE · CHACUN SON TOUR'}
        </span>
        <h1>{modeLabel(mode, lang)}</h1>
      </header>

      {meta.usesQuestionCatalog && (
        <section className="jx-form-card">
          <span className="jx-eyebrow">{en ? 'STEP 1 · YOUR GAME' : 'ÉTAPE 1 · TA PARTIE'}</span>
          <h2 className="mt-2">{en ? 'Choose your topic' : 'Choisis ton thème'}</h2>
          <p className="mt-1 text-sm text-fp-text-dim">
            {en
              ? 'Pick a favourite or let Agorax create a varied mix.'
              : 'Choisis un favori ou laisse Agorax préparer un mélange varié.'}
          </p>
          <TopicSelector
            value={category}
            subcategory={subcategory}
            language={lang}
            onChange={handleCategoryChange}
            onSubcategoryChange={setSubcategory}
          />

          {mode === 'agorax' ? (
            <>
              <h3>{en ? 'Game format' : 'Format de la partie'}</h3>
              <div className="jx-segments">
                <button
                  aria-pressed={duration === 'express'}
                  onClick={() => setDuration('express')}
                >
                  Express · ~10 min
                </button>
                <button
                  aria-pressed={duration === 'classic'}
                  onClick={() => setDuration('classic')}
                >
                  {en ? 'Classic' : 'Classique'} · ~20 min
                </button>
              </div>
            </>
          ) : (
            !['rapidfire', 'truefalse'].includes(mode) && (
              <>
                <h3>{en ? 'Number of questions' : 'Nombre de questions'}</h3>
                <div className="jx-segments">
                  {QUESTION_COUNT_OPTIONS.map(n => (
                    <button key={n} aria-pressed={count === n} onClick={() => setCount(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )
          )}
        </section>
      )}

      <div className="jx-setup-grid">
        <div>
          {/* Sélection explicite de la langue pour la partie et les questions */}
          <section className="jx-form-card">
            <span className="jx-eyebrow">
              {meta.usesQuestionCatalog
                ? (en ? 'STEP 2 · QUESTIONS' : 'ÉTAPE 2 · QUESTIONS')
                : (en ? 'STEP 1 · LANGUAGE' : 'ÉTAPE 1 · LANGUE')}
            </span>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-fp-primary" />
              <h2 className="text-base font-bold">
                {en ? 'Game Questions Language' : 'Langue des questions de la partie'}
              </h2>
            </div>
            <p className="text-xs text-fp-text-dim mb-3">
              {en
                ? 'Official question language used for this game session.'
                : 'Langue officielle des questions utilisée pour cette session de jeu.'}
            </p>
            <div className="flex gap-2.5 mb-3" role="group" aria-label={en ? 'Game language' : 'Langue de la partie'}>
              <button
                type="button"
                onClick={() => setGameLanguage('fr')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-sm font-bold transition-all ${
                  gameLanguage === 'fr'
                    ? 'bg-fp-primary text-white shadow-md'
                    : 'border border-black/10 bg-white text-fp-text hover:bg-black/[0.03]'
                }`}
              >
                <span>🇫🇷</span>
                <span>Français</span>
              </button>
              <button
                type="button"
                onClick={() => setGameLanguage('en')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-sm font-bold transition-all ${
                  gameLanguage === 'en'
                    ? 'bg-fp-primary text-white shadow-md'
                    : 'border border-black/10 bg-white text-fp-text hover:bg-black/[0.03]'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>

            {individualLanguage && !solo && (
              <div className="pt-2 border-t border-black/5">
                <span className="text-xs font-bold block mb-1.5 text-fp-text-dim">
                  {en ? 'Language mode' : 'Mode de distribution des langues'}
                </span>
                <div className="jx-segments">
                  <button
                    type="button"
                    aria-pressed={languageMode === 'shared'}
                    onClick={() => setLanguageMode('shared')}
                  >
                    {en ? 'Shared (All in same language)' : 'Partagée (Tous ensemble)'}
                  </button>
                  <button
                    type="button"
                    aria-pressed={languageMode === 'per-player'}
                    onClick={() => setLanguageMode('per-player')}
                  >
                    {en ? 'Per-player (Bilingual)' : 'Par joueur (Bilingue)'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section Joueurs */}
          <section className="jx-form-card">
            <span className="jx-eyebrow">
              {meta.usesQuestionCatalog
                ? (en ? 'STEP 3 · PLAYERS' : 'ÉTAPE 3 · JOUEURS')
                : (en ? 'STEP 2 · PLAYERS' : 'ÉTAPE 2 · JOUEURS')}
            </span>
            <div className="jx-section-heading">
              <h2>{solo ? (en ? 'Your player' : 'Ton joueur') : en ? 'Your team' : 'Ton équipe'}</h2>
              {!solo && (
                <div className="jx-stepper">
                  <button
                    aria-label={en ? 'Remove player' : 'Retirer un joueur'}
                    disabled={players.length <= min}
                    onClick={() => setDraft(resizePlayers(players, players.length - 1))}
                  >
                    <Minus size={18} />
                  </button>
                  <strong>{players.length}</strong>
                  <button
                    aria-label={en ? 'Add player' : 'Ajouter un joueur'}
                    disabled={players.length >= MAX_PLAYERS}
                    onClick={() =>
                      setDraft(
                        resizePlayers(players, players.length + 1).map(p => ({
                          ...p,
                          language: p.language ?? gameLanguage,
                        }))
                      )
                    }
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {players.map((p, i) => {
                const displayName = localizeDefaultPlayerName(p.name, i, lang);
                return (
                  <div className="jx-player-field" key={p.id}>
                    <PlayerDot
                      name={displayName}
                      avatarUrl={p.avatarUrl ?? characterImage(CHARACTERS[i % 5].id)}
                      size={42}
                    />
                    <input
                      value={displayName}
                      aria-label={`${en ? 'Player' : 'Joueur'} ${i + 1}`}
                      onChange={e =>
                        setDraft(players.map((v, j) =>
                          j === i ? { ...v, name: e.target.value } : v
                        ))
                      }
                      maxLength={24}
                    />
                    {individualLanguage && languageMode === 'per-player' && (
                      <select
                        aria-label={`${en ? 'Language' : 'Langue'} ${displayName}`}
                        value={p.language ?? gameLanguage}
                        onChange={e =>
                          setDraft(
                            players.map((v, j) =>
                              j === i ? { ...v, language: e.target.value as 'en' | 'fr' } : v
                            )
                          )
                        }
                      >
                        <option value="fr">🇫🇷 FR</option>
                        <option value="en">🇬🇧 EN</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        <aside className="jx-form-card jx-summary">
          <KawaiiMascot theme={solo ? 'neo' : 'poppy'} size={145} eager />
          <h2>{en ? 'Ready to play?' : 'Prêts à jouer ?'}</h2>
          <p>
            {modeLabel(mode, lang)} · {players.length} {en ? 'player(s)' : 'joueur(s)'}
          </p>
          {meta.usesQuestionCatalog && (
            <div className="my-3 rounded-xl bg-fp-yellow/35 px-3 py-2 text-sm font-bold text-fp-text">
              {category === 'mixed'
                ? (en ? '🎲 All topics' : '🎲 Tous les thèmes')
                : subcategory
                ? `🎯 ${categoryLabel(lang, category)} · ${subcategory}`
                : `🎯 ${categoryLabel(lang, category)}`}
            </div>
          )}
          <div className="my-3 inline-flex items-center gap-1.5 rounded-full bg-fp-primary/10 px-3 py-1 text-xs font-bold text-fp-primary">
            <span>
              {gameLanguage === 'en'
                ? '🇬🇧 English questions'
                : en
                  ? '🇫🇷 Questions in French'
                  : '🇫🇷 Questions en français'}
            </span>
          </div>
          <p>
            {individualLanguage
              ? en
                ? 'Each player can read the questions in their chosen language.'
                : 'Chaque joueur peut lire les questions dans sa langue.'
              : en
              ? 'This game uses the selected language on the screen.'
              : 'Ce jeu utilise la langue sélectionnée sur l’écran.'}
          </p>
          <button className="fp-btn-primary" onClick={launch}>
            {en ? 'Start game' : 'Lancer la partie'}
            <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </>
  );
}
