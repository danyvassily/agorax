import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/callback",
          "/auth/reset-password",
          "/profile",
        ],
      },
    ],
    sitemap: "https://agorax.online/sitemap.xml",
    host: "https://agorax.online",
  };
}
