/**
 * Free Party — Moteur de traduction automatique de questions (FR -> EN)
 * Permet aux joueurs anglophones de jouer à n'importe quel quiz en anglais
 * tout en conservant l'index exact de la bonne réponse (correctAnswer 0..3)
 * partagé avec les joueurs francophones dans le même salon multijoueur.
 */

import type { QuestionTranslation } from "./schema";
import type { LocalizableQuestion } from "./localize";

/** Cache mémoire pour éviter de re-traduire la même question */
const translationCache = new Map<string, QuestionTranslation>();

/** Dictionnaire des pays et nationalités */
const COUNTRIES_AND_PLACES: Record<string, string> = {
  "la France": "France",
  "France": "France",
  "l'Espagne": "Spain",
  "l'espagne": "Spain",
  "Espagne": "Spain",
  "l'Italie": "Italy",
  "l'italie": "Italy",
  "Italie": "Italy",
  "l'Allemagne": "Germany",
  "l'allemagne": "Germany",
  "Allemagne": "Germany",
  "le Royaume-Uni": "the United Kingdom",
  "Royaume-Uni": "United Kingdom",
  "l'Angleterre": "England",
  "Angleterre": "England",
  "l'Écosse": "Scotland",
  "Écosse": "Scotland",
  "l'Irlande": "Ireland",
  "Irlande": "Ireland",
  "les États-Unis": "the United States",
  "Les États-Unis": "the United States",
  "États-Unis": "the United States",
  "la Chine": "China",
  "Chine": "China",
  "le Japon": "Japan",
  "Japon": "Japan",
  "la Russie": "Russia",
  "Russie": "Russia",
  "le Brésil": "Brazil",
  "Brésil": "Brazil",
  "l'Australie": "Australia",
  "Australie": "Australia",
  "le Canada": "Canada",
  "Canada": "Canada",
  "le Mexique": "Mexico",
  "Mexique": "Mexico",
  "l'Inde": "India",
  "Inde": "India",
  "l'Égypte": "Egypt",
  "Égypte": "Egypt",
  "la Grèce": "Greece",
  "Grèce": "Greece",
  "la Norvège": "Norway",
  "Norvège": "Norway",
  "la Suède": "Sweden",
  "Suède": "Sweden",
  "le Danemark": "Denmark",
  "Danemark": "Denmark",
  "la Finlande": "Finland",
  "Finlande": "Finland",
  "l'Islande": "Iceland",
  "Islande": "Iceland",
  "les Pays-Bas": "the Netherlands",
  "Pays-Bas": "Netherlands",
  "la Belgique": "Belgium",
  "Belgique": "Belgium",
  "la Suisse": "Switzerland",
  "Suisse": "Switzerland",
  "le Portugal": "Portugal",
  "Portugal": "Portugal",
  "l'Autriche": "Austria",
  "Autriche": "Austria",
  "la Pologne": "Poland",
  "Pologne": "Poland",
  "l'Argentine": "Argentina",
  "Argentine": "Argentina",
  "le Chili": "Chile",
  "Chili": "Chile",
  "le Pérou": "Peru",
  "Pérou": "Peru",
  "la Colombie": "Colombia",
  "Colombie": "Colombia",
  "l'Uruguay": "Uruguay",
  "Uruguay": "Uruguay",
  "le Maroc": "Morocco",
  "Maroc": "Morocco",
  "l'Algérie": "Algeria",
  "Algérie": "Algeria",
  "la Tunisie": "Tunisia",
  "Tunisie": "Tunisia",
  "l'Afrique du Sud": "South Africa",
  "Afrique du Sud": "South Africa",
  "la Turquie": "Turkey",
  "Turquie": "Turkey",
  "la Corée du Sud": "South Korea",
  "Corée du Sud": "South Korea",
  "la Corée du Nord": "North Korea",
  "Corée du Nord": "North Korea",
  "la Nouvelle-Zélande": "New Zealand",
  "Nouvelle-Zélande": "New Zealand",
  "la Tanzanie": "Tanzania",
  "Tanzanie": "Tanzania",
  "le Kenya": "Kenya",
  "Kenya": "Kenya",
};

