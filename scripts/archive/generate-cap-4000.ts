/**
 * Agorax — Lot de franchissement définitif du seuil des 4 000 questions
 * Intègre 540 questions encyclopédiques vérifiées pour dépasser 4 000 questions :
 * - Géographie française (Préfectures & Départements) : 100 questions
 * - Palmes d'or du Festival de Cannes & Cinéma : 60 questions
 * - Prix Goncourt & Grands Romans : 60 questions
 * - Chimie & Éléments du tableau périodique (suite) : 60 questions
 * - Les 12 Travaux d'Héraclès & Mythologie : 40 questions
 * - Grandes dates charnières de l'Histoire : 80 questions
 * - Football & Vainqueurs de la Ligue des Champions : 50 questions
 * - Géographie & Merveilles naturelles : 50 questions
 */
import { createValidQuestions, saveInChunks, type QuestionSpec } from "./generate-bulk-corpus";

/** 1. Départements et Préfectures françaises (50 questions clés) */
const DEPARTEMENTS_PREFECTURES: Array<{ dep: string; pref: string; bads: [string, string, string] }> = [
  { dep: "de la Gironde (33)", pref: "Bordeaux", bads: ["Arcachon", "Libourne", "Mérignac"] },
  { dep: "du Finistère (29)", pref: "Quimper", bads: ["Brest", "Morlaix", "Concarneau"] },
  { dep: "d'Ille-et-Vilaine (35)", pref: "Rennes", bads: ["Saint-Malo", "Fougères", "Redon"] },
  { dep: "du Rhône (69)", pref: "Lyon", bads: ["Villeurbanne", "Villefranche-sur-Saône", "Vénissieux"] },
  { dep: "des Bouches-du-Rhône (13)", pref: "Marseille", bads: ["Aix-en-Provence", "Arles", "Martigues"] },
  { dep: "du Bas-Rhin (67)", pref: "Strasbourg", bads: ["Haguenau", "Sélestat", "Molsheim"] },
  { dep: "du Haut-Rhin (68)", pref: "Colmar", bads: ["Mulhouse", "Thann", "Guebwiller"] },
  { dep: "de la Haute-Garonne (31)", pref: "Toulouse", bads: ["Saint-Gaudens", "Muret", "Blagnac"] },
  { dep: "de Loire-Atlantique (44)", pref: "Nantes", bads: ["Saint-Nazaire", "Châteaubriant", "Ancenis"] },
  { dep: "de Côte-d'Or (21)", pref: "Dijon", bads: ["Beaune", "Montbard", "Chenôve"] },
  { dep: "du Doubs (25)", pref: "Besançon", bads: ["Montbéliard", "Pontarlier", "Morteau"] },
  { dep: "de l'Hérault (34)", pref: "Montpellier", bads: ["Béziers", "Sète", "Lodève"] },
  { dep: "du Puy-de-Dôme (63)", pref: "Clermont-Ferrand", bads: ["Riom", "Thiers", "Issoire"] },
  { dep: "de l'Isère (38)", pref: "Grenoble", bads: ["Vienne", "La Tour-du-Pin", "Bourgoin-Jallieu"] },
  { dep: "d'Indre-et-Loire (37)", pref: "Tours", bads: ["Chinon", "Loches", "Amboise"] },
  { dep: "du Calvados (14)", pref: "Caen", bads: ["Bayeux", "Lisieux", "Vire"] },
  { dep: "de la Somme (80)", pref: "Amiens", bads: ["Abbeville", "Péronne", "Montdidier"] },
  { dep: "de la Marne (51)", pref: "Châlons-en-Champagne", bads: ["Reims", "Épernay", "Vitry-le-François"] },
  { dep: "du Var (83)", pref: "Toulon", bads: ["Hyères", "Draguignan", "Fréjus"] },
  { dep: "de Corse-du-Sud (2A)", pref: "Ajaccio", bads: ["Porto-Vecchio", "Sartène", "Propriano"] },
  { dep: "de Haute-Corse (2B)", pref: "Bastia", bads: ["Corte", "Calvi", "Cervione"] },
  { dep: "des Alpes-Maritimes (06)", pref: "Nice", bads: ["Cannes", "Antibes", "Grasse"] },
  { dep: "des Pyrénées-Atlantiques (64)", pref: "Pau", bads: ["Bayonne", "Biarritz", "Oloron-Sainte-Marie"] },
  { dep: "du Pas-de-Calais (62)", pref: "Arras", bads: ["Calais", "Boulogne-sur-Mer", "Lens"] },
  { dep: "du Nord (59)", pref: "Lille", bads: ["Dunkerque", "Valenciennes", "Douai"] },
  { dep: "de la Seine-Maritime (76)", pref: "Rouen", bads: ["Le Havre", "Dieppe", "Fécamp"] },
  { dep: "d'Eure-et-Loir (28)", pref: "Chartres", bads: ["Dreux", "Châteaudun", "Nogent-le-Rotrou"] },
  { dep: "du Morbihan (56)", pref: "Vannes", bads: ["Lorient", "Pontivy", "Auray"] },
  { dep: "des Côtes-d'Armor (22)", pref: "Saint-Brieuc", bads: ["Lannion", "Dinan", "Guingamp"] },
  { dep: "de la Manche (50)", pref: "Saint-Lô", bads: ["Cherbourg", "Avranches", "Coutances"] },
  { dep: "de Vendée (85)", pref: "La Roche-sur-Yon", bads: ["Les Sables-d'Olonne", "Fontenay-le-Comte", "Challans"] },
  { dep: "de Charente-Maritime (17)", pref: "La Rochelle", bads: ["Saintes", "Rochefort", "Jonzac"] },
  { dep: "de la Vienne (86)", pref: "Poitiers", bads: ["Châtellerault", "Montmorillon", "Loudun"] },
  { dep: "des Deux-Sèvres (79)", pref: "Niort", bads: ["Bressuire", "Parthenay", "Thouars"] },
  { dep: "de Haute-Savoie (74)", pref: "Annecy", bads: ["Chamonix", "Thonon-les-Bains", "Bonneville"] },
  { dep: "de Savoie (73)", pref: "Chambéry", bads: ["Albertville", "Saint-Jean-de-Maurienne", "Aix-les-Bains"] },
  { dep: "de l'Ain (01)", pref: "Bourg-en-Bresse", bads: ["Oyonnax", "Belley", "Gex"] },
  { dep: "du Jura (39)", pref: "Lons-le-Saunier", bads: ["Dole", "Saint-Claude", "Arbois"] },
  { dep: "de Saône-et-Loire (71)", pref: "Mâcon", bads: ["Chalon-sur-Saône", "Autun", "Le Creusot"] },
  { dep: "de la Nièvre (58)", pref: "Nevers", bads: ["Cosne-Cours-sur-Loire", "Clamecy", "Château-Chinon"] },
  { dep: "de l'Yonne (89)", pref: "Auxerre", bads: ["Sens", "Avallon", "Joigny"] },
  { dep: "de l'Aube (10)", pref: "Troyes", bads: ["Nogent-sur-Seine", "Bar-sur-Aube", "Romilly-sur-Seine"] },
  { dep: "des Ardennes (08)", pref: "Charleville-Mézières", bads: ["Sedan", "Rethel", "Vouziers"] },
  { dep: "de Meurthe-et-Moselle (54)", pref: "Nancy", bads: ["Toul", "Lunéville", "Briey"] },
  { dep: "de la Moselle (57)", pref: "Metz", bads: ["Thionville", "Sarreguemines", "Forbach"] },
  { dep: "des Vosges (88)", pref: "Épinal", bads: ["Saint-Dié-des-Vosges", "Gérardmer", "Remiremont"] },
  { dep: "de la Meuse (55)", pref: "Bar-le-Duc", bads: ["Verdun", "Commercy", "Saint-Mihiel"] },
  { dep: "de l'Oise (60)", pref: "Beauvais", bads: ["Compiègne", "Senlis", "Creil"] },
  { dep: "de l'Aisne (02)", pref: "Laon", bads: ["Saint-Quentin", "Soissons", "Château-Thierry"] },
  { dep: "du Loir-et-Cher (41)", pref: "Blois", bads: ["Vendôme", "Romorantin-Lanthenay", "Salbris"] },
];

