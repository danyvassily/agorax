import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryGame } from "@/components/game/discovery-game";

export const metadata: Metadata = {
  title: "Découverte Express — Test Immédiat Sans Inscription",
  description:
    "Testez instantanément un échantillon des meilleurs quiz et questions d'Agorax sans inscription ni téléchargement.",
  alternates: {
    canonical: "https://agorax.online/play/discovery",
  },
  openGraph: {
    title: "Découverte Express | Agorax",
    description: "Lancez une partie test immédiate sur Agorax.",
    url: "https://agorax.online/play/discovery",
  },
};

export default function DiscoveryPage() {
  return (
    <Suspense>
      <DiscoveryGame />
    </Suspense>
  );
}
