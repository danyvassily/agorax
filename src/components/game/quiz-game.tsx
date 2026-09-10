"use client";

/**
 * Agorax — Quiz Classique / Vrai-Faux / Rapid Fire
 * Multi-joueurs sur un seul appareil : tour par tour avec écran
 * "passe l'appareil" entre chaque question, scores individuels.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/questions/schema";
import { REPORT_REASONS } from "@/lib/questions/schema";
import { makePlayer, useGameStore, type Player } from "@/lib/store/game";
import { useHistoryStore } from "@/lib/store/history";
import {
  loadGameQuestions,
  markQuestionAnswered,
  markQuestionDisplayed,
} from "@/lib/questions/question-client";
import { useLanguageStore } from "@/lib/store/language";
import { localizeQuestion } from "@/lib/questions/localize";
import { translate } from "@/lib/i18n";
import { categoryLabel } from "@/lib/game/modes";
import { ProgressRing, TimerBar, Confetti, PlayerDot, PillBadge } from "@/components/ui/primitives";
import { KawaiiMascot } from "@/components/ui/kawaii-mascot";
import { RoundRoastPanel } from "@/components/game/round-roast-panel";
import { QuestionMedia } from "@/components/game/question-media";
import { AlertCircle, Flag, ChevronLeft, Check, X, Pause, Play, ArrowRight } from "lucide-react";
import { sound } from "@/lib/audio/sound-engine";
import { isQuizAnswerCorrect, playerQuestionCount, startQuestionCountdown } from "@/lib/game/quiz-round";
import { recordEloResults } from "@/lib/ranking/client";
import { useWakeLock } from "@/lib/device/wake-lock";
import { useMobileGameNavigation } from "@/lib/navigation/use-mobile-game-navigation";

interface QuizGameProps {
  mode: "classic" | "truefalse" | "rapidfire";
}

type Phase = "loading" | "handoff" | "playing" | "answer" | "results";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  expert: "Expert",
};

export function QuizGame({ mode }: QuizGameProps) {
  const router = useRouter();
  const config = useGameStore((s) => s.config);
  const { entries, addReport } = useHistoryStore();

  const players: Player[] = useMemo(
    () => (config?.players?.length ? config.players : [makePlayer(0, "Joueur 1")]),
    [config],
  );
  const solo = players.length === 1;

  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("loading");
  useWakeLock(phase === "playing" || phase === "handoff");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  useMobileGameNavigation(!error && phase !== "results");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  /** Scores locaux par joueur : { [playerId]: { score, correct } } */
  const [scores, setScores] = useState<Record<string, { score: number; correct: number }>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const [sessionId, setSessionId] = useState(() => config?.sessionId ?? crypto.randomUUID());
  const eloRecordedRef = useRef(false);

  const answeredRef = useRef(false);
  const handleAnswerRef = useRef<(i: number) => void>(() => {});

  const timePerQuestion = config?.timePerQuestion ?? 15;
  const lang = useLanguageStore((s) => s.language);
  const activePlayer = players[index % players.length];
  const playerLanguage = activePlayer?.language ?? lang;
  const en = playerLanguage === "en";
  const tr = (fr:string, english:string) => en ? english : fr;
  const currentRaw = questions[index];

  // Règle d'or de l'architecture langue :
  // En mode "shared" (défaut), la question est strictement rendue dans config.gameLanguage.
  // En mode "per-player", chaque joueur voit sa propre langue préférée (si bilingue/traduit).
  const effectiveGameLanguage = config?.gameLanguage ?? "fr";
  const effectiveLanguageMode = config?.languageMode ?? "shared";
  const renderedQuestionLanguage = effectiveLanguageMode === "per-player"
    ? (activePlayer?.language ?? effectiveGameLanguage)
    : effectiveGameLanguage;

  const current = useMemo(
    () => (currentRaw ? { ...currentRaw, ...localizeQuestion(currentRaw, renderedQuestionLanguage) } : undefined),
    [currentRaw, renderedQuestionLanguage],
  );
  const isLast = index >= questions.length - 1;

  // Dérivation d'assertion binaire pour le mode Vrai ou Faux (50% vrai, 50% distracteur)
  const tfAssertion = useMemo(() => {
    if (mode !== "truefalse" || !current) return null;
    const charSum = current.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + index;
    const isTrue = charSum % 2 === 0;

    if (isTrue) {
      return {
        proposedAnswer: current.answers[current.correctAnswer],
        isTrue: true,
      };
    } else {
      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== current.correctAnswer);
      const chosenWrongIndex = wrongIndices[charSum % wrongIndices.length];
      return {
        proposedAnswer: current.answers[chosenWrongIndex],
        isTrue: false,
      };
    }
  }, [mode, current, index]);

  // Chargement initial via l'API interne (anti-répétition serveur)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setPhase("loading");
        setIndex(0);
        setSelected(null);
        setScores({});
        eloRecordedRef.current = false;
        setError(null);
        setReportOpen(false);
        setReportDone(false);
        answeredRef.current = false;
        const gameLanguage = config?.gameLanguage ?? "fr";
        const languageMode = config?.languageMode ?? "shared";
        const requireBilingual = languageMode === "per-player" && players.some(p => (p.language ?? lang) !== (players[0]?.language ?? lang));

        const data = await loadGameQuestions({
          count: mode === "rapidfire" ? 20 : mode === "truefalse" ? 10 : config?.questionCount ?? 10,
          category: config?.category,
          subcategory: config?.subcategory,
          difficulties: config?.difficulty && config.difficulty !== "mixed" ? [config.difficulty] : undefined,
          players,
          history: entries,
          sessionId,
          gameLanguage,
          languageMode,
          language: gameLanguage,
          requireBilingual,
          ai: false,
        });
        if (cancelled) return;
        const pool = (data.questions ?? []) as Question[];
        if (pool.length === 0) {
          setError("Aucune question disponible pour cette configuration. Essaie une autre catégorie.");
          return;
        }
        const qs =
          mode === "truefalse"
            ? pool.slice(0, Math.min(10, pool.length))
            : mode === "rapidfire"
              ? pool.slice(0, Math.min(20, pool.length))
              : pool;
        setQuestions(qs);
        // En solo on joue direct ; en multi, écran de passage de relais
        setPhase(solo ? "playing" : "handoff");
        if (solo) setTimeLeft(timePerQuestion); remainingRef.current = timePerQuestion;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur de chargement");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  useEffect(() => {
    if (phase !== "results" || eloRecordedRef.current || players.length < 2) return;
    eloRecordedRef.current = true;
    void recordEloResults(sessionId, players, Object.fromEntries(players.map((p) => [p.id, scores[p.id]?.score ?? 0])));
  }, [phase, players, scores, sessionId]);

  const goNext = useCallback(() => {
    answeredRef.current = false;
    setSelected(null);
    setReportDone(false);
    if (isLast) {
      setPhase("results");
    } else {
      setIndex((i) => i + 1);
      if (solo) {
        setPhase("playing");
        setTimeLeft(timePerQuestion); remainingRef.current = timePerQuestion;
      } else {
        setPhase("handoff");
      }
    }
  }, [isLast, solo, timePerQuestion]);

  useEffect(() => {
    if (phase !== "playing" || !currentRaw) return;
    void markQuestionDisplayed({
      question: currentRaw,
      players,
      sessionId,
    });
  }, [phase, currentRaw, players, sessionId]);

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (answeredRef.current || !current || paused) return;
      answeredRef.current = true;
      setSelected(answerIndex);

      const correct = isQuizAnswerCorrect(answerIndex, currentRaw!.correctAnswer, tfAssertion?.isTrue);

      if (correct) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }

      const points = correct ? 10 : 0;
      setScores((s) => ({
        ...s,
        [activePlayer.id]: {
          score: (s[activePlayer.id]?.score ?? 0) + points,
          correct: (s[activePlayer.id]?.correct ?? 0) + (correct ? 1 : 0),
        },
      }));

      void markQuestionAnswered({
        question: currentRaw!,
        player: activePlayer,
        sessionId,
        correct,
        responseTimeMs: answerIndex === -1 ? timePerQuestion * 1000 : Math.round((timePerQuestion - timeLeft) * 1000),
      });

      setPhase("answer");
    },
    [current, currentRaw, activePlayer, sessionId, timePerQuestion, timeLeft, tfAssertion, paused],
  );

  // Référence toujours fraîche pour le timer
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [handleAnswer]);

  // A paused solo game resumes with its remaining time, never a fresh timer.
  useEffect(() => {
    if (phase !== "playing" || !currentRaw || paused) return;
    return startQuestionCountdown(remainingRef.current || timePerQuestion, remaining => {
      remainingRef.current = remaining;
      setTimeLeft(remaining);
    }, () => handleAnswerRef.current(-1));
  }, [phase, currentRaw, timePerQuestion, paused]);

  useEffect(() => {
    if (phase === "playing" && !paused) {
      if (timeLeft === 3) sound.playCountdown(3);
      else if (timeLeft === 2) sound.playCountdown(2);
      else if (timeLeft === 1) sound.playCountdown(1);
    }
  }, [timeLeft, phase, paused]);

  function startTurn() {
    setTimeLeft(timePerQuestion); remainingRef.current = timePerQuestion;
    setPhase("playing");
  }

  // ---------- Erreur ----------
  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fp-danger/10 text-fp-danger">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold text-fp-text">Une erreur est survenue</h1>
        <p className="mt-2 text-[14px] text-fp-text-dim">{error}</p>
        <button type="button" onClick={() => router.push("/")} className="fp-btn-primary mt-6 px-6 py-2.5 text-[15px]">
          Retour à l&apos;accueil
        </button>
      </main>
    );
  }

  // ---------- Chargement ----------
  if (phase === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-black/10 border-t-fp-primary" />
        <p className="mt-4 text-[14px] text-fp-text-dim">{tr("Préparation des questions…", "Preparing questions…")}</p>
      </main>
    );
  }

  // ---------- Résultats ----------
  if (phase === "results") {
    const ranking = players
      .map((p) => ({ player: p, score: scores[p.id]?.score ?? 0, correct: scores[p.id]?.correct ?? 0 }))
      .sort((a, b) => b.score - a.score || b.correct - a.correct);
    const total = questions.length;
    const winner = ranking[0];

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-16 pt-10 animate-rise">
        {winner && winner.score > 0 && <Confetti />}
        <div className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <KawaiiMascot theme="party-dance" size={88} animation="celebrate" className="border border-black/[0.05] shadow-sm" />
          </div>
          <h1 className="mt-3 text-[28px] font-bold text-fp-text">
            {solo ? tr("Partie terminée", "Game complete") : `${winner.player.name} ${tr("gagne !", "wins!")}`}
          </h1>
          {solo && (
            <p className="mt-1 text-[15px] text-fp-text-dim">
              {winner.correct}/{total} {tr("bonnes réponses", "correct answers")}
            </p>
          )}
        </div>

        <div className="fp-list mt-8">
          {ranking.map((r, i) => (
            <div key={r.player.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-center text-[15px] font-semibold text-fp-text-dim tabular-nums">
                {i + 1}
              </span>
              <PlayerDot name={r.player.name} avatarUrl={r.player.avatarUrl} colorIndex={r.player.color} size={32} />
              <span className="flex-1 text-[15px] font-medium text-fp-text">{r.player.name}</span>
              <span className="text-[13px] text-fp-text-dim tabular-nums">
                {r.correct}/{playerQuestionCount(total, players.findIndex((p) => p.id === r.player.id), players.length)} ✓
              </span>
              <span className="w-14 text-right text-[15px] font-semibold text-fp-text tabular-nums">
                {r.score} pts
              </span>
            </div>
          ))}
        </div>

        <RoundRoastPanel
          seed={sessionId}
          players={ranking.map((entry) => ({
            id: entry.player.id,
            name: entry.player.name,
            score: entry.score,
            correct: entry.correct,
            total: playerQuestionCount(total, players.findIndex((player) => player.id === entry.player.id), players.length),
            colorIndex: entry.player.color,
          }))}
        />

        <div className="mt-8 flex w-full gap-3">
          <button type="button" onClick={() => router.push("/")} className="fp-btn-secondary flex-1 py-3 text-[15px]">
            {tr("Accueil", "Home")}
          </button>
          <button type="button" onClick={() => { setSessionId(crypto.randomUUID()); setReloadKey((k) => k + 1); }} className="fp-btn-primary flex-1 py-3 text-[15px]">
            {tr("Rejouer", "Play again")}
          </button>
        </div>
      </main>
    );
  }

  // ---------- Passage de relais (multi-joueurs, un appareil) ----------
  if (phase === "handoff" && activePlayer) {
    return <main className="jx-handoff mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-6 text-center"><span className="jx-eyebrow">{tr("UN SEUL TÉLÉPHONE · TOUR PAR TOUR", "ONE PHONE · TAKE TURNS")}</span><p>Question {index + 1} / {questions.length}</p><KawaiiMascot theme="poppy" size={210}/><h1>{tr("Passe le téléphone à", "Pass the phone to")} {activePlayer.name}.</h1><p>{tr("La question reste cachée jusqu’à ce que tu sois prêt.", "The question stays hidden until you’re ready.")}</p><PillBadge>{tr("Langue", "Language")} : {playerLanguage === "en" ? "English" : "Français"}</PillBadge><button onClick={startTurn} className="fp-btn-primary mt-6 w-full max-w-sm">{tr("Je suis", "I’m")} {activePlayer.name}, {tr("c’est parti !", "let’s play!")}</button><button className="fp-btn-ghost" onClick={()=>router.push('/play/local')}>{tr("Quitter", "Leave")}</button></main>;
  }

  if (!current) return null;

  const isCorrect =
    phase === "answer" &&
    isQuizAnswerCorrect(selected, currentRaw.correctAnswer, tfAssertion?.isTrue);
  const isWrong = phase === "answer" && !isCorrect;

  // ---------- Jeu ----------
  return (
    <main className="jx-game jx-game-screen mx-auto flex min-h-dvh w-full flex-col px-4 sm:px-6 pb-12 pt-3 animate-rise">
      {/* Barre de navigation */}
      <div className="jx-game-topbar flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="fp-btn-ghost inline-flex items-center gap-1 px-2 py-1 text-[15px]"
          aria-label={tr("Quitter la partie", "Leave game")}
        >
          <ChevronLeft className="h-5 w-5" />
          <span>{tr("Quitter", "Leave")}</span>
        </button>
        <span className="text-[14px] font-semibold text-fp-text-dim tabular-nums">
          {index + 1}/{questions.length}
        </span>
        {!solo && activePlayer ? (
          <span className="flex items-center gap-1.5">
            <PlayerDot name={activePlayer.name} colorIndex={activePlayer.color} size={26} />
            <span className="text-[14px] font-bold text-fp-text">{activePlayer.name}</span>
          </span>
        ) : (
          <button className="fp-btn-ghost" onClick={()=>setPaused(true)} disabled={phase!=="playing"} aria-label={tr("Mettre en pause", "Pause game")}><Pause size={20}/></button>
        )}
      </div>

      {/* Timer */}
      {mode !== "rapidfire" && (
        <div className="jx-game-timer mt-4">
          <TimerBar seconds={timeLeft} total={timePerQuestion} />
        </div>
      )}

      {/* Question */}
      <section className="jx-question-stage mt-5 flex-1">
        <div className="jx-question-meta flex items-center justify-between">
          <PillBadge>
            {categoryLabel(playerLanguage, current.category)} · {en ? current.difficulty.charAt(0).toUpperCase() + current.difficulty.slice(1) : (DIFFICULTY_LABELS[current.difficulty] ?? current.difficulty)}
          </PillBadge>
          {(
            <ProgressRing seconds={timeLeft} total={timePerQuestion} size={48} danger={timeLeft <= 2} />
          )}
        </div>

        {/* Mascotte interactive selon l'état de réflexion / résultat */}
        <div className="jx-feedback mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 border border-black/[0.04]">
          {phase === "playing" && (
            <>
              <KawaiiMascot theme={solo?"neo":"luma"} size={48} />
              <div>
                <p className="text-[14px] font-bold text-fp-text">{tr("À toi de jouer.", "Your turn.")}</p>
                <p className="text-[12px] text-fp-text-dim">{tr("Choisis ta réponse avant la fin du temps.", "Choose your answer before time runs out.")}</p>
              </div>
            </>
          )}
          {isCorrect && (
            <>
              <KawaiiMascot theme="happy" size={62} animation="celebrate" />
              <div>
                <p className="text-[14px] font-bold text-fp-success">{tr("Bien joué !", "Well done!")}</p>
                <p className="text-[12px] text-fp-text-dim">{tr("+10 points pour ton score.", "+10 points to your score.")}</p>
              </div>
            </>
          )}
          {isWrong && (
            <>
              <KawaiiMascot theme="sad" size={62} animation="shake" />
              <div>
                <p className="text-[14px] font-bold text-fp-danger">{tr("Tu te rattrapes à la prochaine !", "You’ll get the next one!")}</p>
                <p className="text-[12px] text-fp-text-dim">{tr("La bonne réponse est indiquée ci-dessus.", "The correct answer is shown above.")}</p>
              </div>
            </>
          )}
        </div>

        {current.media && <QuestionMedia media={current.media} />}

        <h1
          key={current.id}
          data-length={current.question.length > 110 ? "long" : current.question.length > 72 ? "medium" : "short"}
          className="jx-question-title animate-rise mt-4 text-[22px] sm:text-[28px] font-bold leading-snug text-fp-text"
        >
          {current.question}
        </h1>

        {mode === "truefalse" && tfAssertion ? (
          <div className="mt-6 space-y-4">
            {/* Proposition d'assertion */}
            <div className="rounded-2xl border-2 border-dashed border-fp-primary/30 bg-fp-primary/5 p-4 sm:p-5 text-center">
              <span className="text-[12px] font-bold uppercase tracking-wider text-fp-primary">Proposition</span>
              <p className="mt-1 text-[20px] sm:text-[24px] font-extrabold text-fp-text">
                « {tfAssertion.proposedAnswer} »
              </p>
            </div>

            {/* Deux gros boutons Vrai / Faux */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                disabled={phase === "answer"}
                onClick={() => handleAnswer(0)}
                className={`group flex min-h-[90px] sm:min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 p-3 sm:p-4 font-black transition-all ${
                  phase === "answer"
                    ? tfAssertion.isTrue
                      ? "border-fp-success bg-fp-success text-white shadow-lg animate-pop"
                      : selected === 0
                        ? "border-fp-danger bg-fp-danger/10 text-fp-danger"
                        : "border-fp-border opacity-40 text-fp-text-dim"
                    : "border-fp-success/40 bg-white text-fp-success shadow-sm hover:border-fp-success hover:bg-fp-success/10 active:scale-[0.98]"
                }`}
              >
                <Check className="h-7 w-7 mb-1 transition-transform group-hover:scale-110" strokeWidth={3} />
                <span className="text-[19px] sm:text-[22px] tracking-wide">{tr("VRAI", "TRUE")}</span>
              </button>

              <button
                type="button"
                disabled={phase === "answer"}
                onClick={() => handleAnswer(1)}
                className={`group flex min-h-[90px] sm:min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 p-3 sm:p-4 font-black transition-all ${
                  phase === "answer"
                    ? !tfAssertion.isTrue
                      ? "border-fp-success bg-fp-success text-white shadow-lg animate-pop"
                      : selected === 1
                        ? "border-fp-danger bg-fp-danger/10 text-fp-danger"
                        : "border-fp-border opacity-40 text-fp-text-dim"
                    : "border-fp-danger/40 bg-white text-fp-danger shadow-sm hover:border-fp-danger hover:bg-fp-danger/10 active:scale-[0.98]"
                }`}
              >
                <X className="h-7 w-7 mb-1 transition-transform group-hover:scale-110" strokeWidth={3} />
                <span className="text-[19px] sm:text-[22px] tracking-wide">{tr("FAUX", "FALSE")}</span>
              </button>
            </div>

            {/* Révélation si faux */}
            {phase === "answer" && !tfAssertion.isTrue && (
              <p className="animate-rise text-center text-[14px] font-medium text-fp-text-dim">
                La bonne réponse était : <strong className="text-fp-success font-bold">{current.answers[current.correctAnswer]}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="jx-answer-grid mt-6 grid grid-cols-1 gap-2.5">
            {current.answers.map((answer, i) => {
              let cls = "text-fp-text";
              let disabled = paused;
              if (phase === "answer") {
                disabled = true;
                if (i === current.correctAnswer) {
                  cls = "border-2 border-fp-success bg-fp-success/10 text-fp-text animate-pop";
                } else if (i === selected) {
                  cls = "border-2 border-fp-danger bg-fp-danger/10 text-fp-text";
                } else {
                  cls = "opacity-40";
                }
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAnswer(i)}
                  className={`fp-answer flex min-h-[64px] items-center gap-3.5 px-5 py-4 text-left text-[16px] font-medium ${cls}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[14px] font-bold text-fp-text-dim">
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1 leading-snug">{answer}</span>
                  {phase === "answer" && i === current.correctAnswer && (
                    <span className="font-bold text-fp-success text-lg" aria-hidden="true">✓</span>
                  )}
                  {phase === "answer" && i === selected && i !== current.correctAnswer && (
                    <span className="font-bold text-fp-danger text-lg" aria-hidden="true">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Explication */}
        {phase === "answer" && current.explanation && (
          <p className="animate-rise mt-4 rounded-2xl bg-black/[0.03] px-4 py-3 text-[13px] leading-relaxed text-fp-text-dim">
            {current.explanation}
          </p>
        )}
      </section>

      <div className="jx-score-strip"><span>{tr("Ton score", "Your score")} <strong>{scores[activePlayer.id]?.score ?? 0} pts</strong></span><span>{index+1} / {questions.length}</span></div>
      {phase === "answer" && <button className="fp-btn-primary mt-4 w-full" onClick={goNext}>{isLast?tr("Voir le résultat", "See results"):tr("Question suivante", "Next question")}<ArrowRight size={18}/></button>}
      {paused && <div className="jx-modal" role="dialog" aria-modal="true" aria-label={tr("Partie en pause", "Game paused")}><div><KawaiiMascot theme="neo" size={140}/><h2>{tr("On fait une pause ?", "Taking a break?")}</h2><button autoFocus className="fp-btn-primary" onClick={()=>setPaused(false)}><Play size={18}/>{tr("Reprendre", "Resume")}</button><button className="fp-btn-ghost" onClick={()=>router.push('/play/solo')}>{tr("Quitter la partie", "Leave game")}</button></div></div>}
      {/* Signaler */}
      {phase === "answer" && !reportDone && (
        <div className="jx-report-action mt-4 text-center">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-1 text-[13px] text-fp-text-dim underline-offset-2 hover:underline"
          >
            <Flag className="h-3 w-3" />
            Signaler cette question
          </button>
        </div>
      )}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Signaler la question">
          <div className="fp-card w-full max-w-md p-5 animate-pop">
            <h3 className="text-[17px] font-semibold text-fp-text">{tr("Signaler cette question", "Report this question")}</h3>
            <div className="mt-4 grid grid-cols-1 gap-1.5">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    if (current) {
                      addReport(current.id, r, undefined, {
                        gameId: sessionId,
                        questionId: current.id,
                        catalogLanguage: currentRaw?.language,
                        requestedLanguage: effectiveGameLanguage,
                        renderedLanguage: renderedQuestionLanguage,
                        uiLanguage: lang,
                        gameLanguage: effectiveGameLanguage,
                        languageMode: effectiveLanguageMode,
                        playerLanguage: activePlayer?.language,
                        playerId: activePlayer?.id,
                        sourceFile: currentRaw?.source?.provider,
                        timestamp: new Date().toISOString(),
                      });
                    }
                    setReportOpen(false);
                    setReportDone(true);
                  }}
                  className="rounded-xl bg-black/[0.03] px-4 py-2.5 text-left text-[14px] font-medium text-fp-text transition-colors hover:bg-black/[0.06]"
                >
                  {translate(en ? "en" : "fr", `report.reason.${r}`)}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setReportOpen(false)} className="fp-btn-ghost mt-3 w-full py-2.5 text-[15px]">
              {tr("Annuler", "Cancel")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