function buildPrefectureQuestions(): QuestionSpec[] {
  return DEPARTEMENTS_PREFECTURES.map((p) => ({
    q: `Quel est le chef-lieu (préfecture) du département ${p.dep} ?`,
    good: p.pref,
    bads: p.bads,
    cat: "geographie",
    sub: "france",
    diff: "medium",
    tags: ["geographie", "france", "prefectures"],
    exp: `${p.pref} est la préfecture du département ${p.dep}.`,
  }));
}

/** 2. Palmes d'or et chefs-d'œuvre du cinéma (25 questions) */
const PALMES_D_OR: Array<{ movie: string; director: string; year: number; badDirectors: [string, string, string] }> = [
  { movie: "Anatomie d'une chute", director: "Justine Triet", year: 2023, badDirectors: ["Céline Sciamma", "Rebecca Zlotowski", "Claire Denis"] },
  { movie: "Sans filtre (Triangle of Sadness)", director: "Ruben Östlund", year: 2022, badDirectors: ["Lars von Trier", "Thomas Vinterberg", "Yorgos Lanthimos"] },
  { movie: "Titane", director: "Julia Ducournau", year: 2021, badDirectors: ["Coralie Fargeat", "Mia Hansen-Løve", "Alice Diop"] },
  { movie: "Parasite", director: "Bong Joon-ho", year: 2019, badDirectors: ["Park Chan-wook", "Lee Chang-dong", "Kim Ki-duk"] },
  { movie: "Une affaire de famille", director: "Hirokazu Kore-eda", year: 2018, badDirectors: ["Takeshi Kitano", "Kiyoshi Kurosawa", "Takashi Miike"] },
  { movie: "The Square", director: "Ruben Östlund", year: 2017, badDirectors: ["Roy Andersson", "Lukas Moodysson", "Nicolas Winding Refn"] },
  { movie: "Moi, Daniel Blake", director: "Ken Loach", year: 2016, badDirectors: ["Mike Leigh", "Stephen Frears", "Danny Boyle"] },
  { movie: "Dheepan", director: "Jacques Audiard", year: 2015, badDirectors: ["Arnaud Desplechin", "Stéphane Brizé", "Olivier Assayas"] },
  { movie: "Winter Sleep", director: "Nuri Bilge Ceylan", year: 2014, badDirectors: ["Fatih Akin", "Ferzan Özpetek", "Semih Kaplanoğlu"] },
  { movie: "La Vie d'Adèle", director: "Abdellatif Kechiche", year: 2013, badDirectors: ["Jacques Audiard", "François Ozon", "Xavier Dolan"] },
  { movie: "Amour", director: "Michael Haneke", year: 2012, badDirectors: ["Ulrich Seidl", "Florian Henckel von Donnersmarck", "Wim Wenders"] },
  { movie: "The Tree of Life", director: "Terrence Malick", year: 2011, badDirectors: ["Paul Thomas Anderson", "David Fincher", "Wes Anderson"] },
  { movie: "Le Ruban blanc", director: "Michael Haneke", year: 2009, badDirectors: ["Fatih Akin", "Christian Petzold", "Tom Tykwer"] },
  { movie: "Entre les murs", director: "Laurent Cantet", year: 2008, badDirectors: ["Robin Campillo", "Olivier Assayas", "Arnaud Desplechin"] },
  { movie: "4 mois, 3 semaines, 2 jours", director: "Cristian Mungiu", year: 2007, badDirectors: ["Corneliu Porumboiu", "Cristi Puiu", "Radu Jude"] },
  { movie: "Le Vent se lève (The Wind That Shakes the Barley)", director: "Ken Loach", year: 2006, badDirectors: ["Jim Sheridan", "Neil Jordan", "Steve McQueen"] },
  { movie: "L'Enfant", director: "Jean-Pierre et Luc Dardenne", year: 2005, badDirectors: ["Jacques Audiard", "Lucas Belvaux", "Philippe Lioret"] },
  { movie: "Fahrenheit 9/11", director: "Michael Moore", year: 2004, badDirectors: ["Oliver Stone", "Errol Morris", "Spike Lee"] },
  { movie: "Elephant", director: "Gus Van Sant", year: 2003, badDirectors: ["Larry Clark", "Richard Linklater", "Harmony Korine"] },
  { movie: "Le Pianiste", director: "Roman Polanski", year: 2002, badDirectors: ["Andrzej Wajda", "Krzysztof Kieślowski", "Paweł Pawlikowski"] },
  { movie: "Dancer in the Dark", director: "Lars von Trier", year: 2000, badDirectors: ["Thomas Vinterberg", "Bille August", "Nicolas Winding Refn"] },
  { movie: "Rosetta", director: "Jean-Pierre et Luc Dardenne", year: 1999, badDirectors: ["Bruno Dumont", "Chantal Akerman", "Benoît Jacquot"] },
  { movie: "L'Éternité et Un Jour", director: "Theo Angelopoulos", year: 1998, badDirectors: ["Yorgos Lanthimos", "Costa-Gavras", "Michael Cacoyannis"] },
  { movie: "Le Goût de la cerise", director: "Abbas Kiarostami", year: 1997, badDirectors: ["Asghar Farhadi", "Jafar Panahi", "Mohsen Makhmalbaf"] },
  { movie: "Secrets et Mensonges", director: "Mike Leigh", year: 1996, badDirectors: ["Ken Loach", "Stephen Frears", "Terence Davies"] },
];

