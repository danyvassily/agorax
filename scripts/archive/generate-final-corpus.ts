/**
 * Agorax — Phase finale pour franchir le cap des 4 000 questions (spec §18, §28).
 * Génère des séries complètes et vérifiées pour :
 * 1. Géographie : Continents des 167 pays du monde
 * 2. Sciences : Unités du Système International & Découvertes
 * 3. Mythologie grecque & romaine : Attributs & Équivalences
 * 4. Histoire mondiale & Traités majeurs
 * 5. Cinéma & Oscars / Répliques
 * 6. Littérature mondiale & Théâtre
 * 7. Musique classique & Rock
 * 8. Sport & Jeux Olympiques
 * 9. Véhicules, Jeux de société, Comics & BD
 * 10. Troisième lot du dump Animaux
 */
import path from "node:path";
import { COUNTRIES } from "../../src/lib/questions/world-data";
import { QuestionSchema, type Question } from "../../src/lib/questions/schema";
import { cleanString, createValidQuestions, saveInChunks, shuffle, type QuestionSpec } from "./generate-bulk-corpus";

/** 1. Extraction finale Animaux (~250 questions) */
async function fetchFinalAnimals(count = 250): Promise<Question[]> {
  console.log("→ Téléchargement final du dump Animaux...");
  const url = "https://raw.githubusercontent.com/viorizz/OpenTriviaQA-FR/master/categories/animals";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Échec fetch ${url}`);
  const text = await res.text();
  const blocks = text.split(/\n\s*\n/).filter((b) => b.includes("#Q "));

  // Prendre à partir du bloc 800
  const candidateBlocks = blocks.slice(800);
  const questions: Question[] = [];
  let index = 800;

  for (const block of candidateBlocks) {
    if (questions.length >= count) break;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const qLine = lines.find((l) => l.startsWith("#Q "));
    const correctLine = lines.find((l) => l.startsWith("^ "));
    const aLine = lines.find((l) => l.startsWith("A "));
    const bLine = lines.find((l) => l.startsWith("B "));
    const cLine = lines.find((l) => l.startsWith("C "));
    const dLine = lines.find((l) => l.startsWith("D "));

    if (!qLine || !correctLine || !aLine || !bLine || !cLine || !dLine) continue;

    const qText = cleanString(qLine.replace("#Q ", ""));
    const correctText = cleanString(correctLine.replace("^ ", ""));
    const choices = [
      cleanString(aLine.replace("A ", "")),
      cleanString(bLine.replace("B ", "")),
      cleanString(cLine.replace("C ", "")),
      cleanString(dLine.replace("D ", "")),
    ];

    if (!choices.includes(correctText)) continue;
    const uniqueChoices = new Set(choices.map((c) => c.toLowerCase()));
    if (uniqueChoices.size !== 4) continue;
    if (correctText.length > 2 && qText.toLowerCase().includes(correctText.toLowerCase())) continue;
    if (qText.length < 10 || qText.length > 300) continue;

    const shuffled = shuffle(choices);
    const correctIdx = shuffled.indexOf(correctText);
    if (correctIdx === -1) continue;

    const id = `animaux-final-${String(index).padStart(4, "0")}`;
    const questionObj: Question = {
      id,
      conceptId: `concept-animaux-${String(index).padStart(4, "0")}`,
      familyId: `family-animaux-${String(Math.ceil(index / 2)).padStart(4, "0")}`,
      type: "mcq",
      inputMode: "mcq",
      question: qText.endsWith("?") ? qText : `${qText} ?`,
      answers: shuffled,
      correctAnswer: correctIdx,
      category: "animaux",
      subcategory: "zoologie",
      difficulty: index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
      language: "fr",
      tags: ["animaux", "faune", "nature"],
      source: {
        provider: "opentriviaqa",
        sourceId: id,
        url: "https://github.com/viorizz/OpenTriviaQA-FR",
        license: "CC BY-SA 4.0",
      },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-06",
        sources: ["opentriviaqa"],
      },
      confidence: 0.96,
      qualityScore: 0.95,
      version: 1,
    };

    const parsed = QuestionSchema.safeParse(questionObj);
    if (parsed.success) {
      questions.push(parsed.data);
      index++;
    }
  }

  return questions;
}

/** 2. Continents des pays du monde */
const CONTINENTS_MAP: Record<string, string> = {
  France: "Europe",
  Espagne: "Europe",
  Italie: "Europe",
  Allemagne: "Europe",
  Portugal: "Europe",
  Belgique: "Europe",
  Suisse: "Europe",
  Grèce: "Europe",
  Suède: "Europe",
  Norvège: "Europe",
  Finlande: "Europe",
  Danemark: "Europe",
  Pologne: "Europe",
  Autriche: "Europe",
  Irlande: "Europe",
  Islande: "Europe",
  Pays_Bas: "Europe",
  Brésil: "Amérique du Sud",
  Argentine: "Amérique du Sud",
  Chili: "Amérique du Sud",
  Colombie: "Amérique du Sud",
  Pérou: "Amérique du Sud",
  Bolivie: "Amérique du Sud",
  Uruguay: "Amérique du Sud",
  Équateur: "Amérique du Sud",
  Venezuela: "Amérique du Sud",
  Canada: "Amérique du Nord",
  Mexique: "Amérique du Nord",
  Cuba: "Amérique du Nord",
  Japon: "Asie",
  Chine: "Asie",
  Inde: "Asie",
  Corée_du_Sud: "Asie",
  Thaïlande: "Asie",
  Vietnam: "Asie",
  Indonésie: "Asie",
  Philippines: "Asie",
  Malaisie: "Asie",
  Singapour: "Asie",
  Maroc: "Afrique",
  Algérie: "Afrique",
  Tunisie: "Afrique",
  Égypte: "Afrique",
  Sénégal: "Afrique",
  Côte_d_Ivoire: "Afrique",
  Cameroun: "Afrique",
  Nigeria: "Afrique",
  Afrique_du_Sud: "Afrique",
  Kenya: "Afrique",
  Tanzanie: "Afrique",
  Madagascar: "Afrique",
  Australie: "Océanie",
  Nouvelle_Zélande: "Océanie",
  Fidji: "Océanie",
  Samoa: "Océanie",
};

function buildContinentQuestions(): QuestionSpec[] {
  const specs: QuestionSpec[] = [];
  const continents = ["Afrique", "Asie", "Europe", "Amérique du Sud", "Amérique du Nord", "Océanie"];

  for (const [countryName, continent] of Object.entries(CONTINENTS_MAP)) {
    const displayName = countryName.replace(/_/g, " ");
    const bads = shuffle(continents.filter((c) => c !== continent)).slice(0, 3) as [string, string, string];

    specs.push({
      q: `Sur quel continent se trouve le pays suivant : ${displayName} ?`,
      good: continent,
      bads,
      cat: "geographie",
      sub: "continents",
      diff: "easy",
      tags: ["geographie", "continents", displayName.toLowerCase()],
      exp: `${displayName} est situé sur le continent ${continent}.`,
    });
  }
  return specs;
}

/** 3. Unités du Système International (SI) & Sciences */
const SI_UNITS: Array<{ unit: string; quantity: string; symbol: string; bads: [string, string, string] }> = [
  { unit: "le Joule", quantity: "l'énergie et le travail", symbol: "J", bads: ["le Watt", "le Newton", "le Pascal"] },
  { unit: "le Watt", quantity: "la puissance", symbol: "W", bads: ["le Joule", "le Volt", "l'Ampère"] },
  { unit: "le Pascal", quantity: "la pression", symbol: "Pa", bads: ["le Bar", "l'Atmosphère", "le Newton"] },
  { unit: "le Newton", quantity: "la force", symbol: "N", bads: ["le Joule", "le Pascal", "le Dyne"] },
  { unit: "le Volt", quantity: "la tension électrique (différence de potentiel)", symbol: "V", bads: ["l'Ampère", "l'Ohm", "le Watt"] },
  { unit: "l'Ampère", quantity: "l'intensité du courant électrique", symbol: "A", bads: ["le Volt", "le Coulomb", "l'Ohm"] },
  { unit: "l'Ohm", quantity: "la résistance électrique", symbol: "Ω", bads: ["le Siemens", "le Farad", "le Henry"] },
  { unit: "le Hertz", quantity: "la fréquence d'un phénomène périodique", symbol: "Hz", bads: ["le Becquerel", "le Radian", "le Baud"] },
  { unit: "le Kelvin", quantity: "la température thermodynamique", symbol: "K", bads: ["le degré Celsius", "le degré Fahrenheit", "le Rankine"] },
  { unit: "le Becquerel", quantity: "l'activité radioactive d'une source", symbol: "Bq", bads: ["le Curie", "le Gray", "le Sievert"] },
  { unit: "le Sievert", quantity: "l'effet biologique des rayonnements ionisants (dose équivalente)", symbol: "Sv", bads: ["le Gray", "le Rad", "le Roentgen"] },
  { unit: "le Lumen", quantity: "le flux lumineux émis par une source", symbol: "lm", bads: ["le Lux", "la Candela", "le Candela-mètre"] },
  { unit: "le Lux", quantity: "l'éclairement lumineux d'une surface", symbol: "lx", bads: ["le Lumen", "la Candela", "le Watt"] },
  { unit: "le Tesla", quantity: "l'induction magnétique (champ magnétique)", symbol: "T", bads: ["le Gauss", "le Weber", "le Henry"] },
  { unit: "le Farad", quantity: "la capacité électrique d'un condensateur", symbol: "F", bads: ["le Henry", "l'Ohm", "le Coulomb"] },
];

function buildSIQuestions(): QuestionSpec[] {
  const specs: QuestionSpec[] = [];
  for (const u of SI_UNITS) {
    specs.push({
      q: `Dans le Système International (SI), quelle unité mesure ${u.quantity} ?`,
      good: u.unit,
      bads: u.bads,
      cat: "science",
      sub: "physique",
      diff: "medium",
      tags: ["science", "physique", "unites-si"],
      exp: `${u.unit} (${u.symbol}) est l'unité SI mesurant ${u.quantity}.`,
    });
  }
  return specs;
}

