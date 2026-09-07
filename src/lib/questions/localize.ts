/**
 * Free Party — Localisation des questions (FR/EN)
 * Chaque question porte ses traductions (champ `translations`). En ligne,
 * l'hôte pousse la question multilingue et CHAQUE joueur la voit dans sa
 * langue : un Français en français, un Anglophone en anglais — même question,
 * même index de bonne réponse (correctAnswer ne change jamais).
 * Si la traduction anglaise est absente, elle est traduite automatiquement au vol.
 * Repli : français si la langue demandée n'est pas prise en charge.
 */

import { translateQuestionToEnglish } from "./translator";

export interface LocalizableTranslation {
  question: string;
  answers?: string[];
  explanation?: string;
}

export interface LocalizableQuestion {
  question: string;
  answers: string[];
  language?: string;
  correctAnswer?: number;
  explanation?: string;
  translations?: Partial<Record<string, LocalizableTranslation>>;
}

export interface LocalizedQuestion {
  question: string;
  answers: string[];
  correctAnswer?: number;
  explanation?: string;
  /** Langue réellement affichée (peut être "fr" en repli) */
  lang: string;
}

/** Traductions de questions réellement disponibles aujourd'hui */
export const QUESTION_TRANSLATION_LANGS = ["en"] as const;

export function localizeQuestion(
  q: LocalizableQuestion,
  lang: string,
  options: { autoTranslate?: boolean } = { autoTranslate: false }
): LocalizedQuestion {
  const base = lang.toLowerCase().split("-")[0];
  if (q.language === base) {
    return { question: q.question, answers: q.answers, correctAnswer: q.correctAnswer, explanation: q.explanation, lang: base };
  }
  const t = q.translations?.[base];

  if (t && t.question.trim().length >= 5 && t.answers && t.answers.length === q.answers.length) {
    return {
      question: t.question,
      answers: t.answers,
      correctAnswer: q.correctAnswer, // l'index est partagé entre langues
      explanation: t.explanation ?? q.explanation,
      lang: base,
    };
  }

  // Traduction automatique vers l'anglais si aucune traduction n'était fournie
  if (base === "en" && options.autoTranslate !== false && t === undefined) {
    try {
      const auto = translateQuestionToEnglish(q);
      if (auto.question && auto.answers && auto.answers.length === q.answers.length) {
        return {
          question: auto.question,
          answers: auto.answers,
          correctAnswer: q.correctAnswer,
          explanation: auto.explanation ?? q.explanation,
          lang: "en",
        };
      }
    } catch (e) {
      console.warn("[localizeQuestion] Échec traduction automatique:", e);
    }
  }

  if (base !== "fr" && q.language === base) {
    return {
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      lang: base,
    };
  }

  return {
    question: q.question,
    answers: q.answers,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    lang: "fr",
  };
}
