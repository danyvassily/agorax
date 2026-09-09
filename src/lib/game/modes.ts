/**
 * Agorax — Métadonnées des modes de jeu et libellés de catégories.
 * Source unique pour l'accueil, la configuration et les salons en ligne.
 */
import type { GameMode } from "@/lib/store/game";
import type { QuestionCategory } from "@/lib/questions/schema";

export interface ModeMeta {
  id: GameMode;
  name: string;
  subtitle: string;
  icon: string;
  /** Couleur de la pastille iOS */
  iconBg: string;
  /** Nombre minimal de joueurs */
  minPlayers: number;
  /** Le mode utilise le catalogue de questions (catégorie + nombre) */
  usesQuestionCatalog: boolean;
  /** Le mode se prête au multi-joueurs sur un appareil */
  passAndPlay: boolean;
}

export const MODE_META: Record<GameMode, ModeMeta> = {
  agorax: {
    id: "agorax",
    name: "Agorax",
    subtitle: "Tour par tour, buzzer et finale La Ligne",
    icon: "agorax",
    iconBg: "bg-fp-primary",
    minPlayers: 2,
    usesQuestionCatalog: true,
    passAndPlay: true,
  },
  classic: {
    id: "classic",
    name: "Quiz Classique",
    subtitle: "4 réponses, 15 secondes par question",
    icon: "classic",
    iconBg: "bg-fp-cyan text-fp-text",
    minPlayers: 1,
    usesQuestionCatalog: true,
    passAndPlay: true,
  },
  truefalse: {
    id: "truefalse",
    name: "Vrai ou Faux",
    subtitle: "Rapide et sans pitié",
    icon: "check",
    iconBg: "bg-fp-success",
    minPlayers: 1,
    usesQuestionCatalog: true,
    passAndPlay: true,
  },
  rapidfire: {
    id: "rapidfire",
    name: "Rapid Fire",
    subtitle: "20 questions, 6 secondes chacune",
    icon: "rapidfire",
    iconBg: "bg-fp-yellow text-fp-text",
    minPlayers: 1,
    usesQuestionCatalog: true,
    passAndPlay: true,
  },
  timeline: {
    id: "timeline",
    name: "Timeline",
    subtitle: "Replace les événements dans l'ordre",
    icon: "timeline",
    iconBg: "bg-fp-cyan text-fp-text",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: true,
  },
  teambattle: {
    id: "teambattle",
    name: "Bataille d'équipes",
    subtitle: "Deux équipes s'affrontent",
    icon: "teambattle",
    iconBg: "bg-fp-coral",
    minPlayers: 2,
    usesQuestionCatalog: true,
    passAndPlay: true,
  },
  wyr: {
    id: "wyr",
    name: "Dilemmes",
    subtitle: "Les choix impossibles qui font débat",
    icon: "wyr",
    iconBg: "bg-fp-primary-dark",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: true,
  },
  guess: {
    id: "guess",
    name: "Indices",
    subtitle: "Devine avec des indices progressifs",
    icon: "guess",
    iconBg: "bg-[#64d2ff]",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: true,
  },
  debate: {
    id: "debate",
    name: "Débat",
    subtitle: "Philosophie, politique, éthique — personne ne gagne",
    icon: "debate",
    iconBg: "bg-[#a2845e]",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: true,
  },
  psycho: {
    id: "psycho",
    name: "Profil Psycho",
    subtitle: "18 dilemmes de soirée pour révéler votre véritable archétype",
    icon: "psycho",
    iconBg: "bg-[#8b5cf6]",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: false,
  },
  iq: {
    id: "iq",
    name: "QI Express",
    subtitle: "Logique, suites et mémoire en 8 défis",
    icon: "psycho",
    iconBg: "bg-fp-coral",
    minPlayers: 1,
    usesQuestionCatalog: false,
    passAndPlay: true,
  },
};

export const MODE_SECTIONS: Array<{ title: string; modes: GameMode[] }> = [
  { title: "Quiz & Compétition", modes: ["agorax", "classic", "truefalse", "rapidfire", "timeline", "teambattle"] },
  { title: "Psychologie & Discussion", modes: ["psycho", "iq", "debate", "wyr", "guess"] },
];

export const CATEGORY_LABELS: Record<QuestionCategory | "mixed", string> = {
  mixed: "Toutes catégories",
  "culture-generale": "Culture générale",
  geographie: "Géographie",
  histoire: "Histoire",
  cinema: "Cinéma",
  series: "Séries",
  musique: "Musique",
  "manga-anime": "Manga & Anime",
  gaming: "Jeux vidéo",
  science: "Science",
  technologie: "Technologie",
  internet: "Internet",
  "mythologie-grecque": "Mythologie grecque",
  philosophie: "Philosophie",
  sport: "Sport",
  football: "Football",
  food: "Cuisine",
  voyage: "Voyage",
  art: "Art",
  litterature: "Littérature",
  insolite: "Insolite",
  politique: "Politique",
  animaux: "Animaux & Nature",
  "jeux-de-societe": "Jeux de société",
  "comics-bd": "Comics & BD",
  vehicules: "Véhicules & Auto",
  psychologie: "Psychologie",
};

export const QUESTION_COUNT_OPTIONS = [5, 10, 20] as const;

const EN_MODE_NAMES: Record<GameMode,string> = {agorax:'Quiz Party',classic:'Classic quiz',truefalse:'True or false',rapidfire:'Rapid Fire',timeline:'Timeline',teambattle:'Team battle',wyr:'Would you rather?',guess:'Clues',debate:'The great debate',psycho:'Personality profile',iq:'Logic challenge'};
export function modeLabel(mode:GameMode,language:string){return language==='en'?EN_MODE_NAMES[mode]:mode==='agorax'?'Quiz Party':mode==='wyr'?'Tu préfères ?':mode==='debate'?'Le grand débat':MODE_META[mode].name;}
const EN_MODE_SUBTITLES: Record<GameMode, string> = {
  agorax: "Turn-taking, buzzer rounds and The Line finale",
  classic: "Four answers and 15 seconds per question",
  truefalse: "Fast and unforgiving",
  rapidfire: "20 questions with 6 seconds each",
  timeline: "Put events back in chronological order",
  teambattle: "Two teams face off",
  wyr: "Impossible choices that spark debate",
  guess: "Guess with progressive clues",
  debate: "Philosophy, politics and ethics — nobody wins",
  psycho: "18 party dilemmas reveal your true archetype",
  iq: "Logic, sequences and memory in eight challenges",
};
export function modeSubtitle(mode: GameMode, language: string) {
  return language === "en" ? EN_MODE_SUBTITLES[mode] : MODE_META[mode].subtitle;
}
const EN_CATEGORIES: Record<string,string> = {mixed:'All topics','culture-generale':'General knowledge',geographie:'Geography',histoire:'History',cinema:'Cinema',series:'TV series',musique:'Music','manga-anime':'Manga & anime',gaming:'Video games',science:'Science',technologie:'Technology',internet:'Internet','mythologie-grecque':'Greek mythology',philosophie:'Philosophy',sport:'Sport',football:'Football',food:'Food',voyage:'Travel',art:'Art',litterature:'Literature',insolite:'Curiosities',politique:'Politics',animaux:'Animals & nature','jeux-de-societe':'Board games','comics-bd':'Comics',vehicules:'Vehicles',psychologie:'Psychology'};
export function categoryLabel(language:string,category:string){return language==='en'?(EN_CATEGORIES[category]??category):(CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]??category);}
