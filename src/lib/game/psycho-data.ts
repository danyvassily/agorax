/**
 * JOUXTA — Profil Psycho : Données & Archétypes
 * 18 scénarios & dilemmes psychologiques pour révéler le tempérament de soirée.
 * Entièrement bilingue (Français / Anglais).
 */

export type PsychoArchetypeId =
  | "stratege"
  | "chaos"
  | "diplomate"
  | "protecteur"
  | "cameleon"
  | "franc_tireur"
  | "analyste"
  | "roi_soleil";

export interface PsychoArchetype {
  id: PsychoArchetypeId;
  name: string;
  nameEn: string;
  badge: string;
  badgeEn: string;
  emoji: string;
  quote: string;
  quoteEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  superpower: string;
  superpowerEn: string;
  blindSpot: string;
  blindSpotEn: string;
  partySurvival: string;
  partySurvivalEn: string;
  idealPair: {
    id: PsychoArchetypeId;
    name: string;
    nameEn: string;
    reason: string;
    reasonEn: string;
  };
  nemesisPair: {
    id: PsychoArchetypeId;
    name: string;
    nameEn: string;
    reason: string;
    reasonEn: string;
  };
  color: string;
  kawaiiTheme: "thinking" | "party" | "speed" | "happy" | "referee" | "debate";
}