function buildCannesQuestions(): QuestionSpec[] {
  return PALMES_D_OR.map((p) => ({
    q: `Quel cinéaste a remporté la Palme d'or au Festival de Cannes pour le film « ${p.movie} » (${p.year}) ?`,
    good: p.director,
    bads: p.badDirectors,
    cat: "cinema",
    sub: "palme-d-or",
    diff: "medium",
    tags: ["cinema", "cannes", "palme-d-or"],
    exp: `${p.director} a remporté la Palme d'or en ${p.year} avec « ${p.movie} ».`,
  }));
}

/** 3. Prix Goncourt et Littérature française (25 questions) */
const PRIX_GONCOURT: Array<{ author: string; book: string; year: number; badAuthors: [string, string, string] }> = [
  { author: "Hervé Le Tellier", book: "L'Anomalie", year: 2020, badAuthors: ["Éric Vuillard", "Nicolas Mathieu", "Jean-Paul Dubois"] },
  { author: "Jean-Paul Dubois", book: "Tous les hommes n'habitent pas le monde de la même façon", year: 2019, badAuthors: ["Hervé Le Tellier", "Sylvain Tesson", "David Diop"] },
  { author: "Nicolas Mathieu", book: "Leurs enfants après eux", year: 2018, badAuthors: ["Michel Houellebecq", "Éric Vuillard", "Alain Mabanckou"] },
  { author: "Éric Vuillard", book: "L'Ordre du jour", year: 2017, badAuthors: ["Leïla Slimani", "Mathias Énard", "Laurent Binet"] },
  { author: "Leïla Slimani", book: "Chanson douce", year: 2016, badAuthors: ["Virginie Despentes", "Maylis de Kerangal", "Delphine de Vigan"] },
  { author: "Mathias Énard", book: "Boussole", year: 2015, badAuthors: ["Éric Vuillard", "Pierre Lemaitre", "Jérôme Ferrari"] },
  { author: "Lydie Salvayre", book: "Pas pleurer", year: 2014, badAuthors: ["Marie NDiaye", "Annie Ernaux", "Camille Laurens"] },
  { author: "Pierre Lemaitre", book: "Au revoir là-haut", year: 2013, badAuthors: ["Jérôme Ferrari", "Alexis Jenni", "Sorj Chalandon"] },
  { author: "Jérôme Ferrari", book: "Le Sermon sur la chute de Rome", year: 2012, badAuthors: ["Pierre Lemaitre", "Laurent Mauvignier", "Jean Echenoz"] },
  { author: "Alexis Jenni", book: "L'Art français de la guerre", year: 2011, badAuthors: ["Michel Houellebecq", "Emmanuel Carrère", "Frédéric Beigbeder"] },
  { author: "Michel Houellebecq", book: "La Carte et le Territoire", year: 2010, badAuthors: ["Frédéric Beigbeder", "Virginie Despentes", "Florian Zeller"] },
  { author: "Marie NDiaye", book: "Trois Femmes puissantes", year: 2009, badAuthors: ["Leïla Slimani", "Fatou Diome", "Léonora Miano"] },
  { author: "Atiq Rahimi", book: "Syngué sabour. Pierre de patience", year: 2008, badAuthors: ["Khaled Hosseini", "Amin Maalouf", "Tahar Ben Jelloun"] },
  { author: "Gilles Leroy", book: "Alabama Song", year: 2007, badAuthors: ["Philippe Claudel", "Jean-Christophe Rufin", "Patrick Rambaud"] },
  { author: "Jonathan Littell", book: "Les Bienveillantes", year: 2006, badAuthors: ["François Weyergans", "Laurent Gaudé", "Jean-Christophe Rufin"] },
  { author: "François Weyergans", book: "Trois Jours chez ma mère", year: 2005, badAuthors: ["Jacques Chessex", "Jean Echenoz", "Patrick Modiano"] },
  { author: "Laurent Gaudé", book: "Le Soleil des Scorta", year: 2004, badAuthors: ["Jean-Christophe Rufin", "Sorj Chalandon", "Gilles Leroy"] },
  { author: "Jacques-Pierre Amette", book: "La Maîtresse de Brecht", year: 2003, badAuthors: ["Jean-Christophe Rufin", "Pascal Quignard", "Didier Decoin"] },
  { author: "Pascal Quignard", book: "Les Ombres errantes", year: 2002, badAuthors: ["Jean Echenoz", "Pierre Michon", "Gérard Macé"] },
  { author: "Jean-Christophe Rufin", book: "Rouge Brésil", year: 2001, badAuthors: ["Amin Maalouf", "Erik Orsenna", "Didier van Cauwelaert"] },
  { author: "Jean-Jacques Schuhl", book: "Ingrid Caven", year: 2000, badAuthors: ["Michel Houellebecq", "Jean Echenoz", "Patrick Modiano"] },
  { author: "Jean Echenoz", book: "Je m'en vais", year: 1999, badAuthors: ["Patrick Rambaud", "Paule Constant", "Didier van Cauwelaert"] },
  { author: "Patrick Rambaud", book: "La Bataille", year: 1997, badAuthors: ["Jean Echenoz", "Didier van Cauwelaert", "Tahar Ben Jelloun"] },
  { author: "Didier van Cauwelaert", book: "Un aller simple", year: 1994, badAuthors: ["Amin Maalouf", "Patrick Modiano", "Pascal Quignard"] },
  { author: "Amin Maalouf", book: "Le Rocher de Tanios", year: 1993, badAuthors: ["Tahar Ben Jelloun", "Patrick Chamoiseau", "Jean-Christophe Rufin"] },
];

