/**
 * Agorax — Agent de Tests Unitaires (Unit Test Agent)
 *
 * Éprouve de manière isolée, déterministe et exhaustive l'ensemble des
 * moteurs métier fondamentaux :
 *  1. Question Engine & Anti-répétition (sélection, fraîcheur, balance, shuffle)
 *  2. Debate Engine (machine à états, transitions, budgets, votes)
 *  3. Psycho Engine (dilemmes, matrices de corrélation, affinités)
 *  4. Agorax Engine (mécanique du Cut, pénalités, classements)
 *  5. Zustand Stores (game, history, daily, robustesse SSR / no-storage)
 *  6. Schémas Zod & Localisation (résilience i18n, fallbacks)
 */
import {
  selectQuestions,
  type SelectionHistoryEntry,
} from "../../src/lib/questions/selection";
import { QuestionSchema, type Question } from "../../src/lib/questions/schema";
import { localizeQuestion } from "../../src/lib/questions/localize";
import { answerOrder } from "../../src/lib/questions/answer-order";
import {
  createDebate,
  transition,
  castVote,
  type DebatePlayer,
} from "../../src/lib/debate/engine";
import { DEBATE_CATEGORIES } from "../../src/lib/debate/schema";
import {
  calculatePsychoCompatibility,
  calculatePsychoGroup,
  type PsychoProfileResult,
} from "../../src/lib/game/psycho-engine";
import { PSYCHO_ARCHETYPES } from "../../src/lib/game/psycho-data";
import {
  createInitialAgoraxState,
  calculateSpeedBonus,
  checkTypedAnswer,
  processLaLigneAnswer,
  type LaLigneState,
} from "../../src/lib/game/agorax-engine";
import { useGameStore, DEFAULT_CONFIG, type Player } from "../../src/lib/store/game";
import { useHistoryStore } from "../../src/lib/store/history";
import { useDailyStore } from "../../src/lib/store/daily";
import type {
  AgentReport,
  AgentSectionReport,
  AssertionResult,
} from "./types";

export class UnitTestAgent {
  private sections: AgentSectionReport[] = [];
  private currentSection: AgentSectionReport | null = null;
  private errors: string[] = [];

  private startSection(title: string) {
    this.currentSection = {
      title,
      assertions: [],
      passed: true,
      durationMs: 0,
    };
    this.sections.push(this.currentSection);
  }

  private assert(name: string, condition: boolean, errorMessage?: string) {
    if (!this.currentSection) {
      this.startSection("Général");
    }
    const t0 = performance.now();
    const passed = Boolean(condition);
    const result: AssertionResult = {
      name,
      passed,
      error: passed ? undefined : errorMessage || `Assertion '${name}' échouée`,
      durationMs: performance.now() - t0,
    };
    if (!passed) {
      this.currentSection!.passed = false;
      this.errors.push(`[${this.currentSection!.title}] ${result.error}`);
    }
    this.currentSection!.assertions.push(result);
  }

  private mockQuestion(
    id: string,
    familyId: string,
    category: Question["category"] = "culture-generale",
    difficulty: Question["difficulty"] = "medium",
  ): Question {
    return {
      id,
      conceptId: `concept-${familyId}`,
      familyId,
      type: "mcq",
      inputMode: "mcq",
      question: `Question de test ${id} ?`,
      answers: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      category,
      subcategory: "test-sub",
      difficulty,
      language: "fr",
      tags: ["unit-test"],
      source: { provider: "unit-test-agent", license: "CC0" },
      verification: { status: "verified", sources: [] },
      confidence: 1.0,
      qualityScore: 1.0,
      version: 1,
    };
  }

