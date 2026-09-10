import { NextResponse } from "next/server";
import { z } from "zod";
import { loadQuestions } from "@/lib/questions/load";
import { generateQuestionsWithDeepSeek, isDeepSeekEnabled } from "@/lib/questions/deepseek";
import { isKnowledgeDuplicate } from "@/lib/questions/dedupe";
import { getUnseenQuestions, type ParticipantHistory } from "@/lib/questions/question-selection-service";
import { consumeRateLimit, consumeAuthenticatedAiQuota, getRequestClientKey } from "@/lib/server/request-security";
import { getRequestSupabase } from "@/lib/supabase/request";
import type { Question, QuestionCategory, QuestionDifficulty } from "@/lib/questions/schema";

const HistoryEntrySchema = z.object({
  questionId: z.string(),
  familyId: z.string(),
  servedAt: z.number(),
  answeredCorrectly: z.boolean().nullable(),
});

const RequestSchema = z.object({
  count: z.number().int().min(1).max(60).default(10),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  difficulties: z.array(z.enum(["easy", "medium", "hard", "expert"])).optional(),
  requireBilingual: z.boolean().optional().default(false),
  ai: z.boolean().default(false),
  language: z.enum(["fr", "en"]).default("fr"),
  gameLanguage: z.enum(["fr", "en"]).optional(),
  languageMode: z.enum(["shared", "per-player"]).optional(),
  sessionId: z.string().uuid().optional(),
  onlineSessionId: z.string().uuid().optional(),
  participantTokens: z.array(z.string().min(12).max(200)).min(1).max(8).optional(),
  participantHistories: z.array(z.object({
    profileId: z.string().optional(),
    entries: z.array(HistoryEntrySchema).max(100_000),
  })).max(8).optional(),
  history: z.array(HistoryEntrySchema).max(100_000).default([]),
});

type RemoteSupabase = NonNullable<ReturnType<typeof getRequestSupabase>>;

function uniqueFamilies(questions: Question[]): Question[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const family = question.familyId.toLowerCase();
    if (seen.has(family)) return false;
    seen.add(family);
    return true;
  });
}

async function reserveRemotely(options: {
  supabase: RemoteSupabase;
  sessionId: string;
  onlineSessionId?: string;
  participantTokens: string[];
  candidates: Question[];
  count: number;
  participantHistories: ParticipantHistory[];
}): Promise<Question[]> {
  if (options.count <= 0 || options.candidates.length === 0) return [];
  const { data, error } = await options.supabase.rpc("reserve_unseen_questions", {
    p_session_id: options.sessionId,
    p_device_tokens: options.participantTokens,
    p_online_session_id: options.onlineSessionId ?? null,
    p_candidates: options.candidates,
    p_count: options.count,
    p_local_history: options.participantHistories,
    p_ttl_seconds: 900,
  });
  if (error) throw error;
  return (data ?? []).map((row: { question?: Question } | Question) =>
    "question" in row && row.question ? row.question : row,
  ) as Question[];
}

function stagePools(
  pool: Question[],
  category: QuestionCategory | "mixed",
  difficulties?: QuestionDifficulty[],
  subcategory?: string,
): Question[][] {
  const categoryPool = category === "mixed" ? pool : pool.filter((question) => question.category === category);
  const subcategoryPool = subcategory
    ? categoryPool.filter(
        (q) =>
          q.subcategory?.toLowerCase() === subcategory.toLowerCase() ||
          q.tags?.some((t) => t.toLowerCase() === subcategory.toLowerCase()),
      )
    : null;

  const targetPool = subcategoryPool && subcategoryPool.length > 0 ? subcategoryPool : categoryPool;

  const exact = difficulties?.length
    ? targetPool.filter((question) => difficulties.includes(question.difficulty))
    : targetPool;
  const neighborRanks = new Set<number>();
  const order: QuestionDifficulty[] = ["easy", "medium", "hard", "expert"];
  for (const difficulty of difficulties ?? []) {
    const rank = order.indexOf(difficulty);
    neighborRanks.add(rank);
    if (rank > 0) neighborRanks.add(rank - 1);
    if (rank < order.length - 1) neighborRanks.add(rank + 1);
  }
  const neighbor = difficulties?.length
    ? targetPool.filter((question) => neighborRanks.has(order.indexOf(question.difficulty)))
    : targetPool;

  const parentFallback = subcategoryPool ? categoryPool : [];

  const compatible = difficulties?.length
    ? pool.filter((question) => neighborRanks.has(order.indexOf(question.difficulty)))
    : pool;

  return (subcategoryPool ? [exact, neighbor, parentFallback, compatible] : [exact, neighbor, compatible]).map(
    uniqueFamilies,
  );
}

