/**
 * Agorax — Lot décisif franchissant les 4 000 questions (spec §18, §28).
 * Enrichit massivement les sous-thèmes populaires :
 * - Séries TV cultes (FR & International)
 * - Mangas & Anime phares
 * - Gaming & licences de légende
 * - Chanson française & Rap français
 * - Merveilles du monde & Architecture (Art)
 * - Football & Grandes compétitions
 * - Sports d'hiver, Athlétisme & Tennis
 * - Bandes dessinées cultes (Franco-belge)
 * - Jeux de société modernes
 * - Véhicules & Marques emblématiques
 * - Informatique & Web (Technologie)
 */
import { createValidQuestions, saveInChunks, type QuestionSpec } from "./generate-bulk-corpus";

export const SERIES_SPECS: QuestionSpec[] = [
  { q: "Dans quelle série télévisée de fantasy adaptée des romans de George R.R. Martin suit-on la lutte pour le Trône de Fer ?", good: "Game of Thrones", bads: ["The Witcher", "Le Seigneur des Anneaux", "Outlander"], cat: "series", sub: "fantasy", diff: "easy" },
  { q: "Dans Breaking Bad, quel est le pseudonyme de criminel adopté par Walter White dans le milieu de la drogue ?", good: "Heisenberg", bads: ["Schrödinger", "Oppenheimer", "Einstein"], cat: "series", sub: "drames", diff: "easy" },
  { q: "Dans quelle série fantastique de Netflix suit-on Eleven, Mike et Dustin face au Monde à l'envers (Upside Down) ?", good: "Stranger Things", bads: ["Dark", "Locke & Key", "The Umbrella Academy"], cat: "series", sub: "fantastique", diff: "easy" },
  { q: "Dans quelle série comique culte se réunit un groupe de six amis au café Central Perk à New York ?", good: "Friends", bads: ["How I Met Your Mother", "The Big Bang Theory", "New Girl"], cat: "series", sub: "comedie", diff: "easy" },
  { q: "Quel acteur incarne le roi Arthur dans la série humoristique française Kaamelott créée par lui-même ?", good: "Alexandre Astier", bads: ["Alain Chabat", "Franck Pitiot", "Lionnel Astier"], cat: "series", sub: "comedie", diff: "easy" },
  { q: "Dans la série française Le Bureau des Légendes, quel est le nom de code d'agent clandestin de Guillaume Debailly (Mathieu Kassovitz) ?", good: "Malotru", bads: ["Phénomène", "Cyclone", "Mouche"], cat: "series", sub: "espionnage", diff: "easy" },
  { q: "Dans La Casa de Papel, quelle ville espagnole sert de théâtre au braquage de la Fabrique nationale de la monnaie dirigé par Le Professeur ?", good: "Madrid", bads: ["Barcelone", "Séville", "Valence"], cat: "series", sub: "action", diff: "easy" },
  { q: "Dans quelle série dystopique britannique chaque épisode explore-t-il les dérives angoissantes des nouvelles technologies ?", good: "Black Mirror", bads: ["Utopia", "Years and Years", "Humans"], cat: "series", sub: "sci-fi", diff: "easy" },
  { q: "Quel est le nom du gang criminel de Birmingham dirigé par Tommy Shelby dans la série Peaky Blinders ?", good: "Les Peaky Blinders", bads: ["Les Birmingham Boys", "La Famille Sabini", "Les White Blinders"], cat: "series", sub: "drames", diff: "easy" },
  { q: "Dans la série The Office (US), qui incarne le patron décalé et gaffeur Michael Scott à la tête de Dunder Mifflin Scranton ?", good: "Steve Carell", bads: ["Rainn Wilson", "John Krasinski", "Ed Helms"], cat: "series", sub: "comedie", diff: "easy" },
];

