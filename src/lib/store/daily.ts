import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DailyState {
  lastPlayedDate: string | null;
  currentStreak: number;
  maxStreak: number;
  lastScore: number;
  lastResultGrid: string;
  setDailyResult: (date: string, score: number, resultGrid: string) => void;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set) => ({
      lastPlayedDate: null,
      currentStreak: 0,
      maxStreak: 0,
      lastScore: 0,
      lastResultGrid: "",
      
      setDailyResult: (date, score, resultGrid) =>
        set((state) => {
          // A completed day is immutable, and older tabs cannot rewind the streak.
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
              (state.lastPlayedDate && date <= state.lastPlayedDate)) return state;
          if (!Number.isInteger(score) || score < 0 || score > Array.from(resultGrid).length) return state;
          // Calculate streak
          let newStreak = 1;
          
          if (state.lastPlayedDate) {
            const diffDays = (Date.parse(date) - Date.parse(state.lastPlayedDate)) / 86_400_000;
            
            if (diffDays === 1) {
              // Played yesterday, streak continues!
              newStreak = state.currentStreak + 1;
            } else if (diffDays === 0) {
              // Played today already? Shouldn't happen if UI blocks it, but keep current
              newStreak = state.currentStreak;
            } else {
              // Streak broken
              newStreak = 1;
            }
          }
          
          return {
            lastPlayedDate: date,
            currentStreak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak),
            lastScore: score,
            lastResultGrid: resultGrid,
          };
        }),
    }),
    {
      name: "Agorax-daily-storage",
    }
  )
);