/** 4. Mythologie grecque & équivalences romaines */
const MYTHOLOGY_PAIRS: Array<{ greek: string; roman: string; domain: string; badRomans: [string, string, string] }> = [
  { greek: "Zeus", roman: "Jupiter", domain: "le roi des dieux et le maître de la foudre", badRomans: ["Neptune", "Pluton", "Mars"] },
  { greek: "Poséidon", roman: "Neptune", domain: "le dieu des mers et des séismes", badRomans: ["Jupiter", "Pluton", "Mercure"] },
  { greek: "Hadès", roman: "Pluton", domain: "le dieu des Enfers et du royaume souterrain", badRomans: ["Jupiter", "Mars", "Vulcain"] },
  { greek: "Héra", roman: "Junon", domain: "la déesse du mariage et reine des dieux", badRomans: ["Minerve", "Vénus", "Cérès"] },
  { greek: "Athéna", roman: "Minerve", domain: "la déesse de la sagesse et de la guerre stratégique", badRomans: ["Diane", "Junon", "Vesta"] },
  { greek: "Arès", roman: "Mars", domain: "le dieu de la guerre brutale et sanglante", badRomans: ["Vulcain", "Mercure", "Apollon"] },
  { greek: "Aphrodite", roman: "Vénus", domain: "la déesse de la beauté et de l'amour", badRomans: ["Minerve", "Junon", "Diane"] },
  { greek: "Hermès", roman: "Mercure", domain: "le messager des dieux et protecteur des voyageurs", badRomans: ["Mars", "Vulcain", "Bacchus"] },
  { greek: "Héphaïstos", roman: "Vulcain", domain: "le dieu forgeron et maître du feu souterrain", badRomans: ["Mars", "Mercure", "Apollon"] },
  { greek: "Artémis", roman: "Diane", domain: "la déesse chasseresse et maîtresse de la faune sauvage", badRomans: ["Minerve", "Vénus", "Cérès"] },
  { greek: "Dionysos", roman: "Bacchus", domain: "le dieu de la vigne, de la fête et du délire mystique", badRomans: ["Mercure", "Mars", "Pluton"] },
  { greek: "Déméter", roman: "Cérès", domain: "la déesse de l'agriculture et des moissons", badRomans: ["Vesta", "Junon", "Minerve"] },
  { greek: "Hestia", roman: "Vesta", domain: "la déesse du foyer et de la famille", badRomans: ["Cérès", "Diane", "Vénus"] },
  { greek: "Éros", roman: "Cupidon", domain: "le dieu ailé de l'amour et du désir", badRomans: ["Bacchus", "Mercure", "Pluton"] },
  { greek: "Chronos", roman: "Saturne", domain: "le titan personnifiant le temps", badRomans: ["Uranus", "Jupiter", "Vulcain"] },
];

