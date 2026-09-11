import { describe, it, expect } from "vitest";
import { nextRoundQuestion } from "@/lib/questions/round-cursor";
import type { Question } from "@/lib/questions/schema";
const pool = [{ id: "q1", familyId: "a" }, { id: "q2", familyId: "A" }, { id: "q3", familyId: "b" }] as Question[];
describe("finite question deck", () => {
  it("skips a second formulation of an already displayed family", () => {
    expect(nextRoundQuestion(pool, 0)?.question.id).toBe("q3");
  });
  it("never wraps when exhausted, even after many turns", () => {
    for (let i = 2; i < 100; i++) expect(nextRoundQuestion(pool, i)).toBeNull();
  });
  it("can select the first question and handles an empty bank", () => {
    expect(nextRoundQuestion(pool, -1)?.question.id).toBe("q1");
    expect(nextRoundQuestion([], -1)).toBeNull();
  });
});
