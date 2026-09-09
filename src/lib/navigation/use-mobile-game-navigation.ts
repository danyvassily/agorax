"use client";

import { useEffect, useRef } from "react";

const activeGames = new Set<symbol>();

function syncMobileGameState() {
  document.body.toggleAttribute("data-mobile-game-active", activeGames.size > 0);
}

/** Gives an active round the whole mobile viewport, then restores navigation. */
export function useMobileGameNavigation(hidden: boolean) {
  const lock = useRef(Symbol("mobile-game-navigation"));

  useEffect(() => {
    const token = lock.current;

    if (hidden) activeGames.add(token);
    else activeGames.delete(token);
    syncMobileGameState();

    return () => {
      activeGames.delete(token);
      syncMobileGameState();
    };
  }, [hidden]);
}
