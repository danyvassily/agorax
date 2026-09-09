import { describe, expect, it } from "vitest";
import { isNavigationSectionActive } from "../src/components/ui/app-navigation";

describe("persistent app navigation", () => {
  it("keeps every game route attached to one unambiguous tab", () => {
    expect(isNavigationSectionActive("/", "home")).toBe(true);
    expect(isNavigationSectionActive("/play/local/classic", "play")).toBe(true);
    expect(isNavigationSectionActive("/play/online", "online")).toBe(true);
    expect(isNavigationSectionActive("/quiz/cinema/example", "solo")).toBe(true);
    expect(isNavigationSectionActive("/settings", "account")).toBe(true);
  });

  it("does not mark the local tab active inside online or solo play", () => {
    expect(isNavigationSectionActive("/play/online", "play")).toBe(false);
    expect(isNavigationSectionActive("/play/solo", "play")).toBe(false);
  });
});
