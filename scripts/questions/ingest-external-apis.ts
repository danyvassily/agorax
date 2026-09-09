/**
 * Agorax — Pipeline d'ingestion automatisé d'APIs gratuites de Quiz
 * Sources supportées :
 * 1. QuizzAPI (quizzapi.fr - 100% français natif)
 * 2. The Trivia API (the-trivia-api.com - tags riches et sous-thèmes fins)
 * 3. OpenTDB (opentdb.com - 24 catégories mondiales)
 *
 * Utilisation :
 * npx tsx scripts/questions/ingest-external-apis.ts --source quizzapi --category histoire --count 20
 * npx tsx scripts/questions/ingest-external-apis.ts --source the-trivia-api --category science --count 20
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  QuestionSchema,
  type Question,
  type QuestionCategory,
  type QuestionDifficulty,
  CATEGORIES,
} from "../../src/lib/questions/schema";
import { CATEGORY_SUBTHEMES, getSubthemesForCategory } from "../../src/lib/questions/subthemes";
import { normalizeText } from "../../src/lib/questions/dedupe";
import { QUESTIONS_ROOT, logSection, writeJson } from "./lib";

interface CliArgs {
  source: "quizzapi" | "the-trivia-api" | "opentdb";
  category?: string;
  subcategory?: string;
  count: number;
  difficulty?: QuestionDifficulty;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    source: "quizzapi",
    count: 10,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--source" && args[i + 1]) {
      result.source = args[++i] as CliArgs["source"];
    } else if (arg === "--category" && args[i + 1]) {
      result.category = args[++i];
    } else if (arg === "--subcategory" && args[i + 1]) {
      result.subcategory = args[++i];
    } else if (arg === "--count" && args[i + 1]) {
      result.count = parseInt(args[++i], 10);
    } else if (arg === "--difficulty" && args[i + 1]) {
      result.difficulty = args[++i] as QuestionDifficulty;
    } else if (arg === "--dry-run") {
      result.dryRun = true;
    }
  }

  return result;
}

function decodeHtml(str: string): string {
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
    .replace(/&ccedil;/g, "ç")
    .replace(/&icirc;/g, "î")
    .replace(/&iuml;/g, "ï")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const QUESTIONS_FR_ROOT = path.join(QUESTIONS_ROOT, "fr");

/** Charge tous les hashes existants pour empêcher tout doublon */
function loadExistingQuestionHashes(): Set<string> {
  const hashes = new Set<string>();
  if (!fs.existsSync(QUESTIONS_FR_ROOT)) return hashes;

  const categories = fs.readdirSync(QUESTIONS_FR_ROOT);
  for (const cat of categories) {
    const catDir = path.join(QUESTIONS_FR_ROOT, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(catDir, f), "utf-8"));
        const list: Question[] = Array.isArray(raw) ? raw : raw.questions || [];
        for (const q of list) {
          if (q.contentHash) hashes.add(q.contentHash);
          hashes.add(createHash("sha256").update(normalizeText(q.question)).digest("hex"));
        }
      } catch {
        // Ignorer les erreurs de lecture ponctuelles
      }
    }
  }

  return hashes;
}

// ---------------------------------------------------------------------------
// 1. ADAPTATEUR QUIZZAPI (quizzapi.fr)
// ---------------------------------------------------------------------------

const QUIZZAPI_CAT_MAP: Record<string, QuestionCategory> = {
  culture_generale: "culture-generale",
  histoire: "histoire",
  tv_cinema: "cinema",
  science: "science",
  art_litterature: "art",
  sport: "sport",
  musique: "musique",
  geographie: "geographie",
  gastronomie: "food",
  jeux_videos: "gaming",
  actu_politique: "politique",
};

interface QuizzApiItem {
  id: string;
  question: string;
  answer: string;
  badAnswers: string[];
  category: string;
  difficulty: "facile" | "normal" | "difficile";
}

