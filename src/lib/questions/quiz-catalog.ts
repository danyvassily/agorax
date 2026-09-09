interface QuizPackTitleInput {
  slug: string;
  category: string;
  categoryName: string;
  language: "fr" | "en";
  position: number;
}

function titleFromSlug(slug: string): string {
  const words = slug
    .split("-")
    .filter(Boolean);

  return words
    .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
}

export function formatQuizPackTitle({
  slug,
  category,
  categoryName,
  language,
  position,
}: QuizPackTitleInput): string {
  const categoryPrefix = `${category}-`;
  const remainder = slug.startsWith(categoryPrefix) ? slug.slice(categoryPrefix.length) : slug;
  const isTechnicalName = /^(?:dump\d*-?)?\d+$/.test(remainder);

  if (isTechnicalName) {
    return `${categoryName} · ${language === "en" ? "Series" : "Série"} ${position + 1}`;
  }

  return titleFromSlug(slug);
}
