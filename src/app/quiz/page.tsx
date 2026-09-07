import Link from "next/link";
import { getAllQuizSlugs } from "@/lib/questions/seo-quiz";
import { AppNavigation } from "@/components/ui/app-navigation";
import { Sparkles } from "lucide-react";
import { LocalizedText } from "@/components/ui/localized-text";

export const metadata = {
  title: "Tous nos Quiz - Agorax",
  description: "Explorez notre immense catalogue de quiz par catégories. Histoire, Géographie, Cinéma, Jeux Vidéo et bien plus !",
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
            <LocalizedText fr="Tous les Quiz" en="All quizzes" />
          </h1>
          <p className="mt-3 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText fr="Découvrez nos quiz par thème. Entraînez-vous avant de défier vos amis !" en="Explore quizzes by topic. Practise before challenging your friends!" />
          </p>
        </header>

        <div className="mx-auto max-w-4xl space-y-12">
          {Object.entries(categories).sort().map(([cat, quizSlugs]) => (
            <section key={cat}>
              <h2 className="mb-4 text-2xl font-black capitalize text-fp-text flex items-center gap-2">
                {cat}
                <span className="text-sm font-bold text-fp-primary bg-fp-primary/10 px-2 py-0.5 rounded-full">
                  {quizSlugs.length} quiz
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {quizSlugs.map((slug) => {
                  const title = slug
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                  return (
                    <Link
                      key={slug}
                      href={`/quiz/${cat}/${slug}`}
                      className="fp-card p-4 transition-all hover:-translate-y-0.5 hover:border-fp-primary/40 hover:shadow-sm"
                    >
                      <h3 className="font-bold text-fp-text">{title}</h3>
                      <p className="mt-1 text-xs text-fp-text-dim"><LocalizedText fr="Jouer au quiz →" en="Play quiz →" /></p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
