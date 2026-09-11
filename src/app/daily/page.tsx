import { Metadata } from "next";
import { getDailyQuestions } from "@/lib/questions/daily";
import { DailyClient } from "@/components/daily/daily-client";
import { AppNavigation } from "@/components/ui/app-navigation";
import { Calendar } from "lucide-react";
import { connection } from "next/server";
import { LocalizedText } from "@/components/ui/localized-text";

export const metadata: Metadata = {
  title: "Le Défi du Jour — Agorax",
  description:
    "Relevez le défi quotidien avec les questions que vous n’avez pas encore vues. Gardez votre série !",
  alternates: {
    canonical: "https://agorax.online/daily",
  },
  openGraph: {
    title: "Le Défi du Jour — Agorax",
    description: "Jusqu’à 10 questions inédites chaque jour. Gardez votre série !",
    url: "https://agorax.online/daily",
  },
};

export default async function DailyPage() {
  await connection();
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  
  const questions = await getDailyQuestions(dateString);

  return (
    <>
      <AppNavigation />
      <main className="jx-daily-page fp-page pb-24">
        <header className="jx-daily-hero mb-8 mt-4 text-center">
          <div className="jx-daily-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fp-primary/10 text-fp-primary shadow-sm">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-fp-text sm:text-4xl">
            <LocalizedText fr="Le Défi du Jour" en="Daily challenge" />
          </h1>
          <p className="mt-2 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText fr="Jusqu’à 10 questions du jour, en excluant celles déjà vues. Maintenez votre série !" en="Up to 10 daily questions, excluding those you have already seen. Keep your streak going!" />
          </p>
        </header>

        <DailyClient questions={questions} dateString={dateString} />
      </main>
    </>
  );
}
