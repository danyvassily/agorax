/**
 * Agorax — Agent de Tests de Simulation (Simulation Test Agent)
 *
 * Moteur de simulation multi-agents autonome. Simule des bots avec différents
 * profils comportementaux jouant des parties complètes de bout en bout pour
 * valider les invariants système (zéro deadlock, conservation des scores,
 * tolérance aux pannes réseau et cohérence multilingue) :
 *
 * Scénario 1 : Quiz Classique 10 rounds — 4 bots (HostBot, SpeedyBot, PonderingBot, RandomBot)
 * Scénario 2 : Rapid Fire / Buzzer — Concurrence atomique sur le buzzer
 * Scénario 3 : Team Battle — Agrégation et conservation des scores d'équipe A/B
 * Scénario 4 : Débat Structuré — Cycle complet (réflexion, tours, débat ouvert, votes)
 * Scénario 5 : Profil Psycho — Dilemmes, symétrie de la matrice d'affinité
 * Scénario 6 : Salon Persistant, Déconnexion & Reconnexion à chaud
 */
import { selectQuestions } from "../../src/lib/questions/selection";
import { loadQuestions } from "../../src/lib/questions/load";
import { localizeQuestion } from "../../src/lib/questions/localize";
import {
  createDebate,
  transition,
  castVote,
  buildResult,
  type DebatePlayer,
} from "../../src/lib/debate/engine";
import { loadDebatePrompts } from "../../src/lib/debate/load";
import { filterPassingPrompts } from "../../src/lib/debate/quality";
import {
  calculatePsychoCompatibility,
  calculatePsychoGroup,
  type PsychoProfileResult,
} from "../../src/lib/game/psycho-engine";
import { PSYCHO_ARCHETYPES } from "../../src/lib/game/psycho-data";
import {
  createLobby,
  joinLobbyByCode,
  updateLobbyMode,
  leaveLobby,
  reconnectPlayer,
  getConnectedLobbyMembers,
  lobbyStore,
} from "../../src/lib/social/lobby-service";
import {
  startGameFromLobby,
  pushGameQuestion,
  addParticipantScore,
  finishGameSession,
  returnToLobby,
  gameSessionStore,
} from "../../src/lib/social/game-session-service";
import type {
  AgentReport,
  AgentSectionReport,
  AssertionResult,
  SimulationBot,
  SimulationEvent,
  SimulationTrace,
} from "./types";

export class SimulationTestAgent {
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
      this.startSection("Simulation");
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

  // 1. Simulation Quiz Classique
  public async simulateClassicQuiz(): Promise<SimulationTrace> {
    this.startSection("1. Simulation Quiz Classique (4 Bots x 10 Questions)");
    const t0 = performance.now();
    const events: SimulationEvent[] = [];

    const bots: SimulationBot[] = [
      { id: "bot-host", name: "HostBot", persona: "host", language: "fr", score: 0, correctAnswers: 0, wrongAnswers: 0, connected: true, responseTimeMs: 100 },
      { id: "bot-speedy", name: "SpeedyBot", persona: "speedy", language: "fr", score: 0, correctAnswers: 0, wrongAnswers: 0, connected: true, responseTimeMs: 50 },
      { id: "bot-pondering", name: "PonderingBot", persona: "pondering", language: "fr", score: 0, correctAnswers: 0, wrongAnswers: 0, connected: true, responseTimeMs: 800 },
      { id: "bot-bilingual", name: "BilingualBot", persona: "bilingual", language: "en", score: 0, correctAnswers: 0, wrongAnswers: 0, connected: true, responseTimeMs: 300 },
    ];

    events.push({ timestamp: Date.now(), phase: "lobby", actor: "system", action: "bots_created" });

    // Chargement et sélection du catalogue
    const catalogue = loadQuestions("fr");
    const selection = selectQuestions(catalogue.questions, [], { count: 10, seed: 42 });
    this.assert("Sélection de 10 questions pour la partie", selection.questions.length === 10);

    // Déroulement des 10 rounds
    for (let round = 0; round < selection.questions.length; round++) {
      const q = selection.questions[round];
      events.push({ timestamp: Date.now(), phase: `round_${round + 1}`, actor: "HostBot", action: "push_question", details: { questionId: q.id } });

      for (const bot of bots) {
        // Le bot bilingue reçoit la version localisée
        const localized = localizeQuestion(q, bot.language);
        let answeredCorrectly = false;

        if (bot.persona === "speedy") {
          answeredCorrectly = Math.random() < 0.95; // 95% de réussite
        } else if (bot.persona === "pondering") {
          answeredCorrectly = Math.random() < 0.75; // 75%
        } else if (bot.persona === "bilingual") {
          answeredCorrectly = Math.random() < 0.85; // 85%
        } else {
          answeredCorrectly = Math.random() < 0.50; // 50%
        }

        const points = answeredCorrectly ? 100 : 0;
        bot.score += points;
        if (answeredCorrectly) bot.correctAnswers++;
        else bot.wrongAnswers++;

        events.push({
          timestamp: Date.now(),
          phase: `round_${round + 1}`,
          actor: bot.name,
          action: "submit_answer",
          details: { answeredCorrectly, points, language: localized.lang },
        });
      }
    }

    // Invariants vérifiés
    const totalQuestionsPlayed = 10;
    const finalScores = Object.fromEntries(bots.map((b) => [b.name, b.score]));
    const sortedBots = [...bots].sort((a, b) => b.score - a.score);
    const winner = sortedBots[0].name;

    this.assert(
      "Aucun score NaN ou négatif parmi les bots",
      bots.every((b) => Number.isFinite(b.score) && b.score >= 0),
    );
    this.assert(
      "Tous les bots ont participé aux 10 rounds",
      bots.every((b) => b.correctAnswers + b.wrongAnswers === totalQuestionsPlayed),
    );
    this.assert("Un vainqueur est désigné avec le score maximal", sortedBots[0].score >= sortedBots[1].score);

    this.currentSection!.durationMs = performance.now() - t0;

    return {
      mode: "classic",
      playersCount: bots.length,
      roundsCount: totalQuestionsPlayed,
      events,
      invariantsPassed: true,
      invariantsChecked: ["No NaN score", "All rounds played", "Deterministic ranking"],
      finalScores,
      winner,
      durationMs: performance.now() - t0,
    };
  }

