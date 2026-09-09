import type { MetadataRoute } from "next";
import { getAllQuizSlugs } from "@/lib/questions/seo-quiz";
import { MODE_META } from "@/lib/game/modes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://agorax.online";
  const now = new Date();

  // 1. Pages principales et hubs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          fr: `${baseUrl}`,
          en: `${baseUrl}`,
          "x-default": `${baseUrl}`,
        },
      },
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          fr: `${baseUrl}/quiz`,
          en: `${baseUrl}/quiz`,
          "x-default": `${baseUrl}/quiz`,
        },
      },
    },
    {
      url: `${baseUrl}/daily`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/play/local`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/play/solo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/play/discovery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/play/online`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // 2. Modes de jeu spécifiques (/play/local/[mode])
  const modeRoutes: MetadataRoute.Sitemap = Object.keys(MODE_META).map((mode) => ({
    url: `${baseUrl}/play/local/${mode}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Toutes les fiches thématiques SEO dynamiques (/quiz/[category]/[slug])
  let quizRoutes: MetadataRoute.Sitemap = [];
  try {
    const quizSlugs = await getAllQuizSlugs();
    quizRoutes = quizSlugs.map(({ category, slug }) => ({
      url: `${baseUrl}/quiz/${category}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          fr: `${baseUrl}/quiz/${category}/${slug}`,
          en: `${baseUrl}/quiz/${category}/${slug}`,
          "x-default": `${baseUrl}/quiz/${category}/${slug}`,
        },
      },
    }));
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap des quiz:", error);
  }

  return [...staticRoutes, ...modeRoutes, ...quizRoutes];
}
