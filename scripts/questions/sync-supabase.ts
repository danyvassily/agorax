/**
 * scripts/questions/sync-supabase.ts
 * Synchronise l'intégralité du catalogue de questions (FR) et de traductions (EN)
 * avec la base PostgreSQL Supabase distante.
 */
import fs from "node:fs";
import { loadQuestions } from "./lib";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/SUPABASE_ACCESS_TOKEN=([^\s]+)/);
if (!match || !match[1]) {
  console.error("❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local");
  process.exit(1);
}
const token = match[1];
const PROJECT_ID = "qkzcuepxissfybhvgqrk";

async function executeSql(query: string): Promise<any> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase query error (${res.status}): ${errText}`);
  }
  return res.json();
}

function esc(s: string | undefined | null): string {
  if (s === undefined || s === null) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function escArr(a: string[] | undefined): string {
  if (!a || a.length === 0) return "'{}'";
  return "'{" + a.map((x) => x.replace(/"/g, '\\"').replace(/,/g, "\\,")).join(",") + "}'";
}

function escJson(v: unknown): string {
  if (v === undefined || v === null) return "'[]'";
  return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
}

async function main() {
  console.log("🚀 Démarrage de la synchronisation Supabase...");

  const frDataset = loadQuestions("fr");
  const enDataset = loadQuestions("en");

  console.log(`📦 Catalogue FR local : ${frDataset.questions.length} questions`);
  console.log(`📦 Catalogue EN local : ${enDataset.questions.length} questions`);

  // 1. Synchroniser question_families
  const familyMap = new Map<string, { knowledgeKey: string; category: string; subcategory: string }>();
  for (const q of [...frDataset.questions, ...enDataset.questions]) {
    if (!familyMap.has(q.familyId)) {
      familyMap.set(q.familyId, {
        knowledgeKey: q.knowledgeKey ?? q.familyId,
        category: q.category,
        subcategory: q.subcategory ?? "",
      });
    }
  }
  const familyEntries = Array.from(familyMap.entries());
  console.log(`🔄 Enregistrement de ${familyEntries.length} familles...`);
  const BATCH_FAM = 200;
  for (let i = 0; i < familyEntries.length; i += BATCH_FAM) {
    const chunk = familyEntries.slice(i, i + BATCH_FAM);
    const values = chunk.map(([id, meta]) => `(${esc(id)}, ${esc(meta.knowledgeKey)}, ${esc(meta.category)}, ${esc(meta.subcategory)}, ${esc(meta.subcategory)})`).join(",");
    await executeSql(`INSERT INTO public.question_families (id, knowledge_key, category, topic, subcategory) VALUES ${values} ON CONFLICT (id) DO NOTHING;`);
  }

  // 2. Synchroniser question_concepts
  const allConcepts = new Set([
    ...frDataset.questions.map((q) => q.conceptId),
    ...enDataset.questions.map((q) => q.conceptId),
  ]);
  const conceptList = Array.from(allConcepts);
  console.log(`🔄 Enregistrement de ${conceptList.length} concepts...`);
  const BATCH_CON = 500;
  for (let i = 0; i < conceptList.length; i += BATCH_CON) {
    const chunk = conceptList.slice(i, i + BATCH_CON);
    const values = chunk.map((c) => `(${esc(c)}, ${esc(c)})`).join(",");
    await executeSql(`INSERT INTO public.question_concepts (id, label) VALUES ${values} ON CONFLICT (id) DO NOTHING;`);
  }

  // 3. Upsert questions FR dans public.questions
  console.log(`🔄 Synchronisation de ${frDataset.questions.length} questions dans public.questions...`);
  const BATCH_Q = 100;
  for (let i = 0; i < frDataset.questions.length; i += BATCH_Q) {
    const chunk = frDataset.questions.slice(i, i + BATCH_Q);
    const values = chunk
      .map((q) => {
        return `(${esc(q.id)}, ${esc(q.conceptId)}, ${esc(q.familyId)}, ${esc(q.type)}, ${esc(
          q.inputMode ?? "mcq",
        )}, ${esc(q.question)}, ${escJson(q.answers)}, ${q.correctAnswer}, ${esc(q.category)}, ${esc(
          q.subcategory ?? "general",
        )}, ${esc(q.difficulty)}, 'fr', ${escArr(q.tags)}, ${esc(q.source.provider)}, ${esc(
          q.source.license,
        )}, ${esc(q.verification.status)}, ${q.confidence ?? 0.95}, ${q.qualityScore ?? 0.95}, ${esc(
          q.verification.status === "verified" ? "verified" : "review",
        )}, ${esc(q.explanation ?? "")}, true, 1)`;
      })
      .join(",");

    const query = `
      INSERT INTO public.questions (
        id, concept_id, family_id, type, input_mode, question, answers, correct_answer,
        category, subcategory, difficulty, language, tags, source_provider, source_license,
        verification_status, confidence, quality_score, state, explanation, active, version
      ) VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET
        question = excluded.question,
        answers = excluded.answers,
        correct_answer = excluded.correct_answer,
        category = excluded.category,
        subcategory = excluded.subcategory,
        difficulty = excluded.difficulty,
        state = excluded.state,
        explanation = excluded.explanation,
        active = excluded.active;
    `;
    await executeSql(query);
    process.stdout.write(`  Questions FR : ${Math.min(i + BATCH_Q, frDataset.questions.length)}/${frDataset.questions.length}\r`);
  }
  console.log("\n✓ Questions FR synchronisées.");

  // 4. Upsert questions EN exclusives (ex: english-capitals)
  const frIdSet = new Set(frDataset.questions.map((q) => q.id));
  const enExclusive = enDataset.questions.filter((q) => !frIdSet.has(q.id));
  if (enExclusive.length > 0) {
    console.log(`🔄 Enregistrement de ${enExclusive.length} questions exclusives EN...`);
    const values = enExclusive
      .map((q) => {
        return `(${esc(q.id)}, ${esc(q.conceptId)}, ${esc(q.familyId)}, ${esc(q.type)}, ${esc(
          q.inputMode ?? "mcq",
        )}, ${esc(q.question)}, ${escJson(q.answers)}, ${q.correctAnswer}, ${esc(q.category)}, ${esc(
          q.subcategory ?? "general",
        )}, ${esc(q.difficulty)}, 'en', ${escArr(q.tags)}, ${esc(q.source.provider)}, ${esc(
          q.source.license,
        )}, ${esc(q.verification.status)}, ${q.confidence ?? 0.95}, ${q.qualityScore ?? 0.95}, ${esc(
          q.verification.status === "verified" ? "verified" : "review",
        )}, ${esc(q.explanation ?? "")}, true, 1)`;
      })
      .join(",");
    await executeSql(`
      INSERT INTO public.questions (
        id, concept_id, family_id, type, input_mode, question, answers, correct_answer,
        category, subcategory, difficulty, language, tags, source_provider, source_license,
        verification_status, confidence, quality_score, state, explanation, active, version
      ) VALUES ${values}
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ Questions exclusives EN synchronisées.");
  }

  // 5. Upsert question_translations (Anglais)
  console.log(`🔄 Synchronisation de ${enDataset.questions.length} traductions EN dans public.question_translations...`);
  const BATCH_TR = 100;
  for (let i = 0; i < enDataset.questions.length; i += BATCH_TR) {
    const chunk = enDataset.questions.slice(i, i + BATCH_TR);
    const values = chunk
      .map((q) => {
        return `(${esc(q.id)}, 'en', ${esc(q.question)}, ${escJson(q.answers)}, ${q.correctAnswer})`;
      })
      .join(",");

    const query = `
      INSERT INTO public.question_translations (
        question_id, language, question, answers, correct_answer
      ) VALUES ${values}
      ON CONFLICT (question_id, language) DO UPDATE SET
        question = excluded.question,
        answers = excluded.answers,
        correct_answer = excluded.correct_answer;
    `;
    await executeSql(query);
    process.stdout.write(`  Traductions EN : ${Math.min(i + BATCH_TR, enDataset.questions.length)}/${enDataset.questions.length}\r`);
  }
  console.log("\n✓ Traductions EN synchronisées.");

  // 6. Vérification des totaux dans Supabase
  console.log("\n━━━ BILAN POST-SYNCHRONISATION SUPABASE ━━━");
  const qStats = await executeSql("SELECT count(*) as total, language FROM public.questions GROUP BY language;");
  console.log("Questions dans public.questions :", qStats);

  const tStats = await executeSql("SELECT count(*) as total, language FROM public.question_translations GROUP BY language;");
  console.log("Traductions dans public.question_translations :", tStats);

  console.log("\n✨ Synchronisation terminée avec succès !");
}

main().catch((err) => {
  console.error("❌ Erreur pendant la synchronisation :", err);
  process.exit(1);
});