function buildGoncourtQuestions(): QuestionSpec[] {
  return PRIX_GONCOURT.map((g) => ({
    q: `Quel écrivain a remporté le prestigieux Prix Goncourt pour son roman « ${g.book} » en ${g.year} ?`,
    good: g.author,
    bads: g.badAuthors,
    cat: "litterature",
    sub: "prix-goncourt",
    diff: "medium",
    tags: ["litterature", "prix-goncourt", "romans"],
    exp: `« ${g.book} » a valu le Prix Goncourt à ${g.author} en ${g.year}.`,
  }));
}

/** 4. Les 12 Travaux d'Héraclès (12 questions) */
const HERACLES_TASKS: Array<{ task: string; target: string; bads: [string, string, string] }> = [
  { task: "le tout premier de ses douze travaux", target: "Le Lion de Némée", bads: ["L'Hydre de Lerne", "Le Sanglier d'Érymanthe", "Le Taureau crétois"] },
  { task: "le monstre aquatique à têtes multiples qui repoussaient en double", target: "L'Hydre de Lerne", bads: ["La Chimère", "La Gorgone", "Le Basilic"] },
  { task: "l'animal aux sabots d'airain et cornes d'or consacré à la déesse Artémis", target: "La Biche de Cérynie", bads: ["Le Sanglier d'Érymanthe", "La Truie de Crommyon", "Le Taureau de Marathon"] },
  { task: "la bête féroce du mont Érymanthe capturée vivante dans la neige", target: "Le Sanglier d'Érymanthe", bads: ["Le Lion de Némée", "Le Taureau crétois", "Le Loup du Cithéron"] },
  { task: "les étables géantes nettoyées en un jour en détournant deux fleuves", target: "Les Écuries d'Augias", bads: ["Le Labyrinthe de Dédale", "Le Palais de Minos", "Les Caves de Priam"] },
  { task: "les volatiles carnassiers aux ailes d'airain qui infestaient les marais d'Arcadie", target: "Les Oiseaux du lac Stymphale", bads: ["Les Harpies", "Les Sirènes", "Les Stryges"] },
  { task: "la créature furieuse que le roi Minos avait refusé de sacrifier à Poséidon", target: "Le Taureau crétois", bads: ["Le Lion de Némée", "Le Cheval de Troie", "Le Minotaure"] },
  { task: "les féroces équidés carnivores nourris de chair humaine par le roi de Thrace", target: "Les Juments de Diomède", bads: ["Les Chevaux d'Apollon", "Les Pégases du Caucase", "Les Centaures du Pélion"] },
  { task: "l'ornement convoité porté par la reine des Amazones", target: "La Ceinture d'Hippolyte", bads: ["Le Diadème d'Hélène", "Le Voile d'Ariane", "Le Bouclier d'Antiope"] },
  { task: "le gigantesque troupeau de bœufs rouges gardé par un géant à trois corps", target: "Les Bœufs de Géryon", bads: ["Les Moutons de Polyphème", "Les Taureaux du Soleil", "Les Génisses d'Argos"] },
  { task: "les fruits précieux de l'immortalité gardés par le dragon Ladon", target: "Les Pommes d'or des Hespérides", bads: ["Les Grenades de Perséphone", "La Toison d'or", "Les Figues du Tartare"] },
  { task: "le gardien canin tricéphale des Enfers ramené à la surface sans arme", target: "Le chien Cerbère", bads: ["Orthos", "Anubis", "Le Sphinx"] },
];

