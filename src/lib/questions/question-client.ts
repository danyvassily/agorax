"use client";

import type { Player } from "@/lib/store/game";
import type { QuestionHistory } from "./schema";
import type { Question } from "./schema";
import { getAccessToken, getParticipantTokens, resolvePlayerProfiles } from "@/lib/identity/identity-service";
import { toParticipantHistories, useHistoryStore } from "@/lib/store/history";
import { useLanguageStore } from "@/lib/store/language";
import { flushExposures, useExposureOutbox } from "./exposure-outbox";

interface LoadQuestionsOptions {
  count: number;
  category?: string;
  subcategory?: string;
  difficulties?: string[];
  players: Player[];
  history: QuestionHistory[];
  sessionId: string;
  onlineSessionId?: string;
  ai?: boolean;
  requireBilingual?: boolean;
  /** Langue de contenu demandée (distincte de la langue de l'interface). */
  language?: string;
  /** Langue officielle de la partie (explicite) */
  gameLanguage?: "fr" | "en";
  /** Mode de langue ("shared" ou "per-player") */
  languageMode?: "shared" | "per-player";
}

export interface QuestionPoolResponse {
  questions: Question[];
  requested: number;
  available: number;
  returned: number;
  poolExhausted: boolean;
  reason?: "INSUFFICIENT_UNSEEN_QUESTIONS";
  aiGenerated?: boolean;
  aiSkipped?: "authentication_required" | "rate_limited" | "unavailable" | "bilingual_required";
}

async function authenticatedHeaders(): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function loadGameQuestions(options: LoadQuestionsOptions): Promise<QuestionPoolResponse> {
  const participantTokens = await getParticipantTokens(options.players);
  await resolvePlayerProfiles(participantTokens);
  void flushExposures(authenticatedHeaders);
  const targetLanguage = options.gameLanguage ?? options.language ?? useLanguageStore.getState().language;
  const isBilingual = options.requireBilingual ?? (options.languageMode === "per-player");
  const response = await fetch("/api/questions", {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: await authenticatedHeaders(),
    body: JSON.stringify({
      count: options.count,
      category: options.category,
      subcategory: options.subcategory,
      difficulties: options.difficulties,
      ai: options.ai ?? false,
      requireBilingual: isBilingual,
      language: targetLanguage,
      gameLanguage: options.gameLanguage ?? (targetLanguage === "en" ? "en" : "fr"),
      languageMode: options.languageMode ?? (isBilingual ? "per-player" : "shared"),
      sessionId: options.sessionId,
      onlineSessionId: options.onlineSessionId,
      participantTokens,
      participantHistories: toParticipantHistories([...options.history, ...useHistoryStore.getState().entries], participantTokens),
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Impossible de charger les questions (${response.status})`);
  }
  return response.json() as Promise<QuestionPoolResponse>;
}

/** Appelée dès que la question devient visible, avant toute réponse. */
export async function markQuestionDisplayed(options: {
  question: Pick<Question, "id" | "familyId">;
  players: Player[];
  sessionId: string;
  onlineSessionId?: string;
}): Promise<void> {
  const participantTokens = await getParticipantTokens(options.players);
  useHistoryStore.getState().markSeen(
    options.question.id,
    options.question.familyId,
    participantTokens,
    options.sessionId,
  );
  useExposureOutbox.getState().enqueue({
    sessionId: options.sessionId,
    onlineSessionId: options.onlineSessionId,
    participantTokens,
    questionId: options.question.id,
    familyId: options.question.familyId,
  });
  try {
    await resolvePlayerProfiles(participantTokens);
    await flushExposures(authenticatedHeaders);
  } catch (error) {
    console.warn("[question-history] synchronisation différée:", error);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void flushExposures(authenticatedHeaders); });
  window.addEventListener("focus", () => { void flushExposures(authenticatedHeaders); });
}

export async function markQuestionAnswered(options: {
  question: Question;
  player: Player;
  sessionId: string;
  correct: boolean;
  responseTimeMs?: number;
}): Promise<void> {
  const participantTokens = await getParticipantTokens([options.player]);
  useHistoryStore.getState().addEntry({
    questionId: options.question.id,
    familyId: options.question.familyId,
    profileId: participantTokens[0],
    sessionId: options.sessionId,
    answeredCorrectly: options.correct,
    responseTimeMs: options.responseTimeMs,
  });
  try {
    await fetch("/api/questions/answer", {
      method: "POST",
      headers: await authenticatedHeaders(),
      body: JSON.stringify({
        sessionId: options.sessionId,
        participantToken: participantTokens[0],
        familyId: options.question.familyId,
        correct: options.correct,
      }),
    });
  } catch {
    // L'historique local reste l'autorité hors ligne et sera fusionné plus tard.
  }
}