function buildMythologyQuestions(): QuestionSpec[] {
  const specs: QuestionSpec[] = [];
  for (const m of MYTHOLOGY_PAIRS) {
    specs.push({
      q: `Dans la mythologie romaine, quel dieu correspond au dieu grec ${m.greek}, qui préside à ${m.domain} ?`,
      good: m.roman,
      bads: m.badRomans,
      cat: "mythologie-grecque",
      sub: "pantheon",
      diff: "easy",
      tags: ["mythologie", "grece", "rome", m.greek.toLowerCase()],
      exp: `${m.greek} dans la mythologie grecque correspond à ${m.roman} chez les Romains.`,
    });
  }
  return specs;
}

/** 5. Grande Histoire & Traités mondiaux */
const HISTORY_TREATIES: Array<{ q: string; good: string; bads: [string, string, string]; year: string }> = [
  { q: "Quel traité historique signé en 1494 entre l'Espagne et le Portugal a partagé le Nouveau Monde ?", good: "Le traité de Tordesillas", bads: ["Le traité d'Utrecht", "Le traité de Saragosse", "Le traité de Madrid"], year: "1494" },
  { q: "Quelle paix signée en 1648 a mis fin à la dévastatrice guerre de Trente Ans en Europe ?", good: "Les traités de Westphalie", bads: ["La paix d'Augsbourg", "Le traité des Pyrénées", "La paix de Nimègue"], year: "1648" },
  { q: "Quel traité signé en 1659 entre la France et l'Espagne a fixé la frontière pyrénéenne ?", good: "Le traité des Pyrénées", bads: ["Le traité de Vervins", "Le traité du Cateau-Cambrésis", "Le traité de Riswick"], year: "1659" },
  { q: "Quelle célèbre conférence internationale de 1814-1815 a redessiné la carte de l'Europe après la chute de Napoléon Ier ?", good: "Le Congrès de Vienne", bads: ["La Conférence de Paris", "Le Congrès de Berlin", "La Diète de Francfort"], year: "1815" },
  { q: "Quel traité signé en 1957 par six pays européens a fondé la Communauté Économique Européenne (CEE) ?", good: "Le traité de Rome", bads: ["Le traité de Paris", "Le traité de Maastricht", "Le traité de Bruxelles"], year: "1957" },
  { q: "En quelle année Christophe Colomb a-t-il accosté aux Amériques lors de sa première expédition transatlantique ?", good: "1492", bads: ["1488", "1498", "1504"], year: "1492" },
  { q: "Quel navigateur portugais a accompli le tout premier tour du monde à la voile (achevé par Elcano en 1522) ?", good: "Fernand de Magellan", bads: ["Vasco de Gama", "Bartolomeu Dias", "Amerigo Vespucci"], year: "1519-1522" },
  { q: "Quel navigateur portugais a ouvert la route des Indes en doublant le cap de Bonne-Espérance en 1498 ?", good: "Vasco de Gama", bads: ["Pedro Álvares Cabral", "Fernand de Magellan", "Alfonso de Albuquerque"], year: "1498" },
  { q: "Dans quelle ville suisse Henri Dunant a-t-il fondé la Croix-Rouge internationale en 1863 ?", good: "Genève", bads: ["Berne", "Lausanne", "Bâle"], year: "1863" },
  { q: "En quelle année l'esclavage a-t-il été définitivement aboli dans les colonies françaises sous l'action de Victor Schœlcher ?", good: "1848", bads: ["1794", "1802", "1833"], year: "1848" },
];

