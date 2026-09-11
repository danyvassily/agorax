"use client";

import { useEffect } from "react";
import { markQuestionDisplayed } from "./question-client";
import type { Question } from "./schema";

/** Public practice quizzes also contribute to the next game's exclusion history. */
export function useQuizExposure(question: Question | undefined, visible: boolean, sessionId?: string) {
  const questionId = question?.id;
  const familyId = question?.familyId;
  useEffect(() => {
    if (!visible || !questionId || !familyId || !sessionId) return;
    void markQuestionDisplayed({ question: { id: questionId, familyId }, players: [], sessionId });
  }, [questionId, familyId, visible, sessionId]);
}
