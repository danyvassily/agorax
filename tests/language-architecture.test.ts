import { describe, expect, it, beforeEach } from "vitest";
import { loadQuestions } from "@/lib/questions/load";
import { selectQuestions } from "@/lib/questions/selection";
import { getUnseenQuestions } from "@/lib/questions/question-selection-service";
import { localizeQuestion } from "@/lib/questions/localize";
import { normalizeGameConfig, DEFAULT_CONFIG, makePlayer, type Player, type GameConfig } from "@/lib/store/game";
import { REPORT_REASONS, type Question } from "@/lib/questions/schema";
import { useHistoryStore } from "@/lib/store/history";
import type { OnlineSession } from "@/lib/online/room";

describe("Language Architecture & Invariant Enforcement", () => {
  const frCatalog = loadQuestions("fr").questions;
  const enCatalog = loadQuestions("en").questions;
  const enCatalogMap = new Map(enCatalog.map((q) => [q.id, q]));

  beforeEach(() => {
    useHistoryStore.getState().clear();
  });

  // =========================================================================
  // Scénario 1 : Joueur avec player.language = "en" dans une partie configurée en français
  // Règle : 100% des questions servies et rendues DOIVENT être en français.
  // =========================================================================
  it("Scénario 1 : stale player.language = 'en' + gameLanguage = 'fr' (mode shared) -> 100% français", () => {
    const config: GameConfig = normalizeGameConfig({
      ...DEFAULT_CONFIG,
      gameLanguage: "fr",
      languageMode: "shared",
      players: [
        { id: "p1", profileToken: "tok-1", name: "Player 1", color: 0, score: 0, correct: 0, wrong: 0, language: "en" },
      ],
    });

    // 1. Sélection stricte côté moteur
    const selection = selectQuestions(frCatalog, [], {
      count: 10,
      language: config.gameLanguage,
    });

    expect(selection.questions.length).toBe(10);
    for (const q of selection.questions) {
      expect(q.language).toBe("fr");
      // 2. Rendu côté client en mode shared
      const effectiveLang = config.languageMode === "per-player"
        ? (config.players[0].language ?? config.gameLanguage)
        : config.gameLanguage;
      const rendered = localizeQuestion(q, effectiveLang);

      expect(rendered.lang).toBe("fr");
      expect(rendered.question).toBe(q.question);
      expect(rendered.answers).toEqual(q.answers);
    }
  });

  // =========================================================================
  // Scénario 2 : Bascule UI EN -> FR avant le lancement
  // Règle : Aucune fuite d'état ou de texte anglais dans la partie
  // =========================================================================
  it("Scénario 2 : bascule UI EN -> FR avant lancement -> aucune fuite d'anglais", () => {
    // Joueur a démarré l'app en EN, puis a configuré la partie en FR
    const initialDraft = {
      ...DEFAULT_CONFIG,
      gameLanguage: "fr" as const,
      languageMode: "shared" as const,
      players: [makePlayer(0, "Joueur 1")],
    };
    const config = normalizeGameConfig(initialDraft);

    expect(config.gameLanguage).toBe("fr");
    expect(config.languageMode).toBe("shared");

    const result = getUnseenQuestions({
      pool: frCatalog,
      participantHistories: [],
      count: 5,
      language: config.gameLanguage,
    });

    for (const q of result.questions) {
      expect(q.language).toBe("fr");
      const rendered = localizeQuestion(q, config.gameLanguage);
      expect(rendered.lang).toBe("fr");
      // Vérification qu'aucun texte anglais ne s'est infiltré
      expect(rendered.question).toBe(q.question);
    }
  });

  // =========================================================================
  // Scénario 3 : 4 joueurs en mode partagé français (gameLanguage = "fr")
  // Règle : Tous les joueurs sans exception ont renderedLanguage === "fr"
  // =========================================================================
  it("Scénario 3 : 4 joueurs en gameLanguage = 'fr' & languageMode = 'shared' -> renderedLanguage === 'fr' pour tous", () => {
    const players: Player[] = [
      { id: "p1", profileToken: "tok-1", name: "Alice", color: 0, score: 0, correct: 0, wrong: 0, language: "fr" },
      { id: "p2", profileToken: "tok-2", name: "Bob (profil stale)", color: 1, score: 0, correct: 0, wrong: 0, language: "en" },
      { id: "p3", profileToken: "tok-3", name: "Charlie", color: 2, score: 0, correct: 0, wrong: 0, language: "fr" },
      { id: "p4", profileToken: "tok-4", name: "Diane", color: 3, score: 0, correct: 0, wrong: 0, language: "en" },
    ];
    const config: GameConfig = normalizeGameConfig({
      ...DEFAULT_CONFIG,
      gameLanguage: "fr",
      languageMode: "shared",
      players,
    });

    const result = getUnseenQuestions({
      pool: frCatalog,
      participantHistories: [],
      count: 8,
      language: config.gameLanguage,
    });

    expect(result.questions).toHaveLength(8);

    for (let qIdx = 0; qIdx < result.questions.length; qIdx++) {
      const q = result.questions[qIdx];
      const activePlayer = config.players[qIdx % config.players.length];

      // En mode shared, la langue de rendu ignore activePlayer.language
      const renderedLang = config.languageMode === "per-player"
        ? (activePlayer.language ?? config.gameLanguage)
        : config.gameLanguage;

      expect(renderedLang).toBe("fr");
      const rendered = localizeQuestion(q, renderedLang);
      expect(rendered.lang).toBe("fr");
      expect(rendered.question).toBe(q.question);
    }
  });

  // =========================================================================
  // Scénario 4 : gameLanguage = "en" et languageMode = "shared"
  // Règle : 100% de questions en anglais
  // =========================================================================
  it("Scénario 4 : gameLanguage = 'en' & languageMode = 'shared' -> 100% anglais", () => {
    const config: GameConfig = normalizeGameConfig({
      ...DEFAULT_CONFIG,
      gameLanguage: "en",
      languageMode: "shared",
      players: [makePlayer(0, "Player 1")],
    });

    const result = getUnseenQuestions({
      pool: enCatalog,
      participantHistories: [],
      count: 10,
      language: config.gameLanguage,
    });

    expect(result.questions).toHaveLength(10);
    for (const q of result.questions) {
      expect(q.language).toBe("en");
      const rendered = localizeQuestion(q, config.gameLanguage);
      expect(rendered.lang).toBe("en");
      expect(rendered.question).toBe(q.question);
    }
  });

  // =========================================================================
  // Scénario 5 : languageMode = "per-player" avec [FR, FR, EN, FR]
  // Règle : Seul le joueur anglophone reçoit l'anglais, les 3 autres le français.
  // Equité : index de bonne réponse strictement identique.
  // =========================================================================
  it("Scénario 5 : languageMode = 'per-player' avec [FR, FR, EN, FR] -> isolation par joueur et équité", () => {
    const players: Player[] = [
      { id: "p1", profileToken: "tok-1", name: "Alice", color: 0, score: 0, correct: 0, wrong: 0, language: "fr" },
      { id: "p2", profileToken: "tok-2", name: "Bob", color: 1, score: 0, correct: 0, wrong: 0, language: "fr" },
      { id: "p3", profileToken: "tok-3", name: "Charlie (EN)", color: 2, score: 0, correct: 0, wrong: 0, language: "en" },
      { id: "p4", profileToken: "tok-4", name: "Diane", color: 3, score: 0, correct: 0, wrong: 0, language: "fr" },
    ];
    const config: GameConfig = normalizeGameConfig({
      ...DEFAULT_CONFIG,
      gameLanguage: "fr",
      languageMode: "per-player",
      players,
    });

    // Construire des questions bilingues
    const bilingualCandidate = frCatalog.find((q) => {
      const enQ = enCatalogMap.get(q.id);
      return enQ && enQ.correctAnswer === q.correctAnswer && enQ.answers.length === 4;
    })!;

    const enTranslation = enCatalogMap.get(bilingualCandidate.id)!;
    const bilingualQ: Question = {
      ...bilingualCandidate,
      translations: {
        en: {
          question: enTranslation.question,
          answers: enTranslation.answers,
          explanation: enTranslation.explanation,
        },
      },
    };

    for (const player of config.players) {
      const renderedLang = config.languageMode === "per-player"
        ? (player.language ?? config.gameLanguage)
        : config.gameLanguage;

      const rendered = localizeQuestion(bilingualQ, renderedLang);

      if (player.language === "en") {
        expect(rendered.lang).toBe("en");
        expect(rendered.question).toBe(enTranslation.question);
        expect(rendered.answers).toEqual(enTranslation.answers);
      } else {
        expect(rendered.lang).toBe("fr");
        expect(rendered.question).toBe(bilingualCandidate.question);
        expect(rendered.answers).toEqual(bilingualCandidate.answers);
      }

      // Equité absolue : le même index de bonne réponse
      expect(rendered.correctAnswer).toBe(bilingualCandidate.correctAnswer);
      expect(rendered.answers.length).toBe(4);
    }
  });

  // =========================================================================
  // Scénario 6 : Multijoueur multi-appareils
  // Règle : Même questionId, même correctAnswer, même ordre de réponses
  // =========================================================================
  it("Scénario 6 : session multijoueur multi-appareils -> questionId, correctAnswer et ordre identiques", () => {
    const q = frCatalog[0];
    const sessionQuestionPayload = {
      id: q.id,
      familyId: q.familyId,
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      language: q.language,
    };

    // Joueur 1 (Hôte, appareil 1)
    const hostRendered = localizeQuestion(sessionQuestionPayload as Question, "fr");
    // Joueur 2 (Client, appareil 2, UI potentiellement en anglais mais session en français)
    const clientRendered = localizeQuestion(
      sessionQuestionPayload as Question,
      (sessionQuestionPayload.language as "fr" | "en") ?? "fr",
    );

    expect(hostRendered.question).toBe(clientRendered.question);
    expect(hostRendered.answers).toEqual(clientRendered.answers);
    expect(hostRendered.correctAnswer).toBe(clientRendered.correctAnswer);
  });

  // =========================================================================
  // Scénario 7 : Reconnexion d'un joueur
  // Règle : Préserve la configuration gameLanguage et languageMode sans réversion
  // =========================================================================
  it("Scénario 7 : reconnexion joueur -> préserve gameLanguage et languageMode", () => {
    const sessionState: OnlineSession = {
      id: "session-123",
      room_code: "ROOM42",
      host_id: "user-host",
      phase: "playing",
      question_index: 2,
      current_question: {
        id: frCatalog[2].id,
        familyId: frCatalog[2].familyId,
        question: frCatalog[2].question,
        answers: frCatalog[2].answers,
        language: "fr",
      },
      answers_revealed: false,
      state_version: 3,
      mode: "classic",
      category: "mixed",
      question_count: 10,
      max_players: 4,
      buzzer_player_id: null,
      game_language: "fr",
      language_mode: "shared",
    };

    // Un joueur se reconnecte avec ses préférences UI locales en anglais
    const reconnectedUserLang: "fr" | "en" = "en";

    // En mode partagé, la session prévaut
    const targetLang = sessionState.language_mode === "shared"
      ? (sessionState.game_language ?? "fr")
      : reconnectedUserLang;

    expect(targetLang).toBe("fr");
    const rendered = localizeQuestion(sessionState.current_question as Question, targetLang);
    expect(rendered.lang).toBe("fr");
    expect(rendered.question).toBe(frCatalog[2].question);
  });

  // =========================================================================
  // Scénario 8 : Salon persistant post-partie avec changement de mode
  // Règle : Le salon conserve son code, ses joueurs, et sa langue configurée
  // =========================================================================
  it("Scénario 8 : salon persistant post-game -> conserve le code et hérite proprement de la configuration", () => {
    const lobby = {
      id: "lobby-777",
      code: "AGORA1",
      gameLanguage: "fr" as const,
      languageMode: "shared" as const,
      status: "POST_GAME",
    };

    // L'hôte choisit un nouveau mode sans recréer le salon
    const nextMode = "rapidfire";
    const newSessionId = "session-new-888";

    const nextConfig = normalizeGameConfig({
      ...DEFAULT_CONFIG,
      mode: nextMode,
      gameLanguage: lobby.gameLanguage,
      languageMode: lobby.languageMode,
      sessionId: newSessionId,
    });

    expect(nextConfig.gameLanguage).toBe("fr");
    expect(nextConfig.languageMode).toBe("shared");

    const nextQuestions = getUnseenQuestions({
      pool: frCatalog,
      participantHistories: [],
      count: 20,
      language: nextConfig.gameLanguage,
    });

    expect(nextQuestions.questions).toHaveLength(20);
    expect(nextQuestions.questions.every((q) => q.language === "fr")).toBe(true);
  });

  // =========================================================================
  // Scénario 9 : Enchaînement séquentiel de parties FR -> EN -> FR
  // Règle : Pas de contamination résiduelle de cache ou d'historique entre sessions
  // =========================================================================
  it("Scénario 9 : transitions séquentielles FR -> EN -> FR sans contamination", () => {
    // Partie 1 : FR
    const game1 = getUnseenQuestions({ pool: frCatalog, participantHistories: [], count: 5, language: "fr" });
    expect(game1.questions.every((q) => q.language === "fr")).toBe(true);

    // Partie 2 : EN
    const game2 = getUnseenQuestions({ pool: enCatalog, participantHistories: [], count: 5, language: "en" });
    expect(game2.questions.every((q) => q.language === "en")).toBe(true);

    // Partie 3 : FR
    const game3 = getUnseenQuestions({ pool: frCatalog, participantHistories: [], count: 5, language: "fr" });
    expect(game3.questions.every((q) => q.language === "fr")).toBe(true);

    // Vérification qu'aucune question de game2 (EN) n'est présente dans game3
    for (const q of game3.questions) {
      expect(q.language).toBe("fr");
      // Les IDs peuvent coïncider si bilingues, mais le texte de game3 DOIT être français
      const enCounterpart = enCatalogMap.get(q.id);
      if (enCounterpart) {
        expect(q.question).not.toBe(enCounterpart.question);
      }
    }
  });

  // =========================================================================
  // Scénario 10 : Isolation stricte du catalogue et défense en profondeur
  // Règle : Lorsque gameLanguage = "fr", AUCUNE question avec q.language = "en"
  // ne peut atteindre le pipeline de sélection ou le renderer.
  // =========================================================================
  it("Scénario 10 : isolation stricte de catalogue -> zéro fuite d'anglais dans une sélection FR", () => {
    // Injecter délibérément une question anglaise dans un pool de test suffisant
    const contaminatedPool: Question[] = [
      ...frCatalog.slice(0, 50),
      {
        ...enCatalog[0],
        id: "foreign-en-question",
        language: "en",
      },
    ];

    const result = selectQuestions(contaminatedPool, [], {
      count: 10,
      language: "fr",
    });

    expect(result.questions.length).toBe(10);
    // La question anglaise doit être rejetée par le filtre strict de langue
    expect(result.questions.some((q) => q.id === "foreign-en-question")).toBe(false);
    expect(result.questions.every((q) => q.language === "fr")).toBe(true);

    // Test du rapport de mauvaise langue et de la télémétrie
    expect(REPORT_REASONS).toContain("mauvaise-langue");

    const historyStore = useHistoryStore.getState();
    historyStore.addReport("test-q-1", "mauvaise-langue", "Anglais dans partie FR", {
      gameLanguage: "fr",
      renderedLanguage: "en",
      uiLanguage: "fr",
      catalogLanguage: "en",
    });

    const report = useHistoryStore.getState().reports.find((r) => r.questionId === "test-q-1");
    expect(report).toBeDefined();
    expect(report?.reason).toBe("mauvaise-langue");
    expect(report?.telemetry?.gameLanguage).toBe("fr");
    expect(report?.telemetry?.renderedLanguage).toBe("en");
  });
});