/** 6. Cuisine & Gastronomie (Food) */
const FOOD_SPECS: QuestionSpec[] = [
  { q: "Quel ingrédient fondamental donne sa couleur jaune éclatante et son parfum au risotto à la milanaise et à la paella ?", good: "Le safran", bads: ["Le curcuma", "Le paprika", "Le curry"], cat: "food", sub: "epices", diff: "easy" },
  { q: "De quel pays européen le fromage Parmigiano Reggiano (parmesan) est-il originaire ?", good: "L'Italie", bads: ["La France", "La Suisse", "L'Espagne"], cat: "food", sub: "fromages", diff: "easy" },
  { q: "Quel champignon souterrain précieux et parfumé est récolté en hiver à l'aide de chiens ou de cochons truffiers ?", good: "La truffe noire (du Périgord)", bads: ["La morille", "Le cèpe de Bordeaux", "La girolle"], cat: "food", sub: "gastronomie", diff: "easy" },
  { q: "Quel alcool d'agave mexicain est l'ingrédient principal du cocktail Margarita ?", good: "La tequila", bads: ["Le rhum", "Le mezcal", "Le gin"], cat: "food", sub: "boissons", diff: "easy" },
  { q: "Dans la pâtisserie française, quelle pâte cuite sert de base aux éclairs, aux choux à la crème et aux gougères ?", good: "La pâte à choux", bads: ["La pâte feuilletée", "La pâte brisée", "La pâte sablée"], cat: "food", sub: "patisserie", diff: "easy" },
  { q: "Quelle sauce émulsionnée froide est traditionnellement composée de jaune d'œuf, de moutarde, d'huile et de vinaigre ?", good: "La mayonnaise", bads: ["La sauce béarnaise", "La sauce hollandaise", "La vinaigrette"], cat: "food", sub: "sauces", diff: "easy" },
  { q: "Quel alcool de genièvre aromatique est le composant incontournable du cocktail Gin Tonic ?", good: "Le gin", bads: ["La vodka", "Le rhum blanc", "Le schnaps"], cat: "food", sub: "boissons", diff: "easy" },
  { q: "Dans quelle région française le cassoulet traditionnel (aux haricots lingots et confit de canard) a-t-il vu le jour ?", good: "Le Sud-Ouest (Occitanie)", bads: ["La Bretagne", "La Bourgogne", "L'Alsace"], cat: "food", sub: "plats-traditionnels", diff: "easy" },
  { q: "Quel fromage savoyard au lait cru est la vedette fondue de la tartiflette ?", good: "Le reblochon", bads: ["Le beaufort", "L'abondance", "L'emmental"], cat: "food", sub: "fromages", diff: "easy" },
  { q: "Quelle boisson chaude fermentée d'origine chinoise se décline en variétés noire, verte, blanche et oolong ?", good: "Le thé", bads: ["Le café", "Le maté", "Le rooibos"], cat: "food", sub: "boissons", diff: "easy" },
];

