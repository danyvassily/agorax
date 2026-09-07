"use client";

import { useState, useSyncExternalStore } from "react";
import type { Question } from "@/lib/questions/schema";
import { useDailyStore } from "@/lib/store/daily";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ArrowRight, Share2, Flame, } from "lucide-react";
import { localizeQuestion } from "@/lib/questions/localize";
import { useLanguageStore } from "@/lib/store/language";
import { answerOrder } from "@/lib/questions/answer-order";
import { useQuizExposure } from "@/lib/questions/use-quiz-exposure";
import { QuestionMedia } from "@/components/game/question-media";

const subscribe = () => () => {};

interface DailyClientProps {
  questions: Question[];
  dateString: string;
}

export function DailyClient({ questions, dateString }: DailyClientProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [shareStatus, setShareStatus] = useState("");
  const store = useDailyStore();
  
  const hasPlayedToday = store.lastPlayedDate === dateString;

  const language = useLanguageStore(s => s.language);
  const t = (fr: string, en: string) => language === "en" ? en : fr;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const shuffledAnswers = answerOrder(questions[currentIndex]);
  
  // Track history for the share grid: true = correct, false = incorrect
  const [answersHistory, setAnswersHistory] = useState<boolean[]>([]);
  useQuizExposure(questions[currentIndex], mounted && !hasPlayedToday);



  function handleAnswerSelect(answer: number) {
    if (isAnswerRevealed) return;
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);

    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setAnswersHistory((prev) => [...prev, isCorrect]);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      finishGame();
    }
  }

  function finishGame() {
    const finalScore = answersHistory.filter(Boolean).length;
    const grid = answersHistory.map(h => (h ? "🟩" : "🟥")).join("");
    
    // Save to Zustand
    store.setDailyResult(dateString, finalScore, grid);
  }

  async function handleShare() {
    const shareText = `🧠 AGORAX ${dateString}\n${store.lastResultGrid} (${store.lastScore}/${Array.from(store.lastResultGrid).length})\n🔥 ${t("Série", "Streak")}: ${store.currentStreak}\n${window.location.origin}/daily`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AGORAX", text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareStatus(t("Score copié !", "Score copied!"));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareStatus(t("Partage indisponible sur cet appareil.", "Sharing is unavailable on this device."));
    }
  }

  if (!mounted) return null;

  if (hasPlayedToday) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl text-center"
      >
        <div className="fp-card p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fp-primary/10 text-fp-primary">
            <span className="text-3xl font-black">{store.lastScore}/{Array.from(store.lastResultGrid).length}</span>
          </div>
          
          <h2 className="mt-6 text-2xl font-black text-fp-text">
            {t("Défi terminé pour aujourd’hui !", "Today’s challenge complete!")}
          </h2>

          <div className="mt-4 flex items-center justify-center gap-2 text-xl tracking-[0.2em]">
            {store.lastResultGrid}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 font-bold text-orange-500">
            <Flame className="h-5 w-5 fill-current" />
            <span>{t("Série actuelle", "Current streak")} : {store.currentStreak} {t("jour(s)", "day(s)")}</span>
          </div>

          <p className="mt-3 text-fp-text-dim text-sm">
            {t("Reviens demain pour un nouveau défi !", "Come back tomorrow for a new challenge!")}
          </p>

          <button
            onClick={handleShare}
            className="fp-btn-primary mx-auto mt-8 flex w-full max-w-xs items-center justify-center gap-2 py-3.5"
          >
            <Share2 className="h-4.5 w-4.5" />
            {t("Partager mon score", "Share my score")}
          </button>
          <p role="status" className="mt-3 text-sm">{shareStatus}</p>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center p-8">{t("Questions non disponibles.", "Questions unavailable.")}</div>;
  }

  const currentQuestion = { ...questions[currentIndex], ...localizeQuestion(questions[currentIndex], language, { autoTranslate: false }) };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between px-2 text-sm font-bold text-fp-text-dim">
        <span>Question {currentIndex + 1} / {questions.length}</span>
        <div className="flex min-w-0 flex-1 max-w-[55%] gap-1">
          {Array.from({ length: questions.length }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 min-w-0 flex-1 rounded-full ${
                i < currentIndex ? (answersHistory[i] ? "bg-green-500" : "bg-red-500") : 
                i === currentIndex ? "bg-fp-primary" : "bg-fp-border"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fp-card mb-6 p-6 sm:p-8">
            {currentQuestion.media && <QuestionMedia media={currentQuestion.media} />}
            <h2 className={`text-xl font-bold leading-relaxed text-fp-text sm:text-2xl ${currentQuestion.media ? 'mt-4' : ''}`}>
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {shuffledAnswers.map((answer, i) => {
              const isSelected = selectedAnswer === answer;
              const isCorrect = answer === currentQuestion.correctAnswer;
              
              let stateClass = "border-fp-border bg-white text-fp-text hover:border-fp-primary/30 hover:bg-fp-primary/5";
              let Icon = null;

              if (isAnswerRevealed) {
                if (isCorrect) {
                  stateClass = "border-green-500 bg-green-50 text-green-900";
                  Icon = <Check className="h-5 w-5 text-green-600" />;
                } else if (isSelected) {
                  stateClass = "border-red-500 bg-red-50 text-red-900";
                  Icon = <X className="h-5 w-5 text-red-600" />;
                } else {
                  stateClass = "border-fp-border bg-white/50 text-fp-text-dim opacity-60";
                }
              } else if (isSelected) {
                stateClass = "border-fp-primary bg-fp-primary/10 text-fp-primary";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={isAnswerRevealed}
                  className={`relative flex min-h-[4.5rem] items-center justify-between rounded-2xl border-2 px-5 py-3 text-left font-semibold transition-all ${stateClass}`}
                >
                  <span className="pr-4">{currentQuestion.answers[answer]}</span>
                  {Icon && <span className="shrink-0">{Icon}</span>}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex h-14 items-center justify-end">
        {isAnswerRevealed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-fp-text px-6 py-3 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            {currentIndex < questions.length - 1 ? (
              <>{t("Suivante", "Next")} <ArrowRight className="h-4.5 w-4.5" /></>
            ) : (
              <>{t("Voir mon score final", "See my score")} <ArrowRight className="h-4.5 w-4.5" /></>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
