"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { getMotionPreset } from "@/lib/motion/motion-config";

export function GsapRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const preset = getMotionPreset("route", reducedMotion);
    const context = gsap.context(() => {
      gsap.fromTo(container, preset.from, {
        ...preset.to,
        duration: preset.duration,
        ease: preset.ease,
        force3D: true,
        clearProps: "transform,opacity,visibility",
        overwrite: "auto",
      });
    }, container);

    return () => context.revert();
  }, [pathname]);

  return (
    <div ref={containerRef} className="jx-route-stage">
      {children}
    </div>
  );
}
