"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Search, Shuffle } from "lucide-react";
import { CATEGORIES, type QuestionCategory } from "@/lib/questions/schema";
import { categoryLabel } from "@/lib/game/modes";
import { getSubthemesForCategory } from "@/lib/questions/subthemes";
import styles from "./topic-selector.module.css";

type Topic = QuestionCategory | "mixed";

const FEATURED_TOPICS: QuestionCategory[] = [
  "culture-generale",
  "geographie",
  "histoire",
  "cinema",
  "musique",
  "manga-anime",
  "gaming",
  "science",
  "sport",
  "food",
  "insolite",
  "animaux",
];

const THEME_IMAGES: Record<QuestionCategory, string> = {
  "culture-generale": "/images/themes/culture-generale.png",
  geographie: "/images/themes/geographie.png",
  histoire: "/images/themes/histoire.png",
  cinema: "/images/themes/cinema.png",
  series: "/images/themes/series.png",
  musique: "/images/themes/musique.png",
  "manga-anime": "/images/themes/manga-anime.png",
  gaming: "/images/themes/gaming.png",
  science: "/images/themes/science.png",
  technologie: "/images/themes/technologie.png",
  internet: "/images/themes/internet.png",
  "mythologie-grecque": "/images/themes/mythologie-grecque.png",
  philosophie: "/images/themes/philosophie.png",
  sport: "/images/themes/sport.png",
  football: "/images/themes/football.png",
  food: "/images/themes/food.png",
  voyage: "/images/themes/voyage.png",
  art: "/images/themes/art.png",
  litterature: "/images/themes/litterature.png",
  insolite: "/images/themes/insolite.png",
  politique: "/images/themes/politique.png",
  animaux: "/images/themes/animaux.png",
  "jeux-de-societe": "/images/themes/jeux-de-societe.png",
  "comics-bd": "/images/themes/comics-bd.png",
  vehicules: "/images/themes/vehicules.png",
  psychologie: "/images/themes/psychologie.png",
};

const TOPIC_ICONS: Record<QuestionCategory, string> = {
  "culture-generale": "🧠",
  geographie: "🌍",
  histoire: "🏛️",
  cinema: "🎬",
  series: "📺",
  musique: "🎵",
  "manga-anime": "🍥",
  gaming: "🎮",
  science: "🔬",
  technologie: "💻",
  internet: "🌐",
  "mythologie-grecque": "⚡",
  philosophie: "💭",
  sport: "🏅",
  football: "⚽",
  food: "🍜",
  voyage: "✈️",
  art: "🎨",
  litterature: "📚",
  insolite: "✨",
  politique: "🗳️",
  animaux: "🐾",
  "jeux-de-societe": "🎲",
  "comics-bd": "💥",
  vehicules: "🏎️",
  psychologie: "🪞",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

export function TopicSelector({
  value,
  language,
  onChange,
}: {
  value: Topic;
  language: "fr" | "en";
  onChange: (topic: Topic) => void;
}) {
  const en = language === "en";
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const visibleTopics = useMemo(() => {
    const needle = normalize(query);
    if (needle) {
      return CATEGORIES.filter(topic => normalize(categoryLabel(language, topic)).includes(needle));
    }

    if (expanded) return [...CATEGORIES];

    const featured = [...FEATURED_TOPICS];
    if (value !== "mixed" && !featured.includes(value)) featured.unshift(value);
    return featured;
  }, [expanded, language, query, value]);

  return (
    <div className={styles.selector}>
      <button
        type="button"
        role="radio"
        aria-checked={value === "mixed"}
        data-selected={value === "mixed"}
        className={styles.mixedButton}
        onClick={() => onChange("mixed")}
      >
        <span className={styles.mixedIcon}><Shuffle size={21} /></span>
        <span className={styles.mixedCopy}>
          <strong>{en ? "Surprise me" : "Surprends-moi"}</strong>
          <span>{en ? "A balanced mix of all topics" : "Un mélange équilibré de tous les thèmes"}</span>
        </span>
        <span className={styles.check}><Check size={13} strokeWidth={3} /></span>
      </button>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={en ? "Find a topic" : "Trouver un thème"}
            aria-label={en ? "Find a topic" : "Trouver un thème"}
          />
        </label>
        {!query && (
          <button
            type="button"
            className={styles.expandButton}
            aria-expanded={expanded}
            onClick={() => setExpanded(current => !current)}
          >
            {expanded ? (en ? "Show favourites" : "Voir les favoris") : (en ? "See all topics" : "Voir tous les thèmes")}
            <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : undefined }} />
          </button>
        )}
      </div>

      <div className={styles.grid} role="radiogroup" aria-label={en ? "Quiz topic" : "Thème du quiz"}>
        {visibleTopics.map(topic => {
          const selected = value === topic;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              data-selected={selected}
              className={styles.topicButton}
              key={topic}
              onClick={() => onChange(topic)}
            >
              <span className={styles.topicIcon} aria-hidden="true">
                {THEME_IMAGES[topic] ? (
                  <Image
                    src={THEME_IMAGES[topic]!}
                    alt=""
                    width={44}
                    height={44}
                    className={styles.themeImage}
                  />
                ) : (
                  TOPIC_ICONS[topic]
                )}
              </span>
              <strong>{categoryLabel(language, topic)}</strong>
              <span className={styles.check}><Check size={10} strokeWidth={3} /></span>
            </button>
          );
        })}
        {!visibleTopics.length && (
          <p className={styles.empty}>{en ? "No matching topic." : "Aucun thème correspondant."}</p>
        )}
      </div>

      {value !== "mixed" && (
        <div className="mt-4 p-3.5 rounded-2xl bg-fp-surface border border-fp-border/70 animate-rise">
          <div className="flex items-center gap-1.5 font-bold text-fp-text text-xs mb-2">
            <span>✨</span>
            <span>{en ? "Featured Sub-topics:" : "Sous-thèmes au programme :"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getSubthemesForCategory(value).map((sub) => (
              <span
                key={sub.slug}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-fp-primary/10 border border-fp-primary/20 text-fp-primary text-[11px] font-semibold"
              >
                <span>{sub.icon}</span>
                <span>{en ? sub.nameEn : sub.nameFr}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
