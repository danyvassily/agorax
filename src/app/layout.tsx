import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { LanguageHydrator } from "@/components/providers/language-hydrator";
import { UpdateChecker } from "@/components/providers/update-checker";
import { AuthHydrator } from "@/lib/auth/use-auth";
import { MobileTabBar } from "@/components/ui/app-navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://agorax.online"),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Le jeu de soirée ultime sur mobile et web. Quiz de culture générale, dilemmes psychologiques, défis de couple et ambiance garantie entre amis. Gratuit, sans pub, en local ou en ligne.",
  applicationName: BRAND.name,
  authors: [{ name: BRAND.creator, url: "https://agorax.online" }],
  creator: BRAND.creator,
  publisher: BRAND.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://agorax.online",
    languages: {
      "fr-FR": "https://agorax.online",
      "en-US": "https://agorax.online",
      "x-default": "https://agorax.online",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  keywords: [
    "quiz",
    "jeu de soirée",
    "culture générale",
    "jeu entre amis",
    "apéro",
    "buzzer",
    "dilemmes",
    "tu préfères",
    "débat",
    "test psychologique",
    "défis couple",
    "jeu mobile gratuit",
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Le jeu de soirée ultime : quiz de culture générale, dilemmes psychologiques, défis de couple et buzzer en direct.",
    url: "https://agorax.online",
    siteName: BRAND.name,
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Le jeu de soirée ultime : quiz de culture générale, dilemmes psychologiques, défis de couple et buzzer en direct.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B14" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://agorax.online/#website",
      "url": "https://agorax.online",
      "name": "Agorax",
      "description": "Le jeu de quiz, dilemmes et débats ultime entre amis.",
      "inLanguage": ["fr-FR", "en-US"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://agorax.online/quiz?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://agorax.online/#app",
      "name": "Agorax",
      "url": "https://agorax.online",
      "applicationCategory": "GameApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
      },
      "featureList": [
        "Mode Soirée multijoueur sur un appareil (Pass and Play)",
        "Buzzer interactif et tour par tour",
        "Dilemmes psychologiques et révélation d'archétypes",
        "Quiz thématiques et culture générale",
        "Mode Défi Quotidien",
        "Mode En Ligne multijoueur temps réel",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://agorax.online/#organization",
      "name": "Agorax",
      "url": "https://agorax.online",
      "logo": "https://agorax.online/icon-512.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
        />
      </head>
      <body className="antialiased">
        <LanguageHydrator />
        <UpdateChecker />
        <AuthHydrator />
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