/** Dictionnaire des éléments chimiques, sciences et nature */
const SCIENCE_AND_NATURE: Record<string, string> = {
  "L'hydrogène": "Hydrogen",
  "l'hydrogène": "Hydrogen",
  "hydrogène": "Hydrogen",
  "L'hélium": "Helium",
  "l'hélium": "Helium",
  "hélium": "Helium",
  "Le carbone": "Carbon",
  "le carbone": "Carbon",
  "carbone": "Carbon",
  "Le diazote": "Nitrogen",
  "L'azote": "Nitrogen",
  "l'azote": "Nitrogen",
  "azote": "Nitrogen",
  "L'oxygène": "Oxygen",
  "l'oxygène": "Oxygen",
  "oxygène": "Oxygen",
  "Le fer": "Iron",
  "le fer": "Iron",
  "fer": "Iron",
  "L'or": "Gold",
  "l'or": "Gold",
  "or": "Gold",
  "L'argent": "Silver",
  "l'argent": "Silver",
  "argent": "Silver",
  "Le cuivre": "Copper",
  "le cuivre": "Copper",
  "cuivre": "Copper",
  "Le mercure": "Mercury",
  "le mercure": "Mercury",
  "mercure": "Mercury",
  "Le plomb": "Lead",
  "le plomb": "Lead",
  "plomb": "Lead",
  "Le potassium": "Potassium",
  "potassium": "Potassium",
  "Le sodium": "Sodium",
  "sodium": "Sodium",
  "Le calcium": "Calcium",
  "calcium": "Calcium",
  "Le silicium": "Silicon",
  "silicium": "Silicon",
  "L'uranium": "Uranium",
  "uranium": "Uranium",
  "Le platine": "Platinum",
  "platine": "Platinum",
  "Le dioxyde de carbone": "Carbon dioxide",
  "Le monoxyde de carbone": "Carbon monoxide",
  "Le méthane": "Methane",
  "L'ozone": "Ozone",
  "L'électron": "Electron",
  "l'électron": "Electron",
  "Le proton": "Proton",
  "le proton": "Proton",
  "Le neutron": "Neutron",
  "le neutron": "Neutron",
  "Le photon": "Photon",
  "le photon": "Photon",
};

/** Dictionnaire des termes géographiques */
const GEO_TERMS: Record<string, string> = {
  "Le Mont Blanc": "Mont Blanc",
  "Le mont Blanc": "Mont Blanc",
  "L'Everest": "Mount Everest",
  "Le K2": "K2",
  "Le Cervin": "Matterhorn",
  "L'Aconcagua": "Aconcagua",
  "Le Kilimandjaro": "Kilimanjaro",
  "L'Elbrouz": "Mount Elbrus",
  "Le Denali": "Denali",
  "Le Nil": "The Nile",
  "le Nil": "the Nile",
  "L'Amazone": "The Amazon",
  "l'Amazone": "the Amazon",
  "Le Mississippi": "The Mississippi",
  "Le Danube": "The Danube",
  "Le Rhin": "The Rhine",
  "La Tamise": "The Thames",
  "La Seine": "The Seine",
  "La Loire": "The Loire",
  "Le Rhône": "The Rhone",
  "La Volga": "The Volga",
  "Le Tage": "The Tagus",
  "Le Gange": "The Ganges",
  "L'Indus": "The Indus",
  "Le Groenland": "Greenland",
  "La Sicile": "Sicily",
  "La Sardaigne": "Sardinia",
  "La Corse": "Corsica",
  "Les îles Canaries": "The Canary Islands",
  "Les îles Baléares": "The Balearic Islands",
  "Les Pyrénées": "The Pyrenees",
  "Les Alpes": "The Alps",
  "L'Himalaya": "The Himalayas",
  "La cordillère des Andes": "The Andes",
  "Les montagnes Rocheuses": "The Rocky Mountains",
};

