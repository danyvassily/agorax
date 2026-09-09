/**
 * Agorax — Would You Rather data (spec §55)
 * Dilemmes sociaux drôles et profonds, sans bonne réponse.
 * Entièrement bilingue (FR / EN).
 */

export interface WouldYouRatherPair {
  id: string;
  optionA: string;
  optionAEn: string;
  optionB: string;
  optionBEn: string;
  /** Catégorie du dilemme */
  category: "fun" | "deep" | "daily" | "weird";
}

export const WYR_PAIRS: WouldYouRatherPair[] = [
  { id: "w1", optionA: "Ne plus jamais utiliser Internet", optionAEn: "Never use the internet again", optionB: "Ne plus jamais voir vos amis en vrai", optionBEn: "Never see your friends in person again", category: "fun" },
  { id: "w2", optionA: "Avoir toujours raison mais personne ne vous écoute", optionAEn: "Always be right but nobody listens to you", optionB: "Être toujours écouté mais vous tromper souvent", optionBEn: "Always be listened to but often be wrong", category: "deep" },
  { id: "w3", optionA: "Connaître la date de votre mort", optionAEn: "Know the exact date of your death", optionB: "Ne jamais savoir comment vous mourrez", optionBEn: "Never know how you will die", category: "deep" },
  { id: "w4", optionA: "Pouvoir lire dans les pensées", optionAEn: "Be able to read minds", optionB: "Pouvoir voir 10 minutes dans le futur", optionBEn: "Be able to see 10 minutes into the future", category: "weird" },
  { id: "w5", optionA: "Un an de vacances sans argent", optionAEn: "One year of vacation with no money", optionB: "Un an d'argent sans vacances", optionBEn: "One year of money with no vacation", category: "daily" },
  { id: "w6", optionA: "Être riche mais détesté", optionAEn: "Be wealthy but universally disliked", optionB: "Être pauvre mais aimé", optionBEn: "Be poor but deeply loved", category: "deep" },
  { id: "w7", optionA: "Ne plus jamais manger sucré", optionAEn: "Never eat anything sweet again", optionB: "Ne plus jamais manger salé", optionBEn: "Never eat anything savory again", category: "fun" },
  { id: "w8", optionA: "Vivre dans le passé sans technologie", optionAEn: "Live in the past without technology", optionB: "Vivre dans le futur sans souvenirs", optionBEn: "Live in the future with no memories", category: "deep" },
  { id: "w9", optionA: "Toujours avoir froid", optionAEn: "Always feel cold", optionB: "Toujours avoir chaud", optionBEn: "Always feel hot", category: "fun" },
  { id: "w10", optionA: "Savoir tout ce que les gens pensent de vous", optionAEn: "Know everything people think about you", optionB: "Que personne ne sache jamais ce que vous pensez", optionBEn: "Nobody ever knowing what you think", category: "weird" },
  { id: "w11", optionA: "Un travail passionnant mais mal payé", optionAEn: "An exciting job with low pay", optionB: "Un travail ennuyeux mais très bien payé", optionBEn: "A boring job with huge pay", category: "daily" },
  { id: "w12", optionA: "Pouvoir parler toutes les langues", optionAEn: "Fluently speak every language", optionB: "Pouvoir jouer de tous les instruments", optionBEn: "Master every musical instrument", category: "fun" },
  { id: "w13", optionA: "Refaire votre vie à l'identique", optionAEn: "Relive your exact same life again", optionB: "Recommencer autrement sans savoir où ça mène", optionBEn: "Start over completely without knowing where it leads", category: "deep" },
  { id: "w14", optionA: "Être célèbre pour un scandale", optionAEn: "Be famous for a scandal", optionB: "Être anonyme pour un exploit", optionBEn: "Be anonymous for a great achievement", category: "weird" },
  { id: "w15", optionA: "Vivre 100 ans en bonne santé mais seul", optionAEn: "Live to 100 in great health but alone", optionB: "Vivre 60 ans entouré des gens que vous aimez", optionBEn: "Live to 60 surrounded by the people you love", category: "deep" },
  { id: "w16", optionA: "Pouvoir voler", optionAEn: "Have the power to fly", optionB: "Pouvoir être invisible", optionBEn: "Have the power of invisibility", category: "fun" },
  { id: "w17", optionA: "Toujours dire ce que vous pensez", optionAEn: "Always say exactly what you think", optionB: "Ne jamais entendre une critique", optionBEn: "Never hear a single critique", category: "weird" },
  { id: "w18", optionA: "Gagner 10 000 € par mois", optionAEn: "Earn €10,000 per month", optionB: "Gagner 1 € de plus que la personne que vous détestez", optionBEn: "Earn €1 more than the person you hate most", category: "fun" },
  { id: "w19", optionA: "Un week-end parfait chaque semaine", optionAEn: "A perfect weekend every week", optionB: "Un mois parfait une fois par an", optionBEn: "A perfect month once a year", category: "daily" },
  { id: "w20", optionA: "Connaître le sens de la vie", optionAEn: "Know the true meaning of life", optionB: "Ne jamais douter de vous", optionBEn: "Never experience self-doubt again", category: "deep" },
  { id: "w21", optionA: "Être toujours en retard de 5 minutes", optionAEn: "Always be 5 minutes late", optionB: "Toujours arriver 5 minutes trop tôt", optionBEn: "Always arrive 5 minutes too early", category: "daily" },
  { id: "w22", optionA: "Pouvoir changer d'apparence à volonté", optionAEn: "Shape-shift your appearance at will", optionB: "Pouvoir changer d'âge à volonté", optionBEn: "Change your age at will", category: "fun" },
  { id: "w23", optionA: "Un génie qui vous obéit", optionAEn: "A genie that obeys your commands", optionB: "Un ami qui vous comprend", optionBEn: "A true friend who truly understands you", category: "deep" },
  { id: "w24", optionA: "Ne plus jamais avoir peur", optionAEn: "Never feel fear again", optionB: "Ne plus jamais être triste", optionBEn: "Never feel sadness again", category: "deep" },
  { id: "w25", optionA: "Manger votre plat préféré tous les jours", optionAEn: "Eat your favorite meal every single day", optionB: "Découvrir un nouveau plat parfait chaque semaine", optionBEn: "Discover an exquisite new dish every week", category: "fun" },
  { id: "w26", optionA: "Vivre dans une simulation confortable", optionAEn: "Live inside a comfortable simulation", optionB: "Vivre dans la réalité inconfortable", optionBEn: "Live in uncomfortable reality", category: "weird" },
  { id: "w27", optionA: "Être le meilleur dans un domaine", optionAEn: "Be the absolute best at one thing", optionB: "Être bon dans tous les domaines", optionBEn: "Be consistently good at everything", category: "daily" },
  { id: "w28", optionA: "Pouvoir effacer un souvenir", optionAEn: "Be able to erase a painful memory", optionB: "Pouvoir revivre un souvenir à volonté", optionBEn: "Be able to replay a favorite memory at will", category: "deep" },
  { id: "w29", optionA: "Un téléphone qui ne se décharge jamais", optionAEn: "A phone battery that never dies", optionB: "Un frigo toujours rempli", optionBEn: "A fridge that is always fully stocked", category: "fun" },
  { id: "w30", optionA: "Parler aux animaux", optionAEn: "Talk to animals", optionB: "Comprendre toutes les langues humaines", optionBEn: "Understand every human language", category: "fun" },
  { id: "w31", optionA: "Être immortel mais vieillir", optionAEn: "Be immortal but continue aging", optionB: "Mourir jeune après une vie parfaite", optionBEn: "Die young after a completely perfect life", category: "deep" },
  { id: "w32", optionA: "Toujours gagner aux jeux d'argent", optionAEn: "Always win at gambling", optionB: "Ne jamais perdre aux jeux de société", optionBEn: "Never lose a board game", category: "fun" },
];

export const WYR_CATEGORY_LABELS: Record<string, string> = {
  fun: "Fun",
  deep: "Profond",
  daily: "Quotidien",
  weird: "Bizarre",
};

export const WYR_CATEGORY_LABELS_EN: Record<string, string> = {
  fun: "Fun",
  deep: "Deep",
  daily: "Daily life",
  weird: "Weird",
};

export function pickWyrPair(excludeIds: string[]): WouldYouRatherPair {
  const available = WYR_PAIRS.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : WYR_PAIRS;
  return pool[Math.floor(Math.random() * pool.length)];
}
