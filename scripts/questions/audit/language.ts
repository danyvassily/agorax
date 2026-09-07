/**
 * questions:audit:language — Audit linguistique automatisé des datasets (FR & EN).
 * Analyse les questions et réponses pour détecter les incohérences de langue
 * (ex: question en anglais présente dans questions/fr/).
 *
 * Sortie : console formatée + questions/.audit-language.json.
 * Exit code : 1 si mismatch détecté, 0 si conforme.
 */
import fs from "node:fs";
import path from "node:path";
import { QUESTIONS_ROOT, logSection, writeJson } from "../lib";

interface MismatchReport {
  file: string;
  questionId: string;
  expected: "fr" | "en";
  detected: "fr" | "en";
  confidence: number;
  questionText: string;
}

const FR_TOKENS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "dans", "qui", "que", "quel", "quelle",
  "quels", "quelles", "est", "sont", "pour", "avec", "sur", "par", "ce", "cette", "ces",
  "ou", "où", "a", "au", "aux", "en", "été", "fut", "ont", "fait", "nom", "entre",
  "deux", "pays", "ville", "siecle", "siècle", "capitale", "premier", "premiere", "première",
  "lequel", "laquelle", "lesquels", "lesquelles", "parmi", "terme", "quand", "comment", "pourquoi",
  "signifie", "abreviation", "abbreviation", "selon", "trouve", "situe", "combien", "comme", "aussi",
  "appele", "espece", "partie", "animaux", "animal", "plus", "moins", "vers", "apres", "avant"
]);

const EN_TOKENS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "what", "which", "who", "where", "when",
  "why", "how", "in", "on", "of", "to", "for", "with", "by", "from", "at", "as", "into",
  "and", "or", "name", "country", "city", "century", "first", "capital", "known", "called",
  "most", "about", "state", "world", "between", "these", "this", "their", "statement", "untrue",
  "following", "does", "did", "have", "has", "had"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function detectLanguage(text: string): {
  detected: "fr" | "en" | "neutral";
  confidence: number;
  frScore: number;
  enScore: number;
} {
  const tokens = tokenize(text);
  let frScore = 0;
  let enScore = 0;

  for (const t of tokens) {
    if (FR_TOKENS.has(t)) frScore++;
    if (EN_TOKENS.has(t)) enScore++;
  }

  const total = frScore + enScore;
  if (total === 0) {
    return { detected: "neutral", confidence: 0, frScore: 0, enScore: 0 };
  }

  if (frScore > enScore) {
    const confidence = Number(((frScore - enScore) / total).toFixed(2));
    return { detected: "fr", confidence, frScore, enScore };
  }
  if (enScore > frScore) {
    const confidence = Number(((enScore - frScore) / total).toFixed(2));
    return { detected: "en", confidence, frScore, enScore };
  }
  return { detected: "neutral", confidence: 0, frScore, enScore };
}

export function auditCatalogLanguage(): {
  totalChecked: number;
  mismatches: MismatchReport[];
} {
  const mismatches: MismatchReport[] = [];
  let totalChecked = 0;

  for (const expectedLang of ["fr", "en"] as const) {
    const langDir = path.join(QUESTIONS_ROOT, expectedLang);
    if (!fs.existsSync(langDir)) continue;

    const categories = fs
      .readdirSync(langDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const cat of categories) {
      const catDir = path.join(langDir, cat);
      const files = fs
        .readdirSync(catDir)
        .filter((f) => f.endsWith(".json"))
        .sort();

      for (const file of files) {
        const filePath = path.join(catDir, file);
        const relPath = path.relative(QUESTIONS_ROOT, filePath);
        try {
          const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          const items = Array.isArray(raw) ? raw : [raw];

          for (const item of items) {
            totalChecked++;
            // 1. Détection prioritaire sur l'énoncé de la question
            let detection = detectLanguage(item.question ?? "");
            // 2. Si l'énoncé est neutre ou trop court, enrichir avec les réponses
            if (detection.detected === "neutral" || (detection.frScore === 0 && detection.enScore === 0)) {
              const fullSample = `${item.question ?? ""} ${(item.answers ?? []).join(" ")}`;
              detection = detectLanguage(fullSample);
            }

            if (
              detection.detected !== "neutral" &&
              detection.detected !== expectedLang &&
              detection.confidence >= 0.6 &&
              (detection.frScore >= 2 || detection.enScore >= 2)
            ) {
              mismatches.push({
                file: relPath,
                questionId: item.id || "unknown",
                expected: expectedLang,
                detected: detection.detected,
                confidence: detection.confidence,
                questionText: item.question || "",
              });
            }
          }
        } catch {
          // Erreurs JSON gérées par questions:validate
        }
      }
    }
  }

  return { totalChecked, mismatches };
}

if (process.argv[1]?.endsWith("language.ts") || process.argv[1]?.endsWith("language.js")) {
  logSection("AUDIT LINGUISTIQUE DES DATASETS");
  const { totalChecked, mismatches } = auditCatalogLanguage();

  console.log(`Questions inspectées : ${totalChecked}`);
  console.log(`Incohérences de langue détectées : ${mismatches.length}`);

  if (mismatches.length > 0) {
    console.log("\n--- DÉTAIL DES ANOMALIES (LANGUAGE_MISMATCH) ---");
    for (const m of mismatches) {
      console.log(
        `LANGUAGE_MISMATCH file: ${m.file} questionId: ${m.questionId} expected: ${m.expected} detected: ${m.detected} confidence: ${m.confidence}`,
      );
      console.log(`   question: "${m.questionText.slice(0, 80)}..."\n`);
    }

    writeJson("questions/.audit-language.json", {
      auditedAt: new Date().toISOString(),
      totalChecked,
      mismatchCount: mismatches.length,
      mismatches,
    });
    console.log("Rapport consigné dans questions/.audit-language.json");
    process.exit(1);
  } else {
    console.log("\n✓ Toutes les questions correspondent rigoureusement à la langue de leur catalogue.");
    writeJson("questions/.audit-language.json", {
      auditedAt: new Date().toISOString(),
      totalChecked,
      mismatchCount: 0,
      mismatches: [],
    });
    process.exit(0);
  }
}
