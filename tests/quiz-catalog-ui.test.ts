import { describe, expect, it } from "vitest";
import { formatQuizPackTitle } from "@/lib/questions/quiz-catalog";
import { getQuizBySlug } from "@/lib/questions/seo-quiz";

describe("quiz catalog labels", () => {
  it("replaces technical import filenames with a friendly numbered series", () => {
    expect(
      formatQuizPackTitle({
        slug: "animaux-dump2-003",
        category: "animaux",
        categoryName: "Animaux & Nature",
        language: "fr",
        position: 6,
      }),
    ).toBe("Animaux & Nature · Série 7");
  });

  it("keeps meaningful quiz slugs readable", () => {
    expect(
      formatQuizPackTitle({
        slug: "revolution-francaise",
        category: "histoire",
        categoryName: "History",
        language: "en",
        position: 0,
      }),
    ).toBe("Revolution francaise");
  });

  it("does not expose import filenames on an opened quiz page", async () => {
    const quiz = await getQuizBySlug("animaux", "animaux-dump2-003");

    expect(quiz?.title).toMatch(/^Animaux & Nature · Série \d+$/);
    expect(quiz?.title.toLowerCase()).not.toContain("dump");
  });
});
