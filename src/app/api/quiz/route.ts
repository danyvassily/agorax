import { NextResponse } from "next/server";
import { getQuizBySlug } from "@/lib/questions/seo-quiz";
import { loadQuestions } from "@/lib/questions/load";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const lang = searchParams.get("lang") || "fr";

  if (!category || !slug) {
    return NextResponse.json({ error: "Missing category or slug" }, { status: 400 });
  }

  // Load all questions for the requested language
  const loaded = loadQuestions(lang);
  // Find the questions for this category
  const categoryQuestions = loaded.questions.filter((q) => q.category === category);
  
  if (categoryQuestions.length === 0) {
    return NextResponse.json({ error: "Category not found or empty" }, { status: 404 });
  }

  // Find the specific questions for the slug by looking at the french equivalent
  const frQuiz = await getQuizBySlug(category, slug);
  if (!frQuiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const conceptIds = frQuiz.questions.map((q) => q.conceptId);
  const translatedQuestions = conceptIds.map(id => categoryQuestions.find(q => q.conceptId === id)).filter(Boolean);

  return NextResponse.json({
    category,
    slug,
    title: frQuiz.title,
    questions: translatedQuestions,
  });
}
