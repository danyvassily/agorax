import { describe, expect, it } from "vitest";
import { loadQuestions } from "@/lib/questions/load";
import { getDailyQuestions } from "@/lib/questions/daily";
import { getQuizBySlug } from "@/lib/questions/seo-quiz";
import { localizeQuestion } from "@/lib/questions/localize";
import { translateQuestionToEnglish } from "@/lib/questions/translator";
import { getUnseenQuestions } from "@/lib/questions/question-selection-service";
import { useDailyStore } from "@/lib/store/daily";
import { answerOrder } from "@/lib/questions/answer-order";

describe("Recent quiz regressions", () => {
  it("loads English translations as playable questions with shared knowledge and scoring", () => {
    const en = loadQuestions("en");
    expect(en.errors).toEqual([]);
    expect(en.questions.length).toBeGreaterThan(2000);
    const fr = new Map(loadQuestions("fr").questions.map(q => [q.id, q]));
    for (const q of en.questions) {
      const original = fr.get(q.id);
      if (!original) continue;
      expect(q.familyId).toBe(original.familyId);
      expect(q.correctAnswer).toBe(original.correctAnswer);
      expect(q.answers[q.correctAnswer]).toBeTruthy();
    }
  });
  it("excludes disputed questions from selection", () => {
    const pool = loadQuestions("fr").questions.filter(q => q.verification.status === "disputed");
    expect(pool.length).toBeGreaterThanOrEqual(14);
    expect(getUnseenQuestions({ pool, participantHistories: [], count: 10 }).questions).toEqual([]);
  });
  it("keeps every answer index when shuffling", () => {
    for (const q of loadQuestions("fr").questions.slice(0, 20)) {
      expect(answerOrder(q).sort()).toEqual([0, 1, 2, 3]);
    }
  });
  it("daily streak survives daylight saving and ignores repeated or older submissions", () => {
    useDailyStore.setState({ lastPlayedDate: "2026-03-28", currentStreak: 2, maxStreak: 2 });
    useDailyStore.getState().setDailyResult("2026-03-29", 1, "🟩");
    useDailyStore.getState().setDailyResult("2026-03-30", 1, "🟩");
    expect(useDailyStore.getState().currentStreak).toBe(4);
    useDailyStore.getState().setDailyResult("2026-03-30", 0, "🟥");
    useDailyStore.getState().setDailyResult("2026-03-29", 0, "🟥");
    expect(useDailyStore.getState().lastScore).toBe(1);
    expect(useDailyStore.getState().lastPlayedDate).toBe("2026-03-30");
  });
  it("does not retranslate an already English question", () => {
    const q = loadQuestions("en").questions[0];
    expect(localizeQuestion(q, "en").question).toBe(q.question);
  });
  it("does not reuse cached answer ordering for another question variant", () => {
    const q = { question: "Quelle est la capitale de la France ?", answers: ["Paris", "Rome", "Berlin", "Tokyo"] };
    const first = translateQuestionToEnglish(q);
    const second = translateQuestionToEnglish({ ...q, answers: [...q.answers].reverse() });
    expect(second.answers).toEqual([...first.answers!].reverse());
  });
  it("daily questions are deterministic, valid, and distinct families", async () => {
    const first = await getDailyQuestions("2026-09-06");
    expect(first).toEqual(await getDailyQuestions("2026-09-06"));
    expect(first).toHaveLength(10);
    expect(new Set(first.map(q => q.familyId)).size).toBe(10);
    expect(first.map(q => q.id)).not.toEqual((await getDailyQuestions("2026-09-07")).map(q => q.id));
    expect(await getDailyQuestions("invalid")).toEqual([]);
  });
  it("SEO quiz uses indexed answers and rejects path traversal", async () => {
    const quiz = await getQuizBySlug("science", "science-001");
    expect(quiz?.questions.length).toBeGreaterThan(0);
    for (const q of quiz!.questions) expect(q.answers[q.correctAnswer]).toBeTruthy();
    expect(await getQuizBySlug("..", "package")).toBeNull();
  });
});
