import { loadQuestions } from "./load";
import { withEnglishTranslations } from "./bilingual";
import { getUnseenQuestions } from "./question-selection-service";
import type { Question } from "./schema";

/** Public daily challenge: deterministic across servers and refreshed every UTC day. */
export async function getDailyQuestions(dateString: string): Promise<Question[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString) || Number.isNaN(Date.parse(dateString))) return [];
  let seed = 0;
  for (const char of dateString) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) | 0;
  const englishIds = new Set(loadQuestions("en").questions.map(q => q.id));
  const pool = loadQuestions("fr").questions.filter(q => englishIds.has(q.id) || q.translations?.en?.answers).sort((a, b) => a.id.localeCompare(b.id));
  return withEnglishTranslations(getUnseenQuestions({
    pool, participantHistories: [], count: 10, seed,
  }).questions);
}
