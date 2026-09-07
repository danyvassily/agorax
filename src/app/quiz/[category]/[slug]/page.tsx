import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllQuizSlugs, getQuizBySlug } from "@/lib/questions/seo-quiz";
import { SoloQuizClient } from "@/components/quiz/solo-quiz-client";
import { AppNavigation } from "@/components/ui/app-navigation";
import { LocalizedText } from "@/components/ui/localized-text";

export async function generateStaticParams() {
  const slugs = await getAllQuizSlugs();
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const quiz = await getQuizBySlug(category, slug);
  
  if (!quiz) {
    return { title: "Quiz non trouvé" };
  }

  return {
    title: `Quiz ${quiz.title} - Testez vos connaissances !`,
    description: `Découvrez notre quiz de 20 questions sur ${quiz.title}. Jouez seul ou lancez une partie multijoueur avec vos amis.`,
    openGraph: {
      title: `Quiz ${quiz.title}`,
      description: `Testez vos connaissances sur ${quiz.title} !`,
      type: "website",
    },
  };
}

export default async function QuizSeoPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const quiz = await getQuizBySlug(category, slug);

  if (!quiz) {
    notFound();
  }

  // Schema.org JSON-LD structured data for the Quiz
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": `Quiz ${quiz.title}`,
    "about": {
      "@type": "Thing",
      "name": quiz.title
    },
    "educationalAlignment": [
      {
        "@type": "AlignmentObject",
        "alignmentType": "educationalSubject",
        "targetName": category
      }
    ],
    "hasPart": quiz.questions.map((q) => ({
      "@type": "Question",
      "eduQuestionType": "Multiple choice",
      "text": q.question,
      "suggestedAnswer": [
        ...q.answers.filter((_, index) => index !== q.correctAnswer).map((ans) => ({
          "@type": "Answer",
          "text": ans,
          "position": 1
        }))
      ],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answers[q.correctAnswer],
        "position": 0
      }
    }))
  };

  return (
    <>
      <AppNavigation />
      <main className="fp-page pb-24">
        {/* Inject JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
        />
        
        <header className="mb-8 mt-4 text-center">
          <span className="fp-eyebrow capitalize">{category}</span>
          <h1 className="mt-3 text-3xl font-black text-fp-text sm:text-4xl">
            Quiz {quiz.title}
          </h1>
          <p className="mt-2 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText fr={`Testez vos connaissances avec ${quiz.questions.length} questions.`} en={`Test your knowledge with ${quiz.questions.length} questions.`} />
          </p>
        </header>

        <SoloQuizClient questions={quiz.questions} quizTitle={quiz.title} />
      </main>
    </>
  );
}