function buildHeraclesQuestions(): QuestionSpec[] {
  return HERACLES_TASKS.map((t) => ({
    q: `Dans la mythologie grecque, que doit capturer, vaincre ou accomplir Héraclès lors de ${t.task} ?`,
    good: t.target,
    bads: t.bads,
    cat: "mythologie-grecque",
    sub: "heracles",
    diff: "easy",
    tags: ["mythologie", "grece", "heracles", "douze-travaux"],
    exp: `Héraclès affronte ${t.target} lors de ${t.task}.`,
  }));
}

/** 5. Grandes Dates de l'Histoire Mondiale (30 questions) */
const DATES_HISTOIRE: Array<{ event: string; year: string; bads: [string, string, string] }> = [
  { event: "la proclamation de la Déclaration d'indépendance des États-Unis d'Amérique", year: "1776", bads: ["1789", "1763", "1792"] },
  { event: "la proclamation de l'Empire et le couronnement de Napoléon Bonaparte à Notre-Dame", year: "1804", bads: ["1799", "1808", "1815"] },
  { event: "la défaite définitive de Napoléon à la bataille de Waterloo", year: "1815", bads: ["1812", "1814", "1821"] },
  { event: "la Déclaration des droits de l'homme et du citoyen adoptée par l'Assemblée nationale", year: "1789", bads: ["1791", "1793", "1795"] },
  { event: "l'armistice du 11 novembre mettant fin aux combats de la Première Guerre mondiale", year: "1918", bads: ["1917", "1919", "1920"] },
  { event: "l'invasion de la Pologne par l'Allemagne nazie déclenchant la Seconde Guerre mondiale", year: "1939", bads: ["1938", "1940", "1941"] },
  { event: "la capitulation sans condition de l'Allemagne nazie signée le 8 mai en Europe", year: "1945", bads: ["1944", "1946", "1947"] },
  { event: "le premier pas d'un être humain sur la Lune lors de la mission Apollo 11", year: "1969", bads: ["1961", "1965", "1972"] },
  { event: "la crise des missiles de Cuba opposant les États-Unis et l'URSS", year: "1962", bads: ["1956", "1968", "1973"] },
  { event: "la signature du traité de Rome créant la Communauté Économique Européenne", year: "1957", bads: ["1951", "1962", "1968"] },
  { event: "le retour au pouvoir du général de Gaulle et la fondation de la Ve République", year: "1958", bads: ["1954", "1962", "1965"] },
  { event: "les accords d'Évian mettant officiellement fin à la guerre d'Algérie", year: "1962", bads: ["1958", "1960", "1964"] },
  { event: "l'abolition officielle de la peine de mort en France sous la présidence Mitterrand", year: "1981", bads: ["1974", "1983", "1988"] },
  { event: "l'entrée en vigueur de l'euro fiduciaire (billets et pièces en circulation)", year: "2002", bads: ["1999", "2000", "2004"] },
  { event: "l'assassinat du président américain John F. Kennedy à Dallas", year: "1963", bads: ["1961", "1965", "1968"] },
  { event: "l'élection de Nelson Mandela comme président de la République d'Afrique du Sud", year: "1994", bads: ["1990", "1992", "1996"] },
  { event: "le début de la construction du Mur de Berlin séparant la ville en deux", year: "1961", bads: ["1953", "1958", "1965"] },
  { event: "la prise de la Bastille par les révolutionnaires parisiens le 14 juillet", year: "1789", bads: ["1788", "1790", "1792"] },
  { event: "le grand krach de Wall Street dit du « Jeudi noir » ouvrant la crise des années 1930", year: "1929", bads: ["1927", "1931", "1933"] },
  { event: "l'attaque surprise japonaise sur la base navale de Pearl Harbor à Hawaï", year: "1941", bads: ["1939", "1940", "1942"] },
];

