"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, RotateCcw, Users, Zap } from "lucide-react";
import { sound } from "@/lib/audio/sound-engine";
import { useLanguageStore } from "@/lib/store/language";

interface DemoQuestion {
  id: string;
  questionFr: string;
  questionEn: string;
  answersFr: string[];
  answersEn: string[];
  correctAnswer: number;
  explanationFr: string;
  explanationEn: string;
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "demo-1",
    questionFr: "Quel pays partage la plus longue frontière terrestre avec la France ?",
    questionEn: "Which country shares the longest land border with France?",
    answersFr: ["L'Espagne", "Le Brésil", "L'Allemagne", "L'Italie"],
    answersEn: ["Spain", "Brazil", "Germany", "Italy"],
    correctAnswer: 1,
    explanationFr: "730 km de frontière avec le Brésil via la Guyane française ! L'Espagne n'arrive que deuxième avec 623 km.",
    explanationEn: "730 km border with Brazil via French Guiana! Spain comes second with 623 km.",
  },
  {
    id: "demo-2",
    questionFr: "Quelle couleur avaient les carottes avant le 16e siècle ?",
    questionEn: "What colour were carrots before the 16th century?",
    answersFr: ["Orange", "Violettes / Blanches", "Vertes", "Bleues"],
    answersEn: ["Orange", "Purple / White", "Green", "Blue"],
    correctAnswer: 1,
    explanationFr: "Elles étaient violettes, jaunes ou blanches. Ce sont les horticulteurs hollandais qui les ont rendues oranges !",
    explanationEn: "They were purple, yellow or white. Dutch horticulturists bred them orange in honour of the House of Orange!",
  },
  {
    id: "demo-3",
    questionFr: "Combien de cœurs possède une pieuvre ?",
    questionEn: "How many hearts does an octopus have?",
    answersFr: ["1 cœur", "2 cœurs", "3 cœurs", "4 cœurs"],
    answersEn: ["1 heart", "2 hearts", "3 hearts", "4 hearts"],
    correctAnswer: 2,
    explanationFr: "3 cœurs ! Deux pompent le sang vers les branchies, et un vers le reste du corps.",
    explanationEn: "3 hearts! Two pump blood to the gills, and one to the rest of the body.",
  },
];

export function HomeLiveDemo() {
  const lang = useLanguageStore((s) => s.language);
  const en = lang === "en";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const q = DEMO_QUESTIONS[currentIndex];
  const questionText = en ? q.questionEn : q.questionFr;
  const answers = en ? q.answersEn : q.answersFr;
  const explanation = en ? q.explanationEn : q.explanationFr;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);

    if (idx === q.correctAnswer) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playTick();
    setAnswered(false);
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev + 1) % DEMO_QUESTIONS.length);
  };

  return (
    <section className="my-6 rounded-3xl border border-black/[0.08] bg-gradient-to-br from-indigo-50/70 via-white to-pink-50/40 p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700">
          <Zap size={14} className="fill-indigo-500 text-indigo-500" />
          <span>{en ? "Live 30s Demo · Test your brain" : "Démo Live 30s · Teste tes réflexes"}</span>
        </div>
        <span className="text-xs font-semibold text-black/40">
          {currentIndex + 1} / {DEMO_QUESTIONS.length}
        </span>
      </div>

      <h2 className="text-lg sm:text-xl font-black tracking-tight text-fp-text leading-snug">
        {questionText}
      </h2>

      {/* Grille des réponses interactives */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {answers.map((ans, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === q.correctAnswer;

          let btnStyle = "bg-white border-black/10 hover:border-black/20 text-fp-text hover:bg-black/[0.01]";
          if (answered) {
            if (isCorrect) {
              btnStyle = "bg-emerald-500 text-white border-emerald-500 font-bold shadow-xs";
            } else if (isSelected) {
              btnStyle = "bg-rose-500 text-white border-rose-500 font-bold";
            } else {
              btnStyle = "bg-black/[0.02] border-black/5 text-black/40 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all active:scale-[0.98] ${btnStyle}`}
            >
              <span>{ans}</span>
              {answered && isCorrect && <Check size={18} className="shrink-0 text-white" />}
              {answered && isSelected && !isCorrect && <X size={18} className="shrink-0 text-white" />}
            </button>
          );
        })}
      </div>

      {/* Résultat et Explication */}
      {answered && (
        <div className="mt-4 rounded-2xl bg-white p-4 border border-black/5 shadow-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">
              {selectedAnswer === q.correctAnswer ? "🎯" : "🤯"}
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-black/50">
                {selectedAnswer === q.correctAnswer
                  ? (en ? "Spot on!" : "Bien joué !")
                  : (en ? "Tricked!" : "Et non, tombé dans le panneau !")}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm text-fp-text leading-relaxed font-medium">
                {explanation}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-black/5">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black/[0.04] px-3.5 py-2 text-xs font-bold text-fp-text hover:bg-black/[0.08] transition active:scale-95"
            >
              <RotateCcw size={14} />
              <span>{en ? "Another question" : "Autre question"}</span>
            </button>

            <Link
              href="/play/online?create=1"
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-fp-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-fp-primary/90 transition active:scale-95"
            >
              <Users size={14} />
              <span>{en ? "Challenge friends (in 30s)" : "Défier mes amis (en 30s)"}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