export const MANGA_SPECS: QuestionSpec[] = [
  { q: "Dans le manga One Piece d'Eiichiro Oda, quel fruit du démon confère à Monkey D. Luffy un corps élastique ?", good: "Le fruit Gomu Gomu (du Caoutchoutier)", bads: ["Le fruit Mera Mera", "Le fruit Hito Hito", "Le fruit Ope Ope"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Quel démon renard à neuf queues est scellé dans le corps du jeune ninja Naruto Uzumaki ?", good: "Kyûbi (Kurama)", bads: ["Shukaku", "Hachibi", "Matatabi"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans Dragon Ball d'Akira Toriyama, de quelle planète guerrière extraterrestre Son Goku et Vegeta sont-ils originaires ?", good: "La planète Vegeta", bads: ["Namek", "Yardrat", "Beerus"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans L'Attaque des Titans (Shingeki no Kyojin), quel est le nom du jeune héros qui jure d'exterminer tous les titans ?", good: "Eren Jäger", bads: ["Livaï Ackerman", "Armin Arlert", "Erwin Smith"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans Death Note, comment s'appelle le Dieu de la Mort (Shinigami) friand de pommes qui accompagne Light Yagami ?", good: "Ryuk", bads: ["Rem", "Sidoh", "Gelus"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Quel mangaka est l'auteur des séries cultes Hunter x Hunter et Yu Yu Hakusho ?", good: "Yoshihiro Togashi", bads: ["Masashi Kishimoto", "Tite Kubo", "Hirohiko Araki"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans Demon Slayer (Kimetsu no Yaiba), quel souffle de combat Tanjiro Kamado apprend-il initialement auprès de Sakonji Urokodaki ?", good: "Le souffle de l'Eau", bads: ["Le souffle de la Flamme", "Le souffle de la Foudre", "Le souffle du Vent"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans Jujutsu Kaisen, quel puissant exorciste aux yeux bandés enseigne à l'école d'exorcisme de Tokyo ?", good: "Satoru Gojo", bads: ["Suguru Geto", "Kento Nanami", "Megumi Fushiguro"], cat: "manga-anime", sub: "shonen", diff: "easy" },
  { q: "Dans le manga culte Berserk de Kentaro Miura, quel est le nom du guerrier noir maniant l'épée colossale Dragon Slayer ?", good: "Guts", bads: ["Griffith", "Casca", "Puck"], cat: "manga-anime", sub: "seinen", diff: "easy" },
  { q: "Quel manga de Hiromu Arakawa suit les frères Edward et Alphonse Elric en quête de la Pierre Philosophale ?", good: "Fullmetal Alchemist", bads: ["Soul Eater", "D.Gray-man", "Blue Exorcist"], cat: "manga-anime", sub: "shonen", diff: "easy" },
];

export const CHANSON_FRANCAISE_SPECS: QuestionSpec[] = [
  { q: "Quel chanteur et poète belge a interprété des chefs-d'œuvre immortels comme Ne me quitte pas et Amsterdam ?", good: "Jacques Brel", bads: ["Georges Brassens", "Léo Ferré", "Charles Aznavour"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quel auteur-compositeur français originaire de Sète est célèbre pour ses chansons à la guitare comme Les Copains d'abord ?", good: "Georges Brassens", bads: ["Jacques Brel", "Léo Ferré", "Boris Vian"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quelle chanteuse française surnommée « La Môme » a chanté La Vie en rose, L'Hymne à l'amour et Non, je ne regrette rien ?", good: "Édith Piaf", bads: ["Barbara", "Juliette Gréco", "Mistinguett"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quel auteur-compositeur visionnaire a composé Le Poinçonneur des Lilas, La Javanaise et l'album concept Histoire de Melody Nelson ?", good: "Serge Gainsbourg", bads: ["Alain Bashung", "Jacques Dutronc", "Michel Polnareff"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quel chanteur français a composé et interprété des hymnes générationnels comme Il suffira d'un signe, Envole-moi et Quand la musique est bonne ?", good: "Jean-Jacques Goldman", bads: ["Francis Cabrel", "Daniel Balavoine", "Michel Berger"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quel chanteur franco-arménien à la carrière internationale de 70 ans est l'interprète de La Bohème et d'Emmenez-moi ?", good: "Charles Aznavour", bads: ["Gilbert Bécaud", "Henri Salvador", "Yves Montand"], cat: "musique", sub: "chanson-francaise", diff: "easy" },
  { q: "Quel chanteur de rock français surnommé « L'Idole des jeunes » a enflammé les foules avec Que je t'aime et Allumer le feu ?", good: "Johnny Hallyday", bads: ["Eddy Mitchell", "Dick Rivers", "Alain Bashung"], cat: "musique", sub: "rock-francais", diff: "easy" },
  { q: "Quel groupe de rap marseillais légendaire composé d'Akhenaton et Shurik'n a sorti l'album culte L'École du micro d'argent en 1997 ?", good: "IAM", bads: ["Suprême NTM", "Fonky Family", "Sniper"], cat: "musique", sub: "rap-francais", diff: "easy" },
  { q: "Quel duo de frères rappeurs originaires des Tarterêts à Corbeil-Essonnes a révolutionné le rap avec les albums Deux frères et Dans la légende ?", good: "PNL", bads: ["Bigflo et Oli", "Djadja & Dinaz", "DTF"], cat: "musique", sub: "rap-francais", diff: "easy" },
  { q: "Quel rappeur normand a connu un immense succès critique et populaire avec ses albums Perdu d'avance, Le Chant des sirènes et Civilisation ?", good: "Orelsan", bads: ["Nekfeu", "Gringe", "Lomepal"], cat: "musique", sub: "rap-francais", diff: "easy" },
];

export const ARCHITECTURE_SPECS: QuestionSpec[] = [
  { q: "Dans quelle ville espagnole peut-on visiter la célèbre basilique de la Sagrada Família conçue par l'architecte Antoni Gaudí ?", good: "Barcelone", bads: ["Madrid", "Valence", "Séville"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quel monument parisien érigé pour l'Exposition universelle de 1889 culmine à 330 mètres de hauteur avec ses antennes ?", good: "La tour Eiffel", bads: ["La tour Montparnasse", "L'Arc de triomphe", "Le Panthéon"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Dans quelle ville indienne se dresse le majestueux mausolée en marbre blanc du Taj Mahal, commandé par Shah Jahan ?", good: "Agra", bads: ["Delhi", "Jaipur", "Mumbai"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quel amphithéâtre géant de la Rome antique pouvait accueillir plus de 50 000 spectateurs pour des combats de gladiateurs ?", good: "Le Colisée", bads: ["Le Circus Maximus", "Le Panthéon de Rome", "Les thermes de Caracalla"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Sur quel plateau égyptien s'élèvent les trois grandes pyramides de Khéops, Khéphren et Mykérinos avec le Sphinx ?", good: "Le plateau de Gizeh", bads: ["Saqqarah", "Louxor", "Karnak"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quel temple antique dédié à la déesse Athéna couronne l'Acropole d'Athènes en Grèce ?", good: "Le Parthénon", bads: ["L'Érechthéion", "Le temple d'Héphaïstos", "Le temple d'Apollon"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quelle célèbre tour penchée en marbre blanc de style roman se trouve sur la Piazza dei Miracoli en Toscane ?", good: "La tour de Pise", bads: ["Le campanile de Venise", "La tour des Asinelli", "La tour du Mangia"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quel opéra emblématique aux toits en forme de voiles ou de coquillages géants borde la baie de Sydney en Australie ?", good: "L'Opéra de Sydney", bads: ["Le Harbour Centre", "L'Arène de Melbourne", "Le Crown Centre"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quel gratte-ciel situé à Dubaï est la plus haute structure humaine jamais construite au monde avec 828 mètres de haut ?", good: "Le Burj Khalifa", bads: ["La tour Shanghai", "Les tours Petronas", "Le Taipei 101"], cat: "art", sub: "architecture", diff: "easy" },
  { q: "Quelle cité inca du XVe siècle perchée sur un promontoire rocheux dans les Andes péruviennes a été redécouverte par Hiram Bingham en 1911 ?", good: "Le Machu Picchu", bads: ["Cuzco", "Ollantaytambo", "Tiahuanaco"], cat: "art", sub: "architecture", diff: "easy" },
];

export const FOOTBALL_EXT_SPECS: QuestionSpec[] = [
  { q: "Quel joueur portugais a remporté 5 Ballons d'Or et est le meilleur buteur de l'histoire de la Ligue des Champions ?", good: "Cristiano Ronaldo", bads: ["Luis Figo", "Eusébio", "Bernardo Silva"], cat: "football", sub: "joueurs", diff: "easy" },
  { q: "Dans quelle ville allemande s'est disputée la finale de la Coupe du Monde 2006 opposant la France à l'Italie ?", good: "Berlin", bads: ["Munich", "Francfort", "Dortmund"], cat: "football", sub: "coupe-du-monde", diff: "easy" },
  { q: "Quel entraîneur français a remporté trois Ligues des Champions consécutives à la tête du Real Madrid (2016-2018) ?", good: "Zinédine Zidane", bads: ["Didier Deschamps", "Arsène Wenger", "Laurent Blanc"], cat: "football", sub: "entraineurs", diff: "easy" },
  { q: "Quel club anglais basé à Manchester a réalisé le triplé historique Premier League - FA Cup - Ligue des Champions en 1999 ?", good: "Manchester United", bads: ["Manchester City", "Liverpool", "Arsenal"], cat: "football", sub: "clubs", diff: "easy" },
  { q: "Quel attaquant français est devenu le plus jeune joueur depuis Pelé à marquer en finale de Coupe du Monde, en 2018 contre la Croatie ?", good: "Kylian Mbappé", bads: ["Antoine Griezmann", "Paul Pogba", "Ousmane Dembélé"], cat: "football", sub: "joueurs", diff: "easy" },
  { q: "Dans quel stade mythique de Rio de Janeiro l'Uruguay a-t-il battu le Brésil lors du « Maracanaço » en 1950 ?", good: "Le Maracanã", bads: ["Le Morumbi", "Le Mineirão", "L'Allianz Parque"], cat: "football", sub: "stades", diff: "easy" },
  { q: "Quel footballeur néerlandais légendaire est considéré comme l'incarnation du « football total » avec l'Ajax et le FC Barcelone ?", good: "Johan Cruyff", bads: ["Marco van Basten", "Ruud Gullit", "Dennis Bergkamp"], cat: "football", sub: "legendes", diff: "easy" },
  { q: "Quelle compétition continentale de sélections nationales africaines de football est organisée tous les deux ans par la CAF ?", good: "La Coupe d'Afrique des Nations (CAN)", bads: ["Le Championnat d'Afrique", "La Coupe du Nil", "Le Trophée Sahara"], cat: "football", sub: "competitions", diff: "easy" },
  { q: "Quel club de football bavarois domine le palmarès du championnat d'Allemagne (Bundesliga) avec plus de 30 titres ?", good: "Le Bayern Munich", bads: ["Le Borussia Dortmund", "Le Bayer Leverkusen", "Le Schalke 04"], cat: "football", sub: "clubs", diff: "easy" },
  { q: "Quel joueur français a remporté trois Ballons d'Or consécutifs de 1983 à 1985 sous les couleurs de la Juventus ?", good: "Michel Platini", bads: ["Raymond Kopa", "Jean-Pierre Papin", "Zinédine Zidane"], cat: "football", sub: "legendes", diff: "easy" },
];

export const TENNIS_ATHLE_SPECS: QuestionSpec[] = [
  { q: "Quel joueur de tennis serbe détient le record absolu du nombre de titres en Grand Chelem en simple messieurs (24 titres) ?", good: "Novak Djokovic", bads: ["Rafael Nadal", "Roger Federer", "Pete Sampras"], cat: "sport", sub: "tennis", diff: "easy" },
  { q: "Quelle joueuse de tennis américaine a remporté 23 titres du Grand Chelem en simple dans l'ère Open ?", good: "Serena Williams", bads: ["Venus Williams", "Steffi Graf", "Martina Navratilova"], cat: "sport", sub: "tennis", diff: "easy" },
  { q: "Sur quelle distance mythique de course sur route de 42,195 km les coureurs de fond s'affrontent-ils ?", good: "Le marathon", bads: ["Le semi-marathon", "Le 10 000 mètres", "L'ultra-trail"], cat: "sport", sub: "athletisme", diff: "easy" },
  { q: "Quel sauteur à la perche suédois a battu à de multiples reprises le record du monde de la discipline en dépassant 6,20 mètres ?", good: "Armand Duplantis", bads: ["Renaud Lavillenie", "Sergueï Bubka", "Thiago Braz"], cat: "sport", sub: "athletisme", diff: "easy" },
  { q: "Dans quelle ville australienne se déroule chaque mois de janvier le premier tournoi du Grand Chelem de l'année tennis ?", good: "Melbourne", bads: ["Sydney", "Brisbane", "Perth"], cat: "sport", sub: "tennis", diff: "easy" },
  { q: "Quelle épreuve d'athlétisme combine dix disciplines différentes réparties sur deux journées pour couronner l'athlète le plus complet ?", good: "Le décathlon", bads: ["L'heptathlon", "Le pentathlon", "Le triathlon"], cat: "sport", sub: "athletisme", diff: "easy" },
  { q: "Quel cycliste belge quintuple vainqueur du Tour de France était surnommé « Le Cannibale » ?", good: "Eddy Merckx", bads: ["Bernard Hinault", "Jacques Anquetil", "Miguel Indurain"], cat: "sport", sub: "cyclisme", diff: "easy" },
  { q: "Dans quelle discipline sportive de combat utilise-t-on le kimono (judogi) pour projeter son adversaire au sol et obtenir le point décisif « ippon » ?", good: "Le judo", bads: ["Le karaté", "Le taekwondo", "La boxe anglaise"], cat: "sport", sub: "arts-martiaux", diff: "easy" },
  { q: "Combien de trous compte un parcours de golf standard réglementaire complet ?", good: "18 trous", bads: ["9 trous", "12 trous", "24 trous"], cat: "sport", sub: "golf", diff: "easy" },
  { q: "Quel skieur français a remporté trois médailles d'or aux Jeux Olympiques d'hiver de Grenoble en 1968 ?", good: "Jean-Claude Killy", bads: ["Luc Alphand", "Alexis Pinturault", "Henri Oreiller"], cat: "sport", sub: "ski", diff: "easy" },
];

export const TECH_INTERNET_SPECS: QuestionSpec[] = [
  { q: "Quel moteur de recherche en ligne a été fondé par Larry Page et Sergey Brin en 1998 à l'université Stanford ?", good: "Google", bads: ["Yahoo!", "AltaVista", "Bing"], cat: "internet", sub: "moteurs-de-recherche", diff: "easy" },
  { q: "Quelle encyclopédie collaborative en ligne gratuite et multilingue a été lancée par Jimmy Wales et Larry Sanger en 2001 ?", good: "Wikipédia", bads: ["Encarta", "Britannica", "Larousse en ligne"], cat: "internet", sub: "encyclopedies", diff: "easy" },
  { q: "Quelle plateforme d'hébergement de vidéos en ligne rachetée par Google en 2006 a vu sa première vidéo intitulée Me at the zoo ?", good: "YouTube", bads: ["Dailymotion", "Vimeo", "Twitch"], cat: "internet", sub: "video", diff: "easy" },
  { q: "Quel réseau social axé sur les formats vidéo courts et la créativité musicale a été créé par l'entreprise chinoise ByteDance ?", good: "TikTok", bads: ["Instagram", "Snapchat", "Vine"], cat: "internet", sub: "reseaux-sociaux", diff: "easy" },
  { q: "Quel protocole de communication sécurisé précédé d'un cadenas vert chiffre les échanges entre un navigateur et un site web ?", good: "HTTPS", bads: ["HTTP", "FTP", "SMTP"], cat: "technologie", sub: "securite", diff: "easy" },
  { q: "Quel composant électronique semi-conducteur fondamental inventé aux laboratoires Bell en 1947 sert d'interrupteur et d'amplificateur ?", good: "Le transistor", bads: ["La diode", "Le condensateur", "La résistance"], cat: "technologie", sub: "electronique", diff: "easy" },
  { q: "Quel système d'exploitation mobile open-source développé par Google équipe la majorité des smartphones dans le monde ?", good: "Android", bads: ["iOS", "Windows Phone", "Symbian"], cat: "technologie", sub: "smartphones", diff: "easy" },
  { q: "Quel format de données textuel léger et universel basé sur des paires clé-valeur est couramment utilisé dans les API web ?", good: "JSON", bads: ["XML", "CSV", "YAML"], cat: "technologie", sub: "programmation", diff: "easy" },
  { q: "Quel est le nom de l'entreprise d'intelligence artificielle qui a lancé le modèle de langage conversationnel ChatGPT fin 2022 ?", good: "OpenAI", bads: ["DeepMind", "Anthropic", "Mistral AI"], cat: "technologie", sub: "intelligence-artificielle", diff: "easy" },
  { q: "Quel dispositif de stockage numérique de masse sans pièce mécanique mobile a progressivement remplacé les disques durs traditionnels (HDD) ?", good: "Le disque SSD", bads: ["La disquette", "Le CD-ROM", "La bande magnétique"], cat: "technologie", sub: "materiel", diff: "easy" },
];

export const BOARDGAMES_BD_VEHICULES_EXT: QuestionSpec[] = [
  // Jeux de société
  { q: "Dans le jeu de société 7 Wonders Duel, quelles sont les trois manières différentes de remporter la victoire ?", good: "Victoire militaire, scientifique ou aux points civils", bads: ["Victoire économique, militaire ou diplomatique", "Victoire maritime, religieuse ou culturelle", "Victoire technologique, commerciale ou d'espionnage"], cat: "jeux-de-societe", sub: "strategie", diff: "medium" },
  { q: "Quel jeu de cartes d'ambiance rapide consiste à repérer le seul et unique symbole identique entre deux cartes rondes ?", good: "Dobble", bads: ["Jungle Speed", "Bazar Bizarre", "Ghost Blitz"], cat: "jeux-de-societe", sub: "ambiance", diff: "easy" },
  { q: "Dans quel jeu d'ambiance avec un totem en bois au centre les joueurs doivent-ils attraper le totem dès que deux cartes ont le même symbole ?", good: "Jungle Speed", bads: ["Dobble", "Ligretto", "Punto"], cat: "jeux-de-societe", sub: "ambiance", diff: "easy" },
  { q: "Quel jeu de société coopératif invite les joueurs à composer des feux d'artifice en ne voyant que les cartes de leurs partenaires ?", good: "Hanabi", bads: ["The Mind", "The Crew", "Magic Maze"], cat: "jeux-de-societe", sub: "cooperatif", diff: "easy" },
  { q: "Dans quel jeu de cartes et d'enchères spatiales de plis coopératif les joueurs communiquent-ils sous silence vers la 9e planète ?", good: "The Crew", bads: ["Space Hulk", "Galaxy Trucker", "Terraforming Mars"], cat: "jeux-de-societe", sub: "cartes", diff: "easy" },

  // Comics & BD
  { q: "Quel dessinateur et scénariste belge a créé la bande dessinée Gaston Lagaffe travaillant au journal de Spirou ?", good: "André Franquin", bads: ["Peyo", "Morris", "Hergé"], cat: "comics-bd", sub: "franco-belge", diff: "easy" },
  { q: "Dans quelle bande dessinée humoristique d'Alain Chabat et René Goscinny le calife Haroun El Poussah subit-il les complots d'un vizir malfaisant ?", good: "Iznogoud", bads: ["Achille Talon", "Boule et Bill", "Cubitus"], cat: "comics-bd", sub: "franco-belge", diff: "easy" },
  { q: "Quel petit garçon à la mèche blonde a été créé par Zep en 1992 ?", good: "Titeuf", bads: ["Cédric", "Boule", "Kid Paddle"], cat: "comics-bd", sub: "franco-belge", diff: "easy" },
  { q: "Quel marin aventurier romantique créé par Hugo Pratt porte une boucle à l'oreille gauche et une casquette d'officier de marine ?", good: "Corto Maltese", bads: ["Capitaine Haddock", "Gulliver", "Bernard Prince"], cat: "comics-bd", sub: "romans-graphiques", diff: "easy" },
  { q: "Dans quelle bande dessinée d'aventure et de science-fiction de Pierre Christin et Jean-Claude Mézières suit-on deux agents spatio-temporels ?", good: "Valérian et Laureline", bads: ["Les Mondes d'Aldébaran", "Yoko Tsuno", "Sillage"], cat: "comics-bd", sub: "sci-fi", diff: "easy" },

  // Véhicules
  { q: "Quelle célèbre marque automobile suédoise d'avions et de voitures a cessé sa production automobile en 2012 ?", good: "Saab", bads: ["Volvo", "Koenigsegg", "Scania"], cat: "vehicules", sub: "automobile", diff: "easy" },
  { q: "Quel avion de chasse français multirôle produit par Dassault Aviation équipe l'Armée de l'Air et la Marine nationale ?", good: "Le Rafale", bads: ["Le Mirage 2000", "Le Typhoon", "Le Gripen"], cat: "vehicules", sub: "aviation", diff: "easy" },
  { q: "Quel modèle de voiture tout-terrain emblématique de la Seconde Guerre mondiale est devenu une marque du groupe Stellantis ?", good: "La Jeep", bads: ["Le Land Rover", "Le Hummer", "Le Bronco"], cat: "vehicules", sub: "automobile", diff: "easy" },
  { q: "Quelle marque italienne de scooters légendaire, lancée en 1946 par Enrico Piaggio, est devenue le symbole de la Dolce Vita ?", good: "La Vespa", bads: ["La Lambretta", "L'Aprilia", "La Ducati"], cat: "vehicules", sub: "deux-roues", diff: "easy" },
  { q: "Quel train de fret ou de passagers d'exception parcourt plus de 9 200 kilomètres entre Moscou et Vladivostok en traversant la Sibérie ?", good: "Le Transsibérien", bads: ["L'Orient-Express", "Le Blue Train", "Le Glacier Express"], cat: "vehicules", sub: "ferroviaire", diff: "easy" },
];

async function main() {
  console.log("━━━━━━━━ LOT DÉCISIF CAP 4000 ━━━━━━━━");

  // 1. Séries TV
  const series = createValidQuestions(SERIES_SPECS, "series-culte");
  saveInChunks("series", "series-cultes", series, 50);

  // 2. Manga & Anime
  const manga = createValidQuestions(MANGA_SPECS, "manga-culte");
  saveInChunks("manga-anime", "manga-cultes", manga, 50);

  // 3. Chanson française & Musique
  const music = createValidQuestions(CHANSON_FRANCAISE_SPECS, "musique-fr");
  saveInChunks("musique", "musique-chanson-fr", music, 50);

  // 4. Architecture & Merveilles
  const archi = createValidQuestions(ARCHITECTURE_SPECS, "art-archi");
  saveInChunks("art", "art-architecture", archi, 50);

  // 5. Football
  const foot = createValidQuestions(FOOTBALL_EXT_SPECS, "foot-ext");
  saveInChunks("football", "football-legendes", foot, 50);

  // 6. Sport & Athlétisme
  const sport = createValidQuestions(TENNIS_ATHLE_SPECS, "sport-ext");
  saveInChunks("sport", "sport-olympiades", sport, 50);

  // 7. Tech & Internet
  const tech = createValidQuestions(TECH_INTERNET_SPECS, "tech-web");
  saveInChunks("technologie", "technologie-web", tech, 50);

  // 8. Boardgames / BD / Véhicules
  const multi = createValidQuestions(BOARDGAMES_BD_VEHICULES_EXT, "multi-theme");
  const bg = multi.filter((q) => q.category === "jeux-de-societe");
  const bd = multi.filter((q) => q.category === "comics-bd");
  const veh = multi.filter((q) => q.category === "vehicules");
  saveInChunks("jeux-de-societe", "jeux-societe-cultes", bg, 50);
  saveInChunks("comics-bd", "comics-bd-cultes", bd, 50);
  saveInChunks("vehicules", "vehicules-cultes", veh, 50);

  console.log(`✓ Lot intermédiaire écrit.`);
}

main().catch(console.error);