export const PSYCHO_ARCHETYPES: Record<PsychoArchetypeId, PsychoArchetype> = {
  stratege: {
    id: "stratege",
    name: "Le Stratège Machiavélique",
    nameEn: "The Machiavellian Strategist",
    badge: "Cerveau de l'Ombre",
    badgeEn: "Shadow Mastermind",
    emoji: "🧠",
    quote: "« Je n'ai pas de problème avec les règles, tant que c'est moi qui les écris. »",
    quoteEn: "“I have no problem with the rules, as long as I get to write them.”",
    tagline: "Visionnaire à long terme, calculateur impassible et redoutablement efficace.",
    taglineEn: "Long-term visionary, cool-headed calculator, and remarkably effective.",
    description:
      "Vous ne jouez pas à la même partie que les autres. Pendant que vos amis réagissent à l'instant présent, vous avez déjà visualisé les 5 prochains coups. Vous maîtrisez l'art de l'influence discrète et vous savez exactement quel levier actionner pour obtenir ce que vous voulez sans jamais hausser le ton.",
    descriptionEn:
      "You aren't playing the same game as everyone else. While friends react in the moment, you're already 5 moves ahead. You master subtle influence and know exactly which lever to pull without ever raising your voice.",
    superpower: "Capacité à anticiper les retournements de situation et à manipuler le hasard en votre faveur.",
    superpowerEn: "Ability to foresee dramatic plot twists and bend luck in your favor.",
    blindSpot: "Tendance à sur-analyser les intentions innocentes et difficulté à lâcher prise sans plan B.",
    blindSpotEn: "Tendency to over-analyze innocent intentions and difficulty letting go without a backup plan.",
    partySurvival: "S'installe au bout de la table ou près du buffet pour observer les dynamiques sociales sans être exposé.",
    partySurvivalEn: "Sits at the end of the table or near the buffet to observe social dynamics without being exposed.",
    idealPair: {
      id: "protecteur",
      name: "Le Protecteur Absolu",
      nameEn: "The Absolute Protector",
      reason: "Leur loyauté inconditionnelle sécurise vos plans les plus ambitieux sans risque de trahison.",
      reasonEn: "Their unconditional loyalty shields your most ambitious plans with zero risk of betrayal.",
    },
    nemesisPair: {
      id: "chaos",
      name: "L'Agent du Chaos",
      nameEn: "The Chaos Agent",
      reason: "Leur imprévisibilité totale détruit vos projections méthodiques en 3 secondes.",
      reasonEn: "Their complete unpredictability demolishes your methodical projections in three seconds.",
    },
    color: "#4f46e5",
    kawaiiTheme: "thinking",
  },
  chaos: {
    id: "chaos",
    name: "L'Agent du Chaos",
    nameEn: "The Chaos Agent",
    badge: "Allumeur de Mèche",
    badgeEn: "Fuse Lighter",
    emoji: "⚡",
    quote: "« Si tout le monde est d'accord, c'est qu'il est temps de tout faire sauter. »",
    quoteEn: "“If everyone agrees, it's definitely time to blow it all up.”",
    tagline: "Spontané, provocateur ludique, allergique à la routine et catalyseur d'énergie.",
    taglineEn: "Spontaneous, playful provocateur, routine-allergic, and pure energy catalyst.",
    description:
      "L'ennui est votre ennemi juré. Vous adorez poser LA question qui jette un froid pour regarder la pièce s'embraser de rires ou de débats passionnés. Rien n'est sacré à vos yeux, surtout pas les convenances. Vous vivez pour l'imprévu, l'intensité et les anecdotes légendaires.",
    descriptionEn:
      "Boredom is your sworn enemy. You love dropping THE question that sparks awkward silence, only to watch the room erupt into fits of laughter or fiery debates. Nothing is sacred, especially polite etiquette.",
    superpower: "Désamorce les situations tendues par le rire et injecte une énergie communicative foudroyante.",
    superpowerEn: "Defuses tense situations with humor and injects unstoppable, infectious energy.",
    blindSpot: "Peut blesser sans le vouloir par excès d'ironie ou pousser les limites trop loin.",
    blindSpotEn: "Can unintentionally hurt feelings through excessive sarcasm or pushing boundaries too far.",
    partySurvival: "Change de groupe toutes les 12 minutes et lance un jeu improvisé à 2h du matin.",
    partySurvivalEn: "Switches conversation groups every twelve minutes and launches an impromptu game at 2 a.m.",
    idealPair: {
      id: "cameleon",
      name: "Le Caméléon Social",
      nameEn: "The Social Chameleon",
      reason: "Ils amplifient vos délires et rattrapent diplomatiquement les pots cassés.",
      reasonEn: "They amplify your wild ideas and diplomatically smooth over any broken plates.",
    },
    nemesisPair: {
      id: "analyste",
      name: "L'Analyste Lucidité",
      nameEn: "The Lucidity Analyst",
      reason: "Leur scepticisme froid et leurs faits démontent vos blagues avant même la chute.",
      reasonEn: "Their cold skepticism and blunt facts shoot down your jokes before the punchline.",
    },
    color: "#f59e0b",
    kawaiiTheme: "speed",
  },
  diplomate: {
    id: "diplomate",
    name: "Le Diplomate Suisse",
    nameEn: "The Swiss Diplomat",
    badge: "Pacificateur Suprême",
    badgeEn: "Supreme Peacemaker",
    emoji: "🕊️",
    quote: "« On peut trouver un terrain d'entente... ou commander deux pizzas différentes. »",
    quoteEn: "“We can always find common ground... or order two different pizzas.”",
    tagline: "Médiateur né, champion du consensus et gardien de la paix sociale.",
    taglineEn: "Born mediator, consensus builder, and guardian of social harmony.",
    description:
      "Vous avez un radar intérieur pour détecter le moindre malaise ou tension. Véritable ciment du groupe, vous arrondissez les angles, traduisez les propos mal compris et vous assurez que personne ne reste seul dans son coin. Votre patience force le respect.",
    descriptionEn:
      "You have a built-in radar for sensing any discomfort or friction. As the true glue of the group, you smooth rough edges, clear up misunderstandings, and make sure nobody gets left out in the cold.",
    superpower: "Désescalade n'importe quel conflit familial ou amical en trouvant le compromis parfait.",
    superpowerEn: "De-escalates any family or friendship dispute by finding the perfect compromise.",
    blindSpot: "Peur viscérale du conflit direct, au point d'oublier parfois d'exprimer vos propres désirs.",
    blindSpotEn: "A visceral dread of direct conflict, sometimes to the point of forgetting your own desires.",
    partySurvival: "S'assure que tout le monde a un verre et change subtilement de musique quand le ton monte.",
    partySurvivalEn: "Ensures everyone has a drink in hand and smoothly switches the music if tensions rise.",
    idealPair: {
      id: "roi_soleil",
      name: "Le Roi-Soleil Bienveillant",
      nameEn: "The Benevolent Sun King",
      reason: "Leur chaleur humaine naturelle facilite votre mission de rassemblement.",
      reasonEn: "Their natural human warmth makes your mission of bringing people together effortless.",
    },
    nemesisPair: {
      id: "franc_tireur",
      name: "Le Franc-Tireur Audacieux",
      nameEn: "The Bold Maverick",
      reason: "Leur franchise brutale et sans filtre sabote tous vos efforts de diplomatie.",
      reasonEn: "Their brutal, unfiltered honesty sabotages your delicate diplomatic efforts.",
    },
    color: "#10b981",
    kawaiiTheme: "referee",
  },
  protecteur: {
    id: "protecteur",
    name: "Le Protecteur Absolu",
    nameEn: "The Absolute Protector",
    badge: "Bouclier Inébranlable",
    badgeEn: "Unshakable Shield",
    emoji: "🛡️",
    quote: "« Touche à un cheveu de mes potes et on va avoir une discussion très désagréable. »",
    quoteEn: "“Touch a single hair on my friends' heads and we're going to have a very unpleasant talk.”",
    tagline: "Dévoué corps et âme à sa garde rapprochée, loyal jusqu'à la férocité.",
    taglineEn: "Devoted heart and soul to their inner circle, loyal to the bone.",
    description:
      "Pour vous, l'amitié n'est pas un concept à la mode, c'est un serment de sang. Fiable comme une horloge suisse, vous êtes celui qu'on appelle à 4h du matin en cas de pépin. Vous ne pardonnez ni la trahison, ni le manque de respect envers ceux que vous aimez.",
    descriptionEn:
      "To you, friendship isn't a casual concept; it's a sacred bond. Reliable as a Swiss watch, you're the one people call at 4 a.m. in an emergency. You forgive neither betrayal nor disrespect toward those you care about.",
    superpower: "Sens aigu de la protection et fidélité à toute épreuve face à l'adversité.",
    superpowerEn: "Sharp protective instinct and steadfast loyalty when adversity strikes.",
    blindSpot: "Méfiance instinctive envers les nouveaux venus et rancune tenace en cas d'affront.",
    blindSpotEn: "Instinctive suspicion toward newcomers and grudges held with iron tenacity.",
    partySurvival: "Surveille les sacs, commande les taxis et gère le retour des amis éméchés sans sourciller.",
    partySurvivalEn: "Watches over everyone's bags, orders cabs, and gets tipsy friends home safely.",
    idealPair: {
      id: "stratege",
      name: "Le Stratège Machiavélique",
      nameEn: "The Machiavellian Strategist",
      reason: "Une alliance solide : le cerveau tactique et le rempart protecteur.",
      reasonEn: "A solid alliance: the mastermind brain paired with the protective vanguard.",
    },
    nemesisPair: {
      id: "cameleon",
      name: "Le Caméléon Social",
      nameEn: "The Social Chameleon",
      reason: "Leur manque apparent de loyauté fixe vous inspire une méfiance immédiate.",
      reasonEn: "Their apparent lack of fixed loyalty triggers your immediate suspicion.",
    },
    color: "#2563eb",
    kawaiiTheme: "party",
  },
  cameleon: {
    id: "cameleon",
    name: "Le Caméléon Social",
    nameEn: "The Social Chameleon",
    badge: "Maître des Miroirs",
    badgeEn: "Master of Mirrors",
    emoji: "🎭",
    quote: "« Je m'entends bien avec tout le monde, surtout quand ça m'arrange. »",
    quoteEn: "“I get along with everyone, especially when it suits me.”",
    tagline: "Hyper-adaptable, miroir des attentes d'autrui et virtuose des codes relationnels.",
    taglineEn: "Ultra-adaptable, mirror of others' expectations, and master of social codes.",
    description:
      "Vous pouvez dîner avec des ministres, puis enchaîner avec un concert underground sans jamais être déplacé. Vous scannez instantanément l'ambiance d'une pièce et adoptez le ton parfait pour séduire, rassurer ou convaincre votre auditoire.",
    descriptionEn:
      "You can dine with diplomats, then jump into an underground concert without skipping a beat. You instantly read the vibe of any room and pick the ideal tone to charm, reassure, or persuade.",
    superpower: "Facilité déconcertante à nouer des alliances et à naviguer dans tous les cercles sociaux.",
    superpowerEn: "Effortless talent for forming alliances and seamlessly navigating any social circle.",
    blindSpot: "Risque de perdre le contact avec ce que vous pensez réellement à force de plaire à tous.",
    blindSpotEn: "Risk of losing touch with what you genuinely think from trying to please everyone.",
    partySurvival: "Capable d'animer aussi bien la cuisine que le salon ou la terrasse en un clin d'œil.",
    partySurvivalEn: "Equally comfortable holding court in the kitchen, living room, or patio in a heartbeat.",
    idealPair: {
      id: "chaos",
      name: "L'Agent du Chaos",
      nameEn: "The Chaos Agent",
      reason: "Vous canalisez leur folie pour en faire le clou de la soirée.",
      reasonEn: "You channel their wild energy to make it the undisputed highlight of the night.",
    },
    nemesisPair: {
      id: "protecteur",
      name: "Le Protecteur Absolu",
      nameEn: "The Absolute Protector",
      reason: "Ils jugent votre flexibilité sociale comme de l'hypocrisie déguisée.",
      reasonEn: "They judge your social agility as thinly veiled insincerity.",
    },
    color: "#8b5cf6",
    kawaiiTheme: "happy",
  },
  franc_tireur: {
    id: "franc_tireur",
    name: "Le Franc-Tireur Audacieux",
    nameEn: "The Bold Maverick",
    badge: "Électron Libre",
    badgeEn: "Free Radical",
    emoji: "🚀",
    quote: "« Je préfère me planter selon mes règles que réussir selon les vôtres. »",
    quoteEn: "“I'd rather fail playing by my own rules than succeed by yours.”",
    tagline: "Fonceur instinctif, pionnier intrépide et réfractaire absolu à l'autorité.",
    taglineEn: "Instinctive go-getter, fearless pioneer, and completely resistant to authority.",
    description:
      "Les protocoles vous donnent des boutons. Vous prenez des décisions à la vitesse de l'éclair, assumez les risques avec panache et dites tout haut ce que tout le monde chuchote tout bas. Vous êtes incapable de faire semblant.",
    descriptionEn:
      "Bureaucracy and protocol give you hives. You make decisions at lightning speed, embrace risks with swagger, and say out loud what everyone else only whispers. You are completely incapable of faking it.",
    superpower: "Courage décisif pour trancher quand tout le monde hésite et tracer de nouvelles voies.",
    superpowerEn: "Decisive courage to pull the trigger when everyone hesitates and blaze new trails.",
    blindSpot: "Impulsivité qui frise parfois la témérité aveugle et rejet viscéral des conseils bienveillants.",
    blindSpotEn: "Impulsiveness that can verge on blind recklessness, and a stubborn rejection of well-meaning advice.",
    partySurvival: "Arrive à l'improviste, propose une idée folle et repart dès qu'il s'ennuie.",
    partySurvivalEn: "Arrives unannounced, pitches an outrageous adventure, and slips away the second boredom strikes.",
    idealPair: {
      id: "analyste",
      name: "L'Analyste Lucidité",
      nameEn: "The Lucidity Analyst",
      reason: "Leur lucidité vous évite de foncer droit dans un mur sans brider votre élan.",
      reasonEn: "Their clear-eyed logic keeps you from crashing into a wall without clipping your wings.",
    },
    nemesisPair: {
      id: "diplomate",
      name: "Le Diplomate Suisse",
      nameEn: "The Swiss Diplomat",
      reason: "Leurs précautions et compromis vous donnent l'impression de perdre votre temps.",
      reasonEn: "Their endless caution and compromises make you feel like you're wasting precious time.",
    },
    color: "#ef4444",
    kawaiiTheme: "speed",
  },
  analyste: {
    id: "analyste",
    name: "L'Analyste Lucidité",
    nameEn: "The Lucidity Analyst",
    badge: "Scanner Humain",
    badgeEn: "Human Scanner",
    emoji: "🔬",
    quote: "« C'est une affirmation intéressante. Tu as des données pour prouver ça ? »",
    quoteEn: "“That's an intriguing claim. Do you have any data to back it up?”",
    tagline: "Observateur silencieux, traqueur d'incohérences et pourfendeur de faux-semblants.",
    taglineEn: "Quiet observer, flaw-hunter, and slayer of polite pretenses.",
    description:
      "Vous voyez ce que les autres manquent. Rien ne vous échappe : les micro-expressions, les contradictions logiques ou les exagérations théâtrales. Vous préférez une vérité qui dérange à un mensonge confortable, et vos analyses tombent souvent juste.",
    descriptionEn:
      "You see what others miss. Nothing slips past: micro-expressions, logical fallacies, and theatrical exaggerations. You always prefer an inconvenient truth to a comforting lie, and your insights are usually spot on.",
    superpower: "Clairvoyance implacable pour démasquer les impostures et résoudre les énigmes complexes.",
    superpowerEn: "Sharp clarity for cutting through pretenses and cracking complex interpersonal puzzles.",
    blindSpot: "Passe parfois pour froid ou cassant en privilégiant les faits bruts sur la sensibilité d'autrui.",
    blindSpotEn: "Can come across as cold or abrasive by prioritizing blunt facts over delicate feelings.",
    partySurvival: "Écoute attentivement les débats de comptoir en souriant intérieurement des sophismes.",
    partySurvivalEn: "Listens attentively to heated banter while smiling inwardly at all the logical fallacies.",
    idealPair: {
      id: "franc_tireur",
      name: "Le Franc-Tireur Audacieux",
      nameEn: "The Bold Maverick",
      reason: "Vous leur fournissez la carte pendant qu'ils foncent dans la mêlée.",
      reasonEn: "You supply the map while they charge straight into the action.",
    },
    nemesisPair: {
      id: "roi_soleil",
      name: "Le Roi-Soleil Bienveillant",
      nameEn: "The Benevolent Sun King",
      reason: "Leur besoin d'applaudissements vous semble disproportionné et vain.",
      reasonEn: "Their craving for applause strikes you as disproportionate and superficial.",
    },
    color: "#0284c7",
    kawaiiTheme: "debate",
  },
  roi_soleil: {
    id: "roi_soleil",
    name: "Le Roi-Soleil Bienveillant",
    nameEn: "The Benevolent Sun King",
    badge: "Moteur Magnétique",
    badgeEn: "Magnetic Engine",
    emoji: "👑",
    quote: "« Une fête réussie est une fête où tout le monde brille... autour de moi. »",
    quoteEn: "“A great party is one where everyone shines... around me.”",
    tagline: "Charisme naturel, généreux et fédérateur, porté par la scène et l'enthousiasme.",
    taglineEn: "Natural charisma, generous, unifying, fueled by the spotlight and excitement.",
    description:
      "Votre présence remplit la pièce. Naturellement chaleureux, vous avez le don de captiver une tablée avec une anecdote bien racontée. Vous êtes d'une générosité sans bornes envers vos amis, tant que vous gardez une petite place au centre du tableau.",
    descriptionEn:
      "Your presence fills the room. Naturally warm, you have the gift of holding a table spellbound with a well-told story. You are boundlessly generous with your friends, as long as you keep a spot at center stage.",
    superpower: "Charisme magnétique capable d'inspirer, de motiver et d'unir un groupe disparate.",
    superpowerEn: "Magnetic charisma capable of inspiring, motivating, and uniting a disparate group.",
    blindSpot: "Susceptibilité accrue face à l'indifférence ou au sentiment de ne pas être reconnu à sa juste valeur.",
    blindSpotEn: "Heightened sensitivity to indifference or any feeling of not being acknowledged for your worth.",
    partySurvival: "Porte les toasts, choisit les jeux d'ambiance et garde la lumière allumée jusqu'au bout.",
    partySurvivalEn: "Proposes every toast, curates the party games, and keeps the energy alive until the very end.",
    idealPair: {
      id: "diplomate",
      name: "Le Diplomate Suisse",
      nameEn: "The Swiss Diplomat",
      reason: "Ils préparent le terrain pour que vous puissiez briller en harmonie avec tous.",
      reasonEn: "They lay the groundwork so you can shine in perfect harmony with everyone.",
    },
    nemesisPair: {
      id: "stratege",
      name: "Le Stratège Machiavélique",
      nameEn: "The Machiavellian Strategist",
      reason: "Vous sentez confusément qu'ils tirent des ficelles dans votre dos.",
      reasonEn: "You vaguely sense they are quietly pulling strings behind your back.",
    },
    color: "#d97706",
    kawaiiTheme: "party",
  },
};

