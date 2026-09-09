/**
 * Agorax — Registre centralisé des Thèmes et Sous-Thèmes (Bilingue FR/EN)
 * Permet la catégorisation fine, le filtrage et l'exploration des questions.
 */
import type { QuestionCategory } from "./schema";

export interface SubthemeMeta {
  slug: string;
  nameFr: string;
  nameEn: string;
  descriptionFr?: string;
  descriptionEn?: string;
  icon?: string;
}

export const CATEGORY_SUBTHEMES: Record<QuestionCategory, SubthemeMeta[]> = {
  "culture-generale": [
    { slug: "inventions", nameFr: "Inventions & Découvertes", nameEn: "Inventions & Discoveries", icon: "💡" },
    { slug: "monuments", nameFr: "Monuments & Merveilles", nameEn: "Monuments & Wonders", icon: "🗿" },
    { slug: "records", nameFr: "Records & Insolite", nameEn: "Records & Curiosities", icon: "🏆" },
    { slug: "expressions", nameFr: "Expressions & Langue", nameEn: "Idioms & Language", icon: "🗣️" },
    { slug: "arts-societe", nameFr: "Arts & Société", nameEn: "Arts & Society", icon: "🎭" },
  ],
  geographie: [
    { slug: "capitales", nameFr: "Capitales du Monde", nameEn: "World Capitals", icon: "🏛️" },
    { slug: "drapeaux", nameFr: "Drapeaux & Symboles", nameEn: "Flags & Symbols", icon: "🚩" },
    { slug: "relief-sommets", nameFr: "Montagnes & Volcans", nameEn: "Mountains & Volcanoes", icon: "🏔️" },
    { slug: "hydrographie-fleuves", nameFr: "Fleuves, Mers & Océans", nameEn: "Rivers, Seas & Oceans", icon: "🌊" },
    { slug: "iles-archipels", nameFr: "Îles & Archipels", nameEn: "Islands & Archipelagos", icon: "🏝️" },
    { slug: "france", nameFr: "Régions de France", nameEn: "Regions of France", icon: "🥖" },
  ],
  histoire: [
    { slug: "antiquite", nameFr: "Antiquité & Rome", nameEn: "Antiquity & Ancient Rome", icon: "🏺" },
    { slug: "moyen-age", nameFr: "Moyen Âge & Chevaliers", nameEn: "Middle Ages & Knights", icon: "⚔️" },
    { slug: "renaissance", nameFr: "Renaissance & Grandes Découvertes", nameEn: "Renaissance & Explorations", icon: "🧭" },
    { slug: "revolution-empires", nameFr: "Révolution & Empires", nameEn: "Revolution & Empires", icon: "👑" },
    { slug: "guerres-mondiales", nameFr: "Guerres Mondiales", nameEn: "World Wars", icon: "🎖️" },
    { slug: "monde-contemporain", nameFr: "Époque Contemporaine", nameEn: "Contemporary Era", icon: "📰" },
  ],
  cinema: [
    { slug: "films-cultes", nameFr: "Films Cultes", nameEn: "Cult Movies", icon: "🍿" },
    { slug: "realisateurs", nameFr: "Réalisateurs de Légende", nameEn: "Legendary Directors", icon: "🎬" },
    { slug: "acteurs", nameFr: "Acteurs & Stars", nameEn: "Actors & Stars", icon: "🌟" },
    { slug: "animation", nameFr: "Cinéma d'Animation", nameEn: "Animated Movies", icon: "🎨" },
    { slug: "repliques", nameFr: "Répliques Mémorables", nameEn: "Iconic Movie Quotes", icon: "💬" },
    { slug: "oscars", nameFr: "Oscars & Palmes d'Or", nameEn: "Oscars & Awards", icon: "🏆" },
  ],
  series: [
    { slug: "series-cultes", nameFr: "Séries Cultes", nameEn: "Cult TV Shows", icon: "📺" },
    { slug: "sci-fi-fantastique", nameFr: "Sci-Fi & Fantastique", nameEn: "Sci-Fi & Fantasy", icon: "🛸" },
    { slug: "policier-thriller", nameFr: "Policiers & Thrillers", nameEn: "Crime & Thrillers", icon: "🕵️" },
    { slug: "sitcoms-comedies", nameFr: "Sitcoms & Comédies", nameEn: "Sitcoms & Comedy", icon: "😂" },
    { slug: "personnages", nameFr: "Personnages Inoubliables", nameEn: "Unforgettable Characters", icon: "🎭" },
  ],
  musique: [
    { slug: "rock-metal", nameFr: "Rock & Métal", nameEn: "Rock & Metal", icon: "🎸" },
    { slug: "rap-hiphop", nameFr: "Rap & Hip-Hop", nameEn: "Rap & Hip-Hop", icon: "🎤" },
    { slug: "pop-variete", nameFr: "Pop & Variété", nameEn: "Pop & Hits", icon: "✨" },
    { slug: "chanson-francaise", nameFr: "Chanson Française", nameEn: "French Song Classics", icon: "🥐" },
    { slug: "classique-opera", nameFr: "Classique & Opéra", nameEn: "Classical & Opera", icon: "🎻" },
  ],
  "manga-anime": [
    { slug: "shonen", nameFr: "Grands Shōnen (DBZ, One Piece, Naruto)", nameEn: "Classic Shonen", icon: "⚡" },
    { slug: "seinen", nameFr: "Seinen & Sombres (Berserk, SnK)", nameEn: "Seinen & Dark Fantasy", icon: "🗡️" },
    { slug: "animation-ghibli", nameFr: "Films & Studio Ghibli", nameEn: "Studio Ghibli & Movies", icon: "🍃" },
    { slug: "personnages", nameFr: "Héros & Méchants", nameEn: "Heroes & Villains", icon: "👺" },
    { slug: "records", nameFr: "Records & Mangakas", nameEn: "Records & Mangaka", icon: "✍️" },
  ],
  gaming: [
    { slug: "retro-arcade", nameFr: "Rétrogaming & Arcade", nameEn: "Retrogaming & Arcade", icon: "👾" },
    { slug: "nintendo", nameFr: "Univers Nintendo", nameEn: "Nintendo Universe", icon: "🍄" },
    { slug: "playstation-xbox", nameFr: "PlayStation, Xbox & PC", nameEn: "PlayStation, Xbox & PC", icon: "🎮" },
    { slug: "rpg-aventure", nameFr: "RPG & Aventure", nameEn: "RPG & Adventure", icon: "🛡️" },
    { slug: "esport-multi", nameFr: "Esport & Multijoueur", nameEn: "Esports & Multiplayer", icon: "🎯" },
  ],
  science: [
    { slug: "astronomie", nameFr: "Astronomie & Espace", nameEn: "Astronomy & Space", icon: "🌌" },
    { slug: "physique-chimie", nameFr: "Physique & Chimie", nameEn: "Physics & Chemistry", icon: "⚛️" },
    { slug: "biologie", nameFr: "Biologie & Génétique", nameEn: "Biology & Genetics", icon: "🧬" },
    { slug: "corps-humain", nameFr: "Corps Humain & Médecine", nameEn: "Human Body & Medicine", icon: "🫀" },
    { slug: "decouvertes", nameFr: "Grandes Découvertes Scientifiques", nameEn: "Major Discoveries", icon: "🔭" },
  ],
  technologie: [
    { slug: "intelligence-artificielle", nameFr: "IA & Futur", nameEn: "AI & Future Tech", icon: "🤖" },
    { slug: "informatique", nameFr: "Histoire de l'Informatique", nameEn: "Computer Science History", icon: "💻" },
    { slug: "smartphones", nameFr: "Smartphones & Gadgets", nameEn: "Smartphones & Gadgets", icon: "📱" },
    { slug: "entreprises-pionniers", nameFr: "Pionniers & Géants de la Tech", nameEn: "Pioneers & Tech Giants", icon: "🏢" },
    { slug: "cybersecurite", nameFr: "Web & Cybersécurité", nameEn: "Web & Cybersecurity", icon: "🔒" },
  ],
  internet: [
    { slug: "memes", nameFr: "Mèmes & Culture Web", nameEn: "Memes & Web Culture", icon: "🐸" },
    { slug: "reseaux-sociaux", nameFr: "Réseaux Sociaux", nameEn: "Social Networks", icon: "💬" },
    { slug: "histoire-du-web", nameFr: "Histoire d'Internet", nameEn: "History of the Internet", icon: "🌐" },
  ],
  "mythologie-grecque": [
    { slug: "olympiens", nameFr: "Dieux de l'Olympe", nameEn: "Olympian Gods", icon: "⚡" },
    { slug: "heros", nameFr: "Héros & Demi-Dieux (Héraclès, Achille)", nameEn: "Heroes & Demigods", icon: "🏹" },
    { slug: "creatures", nameFr: "Créatures & Monstres", nameEn: "Monsters & Creatures", icon: "🐍" },
    { slug: "guerre-de-troie", nameFr: "Guerre de Troie & L'Odyssée", nameEn: "Trojan War & Odyssey", icon: "⛵" },
    { slug: "enfers", nameFr: "Les Enfers & Hadès", nameEn: "The Underworld & Hades", icon: "🔥" },
  ],
  philosophie: [
    { slug: "philosophie-antique", nameFr: "Antiquité (Socrate, Platon, Aristote)", nameEn: "Ancient Philosophy", icon: "🏛️" },
    { slug: "stoicisme", nameFr: "Stoïcisme & Sagesses", nameEn: "Stoicism & Wisdom", icon: "🧘" },
    { slug: "existentialisme", nameFr: "Existentialisme & Absurde", nameEn: "Existentialism", icon: "🕯️" },
    { slug: "philosophie-moderne", nameFr: "Lumières & Époque Moderne", nameEn: "Enlightenment & Modernity", icon: "📖" },
    { slug: "ethique", nameFr: "Dilemmes & Éthique", nameEn: "Ethics & Dilemmas", icon: "⚖️" },
  ],
  sport: [
    { slug: "jeux-olympiques", nameFr: "Jeux Olympiques", nameEn: "Olympic Games", icon: "🥇" },
    { slug: "tennis", nameFr: "Tennis & Grand Chelem", nameEn: "Tennis & Grand Slams", icon: "🎾" },
    { slug: "basketball", nameFr: "Basketball & NBA", nameEn: "Basketball & NBA", icon: "🏀" },
    { slug: "rugby", nameFr: "Rugby & Tournois", nameEn: "Rugby", icon: "🏉" },
    { slug: "sports-mecaniques", nameFr: "Formule 1 & Moto", nameEn: "Motorsports & F1", icon: "🏎️" },
    { slug: "athletisme", nameFr: "Athlétisme & Natation", nameEn: "Athletics & Swimming", icon: "🏊" },
  ],
  football: [
    { slug: "coupe-du-monde", nameFr: "Coupe du Monde", nameEn: "FIFA World Cup", icon: "🏆" },
    { slug: "ligue-des-champions", nameFr: "Ligue des Champions", nameEn: "Champions League", icon: "⭐" },
    { slug: "legendes", nameFr: "Légendes du Football", nameEn: "Football Legends", icon: "👑" },
    { slug: "clubs", nameFr: "Grands Clubs Européens", nameEn: "European Clubs", icon: "🛡️" },
    { slug: "records", nameFr: "Ballons d'Or & Records", nameEn: "Ballon d'Or & Records", icon: "⚽" },
  ],
  food: [
    { slug: "gastronomie-francaise", nameFr: "Gastronomie Française", nameEn: "French Cuisine", icon: "🥖" },
    { slug: "cuisine-monde", nameFr: "Cuisines du Monde", nameEn: "World Cuisines", icon: "🍜" },
    { slug: "patisserie", nameFr: "Pâtisserie & Desserts", nameEn: "Pastry & Desserts", icon: "🍰" },
    { slug: "fromages-vins", nameFr: "Fromages, Vins & Boissons", nameEn: "Cheese, Wine & Drinks", icon: "🍷" },
    { slug: "epices-ingredients", nameFr: "Épices & Ingrédients", nameEn: "Spices & Ingredients", icon: "🌶️" },
  ],
  voyage: [
    { slug: "destinations-iconiques", nameFr: "Destinations Mythiques", nameEn: "Iconic Destinations", icon: "✈️" },
    { slug: "curiosites-locales", nameFr: "Coutumes & Curiosités Locales", nameEn: "Local Traditions & Curiosities", icon: "🗺️" },
    { slug: "parcs-naturels", nameFr: "Parcs Nationaux & Merveilles", nameEn: "National Parks & Wonders", icon: "🏞️" },
  ],
  art: [
    { slug: "peinture", nameFr: "Peinture & Chefs-d'œuvre", nameEn: "Painting & Masterpieces", icon: "🎨" },
    { slug: "sculpture", nameFr: "Sculpture & Statues", nameEn: "Sculpture & Statues", icon: "🗿" },
    { slug: "architecture", nameFr: "Architecture & Cathédrales", nameEn: "Architecture & Cathedrals", icon: "🏰" },
    { slug: "mouvements", nameFr: "Grands Mouvements Artistiques", nameEn: "Art Movements", icon: "🖌️" },
    { slug: "musees", nameFr: "Musées Célèbres", nameEn: "Famous Museums", icon: "🏛️" },
  ],
  litterature: [
    { slug: "classiques", nameFr: "Grands Classiques", nameEn: "Literary Classics", icon: "📚" },
    { slug: "poesie-theatre", nameFr: "Poésie & Théâtre", nameEn: "Poetry & Theatre", icon: "🎭" },
    { slug: "fantasy-sci-fi", nameFr: "Fantasy & Science-Fiction", nameEn: "Fantasy & Sci-Fi", icon: "🐉" },
    { slug: "policier-thriller", nameFr: "Romans Policiers & Enquêtes", nameEn: "Detective & Crime Novels", icon: "🔍" },
    { slug: "prix-litteraires", nameFr: "Prix Goncourt & Nobels", nameEn: "Literary Awards", icon: "🏅" },
  ],
  insolite: [
    { slug: "corps-humain", nameFr: "Faits Bizarres sur le Corps", nameEn: "Weird Human Body Facts", icon: "🧠" },
    { slug: "nature-espace", nameFr: "Mystères de l'Espace & Océans", nameEn: "Space & Ocean Oddities", icon: "🛸" },
    { slug: "records-absurdes", nameFr: "Records Inutiles & Absurdes", nameEn: "Absurd World Records", icon: "🤪" },
    { slug: "lois-etranges", nameFr: "Lois Insolites du Monde", nameEn: "Bizarre Laws Across The World", icon: "📜" },
  ],
  politique: [
    { slug: "institutions", nameFr: "Institutions & Démocratie", nameEn: "Institutions & Democracy", icon: "🏛️" },
    { slug: "dirigeants-histoire", nameFr: "Grands Dirigeants Historiques", nameEn: "Historic Leaders", icon: "🎙️" },
    { slug: "relations-internationales", nameFr: "Géopolitique & Traités", nameEn: "Geopolitics & Treaties", icon: "🌐" },
  ],
  animaux: [
    { slug: "faune-sauvage", nameFr: "Félins, Prédateurs & Savane", nameEn: "Wild Predators & Savanna", icon: "🦁" },
    { slug: "monde-marin", nameFr: "Créatures Marines & Abysses", nameEn: "Marine Life & Deep Sea", icon: "🐋" },
    { slug: "oiseaux", nameFr: "Oiseaux & Rapaces", nameEn: "Birds & Raptors", icon: "🦅" },
    { slug: "records-animaux", nameFr: "Records & Super-Pouvoirs Animaux", nameEn: "Animal Records & Superpowers", icon: "🦎" },
    { slug: "animaux-domestiques", nameFr: "Chiens, Chats & Compagnons", nameEn: "Pets & Domestic Animals", icon: "🐶" },
  ],
  "jeux-de-societe": [
    { slug: "classiques", nameFr: "Classiques (Échecs, Monopoly, Scrabble)", nameEn: "Classics (Chess, Monopoly)", icon: "♟️" },
    { slug: "modernes", nameFr: "Jeux de Plateau Modernes (Catan, Carcassonne)", nameEn: "Modern Board Games", icon: "🎲" },
    { slug: "ambiance", nameFr: "Jeux d'Ambiance & de Cartes", nameEn: "Party Games & Cards", icon: "🃏" },
    { slug: "strategie", nameFr: "Jeux de Stratégie & Enquêtes", nameEn: "Strategy & Mystery Games", icon: "🕵️" },
  ],
  "comics-bd": [
    { slug: "marvel", nameFr: "Univers Marvel (Avengers, Spider-Man)", nameEn: "Marvel Universe", icon: "🦸" },
    { slug: "dc-comics", nameFr: "Univers DC (Batman, Superman)", nameEn: "DC Universe", icon: "🦇" },
    { slug: "franco-belge", nameFr: "BD Franco-Belge (Astérix, Tintin)", nameEn: "Franco-Belgian Comics", icon: "🥖" },
    { slug: "romans-graphiques", nameFr: "Romans Graphiques Cultes", nameEn: "Graphic Novels", icon: "📖" },
  ],
  vehicules: [
    { slug: "automobile", nameFr: "Histoire de l'Automobile & Marques", nameEn: "Automotive History & Brands", icon: "🚗" },
    { slug: "supercars-sport", nameFr: "Supercars & Course Automobile", nameEn: "Supercars & Motorsport", icon: "🏎️" },
    { slug: "aviation", nameFr: "Aviation & Avions Légendaires", nameEn: "Aviation & Iconic Aircraft", icon: "✈️" },
    { slug: "trains-bateaux", nameFr: "Ferroviaire & Navires Mythiques", nameEn: "Trains & Historic Ships", icon: "🚢" },
    { slug: "spatial", nameFr: "Fusées & Conquête Spatiale", nameEn: "Rockets & Space Exploration", icon: "🚀" },
  ],
  psychologie: [
    { slug: "biais-cognitifs", nameFr: "Biais Cognitifs & Pièges Mentaux", nameEn: "Cognitive Biases & Mental Traps", icon: "🧠" },
    { slug: "experiences-celebres", nameFr: "Expériences Scientifiques Célèbres", nameEn: "Famous Psychological Experiments", icon: "🧪" },
    { slug: "archetypes", nameFr: "Archétypes & Personnalités", nameEn: "Archetypes & Personalities", icon: "🎭" },
    { slug: "psychologie-sociale", nameFr: "Relations Sociales & Émotions", nameEn: "Social Relations & Emotions", icon: "🤝" },
  ],
};

/**
 * Récupère tous les sous-thèmes d'une catégorie
 */
export function getSubthemesForCategory(category: QuestionCategory): SubthemeMeta[] {
  return CATEGORY_SUBTHEMES[category] ?? [];
}

/**
 * Récupère les métadonnées d'un sous-thème spécifique
 */
export function getSubthemeMeta(category: QuestionCategory, subthemeSlug: string): SubthemeMeta | undefined {
  const list = CATEGORY_SUBTHEMES[category];
  if (!list) return undefined;
  return list.find((s) => s.slug === subthemeSlug);
}

/**
 * Formate le libellé d'un sous-thème selon la langue de l'utilisateur
 */
export function subthemeLabel(category: QuestionCategory, subthemeSlug: string, language: string): string {
  const meta = getSubthemeMeta(category, subthemeSlug);
  if (!meta) {
    // Fallback propre : capitalisation du slug
    return subthemeSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return language === "en" ? meta.nameEn : meta.nameFr;
}
