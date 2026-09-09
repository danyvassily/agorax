import Link from "next/link";
import type { Metadata } from "next";
import { getAllQuizSlugs } from "@/lib/questions/seo-quiz";
import { AppNavigation } from "@/components/ui/app-navigation";
import { ChevronDown, ChevronRight, Layers3, Play, Sparkles } from "lucide-react";
import { LocalizedText } from "@/components/ui/localized-text";
import { categoryLabel } from "@/lib/game/modes";
import { getSubthemesForCategory } from "@/lib/questions/subthemes";
import type { QuestionCategory } from "@/lib/questions/schema";
import { GsapAnimatedTitle } from "@/components/ui/gsap-animated-title";
import { GsapScrollReveal } from "@/components/ui/gsap-scroll-reveal";
import { formatQuizPackTitle } from "@/lib/questions/quiz-catalog";

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

  Object.values(categories).forEach((quizSlugs) => quizSlugs.sort());

  return (
    <>
      <AppNavigation />
      <main className="fp-page pb-24">
        <header className="mb-12 mt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fp-primary/10 text-fp-primary shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <GsapAnimatedTitle as="h1" className="mt-5 text-3xl font-black text-fp-text sm:text-4xl" variant="slide-up">
            <LocalizedText fr="Tous les Quiz & Thèmes" en="All Quizzes & Topics" />
          </GsapAnimatedTitle>
          <p className="mt-3 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText
              fr="Découvrez nos quiz par thèmes et sous-thèmes. Entraînez-vous avant de défier vos amis !"
              en="Explore quizzes by topics and sub-themes. Practise before challenging your friends!"
            />
          </p>
        </header>

        <div className="jx-quiz-catalog mx-auto max-w-5xl">
          {Object.entries(categories)
            .sort()
            .map(([cat, quizSlugs]) => {
              const labelFr = categoryLabel("fr", cat);
              const labelEn = categoryLabel("en", cat);
              const subthemes = getSubthemesForCategory(cat as QuestionCategory);

              return (
                <section key={cat} className="jx-quiz-category">
                  <div className="jx-quiz-category-head">
                    <div className="jx-quiz-category-icon" aria-hidden="true">
                      {subthemes[0]?.icon ?? "✨"}
                    </div>
                    <div>
                      <p className="jx-quiz-kicker">
                        <LocalizedText fr="Collection" en="Collection" /> · {quizSlugs.length} <LocalizedText fr="séries" en="series" />
                      </p>
                      <GsapAnimatedTitle as="h2" variant="pop" scrollTrigger>
                        <LocalizedText fr={labelFr} en={labelEn} />
                      </GsapAnimatedTitle>
                      <p className="jx-quiz-category-copy">
                        <LocalizedText
                          fr="Choisis un sous-thème ou lance un mélange surprise de toute la collection."
                          en="Pick a sub-theme or start a surprise mix from the whole collection."
                        />
                      </p>
                    </div>
                    <Link href={`/play/local/classic?category=${cat}`} className="fp-btn-primary jx-quiz-play-all">
                      <Play size={17} fill="currentColor" aria-hidden="true" />
                      <LocalizedText fr="Jouer ce thème" en="Play this topic" />
                    </Link>
                  </div>

                  {subthemes.length > 0 && (
                    <div className="jx-quiz-subthemes-block">
                      <div className="jx-quiz-subthemes-title">
                        <div>
                          <strong><LocalizedText fr="Choisis ton terrain" en="Choose your playground" /></strong>
                          <span><LocalizedText fr="Un toucher lance directement la partie" en="One tap starts the game" /></span>
                        </div>
                        <span><LocalizedText fr="Glisse" en="Swipe" /> →</span>
                      </div>
                      <div className="jx-quiz-subthemes" aria-label={`${labelFr} / ${labelEn}`}>
                        {subthemes.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/play/local/classic?category=${cat}&subcategory=${sub.slug}`}
                            className="jx-quiz-subtheme"
                          >
                            <span className="jx-quiz-subtheme-icon" aria-hidden="true">{sub.icon}</span>
                            <span><LocalizedText fr={sub.nameFr} en={sub.nameEn} /></span>
                            <ChevronRight size={17} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <details className="jx-quiz-series">
                    <summary>
                      <span><Layers3 size={18} aria-hidden="true" /><LocalizedText fr="Voir les séries de quiz" en="Browse quiz series" /></span>
                      <span>{quizSlugs.length}</span>
                      <ChevronDown className="jx-quiz-series-chevron" size={18} aria-hidden="true" />
                    </summary>
                    <GsapScrollReveal className="jx-quiz-series-grid" stagger={0.025} y={8}>
                      {quizSlugs.map((slug, position) => (
                        <Link key={slug} href={`/quiz/${cat}/${slug}`}>
                          <span>
                            <LocalizedText
                              fr={formatQuizPackTitle({ slug, category: cat, categoryName: labelFr, language: "fr", position })}
                              en={formatQuizPackTitle({ slug, category: cat, categoryName: labelEn, language: "en", position })}
                            />
                          </span>
                          <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                      ))}
                    </GsapScrollReveal>
                  </details>
                </section>
              );
            })}
        </div>
      </main>
    </>
  );
}