export interface PsychoQuestionOption {
  text: string;
  textEn: string;
  archetypes: Partial<Record<PsychoArchetypeId, number>>;
  axes: {
    audace: number; // -2 à +2
    empathie: number; // -2 à +2
    ordre: number; // -2 à +2
    idealisme: number; // -2 à +2
  };
}

export interface PsychoQuestion {
  id: string;
  theme: string;
  themeEn: string;
  situation: string;
  situationEn: string;
  options: [
    PsychoQuestionOption,
    PsychoQuestionOption,
    PsychoQuestionOption,
    PsychoQuestionOption,
  ];
}

export const PSYCHO_QUESTIONS: PsychoQuestion[] = [
  {
    id: "q1",
    theme: "Le Secret Indiscret",
    themeEn: "The Awkward Secret",
    situation: "Vous apprenez par hasard un secret très embarrassant sur un ami proche. Comment réagissez-vous ?",
    situationEn: "You accidentally learn a deeply embarrassing secret about a close friend. How do you react?",
    options: [
      {
        text: "Je le garde scellé au fond de moi sans jamais en parler à qui que ce soit.",
        textEn: "I keep it sealed deep inside and never mention it to a single soul.",
        archetypes: { protecteur: 3, diplomate: 1 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je vais le voir en tête-à-tête pour lui dire avec tact que je sais, pour l'aider.",
        textEn: "I speak to them one-on-one with tact to let them know I know, just to help.",
        archetypes: { diplomate: 3, analyste: 1 },
        axes: { audace: 1, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "J'analyse si cette information peut être utile pour débloquer une situation future.",
        textEn: "I analyze whether this information might be useful to solve a future problem.",
        archetypes: { stratege: 3, analyste: 1 },
        axes: { audace: 0, empathie: -2, ordre: 1, idealisme: -2 },
      },
      {
        text: "Je lâche une pique énigmatique en public juste pour voir sa réaction se décomposer.",
        textEn: "I drop a cryptic hint in public just to watch their expression unravel.",
        archetypes: { chaos: 3, franc_tireur: 1 },
        axes: { audace: 2, empathie: -2, ordre: -2, idealisme: -1 },
      },
    ],
  },
  {
    id: "q2",
    theme: "L'Addition au Restaurant",
    themeEn: "The Restaurant Bill",
    situation: "À 8 au restaurant, quelqu'un propose de diviser la note à parts égales alors qu'il a pris caviar et cocktails hors de prix.",
    situationEn: "With 8 people at dinner, someone suggests splitting the bill equally even though they ordered caviar and expensive cocktails.",
    options: [
      {
        text: "Je prends immédiatement la parole à voix haute : 'Chacun paye ce qu'il a consommé.'",
        textEn: "I speak up out loud right away: 'Everyone pays for what they ordered.'",
        archetypes: { franc_tireur: 3, analyste: 1 },
        axes: { audace: 2, empathie: -1, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je sors ma calculette en silence et annonce le montant exact au centime près.",
        textEn: "I quietly pull out my calculator and announce the exact amount to the penny.",
        archetypes: { analyste: 3, stratege: 1 },
        axes: { audace: 0, empathie: -1, ordre: 2, idealisme: 1 },
      },
      {
        text: "Je paie sans rien dire pour éviter tout malaise, quitte à bouillir intérieurement.",
        textEn: "I pay without saying a word to avoid tension, even if I'm seething inside.",
        archetypes: { diplomate: 3, cameleon: 1 },
        axes: { audace: -2, empathie: 1, ordre: -1, idealisme: -1 },
      },
      {
        text: "Je propose de commander une tournée de digestifs exorbitants pour rééquilibrer le chaos.",
        textEn: "I suggest ordering a round of pricey digestifs to balance out the chaos.",
        archetypes: { chaos: 3, roi_soleil: 1 },
        axes: { audace: 2, empathie: 0, ordre: -2, idealisme: -2 },
      },
    ],
  },
  {
    id: "q3",
    theme: "Jeu de Société Compétitif",
    themeEn: "Competitive Board Game",
    situation: "Pendant une partie de Loup-Garou ou Monopoly, vous devez trahir votre meilleur ami pour remporter la victoire.",
    situationEn: "During a game of Werewolf or Monopoly, you have to betray your best friend to take the win.",
    options: [
      {
        text: "Je le trahis froidement avec un grand sourire : le jeu est le jeu, place au spectacle !",
        textEn: "I betray them cold-heartedly with a grin: a game is a game, on with the show!",
        archetypes: { stratege: 3, chaos: 1 },
        axes: { audace: 1, empathie: -2, ordre: 1, idealisme: -2 },
      },
      {
        text: "Impossible, je préfère perdre la partie plutôt que d'enfoncer mon allié.",
        textEn: "Never. I'd rather lose the match than backstab my ally.",
        archetypes: { protecteur: 3, diplomate: 1 },
        axes: { audace: -1, empathie: 2, ordre: 0, idealisme: 2 },
      },
      {
        text: "J'invente un bluff rocambolesque qui nous propulse tous les deux au sommet.",
        textEn: "I cook up an extravagant bluff that propels both of us straight to the top.",
        archetypes: { cameleon: 3, roi_soleil: 1 },
        axes: { audace: 2, empathie: 1, ordre: -1, idealisme: 0 },
      },
      {
        text: "Je détaille rationnellement pourquoi mon coup est la seule issue mathématiquement viable.",
        textEn: "I rationally explain why my move is the only mathematically viable move.",
        archetypes: { analyste: 3, franc_tireur: 1 },
        axes: { audace: 1, empathie: -1, ordre: 2, idealisme: 0 },
      },
    ],
  },
  {
    id: "q4",
    theme: "L'Embrouille en Soirée",
    themeEn: "Barroom Trouble",
    situation: "Une altercation éclate entre un ami et un inconnu agressif au bar. Votre réflexe ?",
    situationEn: "An argument erupts between your friend and an aggressive stranger at the bar. Your reflex?",
    options: [
      {
        text: "Je m'interpose physiquement entre eux immédiatement pour protéger mon ami.",
        textEn: "I step physically between them right away to shield my friend.",
        archetypes: { protecteur: 3, franc_tireur: 1 },
        axes: { audace: 2, empathie: 2, ordre: 0, idealisme: 1 },
      },
      {
        text: "Je désamorce la situation avec le sourire, une blague et un verre offert à l'inconnu.",
        textEn: "I defuse the scene with a smile, a joke, and buying the stranger a drink.",
        archetypes: { diplomate: 3, cameleon: 1 },
        axes: { audace: 1, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "Je fais signe discrètement au videur tout en évaluant les issues de secours.",
        textEn: "I quietly signal the bouncer while mapping out emergency exits.",
        archetypes: { stratege: 3, analyste: 1 },
        axes: { audace: -1, empathie: 0, ordre: 2, idealisme: 0 },
      },
      {
        text: "J'envoie une punchline dévastatrice qui retourne tout le bar en notre faveur.",
        textEn: "I drop a devastating comeback that flips the entire bar in our favor.",
        archetypes: { roi_soleil: 2, chaos: 2 },
        axes: { audace: 2, empathie: -1, ordre: -2, idealisme: -1 },
      },
    ],
  },
  {
    id: "q5",
    theme: "Le Projet en Péril",
    themeEn: "The Project on the Brink",
    situation: "C'est la veille du rendu d'un projet de groupe important, et deux membres n'ont rien fait.",
    situationEn: "It's the night before a big group project deadline, and two teammates did zero work.",
    options: [
      {
        text: "Je refais tout moi-même dans la nuit pour que le travail soit impeccable.",
        textEn: "I pull an all-nighter and redo everything myself so the result is flawless.",
        archetypes: { analyste: 2, protecteur: 2 },
        axes: { audace: 0, empathie: 1, ordre: 2, idealisme: 1 },
      },
      {
        text: "Je négocie un délai avec le prof tout en manageant les retardataires avec fermeté.",
        textEn: "I negotiate an extension while firmly managing the slackers.",
        archetypes: { diplomate: 2, roi_soleil: 2 },
        axes: { audace: 1, empathie: 1, ordre: 1, idealisme: 0 },
      },
      {
        text: "Je présente le projet en mentionnant explicitement qui a travaillé et qui n'a rien fait.",
        textEn: "I present the project while explicitly stating who worked and who didn't.",
        archetypes: { franc_tireur: 3, stratege: 1 },
        axes: { audace: 2, empathie: -2, ordre: 1, idealisme: 2 },
      },
      {
        text: "J'improvise une présentation théâtrale pour masquer le vide avec un aplomb légendaire.",
        textEn: "I improvise a theatrical presentation to mask the gaps with sheer confidence.",
        archetypes: { cameleon: 3, chaos: 1 },
        axes: { audace: 2, empathie: 0, ordre: -2, idealisme: -2 },
      },
    ],
  },
  {
    id: "q6",
    theme: "Le Cadeau Affreux",
    themeEn: "The Hideous Gift",
    situation: "Un proche vous offre un vêtement particulièrement hideux avec des étoiles dans les yeux.",
    situationEn: "A loved one gifts you a truly hideous piece of clothing with sparkling excitement in their eyes.",
    options: [
      {
        text: "Je simule une joie intense et je le porte au moins une fois pour lui faire plaisir.",
        textEn: "I fake intense joy and wear it at least once to make them happy.",
        archetypes: { cameleon: 3, diplomate: 1 },
        axes: { audace: -1, empathie: 2, ordre: 0, idealisme: -1 },
      },
      {
        text: "Je souris et je le remercie sincèrement pour l'attention, même si je ne le porterai jamais.",
        textEn: "I smile and sincerely thank them for the thought, even if I'll never wear it.",
        archetypes: { diplomate: 3, protecteur: 1 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 0 },
      },
      {
        text: "J'éclate de rire et je lui demande immédiatement où il est allé dénicher cette pépite.",
        textEn: "I burst out laughing and immediately ask where on earth they found such a gem.",
        archetypes: { chaos: 3, franc_tireur: 1 },
        axes: { audace: 2, empathie: 0, ordre: -1, idealisme: 1 },
      },
      {
        text: "Je lui explique avec affection pourquoi ce n'est pas mon style pour trouver un échange.",
        textEn: "I gently explain why it's not my style so we can exchange it together.",
        archetypes: { analyste: 2, franc_tireur: 2 },
        axes: { audace: 1, empathie: 0, ordre: 1, idealisme: 2 },
      },
    ],
  },
  {
    id: "q7",
    theme: "Le Dilemme du Billet Trouvé",
    themeEn: "The Found Banknote",
    situation: "Vous trouvez un billet de 100 € par terre dans un café bondé. Que faites-vous ?",
    situationEn: "You spot a €100 note on the floor in a crowded café. What do you do?",
    options: [
      {
        text: "Je demande à voix haute à qui appartient ce billet pour le rendre au propriétaire.",
        textEn: "I ask out loud who lost the note so I can return it to its owner.",
        archetypes: { protecteur: 2, diplomate: 2 },
        axes: { audace: 1, empathie: 2, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je le glisse dans ma poche en observant les caméras. C'est la règle du jeu de la vie.",
        textEn: "I slip it into my pocket while checking security cameras. That's life's game.",
        archetypes: { stratege: 3, analyste: 1 },
        axes: { audace: 0, empathie: -2, ordre: 0, idealisme: -2 },
      },
      {
        text: "Je l'utilise immédiatement pour payer une tournée générale à ma table.",
        textEn: "I use it immediately to buy a full round of drinks for my table.",
        archetypes: { roi_soleil: 3, chaos: 1 },
        axes: { audace: 2, empathie: 1, ordre: -2, idealisme: 0 },
      },
      {
        text: "Je le donne au serveur comme pourboire généreux pour faire sa journée.",
        textEn: "I hand it to the server as a generous tip to make their entire day.",
        archetypes: { diplomate: 2, cameleon: 2 },
        axes: { audace: 0, empathie: 2, ordre: 0, idealisme: 1 },
      },
    ],
  },
  {
    id: "q8",
    theme: "L'Ami qui Raconte des Craques",
    themeEn: "The Exaggerating Friend",
    situation: "En soirée, un ami enjolive outrageusement une anecdote pour impressionner son auditoire.",
    situationEn: "At a party, a friend wildly exaggerates a story to impress the audience.",
    options: [
      {
        text: "Je rentre dans son jeu et j'ajoute un détail encore plus délirant pour l'épauler.",
        textEn: "I play along and add an even crazier detail to back them up.",
        archetypes: { cameleon: 2, roi_soleil: 2 },
        axes: { audace: 1, empathie: 1, ordre: -1, idealisme: -1 },
      },
      {
        text: "Je le regarde avec un petit sourire complice sans le griller en public.",
        textEn: "I give them a knowing glance and quiet smirk without blowing their cover.",
        archetypes: { diplomate: 2, protecteur: 2 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 0 },
      },
      {
        text: "Je rétablis froidement les faits : 'Attends, c'est pas du tout ce qui s'est passé !'",
        textEn: "I bluntly correct the facts: 'Wait, that's not what happened at all!'",
        archetypes: { franc_tireur: 3, analyste: 1 },
        axes: { audace: 2, empathie: -2, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je note mentalement sa tendance à la fabulation pour mes futures interactions avec lui.",
        textEn: "I mentally note their habit of making things up for future interactions.",
        archetypes: { analyste: 3, stratege: 1 },
        axes: { audace: -1, empathie: -1, ordre: 2, idealisme: 0 },
      },
    ],
  },
  {
    id: "q9",
    theme: "Organisation des Vacances",
    themeEn: "Holiday Planning",
    situation: "Votre groupe d'amis prépare un voyage d'une semaine. Votre rôle spontané ?",
    situationEn: "Your crew is planning a week-long getaway. What is your spontaneous role?",
    options: [
      {
        text: "Le tableur Excel avec budget, réservations et itinéraires optimisés.",
        textEn: "The spreadsheet with budget, bookings, and optimized daily itineraries.",
        archetypes: { analyste: 3, stratege: 1 },
        axes: { audace: -1, empathie: 0, ordre: 2, idealisme: 0 },
      },
      {
        text: "L'ambianceur qui repère les meilleurs spots de fête, bars et rooftops.",
        textEn: "The vibe master hunting down the best party spots, bars, and rooftops.",
        archetypes: { roi_soleil: 3, chaos: 1 },
        axes: { audace: 2, empathie: 1, ordre: -2, idealisme: 0 },
      },
      {
        text: "Le médiateur qui concilie les envies de ceux qui veulent dormir et ceux qui veulent bouger.",
        textEn: "The mediator balancing those who want to sleep in and those who want to explore.",
        archetypes: { diplomate: 3, protecteur: 1 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "Le franc-tireur qui part explorer la ville en solo dès que le groupe traîne trop.",
        textEn: "The lone wolf wandering off to explore solo whenever the group takes too long.",
        archetypes: { franc_tireur: 3, chaos: 1 },
        axes: { audace: 2, empathie: -1, ordre: -1, idealisme: 0 },
      },
    ],
  },
  {
    id: "q10",
    theme: "Le Message au Mauvais Destinataire",
    themeEn: "Wrong Recipient Text",
    situation: "Vous critiquez quelqu'un par texto... et vous envoyez le message à la personne concernée par erreur !",
    situationEn: "You vent about someone via text... and accidentally send the message to that exact person!",
    options: [
      {
        text: "J'assume immédiatement mes propos par un coup de fil direct : 'Parlons-en franchement.'",
        textEn: "I own it immediately with a direct call: 'Let's talk about this honestly.'",
        archetypes: { franc_tireur: 3, protecteur: 1 },
        axes: { audace: 2, empathie: 0, ordre: 1, idealisme: 2 },
      },
      {
        text: "J'invente un prétexte technique rocambolesque : piratage, correction automatique folle.",
        textEn: "I concoct a wild technical excuse: hacked phone, crazy auto-correct mishap.",
        archetypes: { cameleon: 3, chaos: 1 },
        axes: { audace: 1, empathie: -1, ordre: -2, idealisme: -2 },
      },
      {
        text: "Je présente des excuses sincères et nuancées en expliquant le contexte de mon énervement.",
        textEn: "I offer a sincere, nuanced apology explaining what caused my momentary irritation.",
        archetypes: { diplomate: 3, protecteur: 1 },
        axes: { audace: 0, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "Je calcule comment retourner la situation pour mettre en lumière un problème de fond.",
        textEn: "I calculate how to spin the incident to spotlight a real underlying issue.",
        archetypes: { stratege: 3, analyste: 1 },
        axes: { audace: 1, empathie: -1, ordre: 2, idealisme: -1 },
      },
    ],
  },
  {
    id: "q11",
    theme: "L'Apocalypse Zombie",
    themeEn: "The Zombie Apocalypse",
    situation: "L'effondrement commence. Quelle est votre première décision de survie ?",
    situationEn: "Society collapses into a zombie breakout. What is your first survival decision?",
    options: [
      {
        text: "Je fortifie mon refuge et je n'ouvre qu'aux personnes rigoureusement sélectionnées.",
        textEn: "I fortify my shelter and only open the doors to carefully vetted allies.",
        archetypes: { stratege: 3, protecteur: 1 },
        axes: { audace: 0, empathie: -1, ordre: 2, idealisme: -1 },
      },
      {
        text: "Je rassemble toute ma bande coûte que coûte, personne n'est laissé derrière.",
        textEn: "I rally my entire crew no matter what; nobody gets left behind.",
        archetypes: { protecteur: 3, roi_soleil: 1 },
        axes: { audace: 1, empathie: 2, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je prends un sac à dos léger et je pars en solitaire sur les routes secondaires.",
        textEn: "I pack a lightweight backpack and hit backroads completely solo.",
        archetypes: { franc_tireur: 3, analyste: 1 },
        axes: { audace: 2, empathie: -2, ordre: -1, idealisme: 0 },
      },
      {
        text: "Je monte un campement communautaire avec des règles claires et un esprit de fête.",
        textEn: "I build a community settlement with clear rules and a lively, festive spirit.",
        archetypes: { roi_soleil: 2, diplomate: 2 },
        axes: { audace: 1, empathie: 2, ordre: 0, idealisme: 1 },
      },
    ],
  },
  {
    id: "q12",
    theme: "La Notoriété et la Gloire",
    themeEn: "Fame and Renown",
    situation: "On vous propose d'être très célèbre, mais 30% du public vous détestera viscéralement.",
    situationEn: "You are offered immense fame, but 30% of the public will despise you deeply.",
    options: [
      {
        text: "J'accepte sans hésiter : qu'on parle de moi en bien ou en mal, tant que je suis au sommet !",
        textEn: "I accept without hesitation: good or bad press, as long as I'm on top!",
        archetypes: { roi_soleil: 3, chaos: 1 },
        axes: { audace: 2, empathie: -1, ordre: -1, idealisme: -1 },
      },
      {
        text: "Je refuse : la tranquillité d'esprit et l'anonymat auprès des miens n'ont pas de prix.",
        textEn: "I decline: peace of mind and staying anonymous with my loved ones is priceless.",
        archetypes: { protecteur: 2, diplomate: 2 },
        axes: { audace: -2, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "J'accepte si cette visibilité me permet d'accomplir un projet colossal précis.",
        textEn: "I accept if this visibility empowers me to pull off a monumental goal.",
        archetypes: { stratege: 2, franc_tireur: 2 },
        axes: { audace: 1, empathie: -1, ordre: 1, idealisme: 1 },
      },
      {
        text: "J'analyse la rentabilité financière et les retombées statistiques avant de signer.",
        textEn: "I analyze the financial return and statistical impact before signing.",
        archetypes: { analyste: 3, cameleon: 1 },
        axes: { audace: 0, empathie: -2, ordre: 2, idealisme: -2 },
      },
    ],
  },
  {
    id: "q13",
    theme: "Le Désaccord Politique en Famille",
    themeEn: "Family Political Clash",
    situation: "Au repas de famille, un oncle lance un débat houleux avec lequel vous êtes en désaccord total.",
    situationEn: "At a family dinner, an uncle starts a heated debate that you completely disagree with.",
    options: [
      {
        text: "Je réponds point par point avec des chiffres irréfutables jusqu'à ce qu'il se taise.",
        textEn: "I dismantle his argument point by point with undeniable facts until he stops.",
        archetypes: { analyste: 3, franc_tireur: 1 },
        axes: { audace: 1, empathie: -1, ordre: 2, idealisme: 1 },
      },
      {
        text: "Je change subtilement de sujet en complimentant le rôti pour préserver le calme.",
        textEn: "I subtly change the subject by complimenting the roast to keep the peace.",
        archetypes: { diplomate: 3, cameleon: 1 },
        axes: { audace: -2, empathie: 2, ordre: 1, idealisme: -1 },
      },
      {
        text: "Je jette de l'huile sur le feu en posant une question encore plus polémique pour rigoler.",
        textEn: "I pour gasoline on the fire by tossing an even more provocative question for fun.",
        archetypes: { chaos: 3, roi_soleil: 1 },
        axes: { audace: 2, empathie: -2, ordre: -2, idealisme: -2 },
      },
      {
        text: "Je défends les plus vulnérables de la table qui se sentent oppressés par ses propos.",
        textEn: "I stand up for the quieter family members who feel overwhelmed by his words.",
        archetypes: { protecteur: 3, franc_tireur: 1 },
        axes: { audace: 1, empathie: 2, ordre: 0, idealisme: 2 },
      },
    ],
  },
  {
    id: "q14",
    theme: "L'Échec Public",
    themeEn: "Public Failure",
    situation: "Vous vous plantez lamentablement lors d'une prise de parole devant 50 personnes.",
    situationEn: "You bomb awkwardly during a presentation in front of fifty people.",
    options: [
      {
        text: "Je désamorce immédiatement par l'autodérision : toute la salle rit avec moi.",
        textEn: "I instantly defuse it with self-deprecating humor: the whole room laughs with me.",
        archetypes: { cameleon: 2, roi_soleil: 2 },
        axes: { audace: 2, empathie: 1, ordre: -1, idealisme: 0 },
      },
      {
        text: "Je décortique froidement chaque erreur pour faire un sans-faute la prochaine fois.",
        textEn: "I dispassionately dissect every single mistake to guarantee perfection next time.",
        archetypes: { analyste: 3, stratege: 1 },
        axes: { audace: 0, empathie: -1, ordre: 2, idealisme: 1 },
      },
      {
        text: "Je m'en fiche complètement : ceux qui ne font rien ne se trompent jamais.",
        textEn: "I don't care at all: people who never do anything never make mistakes.",
        archetypes: { franc_tireur: 3, chaos: 1 },
        axes: { audace: 2, empathie: 0, ordre: -1, idealisme: 1 },
      },
      {
        text: "Je cherche le regard rassurant de mes amis dans la salle pour me reconnecter.",
        textEn: "I search for the reassuring smiles of my friends in the crowd to ground myself.",
        archetypes: { protecteur: 2, diplomate: 2 },
        axes: { audace: -1, empathie: 2, ordre: 0, idealisme: 1 },
      },
    ],
  },
  {
    id: "q15",
    theme: "La Vengeance",
    themeEn: "Sweet Revenge",
    situation: "Quelqu'un vous a fait un coup bas volontaire il y a quelques mois. Une occasion de lui rendre la pareille se présente.",
    situationEn: "Someone pulled a cheap shot on you months ago. An opportunity to return the favor arises.",
    options: [
      {
        text: "La vengeance est un plat qui se mange glacé : je frappe avec précision chirurgicale.",
        textEn: "Revenge is a dish best served ice cold: I strike back with surgical precision.",
        archetypes: { stratege: 3, franc_tireur: 1 },
        axes: { audace: 1, empathie: -2, ordre: 1, idealisme: -2 },
      },
      {
        text: "Je laisse couler : le karma s'en chargera, je ne m'abaisse pas à son niveau.",
        textEn: "I let it go: karma will handle it, I won't lower myself to their level.",
        archetypes: { diplomate: 2, protecteur: 2 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 2 },
      },
      {
        text: "Je lui fais une farce publique humiliante mais sans gravité matérielle.",
        textEn: "I pull a harmless yet publicly embarrassing prank on them.",
        archetypes: { chaos: 3, cameleon: 1 },
        axes: { audace: 2, empathie: -1, ordre: -2, idealisme: -1 },
      },
      {
        text: "Je vais le voir en face et lui dis que je pourrais le détruire, mais que je choisis de ne pas le faire.",
        textEn: "I confront them directly and state I could destroy them, but choose mercy.",
        archetypes: { roi_soleil: 2, franc_tireur: 2 },
        axes: { audace: 2, empathie: 0, ordre: 0, idealisme: 1 },
      },
    ],
  },
  {
    id: "q16",
    theme: "Le Grand Changement",
    themeEn: "The Big Leap",
    situation: "Votre vie actuelle est confortable mais monotone. Une opportunité excitante mais très risquée apparaît.",
    situationEn: "Your current life is comfortable but routine. An exciting yet high-risk opportunity emerges.",
    options: [
      {
        text: "Je saute le pas sans hésiter : la vie est trop courte pour être tiède !",
        textEn: "I take the leap without hesitation: life is too short to be lukewarm!",
        archetypes: { franc_tireur: 3, chaos: 1 },
        axes: { audace: 2, empathie: 0, ordre: -2, idealisme: 1 },
      },
      {
        text: "Je prépare une transition méthodique sur 6 mois pour minimiser chaque aléa.",
        textEn: "I prepare a methodical 6-month transition plan to minimize every unknown.",
        archetypes: { stratege: 3, analyste: 1 },
        axes: { audace: 0, empathie: 0, ordre: 2, idealisme: 0 },
      },
      {
        text: "Je consulte mes proches : leur avis et leur bien-être priment sur mes ambitions.",
        textEn: "I consult my inner circle: their well-being comes ahead of my personal ambition.",
        archetypes: { protecteur: 3, diplomate: 1 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "Je tente de négocier pour garder le beurre et l'argent du beurre.",
        textEn: "I try to negotiate so I can have my cake and eat it too.",
        archetypes: { cameleon: 2, roi_soleil: 2 },
        axes: { audace: 1, empathie: -1, ordre: -1, idealisme: -1 },
      },
    ],
  },
  {
    id: "q17",
    theme: "La Confiance en Soi",
    themeEn: "Confidence in the Room",
    situation: "Dans une réunion où personne n'ose prendre la parole, que ressentez-vous ?",
    situationEn: "In a meeting where awkward silence hangs and nobody dares speak, what do you feel?",
    options: [
      {
        text: "Une irrésistible envie de briser le silence et d'impulser la direction.",
        textEn: "An irresistible urge to break the silence and set the direction for everyone.",
        archetypes: { roi_soleil: 3, franc_tireur: 1 },
        axes: { audace: 2, empathie: 0, ordre: 0, idealisme: 0 },
      },
      {
        text: "J'observe la dynamique des regards pour comprendre les rapports de force cachés.",
        textEn: "I observe everyone's glances to decode the hidden power dynamics.",
        archetypes: { analyste: 2, stratege: 2 },
        axes: { audace: -1, empathie: -1, ordre: 2, idealisme: 0 },
      },
      {
        text: "Je pose une question ouverte et bienveillante pour aider quelqu'un d'autre à démarrer.",
        textEn: "I ask a warm, open-ended question to help someone else speak up.",
        archetypes: { diplomate: 3, protecteur: 1 },
        axes: { audace: 0, empathie: 2, ordre: 1, idealisme: 1 },
      },
      {
        text: "Je fais une remarque décalée pour désinhiber tout le monde d'un coup.",
        textEn: "I drop an offbeat joke to instantly take the pressure off everyone.",
        archetypes: { chaos: 3, cameleon: 1 },
        axes: { audace: 2, empathie: 1, ordre: -2, idealisme: -1 },
      },
    ],
  },
  {
    id: "q18",
    theme: "Le Testament Moral",
    themeEn: "Lasting Legacy",
    situation: "À la fin de votre existence, que souhaitez-vous que vos proches retiennent avant tout de vous ?",
    situationEn: "At the end of your life, what do you hope your loved ones remember most about you?",
    options: [
      {
        text: "« Avec cette personne, on ne s'est jamais ennuyé une seule seconde. »",
        textEn: "“With this person around, there was never a single boring second.”",
        archetypes: { chaos: 2, roi_soleil: 2 },
        axes: { audace: 2, empathie: 0, ordre: -2, idealisme: 0 },
      },
      {
        text: "« C'était le roc sur lequel on pouvait toujours compter les yeux fermés. »",
        textEn: "“They were the rock you could always count on with your eyes closed.”",
        archetypes: { protecteur: 3, diplomate: 1 },
        axes: { audace: 0, empathie: 2, ordre: 2, idealisme: 2 },
      },
      {
        text: "« Une intelligence redoutable qui a marqué son époque selon ses propres règles. »",
        textEn: "“A formidable mind who shaped their era playing strictly by their own rules.”",
        archetypes: { stratege: 2, franc_tireur: 2 },
        axes: { audace: 1, empathie: -1, ordre: 1, idealisme: 0 },
      },
      {
        text: "« Quelqu'un d'une lucidité rare qui a su apporter de la paix autour de lui. »",
        textEn: "“Someone with rare lucidity who brought peace and clarity to those around them.”",
        archetypes: { analyste: 2, diplomate: 2 },
        axes: { audace: -1, empathie: 2, ordre: 1, idealisme: 1 },
      },
    ],
  },
];