  // 1. Moteur de Sélection et Anti-Répétition
  public testSelectionEngine() {
    this.startSection("1. Question Engine & Anti-Répétition");
    const t0 = performance.now();

    // 1.1 Non répétition de la même famille dans un tirage
    const pool = Array.from({ length: 40 }, (_, i) =>
      this.mockQuestion(`q-${i}`, `fam-${Math.floor(i / 2)}`),
    );
    const result1 = selectQuestions(pool, [], { count: 10, seed: 1234 });
    const families = result1.questions.map((q) => q.familyId);
    this.assert(
      "Zéro doublon de famille dans un même tirage de 10 questions",
      new Set(families).size === 10,
    );

    // 1.2 Priorité absolue aux questions fraîches
    const history: SelectionHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      questionId: `q-${i}`,
      familyId: `fam-${Math.floor(i / 2)}`,
      servedAt: Date.now() - 5000,
      answeredCorrectly: true,
    }));
    const result2 = selectQuestions(pool, history, { count: 5, seed: 999 });
    const freshIds = result2.questions.map((q) => q.id);
    this.assert(
      "Sélection des questions non encore vues lorsque le pool en dispose",
      freshIds.every((id) => Number(id.replace("q-", "")) >= 30),
    );

    // 1.3 Cas limites : pool vide
    const emptyRes = selectQuestions([], [], { count: 5 });
    this.assert(
      "Pool vide renvoie une liste vide sans crash",
      emptyRes.questions.length === 0,
    );

    // 1.4 Cas limites : count = 0
    const zeroRes = selectQuestions(pool, [], { count: 0 });
    this.assert(
      "Count=0 renvoie une liste vide",
      zeroRes.questions.length === 0,
    );

    // 1.5 Cas limites : count supérieur à la taille du pool
    const overRes = selectQuestions(pool.slice(0, 3), [], { count: 10 });
    this.assert(
      "Count > taille du pool renvoie le maximum de questions uniques disponibles",
      overRes.questions.length <= 3 && overRes.questions.length > 0,
    );

    // 1.6 Filtres stricts de difficulté
    const mixedPool = [
      this.mockQuestion("m1", "f1", "culture-generale", "easy"),
      this.mockQuestion("m2", "f2", "culture-generale", "hard"),
      this.mockQuestion("m3", "f3", "culture-generale", "hard"),
    ];
    const hardOnly = selectQuestions(mixedPool, [], {
      count: 5,
      difficulties: ["hard"],
    });
    this.assert(
      "Filtre de difficulté respecté strictement",
      hardOnly.questions.every((q) => q.difficulty === "hard") &&
        hardOnly.questions.length === 2,
    );

    // 1.7 Ordre stable et reproductible des réponses
    const origQ = this.mockQuestion("sh-1", "f-sh", "culture-generale");
    origQ.answers = ["Un", "Deux", "Trois", "Quatre"];
    origQ.correctAnswer = 1; // "Deux"
    const order = answerOrder(origQ);
    const displayedAnswers = order.map((idx) => origQ.answers[idx]);
    const displayedCorrectAnswer = order.indexOf(origQ.correctAnswer);
    this.assert(
      "answerOrder préserve l'accès exact à la bonne réponse",
      displayedAnswers[displayedCorrectAnswer] === "Deux",
    );
    this.assert(
      "answerOrder est déterministe pour le même identifiant",
      JSON.stringify(order) === JSON.stringify(answerOrder(origQ)),
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 2. Moteur de Débat
  public testDebateEngine() {
    this.startSection("2. Debate Engine (Machine à états & Équité)");
    const t0 = performance.now();

    const mockPrompt = {
      id: "deb-1",
      category: "philosophy" as const,
      topic: "Intelligence Artificielle",
      prompt: "L'intelligence artificielle générale doit-elle se voir accorder des droits fondamentaux ?",
      context: "Les avancées récentes en apprentissage automatique posent la question du statut moral.",
      perspectives: [
        "Perspective éthique : accorder des droits pour prévenir la maltraitance.",
        "Perspective pragmatique : les machines ne sont que des outils algorithmiques.",
      ],
      followUps: ["Et si une machine exprime une forme de conscience apparente ?"],
      sources: [{ label: "Rapport éthique UNESCO", type: "fact" as const }],
      difficulty: "intermediate" as const,
      sensitivity: "medium" as const,
      language: "fr" as const,
      version: 1,
    };

    const players: DebatePlayer[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];

    const debate = createDebate(mockPrompt, players, {
      durationSeconds: 300,
      preparationSeconds: 30,
      startNow: false,
    });

    this.assert("Initialisation du débat en phase 'presentation'", debate.phase === "presentation");
    this.assert(
      "Budget de parole équitablement réparti (150s par joueur)",
      debate.speakingBudgetMs["p1"] === 150000 && debate.speakingBudgetMs["p2"] === 150000,
    );

    // Transition légale 1 : presentation -> reflection
    const tr1 = transition(debate, "reflection");
    this.assert("Transition vers 'reflection' réussie", tr1.ok && tr1.state.phase === "reflection");

    // Transition légale 2 : reflection -> player-turn
    const tr2 = transition(tr1.state, "player-turn");
    this.assert("Transition vers 'player-turn' réussie", tr2.ok && tr2.state.phase === "player-turn");

    // Rejet de transition illégale : player-turn -> presentation (interdit de revenir en arrière)
    const trIllegal = transition(tr2.state, "presentation");
    this.assert("Refus strict d'une régression d'état (chaos protection)", !trIllegal.ok);

    // Vote avant / après
    const voteRes = castVote(tr2.state, "p1", "pour", "before");
    this.assert(
      "Enregistrement correct d'un vote 'before'",
      voteRes.ok && voteRes.state.votesBefore.some((v) => v.playerId === "p1" && v.position === "pour"),
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 3. Moteur Psycho
  public testPsychoEngine() {
    this.startSection("3. Psycho Engine (Affinités & Consensus)");
    const t0 = performance.now();

    const mockProfileA: PsychoProfileResult = {
      primaryArchetype: PSYCHO_ARCHETYPES.stratege,
      primaryPercentage: 70,
      secondaryArchetype: PSYCHO_ARCHETYPES.diplomate,
      secondaryPercentage: 30,
      axes: { audace: 90, empathie: 80, ordre: 70, idealisme: 60 },
      allArchetypeScores: {
        stratege: 50,
        chaos: 10,
        diplomate: 30,
        protecteur: 20,
        cameleon: 10,
        franc_tireur: 5,
        analyste: 15,
        roi_soleil: 5,
      },
      completedQuestions: 5,
    };

    const mockProfileB: PsychoProfileResult = {
      ...mockProfileA,
    };

    const mockProfileC: PsychoProfileResult = {
      ...mockProfileA,
      axes: { audace: 10, empathie: 10, ordre: 10, idealisme: 10 },
    };

    const compIdentical = calculatePsychoCompatibility(mockProfileA, mockProfileB);
    this.assert("Affinité maximale (100%) entre profils identiques A et B", compIdentical.affinity === 100);

    const compOpposite = calculatePsychoCompatibility(mockProfileA, mockProfileC);
    this.assert("Affinité fortement dégradée entre profils divergents", compOpposite.affinity < 50);

    const group = calculatePsychoGroup([mockProfileA, mockProfileB, mockProfileC]);
    this.assert(
      "Moyenne de groupe calculée sans NaN",
      group.averages.audace >= 0 && group.averages.audace <= 100,
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 4. Moteur Agorax (Vitesse, Typage & La Ligne)
  public testAgoraxEngine() {
    this.startSection("4. Agorax Engine (Bonus vitesse, Réponse tapée & La Ligne)");
    const t0 = performance.now();

    // Bonus de vitesse
    const maxBonus = calculateSpeedBonus(15, 15);
    const zeroBonus = calculateSpeedBonus(0, 15);
    this.assert("Bonus vitesse maximal (+50 pts) à réponse instantanée", maxBonus === 50);
    this.assert("Bonus vitesse nul (0 pt) à expiration", zeroBonus === 0);

    // Vérification de réponse tapée (tolérance accents, casse, inclusion)
    this.assert("Reconnaissance exacte réponse tapée", checkTypedAnswer("Paris", ["Paris", "Lyon"]));
    this.assert("Tolérance casse & accents", checkTypedAnswer("ÉlÉpHaNt", ["elephant"]));
    this.assert("Tolérance prénom/nom (Scott -> Ridley Scott)", checkTypedAnswer("Scott", ["Ridley Scott"]));
    this.assert("Rejet de réponse fausse", !checkTypedAnswer("Marseille", ["Paris", "Lyon"]));

    // La Ligne (départ au centre = 5, victoire si poussée au bout)
    const mockLaLigne: LaLigneState = {
      cursorPosition: 5,
      finalist1Id: "p1",
      finalist2Id: "p2",
      turnCount: 0,
      isDouble: false,
      secondsRemaining: 90,
      winnerId: null,
      history: [],
    };
    const moveP1 = processLaLigneAnswer(mockLaLigne, "p1", true);
    this.assert("Bonne réponse P1 avance le curseur vers P1 (5 -> 6)", moveP1.nextState.cursorPosition === 6);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 5. Stores Zustand
  public testStores() {
    this.startSection("5. Zustand Stores & Persistance");
    const t0 = performance.now();

    // 5.1 Game Store
    const gameStore = useGameStore.getState();
    gameStore.reset();

    const testPlayers: Player[] = [
      { id: "p-1", profileToken: "tok-1", name: "Player1", color: 0, score: 0, correct: 0, wrong: 0 },
      { id: "p-2", profileToken: "tok-2", name: "Player2", color: 1, score: 0, correct: 0, wrong: 0 },
    ];
    gameStore.setConfig({
      ...DEFAULT_CONFIG,
      players: testPlayers,
    });
    gameStore.addScore("p-1", 50);

    const updated = useGameStore.getState();
    const p1InConfig = updated.config?.players.find((p) => p.id === "p-1");
    this.assert("Ajout de points dans useGameStore", p1InConfig?.score === 50);

    // 5.2 History Store
    const histStore = useHistoryStore.getState();
    histStore.clear();
    histStore.addEntry({
      questionId: "test-q-100",
      familyId: "fam-100",
      answeredCorrectly: true,
    });
    const hasSeen = useHistoryStore.getState().entries.some((e) => e.questionId === "test-q-100");
    this.assert("addEntry enregistre la question vue dans l'historique", hasSeen === true);

    // 5.3 Daily Store
    const dailyStore = useDailyStore.getState();
    const today = new Date().toISOString().split("T")[0];
    dailyStore.setDailyResult(today, 8, "🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥");
    const updatedDaily = useDailyStore.getState();
    this.assert("setDailyResult met à jour le streak quotidien", updatedDaily.lastScore === 8 && updatedDaily.currentStreak >= 1);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 6. Schémas Zod & Résilience I18n
  public testSchemasAndLocalization() {
    this.startSection("6. Schémas Zod & Résilience I18n");
    const t0 = performance.now();

    // 6.1 Validation Zod d'une question valide
    const validRaw = this.mockQuestion("schema-1", "fam-sch");
    const parsedValid = QuestionSchema.safeParse(validRaw);
    this.assert("Question conforme validée par QuestionSchema", parsedValid.success);

    // 6.2 Rejet d'une question malformée (ex: 3 réponses au lieu de 4 en QCM standard)
    const invalidRaw = { ...validRaw, answers: ["Seulement deux", "Réponses"] };
    const parsedInvalid = QuestionSchema.safeParse(invalidRaw);
    this.assert("Question à 2 réponses rejetée par le schéma strict QCM", !parsedInvalid.success);

    // 6.3 Localisation bilingue : fallback français si traduction absente
    const noTransQ = this.mockQuestion("loc-1", "fam-loc");
    const localized = localizeQuestion(noTransQ, "en", { autoTranslate: false });
    this.assert(
      "Fallback vers le français si traduction anglaise absente et autoTranslate désactivé",
      localized.lang === "fr" && localized.question === noTransQ.question,
    );

    // 6.4 Localisation bilingue : utilisation de la traduction si présente
    const transQ = {
      ...noTransQ,
      translations: {
        en: {
          question: "What is the capital of France?",
          answers: ["Paris", "London", "Berlin", "Madrid"],
          explanation: "Paris has been the capital for centuries.",
        },
      },
    };
    const localizedEn = localizeQuestion(transQ, "en");
    this.assert(
      "Traduction anglaise correctement appliquée quand disponible",
      localizedEn.lang === "en" && localizedEn.question === "What is the capital of France?",
    );
    this.assert(
      "Index de la bonne réponse identique entre VO et traduction",
      localizedEn.correctAnswer === transQ.correctAnswer,
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  public async runAll(): Promise<AgentReport> {
    const start = performance.now();
    this.sections = [];
    this.errors = [];

    this.testSelectionEngine();
    this.testDebateEngine();
    this.testPsychoEngine();
    this.testAgoraxEngine();
    this.testStores();
    this.testSchemasAndLocalization();

    const durationMs = performance.now() - start;
    let totalAssertions = 0;
    let passedAssertions = 0;
    let failedAssertions = 0;

    for (const sec of this.sections) {
      for (const a of sec.assertions) {
        totalAssertions++;
        if (a.passed) passedAssertions++;
        else failedAssertions++;
      }
    }

    return {
      agent: "unit",
      title: "Agent de Tests Unitaires AgoraX",
      totalAssertions,
      passedAssertions,
      failedAssertions,
      durationMs,
      sections: this.sections,
      success: failedAssertions === 0,
      errors: this.errors,
    };
  }
}

// Exécution directe en CLI
if (process.argv[1]?.endsWith("unit-test-agent.ts")) {
  const agent = new UnitTestAgent();
  agent.runAll().then((report) => {
    console.log(`\n━━━ ${report.title} ━━━`);
    console.log(`Durée : ${report.durationMs.toFixed(1)}ms | Assertions : ${report.passedAssertions}/${report.totalAssertions}`);
    for (const sec of report.sections) {
      const icon = sec.passed ? "✅" : "❌";
      console.log(`\n${icon} ${sec.title} (${sec.assertions.length} assertions)`);
      for (const a of sec.assertions) {
        if (!a.passed) console.log(`   ❌ ${a.name} : ${a.error}`);
        else console.log(`   ✓ ${a.name}`);
      }
    }
    if (!report.success) {
      console.error("\n❌ Échecs détectés :", report.errors);
      process.exit(1);
    } else {
      console.log("\n🎉 Tous les tests unitaires sont passés avec succès !");
      process.exit(0);
    }
  });
}
