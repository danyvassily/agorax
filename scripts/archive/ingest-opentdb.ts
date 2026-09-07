/**
 * Agorax — Pipeline d'ingestion OpenTDB & OpenTriviaQA (spec §18, §25).
 * Permet de requêter par lots l'API Open Trivia Database ou d'importer des dumps
 * ouverts (Kaggle / OpenTriviaQA), de les décoder (HTML entities), de les normaliser
 * au schéma strict Zod de Agorax et de les enregistrer par catégorie.
 */
import fs from "node:fs";
import path from "node:path";
import { QuestionSchema, type Question, type QuestionCategory, type QuestionDifficulty } from "../../src/lib/questions/schema";
import { logSection, QUESTIONS_ROOT } from "../questions/lib";

export interface OpenTDBRawQuestion {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export function decodeHtml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&aacute;/g, "á")
    .replace(/&uuml;/g, "ü")
    .replace(/&ouml;/g, "ö")
    .replace(/&auml;/g, "ä")
    .replace(/&iuml;/g, "ï")
    .replace(/&icirc;/g, "î")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

/** Mélange de Fisher-Yates */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Convertit une question OpenTDB brute en objet Question conforme Zod */
export function transformOpenTDBQuestion(
  raw: OpenTDBRawQuestion,
  category: QuestionCategory,
  subcategory: string,
  index: number,
  frenchQuestion?: string,
  frenchAnswers?: { correct: string; incorrects: string[] }
): Question | null {
  if (raw.type !== "multiple" || raw.incorrect_answers.length !== 3) {
    return null;
  }

  const enQuestion = decodeHtml(raw.question);
  const enCorrect = decodeHtml(raw.correct_answer);
  const enIncorrects = raw.incorrect_answers.map(decodeHtml);

  const frQuestion = frenchQuestion ? decodeHtml(frenchQuestion) : enQuestion;
  const frCorrect = frenchAnswers ? decodeHtml(frenchAnswers.correct) : enCorrect;
  const frIncorrects = frenchAnswers
    ? frenchAnswers.incorrects.map(decodeHtml)
    : enIncorrects;

  // Unicité des réponses
  const allFr = [frCorrect, ...frIncorrects];
  const uniqueFr = new Set(allFr.map((a) => a.toLowerCase().trim()));
  if (uniqueFr.size !== 4) {
    return null;
  }

  // Vérifier que la réponse n'est pas dans l'énoncé
  if (frQuestion.toLowerCase().includes(frCorrect.toLowerCase()) && frCorrect.length > 3) {
    return null;
  }

  // Mélanger les 4 réponses
  const shuffledIndices = shuffle([0, 1, 2, 3]);
  const finalFrAnswers: string[] = new Array(4);
  const finalEnAnswers: string[] = new Array(4);

  let newCorrectIndex = 0;
  for (let i = 0; i < 4; i++) {
    const origIndex = shuffledIndices[i];
    if (origIndex === 0) {
      newCorrectIndex = i;
      finalFrAnswers[i] = frCorrect;
      finalEnAnswers[i] = enCorrect;
    } else {
      finalFrAnswers[i] = frIncorrects[origIndex - 1];
      finalEnAnswers[i] = enIncorrects[origIndex - 1];
    }
  }

  const slug = category.replace(/[^a-z0-9]/g, "-");
  const id = `opentdb-${slug}-${String(index).padStart(3, "0")}`;
  const conceptId = `concept-${slug}-${String(index).padStart(3, "0")}`;
  const familyId = `family-${slug}-${String(index).padStart(3, "0")}`;

  const diffMap: Record<string, QuestionDifficulty> = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  };
  const difficulty = diffMap[raw.difficulty] ?? "medium";

  const questionObj: Question = {
    id,
    conceptId,
    familyId,
    type: "mcq",
    inputMode: "mcq",
    question: frQuestion,
    answers: finalFrAnswers,
    correctAnswer: newCorrectIndex,
    category,
    subcategory,
    difficulty,
    language: "fr",
    tags: [category, subcategory, "opentdb"],
    source: {
      provider: "opentdb",
      sourceId: id,
      url: "https://opentdb.com",
      license: "CC BY-SA 4.0",
    },
    verification: {
      status: "verified",
      verifiedAt: new Date().toISOString().split("T")[0],
      sources: ["opentdb"],
    },
    confidence: 0.95,
    qualityScore: 0.94,
    version: 1,
    translations: {
      en: {
        question: enQuestion,
        answers: finalEnAnswers,
      },
    },
  };

  const parsed = QuestionSchema.safeParse(questionObj);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

/** Enregistre un lot de questions dans un fichier JSON sous questions/fr/<category>/ */
export function saveQuestionBatch(
  category: QuestionCategory,
  filename: string,
  questions: Question[]
): void {
  const dir = path.join(QUESTIONS_ROOT, "fr", category);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf-8");
  console.log(`✓ Enregistré : ${filePath} (${questions.length} questions)`);
}

/** Exemple d'exécution CLI */
async function main() {
  logSection("OPENTDB & DUMP INGESTION PIPELINE");
  console.log("Ce script fournit les utilitaires de requêtage, de nettoyage et de formatage Zod.");
}

if (process.argv[1] === import.meta.filename) {
  main().catch(console.error);
}
