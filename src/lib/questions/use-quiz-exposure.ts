"use client";

import { useEffect } from "react";
import { getOrCreateDeviceToken } from "@/lib/identity/identity-service";
import { useHistoryStore } from "@/lib/store/history";
import type { Question } from "./schema";

/** Public practice quizzes also contribute to the next game's exclusion history. */
export function useQuizExposure(question: Question | undefined, visible: boolean) {
  const questionId = question?.id;
  const familyId = question?.familyId;
  useEffect(() => {
    if (!visible || !questionId || !familyId) return;
    void getOrCreateDeviceToken().then(token => {
      useHistoryStore.getState().markSeen(questionId, familyId, [token]);
    }).catch(error => console.warn("[question-history] Could not persist exposure", error));
  }, [questionId, familyId, visible]);
}
