import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agorax — Le Jeu de Soirée & Quiz Ultime",
    short_name: "Agorax",
    description:
      "Le jeu de soirée ultime sur mobile et web. Quiz de culture générale, dilemmes psychologiques, défis de couple et ambiance garantie entre amis.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B14",
    theme_color: "#6C5CE7",
    orientation: "portrait",
    categories: ["games", "entertainment", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Quiz Party",
        url: "/play/local/agorax",
        description: "Lancer une partie de quiz en direct avec vos amis",
      },
      {
        name: "Défi du Jour",
        url: "/daily",
        description: "Relever le quiz quotidien et comparer vos scores",
      },
      {
        name: "Profil Psycho",
        url: "/play/local/psycho",
        description: "Découvrir votre véritable archétype de soirée",
      },
      {
        name: "Dilemmes",
        url: "/play/local/wyr",
        description: "Les dilemmes impossibles qui font débat",
      },
    ],
  };
}
