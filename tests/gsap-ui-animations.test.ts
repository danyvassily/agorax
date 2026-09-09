import { describe, it, expect } from "vitest";
import { GsapAnimatedTitle } from "@/components/ui/gsap-animated-title";
import { GsapScrollReveal } from "@/components/ui/gsap-scroll-reveal";
import gsap from "gsap";

describe("GSAP UI/UX Animation Suite", () => {
  it("exports GSAP and animation components correctly", () => {
    expect(GsapAnimatedTitle).toBeDefined();
    expect(typeof GsapAnimatedTitle).toBe("function");
    expect(GsapScrollReveal).toBeDefined();
    expect(typeof GsapScrollReveal).toBe("function");
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe("function");
    expect(typeof gsap.fromTo).toBe("function");
  });

  it("registers GSAP version and core easing methods", () => {
    expect(gsap.version).toBeDefined();
    expect(typeof gsap.context).toBe("function");
  });
});
