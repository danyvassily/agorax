import { loadQuestions } from "./load";
import type { Question } from "./schema";

/** Keep translations tied to the exact question and answer order. */
export function withEnglishTranslations(questions: Question[]): Question[] {
  const english = new Map(loadQuestions("en").questions.map(q => [q.id, q]));
  return questions.map(q => {
    const en = english.get(q.id);
    if (!en || en.correctAnswer !== q.correctAnswer) return q;
    return { ...q, translations: { ...q.translations, en: {
      question: en.question, answers: en.answers, explanation: en.explanation,
    } } };
  });
}
