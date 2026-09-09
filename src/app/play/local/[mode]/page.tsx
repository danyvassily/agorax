import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalGameSetupClient } from "@/components/home/local-game-setup-client";
import { MODE_META } from "@/lib/game/modes";
import type { GameMode } from "@/lib/store/game";

import { CATEGORIES, type QuestionCategory } from "@/lib/questions/schema";

export async function generateStaticParams() {
  return Object.keys(MODE_META).map((mode) => ({ mode }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mode: string }>;
}): Promise<Metadata> {
  const { mode } = await params;
  if (!Object.hasOwn(MODE_META, mode)) {
    return { title: "Mode non trouvé" };
  }
  const meta = MODE_META[mode as GameMode];
  return {
    title: `${meta.name} — Mode de Jeu`,
    description: `${meta.subtitle}. Jouez en direct sur Agorax avec vos amis, sur un seul appareil ou en ligne.`,
    alternates: {
      canonical: `https://agorax.online/play/local/${mode}`,
    },
    openGraph: {
      title: `${meta.name} — Mode de Jeu | Agorax`,
      description: meta.subtitle,
      url: `https://agorax.online/play/local/${mode}`,
    },
  };
}

export default async function LocalGameSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ solo?: string; players?: string; category?: string; subcategory?: string }>;
}) {
  const { mode } = await params;
  const query = await searchParams;
  if (!Object.hasOwn(MODE_META, mode)) notFound();
  const count = Number(query.players);
  const categoryParam =
    query.category && (CATEGORIES as readonly string[]).includes(query.category)
      ? (query.category as QuestionCategory)
      : undefined;
  const subcategoryParam =
    typeof query.subcategory === "string" && query.subcategory.trim().length > 0
      ? query.subcategory.trim()
      : undefined;

  return (
    <LocalGameSetupClient
      mode={mode as GameMode}
      solo={query.solo === "1" && MODE_META[mode as GameMode].minPlayers === 1}
      initialCount={Number.isInteger(count) && count >= 2 && count <= 8 ? count : undefined}
      initialCategory={categoryParam}
      initialSubcategory={subcategoryParam}
    />
  );
}
