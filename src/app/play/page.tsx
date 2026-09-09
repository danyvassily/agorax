import type { Metadata } from "next";
import { PlayPageClient } from "@/components/game/play-page-client";

export const metadata: Metadata = {
  title: "Partie en Cours — Agorax",
  description: "Rejoignez ou reprenez votre partie active de quiz, dilemmes ou débats entre amis sur Agorax.",
  alternates: {
    canonical: "https://agorax.online/play",
  },
  openGraph: {
    title: "Partie en Cours | Agorax",
    description: "Votre session de jeu en direct sur Agorax.",
    url: "https://agorax.online/play",
  },
};

export default function PlayPage() {
  return <PlayPageClient />;
}