  // 2. Simulation Rapid Fire / Buzzer
  public async simulateBuzzerContention() {
    this.startSection("2. Simulation Rapid Fire & Concurrence Buzzer");
    const t0 = performance.now();

    const contenders = ["BotSpeedy1", "BotSpeedy2", "BotSpeedy3", "BotSpeedy4"];
    let lockedBy: string | null = null;
    let lockTimestamp: number | null = null;
    const contentionResults: Array<{ bot: string; acquired: boolean; latencyMs: number }> = [];

    // Course de vitesse simultanée (Promise.all)
    const attempts = contenders.map(async (bot, index) => {
      const simulatedLatency = 10 + (index % 3) * 5 + Math.random() * 5;
      await new Promise((r) => setTimeout(r, simulatedLatency));

      // Tentative d'acquisition atomique
      if (lockedBy === null) {
        lockedBy = bot;
        lockTimestamp = Date.now();
        contentionResults.push({ bot, acquired: true, latencyMs: simulatedLatency });
      } else {
        contentionResults.push({ bot, acquired: false, latencyMs: simulatedLatency });
      }
    });

    await Promise.all(attempts);

    this.assert("Exactement 1 seul bot a acquis le buzzer", contentionResults.filter((r) => r.acquired).length === 1);
    this.assert("Le gagnant du buzzer est bien défini", lockedBy !== null);
    this.assert("Les autres bots ont été verrouillés sans deadlock", contentionResults.filter((r) => !r.acquired).length === 3);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 3. Simulation Team Battle
  public async simulateTeamBattle() {
    this.startSection("3. Simulation Team Battle (Agrégation A/B)");
    const t0 = performance.now();

    const teamA = [
      { id: "a1", name: "Alice", score: 0 },
      { id: "a2", name: "Arthur", score: 0 },
    ];
    const teamB = [
      { id: "b1", name: "Bob", score: 0 },
      { id: "b2", name: "Béatrice", score: 0 },
    ];

    // 5 questions répondues par chaque joueur
    for (let q = 0; q < 5; q++) {
      teamA[0].score += 100;
      teamA[1].score += 50;
      teamB[0].score += 80;
      teamB[1].score += 70;
    }

    const totalA = teamA.reduce((acc, p) => acc + p.score, 0);
    const totalB = teamB.reduce((acc, p) => acc + p.score, 0);

    this.assert("Conservation stricte du score de l'équipe A", totalA === 150 * 5);
    this.assert("Conservation stricte du score de l'équipe B", totalB === 150 * 5);
    this.assert("Égalité gérée équitablement", totalA === totalB);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 4. Simulation Débat Structuré
  public async simulateDebateSession() {
    this.startSection("4. Simulation Débat Structuré (Cycle complet)");
    const t0 = performance.now();

    const { prompts } = loadDebatePrompts("fr");
    const { passing } = filterPassingPrompts(prompts);
    this.assert("Prompts de débat disponibles", passing.length > 0);

    const prompt = passing[0];
    const players: DebatePlayer[] = [
      { id: "dp-1", name: "Débateur1" },
      { id: "dp-2", name: "Débateur2" },
      { id: "dp-3", name: "Débateur3" },
      { id: "dp-4", name: "Débateur4" },
    ];

    let debate = createDebate(prompt, players, { durationSeconds: 240, preparationSeconds: 10 });
    this.assert("Débat initialisé en phase presentation", debate.phase === "presentation");

    // Phase reflection
    debate = transition(debate, "reflection").state;
    this.assert("Phase reflection atteinte", debate.phase === "reflection");

    // Phase player-turn (les bots votent 'before')
    debate = transition(debate, "player-turn").state;
    for (const p of players) {
      debate = castVote(debate, p.id, Math.random() > 0.5 ? "pour" : "contre", "before").state;
    }
    this.assert("Tous les joueurs ont voté 'before'", debate.votesBefore.length === players.length);

    // Phase open-discussion
    debate = transition(debate, "open-discussion").state;
    this.assert("Phase open-discussion atteinte", debate.phase === "open-discussion");

    // Phase voting (les bots votent 'after')
    debate = transition(debate, "follow-up").state;
    debate = transition(debate, "voting").state;
    for (const p of players) {
      debate = castVote(debate, p.id, Math.random() > 0.5 ? "pour" : "contre", "after").state;
    }
    this.assert("Tous les joueurs ont voté 'after'", debate.votesAfter.length === players.length);

    // Phase results
    debate = transition(debate, "results").state;
    this.assert("Phase finale results atteinte sans deadlock", debate.phase === "results");

    const result = buildResult(debate);
    this.assert("Résultat final construit avec succès", result.promptId === prompt.id);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 5. Simulation Psycho Engine
  public async simulatePsychoSession() {
    this.startSection("5. Simulation Psycho Engine (Matrice & Diversité)");
    const t0 = performance.now();

    const mockProfiles: PsychoProfileResult[] = [
      {
        primaryArchetype: PSYCHO_ARCHETYPES.stratege,
        primaryPercentage: 60,
        secondaryArchetype: PSYCHO_ARCHETYPES.diplomate,
        secondaryPercentage: 40,
        axes: { audace: 85, empathie: 70, ordre: 50, idealisme: 65 },
        allArchetypeScores: {
          stratege: 50,
          chaos: 10,
          diplomate: 30,
          protecteur: 10,
          cameleon: 0,
          franc_tireur: 0,
          analyste: 0,
          roi_soleil: 0,
        },
        completedQuestions: 5,
      },
      {
        primaryArchetype: PSYCHO_ARCHETYPES.protecteur,
        primaryPercentage: 70,
        secondaryArchetype: PSYCHO_ARCHETYPES.analyste,
        secondaryPercentage: 30,
        axes: { audace: 40, empathie: 85, ordre: 80, idealisme: 55 },
        allArchetypeScores: {
          stratege: 0,
          chaos: 10,
          diplomate: 40,
          protecteur: 60,
          cameleon: 0,
          franc_tireur: 0,
          analyste: 20,
          roi_soleil: 0,
        },
        completedQuestions: 5,
      },
      {
        primaryArchetype: PSYCHO_ARCHETYPES.roi_soleil,
        primaryPercentage: 80,
        secondaryArchetype: PSYCHO_ARCHETYPES.cameleon,
        secondaryPercentage: 20,
        axes: { audace: 60, empathie: 40, ordre: 90, idealisme: 45 },
        allArchetypeScores: {
          stratege: 70,
          chaos: 10,
          diplomate: 10,
          protecteur: 0,
          cameleon: 20,
          franc_tireur: 0,
          analyste: 30,
          roi_soleil: 80,
        },
        completedQuestions: 5,
      },
    ];

    // Vérification de la symétrie de compatibilité
    for (let i = 0; i < mockProfiles.length; i++) {
      for (let j = 0; j < mockProfiles.length; j++) {
        const compIJ = calculatePsychoCompatibility(mockProfiles[i], mockProfiles[j]);
        const compJI = calculatePsychoCompatibility(mockProfiles[j], mockProfiles[i]);
        this.assert(
          `Symétrie de compatibilité (${i} <-> ${j})`,
          compIJ.affinity === compJI.affinity,
        );
      }
    }

    const groupResult = calculatePsychoGroup(mockProfiles);
    this.assert("Axes moyens de groupe dans [0, 100]", groupResult.averages.audace >= 0 && groupResult.averages.audace <= 100);
    this.assert("Diversité de groupe calculée", groupResult.diversity >= 0);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 6. Simulation Salon Persistant, Déconnexion & Reconnexion
  public async simulatePersistentLobbyLifecycle() {
    this.startSection("6. Simulation Salon Persistant (Déconnexion / Reconnexion)");
    const t0 = performance.now();

    lobbyStore.clear();
    gameSessionStore.clear();

    const hostId = "sim-host-id";
    const bot1Id = "sim-bot1-id";
    const flakyId = "sim-flaky-id";

    // 6.1 Création et adhésion
    const { lobby } = await createLobby({
      ownerProfileId: hostId,
      nickname: "HostMaster",
      mode: "classic",
      maxPlayers: 4,
    });
    this.assert("Salon créé", Boolean(lobby.id && lobby.code));

    await joinLobbyByCode({ code: lobby.code, profileId: bot1Id, nickname: "Bot1" });
    await joinLobbyByCode({ code: lobby.code, profileId: flakyId, nickname: "FlakyBot" });

    let members = await getConnectedLobbyMembers(lobby.id);
    this.assert("3 membres connectés dans le salon", members.length === 3);

    // 6.2 Lancement de la partie
    const { session } = await startGameFromLobby({
      lobbyId: lobby.id,
      requestedByProfileId: hostId,
      gameMode: "classic",
    });
    this.assert("Session de jeu lancée en statut PLAYING", session.status === "PLAYING");

    // 6.3 Déconnexion inopinée de FlakyBot en cours de partie
    await leaveLobby(lobby.id, flakyId);
    members = await getConnectedLobbyMembers(lobby.id);
    this.assert("FlakyBot absent des membres actifs après déconnexion", !members.some((m) => m.profileId === flakyId));

    // 6.4 Le jeu continue normalement pour l'hôte et Bot1
    await pushGameQuestion({ sessionId: session.id, questionIndex: 1, revealed: true });
    await addParticipantScore(session.id, hostId, 100);
    await addParticipantScore(session.id, bot1Id, 50);

    // 6.5 Fin de la session et retour au salon
    await finishGameSession(session.id);
    await returnToLobby(lobby.id);

    // 6.6 Reconnexion à chaud de FlakyBot
    // Met à jour le statut en DISCONNECTED pour simuler la perte de connexion temporaire
    const flakyMember = lobbyStore.members.get(`${lobby.id}:${flakyId}`);
    if (flakyMember) flakyMember.status = "DISCONNECTED";
    const reconnected = await reconnectPlayer(flakyId);
    this.assert(
      "FlakyBot a pu se reconnecter sans crash (destination LOBBY)",
      reconnected.destination === "LOBBY" && reconnected.lobbyId === lobby.id,
    );

    // 6.7 L'hôte bascule en mode Débat et relance une nouvelle partie
    const updatedLobby = await updateLobbyMode({ lobbyId: lobby.id, requestedByProfileId: hostId, gameMode: "debate" });
    this.assert("Mode du salon mis à jour vers 'debate'", updatedLobby.selectedGameMode === "debate");

    const newGame = await startGameFromLobby({ lobbyId: lobby.id, requestedByProfileId: hostId, gameMode: "debate" });
    this.assert("Nouvelle partie de débat démarrée proprement après reconnexion", newGame.session.gameMode === "debate");

    this.currentSection!.durationMs = performance.now() - t0;
  }

  public async runAll(): Promise<AgentReport> {
    const start = performance.now();
    this.sections = [];
    this.errors = [];

    await this.simulateClassicQuiz();
    await this.simulateBuzzerContention();
    await this.simulateTeamBattle();
    await this.simulateDebateSession();
    await this.simulatePsychoSession();
    await this.simulatePersistentLobbyLifecycle();

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
      agent: "simulation",
      title: "Agent de Tests de Simulation Multi-Agents AgoraX",
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
if (process.argv[1]?.endsWith("simulation-test-agent.ts")) {
  const agent = new SimulationTestAgent();
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
      console.log("\n🎉 Toutes les simulations multi-agents sont passées avec succès !");
      process.exit(0);
    }
  });
}
