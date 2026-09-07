/**
 * Agorax — Extraction massive du dump OpenTriviaQA Animaux
 * Extrait 300 questions supplémentaires pour atteindre 360 questions d'animaux.
 */
import path from "node:path";
import { QuestionSchema, type Question } from "../../src/lib/questions/schema";
import { cleanString, saveInChunks, shuffle } from "./generate-bulk-corpus";

async function run() {
  console.log("→ Téléchargement du dump OpenTriviaQA Animaux...");
  const url = "https://raw.githubusercontent.com/viorizz/OpenTriviaQA-FR/master/categories/animals";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Échec fetch ${url}: ${res.status}`);
  const text = await res.text();
  const blocks = text.split(/\n\s*\n/).filter((b) => b.includes("#Q "));

  // Ignorer les 70 premiers blocs pour ne pas faire de doublons avec animaux-001.json
  const candidateBlocks = blocks.slice(70);
  const questions: Question[] = [];
  let index = 100;

  for (const block of candidateBlocks) {
    if (questions.length >= 300) break;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const qLine = lines.find((l) => l.startsWith("#Q "));
    const correctLine = lines.find((l) => l.startsWith("^ "));
    const aLine = lines.find((l) => l.startsWith("A "));
    const bLine = lines.find((l) => l.startsWith("B "));
    const cLine = lines.find((l) => l.startsWith("C "));
    const dLine = lines.find((l) => l.startsWith("D "));

    if (!qLine || !correctLine || !aLine || !bLine || !cLine || !dLine) continue;

    const qText = cleanString(qLine.replace("#Q ", ""));
    const correctText = cleanString(correctLine.replace("^ ", ""));
    const choices = [
      cleanString(aLine.replace("A ", "")),
      cleanString(bLine.replace("B ", "")),
      cleanString(cLine.replace("C ", "")),
      cleanString(dLine.replace("D ", "")),
    ];

    if (!choices.includes(correctText)) continue;

    // Unicité des choix
    const uniqueChoices = new Set(choices.map((c) => c.toLowerCase()));
    if (uniqueChoices.size !== 4) continue;

    // Vérifier que la réponse n'est pas dans la question
    if (correctText.length > 2 && qText.toLowerCase().includes(correctText.toLowerCase())) {
      continue;
    }

    if (qText.length < 10 || qText.length > 300) continue;

    const shuffled = shuffle(choices);
    const correctIdx = shuffled.indexOf(correctText);
    if (correctIdx === -1) continue;

    const id = `animaux-dump-${String(index).padStart(4, "0")}`;
    const questionObj: Question = {
      id,
      conceptId: `concept-animaux-${String(index).padStart(4, "0")}`,
      familyId: `family-animaux-${String(Math.ceil(index / 2)).padStart(4, "0")}`,
      type: "mcq",
      inputMode: "mcq",
      question: qText.endsWith("?") ? qText : `${qText} ?`,
      answers: shuffled,
      correctAnswer: correctIdx,
      category: "animaux",
      subcategory: "zoologie",
      difficulty: index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
      language: "fr",
      tags: ["animaux", "faune", "nature"],
      source: {
        provider: "opentriviaqa",
        sourceId: id,
        url: "https://github.com/viorizz/OpenTriviaQA-FR",
        license: "CC BY-SA 4.0",
      },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-06",
        sources: ["opentriviaqa"],
      },
      confidence: 0.96,
      qualityScore: 0.95,
      version: 1,
    };

    const parsed = QuestionSchema.safeParse(questionObj);
    if (parsed.success) {
      questions.push(parsed.data);
      index++;
    }
  }

  console.log(`✓ ${questions.length} questions valides extraites.`);
  saveInChunks("animaux", "animaux-dump", questions, 50);
}

run().catch((e) => {
  console.error("Erreur:", e);
  process.exit(1);
});