/** Dictionnaire des arts, musique et culture */
const ART_AND_CULTURE: Record<string, string> = {
  "Le musée du Louvre": "The Louvre Museum",
  "Le musée d'Orsay": "Orsay Museum",
  "Le musée du Prado": "Prado Museum",
  "La galerie des Offices": "Uffizi Gallery",
  "Le Rijksmuseum": "Rijksmuseum",
  "L'Ermitage": "The Hermitage",
  "L'impressionnisme": "Impressionism",
  "Le cubisme": "Cubism",
  "Le surréalisme": "Surrealism",
  "Le romantisme": "Romanticism",
  "Le classicisme": "Classicism",
  "Le baroque": "Baroque",
  "Les Quatre Saisons": "The Four Seasons",
  "La Flûte enchantée": "The Magic Flute",
  "Le Lac des cygnes": "Swan Lake",
  "Casse-Noisette": "The Nutcracker",
  "Le Boléro": "Bolero",
  "Clair de lune": "Clair de Lune",
  "Les bois": "Woodwinds",
  "Les cuivres": "Brass",
  "Les cordes": "Strings",
  "Les percussions": "Percussion",
  "Le violon": "Violin",
  "L'alto": "Viola",
  "Le violoncelle": "Cello",
  "La contrebasse": "Double bass",
  "La flûte traversière": "Flute",
  "La clarinette": "Clarinet",
  "La trompette": "Trumpet",
  "Le trombone": "Trombone",
  "L'orgue": "Pipe organ",
  "Le clavecin": "Harpsichord",
  "La cornemuse": "Bagpipes",
  "Le saxophone": "Saxophone",
  "Terre battue": "Clay court",
  "Gazon": "Grass court",
  "Le marathon": "Marathon",
};

/** Dictionnaire des animaux courants */
const ANIMALS_DICT: Record<string, string> = {
  "Le chien": "Dog",
  "Le chat": "Cat",
  "Le cheval": "Horse",
  "Le lion": "Lion",
  "Le tigre": "Tiger",
  "L'ours": "Bear",
  "Le loup": "Wolf",
  "L'éléphant": "Elephant",
  "La girafe": "Giraffe",
  "Le zèbre": "Zebra",
  "Le kangourou": "Kangaroo",
  "Le dauphin": "Dolphin",
  "La baleine": "Whale",
  "Le requin": "Shark",
  "L'aigle": "Eagle",
  "Le faucon": "Falcon",
  "Le hibou": "Owl",
  "La chouette": "Barn owl",
  "Le serpent": "Snake",
  "Le crocodile": "Crocodile",
  "L'alligator": "Alligator",
  "La tortue": "Turtle",
  "Le caméléon": "Chameleon",
  "La grenouille": "Frog",
  "Le crapaud": "Toad",
  "L'abeille": "Bee",
  "La fourmi": "Ant",
  "L'araignée": "Spider",
  "Le papillon": "Butterfly",
};

