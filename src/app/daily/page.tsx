import { Metadata } from "next";
import { getDailyQuestions } from "@/lib/questions/daily";
import { DailyClient } from "@/components/daily/daily-client";
import { AppNavigation } from "@/components/ui/app-navigation";
import { Calendar } from "lucide-react";
import { connection } from "next/server";
import { LocalizedText } from "@/components/ui/localized-text";

export const metadata: Metadata = {
  title: "Le Défi du Jour - Agorax",
  description: "Relevez le défi quotidien ! 10 questions identiques pour tout le monde. Gardez votre série de victoires et comparez votre score avec vos amis.",
};

export default async function DailyPage() {
  await connection();
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  
  const questions = await getDailyQuestions(dateString);

  return (
    <>
      <AppNavigation />
      <main className="fp-page pb-24">
        <header className="mb-8 mt-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fp-primary/10 text-fp-primary shadow-sm">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-fp-text sm:text-4xl">
            <LocalizedText fr="Le Défi du Jour" en="Daily challenge" />
          </h1>
          <p className="mt-2 text-fp-text-dim max-w-xl mx-auto">
            <LocalizedText fr="10 questions identiques pour tout le monde. Maintenez votre série !" en="The same 10 questions for everyone. Keep your streak going!" />
          </p>
        </header>

        <DailyClient questions={questions} dateString={dateString} />
      </main>
    </>
  );
}