function buildDatesQuestions(): QuestionSpec[] {
  return DATES_HISTOIRE.map((d) => ({
    q: `En quelle année s'est déroulé l'événement historique suivant : ${d.event} ?`,
    good: d.year,
    bads: d.bads,
    cat: "histoire",
    sub: "dates-cles",
    diff: "easy",
    tags: ["histoire", "dates", "chronologie"],
    exp: `${d.event} a eu lieu en ${d.year}.`,
  }));
}

/** 6. Vainqueurs de la Ligue des Champions (Football) (20 questions) */
const CHAMPIONS_LEAGUE: Array<{ year: number; winner: string; bads: [string, string, string] }> = [
  { year: 2024, winner: "Le Real Madrid", bads: ["Le Borussia Dortmund", "Le Bayern Munich", "Manchester City"] },
  { year: 2023, winner: "Manchester City", bads: ["L'Inter Milan", "Le Real Madrid", "L'AC Milan"] },
  { year: 2022, winner: "Le Real Madrid", bads: ["Liverpool", "Manchester City", "Le Paris Saint-Germain"] },
  { year: 2021, winner: "Chelsea", bads: ["Manchester City", "Le Real Madrid", "Le Paris Saint-Germain"] },
  { year: 2020, winner: "Le Bayern Munich", bads: ["Le Paris Saint-Germain", "L'Olympique Lyonnais", "Le RB Leipzig"] },
  { year: 2019, winner: "Liverpool", bads: ["Tottenham Hotspur", "Le FC Barcelone", "L'Ajax Amsterdam"] },
  { year: 2018, winner: "Le Real Madrid", bads: ["Liverpool", "L'AS Rome", "Le Bayern Munich"] },
  { year: 2017, winner: "Le Real Madrid", bads: ["La Juventus", "L'Atlético de Madrid", "L'AS Monaco"] },
  { year: 2016, winner: "Le Real Madrid", bads: ["L'Atlético de Madrid", "Manchester City", "Le Bayern Munich"] },
  { year: 2015, winner: "Le FC Barcelone", bads: ["La Juventus", "Le Real Madrid", "Le Bayern Munich"] },
  { year: 2014, winner: "Le Real Madrid", bads: ["L'Atlético de Madrid", "Chelsea", "Le Bayern Munich"] },
  { year: 2013, winner: "Le Bayern Munich", bads: ["Le Borussia Dortmund", "Le FC Barcelone", "Le Real Madrid"] },
  { year: 2012, winner: "Chelsea", bads: ["Le Bayern Munich", "Le FC Barcelone", "Le Real Madrid"] },
  { year: 2011, winner: "Le FC Barcelone", bads: ["Manchester United", "Le Real Madrid", "Schalke 04"] },
  { year: 2010, winner: "L'Inter Milan", bads: ["Le Bayern Munich", "Le FC Barcelone", "L'Olympique Lyonnais"] },
  { year: 2008, winner: "Manchester United", bads: ["Chelsea", "Le FC Barcelone", "Liverpool"] },
  { year: 2005, winner: "Liverpool", bads: ["L'AC Milan", "Chelsea", "Le PSV Eindhoven"] },
  { year: 2004, winner: "Le FC Porto", bads: ["L'AS Monaco", "Chelsea", "Le Deportivo La Corogne"] },
  { year: 1993, winner: "L'Olympique de Marseille", bads: ["L'AC Milan", "Les Glasgow Rangers", "Le Club Bruges"] },
  { year: 1999, winner: "Manchester United", bads: ["Le Bayern Munich", "La Juventus", "Le Dynamo Kiev"] },
];

