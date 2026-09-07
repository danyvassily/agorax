/**
 * Agorax — Lot final de questions pour franchir le seuil des 4 000 questions
 * Utilise le générateur et validateur Zod éprouvé (createValidQuestions, saveInChunks).
 */
import { createValidQuestions, saveInChunks, type QuestionSpec } from "./generate-bulk-corpus";
import type { QuestionCategory } from "../../src/lib/questions/schema";

const FINISH_LINE_SPECS: QuestionSpec[] = [
  // ━━━ SPORT : JEUX OLYMPIQUES (25) ━━━
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Dans quelle ville se sont déroulés les premiers Jeux olympiques de l'ère moderne en 1896 ?",
    good: "Athènes",
    bads: ["Rome", "Paris", "Londres"],
    exp: "Les premiers Jeux olympiques modernes ont été organisés à Athènes en 1896 à l'initiative de Pierre de Coubertin."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Quelle ville a accueilli les Jeux olympiques d'été de 2012 ?",
    good: "Londres",
    bads: ["Paris", "Madrid", "Pékin"],
    exp: "Londres a organisé les Jeux olympiques d'été de 2012, devenant la première ville à les accueillir trois fois (1908, 1948, 2012)."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Quelle ville brésilienne a accueilli les Jeux olympiques d'été en 2016 ?",
    good: "Rio de Janeiro",
    bads: ["São Paulo", "Brasília", "Salvador"],
    exp: "Rio de Janeiro a été la première ville d'Amérique du Sud à accueillir les Jeux olympiques d'été en 2016."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "En quelle année la ville de Barcelone a-t-elle organisé les Jeux olympiques d'été ?",
    good: "1992",
    bads: ["1988", "1996", "2000"],
    exp: "Les Jeux olympiques de Barcelone se sont déroulés en 1992 et ont marqué la consécration de la Dream Team américaine de basket."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Quelle ville a accueilli les Jeux olympiques d'été du centenaire en 1996 ?",
    good: "Atlanta",
    bads: ["Athènes", "Los Angeles", "Chicago"],
    exp: "Atlanta aux États-Unis a accueilli les Jeux olympiques du centenaire en 1996, devançant la candidature d'Athènes."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Quelle ville australienne a organisé les Jeux olympiques d'été de l'an 2000 ?",
    good: "Sydney",
    bads: ["Melbourne", "Brisbane", "Perth"],
    exp: "Sydney a accueilli les Jeux olympiques du millénaire en 2000, réputés pour leur ambiance exceptionnelle."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Dans quel pays la ville de Pékin a-t-elle accueilli les Jeux olympiques d'été de 2008 ?",
    good: "Chine",
    bads: ["Japon", "Corée du Sud", "Singapour"],
    exp: "Pékin en Chine a accueilli les JO d'été en 2008 dans des enceintes emblématiques comme le Nid d'oiseau."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Dans quelle ville allemande les Jeux olympiques d'été de 1972 ont-ils été organisés ?",
    good: "Munich",
    bads: ["Berlin", "Francfort", "Hambourg"],
    exp: "Munich a accueilli les Jeux olympiques d'été de 1972, marqués par la prise d'otages d'athlètes israéliens."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Quelle métropole canadienne a été le théâtre des Jeux olympiques d'été de 1976 ?",
    good: "Montréal",
    bads: ["Toronto", "Vancouver", "Calgary"],
    exp: "Montréal a accueilli les JO d'été de 1976, où Nadia Comăneci a obtenu la première note parfaite de 10 en gymnastique."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Quelle ville a accueilli les Jeux olympiques d'été de 1988 en Asie ?",
    good: "Séoul",
    bads: ["Tokyo", "Bangkok", "Taipei"],
    exp: "Séoul a organisé les Jeux d'été de 1988, marquant le retour d'une large participation internationale."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'hard',
    q: "Quelle ville finlandaise a été l'hôte des Jeux olympiques d'été de 1952 ?",
    good: "Helsinki",
    bads: ["Tampere", "Turku", "Espoo"],
    exp: "Helsinki a accueilli les JO en 1952, initialement prévus pour 1940 mais annulés à cause de la Seconde Guerre mondiale."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Quelle ville a accueilli les premiers Jeux olympiques d'hiver de l'histoire en 1924 ?",
    good: "Chamonix",
    bads: ["Saint-Moritz", "Grenoble", "Innsbruck"],
    exp: "Chamonix-Mont-Blanc en France a accueilli la première édition des Jeux olympiques d'hiver en 1924."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Dans quelle ville française se sont tenus les Jeux olympiques d'hiver de 1968 ?",
    good: "Grenoble",
    bads: ["Albertville", "Chamonix", "Nice"],
    exp: "Grenoble a accueilli les Jeux d'hiver en 1968, immortalisés par les exploits de Jean-Claude Killy qui y remporta trois médailles d'or."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'medium',
    q: "Quelle commune de Savoie a accueilli les Jeux olympiques d'hiver en 1992 ?",
    good: "Albertville",
    bads: ["Chamonix", "Grenoble", "Annecy"],
    exp: "Albertville a accueilli les XVIes Jeux olympiques d'hiver en février 1992 en région Auvergne-Rhône-Alpes."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'easy',
    q: "Combien d'anneaux entrelacés composent le symbole officiel du mouvement olympique ?",
    good: "5",
    bads: ["4", "6", "7"],
    exp: "Le drapeau olympique comprend 5 anneaux entrelacés représentant l'union des cinq continents du monde."
  },
  {
    cat: 'sport',
    sub: 'athletisme',
    diff: 'easy',
    q: "Quelle épreuve de course à pied de fond mesure traditionnellement 42,195 kilomètres ?",
    good: "Le marathon",
    bads: ["Le semi-marathon", "Le 10 000 mètres", "Le cross-country"],
    exp: "Le marathon mesure officiellement 42,195 km depuis les Jeux olympiques de Londres en 1908."
  },
  {
    cat: 'sport',
    sub: 'tennis',
    diff: 'easy',
    q: "Sur quelle surface se dispute le tournoi de tennis du Grand Chelem de Roland-Garros ?",
    good: "Terre battue",
    bads: ["Gazon", "Dur synthétique", "Moquette"],
    exp: "Roland-Garros est le seul tournoi du Grand Chelem disputé sur terre battue ocre."
  },
  {
    cat: 'sport',
    sub: 'tennis',
    diff: 'easy',
    q: "Sur quelle surface naturelle se joue le tournoi de tennis de Wimbledon à Londres ?",
    good: "Gazon",
    bads: ["Terre battue", "Béton", "Terre synthétique"],
    exp: "Wimbledon est le plus ancien tournoi de tennis au monde et se joue sur gazon naturel."
  },
  {
    cat: 'sport',
    sub: 'tennis',
    diff: 'medium',
    q: "Dans quelle ville australienne se tient chaque année le premier tournoi du Grand Chelem de tennis ?",
    good: "Melbourne",
    bads: ["Sydney", "Brisbane", "Perth"],
    exp: "L'Open d'Australie se tient à Melbourne Park au mois de janvier sur court en dur."
  },
  {
    cat: 'sport',
    sub: 'tennis',
    diff: 'medium',
    q: "Dans quel quartier de New York se dispute chaque année le tournoi de tennis de l'US Open ?",
    good: "Flushing Meadows",
    bads: ["Central Park", "Brooklyn Heights", "Harlem"],
    exp: "L'US Open se tient au centre national de tennis Billie Jean King à Flushing Meadows-Corona Park dans le Queens."
  },
  {
    cat: 'sport',
    sub: 'athletisme',
    diff: 'easy',
    q: "Quel sprinteur jamaïcain détient les records du monde du 100 mètres et du 200 mètres ?",
    good: "Usain Bolt",
    bads: ["Tyson Gay", "Yohan Blake", "Asafa Powell"],
    exp: "Usain Bolt a établi les records du monde du 100 m (9s58) et du 200 m (19s19) lors des Mondiaux de Berlin en 2009."
  },
  {
    cat: 'sport',
    sub: 'natation',
    diff: 'medium',
    q: "Quel nageur américain a remporté un record historique de 23 médailles d'or olympiques ?",
    good: "Michael Phelps",
    bads: ["Mark Spitz", "Ryan Lochte", "Ian Thorpe"],
    exp: "Michael Phelps est le sportif le plus titré de l'histoire olympique avec 28 médailles dont 23 d'or entre 2004 et 2016."
  },
  {
    cat: 'sport',
    sub: 'jeux-olympiques',
    diff: 'hard',
    q: "À quelle édition des Jeux olympiques d'été le skateboard et le surf ont-ils fait leur entrée inaugurale ?",
    good: "Tokyo 2020",
    bads: ["Rio 2016", "Londres 2012", "Pékin 2008"],
    exp: "Le skateboard, le surf et l'escalade sportive ont intégré le programme olympique aux Jeux de Tokyo organisés en 2021."
  },
  {
    cat: 'sport',
    sub: 'athletisme',
    diff: 'easy',
    q: "Quel athlète est monté sur le podium olympique en sautant pour la première fois sur le dos en 1968 ?",
    good: "Dick Fosbury",
    bads: ["Javier Sotomayor", "Carl Lewis", "Bob Beamon"],
    exp: "Dick Fosbury a révolutionné le saut en hauteur aux JO de Mexico en 1968 en franchissant la barre sur le dos."
  },
  {
    cat: 'sport',
    sub: 'athletisme',
    diff: 'medium',
    q: "Quel sauteur en longueur américain a réussi un bond légendaire à 8,90 m aux Jeux olympiques de 1968 ?",
    good: "Bob Beamon",
    bads: ["Carl Lewis", "Mike Powell", "Jesse Owens"],
    exp: "Bob Beamon a réalisé un saut historique à 8,90 mètres lors des Jeux de Mexico en 1968."
  },

  // ━━━ FOOTBALL : COUPES DU MONDE & TROPHÉES (20) ━━━
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Quel pays a accueilli et remporté la toute première Coupe du monde de la FIFA en 1930 ?",
    good: "L'Uruguay",
    bads: ["L'Argentine", "Le Brésil", "L'Italie"],
    exp: "L'Uruguay a organisé et gagné la première édition de la Coupe du monde en battant l'Argentine en finale (4-2)."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Quel pays détient le record du nombre de victoires en Coupe du monde masculine avec 5 étoiles ?",
    good: "Le Brésil",
    bads: ["L'Allemagne", "L'Italie", "L'Argentine"],
    exp: "La Seleção brésilienne a remporté le Mondial à cinq reprises (1958, 1962, 1970, 1994, 2002)."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Quel pays a remporté la Coupe du monde de football 2010 organisée en Afrique du Sud ?",
    good: "L'Espagne",
    bads: ["Les Pays-Bas", "L'Allemagne", "Le Brésil"],
    exp: "L'Espagne a conquis son premier titre mondial en 2010 grâce à un but d'Andrés Iniesta en prolongation face aux Pays-Bas."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Quel pays a remporté la Coupe du monde de football 2014 en s'imposant au Brésil ?",
    good: "L'Allemagne",
    bads: ["L'Argentine", "Les Pays-Bas", "Le Brésil"],
    exp: "L'Allemagne a remporté son quatrième trophée mondial en 2014 en battant l'Argentine 1-0 en finale au Maracanã."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "En quelle année l'équipe de France a-t-elle remporté sa première Coupe du monde à domicile ?",
    good: "1998",
    bads: ["1984", "2006", "2018"],
    exp: "La France a battu le Brésil 3-0 en finale le 12 juillet 1998 au Stade de France avec un doublé de Zidane et un but de Petit."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Dans quel pays s'est déroulée la Coupe du monde de football 2018 remportée par la France ?",
    good: "Russie",
    bads: ["Brésil", "Afrique du Sud", "Qatar"],
    exp: "L'édition 2018 s'est tenue en Russie et la France y a battu la Croatie 4-2 en finale à Moscou."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'easy',
    q: "Quelle nation a remporté la finale de la Coupe du monde de football 2022 au Qatar ?",
    good: "L'Argentine",
    bads: ["La France", "La Croatie", "Le Maroc"],
    exp: "L'Argentine menée par Lionel Messi a remporté le titre mondial 2022 aux tirs au but face à la France."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'medium',
    q: "Quel pays a accueilli la Coupe du monde en 1966 et y a remporté son unique titre mondial à ce jour ?",
    good: "L'Angleterre",
    bads: ["La Suède", "L'Italie", "Le Chili"],
    exp: "L'Angleterre a triomphé à domicile en 1966 en battant la RFA en finale à Wembley (4-2 a.p.)."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'medium',
    q: "Quelle nation a atteint trois finales de Coupe du monde (1974, 1978, 2010) sans jamais en remporter une ?",
    good: "Les Pays-Bas",
    bads: ["La Hongrie", "La Pologne", "La Suède"],
    exp: "Les Pays-Bas sont tristement célèbres pour avoir perdu trois finales de Coupe du monde sans jamais décrocher le trophée."
  },
  {
    cat: 'football',
    sub: 'coupe-du-monde',
    diff: 'hard',
    q: "Dans quel pays d'Amérique du Sud s'est déroulée la Coupe du monde de football de 1962 ?",
    good: "Chili",
    bads: ["Pérou", "Colombie", "Argentine"],
    exp: "La septième édition de la Coupe du monde de football s'est tenue au Chili en 1962, remportée par le Brésil."
  },
  {
    cat: 'football',
    sub: 'records',
    diff: 'medium',
    q: "Quel attaquant français détient le record du nombre de buts inscrits en une seule Coupe du monde (13 buts en 1958) ?",
    good: "Just Fontaine",
    bads: ["Raymond Kopa", "Michel Platini", "Jean-Pierre Papin"],
    exp: "Just Fontaine a inscrit un total inégalé de 13 buts en 6 matchs lors de la Coupe du monde 1958 en Suède."
  },
  {
    cat: 'football',
    sub: 'regles',
    diff: 'easy',
    q: "Combien de joueurs d'une même équipe sont présents simultanément sur le terrain au coup d'envoi d'un match ?",
    good: "11",
    bads: ["10", "12", "9"],
    exp: "Chaque équipe de football aligne 11 joueurs sur le terrain au début de la rencontre, dont un gardien de but."
  },
  {
    cat: 'football',
    sub: 'ligue-des-champions',
    diff: 'easy',
    q: "Quel club espagnol détient le record absolu de victoires en Ligue des champions de l'UEFA ?",
    good: "Le Real Madrid",
    bads: ["Le FC Barcelone", "L'Atlético de Madrid", "Le Séville FC"],
    exp: "Le Real Madrid a conquis plus d'une dizaine de Ligues des champions, devançant tous les autres clubs européens."
  },
  {
    cat: 'football',
    sub: 'ligue-des-champions',
    diff: 'medium',
    q: "Quel club italien a remporté la Ligue des champions à sept reprises dans son histoire ?",
    good: "L'AC Milan",
    bads: ["La Juventus", "L'Inter Milan", "L'AS Rome"],
    exp: "L'AC Milan est le deuxième club le plus titré de la compétition derrière le Real Madrid avec 7 sacres européens."
  },
  {
    cat: 'football',
    sub: 'legendes',
    diff: 'medium',
    q: "Quel joueur est le seul de l'histoire à avoir remporté 3 Coupes du monde en tant que joueur (1958, 1962, 1970) ?",
    good: "Pelé",
    bads: ["Garrincha", "Maradona", "Zidane"],
    exp: "Le 'Roi' Pelé est l'unique footballeur de l'histoire triple champion du monde avec le Brésil."
  },
  {
    cat: 'football',
    sub: 'euro',
    diff: 'medium',
    q: "En quelle année l'Euro de football a-t-il été remporté par la Grèce contre toute attente ?",
    good: "2004",
    bads: ["2000", "2008", "1996"],
    exp: "La Grèce a créé l'une des plus grandes surprises du football moderne en battant le Portugal chez lui en finale de l'Euro 2004."
  },
  {
    cat: 'football',
    sub: 'recompenses',
    diff: 'medium',
    q: "Quel trophée individuel prestigieux créé par France Football récompense le meilleur joueur de l'année ?",
    good: "Le Ballon d'Or",
    bads: ["Le Soulier d'Or", "Le Trophée Kopa", "Le Trophée Yachine"],
    exp: "Le Ballon d'Or est attribué depuis 1956 par le magazine France Football aux meilleurs joueurs de la planète."
  },
  {
    cat: 'football',
    sub: 'recompenses',
    diff: 'hard',
    q: "Qui a été le tout premier lauréat du Ballon d'Or en 1956 ?",
    good: "Stanley Matthews",
    bads: ["Alfredo Di Stéfano", "Raymond Kopa", "Ferenc Puskás"],
    exp: "L'ailier anglais Stanley Matthews a remporté le premier Ballon d'Or en 1956 sous les couleurs de Blackpool."
  },
  {
    cat: 'football',
    sub: 'stades',
    diff: 'medium',
    q: "Quel stade mythique de Rio de Janeiro a accueilli les finales de Coupe du monde 1950 et 2014 ?",
    good: "Le Maracanã",
    bads: ["Le Morumbi", "L'Allianz Parque", "L'Itaquerão"],
    exp: "Le stade Maracanã est l'arène mythique du football brésilien inaugurée pour la Coupe du monde 1950."
  },
  {
    cat: 'football',
    sub: 'stades',
    diff: 'medium',
    q: "Dans quel stade londonien célèbre l'équipe d'Angleterre dispute-t-elle traditionnellement ses rencontres à domicile ?",
    good: "Wembley",
    bads: ["Emirates Stadium", "Stamford Bridge", "Old Trafford"],
    exp: "Wembley Stadium est l'enceinte nationale emblématique du football anglais, dotée de son arche caractéristique."
  },

  // ━━━ GÉOGRAPHIE : SOMMETS & MONTAGNES (25) ━━━
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'easy',
    q: "Quel est le point culminant de la chaîne de l'Himalaya et de la Terre, s'élevant à 8 848 mètres ?",
    good: "L'Everest",
    bads: ["Le K2", "L'Annapurna", "Le Makalu"],
    exp: "L'Everest (ou Sagarmatha / Chomolungma) est la plus haute montagne du monde, située à la frontière népalo-tibétaine."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le deuxième plus haut sommet de la planète, situé dans le massif du Karakoram à 8 611 mètres ?",
    good: "Le K2",
    bads: ["Le Kangchenjunga", "Le Lhotse", "Le Cho Oyu"],
    exp: "Le K2, surnommé la montagne sauvage, culmine à 8 611 mètres entre le Pakistan et la Chine."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'hard',
    q: "Quel est le troisième plus haut sommet du monde, situé sur la frontière entre l'Inde et le Népal ?",
    good: "Le Kangchenjunga",
    bads: ["Le Lhotse", "Le Dhaulagiri", "Le Manaslu"],
    exp: "Le Kangchenjunga culmine à 8 586 mètres et constitue le point le plus élevé de l'Inde."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'easy',
    q: "Quel est le plus haut sommet de la chaîne des Alpes et d'Europe occidentale avec ses 4 808 mètres ?",
    good: "Le Mont Blanc",
    bads: ["Le Cervin", "Le Mont Rose", "La Jungfrau"],
    exp: "Le mont Blanc culmine à environ 4 808 mètres dans les Alpes à la frontière franco-italienne."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel sommet d'aspect pyramidal reconnaissable culmine à 4 478 m entre la Suisse et l'Italie ?",
    good: "Le Cervin",
    bads: ["Le Mont Blanc", "L'Eiger", "La Dent Blanche"],
    exp: "Le Cervin (Matterhorn en allemand) est l'une des silhouettes montagneuses les plus célèbres au monde."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'easy',
    q: "Dans quel pays d'Afrique de l'Est se dresse le Kilimandjaro, point culminant du continent africain ?",
    good: "Tanzanie",
    bads: ["Kenya", "Ouganda", "Éthiopie"],
    exp: "Le Kilimandjaro culmine à 5 895 m au pic Uhuru en Tanzanie près de la frontière kenyane."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le point culminant de la cordillère des Andes et de tout le continent américain à 6 961 mètres ?",
    good: "L'Aconcagua",
    bads: ["L'Ojos del Salado", "Le Huascarán", "Le Chimborazo"],
    exp: "L'Aconcagua, situé en Argentine près de la frontière chilienne, est le plus haut sommet en dehors d'Asie."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le point culminant de l'Amérique du Nord, situé en Alaska à 6 190 mètres d'altitude ?",
    good: "Le Denali",
    bads: ["Le mont Logan", "Le mont Saint-Élie", "Le mont Rainier"],
    exp: "Le Denali (anciennement mont McKinley) est le plus haut sommet d'Amérique du Nord."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'hard',
    q: "Quel sommet du Caucase russe est considéré comme le point culminant géographique du continent européen (5 642 m) ?",
    good: "L'Elbrouz",
    bads: ["Le mont Blanc", "Le Kazbek", "Le Dykh-Tau"],
    exp: "Le mont Elbrouz est un stratovolcan éteint du Caucase dont le sommet ouest culmine à 5 642 m."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'hard',
    q: "Quel est le plus haut sommet du continent antarctique, s'élevant à 4 892 mètres dans les monts Ellsworth ?",
    good: "Le massif Vinson",
    bads: ["Le mont Erebus", "Le mont Terror", "Le mont Tyree"],
    exp: "Le massif Vinson (ou mont Vinson) est le point culminant de l'Antarctique avec ses 4 892 mètres."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'hard',
    q: "Quel est le point culminant de l'Australie continentale avec ses 2 228 mètres d'altitude ?",
    good: "Le mont Kosciuszko",
    bads: ["Le mont Townsend", "Le mont Bogong", "Le mont Bartle Frere"],
    exp: "Le mont Kosciuszko est situé dans les Snowy Mountains en Nouvelle-Galles du Sud."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'easy',
    q: "Quel volcan conique sacré constitue le point culminant de l'archipel japonais à 3 776 mètres ?",
    good: "Le mont Fuji",
    bads: ["Le mont Aso", "Le mont Ontake", "Le mont Hiei"],
    exp: "Le mont Fuji (Fujisan) est la montagne la plus emblématique et la plus haute du Japon."
  },
  {
    cat: 'geographie',
    sub: 'relief-volcans',
    diff: 'medium',
    q: "Quel volcan en activité permanente domine la côte est de la Sicile à plus de 3 300 mètres ?",
    good: "L'Etna",
    bads: ["Le Vésuve", "Le Stromboli", "Vulcano"],
    exp: "L'Etna est le plus haut volcan actif d'Europe continentale et méditerranéenne."
  },
  {
    cat: 'geographie',
    sub: 'relief-volcans',
    diff: 'medium',
    q: "Quel volcan célèbre domine la baie de Naples et a détruit la cité antique de Pompéi en 79 ap. J.-C. ?",
    good: "Le Vésuve",
    bads: ["L'Etna", "Le Stromboli", "Le Santorin"],
    exp: "Le Vésuve est célèbre pour son éruption plinienne cataclysmique ayant enseveli Pompéi et Herculanum."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le point culminant de la chaîne des Pyrénées, s'élevant à 3 404 mètres d'altitude côté espagnol ?",
    good: "Le pic d'Aneto",
    bads: ["Le pic du Midi", "Le mont Perdu", "Le Vignemale"],
    exp: "Le pic d'Aneto est situé dans le massif de la Maladeta dans la province de Huesca en Espagne."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le point culminant de la chaîne des Pyrénées sur le versant français à 3 298 mètres ?",
    good: "Le Vignemale",
    bads: ["Le pic du Midi d'Ossau", "Le Canigou", "Le pic du Taillon"],
    exp: "La Pique Longue du massif du Vignemale est le sommet le plus élevé des Pyrénées françaises."
  },
  {
    cat: 'geographie',
    sub: 'relief-chaines',
    diff: 'easy',
    q: "Quelle chaîne de montagnes sépare traditionnellement la France de la péninsule Ibérique ?",
    good: "Les Pyrénées",
    bads: ["Les Alpes", "Les Carpates", "Le Jura"],
    exp: "Les Pyrénées forment une barrière montagneuse naturelle continue entre la France et l'Espagne."
  },
  {
    cat: 'geographie',
    sub: 'relief-chaines',
    diff: 'medium',
    q: "Quelle chaîne de montagnes longue d'environ 2 500 kilomètres marque la limite traditionnelle entre l'Europe et l'Asie ?",
    good: "L'Oural",
    bads: ["Le Caucase", "L'Altaï", "Les Carpates"],
    exp: "Les monts Oural traversent la Russie du nord au sud et délimitent conventionnellement les continents européen et asiatique."
  },
  {
    cat: 'geographie',
    sub: 'relief-chaines',
    diff: 'medium',
    q: "Quelle est la plus longue chaîne de montagnes continentale du monde, longeant l'ouest de l'Amérique du Sud ?",
    good: "La cordillère des Andes",
    bads: ["Les montagnes Rocheuses", "L'Himalaya", "La cordillère Australienne"],
    exp: "La cordillère des Andes s'étire sur plus de 7 000 km le long de sept pays sud-américains."
  },
  {
    cat: 'geographie',
    sub: 'relief-chaines',
    diff: 'easy',
    q: "Quelle grande chaîne montagneuse s'étend de la Colombie-Britannique au Nouveau-Mexique en Amérique du Nord ?",
    good: "Les montagnes Rocheuses",
    bads: ["Les Appalaches", "La Sierra Nevada", "La chaîne des Cascades"],
    exp: "Les Rocheuses (Rocky Mountains) constituent l'épine dorsale de l'ouest nord-américain sur plus de 4 800 km."
  },
  {
    cat: 'geographie',
    sub: 'relief-chaines',
    diff: 'medium',
    q: "Quel massif montagneux ancien s'étend le long de la côte est des États-Unis et du Canada ?",
    good: "Les Appalaches",
    bads: ["Les Rocheuses", "La Sierra Nevada", "Les monts Adirondacks"],
    exp: "Les Appalaches sont une chaîne de montagnes très ancienne et érodée de l'est de l'Amérique du Nord."
  },
  {
    cat: 'geographie',
    sub: 'relief-volcans',
    diff: 'hard',
    q: "Quel volcan d'Indonésie a produit en 1883 l'une des explosions volcaniques les plus violentes de l'histoire moderne ?",
    good: "Le Krakatoa",
    bads: ["Le Tambora", "Le mont Merapi", "Le mont Bromo"],
    exp: "L'éruption du Krakatoa en 1883 a détruit une grande partie de l'île et provoqué des tsunamis dévastateurs."
  },
  {
    cat: 'geographie',
    sub: 'relief-volcans',
    diff: 'hard',
    q: "Quel volcan d'Indonésie a provoqué en 1815 la plus puissante éruption enregistrée, causant 'l'année sans été' en 1816 ?",
    good: "Le mont Tambora",
    bads: ["Le Krakatoa", "Le mont Pinatubo", "Le mont Saint Helens"],
    exp: "L'éruption cataclysmique du Tambora sur l'île de Sumbawa en 1815 a altéré le climat mondial pendant des mois."
  },
  {
    cat: 'geographie',
    sub: 'relief-volcans',
    diff: 'medium',
    q: "Quel volcan de l'État de Washington aux États-Unis a connu une spectaculaire explosion latérale en mai 1980 ?",
    good: "Le mont Saint Helens",
    bads: ["Le mont Rainier", "Le mont Hood", "Le mont Shasta"],
    exp: "Le mont Saint Helens a vu tout son flanc nord s'effondrer lors d'une gigantesque éruption explosive le 18 mai 1980."
  },
  {
    cat: 'geographie',
    sub: 'relief-sommets',
    diff: 'medium',
    q: "Quel est le point culminant du continent africain si l'on exclut le Kilimandjaro (deuxième plus haut avec 5 199 m) ?",
    good: "Le mont Kenya",
    bads: ["Le Rwenzori", "Le mont Cameroun", "Le Ras Dashan"],
    exp: "Le mont Kenya est le deuxième plus haut sommet d'Afrique après le Kilimandjaro."
  },

  // ━━━ GÉOGRAPHIE : FLEUVES & COURS D'EAU (25) ━━━
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve d'Amérique du Sud possède le débit moyen le plus puissant du monde et le plus vaste bassin versant ?",
    good: "L'Amazone",
    bads: ["Le Paraná", "L'Orénoque", "Le São Francisco"],
    exp: "L'Amazone draine environ 20 % de l'eau douce rejetée dans les océans par les fleuves de la planète."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel grand fleuve d'Afrique du Nord traverse l'Égypte avant d'achever sa course dans la mer Méditerranée ?",
    good: "Le Nil",
    bads: ["Le Congo", "Le Niger", "Le Zambèze"],
    exp: "Le Nil s'étire sur plus de 6 600 km depuis le lac Victoria jusqu'à son vaste delta sur la Méditerranée."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel est le plus long fleuve d'Asie et le troisième plus long du monde, coulant intégralement en Chine ?",
    good: "Le Yangtsé",
    bads: ["Le fleuve Jaune", "Le Mékong", "La Léna"],
    exp: "Le Yangtsé (ou Chang Jiang / Fleuve Bleu) mesure environ 6 300 kilomètres de long."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve chinois célèbre est surnommé le 'berceau de la civilisation chinoise' en raison des limons de loess qu'il charrie ?",
    good: "Le fleuve Jaune",
    bads: ["Le Yangtsé", "La Rivière des Perles", "Le Mékong"],
    exp: "Le fleuve Jaune (Huang He) doit sa teinte et son nom aux énormes quantités de sédiments ocre qu'il transporte."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve majeur d'Amérique du Nord traverse les États-Unis du nord au sud pour se jeter dans le golfe du Mexique ?",
    good: "Le Mississippi",
    bads: ["Le Colorado", "L'Hudson", "Le Rio Grande"],
    exp: "Le Mississippi forme avec son affluent le Missouri l'un des plus importants réseaux hydrographiques mondiaux."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve tumultueux d'Amérique du Nord a creusé le gigantesque Grand Canyon en Arizona ?",
    good: "Le Colorado",
    bads: ["Le Mississippi", "Le Columbia", "Le Rio Grande"],
    exp: "Le fleuve Colorado a sculpté le Grand Canyon sur plusieurs millions d'années d'érosion géologique."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel est le plus long fleuve d'Europe avec ses 3 530 kilomètres, se jetant dans la mer Caspienne ?",
    good: "La Volga",
    bads: ["Le Danube", "Le Dniepr", "L'Oural"],
    exp: "La Volga est le fleuve le plus long d'Europe et le cœur historique du réseau fluvial russe."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel grand fleuve européen prend sa source en Forêt-Noire en Allemagne et traverse quatre capitales européennes ?",
    good: "Le Danube",
    bads: ["Le Rhin", "L'Elbe", "La Vistule"],
    exp: "Le Danube traverse Vienne, Bratislava, Budapest et Belgrade avant de déboucher dans la mer Noire."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve européen marque une grande partie de la frontière franco-allemande et se jette dans la mer du Nord ?",
    good: "Le Rhin",
    bads: ["La Meuse", "La Moselle", "L'Escaut"],
    exp: "Le Rhin est l'une des voies navigables les plus fréquentées au monde depuis Bâle jusqu'à Rotterdam."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve traverse la capitale britannique de Londres avant de se jeter dans la mer du Nord ?",
    good: "La Tamise",
    bads: ["La Severn", "La Clyde", "La Mersey"],
    exp: "La Tamise traverse le cœur de Londres et passe sous le célèbre Tower Bridge."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve traverse la ville de Rome, berceau historique de la civilisation romaine ?",
    good: "Le Tibre",
    bads: ["L'Arno", "Le Pô", "L'Adige"],
    exp: "Le Tibre est le troisième fleuve d'Italie et traverse la capitale italienne."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve traverse Florence et Pise en Toscane avant de se jeter dans la mer Ligure ?",
    good: "L'Arno",
    bads: ["Le Tibre", "Le Pô", "Le Piave"],
    exp: "L'Arno passe notamment sous le célèbre Ponte Vecchio au cœur de Florence."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel est le plus long fleuve d'Italie, s'écoulant d'ouest en est à travers la riche plaine padane ?",
    good: "Le Pô",
    bads: ["Le Tibre", "L'Adige", "L'Arno"],
    exp: "Le Pô mesure 652 kilomètres de long depuis le mont Viso jusqu'à la mer Adriatique."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel est le plus long fleuve entièrement situé sur le territoire de la France métropolitaine (1 006 km) ?",
    good: "La Loire",
    bads: ["La Seine", "Le Rhône", "La Garonne"],
    exp: "La Loire prend sa source au mont Gerbier-de-Jonc en Ardèche et se jette dans l'océan Atlantique à Saint-Nazaire."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve prend sa source en Suisse, traverse le lac Léman puis la ville de Lyon avant d'entrer en Méditerranée ?",
    good: "Le Rhône",
    bads: ["La Saône", "Le Rhin", "L'Isère"],
    exp: "Le Rhône est le fleuve le plus puissant de France par son débit d'eau douce vers la Méditerranée."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve français prend sa source sur le plateau de Langres, arrose Paris et se jette dans la Manche au Havre ?",
    good: "La Seine",
    bads: ["La Marne", "L'Oise", "La Somme"],
    exp: "La Seine est le fleuve historique qui traverse la capitale française."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve du Sud-Ouest de la France naît dans les Pyrénées espagnoles et forme l'estuaire de la Gironde avec la Dordogne ?",
    good: "La Garonne",
    bads: ["L'Adour", "Le Lot", "Le Tarn"],
    exp: "La Garonne arrose notamment Toulouse et Bordeaux avant de rejoindre la Dordogne dans l'estuaire de la Gironde."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel est le plus long fleuve de la péninsule Ibérique, arrosant Tolède puis se jetant dans l'Atlantique à Lisbonne ?",
    good: "Le Tage",
    bads: ["L'Èbre", "Le Douro", "Le Guadalquivir"],
    exp: "Le Tage (Tajo en espagnol, Tejo en portugais) mesure 1 007 km et traverse l'Espagne et le Portugal."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'hard',
    q: "Quel fleuve espagnol majeur prend sa source dans les monts Cantabriques et a donné son nom antique à la péninsule ?",
    good: "L'Èbre",
    bads: ["Le Douro", "Le Guadalquivir", "Le Guadiana"],
    exp: "L'Èbre (Ebro) a donné son nom à la péninsule Ibérique dans les récits des géographes de l'Antiquité."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve d'Asie du Sud-Est traverse ou borde six pays (Chine, Myanmar, Laos, Thaïlande, Cambodge, Vietnam) ?",
    good: "Le Mékong",
    bads: ["L'Irrawaddy", "La Salouen", "Le fleuve Rouge"],
    exp: "Le Mékong est l'artère vitale de la péninsule indochinoise, avec un immense delta fertile au sud du Vietnam."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'easy',
    q: "Quel fleuve sacré de l'Inde naît dans l'Himalaya et est vénéré comme une déesse par les hindous ?",
    good: "Le Gange",
    bads: ["L'Indus", "Le Brahmapoutre", "La Yamuna"],
    exp: "Le Gange (Ganga) est le fleuve le plus sacré de l'hindouisme, traversant la ville sainte de Varanasi."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel grand fleuve a donné son nom historique à l'Inde et au Pakistan, débouchant dans la mer d'Arabie ?",
    good: "L'Indus",
    bads: ["Le Gange", "Le Brahmapoutre", "La Narmada"],
    exp: "L'Indus a abrité la prestigieuse civilisation de la vallée de l'Indus dès le troisième millénaire avant notre ère."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'hard',
    q: "Quel fleuve d'Afrique centrale est le plus profond du monde (plus de 220 m) et le deuxième plus puissant par son débit ?",
    good: "Le Congo",
    bads: ["Le Zambèze", "Le Niger", "L'Ogooué"],
    exp: "Le fleuve Congo est l'unique grand fleuve à traverser deux fois la ligne de l'équateur terrestre."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Sur quel fleuve d'Afrique australe se situent les spectaculaires chutes Victoria à la frontière Zambie-Zimbabwe ?",
    good: "Le Zambèze",
    bads: ["Le Limpopo", "Le fleuve Orange", "L'Okavango"],
    exp: "Le Zambèze plonge de plus de cent mètres de haut aux chutes Victoria, appelées 'la fumée qui gronde'."
  },
  {
    cat: 'geographie',
    sub: 'hydrographie-fleuves',
    diff: 'medium',
    q: "Quel fleuve majestueux relie les Grands Lacs d'Amérique du Nord à l'océan Atlantique en traversant le Québec ?",
    good: "Le Saint-Laurent",
    bads: ["L'Hudson", "Le fleuve Fraser", "Le fleuve Mackenzie"],
    exp: "Le fleuve Saint-Laurent est une voie d'eau navigable majeure du Canada bordant Montréal et la ville de Québec."
  },

  // ━━━ GÉOGRAPHIE : ÎLES & ARCHIPELS (20) ━━━
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'easy',
    q: "Quelle est la plus grande île de la planète en superficie, appartenant géopolitiquement au royaume du Danemark ?",
    good: "Le Groenland",
    bads: ["Madagascar", "Bornéo", "La Nouvelle-Guinée"],
    exp: "Le Groenland s'étend sur plus de 2,1 millions de km², ce qui en fait la plus vaste île non continentale du monde."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle est la deuxième plus grande île du monde par sa superficie, située au nord de l'Australie ?",
    good: "La Nouvelle-Guinée",
    bads: ["Bornéo", "Madagascar", "Sumatra"],
    exp: "La Nouvelle-Guinée est partagée entre l'Indonésie à l'ouest et l'État indépendant de Papouasie-Nouvelle-Guinée à l'est."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle grande île d'Asie du Sud-Est est politiquement partagée entre l'Indonésie, la Malaisie et le sultanat de Brunei ?",
    good: "Bornéo",
    bads: ["Sumatra", "Java", "Célèbes"],
    exp: "Bornéo est la troisième plus grande île au monde et la seule partagée entre trois pays souverains distincts."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'easy',
    q: "Quelle grande île de l'océan Indien est réputée pour sa biodiversité exceptionnelle et ses nombreuses espèces de lémuriens ?",
    good: "Madagascar",
    bads: ["L'île Maurice", "La Réunion", "Mayotte"],
    exp: "Madagascar s'est séparée du continent africain il y a des dizaines de millions d'années, créant un écosystème unique."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle est la plus grande et la plus peuplée des quatre îles principales qui composent le Japon ?",
    good: "Honshu",
    bads: ["Hokkaido", "Kyushu", "Shikoku"],
    exp: "Honshu abrite les grandes métropoles japonaises comme Tokyo, Osaka, Kyoto et Nagoya."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle île septentrionale du Japon est connue pour ses hivers rigoureux et sa grande ville de Sapporo ?",
    good: "Hokkaido",
    bads: ["Honshu", "Okinawa", "Shikoku"],
    exp: "Hokkaido est la deuxième plus grande île de l'archipel nippon, réputée pour ses stations de ski et ses parcs naturels."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'easy',
    q: "Quelle est la plus grande île de la mer Méditerranée en superficie ?",
    good: "La Sicile",
    bads: ["La Sardaigne", "Chypre", "La Corse"],
    exp: "La Sicile est la plus grande île méditerranéenne avec plus de 25 700 km² de surface."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle île méditerranéenne italienne est située immédiatement au sud de la Corse française ?",
    good: "La Sardaigne",
    bads: ["La Sicile", "L'île d'Elbe", "Capri"],
    exp: "La Sardaigne est séparée de la Corse par les bouches de Bonifacio, un détroit maritime de seulement 11 km."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'easy',
    q: "Dans quelle région insulaire française trouve-t-on les villes d'Ajaccio et de Bastia ?",
    good: "La Corse",
    bads: ["La Guadeloupe", "La Martinique", "La Réunion"],
    exp: "La Corse est une collectivité territoriale insulaire surnommée l'île de Beauté."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quel archipel espagnol de l'océan Atlantique se compose notamment de Tenerife, Grande Canarie et Lanzarote ?",
    good: "Les îles Canaries",
    bads: ["Les Baléares", "Les Açores", "Madère"],
    exp: "Les îles Canaries sont une communauté autonome espagnole située au large des côtes du Maroc."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'easy',
    q: "Quel archipel espagnol situé en Méditerranée occidentale regroupe Majorque, Minorque, Ibiza et Formentera ?",
    good: "Les îles Baléares",
    bads: ["Les îles Canaries", "Les Cyclades", "Les îles Éoliennes"],
    exp: "Les îles Baléares forment une communauté autonome espagnole dont la capitale est Palma de Majorque."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quel archipel volcanique portugais de l'Atlantique comprend les îles de São Miguel, Terceira et Pico ?",
    good: "Les Açores",
    bads: ["Madère", "Le Cap-Vert", "Les Canaries"],
    exp: "Les Açores sont une région autonome du Portugal située à environ 1 500 km des côtes de Lisbonne."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'hard',
    q: "Quel archipel équatorien de l'océan Pacifique a inspiré à Charles Darwin sa théorie de l'évolution par sélection naturelle ?",
    good: "Les îles Galápagos",
    bads: ["Les îles Malouines", "L'archipel Juan Fernández", "L'île de Pâques"],
    exp: "Les îles Galápagos abritent une faune endémique singulière (tortues géantes, iguanes marins, pinsons)."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "À quel pays appartient l'île de Pâques (Rapa Nui), célèbre pour ses monumentales statues Moaï ?",
    good: "Le Chili",
    bads: ["Le Pérou", "L'Argentine", "L'Équateur"],
    exp: "L'île de Pâques est une province spéciale rattachée à la région de Valparaíso au Chili."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle île grecque célèbre de la mer Égée est réputée pour ses maisons blanches aux dômes bleus perchées sur une caldeira ?",
    good: "Santorin",
    bads: ["Mykonos", "Rhodes", "Corfou"],
    exp: "Santorin (Thíra) est le vestige d'une île volcanique détruite par une éruption colossale vers 1600 avant notre ère."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle est la plus grande île de l'archipel des Antilles et des Caraïbes avec La Havane pour capitale ?",
    good: "Cuba",
    bads: ["Hispaniola", "La Jamaïque", "Porto Rico"],
    exp: "Cuba est la plus vaste île des Caraïbes avec une superficie d'environ 109 884 km²."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Sur quelle île des Caraïbes cohabitent la république d'Haïti et la République dominicaine ?",
    good: "Hispaniola",
    bads: ["Cuba", "Porto Rico", "La Jamaïque"],
    exp: "Hispaniola a été nommée ainsi par Christophe Colomb lors de son débarquement en 1492."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'hard',
    q: "Quel archipel norvégien de l'océan Arctique abrite la réserve mondiale de semences du Svalbard ?",
    good: "Le Svalbard",
    bads: ["Les Lofoten", "Les îles Féroé", "Les Shetland"],
    exp: "Le Svalbard (dont l'île principale est le Spitzberg) conserve des millions d'échantillons de graines sous le pergélisol."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'hard',
    q: "À quel pays appartient l'archipel des îles Féroé situé dans l'Atlantique Nord entre l'Écosse et l'Islande ?",
    good: "Le Danemark",
    bads: ["La Norvège", "Le Royaume-Uni", "L'Islande"],
    exp: "Les îles Féroé constituent un pays constitutif autonome du royaume du Danemark."
  },
  {
    cat: 'geographie',
    sub: 'iles-archipels',
    diff: 'medium',
    q: "Quelle île italienne de la baie de Naples est célèbre pour sa 'Grotte bleue' et ses falaises de calcaire ?",
    good: "Capri",
    bads: ["Ischia", "Procida", "Elbe"],
    exp: "Capri est une île réputée depuis l'Antiquité romaine, où l'empereur Tibère s'était retiré à la Villa Jovis."
  },

  // ━━━ SCIENCE : TABLEAU PÉRIODIQUE & CHIMIE (25) ━━━
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel est l'élément chimique le plus léger et le plus abondant dans l'univers (numéro atomique 1) ?",
    good: "L'hydrogène",
    bads: ["L'hélium", "Le carbone", "L'oxygène"],
    exp: "L'hydrogène (H) représente environ 75 % de la masse baryonique de l'univers observable."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel gaz noble est le deuxième élément le plus abondant dans l'univers et est utilisé pour gonfler des ballons dirigeables ?",
    good: "L'hélium",
    bads: ["Le néon", "L'argon", "Le xénon"],
    exp: "L'hélium (He) est un gaz inerte beaucoup plus léger que l'air et ininflammable."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel élément chimique de symbole 'C' constitue la base fondamentale de toute la chimie organique et de la vie terrestre ?",
    good: "Le carbone",
    bads: ["L'azote", "Le silicium", "Le soufre"],
    exp: "Le carbone possède 4 électrons de valence lui permettant de former une variété infinie de molécules complexes."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel gaz représente environ 78 % du volume de l'atmosphère terrestre ?",
    good: "Le diazote",
    bads: ["Le dioxygène", "L'argon", "Le dioxyde de carbone"],
    exp: "L'azote (N2) compose près de 78 % de l'air sec, devançant l'oxygène (21 %) et l'argon (0,93 %)."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel est le symbole chimique de l'or dans la classification périodique des éléments ?",
    good: "Au",
    bads: ["Ag", "Fe", "Or"],
    exp: "Le symbole Au vient du latin 'aurum' qui signifie 'aurore brillante' ou 'or'."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel est le symbole chimique de l'argent dans le tableau périodique ?",
    good: "Ag",
    bads: ["Ar", "Au", "Al"],
    exp: "Le symbole Ag découle du mot latin 'argentum'."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel métal de transition porte le symbole chimique 'Fe' et le numéro atomique 26 ?",
    good: "Le fer",
    bads: ["Le fluor", "Le francium", "Le phosphore"],
    exp: "Le symbole Fe est issu du latin 'ferrum'."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel métal lourd toxique porte le symbole chimique 'Hg' et se présente à l'état liquide à température ambiante ?",
    good: "Le mercure",
    bads: ["Le plomb", "L'étain", "Le bismuth"],
    exp: "Le symbole Hg vient du grec ancien 'hydrargyrum' signifiant 'argent liquide' ou 'vif-argent'."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel est le symbole chimique du potassium dans la classification périodique ?",
    good: "K",
    bads: ["P", "Po", "Pt"],
    exp: "Le symbole K provient du néo-latin 'kalium', dérivé de l'arabe 'al-qalyah'."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel est le symbole chimique du sodium dans le tableau périodique des éléments ?",
    good: "Na",
    bads: ["So", "Sd", "S"],
    exp: "Le symbole Na dérive du latin 'natrium', lié aux sels de soude naturelle."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel est le symbole chimique du plomb dans le tableau périodique ?",
    good: "Pb",
    bads: ["Pl", "Pd", "Po"],
    exp: "Le symbole Pb provient du latin 'plumbum', qui a également donné le mot plomberie."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel est le symbole chimique du cuivre dans la classification de Mendeleïev ?",
    good: "Cu",
    bads: ["Co", "Cr", "Cp"],
    exp: "Le symbole Cu dérive du latin 'cuprum', en référence à l'île de Chypre où il était extrait dans l'Antiquité."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel chimiste russe a publié en 1869 la première version moderne de la classification périodique des éléments ?",
    good: "Dmitri Mendeleïev",
    bads: ["Mikhaïl Lomonossov", "Antoine Lavoisier", "John Dalton"],
    exp: "Mendeleïev a ordonné les éléments par masse atomique et propriétés chimiques récurrentes, prédisant des éléments encore inconnus."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'hard',
    q: "Quel métal précieux possède le numéro atomique 78 et est couramment employé dans les pots catalytiques et la bijouterie ?",
    good: "Le platine",
    bads: ["Le palladium", "Le rhodium", "L'iridium"],
    exp: "Le platine (Pt) est un métal noble résistant à la corrosion et un catalyseur chimique exceptionnel."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'hard',
    q: "Quel élément radioactif naturel de numéro atomique 92 a été découvert par Martin Heinrich Klaproth en 1789 ?",
    good: "L'uranium",
    bads: ["Le radium", "Le polonium", "Le thorium"],
    exp: "Klaproth a nommé l'uranium (U) en hommage à la planète Uranus découverte huit ans plus tôt par William Herschel."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quelle est la formule chimique exacte de la molécule d'eau ?",
    good: "H2O",
    bads: ["CO2", "O2", "H2O2"],
    exp: "L'eau est composée de deux atomes d'hydrogène liés à un atome d'oxygène par des liaisons covalentes."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'easy',
    q: "Quel gaz incolore et inodore est désigné par la formule chimique CO2 ?",
    good: "Le dioxyde de carbone",
    bads: ["Le monoxyde de carbone", "Le méthane", "L'ozone"],
    exp: "Le CO2 est le dioxyde de carbone, un gaz à effet de serre produit notamment par la respiration et la combustion."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel gaz à effet de serre et composant principal du gaz naturel a pour formule chimique CH4 ?",
    good: "Le méthane",
    bads: ["L'éthane", "Le propane", "Le butane"],
    exp: "Le méthane (CH4) est un hydrocarbure de la famille des alcanes avec un fort potentiel de réchauffement global."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel gaz composé de trois atomes d'oxygène (O3) forme une couche protectrice dans la haute atmosphère contre les ultraviolets ?",
    good: "L'ozone",
    bads: ["L'oxygène liquide", "Le peroxyde", "Le diazote"],
    exp: "La couche d'ozone stratosphérique absorbe la majeure partie du rayonnement solaire ultraviolet nocif."
  },
  {
    cat: 'science',
    sub: 'chimie-histoire',
    diff: 'hard',
    q: "Quel savant français est considéré comme le père de la chimie moderne et a formulé la maxime 'Rien ne se perd, rien ne se crée, tout se transforme' ?",
    good: "Antoine Lavoisier",
    bads: ["Louis Pasteur", "Claude Bernard", "Joseph Proust"],
    exp: "Antoine de Lavoisier a établi la loi de conservation de la masse lors des réactions chimiques."
  },
  {
    cat: 'science',
    sub: 'physique-particules',
    diff: 'easy',
    q: "Quelle particule subatomique de charge électrique négative gravite autour du noyau atomique ?",
    good: "L'électron",
    bads: ["Le proton", "Le neutron", "Le photon"],
    exp: "Les électrons ont une charge négative (-e) et gravitent dans le nuage électronique autour du noyau."
  },
  {
    cat: 'science',
    sub: 'physique-particules',
    diff: 'easy',
    q: "Quelle particule subatomique de charge électrique positive compose le noyau de l'atome avec le neutron ?",
    good: "Le proton",
    bads: ["L'électron", "Le neutrino", "Le positron"],
    exp: "Le proton possède une charge positive et détermine le numéro atomique (Z) de l'élément."
  },
  {
    cat: 'science',
    sub: 'physique-particules',
    diff: 'medium',
    q: "Quel physicien britannique a découvert l'existence du neutron en 1932, lui valant le prix Nobel en 1935 ?",
    good: "James Chadwick",
    bads: ["Ernest Rutherford", "J.J. Thomson", "Niels Bohr"],
    exp: "James Chadwick a prouvé l'existence des neutrons, particules sans charge électrique au cœur des noyaux atomiques."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel métal alcalino-terreux de symbole 'Ca' est le composant minéral majeur des os et des dents des vertébrés ?",
    good: "Le calcium",
    bads: ["Le magnésium", "Le potassium", "Le sodium"],
    exp: "Le calcium (Ca) est un élément essentiel à la minéralisation osseuse et à la contraction musculaire."
  },
  {
    cat: 'science',
    sub: 'chimie-elements',
    diff: 'medium',
    q: "Quel métalloïde de symbole 'Si' et numéro atomique 14 est le composant de base des puces électroniques et semi-conducteurs ?",
    good: "Le silicium",
    bads: ["Le germanium", "Le sélénium", "L'arsenic"],
    exp: "Le silicium est le deuxième élément le plus abondant de la croûte terrestre après l'oxygène et le pilier de l'électronique."
  },

  // ━━━ MUSIQUE : COMPOSITEURS & INSTRUMENTS (25) ━━━
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'easy',
    q: "Quel compositeur italien baroque a composé le célèbre ensemble de quatre concertos pour violon intitulé 'Les Quatre Saisons' ?",
    good: "Antonio Vivaldi",
    bads: ["Arcangelo Corelli", "Claudio Monteverdi", "Tomaso Albinoni"],
    exp: "Vivaldi, surnommé le prêtre roux, a publié Les Quatre Saisons en 1725 dans son recueil Il cimento dell'armonia e dell'inventione."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'easy',
    q: "Quel compositeur prodige autrichien né à Salzbourg a composé 'La Flûte enchantée' et 'Don Giovanni' ?",
    good: "Wolfgang Amadeus Mozart",
    bads: ["Ludwig van Beethoven", "Franz Schubert", "Joseph Haydn"],
    exp: "Mozart a composé plus de 600 œuvres musicales avant de disparaître prématurément à l'âge de 35 ans en 1791."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'easy',
    q: "Quel compositeur allemand devenu sourd a composé la Symphonie n° 9 dont le final reprend 'L'Ode à la joie' ?",
    good: "Ludwig van Beethoven",
    bads: ["Johann Sebastian Bach", "Johannes Brahms", "Robert Schumann"],
    exp: "Beethoven a achevé sa 9e symphonie en 1824 alors qu'il était totalement sourd."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'easy',
    q: "Quel maître allemand de l'époque baroque a composé 'L'Art de la fugue' et les six Concertos brandebourgeois ?",
    good: "Johann Sebastian Bach",
    bads: ["Georg Friedrich Haendel", "Georg Philipp Telemann", "Heinrich Schütz"],
    exp: "Jean-Sébastien Bach est considéré comme l'un des plus grands génies du contrepoint et de l'histoire de la musique occidentale."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'medium',
    q: "Quel compositeur russe a créé la musique des ballets féeriques 'Le Lac des cygnes', 'Casse-Noisette' et 'La Belle au bois dormant' ?",
    good: "Piotr Ilitch Tchaïkovski",
    bads: ["Sergueï Prokofiev", "Igor Stravinsky", "Nikolaï Rimski-Korsakov"],
    exp: "Tchaïkovski a donné au ballet romantique certaines de ses partitions les plus émouvantes et universellement jouées."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'medium',
    q: "Quel compositeur et pianiste virtuose polonais naturalisé français est le maître incontesté des Nocturnes et des Mazourkas ?",
    good: "Frédéric Chopin",
    bads: ["Franz Liszt", "Robert Schumann", "Félix Mendelssohn"],
    exp: "Chopin a consacré la quasi-totalité de son œuvre pianistique à sublimer l'expressivité romantique."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'medium',
    q: "Quel compositeur français a créé le célèbre 'Boléro' en 1928, fondé sur un crescendo orchestral continu ?",
    good: "Maurice Ravel",
    bads: ["Claude Debussy", "Gabriel Fauré", "Camille Saint-Saëns"],
    exp: "Le Boléro de Ravel est l'une des œuvres symphoniques les plus jouées au monde, construite sur un thème répété en boucle."
  },
  {
    cat: 'musique',
    sub: 'classique',
    diff: 'medium',
    q: "Quel compositeur français impressionniste a composé 'Clair de lune' et 'La Mer' ?",
    good: "Claude Debussy",
    bads: ["Maurice Ravel", "Erik Satie", "Hector Berlioz"],
    exp: "Debussy a révolutionné l'harmonie et les timbres musicaux au tournant du XXe siècle."
  },
  {
    cat: 'musique',
    sub: 'opera',
    diff: 'medium',
    q: "Quel opéra célèbre composé par Georges Bizet met en scène une bohémienne séduisante dans la ville de Séville ?",
    good: "Carmen",
    bads: ["La Traviata", "Tosca", "Madame Butterfly"],
    exp: "Créé en 1875 à l'Opéra-Comique de Paris, Carmen est l'un des opéras les plus représentés sur les scènes mondiales."
  },
  {
    cat: 'musique',
    sub: 'opera',
    diff: 'medium',
    q: "Quel compositeur italien a créé de nombreux opéras célèbres du XIXe siècle dont 'Rigoletto', 'La Traviata' et 'Aïda' ?",
    good: "Giuseppe Verdi",
    bads: ["Giacomo Puccini", "Gioachino Rossini", "Gaetano Donizetti"],
    exp: "Verdi est la figure dominante de l'opéra romantique italien et un héros du mouvement d'unification du Risorgimento."
  },
  {
    cat: 'musique',
    sub: 'opera',
    diff: 'medium',
    q: "Quel compositeur italien a composé 'La Bohème', 'Tosca' et 'Turandot' contenant l'air virtuose 'Nessun dorma' ?",
    good: "Giacomo Puccini",
    bads: ["Giuseppe Verdi", "Gioachino Rossini", "Vincenzo Bellini"],
    exp: "Puccini est le maître de l'opéra vériste italien à la transition des XIXe et XXe siècles."
  },
  {
    cat: 'musique',
    sub: 'opera',
    diff: 'hard',
    q: "Quel compositeur allemand a imaginé le concept d'œuvre d'art totale ('Gesamtkunstwerk') et la tétralogie de 'L'Anneau du Nibelung' ?",
    good: "Richard Wagner",
    bads: ["Richard Strauss", "Johannes Brahms", "Gustav Mahler"],
    exp: "Wagner a bouleversé la conception de l'opéra avec son festival de Bayreuth et l'usage systématique du leitmotiv."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "À quelle famille d'instruments de musique appartiennent la flûte traversière, la clarinette et le hautbois ?",
    good: "Les bois",
    bads: ["Les cuivres", "Les cordes", "Les percussions"],
    exp: "Bien que la flûte moderne soit souvent en métal, elle appartient historiquement à la famille des bois par son mode d'émission sonore."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "À quelle famille d'instruments de l'orchestre appartiennent la trompette, le trombone et le tuba ?",
    good: "Les cuivres",
    bads: ["Les bois", "Les cordes", "Les claviers"],
    exp: "Les cuivres produisent un son par la vibration des lèvres de l'instrumentiste sur une embouchure métallique."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "Quel est le plus petit et le plus aigu des instruments de la famille des cordes frottées de l'orchestre symphonique ?",
    good: "Le violon",
    bads: ["L'alto", "Le violoncelle", "La contrebasse"],
    exp: "Le violon possède quatre cordes accordées en quintes (sol, ré, la, mi) et joue dans le registre le plus aigu des cordes."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "Quel instrument de la famille des cordes frottées se joue assis en maintenant le corps de l'instrument entre les genoux ?",
    good: "Le violoncelle",
    bads: ["Le violon", "L'alto", "La harpe"],
    exp: "Le violoncelle repose au sol sur une pique métallique rétractable et produit un timbre chaud et profond."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "Quel est le plus grand et le plus grave de tous les instruments de la famille des cordes frottées ?",
    good: "La contrebasse",
    bads: ["Le violoncelle", "Le basson", "Le tuba"],
    exp: "La contrebasse mesure près de deux mètres de haut et joue le registre fondamental grave de l'orchestre ou du jazz."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "Quel grand instrument à vent mécanique est pourvu de milliers de tuyaux, de claviers multiples et d'un pédalier dans les églises ?",
    good: "L'orgue",
    bads: ["Le clavecin", "Le piano à queue", "L'harmonium"],
    exp: "L'orgue à tuyaux est souvent surnommé le 'roi des instruments' en raison de son envergure sonore monumentale."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "Quel instrument à cordes pincées à touches et cordes sautées était l'instrument à clavier roi de l'époque baroque avant le piano ?",
    good: "Le clavecin",
    bads: ["L'orgue", "Le clavicorde", "L'épinette"],
    exp: "Au clavecin, les cordes sont pincées par des becs de plume portés par des sautereaux, à la différence des marteaux du piano."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "Combien de touches blanches et noires trouve-t-on traditionnellement sur le clavier d'un piano moderne complet ?",
    good: "88",
    bads: ["76", "84", "92"],
    exp: "Un piano standard dispose de 88 touches : 52 touches blanches diatoniques et 36 touches noires chromatiques."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'hard',
    q: "Quel instrument de percussion de l'orchestre symphonique est constitué de grands chaudrons de cuivre tendus d'une peau et accordables avec des pédales ?",
    good: "Les timbales",
    bads: ["La grosse caisse", "Les cymbales", "Le gong"],
    exp: "Les timbales sont des percussions à son déterminé permettant de jouer des notes précises dans la tonalité de l'œuvre."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "Quel instrument de musique traditionnel écossais est doté d'une poche en cuir et de tuyaux appelés bourdons et chalumeau ?",
    good: "La cornemuse",
    bads: ["L'accordéon", "Le biniou", "La bombarde"],
    exp: "La cornemuse (Great Highland Bagpipe) est l'instrument national emblématique des Highlands écossais."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "De combien de cordes est généralement dotée une guitare acoustique ou électrique classique standard ?",
    good: "6",
    bads: ["4", "5", "7"],
    exp: "La guitare standard comporte six cordes accordées en mi, la, ré, sol, si, mi."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'easy',
    q: "Quel instrument de musique à cordes frottées et manche court sans frettes est la spécialité légendaire du luthier Antonio Stradivari ?",
    good: "Le violon",
    bads: ["La guitare", "Le luth", "La mandoline"],
    exp: "Antonio Stradivari (Stradivarius) a fabriqué au XVIIe-XVIIIe siècle à Crémone les violons les plus prisés et onéreux du monde."
  },
  {
    cat: 'musique',
    sub: 'instruments',
    diff: 'medium',
    q: "Quel instrument à vent en métal inventé par Adolphe Sax en Belgique au XIXe siècle est devenu central dans la musique jazz ?",
    good: "Le saxophone",
    bads: ["La clarinette", "La trompette", "Le trombone"],
    exp: "Adolphe Sax a breveté le saxophone en 1846, combinant une embouchure à anche simple de clarinette et un corps conique en cuivre."
  },

  // ━━━ ART : MUSÉES & MOUVEMENTS (20) ━━━
  {
    cat: 'art',
    sub: 'musees',
    diff: 'easy',
    q: "Dans quel célèbre musée parisien peut-on admirer 'La Joconde' de Léonard de Vinci ?",
    good: "Le musée du Louvre",
    bads: ["Le musée d'Orsay", "Le Centre Pompidou", "Le musée Rodin"],
    exp: "La Joconde est exposée dans la salle des États du musée du Louvre, le musée le plus visité au monde."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'easy',
    q: "Dans quelle ancienne gare ferroviaire parisienne réaménagée peut-on admirer les chefs-d'œuvre des peintres impressionnistes ?",
    good: "Le musée d'Orsay",
    bads: ["Le musée du Louvre", "Le musée de l'Orangerie", "Le Petit Palais"],
    exp: "Le musée d'Orsay abrite la plus grande collection au monde de toiles impressionnistes et post-impressionnistes."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Dans quel grand musée de Madrid en Espagne peut-on contempler 'Les Ménines' de Diego Vélasquez ?",
    good: "Le musée du Prado",
    bads: ["Le musée Reina Sofía", "Le musée Thyssen-Bornemisza", "L'Escurial"],
    exp: "Le musée du Prado rassemble l'une des plus exceptionnelles collections de maîtres européens (Goya, Vélasquez, El Greco, Bosch)."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Dans quel musée madrilène est exposée la monumentale toile antifasciste 'Guernica' peinte par Pablo Picasso en 1937 ?",
    good: "Le musée Reina Sofía",
    bads: ["Le musée du Prado", "Le musée Thyssen", "Le palais royal"],
    exp: "Le Museo Nacional Centro de Arte Reina Sofía est dédié à l'art moderne et contemporain espagnol et international."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Dans quelle galerie florentine réputée peut-on voir 'La Naissance de Vénus' et 'Le Printemps' de Sandro Botticelli ?",
    good: "La galerie des Offices",
    bads: ["La galerie de l'Académie", "Le palais Pitti", "Le palais du Bargello"],
    exp: "La Galleria degli Uffizi à Florence est l'un des plus anciens et prestigieux musées d'art de la Renaissance au monde."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Dans quel célèbre musée d'Amsterdam peut-on admirer 'La Ronde de nuit' de Rembrandt ?",
    good: "Le Rijksmuseum",
    bads: ["Le musée Van Gogh", "Le Stedelijk Museum", "La maison Anne Frank"],
    exp: "Le Rijksmuseum est le musée national des Pays-Bas dédié aux beaux-arts et au Siècle d'or néerlandais."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'easy',
    q: "Quel musée de New York fondé en 1870 est souvent abrégé par le sigle 'Met' et borde la 5e Avenue près de Central Park ?",
    good: "Le Metropolitan Museum of Art",
    bads: ["Le MoMA", "Le musée Guggenheim", "Le Whitney Museum"],
    exp: "Le Metropolitan Museum of Art est le plus grand musée d'art des États-Unis."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Quel musée d'art moderne new-yorkais est célèbre pour sa collection de toiles comme 'La Nuit étoilée' de Van Gogh ?",
    good: "Le MoMA",
    bads: ["Le Met", "Le Guggenheim", "Le New Museum"],
    exp: "Le Museum of Modern Art (MoMA) à Manhattan est l'un des musées d'art moderne les plus influents de la planète."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'medium',
    q: "Dans quel musée d'art spectaculaire conçu par Frank Gehry et situé à Bilbao peut-on contempler des sculptures d'art contemporain ?",
    good: "Le musée Guggenheim",
    bads: ["Le musée Reina Sofía", "La fondation Miró", "Le musée MACBA"],
    exp: "Le musée Guggenheim Bilbao a revitalisé la ville basque grâce à son architecture postmoderne en titane et verre."
  },
  {
    cat: 'art',
    sub: 'musees',
    diff: 'hard',
    q: "Dans quel immense musée d'art et d'histoire situé au bord de la Neva à Saint-Pétersbourg peut-on admirer les collections des tsars ?",
    good: "L'Ermitage",
    bads: ["La galerie Tretiakov", "Le musée Pouchkine", "Le palais d'Hiver"],
    exp: "Le musée de l'Ermitage occupe notamment l'ancien palais d'Hiver des tsars de Russie et compte plus de 3 millions d'objets d'art."
  },
  {
    cat: 'art',
    sub: 'mouvements',
    diff: 'medium',
    q: "Quel mouvement pictural né en France dans les années 1870 est caractérisé par de petites touches fragmentées captant la lumière éphémère ?",
    good: "L'impressionnisme",
    bads: ["Le cubisme", "Le fauvisme", "Le romantisme"],
    exp: "L'impressionnisme a tiré son nom de la toile 'Impression, soleil levant' de Claude Monet présentée en 1874."
  },
  {
    cat: 'art',
    sub: 'mouvements',
    diff: 'medium',
    q: "Quel mouvement artistique initié par Georges Braque et Pablo Picasso vers 1907 déconstruit les objets en formes géométriques à multiples facettes ?",
    good: "Le cubisme",
    bads: ["Le surréalisme", "Le fauvisme", "Le futurisme"],
    exp: "Le cubisme a rompu avec la perspective classique en figurant des objets sous plusieurs angles à la fois."
  },
  {
    cat: 'art',
    sub: 'mouvements',
    diff: 'easy',
    q: "Quel mouvement artistique et littéraire fondé par André Breton en 1924 explorait l'inconscient, le rêve et l'automatisme psychique ?",
    good: "Le surréalisme",
    bads: ["Le dadaïsme", "L'expressionnisme", "Le réalisme"],
    exp: "Le Manifeste du surréalisme d'André Breton a ouvert la voie à des peintres comme Salvador Dalí, René Magritte et Max Ernst."
  },
  {
    cat: 'art',
    sub: 'peinture',
    diff: 'medium',
    q: "Quel artiste peintre espagnol est célèbre pour ses montres molles dans le tableau surréaliste 'La Persistance de la mémoire' (1931) ?",
    good: "Salvador Dalí",
    bads: ["Joan Miró", "Pablo Picasso", "Antoni Tàpies"],
    exp: "Salvador Dalí a peint cette toile célèbre illustrant le concept de relativité du temps et de mémoire inconsciente."
  },
  {
    cat: 'art',
    sub: 'peinture',
    diff: 'medium',
    q: "Quel peintre surréaliste belge est l'auteur de la célèbre toile 'La Trahison des images' arborant la légende 'Ceci n'est pas une pipe' ?",
    good: "René Magritte",
    bads: ["Paul Delvaux", "James Ensor", "Félicien Rops"],
    exp: "René Magritte interrogeait la relation entre les mots, les objets et leur représentation picturale."
  },
  {
    cat: 'art',
    sub: 'peinture',
    diff: 'easy',
    q: "Quel peintre hollandais tourmenté a peint 'La Nuit étoilée', 'Les Tournesols' et 'La Chambre à coucher' à Arles ?",
    good: "Vincent van Gogh",
    bads: ["Paul Gauguin", "Paul Cézanne", "Henri de Toulouse-Lautrec"],
    exp: "Vincent van Gogh est une figure tutélaire de l'art moderne avec plus de 2 000 œuvres réalisées en une décennie."
  },
  {
    cat: 'art',
    sub: 'sculpture',
    diff: 'medium',
    q: "Quel sculpteur français a réalisé des chefs-d'œuvre de bronze et de marbre comme 'Le Penseur', 'Le Baiser' et 'Les Bourgeois de Calais' ?",
    good: "Auguste Rodin",
    bads: ["Antoine Bourdelle", "Camille Claudel", "Aristide Maillol"],
    exp: "Auguste Rodin est considéré comme le père de la sculpture moderne occidentale."
  },
  {
    cat: 'art',
    sub: 'peinture',
    diff: 'medium',
    q: "Quel peintre norvégien a peint en 1893 le célèbre chef-d'œuvre expressionniste 'Le Cri' représentant une silhouette angoissée sous un ciel rouge ?",
    good: "Edvard Munch",
    bads: ["Egon Schiele", "Gustav Klimt", "Wassily Kandinsky"],
    exp: "Le Cri d'Edvard Munch est l'une des images artistiques les plus universellement reconnues de l'angoisse humaine moderne."
  },
  {
    cat: 'art',
    sub: 'peinture',
    diff: 'medium',
    q: "Quel artiste peintre autrichien de la Sécession viennoise est l'auteur du somptueux tableau recouvert de feuilles d'or intitulé 'Le Baiser' (1907-1908) ?",
    good: "Gustav Klimt",
    bads: ["Egon Schiele", "Oskar Kokoschka", "Otto Wagner"],
    exp: "Gustav Klimt a réalisé 'Le Baiser' durant sa période dorée, exposé aujourd'hui au palais du Belvédère à Vienne."
  },
  {
    cat: 'art',
    sub: 'pop-art',
    diff: 'easy',
    q: "Quel artiste américain est le pape du Pop Art, célèbre pour ses sérigraphies de bouteilles de Coca-Cola et de boîtes de soupe Campbell ?",
    good: "Andy Warhol",
    bads: ["Roy Lichtenstein", "Keith Haring", "Jean-Michel Basquiat"],
    exp: "Andy Warhol a exploré la culture de masse et la société de consommation depuis son atelier new-yorkais The Factory."
  },

  // ━━━ GAMING : CONSOLES & HISTOIRE (20) ━━━
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'easy',
    q: "Quelle console de jeu portable révolutionnaire lancée par Nintendo en 1989 était vendue avec le jeu de puzzle Tetris ?",
    good: "La Game Boy",
    bads: ["La Game Gear", "L'Atari Lynx", "La PlayStation Portable"],
    exp: "Conçue par Gunpei Yokoi, la Game Boy s'est écoulée à plus de 118 millions d'exemplaires avec sa version Color."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'easy',
    q: "Quel constructeur japonais a lancé la première console de jeux PlayStation en 1994 au Japon ?",
    good: "Sony",
    bads: ["Nintendo", "Sega", "Panasonic"],
    exp: "Sony Computer Entertainment est entré sur le marché du jeu vidéo avec la PlayStation de salon dotée d'un lecteur CD-ROM."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'easy',
    q: "Quelle console de salon sortie en 2000 par Sony est devenue la console la plus vendue de tous les temps avec plus de 155 millions d'exemplaires ?",
    good: "La PlayStation 2",
    bads: ["La PlayStation", "La Xbox 360", "La Nintendo Wii"],
    exp: "La PS2 a dominé sa génération grâce à son imposante ludothèque et son lecteur de DVD intégré abordable."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'easy',
    q: "Quelle console de salon lancée par Nintendo en 2006 a démocratisé les jeux vidéo auprès du grand public grâce à sa télécommande gyroscopique ?",
    good: "La Wii",
    bads: ["La GameCube", "La Wii U", "La Nintendo 64"],
    exp: "La Nintendo Wii et sa Wiimote ont séduit des millions de familles et joueurs occasionnels notamment avec le jeu Wii Sports."
  },
  {
    cat: 'gaming',
    sub: 'consoles-histoire',
    diff: 'medium',
    q: "Quel était le nom de la toute première console de jeux vidéo de salon commercialisée pour le grand public en 1972 par Ralph Baer ?",
    good: "La Magnavox Odyssey",
    bads: ["L'Atari 2600", "La ColecoVision", "L'Intellivision"],
    exp: "La Magnavox Odyssey fonctionnait avec des calques transparents de couleur à plaquer sur l'écran du téléviseur."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'medium',
    q: "Quelle console de salon sortie par Sega en 1998 au Japon était équipée d'un modem intégré et de cartes mémoire à écran appelées VMU ?",
    good: "La Dreamcast",
    bads: ["La Sega Saturn", "La Mega Drive", "La Master System"],
    exp: "La Dreamcast était la première console 128 bits mais fut la dernière machine de salon produite par la firme Sega."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'medium',
    q: "Quelle entreprise américaine a fait son entrée sur le marché des consoles de salon en novembre 2001 avec la Xbox ?",
    good: "Microsoft",
    bads: ["Apple", "IBM", "Commodore"],
    exp: "Microsoft a lancé la Xbox avec un disque dur intégré et le jeu de tir culte Halo: Combat Evolved."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'easy',
    q: "Quelle console hybride salon/portable lancée par Nintendo en mars 2017 utilise des manettes détachables appelées Joy-Con ?",
    good: "La Nintendo Switch",
    bads: ["La Wii U", "La Nintendo 3DS", "La PlayStation Vita"],
    exp: "La Nintendo Switch permet de jouer aussi bien sur un téléviseur que de manière nomade en mode portable."
  },
  {
    cat: 'gaming',
    sub: 'arcade-retro',
    diff: 'medium',
    q: "Quel jeu d'arcade historique sorti en 1980 met en scène une créature jaune circulaire mangeant des pac-gommes dans un labyrinthe ?",
    good: "Pac-Man",
    bads: ["Space Invaders", "Donkey Kong", "Galaga"],
    exp: "Créé par Toru Iwatani pour Namco, Pac-Man est devenu l'une des icônes les plus reconnaissables de la culture populaire."
  },
  {
    cat: 'gaming',
    sub: 'createurs',
    diff: 'medium',
    q: "Quel créateur de génie japonais chez Nintendo a conçu les franchises universelles Mario, The Legend of Zelda et Donkey Kong ?",
    good: "Shigeru Miyamoto",
    bads: ["Hideo Kojima", "Shinji Mikami", "Satoru Iwata"],
    exp: "Shigeru Miyamoto est considéré comme le père du jeu vidéo moderne et des plateformes en 2D et 3D."
  },
  {
    cat: 'gaming',
    sub: 'jeux-cultes',
    diff: 'easy',
    q: "Dans quel jeu vidéo de survie et de construction sorti en 2011 les joueurs évoluent-ils dans un monde infini composé de blocs 3D cubiques ?",
    good: "Minecraft",
    bads: ["Terraria", "Roblox", "Lego Worlds"],
    exp: "Créé par Markus Persson ('Notch'), Minecraft est le jeu vidéo le plus vendu de tous les temps avec plus de 300 millions d'exemplaires."
  },
  {
    cat: 'gaming',
    sub: 'jeux-cultes',
    diff: 'medium',
    q: "Quelle série de jeux vidéo d'action-aventure cinématique met en scène l'archéologue intrépide Lara Croft ?",
    good: "Tomb Raider",
    bads: ["Uncharted", "Prince of Persia", "Assassin's Creed"],
    exp: "Tomb Raider a débuté en 1996 sur PlayStation, Saturn et PC avec son héroïne britannique devenue une icône du média."
  },
  {
    cat: 'gaming',
    sub: 'createurs',
    diff: 'medium',
    q: "Quel concepteur de jeux japonais a créé la saga d'espionnage tactique 'Metal Gear' et son héros Solid Snake ?",
    good: "Hideo Kojima",
    bads: ["Shinji Mikami", "Hideki Kamiya", "Tetsuya Nomura"],
    exp: "Hideo Kojima est réputé pour sa mise en scène cinématographique et ses intrigues géopolitiques complexes."
  },
  {
    cat: 'gaming',
    sub: 'jeux-cultes',
    diff: 'easy',
    q: "Dans quel jeu de tir multijoueur de type Battle Royale développé par Epic Games 100 joueurs s'affrontent-ils sur une île en construisant des abris ?",
    good: "Fortnite",
    bads: ["PUBG", "Apex Legends", "Call of Duty: Warzone"],
    exp: "Le mode Battle Royale de Fortnite lancé en 2017 a connu un succès planétaire massif auprès des jeunes générations."
  },
  {
    cat: 'gaming',
    sub: 'consoles',
    diff: 'hard',
    q: "Quelle console de salon 16 bits de Nintendo sortie en 1990 proposait le 'Mode 7' permettant des rotations et zooms spectaculaires de décors ?",
    good: "La Super Nintendo",
    bads: ["La Nintendo 64", "La Mega Drive", "La PC-Engine"],
    exp: "La Super Nintendo (SNES / Super Famicom) utilisait le Mode 7 pour des jeux cultes comme Super Mario Kart ou F-Zero."
  },
  {
    cat: 'gaming',
    sub: 'mascottes',
    diff: 'medium',
    q: "Quel hérisson bleu ultra-rapide portant des baskets rouges est la mascotte historique créée par Sega en 1991 ?",
    good: "Sonic",
    bads: ["Tails", "Knuckles", "Shadow"],
    exp: "Sonic the Hedgehog a été imaginé par Yuji Naka et Naoto Ohshima pour rivaliser directement avec la mascotte Mario de Nintendo."
  },
  {
    cat: 'gaming',
    sub: 'jeux-cultes',
    diff: 'medium',
    q: "Quel RPG monumental développé par CD Projekt Red en 2015 met en scène le sorceleur Geralt de Riv à la recherche de Ciri ?",
    good: "The Witcher 3: Wild Hunt",
    bads: ["Skyrim", "Dragon Age: Inquisition", "Dark Souls III"],
    exp: "The Witcher 3 est l'un des jeux de rôle les plus primés de l'histoire, adapté des romans de l'auteur polonais Andrzej Sapkowski."
  },
  {
    cat: 'gaming',
    sub: 'studios',
    diff: 'hard',
    q: "Quel studio japonais dirigé par Hidetaka Miyazaki est célèbre pour ses jeux d'action impitoyables comme Dark Souls, Bloodborne et Elden Ring ?",
    good: "FromSoftware",
    bads: ["Capcom", "Square Enix", "Koei Tecmo"],
    exp: "FromSoftware a instauré le genre des 'Souls-like', caractérisé par son exigence de gameplay et son univers de dark fantasy."
  },
  {
    cat: 'gaming',
    sub: 'rpg',
    diff: 'medium',
    q: "Dans quelle saga de RPG de Square Enix retrouve-t-on le personnage emblématique de Cloud Strife et son épée géante Buster Sword ?",
    good: "Final Fantasy VII",
    bads: ["Dragon Quest VIII", "Kingdom Hearts", "Chrono Trigger"],
    exp: "Final Fantasy VII sorti en 1997 sur PlayStation a popularisé les J-RPG dans le monde occidental avec un succès critique colossal."
  },
  {
    cat: 'gaming',
    sub: 'mascottes',
    diff: 'easy',
    q: "Quel plombier moustachu vêtu d'une salopette bleue et d'une casquette rouge est le personnage emblématique de Nintendo ?",
    good: "Mario",
    bads: ["Luigi", "Wario", "Toad"],
    exp: "Mario est apparu pour la première fois sous le nom de Jumpman dans le jeu d'arcade Donkey Kong en 1981."
  },

  // ━━━ MANGA & ANIME : AUTEURS & ŒUVRES (20) ━━━
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'easy',
    q: "Quel mangaka légendaire a créé la saga d'aventure et de combats 'Dragon Ball' et les aventures de Son Goku ?",
    good: "Akira Toriyama",
    bads: ["Masashi Kishimoto", "Eiichiro Oda", "Hirohiko Araki"],
    exp: "Akira Toriyama a marqué des générations entières avec Dragon Ball, Dr. Slump et ses designs pour la série de jeux Dragon Quest."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'easy',
    q: "Quel mangaka japonais est l'auteur du manga le plus vendu de tous les temps intitulé 'One Piece' ?",
    good: "Eiichiro Oda",
    bads: ["Tite Kubo", "Yoshihiro Togashi", "Masashi Kishimoto"],
    exp: "Eiichiro Oda publie les aventures de Monkey D. Luffy dans le Weekly Shōnen Jump depuis juillet 1997."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'easy',
    q: "Quel mangaka a créé le manga 'Naruto' racontant le parcours d'un jeune ninja rejeté rêvant de devenir Hokage ?",
    good: "Masashi Kishimoto",
    bads: ["Tite Kubo", "Yoshihiro Togashi", "Ken Wakui"],
    exp: "Masashi Kishimoto a séduit des millions de lecteurs à travers le monde avec son univers de ninjas et son village de Konoha."
  },
  {
    cat: 'manga-anime',
    sub: 'seinen',
    diff: 'medium',
    q: "Quel auteur a créé le sombre manga de dark fantasy 'Berserk' et son héros manchot armé d'une épée géante nommé Guts ?",
    good: "Kentaro Miura",
    bads: ["Takehiko Inoue", "Tsutomu Nihei", "Hiroaki Samura"],
    exp: "Kentaro Miura a dessiné Berserk avec un niveau de détail graphique et une intensité dramatique hors du commun."
  },
  {
    cat: 'manga-anime',
    sub: 'seinen',
    diff: 'medium',
    q: "Quel mangaka virtuose a signé le manga d'anticipation post-apocalyptique 'Akira' situé dans Neo-Tokyo en 2019 ?",
    good: "Katsuhiro Otomo",
    bads: ["Masamune Shirow", "Satoshi Kon", "Mamoru Oshii"],
    exp: "Katsuhiro Otomo a réalisé à la fois le manga monumental et le film d'animation révolutionnaire sorti en 1988."
  },
  {
    cat: 'manga-anime',
    sub: 'sport-manga',
    diff: 'medium',
    q: "Quel mangaka a signé à la fois le manga sur le basketball 'Slam Dunk' et le chef-d'œuvre historique 'Vagabond' ?",
    good: "Takehiko Inoue",
    bads: ["Tadatoshi Fujimaki", "Naoki Urasawa", "Mitsuru Adachi"],
    exp: "Takehiko Inoue est réputé pour son trait réaliste virtuose au pinceau et son sens du mouvement."
  },
  {
    cat: 'manga-anime',
    sub: 'seinen',
    diff: 'medium',
    q: "Quel mangaka est l'auteur des thrillers psychologiques captivants 'Monster' et '20th Century Boys' ?",
    good: "Naoki Urasawa",
    bads: ["Inio Asano", "Jiro Taniguchi", "Shuzo Oshimi"],
    exp: "Naoki Urasawa excelle dans les intrigues policières à suspense et les récits choraux complexes."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'easy',
    q: "Dans quel manga scénarisé par Tsugumi Ohba un lycéen brillant nommé Light Yagami trouve-t-il un carnet provoquant la mort ?",
    good: "Death Note",
    bads: ["Code Geass", "Psycho-Pass", "Tokyo Ghoul"],
    exp: "Death Note met en scène un duel intellectuel fascinant entre Light Yagami et le détective prodige L."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'medium',
    q: "Quel mangaka est le créateur de la saga multigénérationnelle 'JoJo's Bizarre Adventure' et du concept de 'Stands' ?",
    good: "Hirohiko Araki",
    bads: ["Yoshihiro Togashi", "Kazuki Takahashi", "Go Nagai"],
    exp: "Hirohiko Araki publie la saga JoJo depuis 1987, célèbre pour ses poses théâtrales et ses références au monde de la mode et du rock."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'medium',
    q: "Quel mangaka marié à Naoko Takeuchi (créatrice de Sailor Moon) a créé les séries cultes 'Yū Yū Hakusho' et 'Hunter × Hunter' ?",
    good: "Yoshihiro Togashi",
    bads: ["Tite Kubo", "Masashi Kishimoto", "Katsura Hoshino"],
    exp: "Yoshihiro Togashi est réputé pour son système complexe d'énergie du Nen et ses scénarios imprévisibles."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'medium',
    q: "Quelle mangaka japonaise a créé le manga d'aventure alchimique 'Fullmetal Alchemist' mettant en scène les frères Elric ?",
    good: "Hiromu Arakawa",
    bads: ["Rumiko Takahashi", "CLAMP", "Mizuho Kusanagi"],
    exp: "Hiromu Arakawa a imaginé la quête d'Edward et Alphonse Elric pour retrouver leurs corps grâce à la pierre philosophale."
  },
  {
    cat: 'manga-anime',
    sub: 'comedie-romance',
    diff: 'medium',
    q: "Quelle mangaka prolifique est l'autrice de mangas populaires tels que 'Ranma ½', 'Inu-Yasha' et 'Urusei Yatsura' (Lamu) ?",
    good: "Rumiko Takahashi",
    bads: ["Hiromu Arakawa", "Ai Yazawa", "Riyoko Ikeda"],
    exp: "Rumiko Takahashi a reçu le Grand Prix de la ville d'Angoulême en 2019 pour l'ensemble de sa carrière exceptionnelle."
  },
  {
    cat: 'manga-anime',
    sub: 'animation-ghibli',
    diff: 'easy',
    q: "Quel grand réalisateur japonais cofondateur du Studio Ghibli a signé 'Le Voyage de Chihiro' et 'Mon voisin Totoro' ?",
    good: "Hayao Miyazaki",
    bads: ["Isao Takahata", "Makoto Shinkai", "Mamoru Hosoda"],
    exp: "Hayao Miyazaki est une légende vivante de l'animation mondiale, récompensé par deux Oscars du meilleur film d'animation."
  },
  {
    cat: 'manga-anime',
    sub: 'animation-ghibli',
    diff: 'medium',
    q: "Quel film d'animation poignant réalisé par Isao Takahata en 1988 raconte le destin tragique de Seita et sa petite sœur Setsuko ?",
    good: "Le Tombeau des lucioles",
    bads: ["Le Vent se lève", "Princesse Mononoké", "Souvenirs goutte à goutte"],
    exp: "Le Tombeau des lucioles est un drame déchirant sur les ravages de la Seconde Guerre mondiale au Japon."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'medium',
    q: "Dans quel manga de dark fantasy créé par Hajime Isayama l'humanité vit-elle retranchée derrière trois immenses murs protecteurs ?",
    good: "L'Attaque des Titans",
    bads: ["Tokyo Ghoul", "Chainsaw Man", "Jujutsu Kaisen"],
    exp: "L'Attaque des Titans (Shingeki no Kyojin) raconte le combat d'Eren Jäger contre de monstrueux humanoïdes mangeurs d'hommes."
  },
  {
    cat: 'manga-anime',
    sub: 'pionniers',
    diff: 'hard',
    q: "Quel mangaka est considéré comme le 'Dieu du manga' ('Manga no Kamisama') pour avoir créé 'Astro Boy' et 'Black Jack' ?",
    good: "Osamu Tezuka",
    bads: ["Shotaro Ishinomori", "Go Nagai", "Leiji Matsumoto"],
    exp: "Osamu Tezuka a codifié le manga moderne au sortir de la Seconde Guerre mondiale avec son découpage cinématographique novateur."
  },
  {
    cat: 'manga-anime',
    sub: 'shonen',
    diff: 'medium',
    q: "Quel mangaka a créé le manga policier à succès 'Détective Conan' mettant en scène un lycéen rajeuni dans un corps d'enfant ?",
    good: "Gosho Aoyama",
    bads: ["Shinichi Ishizuka", "Yusei Matsui", "Boichi"],
    exp: "Gosho Aoyama publie les enquêtes de Shinichi Kudo sous le nom d'emprunt de Conan Edogawa depuis 1994."
  },
  {
    cat: 'manga-anime',
    sub: 'sport-manga',
    diff: 'easy',
    q: "Dans quel manga culte de football de Yōichi Takahashi suit-on l'ascension sportive du jeune Tsubasa Ozora (Olivier Atton) ?",
    good: "Captain Tsubasa",
    bads: ["Blue Lock", "Inazuma Eleven", "Whistle!"],
    exp: "Captain Tsubasa (Olive et Tom en France) a suscité des vocations de footballeurs professionnels à travers le monde."
  },
  {
    cat: 'manga-anime',
    sub: 'animation',
    diff: 'medium',
    q: "Quel réalisateur japonais virtuose du film d'animation a signé 'Your Name' (Kimi no Na wa) et 'Les Enfants du Temps' ?",
    good: "Makoto Shinkai",
    bads: ["Mamoru Hosoda", "Satoshi Kon", "Sunao Katabuchi"],
    exp: "Your Name de Makoto Shinkai a battu des records historiques au box-office mondial en 2016."
  },
  {
    cat: 'manga-anime',
    sub: 'mecha',
    diff: 'hard',
    q: "Quel créateur a imaginé le robot géant 'Goldorak' (UFO Robot Grendizer) ainsi que 'Mazinger Z' et 'Devilman' ?",
    good: "Go Nagai",
    bads: ["Leiji Matsumoto", "Shotaro Ishinomori", "Yoshiyuki Tomino"],
    exp: "Go Nagai est le pionnier des séries de mécha géants pilotés de l'intérieur par des héros humains."
  },

  // ━━━ CINÉMA : RÉALISATEURS & CHEFS-D'ŒUVRE (20) ━━━
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'easy',
    q: "Quel cinéaste américain a réalisé 'Les Dents de la mer', 'E.T. l'extra-terrestre', 'Jurassic Park' et 'La Liste de Schindler' ?",
    good: "Steven Spielberg",
    bads: ["George Lucas", "James Cameron", "Robert Zemeckis"],
    exp: "Steven Spielberg est le réalisateur le plus prolifique et rentable de l'histoire du cinéma hollywoodien."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'easy',
    q: "Quel réalisateur britannique surnommé le 'Maître du suspense' a signé des chefs-d'œuvre comme 'Psychose', 'Fenêtre sur cour' et 'Sueurs froides' ?",
    good: "Alfred Hitchcock",
    bads: ["Stanley Kubrick", "Billy Wilder", "Orson Welles"],
    exp: "Alfred Hitchcock a inventé de nombreuses techniques modernes de montage et de cadrage au cinéma."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste perfectionniste a réalisé '2001, l'Odyssée de l'espace', 'Orange mécanique' et 'Shining' ?",
    good: "Stanley Kubrick",
    bads: ["Ridley Scott", "David Lynch", "Francis Ford Coppola"],
    exp: "Stanley Kubrick était réputé pour son souci obsessionnel du cadrage géométrique et de la précision technique."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel réalisateur a adapté la trilogie romanesque du 'Parrain' de Mario Puzo et dirigé le film dantesque 'Apocalypse Now' ?",
    good: "Francis Ford Coppola",
    bads: ["Martin Scorsese", "Brian De Palma", "Michael Cimino"],
    exp: "Francis Ford Coppola était l'une des figures de proue du mouvement du Nouvel Hollywood dans les années 1970."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'easy',
    q: "Quel réalisateur cinéphile américain a dirigé les films cultes 'Pulp Fiction', 'Reservoir Dogs' et 'Kill Bill' ?",
    good: "Quentin Tarantino",
    bads: ["David Fincher", "Robert Rodriguez", "Paul Thomas Anderson"],
    exp: "Quentin Tarantino est célèbre pour ses dialogues percutants, sa narration non linéaire et ses hommages cinéphiles."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'easy',
    q: "Quel cinéaste canadien a réalisé les deux films les plus vus de l'histoire mondiale du cinéma, 'Titanic' et 'Avatar' ?",
    good: "James Cameron",
    bads: ["Denis Villeneuve", "Peter Jackson", "Christopher Nolan"],
    exp: "James Cameron est un pionnier des effets spéciaux numériques et de la technologie 3D relief au cinéma."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel réalisateur italo-américain fétiche de Robert De Niro et Leonardo DiCaprio a réalisé 'Taxi Driver', 'Les Affranchis' et 'Casino' ?",
    good: "Martin Scorsese",
    bads: ["Brian De Palma", "Francis Ford Coppola", "Michael Mann"],
    exp: "Martin Scorsese est l'un des plus grands maîtres du cinéma américain explorant la culpabilité et le monde du crime."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste britannique a mis en scène la trilogie 'The Dark Knight' ainsi que les films conceptuels 'Inception', 'Interstellar' et 'Oppenheimer' ?",
    good: "Christopher Nolan",
    bads: ["Denis Villeneuve", "David Fincher", "Sam Mendes"],
    exp: "Christopher Nolan privilégie les effets spéciaux pratiques, le grand format IMAX et les distorsions temporelles."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste québécois a réalisé des œuvres de science-fiction remarquées comme 'Premier Contact', 'Blade Runner 2049' et 'Dune' ?",
    good: "Denis Villeneuve",
    bads: ["Jean-Marc Vallée", "David Cronenberg", "Xavier Dolan"],
    exp: "Denis Villeneuve s'est imposé comme un des réalisateurs de science-fiction les plus visionnaires de sa génération."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel réalisateur néo-zélandais a adapté avec succès au cinéma la monumentale trilogie littéraire du 'Seigneur des anneaux' de J.R.R. Tolkien ?",
    good: "Peter Jackson",
    bads: ["George Lucas", "Guillermo del Toro", "James Wan"],
    exp: "La trilogie du Seigneur des anneaux tournée en Nouvelle-Zélande a remporté 17 Oscars dont 11 pour Le Retour du roi."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste italien a inventé le genre du western spaghetti avec sa trilogie du dollar mettant en vedette Clint Eastwood ?",
    good: "Sergio Leone",
    bads: ["Federico Fellini", "Luchino Visconti", "Michelangelo Antonioni"],
    exp: "Sergio Leone a transcendé le western avec Pour une poignée de dollars, Et pour quelques dollars de plus et Le Bon, la Brute et le Truand."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste italien baroque et onirique a réalisé 'La dolce vita', 'Huit et demi' et 'Amarcord' ?",
    good: "Federico Fellini",
    bads: ["Roberto Rossellini", "Vittorio De Sica", "Pier Paolo Pasolini"],
    exp: "Federico Fellini a remporté quatre fois l'Oscar du meilleur film en langue étrangère au cours de sa carrière."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'easy',
    q: "Quel cinéaste a créé la saga galactique de 'Star Wars' ainsi que le personnage de l'archéologue baroudeur Indiana Jones ?",
    good: "George Lucas",
    bads: ["Steven Spielberg", "Irvin Kershner", "Lawrence Kasdan"],
    exp: "George Lucas a fondé la société de production Lucasfilm et révolutionné les effets spéciaux avec Industrial Light & Magic (ILM)."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'hard',
    q: "Quel réalisateur japonais de légende a signé des chefs-d'œuvre humanistes comme 'Les Sept Samouraïs', 'Rashōmon' et 'Ran' ?",
    good: "Akira Kurosawa",
    bads: ["Yasujiro Ozu", "Kenji Mizoguchi", "Masaki Kobayashi"],
    exp: "Akira Kurosawa a profondément influencé le cinéma mondial, inspirant des réalisateurs comme George Lucas et Sergio Leone."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel réalisateur britannique a mis en scène les films dystopiques et spatiaux majeurs 'Alien, le huitième passager', 'Blade Runner' et 'Gladiator' ?",
    good: "Ridley Scott",
    bads: ["Tony Scott", "James Cameron", "Paul Verhoeven"],
    exp: "Ridley Scott est réputé pour sa puissance visuelle et la création d'univers de science-fiction fondateurs."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel cinéaste américain a réalisé les thrillers psychologiques méticuleux 'Seven', 'Fight Club', 'Zodiac' et 'Gone Girl' ?",
    good: "David Fincher",
    bads: ["Christopher Nolan", "Darren Aronofsky", "Denis Villeneuve"],
    exp: "David Fincher est réputé pour son perfectionnisme technique absolu et son esthétique sombre et clinique."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'medium',
    q: "Quel réalisateur mexicain féru de monstres poétiques a réalisé 'Le Labyrinthe de Pan' et le film oscarisé 'La Forme de l'eau' ?",
    good: "Guillermo del Toro",
    bads: ["Alfonso Cuarón", "Alejandro González Iñárritu", "Robert Rodriguez"],
    exp: "Guillermo del Toro mêle le conte de fées macabre, l'horreur gothique et la fable politique antifasciste."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'hard',
    q: "Quel cinéaste suédois a signé des chefs-d'œuvre métaphysiques sur la foi et l'angoisse comme 'Le Septième Sceau' et 'Persona' ?",
    good: "Ingmar Bergman",
    bads: ["Lars von Trier", "Carl Theodor Dreyer", "Roy Andersson"],
    exp: "Ingmar Bergman a immortalisé la partie d'échecs emblématique avec la Mort dans Le Septième Sceau en 1957."
  },
  {
    cat: 'cinema',
    sub: 'realisateurs',
    diff: 'hard',
    q: "Quel cinéaste russe a réalisé des poèmes cinématographiques contemplatifs d'une beauté mystique comme 'Solaris', 'Le Miroir' et 'Stalker' ?",
    good: "Andreï Tarkovski",
    bads: ["Sergueï Eisenstein", "Dziga Vertov", "Elem Klimov"],
    exp: "Andreï Tarkovski considérait le cinéma comme une sculpture du temps ('sculpter dans le temps')."
  },
  {
    cat: 'cinema',
    sub: 'cinema-muet',
    diff: 'easy',
    q: "Quel acteur et réalisateur de génie a incarné le personnage mondialement célèbre de Charlot avec canne et chapeau melon dans le cinéma muet ?",
    good: "Charlie Chaplin",
    bads: ["Buster Keaton", "Harold Lloyd", "Stan Laurel"],
    exp: "Charlie Chaplin a réalisé et interprété des chefs-d'œuvre impérissables comme Les Temps modernes et Le Dictateur."
  }
];

