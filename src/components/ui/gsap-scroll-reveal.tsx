"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface GsapScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  y?: number;
  selector?: string;
}

export function GsapScrollReveal({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
  duration = 0.6,
  y = 24,
  selector,
}: GsapScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasAnimatedRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = selector
      ? el.querySelectorAll(selector)
      : Array.from(el.children);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            hasAnimatedRef.current = true;
            observer.disconnect();

            const ctx = gsap.context(() => {
              gsap.fromTo(
                targets,
                {
                  opacity: 0,
                  y,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration,
                  delay,
                  stagger,
                  ease: "power2.out",
                  clearProps: "transform,opacity",
                },
              );
            }, containerRef);

            return () => ctx.revert();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, delay, duration, y, selector]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
