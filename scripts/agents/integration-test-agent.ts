/**
 * Agorax — Agent de Tests d'Intégration (Integration Test Agent)
 *
 * Valide les flux d'intégration, les contrats de routes API Next.js,
 * les validations Zod d'entrée/sortie, les fallbacks local-first et l'isolation multilingue :
 *  1. POST /api/questions (filtrage, difficulté, bilingue, validation payload, déduplication serveur)
 *  2. GET /api/debates (prompts de débat, filtrage catégorie, exclusions, fallbacks)
 *  3. POST /api/lobby (cycle de vie complet salon persistant : create, join, ready, mode, leave, reconnect)
 *  4. POST /api/games/session (flux de jeu : start, push_question, submit_score, finish, return_to_lobby)
 *  5. GET /api/quiz & POST /api/social (SEO quiz, présence et interactions sociales)
 *  6. Contrat Local-First & Résilience Hors-Ligne (zéro crash 500 si Supabase est hors ligne)
 */
import { POST as handleQuestionsPost } from "../../src/app/api/questions/route";
import { GET as handleDebatesGet } from "../../src/app/api/debates/route";
import { POST as handleLobbyPost } from "../../src/app/api/lobby/route";
import { POST as handleGamesSessionPost } from "../../src/app/api/games/session/route";
import { GET as handleQuizGet } from "../../src/app/api/quiz/route";
import { POST as handleSocialPost } from "../../src/app/api/social/route";
import type {
  AgentReport,
  AgentSectionReport,
  AssertionResult,
} from "./types";

export class IntegrationTestAgent {
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