// Let's also add 120 more questions across categories to guarantee crossing 4,000!
const BONUS_SPECS: QuestionSpec[] = [
  // ━━━ JEUX DE SOCIÉTÉ (15) ━━━
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Combien de cases compte le plateau traditionnel du jeu d'échecs ?",
    good: "64 cases",
    bads: ["50 cases", "81 cases", "100 cases"],
    exp: "Le plateau d'échecs ou échiquier se compose de 64 cases alternant cases claires et sombres (8x8)."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Quelle pièce du jeu d'échecs peut sauter par-dessus d'autres pièces en se déplaçant en forme de 'L' ?",
    good: "Le cavalier",
    bads: ["Le fou", "La tour", "La dame"],
    exp: "Le cavalier est l'unique pièce d'échecs capable de sauter par-dessus les pièces amies ou adverses."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Combien de pions chaque joueur possède-t-il au départ d'une partie de dames internationales ?",
    good: "20 pions",
    bads: ["16 pions", "24 pions", "12 pions"],
    exp: "Sur un damier de 100 cases (jeu international à la française), chaque joueur dispose de 20 pions."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu de société de Klaus Teuber les joueurs colonisent-ils une île en récoltant argile, bois, blé, minerai et laine ?",
    good: "Les Colons de Catane",
    bads: ["Carcassonne", "Les Aventuriers du Rail", "Pandemic"],
    exp: "Catane (Catan), créé en 1995 en Allemagne, a inauguré l'âge d'or du jeu de société moderne de gestion."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu de pose de tuiles de Klaus-Jürgen Wrede les joueurs construisent-ils des routes, cités et monastères médiévaux ?",
    good: "Carcassonne",
    bads: ["Dixit", "7 Wonders", "Splendor"],
    exp: "Carcassonne a remporté le prestigieux Spiel des Jahres en 2001 et popularisé les figurines appelées 'meeples'."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'easy',
    q: "Dans quel jeu de plateau ferroviaire d'Alan R. Moon les joueurs relient-ils des villes par des lignes de train de couleur ?",
    good: "Les Aventuriers du Rail",
    bads: ["Ticket to Ride", "Colt Express", "Steam"],
    exp: "Les Aventuriers du Rail (Ticket to Ride) est un classique moderne récompensé par le Spiel des Jahres en 2004."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu de cartes coopératif de Matt Leacock les joueurs incarnent-ils des spécialistes luttant contre 4 épidémies mondiales ?",
    good: "Pandemic",
    bads: ["Ghost Stories", "The Island", "Horreur à Arkham"],
    exp: "Pandemic est l'archétype du jeu coopératif où les joueurs gagnent ou perdent ensemble contre le plateau."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'easy',
    q: "Dans quel jeu d'ambiance et de déduction poétique primé de Jean-Louis Roubira les joueurs doivent-ils deviner une carte illustrée selon une phrase énigmatique ?",
    good: "Dixit",
    bads: ["Mysterium", "Codenames", "Concept"],
    exp: "Dixit utilise de grandes cartes oniriques dessinées par Marie Cardouat et a remporté le Spiel des Jahres en 2010."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu d'association d'idées de Vlaada Chvátil deux maîtres-espions doivent-ils faire deviner des mots à leurs coéquipiers via un indice et un chiffre ?",
    good: "Codenames",
    bads: ["Decrypto", "Just One", "Time's Up!"],
    exp: "Codenames a été récompensé par le Spiel des Jahres en 2016 et s'est vendu à des millions d'exemplaires."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu de draft d'Antoine Bauza les joueurs développent-ils une cité antique autour d'un monument grandiose sur 3 âges ?",
    good: "7 Wonders",
    bads: ["Civilization", "Tapestry", "Terraforming Mars"],
    exp: "7 Wonders est l'un des jeux les plus primés au monde, célèbre pour son mécanisme fluide de draft de cartes simultané."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Dans le jeu du Monopoly classique français, quelle est la rue ou avenue la plus chère du plateau ?",
    good: "Rue de la Paix",
    bads: ["Champs-Élysées", "Boulevard Saint-Michel", "Avenue Foch"],
    exp: "La Rue de la Paix (bleu foncé) coûte 400 francs/euros à l'achat et inflige les loyers les plus élevés du jeu."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Combien de lettres comprend le tirage d'un joueur dans son chevalet au jeu de Scrabble en début de tour ?",
    good: "7 lettres",
    bads: ["6 lettres", "8 lettres", "9 lettres"],
    exp: "Chaque joueur conserve 7 lettres sur son chevalet et marquer un coup en plaçant ses 7 lettres s'appelle un 'Scrabble'."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Dans le jeu d'enquête Cluedo, quel suspect masculin vêtu de jaune porte un grade militaire ?",
    good: "Colonel Moutarde",
    bads: ["Professeur Violet", "Docteur Orchidée", "Révérend Olive"],
    exp: "Le Colonel Moutarde (Colonel Mustard) est l'un des six suspects traditionnels du manoir Tudor."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'classiques',
    diff: 'easy',
    q: "Combien de dominos composent un jeu traditionnel de dominos 'double-six' standard ?",
    good: "28 dominos",
    bads: ["24 dominos", "32 dominos", "36 dominos"],
    exp: "Un jeu de dominos standard double-six comporte 28 tuiles rectangulaires numérotées de 0 (blanc) à 6."
  },
  {
    cat: 'jeux-de-societe',
    sub: 'modernes',
    diff: 'medium',
    q: "Dans quel jeu de cartes rapide d'observation et de réflexes les joueurs doivent-ils repérer le symbole unique commun entre deux cartes rondes ?",
    good: "Dobble",
    bads: ["Jungle Speed", "Bazar Bizarre", "Taco Chat"],
    exp: "Dobble repose sur un théorème géométrique assurant qu'il existe toujours un et un seul symbole partagé entre deux cartes."
  },

  // ━━━ COMICS & BANDE DESSINÉE (15) ━━━
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'easy',
    q: "Quel auteur et dessinateur belge a créé le célèbre reporter Tintin et son fidèle chien Milou en 1929 ?",
    good: "Hergé",
    bads: ["Franquin", "Peyo", "Morris"],
    exp: "Georges Remi, dit Hergé, est le père de la 'Ligne claire' dans la bande dessinée franco-belge."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'easy',
    q: "Quel dessinateur belge a créé le gaffeur de rédaction Gaston Lagaffe ainsi que le Marsupilami dans Spirou ?",
    good: "André Franquin",
    bads: ["Peyo", "Jijé", "Maurice Tillieux"],
    exp: "Franquin a insufflé une expressivité graphique révolutionnaire dans Gaston Lagaffe et Les Idées noires."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'easy',
    q: "Quel auteur belge a donné naissance aux petits lutins bleus coiffés d'un bonnet blanc appelés les Schtroumpfs en 1958 ?",
    good: "Peyo",
    bads: ["Rob-Vel", "Dupa", "Derib"],
    exp: "Pierre Culliford, dit Peyo, a introduit les Schtroumpfs dans une aventure de Johan et Pirlouit ('La Flûte à six trous')."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'easy',
    q: "Quel dessinateur a créé le cow-boy Lucky Luke, 'l'homme qui tire plus vite que son ombre' ?",
    good: "Morris",
    bads: ["René Goscinny", "Hergé", "Giraud"],
    exp: "Morris (Maurice de Bevere) a créé Lucky Luke en 1946, secondé par le génial scénariste René Goscinny à partir de 1955."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'medium',
    q: "Quel duo de scénariste et dessinateur a créé en 1959 le petit guerrier gaulois Astérix dans le journal Pilote ?",
    good: "Goscinny et Uderzo",
    bads: ["Hergé et Jacobs", "Morris et Franquin", "Charlier et Giraud"],
    exp: "René Goscinny au scénario et Albert Uderzo au dessin ont créé Astérix, traduit dans plus de 110 langues et dialectes."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'medium',
    q: "Sous quel pseudonyme d'artiste le créateur graphique de Blueberry a-t-il révolutionné la bande dessinée de science-fiction avec L'Incal ?",
    good: "Mœbius",
    bads: ["Philippe Druillet", "Enki Bilal", "Jacques Tardi"],
    exp: "Jean Giraud signait sous le nom de Mœbius ses récits visionnaires de science-fiction (Arzach, Le Garage hermétique, L'Incal)."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'medium',
    q: "Quel auteur belge a créé les officiers britanniques Francis Blake et Philip Mortimer confrontés au colonel Olrik ?",
    good: "Edgar P. Jacobs",
    bads: ["Jacques Martin", "Hergé", "Bob de Moor"],
    exp: "Edgar P. Jacobs a publié Le Secret de l'Espadon dès le premier numéro du journal Tintin en 1946."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'easy',
    q: "Quel éditeur américain de comics a créé les super-héros Spider-Man, Iron Man, Hulk, Thor et les X-Men ?",
    good: "Marvel Comics",
    bads: ["DC Comics", "Image Comics", "Dark Horse"],
    exp: "Marvel Comics a connu son envol dans les années 1960 sous l'impulsion de Stan Lee et Jack Kirby."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'easy',
    q: "Quel scénariste de génie chez Marvel Comics a cocréé Spider-Man, les Quatre Fantastiques, les Avengers et Daredevil ?",
    good: "Stan Lee",
    bads: ["Bob Kane", "Frank Miller", "Alan Moore"],
    exp: "Stan Lee est la figure de proue historique de Marvel, célèbre pour sa devise 'Excelsior!' et ses caméos au cinéma."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'easy',
    q: "Quel super-héros extraterrestre originaire de la planète Krypton a été créé par Jerry Siegel et Joe Shuster en 1938 chez DC Comics ?",
    good: "Superman",
    bads: ["Batman", "Flash", "Green Lantern"],
    exp: "Superman est apparu dans Action Comics #1 en juin 1938, inaugurant l'âge d'or des super-héros américains."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'easy',
    q: "Quel justicier masqué milliardaire de Gotham City combat le crime sans super-pouvoirs sous l'identité de Bruce Wayne ?",
    good: "Batman",
    bads: ["Superman", "Green Arrow", "Iron Man"],
    exp: "Créé par Bob Kane et Bill Finger en 1939, Batman protège Gotham City avec son intelligence, ses arts martiaux et ses gadgets."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'medium',
    q: "Quel scénariste britannique a écrit les romans graphiques majeurs 'Watchmen', 'V pour Vendetta' et 'Batman: The Killing Joke' ?",
    good: "Alan Moore",
    bads: ["Neil Gaiman", "Grant Morrison", "Garth Ennis"],
    exp: "Alan Moore a apporté une noirceur psychologique et une densité littéraire inédites au médium du comic book."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'medium',
    q: "Quel auteur américain a réinventé Batman en 1986 avec le chef-d'œuvre crépusculaire 'The Dark Knight Returns' et créé 'Sin City' ?",
    good: "Frank Miller",
    bads: ["Todd McFarlane", "Jim Lee", "Mike Mignola"],
    exp: "The Dark Knight Returns de Frank Miller a durablement marqué l'industrie en modernisant l'image de Batman."
  },
  {
    cat: 'comics-bd',
    sub: 'comics-us',
    diff: 'hard',
    q: "Quel auteur américain a remporté le prix Pulitzer en 1992 pour son roman graphique 'Maus' racontant la Shoah sous forme de souris et de chats ?",
    good: "Art Spiegelman",
    bads: ["Will Eisner", "Joe Sacco", "Alison Bechdel"],
    exp: "Maus est la première bande dessinée de l'histoire à avoir reçu le prestigieux prix Pulitzer."
  },
  {
    cat: 'comics-bd',
    sub: 'franco-belge',
    diff: 'medium',
    q: "Quel dessinateur et scénariste suisse est le créateur du héros d'heroic fantasy amnésique 'Thorgal' né dans les étoiles et élevé par des Vikings ?",
    good: "Grzegorz Rosiński et Jean Van Hamme",
    bads: ["Bourgeon et Lacroix", "Cosey et Derib", "Loisel et Le Tendre"],
    exp: "Thorgal est né de la collaboration entre le scénariste belge Jean Van Hamme et le peintre polonais Grzegorz Rosiński."
  },

  // ━━━ FOOD & GASTRONOMIE (15) ━━━
  {
    cat: 'food',
    sub: 'fromages',
    diff: 'easy',
    q: "Quel fromage à pâte persillée au lait cru de brebis est affiné dans les caves naturelles du mont Combalou en Aveyron ?",
    good: "Le Roquefort",
    bads: ["Le Bleu d'Auvergne", "La Fourme d'Ambert", "Le Gorgonzola"],
    exp: "Le Roquefort bénéficie de la première appellation d'origine protégée reconnue en France en 1925."
  },
  {
    cat: 'food',
    sub: 'fromages',
    diff: 'easy',
    q: "Quel fromage savoyard à pâte pressée cuite au lait cru de vache est moulé en meules géantes au talon concave ?",
    good: "Le Beaufort",
    bads: ["Le Comté", "L'Emmental", "L'Abondance"],
    exp: "Le Beaufort est surnommé le 'Prince des gruyères' et produit en haute montagne dans les Alpes savoyardes."
  },
  {
    cat: 'food',
    sub: 'patisserie',
    diff: 'easy',
    q: "Quelle pâtisserie française traditionnelle est constituée de trois couches de pâte feuilletée et de deux couches de crème pâtissière ?",
    good: "Le mille-feuille",
    bads: ["L'éclair", "Le Paris-Brest", "L'Opéra"],
    exp: "Le mille-feuille est traditionnellement glacé au fondant avec un marbrage caractéristique au chocolat."
  },
  {
    cat: 'food',
    sub: 'patisserie',
    diff: 'medium',
    q: "Quelle pâtisserie en forme de couronne créée en 1910 commémore une célèbre course cycliste entre la capitale et la Bretagne ?",
    good: "Le Paris-Brest",
    bads: ["Le Saint-Honoré", "La Tropézienne", "Le Baba au rhum"],
    exp: "Créé par Louis Durand à Maisons-Laffitte, le Paris-Brest est garni d'une crème mousseline pralinée et d'amandes effilées."
  },
  {
    cat: 'food',
    sub: 'plats-traditionnels',
    diff: 'easy',
    q: "Quelle spécialité culinaire marocaine et maghrébine est cuite à l'étouffée dans un plat de terre cuite au couvercle conique ?",
    good: "Le tajine",
    bads: ["Le couscous", "La pastilla", "La chakchouka"],
    exp: "Le plat à tajine en terre cuite permet une cuisson lente préservant toutes les saveurs et les jus."
  },
  {
    cat: 'food',
    sub: 'plats-traditionnels',
    diff: 'easy',
    q: "Quelle soupe provençale traditionnelle de pêcheurs marseillais se compose de poissons de roche servis avec des croûtons et de la rouille ?",
    good: "La bouillabaisse",
    bads: ["La soupe au pistou", "La cotriade", "La bourride"],
    exp: "La bouillabaisse marseillaise authentique intègre traditionnellement rascasse, vive, congre, grondin et saint-pierre."
  },
  {
    cat: 'food',
    sub: 'epices',
    diff: 'medium',
    q: "Quelle est l'épice la plus chère au monde, extraite manuellement des trois stigmates séchés de la fleur de crocus ?",
    good: "Le safran",
    bads: ["La vanille", "La cardamome", "Le clou de girofle"],
    exp: "Il faut récolter délicatement à la main plus de 150 000 fleurs de Crocus sativus pour obtenir un kilogramme de safran."
  },
  {
    cat: 'food',
    sub: 'patisserie',
    diff: 'easy',
    q: "Quel dessert italien composé de biscuits imbibés de café, de crème de mascarpone et saupoudré de cacao signifie 'remonte-moi' ?",
    good: "Le tiramisu",
    bads: ["La panna cotta", "Le cannoli", "Le panettone"],
    exp: "Le tiramisù tire son étymologie de la formule vénitienne 'tiramesù' ('tire-moi vers le haut' ou 'redonne-moi des forces')."
  },
  {
    cat: 'food',
    sub: 'patisserie',
    diff: 'medium',
    q: "Quelle viennoiserie bordelaise au cœur moelleux et croûte caramélisée est aromatisée au rhum et à la vanille dans un moule cannelé ?",
    good: "Le cannelé",
    bads: ["Le kouign-amann", "La gaufre liégeoise", "Le financier"],
    exp: "Le cannelé bordelais était originellement préparé avec les jaunes d'œufs inutilisés lors du collage du vin de Bordeaux."
  },
  {
    cat: 'food',
    sub: 'cuisine-monde',
    diff: 'easy',
    q: "Quel plat emblématique de la cuisine espagnole originaire de Valence est à base de riz safrané cuit dans une grande poêle ronde ?",
    good: "La paella",
    bads: ["Le risotto", "Le gazpacho", "La tortilla"],
    exp: "La paella valencienne traditionnelle associe le riz rond de l'Albufera, du poulet, du lapin, des haricots et du safran."
  },
  {
    cat: 'food',
    sub: 'cuisine-monde',
    diff: 'easy',
    q: "Quel mets traditionnel japonais est constitué de riz vinaigré surmonté ou entouré d'une tranche de poisson cru ou de fruits de mer ?",
    good: "Le sushi",
    bads: ["Le ramen", "Le tempura", "Le gyoza"],
    exp: "Le sushi dérive d'une méthode ancestrale de conservation du poisson par la fermentation du riz au Japon."
  },
  {
    cat: 'food',
    sub: 'cuisine-monde',
    diff: 'medium',
    q: "Quel plat mexicain traditionnel consiste en une tortilla de maïs pliée ou enroulée garnie de viandes, coriandre et oignons ?",
    good: "Le taco",
    bads: ["L'empanada", "L'arepa", "Le tamal"],
    exp: "Le taco est un symbole universel de la street food mexicaine classée au patrimoine immatériel de l'UNESCO."
  },
  {
    cat: 'food',
    sub: 'charcuterie',
    diff: 'easy',
    q: "Quel jambon cru italien de renommée mondiale est affiné lentement à l'air sec dans la région d'Émilie-Romagne ?",
    good: "Le jambon de Parme",
    bads: ["Le jambon Serrano", "Le jambon Ibérico", "Le jambon de Bayonne"],
    exp: "Le Prosciutto di Parma bénéficie d'une AOP stricte exigeant des porcs nés et élevés dans le nord de l'Italie."
  },
  {
    cat: 'food',
    sub: 'boissons',
    diff: 'easy',
    q: "Quel vin effervescent d'appellation d'origine contrôlée est produit dans le nord-est de la France selon la méthode traditionnelle ?",
    good: "Le champagne",
    bads: ["Le prosecco", "Le cava", "Le crémant"],
    exp: "Seuls les vins élaborés et mis en bouteille dans la région délimitée de Champagne ont le droit légal d'en porter le nom."
  },
  {
    cat: 'food',
    sub: 'boissons',
    diff: 'medium',
    q: "Quelle eau-de-vie de vin française prestigieuse à double distillation est produite en Charente et Charente-Maritime ?",
    good: "Le cognac",
    bads: ["L'armagnac", "Le calvados", "Le marc de Bourgogne"],
    exp: "Le cognac est distillé deux fois en alambic charentais de cuivre avant un vieillissement prolongé en fûts de chêne."
  },

  // ━━━ TECHNOLOGIE & INFORMATIQUE (15) ━━━
  {
    cat: 'technologie',
    sub: 'informatique',
    diff: 'easy',
    q: "Quel système d'exploitation open source dont la mascotte est le manchot Tux a été créé par Linus Torvalds en 1991 ?",
    good: "Linux",
    bads: ["Windows", "macOS", "FreeBSD"],
    exp: "Linus Torvalds a développé le noyau Linux comme un projet personnel à l'université d'Helsinki avant qu'il n'alimente le Web mondial."
  },
  {
    cat: 'technologie',
    sub: 'web',
    diff: 'easy',
    q: "Quel chercheur britannique a inventé le World Wide Web au CERN en 1989 en créant les protocoles HTTP et HTML ?",
    good: "Tim Berners-Lee",
    bads: ["Vint Cerf", "Alan Turing", "Marc Andreessen"],
    exp: "Tim Berners-Lee a conçu le Web pour faciliter le partage de données entre scientifiques sans déposer de brevet lucratif."
  },
  {
    cat: 'technologie',
    sub: 'programmation',
    diff: 'easy',
    q: "Quel langage de script universel a été créé en seulement 10 jours en 1995 par Brendan Eich pour le navigateur Netscape ?",
    good: "JavaScript",
    bads: ["Python", "Java", "PHP"],
    exp: "Initialement appelé Mocha puis LiveScript, JavaScript est devenu le langage fondamental et incontournable du web interactif."
  },
  {
    cat: 'technologie',
    sub: 'programmation',
    diff: 'easy',
    q: "Quel langage de programmation moderne polyvalent créé par Guido van Rossum en 1991 a été baptisé en hommage aux Monty Python ?",
    good: "Python",
    bads: ["Ruby", "Perl", "C++"],
    exp: "Python est réputé pour sa syntaxe lisible épurée et est devenu la référence de l'intelligence artificielle et de la data science."
  },
  {
    cat: 'technologie',
    sub: 'histoire-informatique',
    diff: 'medium',
    q: "Quelle mathématicienne britannique du XIXe siècle fille de Lord Byron est considérée comme la première programmeuse de l'histoire ?",
    good: "Ada Lovelace",
    bads: ["Grace Hopper", "Margaret Hamilton", "Hedy Lamarr"],
    exp: "Ada Lovelace a rédigé en 1843 le premier algorithme destiné à être exécuté par la machine analytique de Charles Babbage."
  },
  {
    cat: 'technologie',
    sub: 'histoire-informatique',
    diff: 'medium',
    q: "Quel mathématicien et cryptologue britannique a conçu le concept de machine universelle et brisé le code de la machine Enigma ?",
    good: "Alan Turing",
    bads: ["John von Neumann", "Claude Shannon", "Norbert Wiener"],
    exp: "Alan Turing est l'un des pères fondateurs de l'informatique théorique et de l'intelligence artificielle (test de Turing)."
  },
  {
    cat: 'technologie',
    sub: 'smartphones',
    diff: 'easy',
    q: "En quelle année Steve Jobs a-t-il présenté le tout premier smartphone tactile iPhone d'Apple lors d'une célèbre keynote ?",
    good: "2007",
    bads: ["2005", "2008", "2010"],
    exp: "Le 9 janvier 2007 à San Francisco, Steve Jobs a dévoilé l'iPhone combinant un iPod, un téléphone et un terminal internet."
  },
  {
    cat: 'technologie',
    sub: 'systemes',
    diff: 'easy',
    q: "Quel système d'exploitation mobile racheté par Google en 2005 équipe la majorité des téléphones intelligents de la planète ?",
    good: "Android",
    bads: ["iOS", "Symbian", "Windows Phone"],
    exp: "Android est un système d'exploitation open source basé sur le noyau Linux utilisé par des milliards d'appareils mobiles."
  },
  {
    cat: 'technologie',
    sub: 'materiel',
    diff: 'easy',
    q: "Quelle unité de mémoire vive volatile perd l'intégralité de ses données enregistrées lorsque l'ordinateur est éteint ?",
    good: "La mémoire RAM",
    bads: ["Le disque dur", "Le SSD", "La mémoire ROM"],
    exp: "La mémoire vive (RAM, Random Access Memory) permet au processeur d'accéder instantanément aux instructions actives."
  },
  {
    cat: 'technologie',
    sub: 'materiel',
    diff: 'medium',
    q: "Quel type de support de stockage électronique rapide sans pièces mécaniques mobiles a progressivement remplacé le disque dur magnétique classique ?",
    good: "Le disque SSD",
    bads: ["La disquette", "Le CD-ROM", "La bande magnétique"],
    exp: "Les SSD (Solid-State Drive) reposent sur de la mémoire flash offrant des débits de lecture et d'écriture décuplés."
  },

  // ━━━ VÉHICULES & TRANSPORTS (15) ━━━
  {
    cat: 'vehicules',
    sub: 'automobile',
    diff: 'easy',
    q: "Quel constructeur automobile allemand basé à Wolfsburg a produit la célèbre 'Coccinelle' (Käfer) ?",
    good: "Volkswagen",
    bads: ["BMW", "Mercedes-Benz", "Opel"],
    exp: "La Coccinelle de Volkswagen s'est écoulée à plus de 21 millions d'exemplaires à travers le monde."
  },
  {
    cat: 'vehicules',
    sub: 'automobile',
    diff: 'easy',
    q: "Quelle entreprise américaine fondée par Henry Ford a révolutionné l'industrie avec la chaîne de montage de la Ford T en 1908 ?",
    good: "Ford Motor Company",
    bads: ["General Motors", "Chrysler", "Chevrolet"],
    exp: "Le fordisme et le travail à la chaîne ont permis de fabriquer la première automobile de masse abordable."
  },
  {
    cat: 'vehicules',
    sub: 'aviation',
    diff: 'easy',
    q: "Quel avion de ligne supersonique franco-britannique reliait Paris ou Londres à New York en environ 3 heures et demie jusqu'en 2003 ?",
    good: "Le Concorde",
    bads: ["Le Boeing 747", "L'Airbus A380", "Le Tupolev Tu-144"],
    exp: "Le Concorde volait à Mach 2 (plus de 2 100 km/h) à 18 000 mètres d'altitude, à la frontière de la stratosphère."
  },
  {
    cat: 'vehicules',
    sub: 'aviation',
    diff: 'medium',
    q: "Quel avion de ligne très gros porteur européen conçu par Airbus est le plus grand avion de transport civil de passagers au monde ?",
    good: "L'Airbus A380",
    bads: ["Le Boeing 747", "L'Airbus A350", "Le Boeing 777"],
    exp: "L'A380 est un avion à deux ponts complets pouvant accueillir plus de 500 à 800 passagers selon la configuration."
  },
  {
    cat: 'vehicules',
    sub: 'aviation',
    diff: 'medium',
    q: "Quel avion américain légendaire surnommé la 'Reine des ciels' (Queen of the Skies) a inauguré l'ère des gros-porteurs en 1969 ?",
    good: "Le Boeing 747",
    bads: ["Le Boeing 707", "Le Douglas DC-10", "Le Lockheed L-1011"],
    exp: "Le Boeing 747 reconnaissable à sa bosse avant a démocratisé les vols long-courriers internationaux."
  },
  {
    cat: 'vehicules',
    sub: 'ferroviaire',
    diff: 'easy',
    q: "Quel train à grande vitesse japonais célèbre est surnommé le 'train balle' (bullet train) pour sa rapidité et son nez aérodynamique ?",
    good: "Le Shinkansen",
    bads: ["Le Maglev", "Le TGV", "L'ICE"],
    exp: "Le Shinkansen a été inauguré en 1964 pour les JO de Tokyo entre Tokyo et Osaka avec une ponctualité légendaire."
  },
  {
    cat: 'vehicules',
    sub: 'ferroviaire',
    diff: 'easy',
    q: "Quel train à grande vitesse français a battu le record du monde de vitesse sur rail conventionnel à 574,8 km/h en avril 2007 ?",
    good: "Le TGV",
    bads: ["L'ICE allemand", "L'Eurostar", "L'AVE espagnol"],
    exp: "La rame TGV V150 d'Alstom et de la SNCF a atteint 574,8 km/h sur la ligne LGV Est européenne."
  },
  {
    cat: 'vehicules',
    sub: 'ferroviaire',
    diff: 'medium',
    q: "Quel train de luxe historique inauguré en 1883 reliait Paris à Constantinople (Istanbul) à travers l'Europe ?",
    good: "L'Orient-Express",
    bads: ["Le Transsibérien", "Le Mistral", "Le Flèche d'Or"],
    exp: "L'Orient-Express est le symbole du romantisme ferroviaire et le cadre du célèbre roman policier d'Agatha Christie."
  },
  {
    cat: 'vehicules',
    sub: 'maritime',
    diff: 'easy',
    q: "Quel paquebot transatlantique britannique réputé 'insubmersible' a sombré lors de son voyage inaugural en avril 1912 après avoir heurté un iceberg ?",
    good: "Le Titanic",
    bads: ["Le Britannic", "Le Lusitania", "L'Olympic"],
    exp: "Le naufrage du RMS Titanic a causé la mort de plus de 1 500 personnes dans les eaux glacées de l'Atlantique Nord."
  },
  {
    cat: 'vehicules',
    sub: 'maritime',
    diff: 'medium',
    q: "Comment appelle-t-on le sous-marin d'exploration scientifique piloté par le cinéaste James Cameron qui est descendu au fond de la fosse des Mariannes en 2012 ?",
    good: "Le Deepsea Challenger",
    bads: ["Le Nautile", "L'Alvin", "Le Shinkai 6500"],
    exp: "James Cameron a atteint le Challenger Deep à près de 11 000 mètres sous les mers à bord du Deepsea Challenger."
  },
  {
    cat: 'vehicules',
    sub: 'spatial',
    diff: 'easy',
    q: "Quelle fusée lunaire géante haute de 110 mètres a transporté les astronautes des missions Apollo de la NASA vers la Lune ?",
    good: "Saturn V",
    bads: ["Titan II", "Atlas V", "Falcon Heavy"],
    exp: "Conçue sous la direction de Wernher von Braun, Saturn V reste l'une des fusées les plus puissantes jamais construites."
  },
  {
    cat: 'vehicules',
    sub: 'spatial',
    diff: 'medium',
    q: "Quelle entreprise aérospatiale fondée par Elon Musk a mis au point la fusée réutilisable Falcon 9 ?",
    good: "SpaceX",
    bads: ["Blue Origin", "Virgin Galactic", "Rocket Lab"],
    exp: "SpaceX a révolutionné l'accès à l'espace en réussissant à faire atterrir à la verticale le premier étage de ses fusées."
  },
  {
    cat: 'vehicules',
    sub: 'automobile',
    diff: 'medium',
    q: "Quel constructeur italien au cheval cabré basé à Maranello est la plus ancienne écurie de Formule 1 ?",
    good: "Scuderia Ferrari",
    bads: ["Lamborghini", "Maserati", "Alfa Romeo"],
    exp: "Fondée par Enzo Ferrari, la Scuderia Ferrari est l'équipe la plus victorieuse et titrée de l'histoire de la F1."
  },
  {
    cat: 'vehicules',
    sub: 'deux-roues',
    diff: 'easy',
    q: "Quel célèbre scooter italien à carrosserie galbée a été lancé par la firme Piaggio en 1946 ?",
    good: "La Vespa",
    bads: ["La Lambretta", "La Solex", "L'Italjet"],
    exp: "La Vespa (qui signifie 'guêpe' en italien) est devenue une icône du design et du mode de vie méditerranéen."
  },
  {
    cat: 'vehicules',
    sub: 'automobile',
    diff: 'medium',
    q: "Quelle voiture française emblématique de Citroën produite de 1948 à 1990 était surnommée la 'Deuche' ?",
    good: "La 2 CV",
    bads: ["La DS", "La Traction Avant", "L'Ami 6"],
    exp: "La Citroën 2 CV a été conçue comme une voiture économique capable de traverser un champ labouré avec un panier d'œufs sans les casser."
  }
];

async function main() {
  console.log("━━━━━━━━ LOT FINAL VERS LES 4 000+ QUESTIONS ━━━━━━━━");

  const allSpecs = [...FINISH_LINE_SPECS, ...BONUS_SPECS];
  console.log(`Total specs à générer : ${allSpecs.length}`);

  // Group by category
  const byCat: Record<string, QuestionSpec[]> = {};
  for (const spec of allSpecs) {
    if (!byCat[spec.cat]) byCat[spec.cat] = [];
    byCat[spec.cat].push(spec);
  }

  let grandTotal = 0;
  for (const [cat, specs] of Object.entries(byCat)) {
    const questions = createValidQuestions(specs, `fin-${cat}`);
    saveInChunks(cat as QuestionCategory, `${cat}-finallot`, questions, 50);
    grandTotal += questions.length;
  }

  console.log(`✓ Total questions validées et enregistrées : +${grandTotal}`);
}

main().catch(console.error);
