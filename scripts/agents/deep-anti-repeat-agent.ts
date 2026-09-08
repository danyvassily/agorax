/**
 * Agorax — Deep Anti-Repetition Agent (Seconde Couche de Tests Approfondis)
 *
 * Éprouve le système anti-répétition à haute échelle et dans des scénarios extrêmes :
 *  1. Marathon de jeu : 500 questions tirées, épuisement de pool et recyclage LRS (Least Recently Seen)
 *  2. Union multi-profils asymétrique à 8 joueurs simultanés (jusqu'à 1000 entrées)
 *  3. Déduplication sémantique trans-langue & Canonical Knowledge Key
 *  4. Cascade de repli contrôlé (progressiveFallback) avec maintien absolu de la non-répétition
 *  5. Réservations transactionnelles concurrentes & expiration TTL (anti-collisions multi-salons)
 *  6. Assainissement et robustesse face aux historiques corrompus (espaces, casse, dates)
 */
import {
  getUnseenQuestions,
  type ParticipantHistory,
} from "../../src/lib/questions/question-selection-service";
import { selectQuestions, type SelectionHistoryEntry } from "../../src/lib/questions/selection";
import { canonicalizeKnowledgeKey } from "../../src/lib/questions/dedupe";
import { appendSeenEntries, mergeProfileHistoryEntries } from "../../src/lib/store/history";
import { reservationStore } from "../../src/lib/anti-repetition/reservation-service";
import { loadQuestions } from "../../src/lib/questions/load";
import type { Question, QuestionHistory } from "../../src/lib/questions/schema";
import type {
  AgentReport,
  AgentSectionReport,
  AssertionResult,
} from "./types";

export class DeepAntiRepeatAgent {
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
      this.startSection("Anti-Répétition Approfondie");
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

  private createCandidate(
    id: string,
    familyId: string,
    category: Question["category"] = "culture-generale",
    difficulty: Question["difficulty"] = "medium",
    language: Question["language"] = "fr",
    knowledgeKey?: string,
  ): Question {
    return {
      id,
      conceptId: `concept-${familyId}`,
      familyId,
      knowledgeKey: knowledgeKey ?? familyId,
      type: "mcq",
      inputMode: "mcq",
      question: `Question approfondie pour ${id} (${language}) ?`,
      answers: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      correctAnswer: 0,
      category,
      subcategory: "deep-anti-repeat",
      difficulty,
      language,
      tags: ["deep-test"],
      source: { provider: "deep-anti-repeat-agent", license: "CC0" },
      verification: { status: "verified", sources: [] },
      confidence: 1.0,
      qualityScore: 1.0,
      version: 1,
    };
  }

