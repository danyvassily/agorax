import { describe, expect, it } from "vitest";
import { DISCOVERY_PACKS, discoveryDeck, discoveryStateSchema } from "../src/lib/game/discovery";
import { CHARACTERS } from "../src/lib/characters";

describe("discovery catalogue", () => {
  it("provides seven bilingual packs and 42 unique cards", () => {
    expect(DISCOVERY_PACKS).toHaveLength(7);
    const cards = DISCOVERY_PACKS.flatMap(p => p.cards);
    expect(cards).toHaveLength(42);
    expect(new Set(cards.map(c => c.id)).size).toBe(cards.length);
    for (const pack of DISCOVERY_PACKS) {
      for (const language of ["fr", "en"] as const) {
        expect(pack.title[language].length).toBeGreaterThan(5);
        expect(pack.description[language].length).toBeGreaterThan(5);
        for (const card of pack.cards) {
          expect(card.text[language].length).toBeGreaterThan(15);
          if (pack.id === "astro-quiz") expect(card.reveal?.[language]).toBeTruthy();
        }
      }
    }
  });
  it("isolates intimate content in an explicitly adult pack", () => {
    expect(DISCOVERY_PACKS.filter(p => p.adult).map(p => p.id)).toEqual(["couple-adult"]);
    expect(DISCOVERY_PACKS[0].adult).not.toBe(true);
  });
  it("uses an existing kawaii character for every pack", () => {
    const characters = new Set(CHARACTERS.map(character => character.id));
    for (const pack of DISCOVERY_PACKS) expect(characters.has(pack.mascot as never)).toBe(true);
  });
  it("excludes already displayed cards and never silently recycles exhausted packs", () => {
    for (const pack of DISCOVERY_PACKS) {
      const first = discoveryDeck(pack.id, [], () => 0.5);
      expect(new Set(first).size).toBe(pack.cards.length);
      expect(discoveryDeck(pack.id, first)).toEqual([]);
      expect(discoveryDeck(pack.id, first.slice(0, 2))).not.toEqual(expect.arrayContaining(first.slice(0, 2)));
    }
  });
  it("rejects foreign or duplicated cards in remote session state", () => {
    const state = { packId: "couple-light", deck: discoveryDeck("couple-light"), roundId: "round-1" };
    expect(discoveryStateSchema.safeParse(state).success).toBe(true);
    expect(discoveryStateSchema.safeParse({ ...state, deck: [state.deck[0], state.deck[0]] }).success).toBe(false);
    expect(discoveryStateSchema.safeParse({ ...state, deck: ["intimacy-1"] }).success).toBe(false);
    expect(discoveryStateSchema.safeParse({ ...state, packId: "unknown" }).success).toBe(false);
    expect(discoveryStateSchema.safeParse({ ...state, deck: [] }).success).toBe(false);
  });
  it("does not allow personal answers into the shared protocol", () => {
    const parsed = discoveryStateSchema.parse({ packId: "couple-light", deck: discoveryDeck("couple-light"), roundId: "round-1", answers: ["private"] });
    expect(parsed).not.toHaveProperty("answers");
  });
});
