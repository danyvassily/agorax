import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partie En Ligne — Salons Multijoueur",
  description:
    "Rejoignez ou créez un salon de jeu en ligne pour défier vos amis à distance en direct sur Agorax avec buzzer synchronisé.",
  alternates: {
    canonical: "https://agorax.online/play/online",
  },
  openGraph: {
    title: "Partie En Ligne Multijoueur | Agorax",
    description: "Affrontez vos amis à distance en direct sur Agorax.",
    url: "https://agorax.online/play/online",
  },
};

export default function OnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
