import type { Metadata } from "next";
import { LocalPlayClient } from "@/components/home/local-play-client";

export const metadata: Metadata = {
  title: "Mode Solo — Entraînement & Réflexion",
  description:
    "Entraînez votre culture générale, testez votre QI express ou explorez les dilemmes philosophiques en solo sur Agorax.",
  alternates: {
    canonical: "https://agorax.online/play/solo",
  },
  openGraph: {
    title: "Mode Solo | Agorax",
    description: "Défiez-vous en solo sur nos quiz et tests de logique.",
    url: "https://agorax.online/play/solo",
  },
};

export default function SoloPage() {
  return <LocalPlayClient solo />;
}
