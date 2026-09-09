import type { Metadata } from "next";
import { LocalPlayClient } from "@/components/home/local-play-client";

export const metadata: Metadata = {
  title: "Mode Soirée & Apéro — Jouer en Local",
  description:
    "Sélectionnez votre mode de jeu préféré pour animer votre soirée entre amis sur un seul smartphone ou tablette. Quiz, dilemmes et buzzers.",
  alternates: {
    canonical: "https://agorax.online/play/local",
  },
  openGraph: {
    title: "Mode Soirée & Apéro | Agorax",
    description: "Jouez ensemble sur un seul appareil avec Agorax.",
    url: "https://agorax.online/play/local",
  },
};

export default function LocalPlayPage() {
  return <LocalPlayClient />;
}