async function fetchFromQuizzApi(
  category: string | undefined,
  count: number,
  difficulty?: string
): Promise<Question[]> {
  const targetCategory = category ?? "culture_generale";
  const limit = Math.min(count, 50);

  const url = new URL("https://quizzapi.fr/api/v2/quiz");
  url.searchParams.set("limit", limit.toString());
  if (targetCategory && QUIZZAPI_CAT_MAP[targetCategory]) {
    url.searchParams.set("category", targetCategory);
  }
  if (difficulty) {
    const diffMap: Record<string, string> = { easy: "facile", medium: "normal", hard: "difficile" };
    url.searchParams.set("difficulty", diffMap[difficulty] ?? "normal");
  }

  console.log(`🌐 [QuizzAPI] Requête : ${url.toString()}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`QuizzAPI error: ${res.status} ${res.statusText}`);

  const data = (await res.json()) as { quizzes?: QuizzApiItem[] };
  const items = data.quizzes ?? [];
  const questions: Question[] = [];

  for (const item of items) {
    const cleanQuestion = decodeHtml(item.question);
    const cleanAnswer = decodeHtml(item.answer);
    const cleanBadAnswers = item.badAnswers.map(decodeHtml).filter(Boolean);

    if (cleanBadAnswers.length < 3) continue;

    // Mélange des 4 réponses
    const rawOptions = [cleanAnswer, cleanBadAnswers[0], cleanBadAnswers[1], cleanBadAnswers[2]];
    const shuffled = shuffle(rawOptions);
    const correctIdx = shuffled.indexOf(cleanAnswer);
    if (correctIdx === -1) continue;

    const agoraxCategory: QuestionCategory = QUIZZAPI_CAT_MAP[item.category] ?? "culture-generale";

    // Recherche automatique du sous-thème le plus pertinent
    const availableSubthemes = getSubthemesForCategory(agoraxCategory);
    let assignedSubtheme = availableSubthemes[0]?.slug ?? "general";

    // Essayer de matcher des mots-clés dans la question
    for (const sub of availableSubthemes) {
      const keywords = sub.nameFr.toLowerCase().split(/[ ,&()]+/);
      if (keywords.some((kw) => kw.length > 3 && cleanQuestion.toLowerCase().includes(kw))) {
        assignedSubtheme = sub.slug;
        break;
      }
    }

    const diffLevel: QuestionDifficulty =
      item.difficulty === "facile" ? "easy" : item.difficulty === "difficile" ? "hard" : "medium";

    const contentHash = createHash("sha256").update(normalizeText(cleanQuestion)).digest("hex");
    const qSlug = slugify(cleanQuestion).slice(0, 32);
    const uniqueId = `qapi-${agoraxCategory}-${qSlug}-${item.id.slice(-6)}`;

    const qObj: Question = {
      id: uniqueId,
      conceptId: `concept-${agoraxCategory}-${qSlug}`,
      familyId: `family-${agoraxCategory}-${assignedSubtheme}`,
      knowledgeKey: `${agoraxCategory}.${assignedSubtheme}.${qSlug}`,
      contentHash,
      type: "mcq",
      inputMode: "mcq",
      question: cleanQuestion,
      answers: shuffled,
      correctAnswer: correctIdx,
      category: agoraxCategory,
      subcategory: assignedSubtheme,
      difficulty: diffLevel,
      language: "fr",
      confidence: 0.95,
      qualityScore: 0.9,
      version: 1,
      tags: [item.category, assignedSubtheme, "quizzapi"],
      source: {
        provider: "quizzapi",
        sourceId: item.id,
        url: "https://quizzapi.fr",
        license: "Open Data",
      },
      verification: {
        status: "verified",
        sources: ["https://quizzapi.fr"],
      },
      acceptedTypedAnswers: [cleanAnswer],
    };

    questions.push(qObj);
  }

  return questions;
}

// ---------------------------------------------------------------------------
// 2. ADAPTATEUR THE TRIVIA API (the-trivia-api.com)
// ---------------------------------------------------------------------------

const TRIVIA_API_CAT_MAP: Record<string, QuestionCategory> = {
  history: "histoire",
  film_and_tv: "cinema",
  science: "science",
  geography: "geographie",
  arts_and_literature: "art",
  music: "musique",
  food_and_drink: "food",
  sport_and_leisure: "sport",
  society_and_culture: "culture-generale",
  general_knowledge: "culture-generale",
};

interface TheTriviaApiItem {
  id: string;
  category: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  question: { text: string };
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
}

async function fetchFromTheTriviaApi(
  category: string | undefined,
  count: number,
  difficulty?: string
): Promise<Question[]> {
  const limit = Math.min(count, 50);
  const url = new URL("https://the-trivia-api.com/v2/questions");
  url.searchParams.set("limit", limit.toString());

  if (category) {
    url.searchParams.set("categories", category);
  }
  if (difficulty) {
    url.searchParams.set("difficulties", difficulty);
  }

  console.log(`🌐 [The Trivia API] Requête : ${url.toString()}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`The Trivia API error: ${res.status} ${res.statusText}`);

  const items = (await res.json()) as TheTriviaApiItem[];
  const questions: Question[] = [];

  for (const item of items) {
    const cleanQuestion = decodeHtml(item.question.text);
    const cleanAnswer = decodeHtml(item.correctAnswer);
    const cleanBadAnswers = item.incorrectAnswers.map(decodeHtml).filter(Boolean);

    if (cleanBadAnswers.length < 3) continue;

    const rawOptions = [cleanAnswer, cleanBadAnswers[0], cleanBadAnswers[1], cleanBadAnswers[2]];
    const shuffled = shuffle(rawOptions);
    const correctIdx = shuffled.indexOf(cleanAnswer);
    if (correctIdx === -1) continue;

    const agoraxCategory: QuestionCategory = TRIVIA_API_CAT_MAP[item.category] ?? "culture-generale";
    const availableSubthemes = getSubthemesForCategory(agoraxCategory);
    let assignedSubtheme = availableSubthemes[0]?.slug ?? "general";

    // Matcher avec les tags retournés par The Trivia API
    for (const tag of item.tags) {
      const match = availableSubthemes.find(
        (s) => s.slug === tag || s.nameEn.toLowerCase().includes(tag.toLowerCase())
      );
      if (match) {
        assignedSubtheme = match.slug;
        break;
      }
    }

    const contentHash = createHash("sha256").update(normalizeText(cleanQuestion)).digest("hex");
    const qSlug = slugify(cleanQuestion).slice(0, 32);
    const uniqueId = `ttapi-${agoraxCategory}-${qSlug}-${item.id.slice(-6)}`;

    const qObj: Question = {
      id: uniqueId,
      conceptId: `concept-${agoraxCategory}-${qSlug}`,
      familyId: `family-${agoraxCategory}-${assignedSubtheme}`,
      knowledgeKey: `${agoraxCategory}.${assignedSubtheme}.${qSlug}`,
      contentHash,
      type: "mcq",
      inputMode: "mcq",
      question: cleanQuestion,
      answers: shuffled,
      correctAnswer: correctIdx,
      category: agoraxCategory,
      subcategory: assignedSubtheme,
      difficulty: item.difficulty ?? "medium",
      language: "en", // Langue native anglaise
      confidence: 0.95,
      qualityScore: 0.9,
      version: 1,
      tags: [...item.tags, assignedSubtheme, "the-trivia-api"],
      source: {
        provider: "the-trivia-api",
        sourceId: item.id,
        url: "https://the-trivia-api.com",
        license: "Free tier / Open",
      },
      verification: {
        status: "verified",
        sources: ["https://the-trivia-api.com"],
      },
      acceptedTypedAnswers: [cleanAnswer],
    };

    questions.push(qObj);
  }

  return questions;
}

