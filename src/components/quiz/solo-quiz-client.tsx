"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, RotateCcw, Check, X, ArrowRight } from "lucide-react";
import type { Question } from "@/lib/questions/schema";
import { motion, AnimatePresence } from "motion/react";
import { localizeQuestion } from "@/lib/questions/localize";
import { useLanguageStore } from "@/lib/store/language";
import { answerOrder } from "@/lib/questions/answer-order";
import { useQuizExposure } from "@/lib/questions/use-quiz-exposure";
import { useUnseenQuiz } from "@/lib/questions/use-unseen-quiz";
import { QuestionMedia } from "@/components/game/question-media";
import { useMobileGameNavigation } from "@/lib/navigation/use-mobile-game-navigation";

interface SoloQuizClientProps {
  questions: Question[];
  quizTitle: string;
}

export function SoloQuizClient({ questions: candidates, quizTitle }: SoloQuizClientProps) {
  const selection = useUnseenQuiz(candidates);
  const { questions } = selection;
  const language = useLanguageStore(s => s.language);
  const t = (fr: string, en: string) => language === "en" ? en : fr;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  useMobileGameNavigation(!isFinished && questions.length > 0);
  const shuffledAnswers = questions[currentIndex] ? answerOrder(questions[currentIndex]) : [];
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  useQuizExposure(questions[currentIndex], !isFinished, selection.sessionId);

  // Initialize shuffled answers on mount or when index changes


  function handleAnswerSelect(answer: number) {
    if (isAnswerRevealed) return;
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);

    const isCorrect = answer === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      setIsFinished(true);
    }
  }

  function handleRestart() {
    selection.reload();
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setIsFinished(false);
  }

  if (selection.loading) return <p role="status">{t("Vérification de ton historique…", "Checking your history…")}</p>;
  if (selection.error || questions.length === 0) {
    return <div className="text-center p-8"><p role="status">{selection.error ? t("Historique indisponible. Aucune question ne sera affichée sans vérification.", "History unavailable. No questions will be shown without verification.") : t("Tu as déjà reçu toutes les questions disponibles de ce quiz. Choisis un autre thème.", "You have already received every available question in this quiz. Choose another topic.")}</p><Link href="/quiz" className="fp-btn-primary mt-4">{t("Autres thèmes", "Other topics")}</Link></div>;
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl text-center"
      >
        <div className="fp-card p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fp-primary/10 text-fp-primary">
            <span className="text-3xl font-black">{score}/{questions.length}</span>
          </div>
          
          <h2 className="mt-6 text-2xl font-black text-fp-text">
            {score === questions.length ? t("Parfait ! 🏆", "Perfect! 🏆") :
             score > questions.length / 2 ? t("Bien joué ! 👏", "Well done! 👏") :
             t("Tu peux faire mieux ! 💪", "Keep practising! 💪")}
          </h2>
          
          <p className="mt-3 text-fp-text-dim">
            {t("Quiz terminé", "Quiz complete")} : <strong>{quizTitle}</strong>.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-fp-fill py-3.5 font-bold text-fp-text transition-colors hover:bg-fp-border"
            >
              <RotateCcw className="h-4.5 w-4.5" /> {t("Chercher des questions inédites", "Find unseen questions")}
            </button>
            <Link
              href="/play/local"
              className="fp-btn-primary flex items-center justify-center gap-2 py-3.5"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              {t("Défier des amis", "Challenge friends")}
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = { ...questions[currentIndex], ...localizeQuestion(questions[currentIndex], language, { autoTranslate: false }) };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between px-2 text-sm font-bold text-fp-text-dim">
        <span>Question {currentIndex + 1} / {questions.length}</span>
        <span>Score: {score}</span>
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
              <>{t("Voir le score final", "See final score")} <ArrowRight className="h-4.5 w-4.5" /></>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
