/**
 * AgoraX — Wake Lock API Helper
 * Empêche la mise en veille automatique des écrans de smartphones pendant une partie
 * ou dans le salon d'attente.
 */
import { useEffect, useRef } from "react";

export function useWakeLock(enabled: boolean = true) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("wakeLock" in navigator)) {
      return;
    }

    let isCancelled = false;

    async function requestLock() {
      try {
        if (document.visibilityState === "visible") {
          const sentinel = await navigator.wakeLock.request("screen");
          if (isCancelled) {
            void sentinel.release();
          } else {
            sentinelRef.current = sentinel;
            sentinel.addEventListener("release", () => {
              sentinelRef.current = null;
            });
          }
        }
      } catch {
        // Le système peut rejeter la requête (mode économie d'énergie, etc.) - non bloquant
      }
    }

    void requestLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sentinelRef.current) {
        void sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [enabled]);
}
