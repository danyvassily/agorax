"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { getMotionPreset, type MotionPresetName } from "@/lib/motion/motion-config";

interface GsapAnimatedTitleProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  variant?: "slide-up" | "pop" | "wave";
  delay?: number;
  stagger?: number;
  /** Trigger animation only when scrolled into view */
  scrollTrigger?: boolean;
}

export function GsapAnimatedTitle({
  children,
  as: Component = "h1",
  className = "",
  variant = "slide-up",
  delay = 0.05,
  stagger = 0.06,
  scrollTrigger = false,
}: GsapAnimatedTitleProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasAnimatedRef.current) return;

    // Respect user's motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const words = el.querySelectorAll(".gsap-word");
    if (!words.length) return;
    let animationContext: gsap.Context | null = null;

    const runAnimation = () => {
      hasAnimatedRef.current = true;
      const presetName: MotionPresetName = variant === "slide-up" ? "title" : variant;
      const preset = getMotionPreset(presetName);
      animationContext = gsap.context(() => {
        gsap.fromTo(words, preset.from, {
          ...preset.to,
          duration: preset.duration,
          stagger,
          delay,
          ease: preset.ease,
          force3D: true,
          overwrite: "auto",
          clearProps: "transform,opacity,visibility",
        });
      }, containerRef);
    };

    if (scrollTrigger && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              runAnimation();
              observer.disconnect();
              break;
            }
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );
      observer.observe(el);
      return () => {
        observer.disconnect();
        animationContext?.revert();
      };
    } else {
      runAnimation();
      return () => animationContext?.revert();
    }
  }, [variant, delay, stagger, scrollTrigger]);

  // If children is a string, split words for staggered reveal
  if (typeof children === "string") {
    const words = children.split(" ");
    return (
      <Component ref={containerRef} className={className}>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="gsap-word inline-block mr-[0.26em] last:mr-0"
          >
            {word}
          </span>
        ))}
      </Component>
    );
  }

  // If children contains complex JSX, wrap it
  return (
    <Component ref={containerRef} className={className}>
      <span className="gsap-word inline-block">
        {children}
      </span>
    </Component>
  );
}
