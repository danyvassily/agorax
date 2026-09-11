import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { SoloQuizClient } from "@/components/quiz/solo-quiz-client";
import { DailyClient } from "@/components/daily/daily-client";
import { loadQuestions } from "@/lib/questions/load";

describe("public question display authorization", () => {
  const question = loadQuestions("fr").questions[0];
  it("does not render a catalog question before the history request succeeds", () => {
    const html = renderToString(createElement(SoloQuizClient, { questions: [question], quizTitle: "Test" }));
    expect(html).not.toContain(question.question);
    expect(html).toContain("status");
  });
  it("does not expose the daily question during server rendering", () => {
    const html = renderToString(createElement(DailyClient, { questions: [question], dateString: "2026-09-11" }));
    expect(html).not.toContain(question.question);
  });
});
