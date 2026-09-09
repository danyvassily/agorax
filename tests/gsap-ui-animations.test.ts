import { describe, it, expect } from "vitest";
import { GsapAnimatedTitle } from "@/components/ui/gsap-animated-title";
import { GsapScrollReveal } from "@/components/ui/gsap-scroll-reveal";
import { GsapRouteTransition } from "@/components/ui/gsap-route-transition";
import { getMotionPreset } from "@/lib/motion/motion-config";
import gsap from "gsap";

describe("GSAP UI/UX Animation Suite", () => {
  it("exports GSAP and animation components correctly", () => {
    expect(GsapAnimatedTitle).toBeDefined();
    expect(typeof GsapAnimatedTitle).toBe("function");
    expect(GsapScrollReveal).toBeDefined();
    expect(typeof GsapScrollReveal).toBe("function");
    expect(typeof GsapRouteTransition).toBe("function");
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe("function");
    expect(typeof gsap.fromTo).toBe("function");
  });

  it("uses short GPU-friendly page motion", () => {
    const motion = getMotionPreset("route");

    expect(motion.duration).toBeLessThanOrEqual(0.5);
    expect(motion.from).toMatchObject({ autoAlpha: 0, y: 12 });
    expect(motion.to).toMatchObject({ autoAlpha: 1, y: 0 });
    expect(motion.from).not.toHaveProperty("filter");
    expect(motion.to).not.toHaveProperty("filter");
  });

  it("removes displacement when reduced motion is requested", () => {
    const motion = getMotionPreset("route", true);

    expect(motion.duration).toBe(0);
    expect(motion.from).toMatchObject({ autoAlpha: 1, y: 0 });
    expect(motion.to).toMatchObject({ autoAlpha: 1, y: 0 });
  });

  it("registers GSAP version and core easing methods", () => {
    expect(gsap.version).toBeDefined();
    expect(typeof gsap.context).toBe("function");
  });
});
