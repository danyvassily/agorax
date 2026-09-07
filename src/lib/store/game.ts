/**
 * Agorax — Game store (spec §54–§55, §84)
 * Configuration de partie locale : pas d'inscription, on joue en quelques secondes.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestionCategory } from "@/lib/questions/schema";

export const GAME_MODES = [
  "agorax",
  "classic",
  "truefalse",
  "rapidfire",
  "timeline",
  "teambattle",
  "wyr",
  "guess",
  "debate",
  "psycho",
  "iq",
] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 8;

export interface Player {
  id: string;
  /** Identité anti-répétition stable, distincte du nom affiché. */
  profileToken: string;
  name: string;
  /** 0..7 : couleur d'avatar (index palette) */
  color: number;
  score: number;
  correct: number;
  wrong: number;
  avatarUrl?: string;
  language?: "fr" | "en";
  /** Team A/B pour Team Battle */
  team?: "A" | "B";
}

export type SupportedLanguage = "fr" | "en";
export type LanguageMode = "shared" | "per-player";

export interface GameConfig {
  /** Identifiant stable du lot et de ses réservations. */
  sessionId: string;
  mode: GameMode;
  category: QuestionCategory | "mixed";
  difficulty: string; // "mixed" | easy | medium | hard | expert
  players: Player[];
  questionCount: number;
  /** secondes par question (classic) */
  timePerQuestion: number;
  debateMinutes: number;
  debateMode: string;
  duration?: "express" | "classic";
  /** Langue officielle de la partie (questions servies en mode partagé) */
  gameLanguage: SupportedLanguage;
  /** Mode linguistique : partagé (tous les joueurs voient gameLanguage) ou par joueur */
  languageMode: LanguageMode;
}

export interface GameState {
  /** Joueurs mémorisés entre les parties (noms éditables) */
  players: Player[];
  setPlayers: (players: Player[]) => void;
  config: GameConfig | null;
  setConfig: (config: GameConfig) => void;
  reset: () => void;
  addScore: (playerId: string, points: number) => void;
  resetScores: () => void;
}

export const PLAYER_COLORS = [
  "#ee6055", "#118b78", "#f4d35e", "#d94d43",
  "#90f1ef", "#277f91", "#e8a93a", "#5f6b73",
];

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export const newGameSessionId = randomId;

/** Crée un joueur avec un nom et une couleur par défaut. */
export function makePlayer(index: number, name?: string): Player {
  return {
    id: `p-${randomId()}`,
    profileToken: randomId(),
    name: name?.trim() || `Joueur ${index + 1}`,
    color: index % PLAYER_COLORS.length,
    score: 0,
    correct: 0,
    wrong: 0,
  };
}

/** Construit une liste de `count` joueurs en préservant les noms existants. */
export function resizePlayers(current: Player[], count: number): Player[] {
  const target = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));
  const out: Player[] = [];
  for (let i = 0; i < target; i++) {
    if (current[i]) {
      out.push({
        ...current[i],
        profileToken: current[i].profileToken || randomId(),
        color: i % PLAYER_COLORS.length,
        score: 0,
        correct: 0,
        wrong: 0,
      });
    } else {
      out.push(makePlayer(i));
    }
  }
  return out;
}

/** Normalisation centralisée de GameConfig pour garantir l'absence de valeurs indéfinies ou contaminées. */
export function normalizeGameConfig(
  raw?: Partial<GameConfig> | null,
  fallbackUiLanguage: SupportedLanguage = "fr"
): GameConfig {
  const gameLanguage: SupportedLanguage =
    raw?.gameLanguage === "en" || raw?.gameLanguage === "fr"
      ? raw.gameLanguage
      : fallbackUiLanguage === "en"
      ? "en"
      : "fr";

  const languageMode: LanguageMode =
    raw?.languageMode === "per-player" ? "per-player" : "shared";

  const players = Array.isArray(raw?.players) && raw.players.length > 0
    ? raw.players.map((p) => ({
        ...p,
        profileToken: p.profileToken || randomId(),
        language: p.language === "en" || p.language === "fr" ? p.language : gameLanguage,
      }))
    : [makePlayer(0)];

  return {
    sessionId: raw?.sessionId ?? randomId(),
    mode: raw?.mode ?? "classic",
    category: raw?.category ?? "mixed",
    difficulty: raw?.difficulty ?? "mixed",
    players,
    questionCount: typeof raw?.questionCount === "number" ? raw.questionCount : 10,
    timePerQuestion: typeof raw?.timePerQuestion === "number" ? raw.timePerQuestion : 15,
    debateMinutes: typeof raw?.debateMinutes === "number" ? raw.debateMinutes : 5,
    debateMode: raw?.debateMode ?? "standard",
    duration: raw?.duration,
    gameLanguage,
    languageMode,
  };
}

export const DEFAULT_CONFIG: GameConfig = {
  sessionId: randomId(),
  mode: "classic",
  category: "mixed",
  difficulty: "mixed",
  players: [makePlayer(0)],
  questionCount: 10,
  timePerQuestion: 15,
  debateMinutes: 5,
  debateMode: "standard",
  gameLanguage: "fr",
  languageMode: "shared",
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      players: [makePlayer(0, "Joueur 1"), makePlayer(1, "Joueur 2")],
      setPlayers: (players) => set({ players }),
      config: null,
      setConfig: (config) => set({ config: normalizeGameConfig(config) }),
      reset: () => set({ config: null }),
      addScore: (playerId, points) =>
        set((s) => ({
          config: s.config
            ? {
                ...s.config,
                players: s.config.players.map((p) =>
                  p.id === playerId ? { ...p, score: p.score + points } : p,
                ),
              }
            : null,
        })),
      resetScores: () =>
        set((s) => ({
          config: s.config
            ? {
                ...s.config,
                players: s.config.players.map((p) => ({
                  ...p,
                  score: 0,
                  correct: 0,
                  wrong: 0,
                })),
              }
            : null,
        })),
    }),
    { name: "Agorax-game" },
  ),
);
