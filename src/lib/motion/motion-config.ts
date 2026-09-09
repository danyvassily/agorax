export type MotionPresetName = "route" | "title" | "pop" | "wave" | "reveal";

export interface MotionPreset {
  from: Record<string, number>;
  to: Record<string, number>;
  duration: number;
  ease: string;
}

const PRESETS: Record<MotionPresetName, MotionPreset> = {
  route: {
    from: { autoAlpha: 0, y: 12 },
    to: { autoAlpha: 1, y: 0 },
    duration: 0.38,
    ease: "power3.out",
  },
  title: {
    from: { autoAlpha: 0, y: 20 },
    to: { autoAlpha: 1, y: 0 },
    duration: 0.56,
    ease: "power3.out",
  },
  pop: {
    from: { autoAlpha: 0, y: 12, scale: 0.92 },
    to: { autoAlpha: 1, y: 0, scale: 1 },
    duration: 0.5,
    ease: "back.out(1.35)",
  },
  wave: {
    from: { autoAlpha: 0, y: 16, rotation: -1 },
    to: { autoAlpha: 1, y: 0, rotation: 0 },
    duration: 0.54,
    ease: "power3.out",
  },
  reveal: {
    from: { autoAlpha: 0, y: 18 },
    to: { autoAlpha: 1, y: 0 },
    duration: 0.58,
    ease: "power3.out",
  },
};

export function getMotionPreset(name: MotionPresetName, reducedMotion = false): MotionPreset {
  if (reducedMotion) {
    return {
      from: { autoAlpha: 1, y: 0 },
      to: { autoAlpha: 1, y: 0 },
      duration: 0,
      ease: "none",
    };
  }

  return {
    ...PRESETS[name],
    from: { ...PRESETS[name].from },
    to: { ...PRESETS[name].to },
  };
}
