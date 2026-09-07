import type { Question } from "./schema";

/** Stable on server and client; correctness always uses the original index. */
export function answerOrder(question?: Pick<Question, "id" | "answers">): number[] {
  if (!question) return [];
  let seed = 2166136261;
  for (const char of question.id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const indices = question.answers.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}
