import Link from "next/link";
import type { Metadata } from "next";
import { getAllQuizSlugs } from "@/lib/questions/seo-quiz";
import { AppNavigation } from "@/components/ui/app-navigation";
import { Sparkles } from "lucide-react";
import { LocalizedText } from "@/components/ui/localized-text";
import { CATEGORY_LABELS } from "@/lib/game/modes";
import { getSubthemesForCategory } from "@/lib/questions/subthemes";
import type { QuestionCategory } from "@/lib/questions/schema";

export const metadata: Metadata = {
  title: "Tous nos Quiz — Catalogue Thématique Agorax",
  description:
    "Explorez notre immense catalogue de quiz par catégories et sous-thèmes : Histoire, Géographie, Cinéma, Jeux Vidéo, Philosophie, Sciences et bien plus !",
  alternates: {
    canonical: "https://agorax.online/quiz",
  },
  openGraph: {
    title: "Tous nos Quiz — Agorax",
    description: "Explorez notre immense catalogue de quiz et sous-thèmes.",
    url: "https://agorax.online/quiz",
  },
};

export default async function QuizIndexPage() {
  const slugs = await getAllQuizSlugs();

  // Group by category
  const categories: Record<string, string[]> = {};
  for (const { category, slug } of slugs) {
    if (!categories[category]) categories[category] = [];
    categories[category].push(slug);
  }

  return (
    <>
      <AppNavigation />
      <main className="fp-page pb-24">
        <header className="mb-12 mt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fp-primary/10 text-fp-primary shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-fp-text sm:text-4xl">
            <LocalizedText fr="Tous les Quiz & Thèmes" en="All Quizzes & Topics" />
          </h1>
          <p className="mt-3 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText
              fr="Découvrez nos quiz par thèmes et sous-thèmes. Entraînez-vous avant de défier vos amis !"
              en="Explore quizzes by topics and sub-themes. Practise before challenging your friends!"
            />
          </p>
        </header>

        <div className="mx-auto max-w-4xl space-y-12">
          {Object.entries(categories)
            .sort()
            .map(([cat, quizSlugs]) => {
              const label = CATEGORY_LABELS[cat as QuestionCategory] ?? cat;
              const subthemes = getSubthemesForCategory(cat as QuestionCategory);

              return (
                <section key={cat} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-2xl font-black text-fp-text flex items-center gap-2">
                      <span>{label}</span>
                      <span className="text-xs font-bold text-fp-primary bg-fp-primary/10 px-2.5 py-0.5 rounded-full">
                        {quizSlugs.length} quiz
                      </span>
                    </h2>
                  </div>

                  {/* Badges de sous-thèmes */}
                  {subthemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {subthemes.map((sub) => (
                        <span
                          key={sub.slug}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fp-surface border border-fp-border/60 text-xs font-medium text-fp-text-dim"
                        >
                          <span>{sub.icon}</span>
                          <span>{sub.nameFr}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {quizSlugs.map((slug) => {
                      const title = slug
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                      return (
                        <Link
                          key={slug}
                          href={`/quiz/${cat}/${slug}`}
                          className="fp-card p-4 transition-all hover:-translate-y-0.5 hover:border-fp-primary/40 hover:shadow-sm"
                        >
                          <h3 className="font-bold text-fp-text text-sm sm:text-base">{title}</h3>
                          <p className="mt-1 text-xs text-fp-text-dim">
                            <LocalizedText fr="Jouer au quiz →" en="Play quiz →" />
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      </main>
    </>
  );
}