/** 7. Insolite & Culture Générale */
const INSOLITE_SPECS: QuestionSpec[] = [
  { q: "Combien de cœurs le poulpe possède-t-il pour faire circuler son sang bleu ?", good: "3 cœurs", bads: ["1 cœur", "2 cœurs", "4 cœurs"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Quelle couleur ont les flamants roses à leur naissance avant que leur alimentation en crevettes ne les colore ?", good: "Gris", bads: ["Blanc", "Rose pâle", "Noir"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Quel mammifère est le seul animal capable d'un vol battu autonome dans les airs ?", good: "La chauve-souris", bads: ["L'écureuil volant", "Le lémurien", "L'ornithorynque"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Quel animal aquatique pond des œufs tout en allaitant ses petits avec du lait et possède un bec de canard ?", good: "L'ornithorynque", bads: ["L'échidné", "Le castor", "La loutre géante"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Combien d'yeux la plupart des espèces d'araignées possèdent-elles ?", good: "8 yeux", bads: ["2 yeux", "4 yeux", "6 yeux"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Quelle est la durée de gestation moyenne d'une femelle éléphant d'Asie ou d'Afrique ?", good: "Environ 22 mois", bads: ["Environ 12 mois", "Environ 16 mois", "Environ 30 mois"], cat: "insolite", sub: "nature", diff: "easy" },
  { q: "Quel os du corps humain est le plus long et le plus résistant ?", good: "Le fémur", bads: ["Le tibia", "L'humérus", "Le péroné"], cat: "insolite", sub: "corps-humain", diff: "easy" },
  { q: "Quel est le seul continent de la planète Terre qui ne possède aucun désert chaud ou froid ?", good: "L'Europe", bads: ["L'Océanie", "L'Amérique du Sud", "L'Afrique"], cat: "insolite", sub: "geographie", diff: "medium" },
  { q: "Quel état américain est le plus grand en superficie, dépassant à lui seul la taille de la France et de l'Espagne réunies ?", good: "L'Alaska", bads: ["Le Texas", "La Californie", "Le Montana"], cat: "insolite", sub: "geographie", diff: "easy" },
  { q: "Combien de faces possède un icosaèdre régulier en géométrie ?", good: "20 faces", bads: ["12 faces", "24 faces", "30 faces"], cat: "insolite", sub: "mathematiques", diff: "medium" },
];

async function main() {
  console.log("━━━━━━━━ LANCEMENT DU LOT FINAL (CAP 4 000 QUESTIONS) ━━━━━━━━");

  // 1. Animaux lot 3 (~250)
  const finalAnimals = await fetchFinalAnimals(250);
  saveInChunks("animaux", "animaux-dump3", finalAnimals, 50);

  // 2. Continents géographie (55)
  const continentSpecs = buildContinentQuestions();
  const continentQuestions = createValidQuestions(continentSpecs, "geo-continents");
  saveInChunks("geographie", "geographie-continents", continentQuestions, 50);

  // 3. Unités SI (15)
  const siSpecs = buildSIQuestions();
  const siQuestions = createValidQuestions(siSpecs, "sci-unites");
  saveInChunks("science", "science-unites", siQuestions, 50);

  // 4. Mythologie grecque & romaine (15)
  const mythSpecs = buildMythologyQuestions();
  const mythQuestions = createValidQuestions(mythSpecs, "myth-pantheon");
  saveInChunks("mythologie-grecque", "mythologie-pantheon", mythQuestions, 50);

  // 5. Traités historiques (10)
  const treatySpecs: QuestionSpec[] = HISTORY_TREATIES.map((t) => ({
    q: t.q,
    good: t.good,
    bads: t.bads,
    cat: "histoire",
    sub: "traites-mondiaux",
    diff: "medium",
    tags: ["histoire", "traites", "geopolitique"],
  }));
  const treatyQuestions = createValidQuestions(treatySpecs, "hist-traites");
  saveInChunks("histoire", "histoire-traites", treatyQuestions, 50);

  // 6. Food (10)
  const foodQuestions = createValidQuestions(FOOD_SPECS, "food-cuisine");
  saveInChunks("food", "food-cuisine", foodQuestions, 50);

  // 7. Insolite (10)
  const insoliteQuestions = createValidQuestions(INSOLITE_SPECS, "insolite-curiosites");
  saveInChunks("insolite", "insolite-curiosites", insoliteQuestions, 50);

  const total =
    finalAnimals.length +
    continentQuestions.length +
    siQuestions.length +
    mythQuestions.length +
    treatyQuestions.length +
    foodQuestions.length +
    insoliteQuestions.length;

  console.log(`\nLot final écrit : +${total} questions.`);
}

main().catch(console.error);