/** Patterns de questions classiques en français vers l'anglais */
const QUESTION_PATTERNS: Array<{ regex: RegExp; replace: (match: RegExpMatchArray) => string }> = [
  // "Quelle est la capitale de l'Australie ?"
  {
    regex: /^Quelle est la capitale (?:de |du |d'|des |de la |de l')(.+?)\s*\??$/i,
    replace: (m) => {
      const countryRaw = m[1].trim();
      const country = translateEntity(countryRaw);
      return `What is the capital of ${country}?`;
    },
  },
  // "Dans quelle ville se trouve..."
  {
    regex: /^Dans quelle ville (?:se trouve|se situe|est situé)(?:e)? (.+?)\s*\??$/i,
    replace: (m) => `In which city is ${translateEntity(m[1].trim())} located?`,
  },
  // "Dans quel pays se trouve / se situe..."
  {
    regex: /^Dans quel pays (?:se trouve|se situe|est situé)(?:e)? (.+?)\s*\??$/i,
    replace: (m) => `In which country is ${translateEntity(m[1].trim())} located?`,
  },
  // "Dans quel pays... ?"
  {
    regex: /^Dans quel pays (.+?)\s*\??$/i,
    replace: (m) => `In which country ${translateClause(m[1].trim())}?`,
  },
  // "Quel est le plus grand / haut / long / vaste / profond..."
  {
    regex: /^Quel(?:le)? est le plus (grand|long|haut|profond|vaste|peuplé) (.+?)\s*\??$/i,
    replace: (m) => {
      const adjMap: Record<string, string> = {
        grand: "largest",
        long: "longest",
        haut: "highest",
        profond: "deepest",
        vaste: "largest",
        peuplé: "most populated",
      };
      const adj = adjMap[m[1].toLowerCase()] ?? "greatest";
      return `What is the ${adj} ${translateClause(m[2].trim())}?`;
    },
  },
  // "Quel est le deuxième / troisième / point culminant..."
  {
    regex: /^Quel est le (deuxième|troisième|point culminant) (.+?)\s*\??$/i,
    replace: (m) => {
      const ordMap: Record<string, string> = {
        deuxième: "second",
        troisième: "third",
        "point culminant": "highest point",
      };
      const ord = ordMap[m[1].toLowerCase()] ?? m[1];
      return `What is the ${ord} ${translateClause(m[2].trim())}?`;
    },
  },
  // "Qui a peint / écrit / composé / réalisé / découvert / inventé / sculpté..."
  {
    regex: /^Qui a (peint|écrit|composé|réalisé|découvert|inventé|sculpté|créé) (.+?)\s*\??$/i,
    replace: (m) => {
      const verbMap: Record<string, string> = {
        peint: "painted",
        écrit: "wrote",
        composé: "composed",
        réalisé: "directed",
        découvert: "discovered",
        inventé: "invented",
        sculpté: "sculpted",
        créé: "created",
      };
      const verb = verbMap[m[1].toLowerCase()] ?? "created";
      return `Who ${verb} ${translateEntity(m[2].trim())}?`;
    },
  },
  // "En quelle année..."
  {
    regex: /^En quelle année (.+?)\s*\??$/i,
    replace: (m) => `In what year did ${translateSubjectAndVerb(m[1].trim())}?`,
  },
  // "Quel est le symbole chimique de..."
  {
    regex: /^Quel est le symbole chimique (?:de l'|de la |des |du |d'|de )(.+?)\s*\??$/i,
    replace: (m) => `What is the chemical symbol for ${translateEntity(m[1].trim())}?`,
  },
  // "Combien de..."
  {
    regex: /^Combien de (.+?)\s*\??$/i,
    replace: (m) => `How many ${translateClause(m[1].trim())}?`,
  },
  // "Quel réalisateur / cinéaste..."
  {
    regex: /^Quel(?:le)? (réalisateur|cinéaste|acteur|actrice|auteur|écrivain|peintre|artiste|compositeur|musicien) (.+?)\s*\??$/i,
    replace: (m) => {
      const nounMap: Record<string, string> = {
        réalisateur: "director",
        cinéaste: "filmmaker",
        acteur: "actor",
        actrice: "actress",
        auteur: "author",
        écrivain: "writer",
        peintre: "painter",
        artiste: "artist",
        compositeur: "composer",
        musicien: "musician",
      };
      const noun = nounMap[m[1].toLowerCase()] ?? "creator";
      return `Which ${noun} ${translateClause(m[2].trim())}?`;
    },
  },
  // "Quel animal / oiseau / reptile..."
  {
    regex: /^Quel(?:le)? (animal|mammifère|oiseau|poisson|insecte|reptile) (.+?)\s*\??$/i,
    replace: (m) => `Which ${m[1].toLowerCase()} ${translateClause(m[2].trim())}?`,
  },
  // "Quel fleuve / quelle rivière / quelle mer / quel océan..."
  {
    regex: /^Quel(?:le)? (fleuve|rivière|mer|océan|volcan|sommet|désert|lac|île|archipel) (.+?)\s*\??$/i,
    replace: (m) => {
      const geoMap: Record<string, string> = {
        fleuve: "river",
        rivière: "river",
        mer: "sea",
        océan: "ocean",
        volcan: "volcano",
        sommet: "peak",
        désert: "desert",
        lac: "lake",
        île: "island",
        archipel: "archipelago",
      };
      const noun = geoMap[m[1].toLowerCase()] ?? m[1].toLowerCase();
      return `Which ${noun} ${translateClause(m[2].trim())}?`;
    },
  },
  // "Quel pays a remporté..."
  {
    regex: /^Quel pays a remporté (.+?)\s*\??$/i,
    replace: (m) => `Which country won ${translateEntity(m[1].trim())}?`,
  },
  // "Quel club a remporté..."
  {
    regex: /^Quel club(?: de football)? a remporté (.+?)\s*\??$/i,
    replace: (m) => `Which club won ${translateEntity(m[1].trim())}?`,
  },
  // "Quelle console..."
  {
    regex: /^Quelle console(?: de jeux| de salon| portable)? (.+?)\s*\??$/i,
    replace: (m) => `Which gaming console ${translateClause(m[1].trim())}?`,
  },
  // "Dans quel film..."
  {
    regex: /^Dans quel film (.+?)\s*\??$/i,
    replace: (m) => `In which movie ${translateClause(m[1].trim())}?`,
  },
  // "Quel manga..."
  {
    regex: /^Quel manga (.+?)\s*\??$/i,
    replace: (m) => `Which manga ${translateClause(m[1].trim())}?`,
  },
];

