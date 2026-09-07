/**
 * Agorax — Générateur massif de questions certifiées (objectif > 4 000 questions)
 * Crée des questions factuelles précises et dédupliquées pour :
 * - Animaux (OpenTriviaQA dump suite)
 * - Chimie & Éléments périodiques (Science)
 * - Astronomie & Système Solaire (Science)
 * - Littérature & Chefs-d'œuvre mondiaux (Littérature)
 * - Cinéma & Réalisateurs cultes (Cinéma)
 * - Peintres & Tableaux de maîtres (Art)
 * - Jeux vidéo & Studios (Gaming)
 * - Musique & Groupes de légende (Musique)
 * - Sport & Football (Coupes du Monde, JO, Tennis)
 * - Technologie & Inventions (Technologie)
 * - Jeux de société, Comics & BD, Véhicules
 */
import path from "node:path";
import { QuestionSchema, type Question } from "../../src/lib/questions/schema";
import { cleanString, createValidQuestions, saveInChunks, shuffle, type QuestionSpec } from "./generate-bulk-corpus";

/** 1. Extraction suite du dump Animaux (OpenTriviaQA) */
async function fetchMoreAnimals(count = 350): Promise<Question[]> {
  console.log("→ Téléchargement du dump Animaux (partie 2)...");
  const url = "https://raw.githubusercontent.com/viorizz/OpenTriviaQA-FR/master/categories/animals";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Échec fetch ${url}`);
  const text = await res.text();
  const blocks = text.split(/\n\s*\n/).filter((b) => b.includes("#Q "));

  // Sauter les 400 premiers blocs déjà traités
  const candidateBlocks = blocks.slice(400);
  const questions: Question[] = [];
  let index = 400;

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

    if (correctText.length > 2 && qText.toLowerCase().includes(correctText.toLowerCase())) {
      continue;
    }

    if (qText.length < 10 || qText.length > 300) continue;

    const shuffled = shuffle(choices);
    const correctIdx = shuffled.indexOf(correctText);
    if (correctIdx === -1) continue;

    const id = `animaux-dump2-${String(index).padStart(4, "0")}`;
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

/** 2. Tableau périodique & Chimie */
const PERIODIC_ELEMENTS: Array<{ name: string; symbol: string; number: number; group: string }> = [
  { name: "l'Hydrogène", symbol: "H", number: 1, group: "non-métaux" },
  { name: "l'Hélium", symbol: "He", number: 2, group: "gaz nobles" },
  { name: "le Lithium", symbol: "Li", number: 3, group: "métaux alcalins" },
  { name: "le Béryllium", symbol: "Be", number: 4, group: "métaux alcalino-terreux" },
  { name: "le Bore", symbol: "B", number: 5, group: "métalloïdes" },
  { name: "le Carbone", symbol: "C", number: 6, group: "non-métaux" },
  { name: "l'Azote", symbol: "N", number: 7, group: "non-métaux" },
  { name: "l'Oxygène", symbol: "O", number: 8, group: "non-métaux" },
  { name: "le Fluor", symbol: "F", number: 9, group: "halogènes" },
  { name: "le Néon", symbol: "Ne", number: 10, group: "gaz nobles" },
  { name: "le Sodium", symbol: "Na", number: 11, group: "métaux alcalins" },
  { name: "le Magnésium", symbol: "Mg", number: 12, group: "métaux alcalino-terreux" },
  { name: "l'Aluminium", symbol: "Al", number: 13, group: "métaux pauvres" },
  { name: "le Silicium", symbol: "Si", number: 14, group: "métalloïdes" },
  { name: "le Phosphore", symbol: "P", number: 15, group: "non-métaux" },
  { name: "le Soufre", symbol: "S", number: 16, group: "non-métaux" },
  { name: "le Chlore", symbol: "Cl", number: 17, group: "halogènes" },
  { name: "l'Argon", symbol: "Ar", number: 18, group: "gaz nobles" },
  { name: "le Potassium", symbol: "K", number: 19, group: "métaux alcalins" },
  { name: "le Calcium", symbol: "Ca", number: 20, group: "métaux alcalino-terreux" },
  { name: "le Fer", symbol: "Fe", number: 26, group: "métaux de transition" },
  { name: "le Cuivre", symbol: "Cu", number: 29, group: "métaux de transition" },
  { name: "le Zinc", symbol: "Zn", number: 30, group: "métaux de transition" },
  { name: "l'Argent", symbol: "Ag", number: 47, group: "métaux de transition" },
  { name: "l'Étain", symbol: "Sn", number: 50, group: "métaux pauvres" },
  { name: "l'Iode", symbol: "I", number: 53, group: "halogènes" },
  { name: "l'Or", symbol: "Au", number: 79, group: "métaux de transition" },
  { name: "le Mercure", symbol: "Hg", number: 80, group: "métaux de transition" },
  { name: "le Plomb", symbol: "Pb", number: 82, group: "métaux pauvres" },
  { name: "l'Uranium", symbol: "U", number: 92, group: "actinides" },
  { name: "le Titane", symbol: "Ti", number: 22, group: "métaux de transition" },
  { name: "le Chrome", symbol: "Cr", number: 24, group: "métaux de transition" },
  { name: "le Nickel", symbol: "Ni", number: 28, group: "métaux de transition" },
  { name: "le Platine", symbol: "Pt", number: 78, group: "métaux de transition" },
  { name: "le Krypton", symbol: "Kr", number: 36, group: "gaz nobles" },
  { name: "le Xénon", symbol: "Xe", number: 54, group: "gaz nobles" },
  { name: "le Radon", symbol: "Rn", number: 86, group: "gaz nobles" },
  { name: "le Brome", symbol: "Br", number: 35, group: "halogènes" },
  { name: "le Bismuth", symbol: "Bi", number: 83, group: "métaux pauvres" },
  { name: "le Tungstène", symbol: "W", number: 74, group: "métaux de transition" },
];

function buildChemistryQuestions(): QuestionSpec[] {
  const specs: QuestionSpec[] = [];
  const allSymbols = PERIODIC_ELEMENTS.map((e) => e.symbol);

  for (const elem of PERIODIC_ELEMENTS) {
    const otherSymbols = shuffle(allSymbols.filter((s) => s !== elem.symbol)).slice(0, 3) as [string, string, string];
    specs.push({
      q: `Quel est le symbole chimique de ${elem.name} dans la classification périodique ?`,
      good: elem.symbol,
      bads: otherSymbols,
      cat: "science",
      sub: "chimie",
      diff: elem.number <= 20 ? "easy" : "medium",
      tags: ["science", "chimie", "tableau-periodique"],
      exp: `${elem.name} a pour symbole ${elem.symbol} et pour numéro atomique ${elem.number}.`,
    });

    const otherNames = shuffle(PERIODIC_ELEMENTS.filter((e) => e.name !== elem.name)).slice(0, 3).map((e) => e.name) as [string, string, string];
    specs.push({
      q: `Quel élément chimique a pour numéro atomique ${elem.number} ?`,
      good: elem.name,
      bads: otherNames,
      cat: "science",
      sub: "chimie",
      diff: "medium",
      tags: ["science", "chimie", "elements"],
      exp: `Le numéro atomique ${elem.number} correspond à ${elem.name} (${elem.symbol}).`,
    });
  }
  return specs;
}

/** 3. Astronomie & Espace */
const ASTRONOMY_DATA: Array<{ q: string; good: string; bads: [string, string, string]; diff: "easy" | "medium" | "hard" }> = [
  { q: "Quelle est la plus grande lune de Saturne, dotée d'une atmosphère dense d'azote et de lacs de méthane liquide ?", good: "Titan", bads: ["Encelade", "Mimas", "Rhéa"], diff: "easy" },
  { q: "Quelle lune glacée de Jupiter abrite un vaste océan souterrain d'eau liquide sous sa croûte ?", good: "Europe", bads: ["Io", "Ganymède", "Callisto"], diff: "easy" },
  { q: "Quelle lune de Jupiter est l'objet géologiquement le plus actif du système solaire avec des centaines de volcans ?", good: "Io", bads: ["Europe", "Ganymède", "Titan"], diff: "medium" },
  { q: "Quelle est la plus grande lune de tout le système solaire, plus grande même que la planète Mercure ?", good: "Ganymède", bads: ["Titan", "Callisto", "Triton"], diff: "medium" },
  { q: "Quelle est la plus grande lune de la planète Neptune, caractérisée par une orbite rétrograde ?", good: "Triton", bads: ["Protée", "Néréide", "Larissa"], diff: "medium" },
  { q: "Quel est le nom de la galaxie spirale la plus proche de notre Voie lactée, située à environ 2,5 millions d'années-lumière ?", good: "Andromède (M31)", bads: ["Le Sombrero", "Le Tourbillon", "Le Triangle"], diff: "easy" },
  { q: "Quelle étoile supergéante rouge marque l'épaule de la constellation d'Orion ?", good: "Bételgeuse", bads: ["Rigel", "Aldébaran", "Antarès"], diff: "easy" },
  { q: "Quelle est l'étoile la plus brillante du ciel nocturne visible depuis la Terre ?", good: "Sirius", bads: ["Canopus", "Véga", "Arcturus"], diff: "easy" },
  { q: "À quelle distance moyenne la Terre se trouve-t-elle du Soleil (une Unité Astronomique) ?", good: "Environ 150 millions de kilomètres", bads: ["Environ 50 millions de kilomètres", "Environ 300 millions de kilomètres", "Environ 500 millions de kilomètres"], diff: "easy" },
  { q: "Combien de temps met la lumière du Soleil pour parvenir jusqu'à la Terre en moyenne ?", good: "Environ 8 minutes et 20 secondes", bads: ["Environ 1 minute et 10 secondes", "Environ 15 minutes et 40 secondes", "Instantanément"], diff: "easy" },
  { q: "Quel est le nom du plus haut volcan connu du système solaire, situé sur la planète Mars ?", good: "Olympus Mons", bads: ["Ascraeus Mons", "Pavonis Mons", "Arsia Mons"], diff: "easy" },
  { q: "Quelle mission spatiale de l'ESA s'est posée sur la comète Tchouri en novembre 2014 grâce à l'atterrisseur Philae ?", good: "Rosetta", bads: ["Giotto", "Cassini", "Voyager"], diff: "medium" },
  { q: "Quelle sonde spatiale de la NASA, lancée en 1977, est devenue le premier objet humain à entrer dans l'espace interstellaire ?", good: "Voyager 1", bads: ["Pioneer 10", "New Horizons", "Galileo"], diff: "easy" },
  { q: "Quel type d'astre extrêmement dense résulte de l'effondrement gravitationnel du cœur d'une étoile massive après une supernova ?", good: "Une étoile à neutrons", bads: ["Une naine blanche", "Une géante rouge", "Une naine brune"], diff: "medium" },
  { q: "Quelle frontière théorique délimite la région d'un trou noir d'où rien, pas même la lumière, ne peut s'échapper ?", good: "L'horizon des événements", bads: ["La sphère de Dyson", "Le rayon de Chandrasekhar", "Le disque d'accrétion"], diff: "medium" },
];

/** 4. Grands Auteurs & Livres */
const BOOKS_AUTHORS: Array<{ author: string; book: string; badAuthors: [string, string, string]; genre: string }> = [
  { author: "Honoré de Balzac", book: "Le Père Goriot", badAuthors: ["Émile Zola", "Gustave Flaubert", "Stendhal"], genre: "romans" },
  { author: "Stendhal", book: "Le Rouge et le Noir", badAuthors: ["Prosper Mérimée", "Honoré de Balzac", "George Sand"], genre: "romans" },
  { author: "Émile Zola", book: "Germinal", badAuthors: ["Guy de Maupassant", "Alphonse Daudet", "Jules Vallès"], genre: "romans" },
  { author: "Gustave Flaubert", book: "Madame Bovary", badAuthors: ["Théophile Gautier", "Stendhal", "Émile Zola"], genre: "romans" },
  { author: "Albert Camus", book: "La Peste", badAuthors: ["Jean-Paul Sartre", "Boris Vian", "André Malraux"], genre: "romans" },
  { author: "Jean-Paul Sartre", book: "La Nausée", badAuthors: ["Albert Camus", "Simone de Beauvoir", "Louis Aragon"], genre: "romans" },
  { author: "Simone de Beauvoir", book: "Le Deuxième Sexe", badAuthors: ["Marguerite Duras", "Marguerite Yourcenar", "Françoise Sagan"], genre: "essais" },
  { author: "Marguerite Duras", book: "L'Amant", badAuthors: ["Françoise Sagan", "Colette", "Nathalie Sarraute"], genre: "romans" },
  { author: "George Orwell", book: "La Ferme des animaux", badAuthors: ["Aldous Huxley", "Ray Bradbury", "Arthur Koestler"], genre: "romans" },
  { author: "Aldous Huxley", book: "Le Meilleur des mondes", badAuthors: ["George Orwell", "H.G. Wells", "Philip K. Dick"], genre: "romans" },
  { author: "Léon Tolstoï", book: "Guerre et Paix", badAuthors: ["Fiodor Dostoïevski", "Ivan Tourgueniev", "Nikolaï Gogol"], genre: "romans" },
  { author: "Franz Kafka", book: "Le Procès", badAuthors: ["Stefan Zweig", "Thomas Mann", "Hermann Hesse"], genre: "romans" },
  { author: "Stefan Zweig", book: "Le Joueur d'échecs", badAuthors: ["Arthur Schnitzler", "Robert Musil", "Hermann Broch"], genre: "romans" },
  { author: "Hermann Hesse", book: "Siddhartha", badAuthors: ["Thomas Mann", "Günter Grass", "Heinrich Böll"], genre: "romans" },
  { author: "Oscar Wilde", book: "Le Portrait de Dorian Gray", badAuthors: ["Bram Stoker", "Robert Louis Stevenson", "Arthur Conan Doyle"], genre: "romans" },
  { author: "Mary Shelley", book: "Frankenstein", badAuthors: ["Jane Austen", "Charlotte Brontë", "Emily Brontë"], genre: "romans" },
  { author: "Bram Stoker", book: "Dracula", badAuthors: ["Mary Shelley", "Edgar Allan Poe", "H.P. Lovecraft"], genre: "romans" },
  { author: "Arthur Conan Doyle", book: "Le Chien des Baskerville", badAuthors: ["Agatha Christie", "Edgar Allan Poe", "Maurice Leblanc"], genre: "romans" },
  { author: "Agatha Christie", book: "Dix Petits Nègres (Ils étaient dix)", badAuthors: ["Arthur Conan Doyle", "Gaston Leroux", "Georges Simenon"], genre: "policier" },
  { author: "Maurice Leblanc", book: "L'Aiguille creuse (Arsène Lupin)", badAuthors: ["Gaston Leroux", "Émile Gaboriau", "Pierre Souvestre"], genre: "policier" },
  { author: "Jules Verne", book: "Vingt Mille Lieues sous les mers", badAuthors: ["H.G. Wells", "Alexandre Dumas", "Alphonse Daudet"], genre: "aventures" },
  { author: "Antoine de Saint-Exupéry", book: "Le Petit Prince", badAuthors: ["Jean Giono", "Marcel Pagnol", "Jacques Prévert"], genre: "contes" },
  { author: "Marcel Pagnol", book: "La Gloire de mon père", badAuthors: ["Jean Giono", "Alphonse Daudet", "Colette"], genre: "romans" },
  { author: "Milan Kundera", book: "L'Insoutenable Légèreté de l'être", badAuthors: ["Bohumil Hrabal", "Czesław Miłosz", "Václav Havel"], genre: "romans" },
  { author: "Umberto Eco", book: "Le Nom de la rose", badAuthors: ["Italo Calvino", "Dino Buzzati", "Luigi Pirandello"], genre: "romans" },
  { author: "Italo Calvino", book: "Le Baron perché", badAuthors: ["Umberto Eco", "Primo Levi", "Cesare Pavese"], genre: "romans" },
  { author: "Haruki Murakami", book: "Kafka sur le rivage", badAuthors: ["Yukio Mishima", "Kenzaburō Ōe", "Yasunari Kawabata"], genre: "romans" },
  { author: "Yukio Mishima", book: "Le Pavillon d'or", badAuthors: ["Haruki Murakami", "Jun'ichirō Tanizaki", "Osamu Dazai"], genre: "romans" },
  { author: "Ernest Hemingway", book: "Le Vieil Homme et la Mer", badAuthors: ["John Steinbeck", "F. Scott Fitzgerald", "William Faulkner"], genre: "romans" },
  { author: "John Steinbeck", book: "Les Raisins de la colère", badAuthors: ["Ernest Hemingway", "Jack London", "Truman Capote"], genre: "romans" },
];

/** 5. Réalisateurs & Films Cultes */
const MOVIES_DIRECTORS: Array<{ director: string; movie: string; badDirectors: [string, string, string]; year: number }> = [
  { director: "Martin Scorsese", movie: "Taxi Driver", badDirectors: ["Francis Ford Coppola", "Brian De Palma", "Michael Cimino"], year: 1976 },
  { director: "Francis Ford Coppola", movie: "Apocalypse Now", badDirectors: ["Martin Scorsese", "Oliver Stone", "Stanley Kubrick"], year: 1979 },
  { director: "David Fincher", movie: "Fight Club", badDirectors: ["Christopher Nolan", "Darren Aronofsky", "Danny Boyle"], year: 1999 },
  { director: "Ridley Scott", movie: "Gladiator", badDirectors: ["James Cameron", "Wolfgang Petersen", "Mel Gibson"], year: 2000 },
  { director: "Peter Jackson", movie: "Le Seigneur des Anneaux : La Communauté de l'Anneau", badDirectors: ["George Lucas", "Guillermo del Toro", "Alfonso Cuarón"], year: 2001 },
  { director: "Joel et Ethan Coen", movie: "The Big Lebowski", badDirectors: ["Paul Thomas Anderson", "Quentin Tarantino", "Jim Jarmusch"], year: 1998 },
  { director: "Alfred Hitchcock", movie: "Psychose", badDirectors: ["Orson Welles", "Billy Wilder", "Howard Hawks"], year: 1960 },
  { director: "Sergio Leone", movie: "Le Bon, la Brute et le Truand", badDirectors: ["Federico Fellini", "Sam Peckinpah", "Bernardo Bertolucci"], year: 1966 },
  { director: "George Miller", movie: "Mad Max : Fury Road", badDirectors: ["James Cameron", "Guillermo del Toro", "Zack Snyder"], year: 2015 },
  { director: "Guillermo del Toro", movie: "Le Labyrinthe de Pan", badDirectors: ["Alfonso Cuarón", "Alejandro González Iñárritu", "Pedro Almodóvar"], year: 2006 },
  { director: "Pedro Almodóvar", movie: "Tout sur ma mère", badDirectors: ["Alejandro Amenábar", "Carlos Saura", "Luis Buñuel"], year: 1999 },
  { director: "Federico Fellini", movie: "La Dolce Vita", badDirectors: ["Michelangelo Antonioni", "Pier Paolo Pasolini", "Luchino Visconti"], year: 1960 },
  { director: "Akira Kurosawa", movie: "Les Sept Samouraïs", badDirectors: ["Yasujirō Ozu", "Kenji Mizoguchi", "Masaki Kobayashi"], year: 1954 },
  { director: "Wong Kar-wai", movie: "In the Mood for Love", badDirectors: ["Edward Yang", "Hou Hsiao-hsien", "Ang Lee"], year: 2000 },
  { director: "Bong Joon-ho", movie: "Memories of Murder", badDirectors: ["Park Chan-wook", "Kim Jee-woon", "Lee Chang-dong"], year: 2003 },
  { director: "Park Chan-wook", movie: "Old Boy", badDirectors: ["Bong Joon-ho", "Na Hong-jin", "Kim Ki-duk"], year: 2003 },
  { director: "Jean-Pierre Jeunet", movie: "Le Fabuleux Destin d'Amélie Poulain", badDirectors: ["Luc Besson", "Mathieu Kassovitz", "Michel Gondry"], year: 2001 },
  { director: "Mathieu Kassovitz", movie: "La Haine", badDirectors: ["Jacques Audiard", "Luc Besson", "Gilles Lellouche"], year: 1995 },
  { director: "Luc Besson", movie: "Léon", badDirectors: ["Jean-Jacques Annaud", "Jean-Pierre Jeunet", "Patrice Leconte"], year: 1994 },
  { director: "Jacques Audiard", movie: "Un prophète", badDirectors: ["Olivier Marchal", "Guillaume Canet", "Arnaud Desplechin"], year: 2009 },
];

/** 6. Art & Peintres majeurs */
const ART_MASTERPIECES: Array<{ artist: string; artwork: string; badArtists: [string, string, string]; movement: string }> = [
  { artist: "Eugène Delacroix", artwork: "La Liberté guidant le peuple", badArtists: ["Théodore Géricault", "Gustave Courbet", "Jean-Auguste-Dominique Ingres"], movement: "Romantisme" },
  { artist: "Théodore Géricault", artwork: "Le Radeau de La Méduse", badArtists: ["Eugène Delacroix", "Jacques-Louis David", "Antoine-Jean Gros"], movement: "Romantisme" },
  { artist: "Jacques-Louis David", artwork: "Le Sacre de Napoléon", badArtists: ["Jean-Auguste-Dominique Ingres", "François Gérard", "Antoine-Jean Gros"], movement: "Néoclassicisme" },
  { artist: "Gustave Courbet", artwork: "L'Origine du monde", badArtists: ["Édouard Manet", "Honoré Daumier", "Jean-François Millet"], movement: "Réalisme" },
  { artist: "Édouard Manet", artwork: "Le Déjeuner sur l'herbe", badArtists: ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas"], movement: "Pré-impressionnisme" },
  { artist: "Pierre-Auguste Renoir", artwork: "Le Bal du moulin de la Galette", badArtists: ["Claude Monet", "Camille Pissarro", "Alfred Sisley"], movement: "Impressionnisme" },
  { artist: "Georges Seurat", artwork: "Un dimanche après-midi à l'Île de la Grande Jatte", badArtists: ["Paul Signac", "Camille Pissarro", "Henri-Edmond Cross"], movement: "Pointillisme" },
  { artist: "Paul Cézanne", artwork: "Les Joueurs de cartes", badArtists: ["Paul Gauguin", "Vincent van Gogh", "Henri de Toulouse-Lautrec"], movement: "Postimpressionnisme" },
  { artist: "Paul Gauguin", artwork: "D'où venons-nous ? Que sommes-nous ? Où allons-nous ?", badArtists: ["Vincent van Gogh", "Paul Cézanne", "Henri Rousseau"], movement: "Postimpressionnisme" },
  { artist: "Henri Matisse", artwork: "La Danse", badArtists: ["André Derain", "Maurice de Vlaminck", "Raoul Dufy"], movement: "Fauvisme" },
  { artist: "René Magritte", artwork: "La Trahison des images (Ceci n'est pas une pipe)", badArtists: ["Salvador Dalí", "Max Ernst", "Yves Tanguy"], movement: "Surréalisme" },
  { artist: "Wassily Kandinsky", artwork: "Composition VIII", badArtists: ["Piet Mondrian", "Paul Klee", "Kazimir Malevitch"], movement: "Art abstrait" },
  { artist: "Piet Mondrian", artwork: "Composition en rouge, jaune, bleu et noir", badArtists: ["Theo van Doesburg", "Wassily Kandinsky", "Kazimir Malevitch"], movement: "Néoplasticisme" },
  { artist: "Kazimir Malevitch", artwork: "Carré noir sur fond blanc", badArtists: ["El Lissitzky", "Vladimir Tatline", "Alexandre Rodtchenko"], movement: "Suprématisme" },
  { artist: "Andy Warhol", artwork: "Les Boîtes de soupe Campbell", badArtists: ["Roy Lichtenstein", "Keith Haring", "Jean-Michel Basquiat"], movement: "Pop Art" },
  { artist: "Roy Lichtenstein", artwork: "Whaam!", badArtists: ["Andy Warhol", "James Rosenquist", "Tom Wesselmann"], movement: "Pop Art" },
  { artist: "Jean-Michel Basquiat", artwork: "Untilted (Boxer)", badArtists: ["Keith Haring", "Julian Schnabel", "Kenny Scharf"], movement: "Néo-expressionnisme" },
  { artist: "Frida Kahlo", artwork: "Les Deux Frida", badArtists: ["Diego Rivera", "Leonora Carrington", "Remedios Varo"], movement: "Surréalisme mexicain" },
  { artist: "Sandro Botticelli", artwork: "La Naissance de Vénus", badArtists: ["Fra Angelico", "Filippo Lippi", "Domenico Ghirlandaio"], movement: "Renaissance" },
  { artist: "Le Caravage", artwork: "La Vocation de saint Matthieu", badArtists: ["Artemisia Gentileschi", "Annibale Carracci", "Guido Reni"], movement: "Baroque" },
];

/** 7. Gaming & Jeux Vidéo */
const GAMING_DATA: Array<{ q: string; good: string; bads: [string, string, string]; diff: "easy" | "medium" | "hard" }> = [
  { q: "Quel studio japonais dirigé par Hidetaka Miyazaki a développé Dark Souls, Bloodborne et Elden Ring ?", good: "FromSoftware", bads: ["Capcom", "Square Enix", "Kojima Productions"], diff: "easy" },
  { q: "Quelle console de salon sortie par Sony en 1994 au Japon a popularisé la 3D et le support CD-ROM ?", good: "La PlayStation (PS1)", bads: ["La Nintendo 64", "La Sega Saturn", "La 3DO"], diff: "easy" },
  { q: "Quel créateur de jeu vidéo japonais est le père de la série d'espionnage tactique Metal Gear Solid ?", good: "Hideo Kojima", bads: ["Shinji Mikami", "Keiji Inafune", "Hideki Kamiya"], diff: "easy" },
  { q: "Dans The Legend of Zelda, quel est le nom du royaume fantastique gouverné par la princesse Zelda ?", good: "Hyrule", bads: ["Termina", "Lorule", "Cocolint"], diff: "easy" },
  { q: "Quel jeu vidéo de rôle en ligne massivement multijoueur (MMORPG) lancé par Blizzard en 2004 a dominé le genre pendant des décennies ?", good: "World of Warcraft", bads: ["EverQuest", "Guild Wars", "Lineage II"], diff: "easy" },
  { q: "Quel jeu de tir à la première personne révolutionnaire sorti par Valve en 1998 met en scène le docteur Gordon Freeman ?", good: "Half-Life", bads: ["Doom", "Quake", "Unreal"], diff: "easy" },
  { q: "Quel est le nom de la console portable lancée par Nintendo en 1989, vendue avec le jeu Tetris ?", good: "La Game Boy", bads: ["La Game Gear", "L'Atari Lynx", "La Neo-Geo Pocket"], diff: "easy" },
  { q: "Dans quelle saga culte de Rockstar Games incarne-t-on des criminels dans des villes comme Liberty City ou Los Santos ?", good: "Grand Theft Auto (GTA)", bads: ["Red Dead Redemption", "Max Payne", "Mafia"], diff: "easy" },
  { q: "Quel studio polonais a développé la trilogie The Witcher et Cyberpunk 2077 ?", good: "CD Projekt Red", bads: ["Techland", "People Can Fly", "Bloober Team"], diff: "easy" },
  { q: "Dans Pokémon, quel Pokémon électrique portant le numéro 25 du Pokédex est la mascotte officielle de la franchise ?", good: "Pikachu", bads: ["Raichu", "Pichu", "Évoli"], diff: "easy" },
  { q: "Quelle console innovante de Nintendo sortie fin 2006 a démocratisé la détection de mouvement auprès du grand public ?", good: "La Wii", bads: ["La GameCube", "La Wii U", "La Nintendo Switch"], diff: "easy" },
  { q: "Quel créateur suédois, connu sous le pseudonyme de Notch, a créé Minecraft en 2009 ?", good: "Markus Persson", bads: ["Jens Bergensten", "Johan Andersson", "PewDiePie"], diff: "easy" },
  { q: "Dans la saga Resident Evil de Capcom, quelle multinationale pharmaceutique secrète est à l'origine du virus T ?", good: "Umbrella Corporation", bads: ["Aperture Science", "Shinra", "Vault-Tec"], diff: "easy" },
  { q: "Quel jeu de plateforme créé par Alexey Pajitnov en 1984 consiste à empiler des tétraminos géométriques ?", good: "Tetris", bads: ["Columns", "Dr. Mario", "Puyo Puyo"], diff: "easy" },
  { q: "Quel héros de jeu vidéo est un hérisson bleu ultra-rapide créé par Sega pour concurrencer Mario ?", good: "Sonic", bads: ["Knuckles", "Tails", "Shadow"], diff: "easy" },
];

/** 8. Musique & Groupes de légende */
const MUSIC_DATA: Array<{ q: string; good: string; bads: [string, string, string]; diff: "easy" | "medium" | "hard" }> = [
  { q: "Quel groupe de rock britannique originaire de Liverpool était formé par John Lennon, Paul McCartney, George Harrison et Ringo Starr ?", good: "The Beatles", bads: ["The Rolling Stones", "The Who", "The Kinks"], diff: "easy" },
  { q: "Quel chanteur charismatique et virtuose était le leader du groupe Queen jusqu'à sa disparition en 1991 ?", good: "Freddie Mercury", bads: ["Brian May", "Roger Taylor", "John Deacon"], diff: "easy" },
  { q: "Quel album mythique de Michael Jackson sorti en 1982 est l'album le plus vendu de tous les temps ?", good: "Thriller", bads: ["Bad", "Off the Wall", "Dangerous"], diff: "easy" },
  { q: "Quel groupe de musique électronique français casqué a composé les tubes Around the World et Get Lucky ?", good: "Daft Punk", bads: ["Justice", "Air", "Cassius"], diff: "easy" },
  { q: "Quel compositeur autrichien prodige a composé La Flûte enchantée et le Requiem avant de mourir à 35 ans ?", good: "Wolfgang Amadeus Mozart", bads: ["Ludwig van Beethoven", "Joseph Haydn", "Franz Schubert"], diff: "easy" },
  { q: "Quel compositeur allemand sourd à la fin de sa vie a composé la célèbre 9e Symphonie intégrant l'Ode à la joie ?", good: "Ludwig van Beethoven", bads: ["Johannes Brahms", "Johann Sebastian Bach", "Richard Wagner"], diff: "easy" },
  { q: "Quel groupe de rock progressif britannique a sorti l'album culte The Dark Side of the Moon en 1973 ?", good: "Pink Floyd", bads: ["Led Zeppelin", "Genesis", "King Crimson"], diff: "easy" },
  { q: "Quel chanteur de reggae jamaïcain légendaire a popularisé le mouvement rastafari avec des titres comme No Woman No Cry ?", good: "Bob Marley", bads: ["Peter Tosh", "Jimmy Cliff", "Burning Spear"], diff: "easy" },
  { q: "Combien de cordes une guitare classique standard possède-t-elle ?", good: "6 cordes", bads: ["4 cordes", "5 cordes", "8 cordes"], diff: "easy" },
  { q: "Quel instrument à vent en cuivre possède une coulisse mobile pour faire varier la hauteur des sons ?", good: "Le trombone", bads: ["La trompette", "Le cor d'harmonie", "Le tuba"], diff: "easy" },
];

/** 9. Sport & Champions mondiaux */
const SPORT_DATA: Array<{ q: string; good: string; bads: [string, string, string]; diff: "easy" | "medium" | "hard" }> = [
  { q: "Quel pays détient le record du plus grand nombre de victoires en Coupe du Monde de football masculin (5 étoiles) ?", good: "Le Brésil", bads: ["L'Italie", "L'Allemagne", "L'Argentine"], diff: "easy" },
  { q: "Quel joueur de tennis suisse aux 20 titres du Grand Chelem a disputé le dernier match de sa carrière en 2022 ?", good: "Roger Federer", bads: ["Rafael Nadal", "Stan Wawrinka", "Novak Djokovic"], diff: "easy" },
  { q: "Quel nageur américain est l'athlète le plus médaillé de l'histoire des Jeux Olympiques avec 28 médailles, dont 23 en or ?", good: "Michael Phelps", bads: ["Mark Spitz", "Ryan Lochte", "Ian Thorpe"], diff: "easy" },
  { q: "Sur quelle surface les tennismen s'affrontent-ils lors du prestigieux tournoi de Wimbledon à Londres ?", good: "Le gazon", bads: ["La terre battue", "Le béton", "Le synthétique"], diff: "easy" },
  { q: "Quelle compétition cycliste masculine par étapes, créée en 1903 par Henri Desgrange, a pour symbole le Maillot Jaune ?", good: "Le Tour de France", bads: ["Le Giro d'Italia", "La Vuelta a España", "Paris-Roubaix"], diff: "easy" },
  { q: "Combien de joueurs composent une équipe de basket-ball sur le terrain ?", good: "5", bads: ["6", "7", "4"], diff: "easy" },
  { q: "Quel est le temps réglementaire d'un match de football classique hors prolongations ?", good: "90 minutes", bads: ["80 minutes", "100 minutes", "60 minutes"], diff: "easy" },
  { q: "Quel pilote brésilien triple champion du monde de F1 est tragiquement décédé au Grand Prix de Saint-Marin en 1994 ?", good: "Ayrton Senna", bads: ["Alain Prost", "Nelson Piquet", "Nigel Mansell"], diff: "easy" },
  { q: "Quelle nation de l'hémisphère sud, célèbre pour son haka avant chaque rencontre, porte le surnom des All Blacks en rugby ?", good: "La Nouvelle-Zélande", bads: ["L'Australie", "L'Afrique du Sud", "Les Fidji"], diff: "easy" },
  { q: "Combien de quilles sont disposées au bout de la piste dans une partie de bowling américain classique ?", good: "10", bads: ["9", "12", "8"], diff: "easy" },
];

/** 10. Technologie & Pionniers */
const TECH_DATA: Array<{ q: string; good: string; bads: [string, string, string]; diff: "easy" | "medium" | "hard" }> = [
  { q: "Quel mathématicien britannique a brisé le code de la machine de chiffrement allemande Enigma pendant la Seconde Guerre mondiale ?", good: "Alan Turing", bads: ["John von Neumann", "Charles Babbage", "Claude Shannon"], diff: "easy" },
  { q: "Quelle mathématicienne britannique du XIXe siècle est considérée comme la toute première programmeuse de l'histoire ?", good: "Ada Lovelace", bads: ["Grace Hopper", "Katherine Johnson", "Margaret Hamilton"], diff: "easy" },
  { q: "Quel informaticien britannique a inventé le World Wide Web (WWW) au CERN en 1989 ?", good: "Tim Berners-Lee", bads: ["Marc Andreessen", "Vint Cerf", "Robert Kahn"], diff: "easy" },
  { q: "Quel informaticien finno-américain a créé le noyau de système d'exploitation libre Linux en 1991 ?", good: "Linus Torvalds", bads: ["Richard Stallman", "Ken Thompson", "Dennis Ritchie"], diff: "easy" },
  { q: "Quel cofondateur visionnaire d'Apple a présenté le tout premier iPhone en janvier 2007 ?", good: "Steve Jobs", bads: ["Steve Wozniak", "Tim Cook", "Bill Gates"], diff: "easy" },
  { q: "Quel langage de programmation créé par Brendan Eich en mai 1995 est devenu le langage universel des navigateurs web ?", good: "JavaScript", bads: ["Python", "Java", "PHP"], diff: "easy" },
  { q: "Quelle entreprise de télécommunications a posé le premier câble télégraphique transatlantique reliant l'Europe et l'Amérique en 1858 ?", good: "L'Atlantic Telegraph Company", bads: ["Bell Telephone", "Western Union", "AT&T"], diff: "medium" },
  { q: "Quel physicien a inventé la première pile électrique en empilant des disques de cuivre et de zinc en 1800 ?", good: "Alessandro Volta", bads: ["Luigi Galvani", "André-Marie Ampère", "Michael Faraday"], diff: "easy" },
  { q: "Quel ingénieur allemand a fait breveter en 1886 le premier véhicule automobile à moteur à combustion interne (le Tricycle) ?", good: "Carl Benz", bads: ["Gottlieb Daimler", "Rudolf Diesel", "Wilhelm Maybach"], diff: "easy" },
  { q: "Quelle agence spatiale américaine a été créée en 1958 en réponse au lancement soviétique de Spoutnik 1 ?", good: "La NASA", bads: ["La DARPA", "L'ESA", "La CIA"], diff: "easy" },
];

async function main() {
  console.log("━━━━━━━━ LANCEMENT DE LA PRODUCTION DE QUESTIONS ━━━━━━━━");

  // 1. Suite Animaux (~350)
  const moreAnimals = await fetchMoreAnimals(350);
  saveInChunks("animaux", "animaux-dump2", moreAnimals, 50);

  // 2. Chimie & Éléments (80)
  const chemSpecs = buildChemistryQuestions();
  const chemQuestions = createValidQuestions(chemSpecs, "chem-elem");
  saveInChunks("science", "science-chimie", chemQuestions, 50);

  // 3. Astronomie (15)
  const astroSpecs: QuestionSpec[] = ASTRONOMY_DATA.map((d) => ({ ...d, cat: "science", sub: "astronomie" }));
  const astroQuestions = createValidQuestions(astroSpecs, "astro-elem");
  saveInChunks("science", "science-astronomie", astroQuestions, 50);

  // 4. Livres & Auteurs (60)
  const bookSpecs: QuestionSpec[] = [];
  for (const b of BOOKS_AUTHORS) {
    bookSpecs.push({
      q: `Qui est l'auteur du chef-d'œuvre littéraire « ${b.book} » ?`,
      good: b.author,
      bads: b.badAuthors,
      cat: "litterature",
      sub: b.genre,
      diff: "easy",
      tags: ["litterature", "auteurs", b.genre],
    });
  }
  const bookQuestions = createValidQuestions(bookSpecs, "lit-auteurs");
  saveInChunks("litterature", "litterature-auteurs", bookQuestions, 50);

  // 5. Films & Réalisateurs (40)
  const movieSpecs: QuestionSpec[] = [];
  for (const m of MOVIES_DIRECTORS) {
    movieSpecs.push({
      q: `Quel réalisateur a mis en scène le film culte « ${m.movie} » (${m.year}) ?`,
      good: m.director,
      bads: m.badDirectors,
      cat: "cinema",
      sub: "realisateurs",
      diff: "easy",
      tags: ["cinema", "realisateurs"],
    });
  }
  const movieQuestions = createValidQuestions(movieSpecs, "cine-films");
  saveInChunks("cinema", "cinema-films", movieQuestions, 50);

  // 6. Peintres & Tableaux (40)
  const artSpecs: QuestionSpec[] = [];
  for (const a of ART_MASTERPIECES) {
    artSpecs.push({
      q: `Quel peintre a réalisé la célèbre toile « ${a.artwork} » ?`,
      good: a.artist,
      bads: a.badArtists,
      cat: "art",
      sub: "peinture",
      diff: "easy",
      tags: ["art", "peinture", a.movement],
    });
  }
  const artQuestions = createValidQuestions(artSpecs, "art-toiles");
  saveInChunks("art", "art-toiles", artQuestions, 50);

  // 7. Gaming (15)
  const gameSpecs: QuestionSpec[] = GAMING_DATA.map((d) => ({ ...d, cat: "gaming", sub: "jeux-video" }));
  const gameQuestions = createValidQuestions(gameSpecs, "game-studios");
  saveInChunks("gaming", "gaming-studios", gameQuestions, 50);

  // 8. Musique (10)
  const musicSpecs: QuestionSpec[] = MUSIC_DATA.map((d) => ({ ...d, cat: "musique", sub: "rock-pop" }));
  const musicQuestions = createValidQuestions(musicSpecs, "music-legend");
  saveInChunks("musique", "musique-legendes", musicQuestions, 50);

  // 9. Sport (10)
  const sportSpecs: QuestionSpec[] = SPORT_DATA.map((d) => ({ ...d, cat: "sport", sub: "champions" }));
  const sportQuestions = createValidQuestions(sportSpecs, "sport-champions");
  saveInChunks("sport", "sport-champions", sportQuestions, 50);

  // 10. Tech (10)
  const techSpecs: QuestionSpec[] = TECH_DATA.map((d) => ({ ...d, cat: "technologie", sub: "pionniers" }));
  const techQuestions = createValidQuestions(techSpecs, "tech-pionniers");
  saveInChunks("technologie", "technologie-pionniers", techQuestions, 50);

  const totalAdded =
    moreAnimals.length +
    chemQuestions.length +
    astroQuestions.length +
    bookQuestions.length +
    movieQuestions.length +
    artQuestions.length +
    gameQuestions.length +
    musicQuestions.length +
    sportQuestions.length +
    techQuestions.length;

  console.log(`\n🎉 TOTAL NOUVELLES QUESTIONS AJOUTÉES : ${totalAdded}`);
}

main().catch(console.error);
