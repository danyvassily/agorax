import type { Question } from "./schema";

/** A finite deck must never wrap. Skip duplicate families defensively. */
export function nextRoundQuestion(pool: Question[], currentIndex: number) {
  const seen = new Set(pool.slice(0, currentIndex + 1).map(q => q.familyId.toLowerCase()));
  for (let index = currentIndex + 1; index < pool.length; index++) {
    if (!seen.has(pool[index].familyId.toLowerCase())) return { index, question: pool[index] };
  }
  return null;
}