/** Traduit une entité nommée ou un terme particulier */
export function translateEntity(text: string): string {
  const trimmed = text.trim();
  if (COUNTRIES_AND_PLACES[trimmed]) return COUNTRIES_AND_PLACES[trimmed];
  if (SCIENCE_AND_NATURE[trimmed]) return SCIENCE_AND_NATURE[trimmed];
  if (GEO_TERMS[trimmed]) return GEO_TERMS[trimmed];
  if (ART_AND_CULTURE[trimmed]) return ART_AND_CULTURE[trimmed];
  if (ANIMALS_DICT[trimmed]) return ANIMALS_DICT[trimmed];

  // Remplacements partiels
  let res = trimmed;
  for (const [fr, en] of Object.entries(COUNTRIES_AND_PLACES)) {
    if (res.includes(fr)) res = res.split(fr).join(en);
  }
  for (const [fr, en] of Object.entries(SCIENCE_AND_NATURE)) {
    if (res.includes(fr)) res = res.split(fr).join(en);
  }
  for (const [fr, en] of Object.entries(GEO_TERMS)) {
    if (res.includes(fr)) res = res.split(fr).join(en);
  }
  return res;
}

/** Traduit une proposition ou clause subordonnée */
function translateClause(clause: string): string {
  const s = clause
    .replace(/\bdu monde\b/gi, "in the world")
    .replace(/\bde la Terre\b/gi, "on Earth")
    .replace(/\ben superficie\b/gi, "by area")
    .replace(/\bde l'histoire\b/gi, "in history")
    .replace(/\bdu continent africain\b/gi, "of the African continent")
    .replace(/\bdu continent européen\b/gi, "of the European continent")
    .replace(/\bdu continent américain\b/gi, "of the Americas")
    .replace(/\bdu continent asiatique\b/gi, "of Asia")
    .replace(/\bde l'univers\b/gi, "in the universe")
    .replace(/\bdans le monde\b/gi, "in the world")
    .replace(/\bse compose de\b/gi, "consists of")
    .replace(/\bse compose d'\b/gi, "consists of ")
    .replace(/\best composé de\b/gi, "is composed of")
    .replace(/\best composé d'\b/gi, "is composed of ")
    .replace(/\ba remporté\b/gi, "won")
    .replace(/\ba gagné\b/gi, "won")
    .replace(/\ba créé\b/gi, "created")
    .replace(/\ba écrit\b/gi, "wrote")
    .replace(/\ba peint\b/gi, "painted")
    .replace(/\ba découvert\b/gi, "discovered")
    .replace(/\ba réalisé\b/gi, "directed")
    .replace(/\bcompte le plateau\b/gi, "does the board have")
    .replace(/\bcomporte\b/gi, "features")
    .replace(/\bpermet de\b/gi, "allows to")
    .replace(/\ba donné son nom\b/gi, "gave its name")
    .replace(/\bpartagé entre\b/gi, "shared between")
    .replace(/\btraverse\b/gi, "crosses")
    .replace(/\bse jette dans\b/gi, "flows into");

  return translateEntity(s);
}

/** Traduit sujet + verbe pour questions type "En quelle année..." */
function translateSubjectAndVerb(phrase: string): string {
  const s = phrase
    .replace(/\ba-t-il été\b/gi, "was")
    .replace(/\ba-t-elle été\b/gi, "was")
    .replace(/\bont-ils été\b/gi, "were")
    .replace(/\bont-elles été\b/gi, "were")
    .replace(/\ba-t-il remporté\b/gi, "win")
    .replace(/\ba-t-elle remporté\b/gi, "win")
    .replace(/\ba-t-il eu lieu\b/gi, "take place")
    .replace(/\ba-t-elle eu lieu\b/gi, "take place")
    .replace(/\ba-t-on découvert\b/gi, "discover")
    .replace(/\ba débuté\b/gi, "begin")
    .replace(/\bs'est déroulé\b/gi, "take place")
    .replace(/\bs'est tenue\b/gi, "take place");

  return translateClause(s);
}

/** Traduit un choix de réponse unique */
export function translateAnswerChoice(choice: string): string {
  const trimmed = choice.trim();
  // Vérification directe dans les dictionnaires
  if (COUNTRIES_AND_PLACES[trimmed]) return COUNTRIES_AND_PLACES[trimmed];
  if (SCIENCE_AND_NATURE[trimmed]) return SCIENCE_AND_NATURE[trimmed];
  if (GEO_TERMS[trimmed]) return GEO_TERMS[trimmed];
  if (ART_AND_CULTURE[trimmed]) return ART_AND_CULTURE[trimmed];
  if (ANIMALS_DICT[trimmed]) return ANIMALS_DICT[trimmed];

  // Remplacement d'articles français simples
  let s = trimmed;
  if (/^Les États-Unis$/i.test(s)) return "the United States";
  if (/^L'Uruguay$/i.test(s)) return "Uruguay";
  if (/^L'Argentine$/i.test(s)) return "Argentina";
  if (/^Le Brésil$/i.test(s)) return "Brazil";
  if (/^L'Italie$/i.test(s)) return "Italy";
  if (/^L'Espagne$/i.test(s)) return "Spain";
  if (/^L'Allemagne$/i.test(s)) return "Germany";
  if (/^La France$/i.test(s)) return "France";
  if (/^L'Angleterre$/i.test(s)) return "England";
  if (/^Les Pays-Bas$/i.test(s)) return "Netherlands";
  if (/^Le Portugal$/i.test(s)) return "Portugal";
  if (/^La Croatie$/i.test(s)) return "Croatia";
  if (/^Le Maroc$/i.test(s)) return "Morocco";
  if (/^Le Chili$/i.test(s)) return "Chile";
  if (/^Le Pérou$/i.test(s)) return "Peru";
  if (/^La Colombie$/i.test(s)) return "Colombia";
  if (/^La Suède$/i.test(s)) return "Sweden";
  if (/^La Hongrie$/i.test(s)) return "Hungary";
  if (/^La Pologne$/i.test(s)) return "Poland";
  if (/^La Grèce$/i.test(s)) return "Greece";
  if (/^Le Japon$/i.test(s)) return "Japan";
  if (/^La Chine$/i.test(s)) return "China";
  if (/^La Russie$/i.test(s)) return "Russia";

  if (/^Le Real Madrid$/i.test(s)) return "Real Madrid";
  if (/^Le FC Barcelone$/i.test(s)) return "FC Barcelona";
  if (/^L'AC Milan$/i.test(s)) return "AC Milan";
  if (/^L'Inter Milan$/i.test(s)) return "Inter Milan";
  if (/^La Juventus$/i.test(s)) return "Juventus";
  if (/^L'Atlético de Madrid$/i.test(s)) return "Atlético Madrid";
  if (/^Le Séville FC$/i.test(s)) return "Sevilla FC";
  if (/^L'AS Rome$/i.test(s)) return "AS Roma";

  if (/^Le marathon$/i.test(s)) return "Marathon";
  if (/^Le semi-marathon$/i.test(s)) return "Half-marathon";
  if (/^Terre battue$/i.test(s)) return "Clay";
  if (/^Gazon$/i.test(s)) return "Grass";
  if (/^Dur synthétique$/i.test(s)) return "Hard court";

  if (/^Le Ballon d'Or$/i.test(s)) return "Ballon d'Or";
  if (/^Le Soulier d'Or$/i.test(s)) return "Golden Boot";

  if (/^Le musée du Louvre$/i.test(s)) return "The Louvre";
  if (/^Le musée d'Orsay$/i.test(s)) return "Musée d'Orsay";
  if (/^Le musée du Prado$/i.test(s)) return "Prado Museum";
  if (/^Le MoMA$/i.test(s)) return "MoMA";
  if (/^Le Met$/i.test(s)) return "The Met";

  if (/^64 cases$/i.test(s)) return "64 squares";
  if (/^20 pions$/i.test(s)) return "20 pieces";
  if (/^7 lettres$/i.test(s)) return "7 letters";
  if (/^28 dominos$/i.test(s)) return "28 dominoes";

  // Si commence par un article français, simplifier pour l'anglais
  s = s.replace(/^(?:Le |La |L'|Les )/i, "");
  return s;
}

/** Traduit l'énoncé d'une question en anglais */
export function translateQuestionText(frenchQuestion: string): string {
  const cleanQ = frenchQuestion.trim();

  for (const pattern of QUESTION_PATTERNS) {
    const match = cleanQ.match(pattern.regex);
    if (match) {
      try {
        const translated = pattern.replace(match);
        if (translated && translated.length >= 8) {
          return translated;
        }
      } catch {
        // repli ci-dessous
      }
    }
  }

  // Repli heuristique si aucun pattern exact ne correspond
  const translated = cleanQ
    .replace(/^Quelle est\b/i, "What is")
    .replace(/^Quel est\b/i, "What is")
    .replace(/^Quels sont\b/i, "What are")
    .replace(/^Quelles sont\b/i, "What are")
    .replace(/^Qui est\b/i, "Who is")
    .replace(/^Qui sont\b/i, "Who are")
    .replace(/^Où se trouve\b/i, "Where is located")
    .replace(/^Comment s'appelle\b/i, "What is the name of")
    .replace(/^De quel(?:le)?\b/i, "Of which")
    .replace(/^Par quel(?:le)?\b/i, "By which");

  return translateClause(translated);
}

/** Traduit une explication courte en anglais */
export function translateExplanation(exp?: string): string | undefined {
  if (!exp) return undefined;
  const s = exp
    .replace(/\best la capitale de\b/gi, "is the capital of")
    .replace(/\best le plus grand\b/gi, "is the largest")
    .replace(/\best le plus haut\b/gi, "is the highest")
    .replace(/\best situé en\b/gi, "is located in")
    .replace(/\best située en\b/gi, "is located in")
    .replace(/\ba été créé en\b/gi, "was created in")
    .replace(/\ba été créée en\b/gi, "was created in")
    .replace(/\ba remporté\b/gi, "won")
    .replace(/\ba battu\b/gi, "beat")
    .replace(/\ben battant\b/gi, "by defeating")
    .replace(/\ben finale\b/gi, "in the final");

  return translateEntity(s);
}

/**
 * Traduit automatiquement un objet de question du français vers l'anglais.
 * Conserve rigoureusement les 4 réponses dans le même ordre (0..3).
 */
export function translateQuestionToEnglish(q: LocalizableQuestion): QuestionTranslation {
  const cacheKey = JSON.stringify([q.question, q.answers, q.explanation]);
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const translatedQ = translateQuestionText(q.question);
  const translatedAnswers = q.answers.map(translateAnswerChoice);
  const translatedExp = translateExplanation(q.explanation);

  const translation: QuestionTranslation = {
    question: translatedQ.endsWith("?") ? translatedQ : `${translatedQ} ?`,
    answers: translatedAnswers,
    explanation: translatedExp ?? q.explanation,
  };

  translationCache.set(cacheKey, translation);
  return translation;
}
