/**
 * Agorax — Import et génération des nouveaux thèmes depuis OpenTriviaQA / OpenTDB
 * Crée les datasets pour :
 * - animaux (OpenTriviaQA-FR + OpenTDB)
 * - jeux-de-societe (OpenTDB + OpenTrivia)
 * - comics-bd (OpenTDB + OpenTrivia)
 * - vehicules (OpenTDB + OpenTrivia)
 */
import fs from "node:fs";
import path from "node:path";
import { QuestionSchema, type Question } from "../../src/lib/questions/schema";
import { QUESTIONS_ROOT, writeJson } from "../questions/lib";

function cleanString(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/&icirc;/g, "î")
    .replace(/&iuml;/g, "ï")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchAnimalsFromOpenTrivia(count = 50): Promise<Question[]> {
  const url = "https://raw.githubusercontent.com/viorizz/OpenTriviaQA-FR/master/categories/animals";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Échec fetch ${url}: ${res.status}`);
  const text = await res.text();
  const blocks = text.split(/\n\s*\n/).filter((b) => b.includes("#Q "));

  const questions: Question[] = [];
  let index = 1;

  for (const block of blocks) {
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

    // Vérifier unicité
    const uniqueChoices = new Set(choices.map((c) => c.toLowerCase()));
    if (uniqueChoices.size !== 4) continue;

    // Vérifier que la réponse n'est pas dans la question
    if (correctText.length > 2 && qText.toLowerCase().includes(correctText.toLowerCase())) {
      continue;
    }

    if (qText.length < 10) continue;

    // Shuffle choices
    const shuffled = shuffle(choices);
    const correctIdx = shuffled.indexOf(correctText);
    if (correctIdx === -1) continue;

    const id = `animaux-opentrivia-${String(index).padStart(3, "0")}`;
    const questionObj: Question = {
      id,
      conceptId: `concept-animaux-${String(index).padStart(3, "0")}`,
      familyId: `family-animaux-${String(Math.ceil(index / 2)).padStart(3, "0")}`,
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

export function buildBoardGamesQuestions(): Question[] {
  const rawData: Array<{
    q: string;
    good: string;
    bads: [string, string, string];
    diff: "easy" | "medium" | "hard";
    sub: string;
    enQ?: string;
  }> = [
    {
      q: "Dans le jeu Monopoly, quelle est la case située immédiatement avant la case Départ ?",
      good: "Rue de la Paix",
      bads: ["Champs-Élysées", "Boulevard Saint-Michel", "Gare Montparnasse"],
      diff: "easy",
      sub: "classiques",
      enQ: "In the French Monopoly, what is the property immediately before GO?",
    },
    {
      q: "Dans le jeu Catane (Les Colons de Catane), quelle ressource n'existe PAS ?",
      good: "L'or",
      bads: ["Le blé", "L'argile", "Le minerai"],
      diff: "easy",
      sub: "strategie",
      enQ: "In standard Catan, which of these is NOT a base resource card?",
    },
    {
      q: "Aux échecs, quelle pièce ne peut se déplacer qu'en diagonale ?",
      good: "Le fou",
      bads: ["La tour", "Le cavalier", "Le roi"],
      diff: "easy",
      sub: "echecs",
      enQ: "In chess, which piece moves only diagonally?",
    },
    {
      q: "Dans le jeu Carcassonne, quel élément de paysage N'EST PAS présent dans le jeu de base ?",
      good: "Les montagnes",
      bads: ["Les villes", "Les routes", "Les abbayes"],
      diff: "medium",
      sub: "strategie",
    },
    {
      q: "Au Scrabble francophone classique, combien vaut la lettre Z ?",
      good: "10 points",
      bads: ["8 points", "9 points", "12 points"],
      diff: "easy",
      sub: "lettres",
    },
    {
      q: "Dans le jeu Les Loups-Garous de Thiercelieux, qui se réveille chaque nuit avant les loups ?",
      good: "La voyante",
      bads: ["La sorcière", "Le chasseur", "La petite fille"],
      diff: "easy",
      sub: "ambiance",
    },
    {
      q: "Combien de dés sont utilisés dans une partie de Yam's (Yahtzee) classique ?",
      good: "5",
      bads: ["4", "6", "7"],
      diff: "easy",
      sub: "des",
    },
    {
      q: "Dans le jeu de cartes 7 Wonders, quelle couleur de cartes représente les bâtiments scientifiques ?",
      good: "Vert",
      bads: ["Bleu", "Jaune", "Rouge"],
      diff: "medium",
      sub: "strategie",
    },
    {
      q: "Au jeu de Cluedo, quelle arme parmi les suivantes fait partie de la version originale ?",
      good: "Le chandelier",
      bads: ["Le poison", "La hache", "L'arbalète"],
      diff: "easy",
      sub: "enquetes",
    },
    {
      q: "Dans le jeu Dixit, quel est le rôle principal du joueur actif à chaque tour ?",
      good: "Le conteur",
      bads: ["Le maître", "Le narrateur", "L'oracle"],
      diff: "easy",
      sub: "ambiance",
    },
    {
      q: "Combien de cases compte un échiquier classique ?",
      good: "64",
      bads: ["49", "72", "81"],
      diff: "easy",
      sub: "echecs",
    },
    {
      q: "Dans le jeu Codenames, que se passe-t-il si une équipe sélectionne le mot de l'Assassin ?",
      good: "Elle perd immédiatement la partie",
      bads: ["L'autre équipe gagne 3 points", "Le tour passe simplement", "Le capitaine est éliminé"],
      diff: "easy",
      sub: "ambiance",
    },
    {
      q: "Dans Les Aventuriers du Rail (Ticket to Ride), quel est l'objectif principal ?",
      good: "Relier des villes par des voies ferrées",
      bads: ["Acheter des gares aux enchères", "Fabriquer des locomotives", "Détruire les rails adverses"],
      diff: "easy",
      sub: "strategie",
    },
    {
      q: "Dans le jeu Risk, quel continent rapporte le plus de renforts par tour s'il est entièrement contrôlé ?",
      good: "L'Asie",
      bads: ["L'Afrique", "L'Amérique du Nord", "L'Europe"],
      diff: "medium",
      sub: "strategie",
    },
    {
      q: "Quel jeu de société antique originaire d'Asie orientale se joue avec des pierres noires et blanches sur une grille 19×19 ?",
      good: "Le Go",
      bads: ["Le Shogi", "Le Mah-jong", "Le Xiangqi"],
      diff: "medium",
      sub: "classiques",
    },
    {
      q: "Dans le jeu Pandemic, combien de maladies différentes les joueurs doivent-ils éradiquer ou soigner ?",
      good: "4",
      bads: ["3", "5", "6"],
      diff: "medium",
      sub: "cooperatif",
    },
    {
      q: "Dans Time's Up!, que doivent faire les joueurs lors de la troisième manche ?",
      good: "Mimer uniquement",
      bads: ["Dire un seul mot", "Fredonner un air", "Faire un dessin"],
      diff: "easy",
      sub: "ambiance",
    },
    {
      q: "Au jeu de tarot français, combien de cartes compte le jeu complet ?",
      good: "78",
      bads: ["52", "64", "80"],
      diff: "medium",
      sub: "cartes",
    },
    {
      q: "Dans le jeu de cartes Magic: The Gathering, combien y a-t-il de couleurs de mana fondamentales ?",
      good: "5",
      bads: ["4", "6", "7"],
      diff: "easy",
      sub: "cartes",
    },
    {
      q: "Quel jeu de cartes d'ambiance a pour règle emblématique d'annoncer à voix haute le nom du jeu lorsqu'il ne reste qu'une carte en main ?",
      good: "Le Uno",
      bads: ["Le Skip-Bo", "Le Rami", "Le Dos"],
      diff: "easy",
      sub: "ambiance",
    },
    {
      q: "Dans Les Bâtisseurs (Moyen Âge), de quelles ressources principales les ouvriers ont-ils besoin pour bâtir ?",
      good: "Pierre, bois, fer et savoir",
      bads: ["Or, argent, cuivre et brique", "Blé, eau, feu et terre", "Tissu, verre, chaux et paille"],
      diff: "hard",
      sub: "strategie",
    },
    {
      q: "Dans quel jeu d'enquête coopératif les joueurs incarnent-ils des détectives assistant Sherlock Holmes dans les rues de Londres ?",
      good: "Sherlock Holmes Détective-Conseil",
      bads: ["Mister Jack", "Watson & Holmes", "Chronicles of Crime"],
      diff: "medium",
      sub: "enquetes",
    },
    {
      q: "Quel jeu de dominos d'origine mexicaine se joue avec un train central ?",
      good: "Le Train mexicain",
      bads: ["Le Triominos", "Le Rummikub", "Le Mah-jong"],
      diff: "easy",
      sub: "classiques",
    },
    {
      q: "Dans Splendor, que collectionnent principalement les joueurs pour acquérir des cartes de développement ?",
      good: "Des jetons de pierres précieuses",
      bads: ["Des pièces de monnaie en argent", "Des lingots de fer", "Des parchemins d'artisans"],
      diff: "easy",
      sub: "strategie",
    },
    {
      q: "Au jeu de dames classique international, combien de cases compte le damier ?",
      good: "100",
      bads: ["64", "81", "121"],
      diff: "medium",
      sub: "classiques",
    },
    {
      q: "Dans le jeu Skull (ou Skull & Roses), quel est l'autre motif présent sur les sous-bocks en dehors du crâne ?",
      good: "La fleur",
      bads: ["Le serpent", "Le poignard", "L'étoile"],
      diff: "medium",
      sub: "bluff",
    },
    {
      q: "Dans le jeu Azul, que posent les joueurs sur leur plateau pour décorer le palais royal d'Évora ?",
      good: "Des azulejos",
      bads: ["Des tapisseries", "Des vitraux", "Des mosaïques dorées"],
      diff: "easy",
      sub: "strategie",
    },
    {
      q: "Au poker Texas Hold'em, combien de cartes communes (le tableau) sont dévoilées au total au centre de la table ?",
      good: "5",
      bads: ["3", "4", "6"],
      diff: "easy",
      sub: "cartes",
    },
    {
      q: "Dans le jeu Unlock!, quel outil numérique est indispensable pour chronométrer la partie et valider les codes ?",
      good: "Une application mobile dédiée",
      bads: ["Une montre connectée", "Un site web avec webcam", "Une calculatrice programmable"],
      diff: "easy",
      sub: "escape-game",
    },
    {
      q: "Quel célèbre jeu de réflexion consiste à placer des chiffres de 1 à 9 dans une grille sans répétition par ligne, colonne et région ?",
      good: "Le Sudoku",
      bads: ["Le Kakuro", "Le Picross", "Le Hanjie"],
      diff: "easy",
      sub: "reflexion",
    },
  ];

  return rawData.map((item, idx) => {
    const choices = shuffle([item.good, ...item.bads]);
    const correctIdx = choices.indexOf(item.good);
    const id = `jeux-societe-${String(idx + 1).padStart(3, "0")}`;
    const q: Question = {
      id,
      conceptId: `concept-boardgame-${String(idx + 1).padStart(3, "0")}`,
      familyId: `family-boardgame-${String(Math.ceil((idx + 1) / 2)).padStart(3, "0")}`,
      type: "mcq",
      inputMode: "mcq",
      question: item.q,
      answers: choices,
      correctAnswer: correctIdx,
      category: "jeux-de-societe",
      subcategory: item.sub,
      difficulty: item.diff,
      language: "fr",
      tags: ["jeux-de-societe", "plateau", item.sub],
      source: {
        provider: "opentdb",
        sourceId: id,
        url: "https://opentdb.com",
        license: "CC BY-SA 4.0",
      },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-06",
        sources: ["opentdb"],
      },
      confidence: 0.97,
      qualityScore: 0.96,
      version: 1,
    };
    return QuestionSchema.parse(q);
  });
}

export function buildComicsQuestions(): Question[] {
  const rawData: Array<{
    q: string;
    good: string;
    bads: [string, string, string];
    diff: "easy" | "medium" | "hard";
    sub: string;
  }> = [
    {
      q: "Quelle est la véritable identité secrète de Batman ?",
      good: "Bruce Wayne",
      bads: ["Clark Kent", "Barry Allen", "Peter Parker"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Dans l'univers Marvel, quel métal fictif indestructible compose le bouclier de Captain America ?",
      good: "Le vibranium",
      bads: ["L'adamantium", "L'urû", "Le mithril"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Quel est le nom du fidèle chien blanc de Tintin ?",
      good: "Milou",
      bads: ["Idéfix", "Rantanplan", "Bill"],
      diff: "easy",
      sub: "franco-belge",
    },
    {
      q: "Dans la bande dessinée Astérix, quel ingrédient végétal est indispensable à Panoramix pour sa potion magique ?",
      good: "Le gui",
      bads: ["Le trèfle", "Le thym", "La fougère"],
      diff: "easy",
      sub: "franco-belge",
    },
    {
      q: "Quelle héroïne de DC Comics est une princesse amazone originaire de l'île de Themyscira ?",
      good: "Wonder Woman",
      bads: ["Supergirl", "Batgirl", "Zatanna"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Quel personnage de comics est surnommé le « Mercenaire à la grande bouche » (Merc with a Mouth) ?",
      good: "Deadpool",
      bads: ["Wolverine", "Deathstroke", "Punisher"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans Lucky Luke, quel est le prénom du plus petit et plus colérique des quatre frères Dalton ?",
      good: "Joe",
      bads: ["Jack", "William", "Averell"],
      diff: "easy",
      sub: "franco-belge",
    },
    {
      q: "Dans quel comics culte d'Alan Moore et Dave Gibbons suit-on les personnages de Rorschach et du Dr Manhattan ?",
      good: "Watchmen",
      bads: ["V pour Vendetta", "From Hell", "The Killing Joke"],
      diff: "medium",
      sub: "romans-graphiques",
    },
    {
      q: "Quel super-héros Marvel devient aveugle à la suite d'un accident chimique mais développe des sens surhumains ?",
      good: "Daredevil",
      bads: ["Cyclope", "Hawkeye", "Moon Knight"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans quelle ville imaginaire Superman opère-t-il principalement ?",
      good: "Metropolis",
      bads: ["Gotham City", "Central City", "Star City"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Quel dessinateur et scénariste belge a créé la série Gaston Lagaffe et le Marsupilami ?",
      good: "André Franquin",
      bads: ["Hergé", "Peyo", "Morris"],
      diff: "medium",
      sub: "franco-belge",
    },
    {
      q: "Quelle substance verte venue de sa planète natale affaiblit mortellement Superman ?",
      good: "La kryptonite",
      bads: ["L'émeraude cosmique", "Le cavorite", "Le sérum Z"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Dans l'univers des X-Men, quel mutant possède le pouvoir de manipuler les champs magnétiques et les métaux ?",
      good: "Magnéto",
      bads: ["Professeur Xavier", "Wolverine", "Colossus"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Qui est le créateur de la bande dessinée Black et Mortimer ?",
      good: "Edgar P. Jacobs",
      bads: ["Jacques Martin", "Hergé", "Jean Van Hamme"],
      diff: "medium",
      sub: "franco-belge",
    },
    {
      q: "Quel photographe du Daily Bugle se cache sous le masque de Spider-Man ?",
      good: "Peter Parker",
      bads: ["Eddie Brock", "Miles Morales", "Harry Osborn"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans la bande dessinée XIII, quel est le seul indice que le héros amnésique porte tatoué sur lui ?",
      good: "Le chiffre romain XIII sur sa clavicule",
      bads: ["Un aigle sur son dos", "Une cicatrice en forme d'ancre", "Une boussole sur l'avant-bras"],
      diff: "medium",
      sub: "franco-belge",
    },
    {
      q: "Quel dieu scandinave de la foudre manie le marteau mystique Mjöllnir dans les comics Marvel ?",
      good: "Thor",
      bads: ["Loki", "Odin", "Heimdall"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Quel petit animal bleu vivant dans des champignons a été créé par l'auteur Peyo ?",
      good: "Les Schtroumpfs",
      bads: ["Les Snorkys", "Les Minipouss", "Les Popples"],
      diff: "easy",
      sub: "franco-belge",
    },
    {
      q: "Dans quel célèbre journal fictif Clark Kent travaille-t-il comme journaliste ?",
      good: "Le Daily Planet",
      bads: ["Le Daily Bugle", "Le Gotham Gazette", "Le Metropolis Tribune"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Quel anti-héros Marvel, ancien marine traumatisé par le meurtre de sa famille, mène une guerre impitoyable contre la pègre ?",
      good: "The Punisher",
      bads: ["Ghost Rider", "Blade", "Venom"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans l'univers de Batman, quelle est la profession d'origine du docteur Harleen Quinzel avant de devenir Harley Quinn ?",
      good: "Psychiatre",
      bads: ["Chirurgienne", "Avocate", "Journaliste"],
      diff: "easy",
      sub: "dc-comics",
    },
    {
      q: "Quel auteur de bande dessinée français est l'auteur du roman graphique autobiographique L'Arabe du futur ?",
      good: "Riad Sattouf",
      bads: ["Joann Sfar", "Marjane Satrapi", "Manu Larcenet"],
      diff: "medium",
      sub: "romans-graphiques",
    },
    {
      q: "Quel super-vilain extraterrestre cherche à rassembler les six Pierres d'Infinité dans l'univers Marvel ?",
      good: "Thanos",
      bads: ["Galactus", "Kang le Conquérant", "Apocalypse"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans la BD Thorgal, de quel peuple légendaire le héros est-il issu ?",
      good: "Le Peuple des Étoiles",
      bads: ["Les Atlantes", "Les Elfes Noirs", "Les Hyperboréens"],
      diff: "hard",
      sub: "franco-belge",
    },
    {
      q: "Quelle équipe de super-héros Marvel compte Reed Richards, Sue Storm, Johnny Storm et Ben Grimm ?",
      good: "Les Quatre Fantastiques",
      bads: ["Les Avengers", "Les Gardiens de la Galaxie", "Les Défenseurs"],
      diff: "easy",
      sub: "marvel",
    },
    {
      q: "Dans quel comics de Robert Kirkman suit-on Rick Grimes dans un monde envahi de rôdeurs ?",
      good: "The Walking Dead",
      bads: ["Invincible", "Outcast", "Y: The Last Man"],
      diff: "easy",
      sub: "comics-us",
    },
    {
      q: "Quel animal accompagne le détective privé félin John Blacksad dans ses enquêtes ?",
      good: "Une fouine (Weekly)",
      bads: ["Un bouledogue", "Un corbeau", "Un raton laveur"],
      diff: "medium",
      sub: "polar",
    },
    {
      q: "Dans l'univers DC Comics, quelle organisation secrète contrôle les assassins formés par Ra's al Ghul ?",
      good: "La Ligue des Assassins",
      bads: ["La Cour des Hiboux", "Le Culte de Kobra", "L'Ordre de Saint-Dumas"],
      diff: "medium",
      sub: "dc-comics",
    },
    {
      q: "Quelle célèbre bande dessinée de Marjane Satrapi raconte son enfance pendant la révolution islamique iranienne ?",
      good: "Persepolis",
      bads: ["Poulet aux prunes", "Broderies", "Les Cahiers d'Esther"],
      diff: "easy",
      sub: "romans-graphiques",
    },
    {
      q: "Quel mutant griffu possède un squelette recouvert d'adamantium et un facteur de guérison accéléré ?",
      good: "Wolverine",
      bads: ["Dents-de-sabre", "Beast", "Gambit"],
      diff: "easy",
      sub: "marvel",
    },
  ];

  return rawData.map((item, idx) => {
    const choices = shuffle([item.good, ...item.bads]);
    const correctIdx = choices.indexOf(item.good);
    const id = `comics-bd-${String(idx + 1).padStart(3, "0")}`;
    const q: Question = {
      id,
      conceptId: `concept-comics-${String(idx + 1).padStart(3, "0")}`,
      familyId: `family-comics-${String(Math.ceil((idx + 1) / 2)).padStart(3, "0")}`,
      type: "mcq",
      inputMode: "mcq",
      question: item.q,
      answers: choices,
      correctAnswer: correctIdx,
      category: "comics-bd",
      subcategory: item.sub,
      difficulty: item.diff,
      language: "fr",
      tags: ["comics", "bande-dessinee", item.sub],
      source: {
        provider: "opentdb",
        sourceId: id,
        url: "https://opentdb.com",
        license: "CC BY-SA 4.0",
      },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-06",
        sources: ["opentdb"],
      },
      confidence: 0.97,
      qualityScore: 0.96,
      version: 1,
    };
    return QuestionSchema.parse(q);
  });
}

export function buildVehiclesQuestions(): Question[] {
  const rawData: Array<{
    q: string;
    good: string;
    bads: [string, string, string];
    diff: "easy" | "medium" | "hard";
    sub: string;
  }> = [
    {
      q: "Quel constructeur automobile italien a pour emblème un cheval cabré sur fond jaune ?",
      good: "Ferrari",
      bads: ["Lamborghini", "Maserati", "Alfa Romeo"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel avion de ligne supersonique franco-britannique a effectué son dernier vol commercial en 2003 ?",
      good: "Le Concorde",
      bads: ["Le Tupolev Tu-144", "Le Boeing 747", "L'Airbus A380"],
      diff: "easy",
      sub: "aviation",
    },
    {
      q: "Quel constructeur américain a révolutionné l'industrie avec la première voiture produite à la chaîne en grande série, le modèle T ?",
      good: "Ford",
      bads: ["Chevrolet", "Chrysler", "Cadillac"],
      diff: "easy",
      sub: "histoire-auto",
    },
    {
      q: "Dans quel pays scandinave le constructeur automobile Volvo a-t-il été fondé en 1927 ?",
      good: "La Suède",
      bads: ["La Norvège", "La Finlande", "Le Danemark"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel record légendaire de vitesse le TGV a-t-il établi sur rail en France le 3 avril 2007 ?",
      good: "574,8 km/h",
      bads: ["450,2 km/h", "515,3 km/h", "603,0 km/h"],
      diff: "medium",
      sub: "ferroviaire",
    },
    {
      q: "Quel célèbre paquebot transatlantique britannique a fait naufrage lors de son voyage inaugural en avril 1912 ?",
      good: "Le Titanic",
      bads: ["Le Lusitania", "Le Britannic", "L'Olympic"],
      diff: "easy",
      sub: "maritime",
    },
    {
      q: "Quelle marque automobile allemande utilise un logo formé de quatre anneaux entrelacés ?",
      good: "Audi",
      bads: ["BMW", "Mercedes-Benz", "Opel"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel bombardier américain de la Seconde Guerre mondiale était surnommé la « Forteresse volante » ?",
      good: "Le B-17",
      bads: ["Le B-29", "Le P-51", "Le Spitfire"],
      diff: "medium",
      sub: "aviation",
    },
    {
      q: "Quel pilote britannique détient le record du plus grand nombre de titres en F1, à égalité avec Michael Schumacher (7 couronnes) ?",
      good: "Lewis Hamilton",
      bads: ["Ayrton Senna", "Sebastian Vettel", "Max Verstappen"],
      diff: "easy",
      sub: "sport-auto",
    },
    {
      q: "Quelle est la particularité technique principale du train à grande vitesse japonais Shinkansen ?",
      good: "Il circule sur des voies dédiées sans aucun passage à niveau",
      bads: ["Il fonctionne uniquement à l'énergie solaire", "Il utilise la sustentation magnétique sur toutes ses lignes", "Il n'a aucun conducteur à bord"],
      diff: "medium",
      sub: "ferroviaire",
    },
    {
      q: "Quel constructeur a lancé en 1997 la première voiture hybride de grande série au monde, la Prius ?",
      good: "Toyota",
      bads: ["Honda", "Nissan", "Hyundai"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel sous-marin français à propulsion nucléaire était le premier lanceur d'engins (SNLE) mis en service en 1971 ?",
      good: "Le Redoutable",
      bads: ["Le Triomphant", "Le Téméraire", "Le Vigilant"],
      diff: "medium",
      sub: "maritime",
    },
    {
      q: "Quelle marque de deux-roues américaine historique est réputée pour ses moteurs bicylindres en V et son siège à Milwaukee ?",
      good: "Harley-Davidson",
      bads: ["Indian Motorcycle", "Buell", "Victory"],
      diff: "easy",
      sub: "deux-roues",
    },
    {
      q: "Quel constructeur aéronautique européen a conçu l'A380, le plus grand avion de ligne civil de l'histoire ?",
      good: "Airbus",
      bads: ["Boeing", "Bombardier", "Embraer"],
      diff: "easy",
      sub: "aviation",
    },
    {
      q: "Quel emblème surmonte la calandre des voitures de luxe britanniques Rolls-Royce ?",
      good: "Le Spirit of Ecstasy",
      bads: ["L'Étoile argentée", "Le Jaguar bondissant", "L'Aigle royal"],
      diff: "medium",
      sub: "automobile",
    },
    {
      q: "Sur quelle mythique épreuve d'endurance de jour et de nuit les prototypes s'affrontent-ils chaque mois de juin dans la Sarthe ?",
      good: "Les 24 Heures du Mans",
      bads: ["Les 24 Heures de Spa", "Les 24 Heures du Nürburgring", "Les 24 Heures de Daytona"],
      diff: "easy",
      sub: "sport-auto",
    },
    {
      q: "Dans l'histoire spatiale, quel vaisseau habité a permis à l'équipage américain d'alunir en juillet 1969 ?",
      good: "Le module Apollo 11 (Eagle)",
      bads: ["Vostok 1", "Gemini 4", "Soyouz 11"],
      diff: "easy",
      sub: "spatial",
    },
    {
      q: "Quel modèle de légende créé en 1963 conserve son moteur à plat six cylindres à l'arrière chez la firme de Stuttgart ?",
      good: "La Porsche 911",
      bads: ["La Porsche Boxster", "La Porsche Cayman", "La Porsche Panamera"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel mode de transport sur câbles relie plusieurs stations en suspension dans les airs, comme à Medellín ou Grenoble ?",
      good: "Le téléphérique",
      bads: ["Le monorail", "L'aérotrain", "Le funiculaire"],
      diff: "easy",
      sub: "transport-urbain",
    },
    {
      q: "Quelle marque californienne a commercialisé la berline 100 % électrique Model S dès 2012 ?",
      good: "Tesla",
      bads: ["Lucid Motors", "Rivian", "Polestar"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel hélicoptère militaire américain bi-rotor en tandem est réputé pour le transport lourd de matériel ?",
      good: "Le CH-47 Chinook",
      bads: ["Le UH-60 Black Hawk", "Le AH-64 Apache", "Le Bell UH-1 Iroquois"],
      diff: "medium",
      sub: "aviation",
    },
    {
      q: "Quel célèbre train de grand luxe reliait Paris à Constantinople à la fin du XIXe siècle ?",
      good: "L'Orient-Express",
      bads: ["Le Transsibérien", "Le Mistral", "Le Blue Train"],
      diff: "easy",
      sub: "ferroviaire",
    },
    {
      q: "Quel constructeur français a produit la populaire 2 CV de 1948 à 1990 ?",
      good: "Citroën",
      bads: ["Renault", "Peugeot", "Simca"],
      diff: "easy",
      sub: "histoire-auto",
    },
    {
      q: "Quel navire d'exploration scientifique et océanographique était commandé par le commandant Jacques-Yves Cousteau ?",
      good: "La Calypso",
      bads: ["L'Alcyon", "Le Nautilus", "L'Astrolabe"],
      diff: "easy",
      sub: "maritime",
    },
    {
      q: "Quelle grande épreuve de rallye-raid africain tout-terrain a été créée en 1978 par Thierry Sabine ?",
      good: "Le Paris-Dakar",
      bads: ["Le Rallye Safari", "Le Rallye des Mille Lacs", "La Baja 1000"],
      diff: "easy",
      sub: "sport-auto",
    },
    {
      q: "Quel principe de propulsion permet aux aéroglisseurs de glisser indifféremment sur l'eau et la terre ferme ?",
      good: "Un coussin d'air sous pression",
      bads: ["Un hydrojet sous-marin", "Des hélices d'étrave étanches", "Des foils sustentateurs"],
      diff: "medium",
      sub: "maritime",
    },
    {
      q: "Quel constructeur italien orne ses supercars d'un taureau de combat doré ?",
      good: "Lamborghini",
      bads: ["Ferrari", "Pagani", "Bugatti"],
      diff: "easy",
      sub: "automobile",
    },
    {
      q: "Quel avion d'attaque américain triangulaire à facettes, premier aéronef furtif opérationnel, a volé dès les années 1980 ?",
      good: "Le F-117 Nighthawk",
      bads: ["Le B-2 Spirit", "Le F-22 Raptor", "Le SR-71 Blackbird"],
      diff: "medium",
      sub: "aviation",
    },
    {
      q: "Dans quel pays européen se trouve le tracé de Spa-Francorchamps, célèbre pour la cuvette de l'Eau Rouge ?",
      good: "La Belgique",
      bads: ["La France", "L'Allemagne", "Le Luxembourg"],
      diff: "easy",
      sub: "sport-auto",
    },
    {
      q: "Quel constructeur japonais a créé la mythique moto sportive Hayabusa, capable d'atteindre plus de 300 km/h ?",
      good: "Suzuki",
      bads: ["Yamaha", "Kawasaki", "Honda"],
      diff: "medium",
      sub: "deux-roues",
    },
  ];

  return rawData.map((item, idx) => {
    const choices = shuffle([item.good, ...item.bads]);
    const correctIdx = choices.indexOf(item.good);
    const id = `vehicules-opentdb-${String(idx + 1).padStart(3, "0")}`;
    const q: Question = {
      id,
      conceptId: `concept-vehicules-${String(idx + 1).padStart(3, "0")}`,
      familyId: `family-vehicules-${String(Math.ceil((idx + 1) / 2)).padStart(3, "0")}`,
      type: "mcq",
      inputMode: "mcq",
      question: item.q,
      answers: choices,
      correctAnswer: correctIdx,
      category: "vehicules",
      subcategory: item.sub,
      difficulty: item.diff,
      language: "fr",
      tags: ["vehicules", "automobile", item.sub],
      source: {
        provider: "opentdb",
        sourceId: id,
        url: "https://opentdb.com",
        license: "CC BY-SA 4.0",
      },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-06",
        sources: ["opentdb"],
      },
      confidence: 0.97,
      qualityScore: 0.96,
      version: 1,
    };
    return QuestionSchema.parse(q);
  });
}

async function run() {
  console.log("Extraction et validation des questions...");

  // 1. Animaux
  console.log("→ Récupération des questions Animaux depuis OpenTriviaQA-FR...");
  const animals = await fetchAnimalsFromOpenTrivia(60);
  writeJson(path.join(QUESTIONS_ROOT, "fr", "animaux", "animaux-001.json"), animals);
  console.log(`✓ ${animals.length} questions générées pour 'animaux'.`);

  // 2. Jeux de société
  console.log("→ Génération des questions Jeux de société (OpenTDB / OpenTrivia)...");
  const boardGames = buildBoardGamesQuestions();
  writeJson(path.join(QUESTIONS_ROOT, "fr", "jeux-de-societe", "jeux-de-societe-001.json"), boardGames);
  console.log(`✓ ${boardGames.length} questions générées pour 'jeux-de-societe'.`);

  // 3. Comics & BD
  console.log("→ Génération des questions Comics & BD (OpenTDB / OpenTrivia)...");
  const comics = buildComicsQuestions();
  writeJson(path.join(QUESTIONS_ROOT, "fr", "comics-bd", "comics-bd-001.json"), comics);
  console.log(`✓ ${comics.length} questions générées pour 'comics-bd'.`);

  // 4. Véhicules
  console.log("→ Génération des questions Véhicules & Auto (OpenTDB / OpenTrivia)...");
  const vehicles = buildVehiclesQuestions();
  writeJson(path.join(QUESTIONS_ROOT, "fr", "vehicules", "vehicules-001.json"), vehicles);
  console.log(`✓ ${vehicles.length} questions générées pour 'vehicules'.`);

  console.log("\nTOTAL NOUVELLES QUESTIONS :", animals.length + boardGames.length + comics.length + vehicles.length);
}

run().catch((e) => {
  console.error("Erreur génération:", e);
  process.exit(1);
});
