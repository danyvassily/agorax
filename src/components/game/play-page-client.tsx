"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/store/game";
import dynamic from "next/dynamic";
import { Play, Sparkles } from "lucide-react";

const AgoraxGame = dynamic(() => import("@/components/game/agorax-game").then((mod) => mod.AgoraxGame));
const QuizGame = dynamic(() => import("@/components/game/quiz-game").then((mod) => mod.QuizGame));
const TimelineGame = dynamic(() => import("@/components/game/timeline-game").then((mod) => mod.TimelineGame));
const TeamBattleGame = dynamic(() => import("@/components/game/team-battle").then((mod) => mod.TeamBattleGame));
const WyrGame = dynamic(() => import("@/components/game/wyr-game").then((mod) => mod.WyrGame));
const GuessGame = dynamic(() => import("@/components/game/guess-game").then((mod) => mod.GuessGame));
const DebateGame = dynamic(() => import("@/components/game/debate-game").then((mod) => mod.DebateGame));
const PsychoGame = dynamic(() => import("@/components/game/psycho-game").then((mod) => mod.PsychoGame));
const IQGame = dynamic(() => import("@/components/game/iq-game").then((mod) => mod.IQGame));

const emptySubscribe = () => () => {};

export function PlayPageClient() {
  const config = useGameStore((s) => s.config);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-fp-border border-t-fp-primary" />
        <p className="mt-4 text-[15px] text-fp-text-dim">Chargement de la partie…</p>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center animate-rise">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-fp-primary/10 text-fp-primary shadow-sm">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-fp-text">Aucune partie active</h1>
        <p className="mt-2 text-sm text-fp-text-dim leading-relaxed">
          Choisissez un mode de jeu local pour configurer et lancer votre session entre amis.
        </p>
        <Link
          href="/play/local"
          className="fp-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 py-3.5 font-bold"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Choisir un mode de jeu</span>
        </Link>
      </main>
    );
  }

  switch (config.mode) {
    case "agorax":
      return <AgoraxGame />;
    case "classic":
    case "truefalse":
    case "rapidfire":
      return <QuizGame mode={config.mode} />;
    case "timeline":
      return <TimelineGame />;
    case "teambattle":
      return <TeamBattleGame />;
    case "wyr":
      return <WyrGame />;
    case "guess":
      return <GuessGame />;
    case "debate":
      return <DebateGame />;
    case "psycho":
      return <PsychoGame />;
    case "iq":
      return <IQGame />;
    default:
      return <AgoraxGame />;
  }
}
