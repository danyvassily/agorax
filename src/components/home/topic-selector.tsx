"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Search, Shuffle } from "lucide-react";
import { CATEGORIES, type QuestionCategory } from "@/lib/questions/schema";
import { categoryLabel } from "@/lib/game/modes";
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

const THEME_IMAGES: Partial<Record<QuestionCategory, string>> = {
  cinema: "/images/themes/cinema.png",
  series: "/images/themes/cinema.png",
  science: "/images/themes/science.png",
  technologie: "/images/themes/science.png",
  gaming: "/images/themes/gaming.png",
  food: "/images/themes/food.png",
  geographie: "/images/themes/geographie.png",
  voyage: "/images/themes/geographie.png",
  musique: "/images/themes/musique.png",
  "manga-anime": "/images/themes/manga-anime.png",
  histoire: "/images/team/toby.png",
  sport: "/images/team/ziggy.png",
  football: "/images/team/ziggy.png",
  "culture-generale": "/images/team/luma.png",
  litterature: "/images/team/luma.png",
  animaux: "/images/team/milo.png",
  insolite: "/images/team/barnaby.png",
  politique: "/images/team/leo.png",
  psychologie: "/images/team/sora.png",
  philosophie: "/images/team/sora.png",
  "jeux-de-societe": "/images/team/koa.png",
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
    </div>
  );
}