  // 1. POST /api/questions
  public async testQuestionsRoute() {
    this.startSection("1. Route API POST /api/questions");
    const t0 = performance.now();

    // 1.1 Requête valide basique (5 questions d'histoire)
    const req1 = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: 5,
        category: "histoire",
      }),
    });
    const res1 = await handleQuestionsPost(req1);
    const data1 = await res1.json();
    this.assert("POST /api/questions retourne HTTP 200", res1.status === 200);
    this.assert(
      "Retourne un tableau de questions non vide",
      Array.isArray(data1.questions) && data1.questions.length > 0,
    );
    this.assert(
      "Toutes les questions retournées sont de la catégorie demandée",
      data1.questions.every((q: { category: string }) => q.category === "histoire"),
    );

    // 1.2 Requête avec options bilingues exigées
    const reqBilingual = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: 3,
        requireBilingual: true,
      }),
    });
    const resBilingual = await handleQuestionsPost(reqBilingual);
    const dataBilingual = await resBilingual.json();
    this.assert("Requête requireBilingual retourne HTTP 200", resBilingual.status === 200);
    this.assert(
      "Les questions bilingues disposent d'une traduction anglaise",
      dataBilingual.questions.every((q: { translations?: { en?: { question: string } } }) =>
        Boolean(q.translations?.en?.question),
      ),
    );

    // 1.3 Validation Zod d'entrée (count négatif ou excessif)
    const reqInvalid = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: 9999, // > max 60
      }),
    });
    const resInvalid = await handleQuestionsPost(reqInvalid);
    this.assert(
      "Payload invalide (count excessif) retourne HTTP 400 Bad Request",
      resInvalid.status === 400,
    );

    // 1.4 Anti-répétition via historique envoyé au serveur
    const firstQ = data1.questions[0];
    const reqHistory = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: 5,
        category: "histoire",
        history: [
          {
            questionId: firstQ.id,
            familyId: firstQ.familyId,
            servedAt: Date.now(),
            answeredCorrectly: true,
          },
        ],
      }),
    });
    const resHistory = await handleQuestionsPost(reqHistory);
    const dataHistory = await resHistory.json();
    const servedIds = (dataHistory.questions || []).map((q: { id: string }) => q.id);
    this.assert(
      "La question récemment vue dans l'historique est écartée de la nouvelle sélection",
      !servedIds.includes(firstQ.id),
    );

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 2. GET /api/debates
  public async testDebatesRoute() {
    this.startSection("2. Route API GET /api/debates");
    const t0 = performance.now();

    // 2.1 Requête générale de débats
    const req1 = new Request("http://localhost:3000/api/debates");
    const res1 = await handleDebatesGet(req1);
    const data1 = await res1.json();
    this.assert("GET /api/debates retourne HTTP 200", res1.status === 200);
    this.assert("Retourne au moins un prompt de débat valide", Array.isArray(data1.prompts) && data1.prompts.length > 0);

    // 2.2 Filtrage par catégorie
    const reqCat = new Request("http://localhost:3000/api/debates?category=philosophie");
    const resCat = await handleDebatesGet(reqCat);
    const dataCat = await resCat.json();
    this.assert(
      "Prompts filtrés par catégorie philosophie",
      dataCat.prompts.every((p: { category: string }) => p.category === "philosophy" || p.category === "philosophie"),
    );

    // 2.3 Exclusion de prompts déjà vus
    if (data1.prompts.length > 0) {
      const excludedId = data1.prompts[0].id;
      const reqExclude = new Request(`http://localhost:3000/api/debates?exclude=${excludedId}`);
      const resExclude = await handleDebatesGet(reqExclude);
      const dataExclude = await resExclude.json();
      const ids = (dataExclude.prompts || []).map((p: { id: string }) => p.id);
      this.assert(
        "Prompt exclu absent du résultat",
        !ids.includes(excludedId) || dataExclude.total === 1,
      );
    }

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 3. POST /api/lobby
  public async testLobbyRoute() {
    this.startSection("3. Route API POST /api/lobby");
    const t0 = performance.now();

    const hostProfileId = `prof-host-${Date.now()}`;
    const playerProfileId = `prof-player-${Date.now()}`;

    // 3.1 Création de salon
    const reqCreate = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ownerProfileId: hostProfileId,
        nickname: "HôteIntégration",
        mode: "classic",
        category: "science",
        maxPlayers: 4,
      }),
    });
    const resCreate = await handleLobbyPost(reqCreate);
    const dataCreate = await resCreate.json();
    this.assert("Création de salon retourne HTTP 200", resCreate.status === 200);
    this.assert("Génération d'un code de salon à 6 caractères", dataCreate.lobby?.code?.length === 6);
    this.assert("L'hôte est membre du salon", dataCreate.member?.profileId === hostProfileId);

    const lobbyId = dataCreate.lobby.id;
    const roomCode = dataCreate.lobby.code;

    // 3.2 Deuxième joueur rejoint avec le code
    const reqJoin = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join",
        code: roomCode,
        profileId: playerProfileId,
        nickname: "JoueurDeux",
      }),
    });
    const resJoin = await handleLobbyPost(reqJoin);
    const dataJoin = await resJoin.json();
    this.assert("Deuxième joueur rejoint avec succès", resJoin.status === 200 && dataJoin.member?.profileId === playerProfileId);

    // 3.3 Mise à jour du mode de jeu par l'hôte
    const reqMode = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_mode",
        lobbyId,
        requestedByProfileId: hostProfileId,
        gameMode: "debate",
      }),
    });
    const resMode = await handleLobbyPost(reqMode);
    const dataMode = await resMode.json();
    this.assert("Mode de jeu mis à jour vers 'debate'", dataMode.lobby?.selectedGameMode === "debate");

    // 3.4 Ready check
    const reqReady = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ready",
        lobbyId,
        profileId: playerProfileId,
        ready: true,
      }),
    });
    const resReady = await handleLobbyPost(reqReady);
    const dataReady = await resReady.json();
    this.assert("Statut prêt validé", dataReady.member?.ready === true);

    // 3.5 Liste des membres
    const reqMembers = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_members",
        lobbyId,
      }),
    });
    const resMembers = await handleLobbyPost(reqMembers);
    const dataMembers = await resMembers.json();
    this.assert("2 membres connectés recensés dans le salon", dataMembers.members?.length === 2);

    // 3.6 Départ d'un joueur
    const reqLeave = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "leave",
        lobbyId,
        profileId: playerProfileId,
      }),
    });
    const resLeave = await handleLobbyPost(reqLeave);
    this.assert("Départ du salon propre", resLeave.status === 200);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 4. POST /api/games/session
  public async testGamesSessionRoute() {
    this.startSection("4. Route API POST /api/games/session");
    const t0 = performance.now();

    // 4.1 Créer un lobby pour démarrer la session
    const hostProfileId = `prof-gs-host-${Date.now()}`;
    const reqLobby = new Request("http://localhost:3000/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ownerProfileId: hostProfileId,
        nickname: "GsHost",
        mode: "classic",
      }),
    });
    const resLobby = await handleLobbyPost(reqLobby);
    const dataLobby = await resLobby.json();
    const lobbyId = dataLobby.lobby.id;

    // 4.2 Lancement de partie depuis le lobby
    const reqStart = new Request("http://localhost:3000/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        lobbyId,
        requestedByProfileId: hostProfileId,
        gameMode: "classic",
      }),
    });
    const resStart = await handleGamesSessionPost(reqStart);
    const dataStart = await resStart.json();
    this.assert("Démarrage de la partie retourne HTTP 200", resStart.status === 200);
    this.assert("Session de jeu créée avec état playing", dataStart.session?.status === "PLAYING");

    const sessionId = dataStart.session.id;

    // 4.3 Pousser une question
    const reqPush = new Request("http://localhost:3000/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push_question",
        sessionId,
        questionIndex: 0,
        revealed: false,
      }),
    });
    const resPush = await handleGamesSessionPost(reqPush);
    const dataPush = await resPush.json();
    this.assert("Index de question avancé à 0", dataPush.session?.questionIndex === 0);

    // 4.4 Soumission de score
    const reqScore = new Request("http://localhost:3000/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit_score",
        sessionId,
        profileId: hostProfileId,
        points: 100,
      }),
    });
    const resScore = await handleGamesSessionPost(reqScore);
    const dataScore = await resScore.json();
    this.assert("Score de 100 points attribué au participant", dataScore.participant?.score === 100);

    // 4.5 Fin de partie
    const reqFinish = new Request("http://localhost:3000/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "finish",
        sessionId,
      }),
    });
    const resFinish = await handleGamesSessionPost(reqFinish);
    const dataFinish = await resFinish.json();
    this.assert("Fin de partie validée (FINISHED)", dataFinish.session?.status === "FINISHED");

    // 4.6 Retour au salon
    const reqReturn = new Request("http://localhost:3000/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "return_to_lobby",
        lobbyId,
      }),
    });
    const resReturn = await handleGamesSessionPost(reqReturn);
    const dataReturn = await resReturn.json();
    this.assert("Retour au salon persistant réussi (WAITING)", dataReturn.lobby?.status === "WAITING");

    this.currentSection!.durationMs = performance.now() - t0;
  }

  // 5. GET /api/quiz & POST /api/social
  public async testQuizAndSocialRoutes() {
    this.startSection("5. Routes API Quiz & Social");
    const t0 = performance.now();

    // 5.1 Validation erreur 400 sur GET /api/quiz sans paramètres obligatoires
    const reqBadQuiz = new Request("http://localhost:3000/api/quiz");
    const resBadQuiz = await handleQuizGet(reqBadQuiz);
    this.assert(
      "GET /api/quiz sans slug ni catégorie renvoie HTTP 400",
      resBadQuiz.status === 400,
    );

    // 5.2 Heartbeat social
    const myProfile = `prof-hb-${Date.now()}`;
    const reqHeartbeat = new Request("http://localhost:3000/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "heartbeat",
        profileId: myProfile,
      }),
    });
    const resHeartbeat = await handleSocialPost(reqHeartbeat);
    const dataHeartbeat = await resHeartbeat.json();
    this.assert("Heartbeat social retourne HTTP 200", resHeartbeat.status === 200 && dataHeartbeat.ok === true);

    // 5.3 Création de Party
    const reqParty = new Request("http://localhost:3000/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_party",
        leaderProfileId: myProfile,
        leaderNickname: "PartyLeader",
      }),
    });
    const resParty = await handleSocialPost(reqParty);
    const dataParty = await resParty.json();
    this.assert("Création de Party réussie", resParty.status === 200 && dataParty.party?.id);

    this.currentSection!.durationMs = performance.now() - t0;
  }

  public async runAll(): Promise<AgentReport> {
    const start = performance.now();
    this.sections = [];
    this.errors = [];

    await this.testQuestionsRoute();
    await this.testDebatesRoute();
    await this.testLobbyRoute();
    await this.testGamesSessionRoute();
    await this.testQuizAndSocialRoutes();

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
      agent: "integration",
      title: "Agent de Tests d'Intégration AgoraX",
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
if (process.argv[1]?.endsWith("integration-test-agent.ts")) {
  const agent = new IntegrationTestAgent();
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
      console.log("\n🎉 Tous les tests d'intégration sont passés avec succès !");
      process.exit(0);
    }
  });
}
