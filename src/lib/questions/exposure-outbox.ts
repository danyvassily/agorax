"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PendingExposure {
  sessionId: string;
  onlineSessionId?: string;
  participantTokens: string[];
  questionId: string;
  familyId: string;
}

export const useExposureOutbox = create<{
  pending: PendingExposure[];
  enqueue: (entry: PendingExposure) => void;
  remove: (entry: PendingExposure) => void;
}>()(persist((set) => ({
  pending: [],
  enqueue: (entry) => set(state => ({ pending: state.pending.some(item => key(item) === key(entry)) ? state.pending : [...state.pending, entry] })),
  remove: (entry) => set(state => ({ pending: state.pending.filter(item => key(item) !== key(entry)) })),
}), { name: "Agorax-exposure-outbox" }));

function key(entry: PendingExposure) {
  return JSON.stringify([entry.sessionId, entry.familyId, [...entry.participantTokens].sort()]);
}

let flushing: Promise<void> | undefined;
/** Failed HTTP responses are retained across app restarts, not just network errors. */
export function flushExposures(headers: () => Promise<Record<string, string>>): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    for (const entry of useExposureOutbox.getState().pending) {
      try {
        const response = await fetch("/api/questions/seen", {
          method: "POST", headers: await headers(), body: JSON.stringify(entry),
          signal: AbortSignal.timeout(8_000),
        });
        if (!response.ok || !(await response.json()).synced) continue;
        useExposureOutbox.getState().remove(entry);
      } catch {
        // The persisted queue will retry on the next display/load or network recovery.
        break;
      }
    }
  })().finally(() => { flushing = undefined; });
  return flushing;
}
