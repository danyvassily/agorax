"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, Minus, Plus, ArrowRight, Globe } from 'lucide-react';
import { MAX_PLAYERS, newGameSessionId, resizePlayers, type GameConfig, type GameMode, type Player, useGameStore } from '@/lib/store/game';
import { useSettingsStore } from '@/lib/store/settings';
import { useAuth } from '@/lib/auth/use-auth';
import { useLanguageStore } from '@/lib/store/language';
import { CATEGORIES, type QuestionCategory } from '@/lib/questions/schema';
import { CATEGORY_LABELS, MODE_META, QUESTION_COUNT_OPTIONS, modeLabel } from '@/lib/game/modes';
import { categoryLabel } from '@/lib/game/modes';
import { PlayerDot } from '@/components/ui/primitives';
import { KawaiiMascot } from '@/components/ui/kawaii-mascot';
import { CHARACTERS, characterImage } from '@/lib/characters';
import { LanguageSelector } from '@/components/ui/language-selector';

export function GameSetup({
  mode,
  solo = false,
  initialCount,
  onBack,
  onLaunch,
}: {
  mode: GameMode;
  solo?: boolean;
  initialCount?: number;
  onBack: () => void;
  onLaunch: (config: GameConfig) => void;
}) {
  const meta = MODE_META[mode];
  const settings = useSettingsStore();
  const lang = useLanguageStore(s => s.language);
  const en = lang === 'en';
  const { user } = useAuth();
  const setPlayers = useGameStore(s => s.setPlayers);

  const [players, setDraft] = useState<Player[]>(() =>
    resizePlayers(
      useGameStore.getState().players,
      solo ? 1 : Math.max(meta.minPlayers, initialCount ?? 2)
    ).map((p, i) => ({
      ...p,
      ...(i === 0 && user ? { name: user.name, avatarUrl: user.avatarUrl ?? undefined } : {}),
      language: p.language ?? lang,
    }))
  );

  useEffect(() => {
    setDraft(prev => prev.map(p => ({ ...p, language: p.language ?? lang })));
  }, [lang]);

  const [category, setCategory] = useState<QuestionCategory | 'mixed'>('mixed');
  const [count, setCount] = useState(settings.defaultQuestionCount);
  const [duration, setDuration] = useState<'express' | 'classic'>('express');
  const individualLanguage = ['classic', 'rapidfire', 'truefalse'].includes(mode);
  const min = solo ? 1 : Math.max(2, meta.minPlayers);

  function launch() {
    const final = players.map((p, i) => ({
      ...p,
      name: p.name.trim() || (en ? `Player ${i + 1}` : `Joueur ${i + 1}`),
      language: p.language || lang,
    }));
    setPlayers(final);
    onLaunch({
      sessionId: newGameSessionId(),
      mode,
      category,
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

      <div className="jx-setup-grid">
        <div>
          {/* Sélection explicite de la langue pour le jeu et les questions */}
          <section className="jx-form-card">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-fp-primary" />
              <h2 className="text-base font-bold">
                {en ? 'Language of questions & game' : 'Langue des questions et du jeu'}
              </h2>
            </div>
            <p className="text-xs text-fp-text-dim mb-3">
              {en
                ? 'Choose whether questions are displayed in French or English.'
                : 'Choisis si les questions et l’application s’affichent en français ou en anglais.'}
            </p>
            <LanguageSelector variant="pills" />
          </section>

          {/* Section Joueurs */}
          <section className="jx-form-card">
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
                          language: p.language ?? lang,
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
              {players.map((p, i) => (
                <div className="jx-player-field" key={p.id}>
                  <PlayerDot
                    name={p.name}
                    avatarUrl={p.avatarUrl ?? characterImage(CHARACTERS[i % 5].id)}
                    size={42}
                  />
                  <input
                    value={p.name}
                    aria-label={`${en ? 'Player' : 'Joueur'} ${i + 1}`}
                    onChange={e =>
                      setDraft(players.map((v, j) => (j === i ? { ...v, name: e.target.value } : v)))
                    }
                    maxLength={24}
                  />
                  {individualLanguage && (
                    <select
                      aria-label={`${en ? 'Language' : 'Langue'} ${p.name}`}
                      value={p.language ?? lang}
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
              ))}
            </div>
          </section>

          {meta.usesQuestionCatalog && (
            <section className="jx-form-card">
              <h2>{en ? 'Choose your topics' : 'Choisis tes thèmes'}</h2>
              <div className="jx-topics">
                {(['mixed', ...CATEGORIES] as const).map(c => (
                  <button aria-pressed={c === category} key={c} onClick={() => setCategory(c)}>
                    {en ? categoryLabel(lang, c) : CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
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
        </div>

        <aside className="jx-form-card jx-summary">
          <KawaiiMascot theme={solo ? 'neo' : 'poppy'} size={145} />
          <h2>{en ? 'Ready to play?' : 'Prêts à jouer ?'}</h2>
          <p>
            {modeLabel(mode, lang)} · {players.length} {en ? 'player(s)' : 'joueur(s)'}
          </p>
          <div className="my-3 inline-flex items-center gap-1.5 rounded-full bg-fp-primary/10 px-3 py-1 text-xs font-bold text-fp-primary">
            <span>{lang === 'en' ? '🇬🇧 English questions' : '🇫🇷 Questions en français'}</span>
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
