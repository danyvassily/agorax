"use client";

import { useState } from "react";
import { Share2, Check, Trophy, Sparkles, MessageCircle } from "lucide-react";
import { sound } from "@/lib/audio/sound-engine";
import { PlayerDot } from "@/components/ui/primitives";

interface PlayerResult {
  id: string;
  name: string;
  score: number;
  avatarUrl?: string;
}

interface PostGameCardProps {
  players: PlayerResult[];
  winner: PlayerResult | null;
  roomCode?: string;
  mode?: string;
  lang?: "fr" | "en";
}

const TITLES_FR = [
  "Cerveau officiel de la soirée 🧠",
  "Menace intellectuelle sous couverture 🕵️",
  "Maître incontesté du buzzer ⚡",
  "Érudit certifié sans pitié 🏆",
];

const TITLES_EN = [
  "Official Brain of the Night 🧠",
  "Undercover Intellectual Threat 🕵️",
  "Undisputed Buzzer Champion ⚡",
  "Certified Trivia Master 🏆",
];

export function PostGameCard({ players, winner, roomCode, mode, lang = "fr" }: PostGameCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const en = lang === "en";
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const podium = sorted.slice(0, 3);

  // Titre honorifique basé sur le nom du gagnant
  const titleIndex = winner ? Math.abs(winner.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 4 : 0;
  const honorTitle = en ? TITLES_EN[titleIndex] : TITLES_FR[titleIndex];

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${roomCode ? `/play/online?room=${encodeURIComponent(roomCode)}` : ""}`
    : "https://agorax.app";

  const getSummaryText = () => {
    const modeBadge = mode ? ` [${mode.toUpperCase()}]` : "";
    let text = `🏆 AGORAX — ${en ? "Game Results" : "Résultats de la Soirée"}${modeBadge} !\n`;
    if (winner) {
      text += `👑 ${winner.name} : ${winner.score} pts (${honorTitle})\n\n`;
    }
    podium.forEach((p, idx) => {
      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
      text += `${medal} ${p.name} — ${p.score} pts\n`;
    });
    if (roomCode) {
      text += `\n👉 ${en ? "Revenge here" : "Prends ta revanche"} : ${shareUrl}`;
    }
    return text;
  };

  const handleShare = async () => {
    const summary = getSummaryText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "AgoraX — Résultats du Quiz",
          text: summary,
          url: shareUrl,
        });
        sound.playVictory();
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await handleCopyText();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getSummaryText());
      sound.playAnswerLocked();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-black/[0.08] bg-gradient-to-b from-white via-amber-50/20 to-orange-50/40 p-6 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
          <Trophy size={14} />
          <span>{en ? "Official Match Card" : "Carte Officielle du Match"}</span>
        </div>
        {roomCode && (
          <span className="font-mono text-xs font-black uppercase tracking-widest text-black/40">
            #{roomCode}
          </span>
        )}
      </div>

      {winner && (
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-extrabold text-amber-900 mb-2 animate-bounce">
            <Sparkles size={12} className="inline mr-1 text-amber-600" />
            {honorTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            {winner.name}
          </h2>
          <p className="text-sm font-semibold text-black/60">
            {en ? `Scores ${winner.score} points on AgoraX` : `Remporte la partie avec ${winner.score} points`}
          </p>
        </div>
      )}

      {/* Podium Visuel */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5 items-end">
        {/* 2ème Place */}
        {sorted[1] ? (
          <div className="flex flex-col items-center rounded-2xl bg-white/80 p-3 text-center border border-black/5 shadow-xs">
            <span className="text-xl mb-1">🥈</span>
            <PlayerDot name={sorted[1].name} avatarUrl={sorted[1].avatarUrl} size={32} />
            <strong className="mt-1 text-xs truncate max-w-full font-bold">{sorted[1].name}</strong>
            <span className="text-xs text-black/60 font-semibold">{sorted[1].score} pts</span>
          </div>
        ) : <div />}

        {/* 1ère Place */}
        {sorted[0] && (
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-amber-100 to-white p-4 text-center border-2 border-amber-300 shadow-sm relative -top-2">
            <span className="text-2xl mb-1">👑</span>
            <PlayerDot name={sorted[0].name} avatarUrl={sorted[0].avatarUrl} size={42} />
            <strong className="mt-1 text-sm truncate max-w-full font-black text-black">{sorted[0].name}</strong>
            <span className="text-xs font-black text-amber-800">{sorted[0].score} pts</span>
          </div>
        )}

        {/* 3ème Place */}
        {sorted[2] ? (
          <div className="flex flex-col items-center rounded-2xl bg-white/80 p-3 text-center border border-black/5 shadow-xs">
            <span className="text-xl mb-1">🥉</span>
            <PlayerDot name={sorted[2].name} avatarUrl={sorted[2].avatarUrl} size={32} />
            <strong className="mt-1 text-xs truncate max-w-full font-bold">{sorted[2].name}</strong>
            <span className="text-xs text-black/60 font-semibold">{sorted[2].score} pts</span>
          </div>
        ) : <div />}
      </div>

      {/* Actions de Partage */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-sm font-bold text-white transition hover:bg-black/90 active:scale-95 shadow-sm"
        >
          <Share2 size={16} />
          <span>{shared ? (en ? "Shared!" : "Partagé !") : (en ? "Share to Story / Friends" : "Partager en Story / Amis")}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyText}
          className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-black/5 active:scale-95 shadow-xs"
          title="Copier le résumé pour WhatsApp"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <MessageCircle size={16} className="text-emerald-600" />}
          <span>{copied ? (en ? "Copied!" : "Copié pour WhatsApp !") : (en ? "Copy for WhatsApp" : "Copier pour WhatsApp")}</span>
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-black/40 font-medium">
        AgoraX — Le quiz instantané en 30s · Pas d&apos;appli à installer
      </p>
    </div>
  );
}
