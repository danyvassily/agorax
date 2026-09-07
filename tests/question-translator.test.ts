import { describe, it, expect } from "vitest";
import {
  translateQuestionText,
  translateAnswerChoice,
  translateQuestionToEnglish,
} from "@/lib/questions/translator";
import { localizeQuestion, type LocalizableQuestion } from "@/lib/questions/localize";

describe("Question Translator (FR -> EN)", () => {
  it("translates capital questions correctly", () => {
    const fr = "Quelle est la capitale de l'Australie ?";
    const en = translateQuestionText(fr);
    expect(en).toBe("What is the capital of Australia?");
  });

  it("translates city location questions correctly", () => {
    const fr = "Dans quelle ville se trouve le Colisée ?";
    const en = translateQuestionText(fr);
    expect(en).toBe("In which city is le Colisée located?");
  });

  it("translates 'Who painted / wrote / created' questions correctly", () => {
    const fr = "Qui a peint La Joconde ?";
    const en = translateQuestionText(fr);
    expect(en).toBe("Who painted La Joconde?");
  });

  it("translates 'chemical symbol' questions correctly", () => {
    const fr = "Quel est le symbole chimique de l'or ?";
    const en = translateQuestionText(fr);
    expect(en).toBe("What is the chemical symbol for Gold?");
  });

  it("translates answer choices and removes French articles where appropriate", () => {
    expect(translateAnswerChoice("La France")).toBe("France");
    expect(translateAnswerChoice("L'Espagne")).toBe("Spain");
    expect(translateAnswerChoice("Les États-Unis")).toBe("the United States");
    expect(translateAnswerChoice("Le fer")).toBe("Iron");
    expect(translateAnswerChoice("L'hydrogène")).toBe("Hydrogen");
    expect(translateAnswerChoice("Le réalisateur")).toBe("réalisateur");
  });

  it("translates a full question object while preserving all 4 answers and order", () => {
    const rawQ: LocalizableQuestion = {
      question: "Quel pays a remporté la Coupe du monde de football en 2010 ?",
      answers: ["L'Espagne", "Les Pays-Bas", "L'Allemagne", "Le Brésil"],
      correctAnswer: 0,
      explanation: "L'Espagne a remporté son premier titre mondial en 2010.",
    };

    const translated = translateQuestionToEnglish(rawQ);
    expect(translated.question).toContain("Which country won");
    expect(translated.answers).toHaveLength(4);
    expect(translated.answers![0]).toBe("Spain");
    expect(translated.answers![1]).toBe("Netherlands");
    expect(translated.answers![2]).toBe("Germany");
    expect(translated.answers![3]).toBe("Brazil");
  });

  it("handles a bilingual multiplayer room round seamlessly", () => {
    // Shared question object broadcast by the host in an online room
    const sessionQuestion: LocalizableQuestion = {
      question: "Quel est le plus grand océan de la Terre ?",
      answers: ["L'océan Pacifique", "L'océan Atlantique", "L'océan Indien", "L'océan Arctique"],
      correctAnswer: 0,
      explanation: "L'océan Pacifique couvre plus d'un tiers de la surface du globe.",
    };

    // French player
    const frView = localizeQuestion(sessionQuestion, "fr");
    expect(frView.lang).toBe("fr");
    expect(frView.question).toBe("Quel est le plus grand océan de la Terre ?");
    expect(frView.answers[0]).toBe("L'océan Pacifique");
    expect(frView.correctAnswer).toBe(0);

    // English player
    const enView = localizeQuestion(sessionQuestion, "en", { autoTranslate: true });
    expect(enView.lang).toBe("en");
    expect(enView.question).toContain("largest");
    expect(enView.answers[0]).toContain("Pacifique");
    expect(enView.correctAnswer).toBe(0);

    // Both players have identical correctAnswer index (0)
    expect(frView.correctAnswer).toBe(enView.correctAnswer);
  });
});