export async function POST(request: Request) {
  const clientKey = getRequestClientKey(request);
  const publicLimit = consumeRateLimit(`questions:${clientKey}`, 60, 60_000);
  if (!publicLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessaie dans un instant" },
      { status: 429, headers: { "Retry-After": String(publicLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide", details: parsed.error.issues }, { status: 400 });
  }

  const { count, category, subcategory, difficulties, ai, onlineSessionId, participantTokens, participantHistories, history } = parsed.data;
  const requestedLanguage = parsed.data.gameLanguage ?? parsed.data.language;
  const languageMode = parsed.data.languageMode ?? (parsed.data.requireBilingual ? "per-player" : "shared");
  const isBilingualRequired = parsed.data.requireBilingual || languageMode === "per-player";
  const sessionId = parsed.data.sessionId ?? crypto.randomUUID();
  const cat = (category ?? "mixed") as QuestionCategory | "mixed";
  const histories: ParticipantHistory[] = participantHistories?.length ? participantHistories : [{ entries: history }];

  // Le catalogue doit suivre la langue demandée. Défense en profondeur : la question
  // doit correspondre rigoureusement à la langue demandée.
  const localizedPool = loadQuestions(requestedLanguage).questions;
  const localPool = localizedPool
    .filter(q => q.verification?.status !== "disputed" && q.language === requestedLanguage)
    .map((q) => ({ ...q, translations: { ...q.translations } }));

  // Les variantes traduites ne sont obligatoires qu'en mode par joueur. Une partie
  // en ligne en langue partagée doit rester strictement dans gameLanguage.
  const alternateLanguage = requestedLanguage === "fr" ? "en" : "fr";
  const alternateById = new Map(loadQuestions(alternateLanguage).questions.map((q) => [q.id, q]));
  for (const question of localPool) {
    const alternate = alternateById.get(question.id);
    if (alternate && alternate.correctAnswer === question.correctAnswer && alternate.answers.length === question.answers.length) {
      question.translations = {
        ...(question.translations ?? {}),
        [alternateLanguage]: { question: alternate.question, answers: alternate.answers, explanation: alternate.explanation },
      };
    }
  }

  const supabase = participantTokens?.length ? getRequestSupabase(request) : null;
  const eligiblePool = isBilingualRequired
    ? localPool.filter((q) => q.translations?.[alternateLanguage]?.answers?.length === q.answers.length)
    : localPool;
  const stages = stagePools(eligiblePool, cat, difficulties, subcategory);

  let questions: Question[] = [];
  let fallbackStage = "exact";
  let remoteEnabled = Boolean(supabase && participantTokens?.length);
  if (remoteEnabled && supabase && participantTokens) {
    try {
      const labels = subcategory
        ? ["exact", "neighbor_difficulty", "category_fallback", "compatible_categories"]
        : ["exact", "neighbor_difficulty", "compatible_categories"];
      for (let index = 0; index < stages.length && questions.length < count; index++) {
        const selected = await reserveRemotely({
          supabase, sessionId, onlineSessionId, participantTokens,
          candidates: stages[index], count: count - questions.length, participantHistories: histories,
        });
        questions.push(...selected.filter((candidate) => !questions.some((q) => q.familyId === candidate.familyId)));
        if (selected.length > 0) fallbackStage = labels[index];
      }
    } catch (error) {
      remoteEnabled = false;
      console.error("[QUESTION_SELECTION] réservation distante indisponible:", error);
    }
  }

  if (!remoteEnabled) {
    const result = getUnseenQuestions({
      pool: eligiblePool,
      participantHistories: histories,
      count,
      language: requestedLanguage,
      requireBilingual: isBilingualRequired,
      categories: cat === "mixed" ? undefined : [cat],
      subcategories: subcategory ? [subcategory] : undefined,
      difficulties,
      progressiveFallback: true,
    });
    questions = result.questions;
    fallbackStage = result.fallbackStage;
  }

  let aiGenerated = false;
  let aiSkipped: "authentication_required" | "rate_limited" | "unavailable" | "bilingual_required" | undefined;
  if (questions.length < count && ai) {
    // Le générateur produit une seule langue par appel. En partie bilingue, mieux vaut
    // signaler un pool incomplet que servir une question impossible à localiser.
    if (isBilingualRequired) aiSkipped = "bilingual_required";
    else if (!isDeepSeekEnabled()) aiSkipped = "unavailable";
    else {
      const quota = await consumeAuthenticatedAiQuota(request);
      if (!quota.authenticated) aiSkipped = "authentication_required";
      else if (!quota.allowed) aiSkipped = "rate_limited";
      else {
        const aiLimit = consumeRateLimit(`questions-ai-client:${clientKey}`, 6, 10 * 60_000);
        if (!aiLimit.allowed) aiSkipped = "rate_limited";
        else {
          try {
            const generated = await generateQuestionsWithDeepSeek(Math.min((count - questions.length) * 2, 12), cat, requestedLanguage);
            const deduplicated = generated.filter((candidate, index, all) =>
              candidate.language === requestedLanguage &&
              !isKnowledgeDuplicate(candidate, localPool) &&
              !isKnowledgeDuplicate(candidate, questions) &&
              !isKnowledgeDuplicate(candidate, all.slice(0, index)),
            );
            const additions = remoteEnabled && supabase && participantTokens
              ? await reserveRemotely({
                  supabase, sessionId, onlineSessionId, participantTokens,
                  candidates: deduplicated, count: count - questions.length, participantHistories: histories,
                })
              : getUnseenQuestions({
                  pool: deduplicated,
                  participantHistories: histories,
                  count: count - questions.length,
                  language: requestedLanguage,
                  progressiveFallback: false,
                }).questions;
            questions.push(...additions);
            aiGenerated = additions.length > 0;
          } catch (error) {
            aiSkipped = "unavailable";
            console.error("[QUESTION_SELECTION] génération IA indisponible:", error);
          }
        }
      }
    }
  }

  const poolExhausted = questions.length < count;
  console.info("[QUESTION_SELECTION]", {
    players: participantTokens?.length ?? histories.length,
    requested: count,
    candidatesInitial: eligiblePool.length,
    selected: questions.length,
    fallbackStage,
    poolExhausted,
    remoteEnabled,
    aiGenerated,
  });

  return NextResponse.json({
    questions,
    requested: count,
    available: questions.length,
    returned: questions.length,
    poolExhausted,
    reason: poolExhausted ? "INSUFFICIENT_UNSEEN_QUESTIONS" : undefined,
    fallbackStage,
    aiGenerated,
    aiSkipped,
  });
}