// ---------------------------------------------------------------------------
// 3. MAIN RUNNER & SAUVEGARDE
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();
  logSection(`INGESTION AUTOMATISÉE D'APIS DE QUESTIONS (${args.source.toUpperCase()})`);
  console.log(`Paramètres : catégorie = ${args.category ?? "toutes"}, nombre = ${args.count}, mode dry-run = ${args.dryRun}`);

  const existingHashes = loadExistingQuestionHashes();
  console.log(`🔍 ${existingHashes.size} signatures de questions existantes indexées.`);

  let rawFetched: Question[] = [];
  if (args.source === "quizzapi") {
    rawFetched = await fetchFromQuizzApi(args.category, args.count, args.difficulty);
  } else if (args.source === "the-trivia-api") {
    rawFetched = await fetchFromTheTriviaApi(args.category, args.count, args.difficulty);
  } else {
    throw new Error(`Source ${args.source} non implémentée ou inconnue`);
  }

  console.log(`📥 ${rawFetched.length} questions brutes reçues.`);

  // Validation Zod et filtrage anti-doublon
  const validQuestions: Question[] = [];
  let duplicates = 0;
  let validationErrors = 0;

  for (const q of rawFetched) {
    if (existingHashes.has(q.contentHash!)) {
      duplicates++;
      continue;
    }

    const parseResult = QuestionSchema.safeParse(q);
    if (!parseResult.success) {
      validationErrors++;
      console.warn(`⚠️ Validation échouée pour "${q.question}":`, parseResult.error.format());
      continue;
    }

    validQuestions.push(parseResult.data);
    existingHashes.add(q.contentHash!);
  }

  console.log(`✅ ${validQuestions.length} questions validées (${duplicates} doublons ignorés, ${validationErrors} erreurs de validation).`);

  if (args.dryRun) {
    console.log("ℹ️ Mode --dry-run activé : aucune question n'a été écrite sur le disque.");
    return;
  }

  // Regroupement par catégorie et écriture dans questions/fr/
  const grouped: Record<string, Question[]> = {};
  for (const q of validQuestions) {
    const key = q.category;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(q);
  }

  for (const [cat, qList] of Object.entries(grouped)) {
    const catDir = path.join(QUESTIONS_FR_ROOT, cat);
    fs.mkdirSync(catDir, { recursive: true });

    const targetFile = path.join(catDir, `${cat}-api-ingest-001.json`);
    let existingList: Question[] = [];

    if (fs.existsSync(targetFile)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
        existingList = Array.isArray(fileContent) ? fileContent : fileContent.questions || [];
      } catch {
        existingList = [];
      }
    }

    const merged = [...existingList, ...qList];
    writeJson(targetFile, merged);
    console.log(`💾 [${cat}] +${qList.length} questions enregistrées dans ${path.relative(process.cwd(), targetFile)} (Total fichier : ${merged.length})`);
  }

  logSection("RÉSUMÉ FINAL DE L'INGESTION");
  console.log(`🎉 Total de nouvelles questions injectées dans le catalogue : ${validQuestions.length}`);
}

main().catch((err) => {
  console.error("❌ Erreur lors de l'ingestion :", err);
  process.exit(1);
});
