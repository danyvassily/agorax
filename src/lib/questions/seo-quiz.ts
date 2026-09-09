import fs from "fs/promises";
import path from "path";
import { parseQuestionBatch, type Question } from "./schema";
import { withEnglishTranslations } from "./bilingual";
import { getUnseenQuestions } from "./question-selection-service";
import { formatQuizPackTitle } from "./quiz-catalog";
import { categoryLabel } from "@/lib/game/modes";

const QUESTIONS_DIR = path.join(process.cwd(), "questions/fr");

export interface QuizSlugParams {
  category: string;
  slug: string;
}

export interface QuizData {
  category: string;
  slug: string;
  title: string;
  questions: Question[];
}

export async function getAllQuizSlugs(): Promise<QuizSlugParams[]> {
  const slugs: QuizSlugParams[] = [];
  try {
    const categories = await fs.readdir(QUESTIONS_DIR);
    
    for (const category of categories) {
      if (category.startsWith(".") || category === "_build") continue;
      
      const categoryPath = path.join(QUESTIONS_DIR, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const slug = file.replace(".json", "");
            slugs.push({ category, slug });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error reading quiz slugs:", err);
  }
  
  return slugs;
}

export async function getQuizBySlug(category: string, slug: string): Promise<QuizData | null> {
  if (![category, slug].every(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) return null;
  try {
    const filePath = path.join(QUESTIONS_DIR, category, `${slug}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const questions = parseQuestionBatch(JSON.parse(content)).questions;
    if (!questions.length) return null;
    
    const categoryFiles = (await fs.readdir(path.join(QUESTIONS_DIR, category)))
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""))
      .sort();
    const position = Math.max(0, categoryFiles.indexOf(slug));
    const title = formatQuizPackTitle({
      slug,
      category,
      categoryName: categoryLabel("fr", category),
      language: "fr",
      position,
    });

    return {
      category,
      slug,
      title,
      questions: withEnglishTranslations(getUnseenQuestions({ pool: questions, participantHistories: [], count: 20, seed: 1 }).questions),
    };
  } catch (err) {
    console.error(`Error reading quiz ${category}/${slug}:`, err);
    return null;
  }
}
