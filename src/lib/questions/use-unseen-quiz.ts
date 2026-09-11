"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "./schema";
import { loadGameQuestions } from "./question-client";

/** Static pages provide a candidate list, never an authorized playing list. */
export function useUnseenQuiz(candidates: Question[], enabled = true) {
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([candidates.map(q => q.id), revision]);
  const [result, setResult] = useState<{ key: string; questions: Question[]; sessionId: string; error?: string }>();
  const request = useRef<{ key: string; promise: Promise<{ questions: Question[]; sessionId: string }> } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    if (request.current?.key !== key) {
      const [questionIds] = JSON.parse(key) as [string[], number];
      const sessionId = crypto.randomUUID();
      request.current = { key, promise: questionIds.length ? loadGameQuestions({
        count: Math.min(questionIds.length, 60), questionIds: questionIds.slice(0, 60),
        players: [], history: [], sessionId, ai: false, requireBilingual: true,
      }).then(data => ({ questions: data.questions, sessionId })) : Promise.resolve({ questions: [], sessionId }) };
    }
    void request.current.promise.then(data => {
      if (!cancelled) setResult({ ...data, key });
    }).catch(() => {
      if (!cancelled) setResult({ key, questions: [], sessionId: "", error: "HISTORY_UNAVAILABLE" });
    });
    return () => { cancelled = true; };
  }, [key, enabled]);
  const ready = result?.key === key;
  return {
    questions: ready ? result.questions : [],
    sessionId: ready ? result.sessionId : undefined,
    loading: enabled && !ready,
    error: ready ? result.error : undefined,
    reload: () => setRevision(value => value + 1),
  };
}