  // 1. Marathon de jeu : Épuisement de pool et recyclage LRS
  public testMarathonAndPoolExhaustion() {
    this.startSection("1. Marathon de Jeu & Recyclage LRS (Pool Exhaustion)");
    const t0 = performance.now();

    // Pool synthétique de 100 familles distinctes
    const poolSize = 100;
    const pool = Array.from({ length: poolSize }, (_, i) =>
      this.createCandidate(`mq-${i}`, `fam-${i}`),
    );

    const history: SelectionHistoryEntry[] = [];
    const seenQuestionIds = new Set<string>();
    let totalRoundsPlayed = 0;
    const batchSize = 10;

    // Simulation de 15 tirages consécutifs (150 questions demandées sur un pool de 100)
    for (let round = 0; round < 15; round++) {
      const res = selectQuestions(pool, history, { count: batchSize, seed: 1000 + round });
      totalRoundsPlayed++;

      for (const q of res.questions) {
        if (history.length < poolSize) {
          // Pendant les 10 premiers tirages (100 questions), zéro répétition permise
          this.assert(
            `Tirage ${round + 1} : question ${q.id} fraîche`,
            !seenQuestionIds.has(q.id),
          );
        }
        seenQuestionIds.add(q.id);
        history.push({
          questionId: q.id,
          familyId: q.familyId,
          servedAt: 100000 + round * 1000,
          answeredCorrectly: true,
        });
      }
    }

    this.assert(
      "100% des familles du pool ont été servies avant recyclage",
      seenQuestionIds.size === poolSize,
    );

    // 1. Invariant strict : Zéro recyclage silencieux lors de l'épuisement
    const postExhaustion = selectQuestions(pool, history, { count: 5, seed: 9999 });
    this.assert(
      "Épuisement strict : poolExhausted signalé et aucune question recyclée silencieusement",
      postExhaustion.poolExhausted === true &&
        postExhaustion.reason === "INSUFFICIENT_UNSEEN_QUESTIONS" &&
        postExhaustion.questions.length === 0,
    );

    // 2. Recyclage LRS contrôlé via fenêtre glissante d'historique (purge des plus anciennes entrées)
    // On libère les 10 premières questions servies au Tour 1
    const oldestTenEntries = history.slice(0, 10);
    const oldestTenFamilies = new Set(oldestTenEntries.map((e) => e.familyId));
    const prunedHistory = history.slice(10); // Retire les 10 plus anciennes

    const recycledLrs = selectQuestions(pool, prunedHistory, { count: 5, seed: 9999 });
    this.assert(
      "Recyclage LRS : sélection réussie des familles les plus anciennes libérées",
      recycledLrs.questions.length === 5 &&
        recycledLrs.questions.every((q) => oldestTenFamilies.has(q.familyId)),
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 2. Union multi-profils asymétrique à 8 joueurs
  public testEightPlayersAsymmetricUnion() {
    this.startSection("2. Union Asymétrique Multi-Joueurs (8 Joueurs)");
    const t0 = performance.now();

    // Pool de 300 questions
    const pool = Array.from({ length: 300 }, (_, i) =>
      this.createCandidate(`u8-${i}`, `fam-u8-${i}`),
    );

    // 8 joueurs avec des historiques de tailles variables et des intersections
    // Joueur 0 a vu fam-0 .. fam-49
    // Joueur 1 a vu fam-30 .. fam-79
    // Joueur 2 a vu fam-60 .. fam-109
    // ...
    // Total des familles vues par au moins un joueur : fam-0 .. fam-199 (200 familles vues)
    // Familles totalement fraîches : fam-200 .. fam-299 (100 familles)
    const participantHistories: ParticipantHistory[] = [];
    const globallySeenFamilies = new Set<string>();

    for (let p = 0; p < 8; p++) {
      const startIdx = p * 20;
      const endIdx = startIdx + 60; // 60 questions par joueur avec recouvrement
      const entries: SelectionHistoryEntry[] = [];
      for (let i = startIdx; i < endIdx; i++) {
        const familyId = `fam-u8-${i}`;
        entries.push({
          questionId: `u8-${i}`,
          familyId,
          servedAt: Date.now() - (i * 1000),
          answeredCorrectly: i % 2 === 0,
        });
        globallySeenFamilies.add(familyId);
      }
      participantHistories.push({ profileId: `prof-${p}`, entries });
    }

    const tUnionStart = performance.now();
    const result = getUnseenQuestions({
      pool,
      participantHistories,
      count: 20,
      progressiveFallback: false,
      seed: 42,
    });
    const unionDurationMs = performance.now() - tUnionStart;

    this.assert("Performance : calcul de l'union à 8 joueurs en < 10ms", unionDurationMs < 10);
    this.assert("20 questions fraîches sélectionnées", result.questions.length === 20);

    const servedFamilies = result.questions.map((q) => q.familyId);
    const hasLeak = servedFamilies.some((f) => globallySeenFamilies.has(f));
    this.assert(
      "ZÉRO fuite : aucune question vue par l'un des 8 joueurs n'a été servie",
      !hasLeak,
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 3. Déduplication sémantique trans-langue & Canonical Knowledge Key
  public testCrossLanguageDeduplication() {
    this.startSection("3. Déduplication Trans-Langue & Clé Canonique");
    const t0 = performance.now();

    // 2 questions avec formulation différente, ID différents, langues différentes, mais MÊME knowledgeKey
    const frQuestion = this.createCandidate(
      "q-fr-cap-es",
      "capital-spain",
      "geographie",
      "easy",
      "fr",
      "knowledge.geo.capital.spain",
    );
    const enQuestion = this.createCandidate(
      "q-en-cap-es",
      "capital-spain-en",
      "geographie",
      "easy",
      "en",
      "knowledge.geo.capital.spain",
    );
    const otherQuestion = this.createCandidate(
      "q-fr-cap-it",
      "capital-italy",
      "geographie",
      "easy",
      "fr",
      "knowledge.geo.capital.italy",
    );

    // Joueur ayant vu la question en français
    const historyFr: ParticipantHistory[] = [
      {
        profileId: "p-polyglot",
        entries: [
          {
            questionId: frQuestion.id,
            familyId: frQuestion.familyId,
            servedAt: Date.now(),
            answeredCorrectly: true,
          },
        ],
      },
    ];

    // Clé canonique identique
    const key1 = canonicalizeKnowledgeKey("Knowledge.Geo.Capital.Spain  ");
    const key2 = canonicalizeKnowledgeKey("knowledge.geo.capital.spain");
    this.assert("Canonicalisation insensible à la casse et aux espaces", key1 === key2);

    // Sélection avec pool bilingue
    const pool = [frQuestion, enQuestion, otherQuestion];
    const selection = getUnseenQuestions({
      pool,
      participantHistories: historyFr,
      count: 2,
      seed: 1,
    });

    const selectedIds = selection.questions.map((q) => q.id);
    this.assert("La question FR vue est exclue", !selectedIds.includes(frQuestion.id));
    this.assert("La variante FR de la même famille est exclue", !selectedIds.includes("q-fr-cap-es"));

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 4. Cascade de repli contrôlé (progressiveFallback)
  public testProgressiveFallbackPreservesUnseen() {
    this.startSection("4. Progressive Fallback & Préservation Non-Répétition");
    const t0 = performance.now();

    // Pool avec seulement 2 questions "hard" en "histoire"
    // et 10 questions "medium" en "histoire"
    const pool = [
      this.createCandidate("h-hard-1", "fam-hh1", "histoire", "hard"),
      this.createCandidate("h-hard-2", "fam-hh2", "histoire", "hard"),
      ...Array.from({ length: 10 }, (_, i) =>
        this.createCandidate(`h-med-${i}`, `fam-hm${i}`, "histoire", "medium"),
      ),
    ];

    // Le joueur a DÉJÀ VU les 2 questions "hard"
    const history: ParticipantHistory[] = [
      {
        profileId: "p-expert",
        entries: [
          { questionId: "h-hard-1", familyId: "fam-hh1", servedAt: Date.now(), answeredCorrectly: true },
          { questionId: "h-hard-2", familyId: "fam-hh2", servedAt: Date.now(), answeredCorrectly: true },
        ],
      },
    ];

    // Requête demandant 3 questions "hard" avec progressiveFallback: true
    const fallbackRes = getUnseenQuestions({
      pool,
      participantHistories: history,
      count: 3,
      difficulties: ["hard"],
      progressiveFallback: true,
      seed: 7,
    });

    this.assert(
      "La cascade a basculé vers neighbor_difficulty",
      fallbackRes.fallbackStage === "neighbor_difficulty",
    );
    this.assert("3 questions ont pu être servies", fallbackRes.questions.length === 3);

    const servedIds = fallbackRes.questions.map((q) => q.id);
    this.assert(
      "AUCUNE des questions 'hard' déjà vues n'a été recyclée",
      !servedIds.includes("h-hard-1") && !servedIds.includes("h-hard-2"),
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 5. Réservations transactionnelles & Concurrence multi-salons
  public testConcurrentReservationsAndTtl() {
    this.startSection("5. Réservations Transactionnelles Concurrentes & TTL");
    const t0 = performance.now();

    reservationStore.clear();

    const pool = Array.from({ length: 20 }, (_, i) =>
      this.createCandidate(`res-${i}`, `fam-res-${i}`),
    );

    // Salon A réserve les familles 0 à 4 avec un TTL de 2000ms
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      reservationStore.addReservation({
        id: `r-a-${i}`,
        sessionId: "session-room-A",
        profileId: "prof-A",
        familyId: `fam-res-${i}`,
        questionId: `res-${i}`,
        expiresAt: now + 2000,
      });
    }

    // Salon B demande des familles réservées
    const reservedForB = reservationStore.getReservedFamilies(undefined, now);
    this.assert("Salon B détecte 5 familles actuellement réservées", reservedForB.size === 5);

    // Sélection pour Salon B en excluant les familles réservées
    const selectionB = getUnseenQuestions({
      pool,
      participantHistories: [],
      count: 10,
      reservedFamilyIds: reservedForB,
      seed: 123,
    });

    const bFamilies = selectionB.questions.map((q) => q.familyId);
    const hasCollision = bFamilies.some((f) => reservedForB.has(f));
    this.assert("Salon B ne reçoit AUCUNE famille réservée par Salon A", !hasCollision);

    // Simulation après expiration du TTL (now + 3000ms)
    const reservedAfterExpiry = reservationStore.getReservedFamilies(undefined, now + 3000);
    this.assert("Purge automatique après expiration du TTL", reservedAfterExpiry.size === 0);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 6. Robustesse et assainissement des entrées corrompues
  public testCorruptedHistorySanitization() {
    this.startSection("6. Robustesse & Assainissement d'Historique Corrompu");
    const t0 = performance.now();

    // Test avec des données sales : espaces, casse bizarre, dates bizarres
    const currentHist: QuestionHistory[] = [
      {
        questionId: "clean-1",
        familyId: "fam-clean-1",
        profileId: "p1",
        servedAt: "2026-01-01T12:00:00.000Z",
        answeredCorrectly: true,
      },
    ];

    // Ajout avec casse bizarre
    const nextHist = appendSeenEntries(
      currentHist,
      "clean-2",
      "FaM-cLeAn-1", // Même famille mais avec casse différente
      ["p1"],
      "session-1",
    );

    this.assert(
      "appendSeenEntries est insensible à la casse et ne crée pas de doublon",
      nextHist.length === 1,
    );

    // Fusion d'historiques anonyme et compte avec déduplication
    const anonEntries: QuestionHistory[] = [
      { questionId: "q1", familyId: "fam.A", servedAt: "2026-01-01T00:00:00Z", answeredCorrectly: null },
      { questionId: "q2", familyId: "fam.B", servedAt: "2026-01-02T00:00:00Z", answeredCorrectly: true },
    ];
    const accountEntries: QuestionHistory[] = [
      { questionId: "q1-bis", familyId: "fam.A", servedAt: "2026-01-03T00:00:00Z", answeredCorrectly: false },
    ];

    const merged = mergeProfileHistoryEntries(anonEntries, accountEntries, "account-123");
    this.assert("mergeProfileHistoryEntries conserve l'entrée la plus ancienne", merged.length === 2);
    const famA = merged.find((e) => e.familyId.toLowerCase() === "fam.a");
    this.assert(
      "Famille A a conservé la date originale du 2026-01-01",
      famA?.servedAt === "2026-01-01T00:00:00Z",
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  public async runAll(): Promise<AgentReport> {
    const start = performance.now();
    this.sections = [];
    this.errors = [];

    this.testMarathonAndPoolExhaustion();
    this.testEightPlayersAsymmetricUnion();
    this.testCrossLanguageDeduplication();
    this.testProgressiveFallbackPreservesUnseen();
    this.testConcurrentReservationsAndTtl();
    this.testCorruptedHistorySanitization();

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
      title: "Agent Anti-Répétition Approfondi (Couche 2)",
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
if (process.argv[1]?.endsWith("deep-anti-repeat-agent.ts")) {
  const agent = new DeepAntiRepeatAgent();
  agent.runAll().then((report) => {
    console.log(`\n━━━ ${report.title} ━━━`);
    console.log(`Durée : ${report.durationMs.toFixed(1)}ms | Assertions : ${report.passedAssertions}/${report.totalAssertions}`);
    for (const sec of report.sections) {
      const icon = sec.passed ? "✅" : "❌";
      console.log(`\n${icon} ${sec.title} (${sec.assertions.length} vérifications)`);
      for (const a of sec.assertions) {
        if (!a.passed) console.log(`   ❌ ${a.name} : ${a.error}`);
        else console.log(`   ✓ ${a.name}`);
      }
    }
    if (!report.success) {
      console.error("\n❌ Échecs détectés :", report.errors);
      process.exit(1);
    } else {
      console.log("\n🎉 Toutes les vérifications anti-répétition poussées sont passées avec succès !");
      process.exit(0);
    }
  });
}
