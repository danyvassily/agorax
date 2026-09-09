"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";

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

    const runAnimation = () => {
      hasAnimatedRef.current = true;
      const ctx = gsap.context(() => {
        if (variant === "slide-up") {
          gsap.fromTo(
            words,
            {
              opacity: 0,
              y: 22,
              filter: "blur(4px)",
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.65,
              stagger,
              delay,
              ease: "power3.out",
              clearProps: "filter,transform",
            },
          );
        } else if (variant === "pop") {
          gsap.fromTo(
            words,
            {
              opacity: 0,
              scale: 0.85,
              y: 16,
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.55,
              stagger,
              delay,
              ease: "back.out(1.8)",
              clearProps: "transform",
            },
          );
        } else if (variant === "wave") {
          gsap.fromTo(
            words,
            {
              opacity: 0,
              y: 18,
              rotation: -2,
            },
            {
              opacity: 1,
              y: 0,
              rotation: 0,
              duration: 0.6,
              stagger,
              delay,
              ease: "power2.out",
              clearProps: "transform",
            },
          );
        }
      }, containerRef);

      return () => ctx.revert();
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
      return () => observer.disconnect();
    } else {
      return runAnimation();
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
            className="gsap-word inline-block will-change-transform mr-[0.26em] last:mr-0"
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
      <span className="gsap-word inline-block will-change-transform">
        {children}
      </span>
    </Component>
  );
}
