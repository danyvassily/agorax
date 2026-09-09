"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { getMotionPreset } from "@/lib/motion/motion-config";

interface GsapScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  y?: number;
  selector?: string;
  /** Relance un mouvement court quand le contenu filtré ou trié change. */
  animationKey?: string | number;
}

export function GsapScrollReveal({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
  duration = 0.6,
  y = 24,
  selector,
  animationKey,
}: GsapScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (animationKey !== undefined) hasAnimatedRef.current = false;
    if (!el || hasAnimatedRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = selector
      ? el.querySelectorAll(selector)
      : Array.from(el.children);

    if (!targets.length) return;
    let animationContext: gsap.Context | null = null;

    const runAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      const preset = getMotionPreset("reveal");
      animationContext = gsap.context(() => {
        gsap.fromTo(
          targets,
          { ...preset.from, y },
          {
            ...preset.to,
            duration: duration ?? preset.duration,
            delay,
            stagger,
            ease: preset.ease,
            force3D: true,
            overwrite: "auto",
            clearProps: "transform,opacity,visibility",
          },
        );
      }, containerRef);
    };

    if (!("IntersectionObserver" in window)) {
      runAnimation();
      return () => animationContext?.revert();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            runAnimation();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      animationContext?.revert();
    };
  }, [stagger, delay, duration, y, selector, animationKey]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
