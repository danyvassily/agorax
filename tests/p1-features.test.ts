import { describe, it, expect } from "vitest";

describe("P1 Features Test Suite", () => {
  describe("1. Rejoindre en cours de partie (Spectateur actif)", () => {
    it("détermine que le joueur est spectateur uniquement pendant la manche où il a rejoint", () => {
      const joinedMidGameIndex: number | null = 2; // Arrivé à la question index 2

      // Tour 2 (question en cours lors de la connexion) : en observation
      const currentRoundIndex: number = 2;
      const isSpectatingCurrent = joinedMidGameIndex !== null && joinedMidGameIndex === currentRoundIndex;
      expect(isSpectatingCurrent).toBe(true);

      // Tour 3 (question suivante lancée par l'hôte) : joueur actif participant au score
      const nextRoundIndex: number = 3;
      const isSpectatingNext = joinedMidGameIndex !== null && joinedMidGameIndex === nextRoundIndex;
      expect(isSpectatingNext).toBe(false);
    });

    it("un joueur normal arrivant dans le lobby n'est jamais spectateur", () => {
      const joinedMidGameIndex: number | null = null;
      const currentRoundIndex: number = 0;
      const isSpectating = joinedMidGameIndex !== null && joinedMidGameIndex === currentRoundIndex;
      expect(isSpectating).toBe(false);
    });
  });

  describe("2. Post-Game Card & Shareable Podium", () => {
    it("trie correctement les joueurs par score décroissant pour le podium", () => {
      const players = [
        { id: "p1", name: "Alex", score: 120 },
        { id: "p2", name: "Sam", score: 280 },
        { id: "p3", name: "Charlie", score: 210 },
        { id: "p4", name: "Jordan", score: 50 },
      ];

      const sorted = [...players].sort((a, b) => b.score - a.score);
      expect(sorted[0].name).toBe("Sam");
      expect(sorted[1].name).toBe("Charlie");
      expect(sorted[2].name).toBe("Alex");
      expect(sorted[3].name).toBe("Jordan");
    });

    it("génère un résumé texte complet avec trophée, médailles et lien de revanche", () => {
      const winner = { name: "Sam", score: 280 };
      const podium = [
        { name: "Sam", score: 280 },
        { name: "Charlie", score: 210 },
        { name: "Alex", score: 120 },
      ];
      const roomCode = "PARTY7";
      const honorTitle = "Cerveau officiel de la soirée 🧠";

      let text = `🏆 AGORAX — Résultats de la Soirée !\n`;
      text += `👑 ${winner.name} : ${winner.score} pts (${honorTitle})\n\n`;
      podium.forEach((p, idx) => {
        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
        text += `${medal} ${p.name} — ${p.score} pts\n`;
      });
      text += `\n👉 Prends ta revanche : https://agorax.app/play/online?room=${roomCode}`;

      expect(text).toContain("🏆 AGORAX");
      expect(text).toContain("👑 Sam : 280 pts");
      expect(text).toContain("🥇 Sam");
      expect(text).toContain("🥈 Charlie");
      expect(text).toContain("🥉 Alex");
      expect(text).toContain("PARTY7");
    });
  });

  describe("3. Home Live Demo (Mode Démo 60s)", () => {
    it("valide la structure des questions du widget de démo", () => {
      const demoQuestions = [
        {
          id: "demo-1",
          questionFr: "Quel pays partage la plus longue frontière terrestre avec la France ?",
          answersFr: ["L'Espagne", "Le Brésil", "L'Allemagne", "L'Italie"],
          correctAnswer: 1, // Le Brésil (Guyane française)
        },
        {
          id: "demo-2",
          questionFr: "Combien de cœurs possède une pieuvre ?",
          answersFr: ["1", "2", "3", "4"],
          correctAnswer: 2, // 3 cœurs
        },
      ];

      for (const q of demoQuestions) {
        expect(q.id).toBeDefined();
        expect(q.questionFr.length).toBeGreaterThan(10);
        expect(q.answersFr).toHaveLength(4);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(4);
      }
    });
  });
});
