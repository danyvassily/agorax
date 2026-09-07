import { describe, expect, it } from "vitest";
import { loadQuestions } from "@/lib/questions/load";
import { localizeQuestion } from "@/lib/questions/localize";
import type { Player } from "@/lib/store/game";
import type { Question } from "@/lib/questions/schema";

describe("Partie multilingue : 1 joueur Anglais + 3 joueurs Français sur 5 questions", () => {
  // Définition des 4 joueurs
  const players: Player[] = [
    { id: "p1", profileToken: "tok-1", name: "Alice (EN)", color: 0, score: 0, correct: 0, wrong: 0, language: "en" },
    { id: "p2", profileToken: "tok-2", name: "Bob (FR)", color: 1, score: 0, correct: 0, wrong: 0, language: "fr" },
    { id: "p3", profileToken: "tok-3", name: "Chloé (FR)", color: 2, score: 0, correct: 0, wrong: 0, language: "fr" },
    { id: "p4", profileToken: "tok-4", name: "David (FR)", color: 3, score: 0, correct: 0, wrong: 0, language: "fr" },
  ];

  // Chargement des catalogues français et anglais
  const frCatalog = loadQuestions("fr").questions;
  const enCatalog = new Map(loadQuestions("en").questions.map((q) => [q.id, q]));

  // Sélection de 5 questions bilingues (présentes en FR et EN avec même correctAnswer)
  const bilingualPool: Question[] = [];
  for (const q of frCatalog) {
    const enQ = enCatalog.get(q.id);
    if (enQ && enQ.correctAnswer === q.correctAnswer && enQ.answers.length === q.answers.length) {
      const bilingualQuestion: Question = {
        ...q,
        translations: {
          ...q.translations,
          en: {
            question: enQ.question,
            answers: enQ.answers,
            explanation: enQ.explanation,
          },
        },
      };
      bilingualPool.push(bilingualQuestion);
      if (bilingualPool.length >= 5) break;
    }
  }

  it("trouve au moins 5 questions bilingues parfaitement synchronisées", () => {
    expect(bilingualPool).toHaveLength(5);
  });

  it("Mode Local (tour par tour sur 1 téléphone) : le joueur actif voit la question et réponses dans sa propre langue", () => {
    // 5 questions, 4 joueurs (p1 EN, p2 FR, p3 FR, p4 FR)
    for (let index = 0; index < 5; index++) {
      const activePlayer = players[index % players.length];
      const playerLanguage = activePlayer.language ?? "fr";
      const rawQuestion = bilingualPool[index];
      const localized = localizeQuestion(rawQuestion, playerLanguage);

      if (activePlayer.language === "en") {
        // Le joueur anglophone (Alice, questions index 0 et 4)
        expect(localized.lang).toBe("en");
        expect(localized.question).toBe(rawQuestion.translations!.en!.question);
        expect(localized.answers).toEqual(rawQuestion.translations!.en!.answers);
        expect(localized.answers[localized.correctAnswer!]).toBe(
          rawQuestion.translations!.en!.answers![rawQuestion.correctAnswer]
        );
        // Vérification qu'il s'agit bien d'anglais et non du texte français
        expect(localized.question).not.toBe(rawQuestion.question);
      } else {
        // Les joueurs francophones (Bob, Chloé, David, questions index 1, 2, 3)
        expect(localized.lang).toBe("fr");
        expect(localized.question).toBe(rawQuestion.question);
        expect(localized.answers).toEqual(rawQuestion.answers);
        expect(localized.answers[localized.correctAnswer!]).toBe(
          rawQuestion.answers[rawQuestion.correctAnswer]
        );
      }

      // La bonne réponse cible le même index pour garantir l'équité
      expect(localized.correctAnswer).toBe(rawQuestion.correctAnswer);
    }
  });

  it("Mode En Ligne (chacun sur son téléphone) : Alice voit l'anglais pendant que Bob, Chloé et David voient le français simultanément sur les 5 questions", () => {
    for (let qIndex = 0; qIndex < 5; qIndex++) {
      const rawQuestion = bilingualPool[qIndex];

      // Vue du joueur 1 (Alice sur son écran en anglais)
      const aliceView = localizeQuestion(rawQuestion, "en");
      expect(aliceView.lang).toBe("en");
      expect(aliceView.question).toBe(rawQuestion.translations!.en!.question);
      expect(aliceView.answers).toEqual(rawQuestion.translations!.en!.answers);

      // Vues des joueurs 2, 3, 4 (Bob, Chloé, David sur leurs écrans en français)
      for (const frenchPlayer of [players[1], players[2], players[3]]) {
        expect(frenchPlayer.language).toBe("fr");
        const frenchView = localizeQuestion(rawQuestion, "fr");
        expect(frenchView.lang).toBe("fr");
        expect(frenchView.question).toBe(rawQuestion.question);
        expect(frenchView.answers).toEqual(rawQuestion.answers);

        // L'index de la réponse correcte est STRICTEMENT identique
        expect(aliceView.correctAnswer).toBe(frenchView.correctAnswer);
        expect(aliceView.answers.length).toBe(frenchView.answers.length);
      }
    }
  });
});
