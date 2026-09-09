import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/questions/schema";
import {
  CATEGORY_SUBTHEMES,
  getSubthemesForCategory,
  getSubthemeMeta,
  subthemeLabel,
} from "@/lib/questions/subthemes";
import fs from "node:fs";
import path from "node:path";
import { parseQuestionBatch } from "@/lib/questions/schema";

describe("Subthemes & External Ingestion Architecture", () => {
  it("defines subthemes for all 26 official categories", () => {
    expect(Object.keys(CATEGORY_SUBTHEMES).length).toBe(26);
    for (const category of CATEGORIES) {
      const subthemes = getSubthemesForCategory(category);
      expect(subthemes.length, `Category ${category} should have at least 1 subtheme`).toBeGreaterThan(0);

      for (const sub of subthemes) {
        expect(sub.slug).toMatch(/^[a-z0-9-]+$/);
        expect(sub.nameFr.length).toBeGreaterThan(2);
        expect(sub.nameEn.length).toBeGreaterThan(2);
        expect(sub.icon).toBeDefined();
      }
    }
  });

  it("retrieves specific subtheme metadata and formats labels bilingually", () => {
    const meta = getSubthemeMeta("cinema", "films-cultes");
    expect(meta).toBeDefined();
    expect(meta?.nameFr).toBe("Films Cultes");
    expect(meta?.nameEn).toBe("Cult Movies");

    expect(subthemeLabel("cinema", "films-cultes", "fr")).toBe("Films Cultes");
    expect(subthemeLabel("cinema", "films-cultes", "en")).toBe("Cult Movies");

    // Fallback on unknown slug
    expect(subthemeLabel("cinema", "unknown-slug-test", "fr")).toBe("Unknown Slug Test");
  });

  it("validates newly ingested questions files against strict Zod schema", () => {
    const questionsFrDir = path.join(process.cwd(), "questions/fr");
    const categories = ["histoire", "science", "cinema", "politique", "food", "sport", "culture-generale"];

    for (const cat of categories) {
      const apiFile = path.join(questionsFrDir, cat, `${cat}-api-ingest-001.json`);
      if (fs.existsSync(apiFile)) {
        const raw = JSON.parse(fs.readFileSync(apiFile, "utf-8"));
        const batch = parseQuestionBatch(raw);
        expect(batch.ok, `File ${apiFile} should be valid Zod batch`).toBe(true);
        expect(batch.questions.length).toBeGreaterThan(0);

        for (const q of batch.questions) {
          expect(q.category).toBe(cat);
          expect(q.subcategory.length).toBeGreaterThan(0);
          expect(q.answers).toHaveLength(4);
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
          expect(q.correctAnswer).toBeLessThanOrEqual(3);
          expect(q.contentHash).toMatch(/^[a-f0-9]{64}$/);
        }
      }
    }
  });

  it("filters questions accurately by subcategory in selection engine", async () => {
    const { selectQuestions } = await import("@/lib/questions/selection");
    const { loadQuestions } = await import("@/lib/questions/load");

    const pool = loadQuestions("fr").questions;
    // Test with geographie
    const geoPool = pool.filter((q) => q.category === "geographie");
    expect(geoPool.length).toBeGreaterThan(10);

    const capitalesResult = selectQuestions(geoPool, [], {
      count: 5,
      categories: ["geographie"],
      subcategories: ["capitales"],
    });

    expect(capitalesResult.questions.length).toBeGreaterThan(0);
    for (const q of capitalesResult.questions) {
      const match =
        q.subcategory.toLowerCase() === "capitales" ||
        q.tags?.some((t) => t.toLowerCase() === "capitales");
      expect(match).toBe(true);
    }
  });

  it("progressively falls back to parent category if subcategory pool is smaller than requested count", async () => {
    const { getUnseenQuestions } = await import("@/lib/questions/question-selection-service");
    const { loadQuestions } = await import("@/lib/questions/load");

    const pool = loadQuestions("fr").questions;
    const result = getUnseenQuestions({
      pool,
      participantHistories: [],
      count: 10,
      categories: ["cinema"],
      subcategories: ["films-cultes"],
      progressiveFallback: true,
    });

    expect(result.questions.length).toBe(10);
    expect(result.questions.every((q) => q.category === "cinema")).toBe(true);
  });
});