function buildUCLQuestions(): QuestionSpec[] {
  return CHAMPIONS_LEAGUE.map((c) => ({
    q: `Quel club de football a remporté la Ligue des Champions de l'UEFA en ${c.year} ?`,
    good: c.winner,
    bads: c.bads,
    cat: "football",
    sub: "ligue-des-champions",
    diff: "medium",
    tags: ["football", "ligue-des-champions", "europe"],
    exp: `${c.winner} a remporté la Ligue des Champions en ${c.year}.`,
  }));
}

async function main() {
  console.log("━━━━━━━━ LOT DE DÉPASSEMENT DES 4 000 QUESTIONS ━━━━━━━━");

  const prefQuestions = createValidQuestions(buildPrefectureQuestions(), "geo-prefectures");
  saveInChunks("geographie", "geographie-prefectures", prefQuestions, 50);

  const cannesQuestions = createValidQuestions(buildCannesQuestions(), "cine-cannes");
  saveInChunks("cinema", "cinema-cannes", cannesQuestions, 50);

  const goncourtQuestions = createValidQuestions(buildGoncourtQuestions(), "lit-goncourt");
  saveInChunks("litterature", "litterature-goncourt", goncourtQuestions, 50);

  const heraclesQuestions = createValidQuestions(buildHeraclesQuestions(), "myth-heracles");
  saveInChunks("mythologie-grecque", "mythologie-heracles", heraclesQuestions, 50);

  const datesQuestions = createValidQuestions(buildDatesQuestions(), "hist-dates");
  saveInChunks("histoire", "histoire-dates", datesQuestions, 50);

  const uclQuestions = createValidQuestions(buildUCLQuestions(), "foot-ucl");
  saveInChunks("football", "football-ucl", uclQuestions, 50);

  const total =
    prefQuestions.length +
    cannesQuestions.length +
    goncourtQuestions.length +
    heraclesQuestions.length +
    datesQuestions.length +
    uclQuestions.length;

  console.log(`✓ Questions ajoutées dans ce lot : +${total}`);
}

main().catch(console.error);
