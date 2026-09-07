/**
 * Agorax — Générateur encyclopédique de questions structurées
 * Couvre l'histoire, la science, la littérature, le cinéma, la musique,
 * l'art, le sport, le football, la géographie, le gaming, etc.
 */
import { createValidQuestions, saveInChunks, type QuestionSpec } from "./generate-bulk-corpus";

export const HISTOIRE_SPECS: QuestionSpec[] = [
  // Rois & Chefs d'État de France
  { q: "Quel roi franc est considéré comme le premier roi de tous les Francs et s'est fait baptiser à Reims ?", good: "Clovis Ier", bads: ["Charlemagne", "Pépin le Bref", "Clotaire Ier"], cat: "histoire", sub: "moyen-age", diff: "easy" },
  { q: "En quelle année Charlemagne a-t-il été couronné empereur d'Occident à Rome par le pape Léon III ?", good: "800", bads: ["732", "843", "987"], cat: "histoire", sub: "moyen-age", diff: "easy" },
  { q: "Quel traité historique a partagé l'empire carolingien entre les trois petits-fils de Charlemagne en 843 ?", good: "Le traité de Verdun", bads: ["Le traité de Troyes", "Le traité de Westphalie", "Le traité d'Utrecht"], cat: "histoire", sub: "moyen-age", diff: "medium" },
  { q: "Quel souverain a fondé la dynastie capétienne en étant élu roi des Francs en 987 ?", good: "Hugues Capet", bads: ["Robert le Pieux", "Louis VI", "Philippe Ier"], cat: "histoire", sub: "moyen-age", diff: "easy" },
  { q: "Quel roi de France a remporté la célèbre bataille de Bouvines le 27 juillet 1214 ?", good: "Philippe Auguste", bads: ["Saint Louis", "Philippe le Bel", "Louis VII"], cat: "histoire", sub: "moyen-age", diff: "medium" },
  { q: "Quel roi capétien, réputé pour sa piété et sa justice sous le chêne de Vincennes, est mort de la peste à Tunis ?", good: "Louis IX (Saint Louis)", bads: ["Louis VII", "Philippe IV", "Jean le Bon"], cat: "histoire", sub: "moyen-age", diff: "easy" },
  { q: "Quel roi de France a dissous l'Ordre du Temple lors d'un procès retentissant au début du XIVe siècle ?", good: "Philippe le Bel", bads: ["Charles IV", "Louis X", "Philippe V"], cat: "histoire", sub: "moyen-age", diff: "medium" },
  { q: "Pendant quelle longue guerre médiévale Jeanne d'Arc a-t-elle délivré la ville d'Orléans en 1429 ?", good: "La guerre de Cent Ans", bads: ["La guerre de Trente Ans", "La guerre des Deux-Roses", "La guerre de Sept Ans"], cat: "histoire", sub: "moyen-age", diff: "easy" },
  { q: "Quel roi de France de la Renaissance a remporté la bataille de Marignan en 1515 ?", good: "François Ier", bads: ["Henri II", "Charles VIII", "Louis XII"], cat: "histoire", sub: "renaissance", diff: "easy" },
  { q: "Quelle ordonnance royale signée par François Ier en 1539 a imposé l'usage de la langue française dans les actes juridiques ?", good: "L'ordonnance de Villers-Cotterêts", bads: ["L'édit de Nantes", "Le traité de Chambord", "L'ordonnance de Blois"], cat: "histoire", sub: "renaissance", diff: "medium" },
  { q: "Quel roi de France a promulgué l'Édit de Nantes en 1598 pour mettre fin aux guerres de Religion ?", good: "Henri IV", bads: ["Henri III", "Charles IX", "Louis XIII"], cat: "histoire", sub: "temps-modernes", diff: "easy" },
  { q: "Quel cardinal tout-puissant a servi de principal ministre à Louis XIII de 1624 à 1642 ?", good: "Le cardinal de Richelieu", bads: ["Le cardinal Mazarin", "Le cardinal de Fleury", "Le cardinal de Retz"], cat: "histoire", sub: "temps-modernes", diff: "easy" },
  { q: "Quel souverain français était surnommé le « Roi-Soleil » et a fait construire le château de Versailles ?", good: "Louis XIV", bads: ["Louis XV", "Louis XVI", "Louis XIII"], cat: "histoire", sub: "temps-modernes", diff: "easy" },
  { q: "Quel ministre des Finances de Louis XIV a développé le mercantilisme et développé les manufactures royales ?", good: "Jean-Baptiste Colbert", bads: ["Nicolas Fouquet", "Le cardinal Mazarin", "Sully"], cat: "histoire", sub: "temps-modernes", diff: "medium" },
  { q: "Quelle forteresse parisienne a été prise par les insurgés le 14 juillet 1789, marquant le début de la Révolution française ?", good: "La Bastille", bads: ["La Conciergerie", "Le fort de Vincennes", "Le château du Temple"], cat: "histoire", sub: "revolution", diff: "easy" },
  { q: "Quel club politique révolutionnaire Maximilien de Robespierre dirigeait-il pendant la période de la Terreur ?", good: "Les Jacobins", bads: ["Les Girondins", "Les Cordeliers", "Les Feuillants"], cat: "histoire", sub: "revolution", diff: "medium" },
  { q: "Quel général corse a pris le pouvoir en France lors du coup d'État du 18 Brumaire (1799) ?", good: "Napoléon Bonaparte", bads: ["La Fayette", "Murat", "Danton"], cat: "histoire", sub: "empire", diff: "easy" },
  { q: "En quelle année s'est déroulée la célèbre bataille d'Austerlitz, dite « bataille des Trois Empereurs » ?", good: "1805", bads: ["1800", "1808", "1812"], cat: "histoire", sub: "empire", diff: "medium" },
  { q: "Sur quelle île britannique de l'Atlantique Sud Napoléon Ier est-il mort en exil en mai 1821 ?", good: "Sainte-Hélène", bads: ["L'île d'Elbe", "L'île d'Aix", "Sainte-Lucie"], cat: "histoire", sub: "empire", diff: "easy" },
  { q: "Quel roi des Français est monté sur le trône à l'issue de la révolution des Trois Glorieuses en 1830 ?", good: "Louis-Philippe Ier", bads: ["Charles X", "Louis XVIII", "Napoléon II"], cat: "histoire", sub: "xixe-siecle", diff: "medium" },
  { q: "Quel neveu de Napoléon Ier a été le premier président de la République française en 1848 avant d'instaurer le Second Empire ?", good: "Louis-Napoléon Bonaparte", bads: ["Jérôme Bonaparte", "Joseph Bonaparte", "Eugène de Beauharnais"], cat: "histoire", sub: "xixe-siecle", diff: "easy" },
  { q: "Quelle défaite militaire décisive de l'armée française en septembre 1870 a provoqué la chute du Second Empire ?", good: "La bataille de Sedan", bads: ["La bataille de Waterloo", "La bataille de Solférino", "La bataille de Magenta"], cat: "histoire", sub: "xixe-siecle", diff: "medium" },
  { q: "Quelle insurrection populaire a gouverné Paris du 18 mars au 28 mai 1871 avant d'être écrasée lors de la Semaine sanglante ?", good: "La Commune de Paris", bads: ["La Fronde", "La Terreur blanche", "Les Cent-Jours"], cat: "histoire", sub: "xixe-siecle", diff: "medium" },
  { q: "Quel capitaine d'artillerie français de confession juive a été injustement condamné pour trahison en 1894 ?", good: "Alfred Dreyfus", bads: ["Ferdinand Walsin Esterhazy", "Georges Picquart", "Marie-Georges Picquart"], cat: "histoire", sub: "xixe-siecle", diff: "easy" },
  { q: "Quel écrivain français a publié la lettre ouverte « J'accuse… ! » dans le journal L'Aurore en 1898 ?", good: "Émile Zola", bads: ["Guy de Maupassant", "Victor Hugo", "Anatole France"], cat: "histoire", sub: "xixe-siecle", diff: "easy" },
  { q: "Quelle loi historique promulguée en décembre 1905 a instauré la séparation des Églises et de l'État en France ?", good: "La loi Briand", bads: ["La loi Ferry", "La loi Falloux", "La loi Waldeck-Rousseau"], cat: "histoire", sub: "xxe-siecle", diff: "medium" },
  { q: "Quel archiduc héritier de l'empire austro-hongrois a été assassiné à Sarajevo le 28 juin 1914 ?", good: "François-Ferdinand", bads: ["Rodolphe d'Autriche", "François-Joseph", "Charles Ier"], cat: "histoire", sub: "premiere-guerre", diff: "easy" },
  { q: "Quelle gigantesque bataille d'usure de 1916 a opposé les armées française et allemande pendant dix mois en Lorraine ?", good: "La bataille de Verdun", bads: ["La bataille de la Somme", "La bataille de la Marne", "La bataille du Chemin des Dames"], cat: "histoire", sub: "premiere-guerre", diff: "easy" },
  { q: "Quel homme d'État français, surnommé « Le Tigre », a dirigé le gouvernement à la fin de la Première Guerre mondiale ?", good: "Georges Clemenceau", bads: ["Raymond Poincaré", "Aristide Briand", "Paul Painlevé"], cat: "histoire", sub: "premiere-guerre", diff: "easy" },
  { q: "Quel traité de paix signé le 28 juin 1919 dans la galerie des Glaces a officiellement conclu la Première Guerre mondiale ?", good: "Le traité de Versailles", bads: ["Le traité de Saint-Germain", "Le traité de Trianon", "Le traité de Sèvres"], cat: "histoire", sub: "entre-deux-guerres", diff: "easy" },
  { q: "Quel krach boursier survenu en octobre 1929 à Wall Street a déclenché la Grande Dépression mondiale ?", good: "Le Jeudi noir", bads: ["Le Lundi noir", "Le Mardi sanglant", "Le Vendredi rouge"], cat: "histoire", sub: "entre-deux-guerres", diff: "easy" },
  { q: "Quelle coalition de partis de gauche a remporté les élections législatives françaises de mai 1936 sous la conduite de Léon Blum ?", good: "Le Front populaire", bads: ["Le Cartel des gauches", "Le Bloc national", "L'Union sacrée"], cat: "histoire", sub: "entre-deux-guerres", diff: "easy" },
  { q: "Le 18 juin 1940, depuis quelle capitale étrangère le général de Gaulle a-t-il lancé son célèbre appel à la résistance ?", good: "Londres", bads: ["Alger", "Washington", "Brazzaville"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Quel maréchal de France a pris la tête du régime autoritaire de Vichy en juillet 1940 ?", good: "Philippe Pétain", bads: ["Maxime Weygand", "Pierre Laval", "François Darlan"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Quelle bataille décisive de l'Armée rouge sur la Volga (1942-1943) a marqué le tournant de la Seconde Guerre mondiale en Europe ?", good: "La bataille de Stalingrad", bads: ["La bataille de Koursk", "La bataille de Moscou", "La bataille de Leningrad"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Sur les plages de quelle région française les troupes alliées ont-elles débarqué le 6 juin 1944 (D-Day) ?", good: "La Normandie", bads: ["La Bretagne", "La Provence", "Le Nord-Pas-de-Calais"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Quel héros de la Résistance a unifié les mouvements clandestins français au sein du Conseil National de la Résistance (CNR) ?", good: "Jean Moulin", bads: ["Pierre Brossolette", "Henri Frenay", "Lucie Aubrac"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Dans quelle ville suisse le quartier général de la Société des Nations (SDN) était-il établi après 1919 ?", good: "Genève", bads: ["Zurich", "Berne", "Bâle"], cat: "histoire", sub: "monde", diff: "medium" },
  { q: "Quel président américain a ordonné les bombardements atomiques sur Hiroshima et Nagasaki en août 1945 ?", good: "Harry S. Truman", bads: ["Franklin D. Roosevelt", "Dwight D. Eisenhower", "Herbert Hoover"], cat: "histoire", sub: "seconde-guerre", diff: "easy" },
  { q: "Quelle organisation internationale a été fondée le 24 octobre 1945 à San Francisco pour préserver la paix dans le monde ?", good: "L'Organisation des Nations Unies (ONU)", bads: ["L'OTAN", "La SDN", "L'Unesco"], cat: "histoire", sub: "monde", diff: "easy" },
  { q: "Quel plan d'aide financière massive les États-Unis ont-ils déployé à partir de 1947 pour reconstruire l'Europe d'après-guerre ?", good: "Le plan Marshall", bads: ["Le plan Dawes", "Le plan Young", "Le plan Schuman"], cat: "histoire", sub: "guerre-froide", diff: "easy" },
  { q: "Quelle structure défensive de béton a séparé la capitale allemande en deux secteurs étanches de 1961 à 1989 ?", good: "Le Mur de Berlin", bads: ["La ligne Siegfried", "Le rideau d'acier", "La ligne Maginot"], cat: "histoire", sub: "guerre-froide", diff: "easy" },
  { q: "En quelle année le Mur de Berlin est-il tombé, ouvrant la voie à la réunification allemande ?", good: "1989", bads: ["1987", "1990", "1991"], cat: "histoire", sub: "guerre-froide", diff: "easy" },
  { q: "Quel dirigeant soviétique a engagé les réformes de la Perestroïka et de la Glasnost avant la dissolution de l'URSS en 1991 ?", good: "Mikhaïl Gorbatchev", bads: ["Leonid Brejnev", "Nikita Khrouchtchev", "Boris Eltsine"], cat: "histoire", sub: "guerre-froide", diff: "easy" },
  { q: "Quel traité signé en 1992 aux Pays-Bas a créé l'Union européenne et jeté les bases de la monnaie unique euro ?", good: "Le traité de Maastricht", bads: ["Le traité de Rome", "Le traité de Lisbonne", "Le traité d'Amsterdam"], cat: "histoire", sub: "europe", diff: "easy" },
  { q: "Quel président français a aboli la peine de mort en France en 1981, sous l'impulsion de Robert Badinter ?", good: "François Mitterrand", bads: ["Valéry Giscard d'Estaing", "Jacques Chirac", "Georges Pompidou"], cat: "histoire", sub: "france-contemporaine", diff: "easy" },
  { q: "Quel dirigeant sud-africain a passé 27 ans en prison avant de devenir le premier président noir de son pays en 1994 ?", good: "Nelson Mandela", bads: ["Desmond Tutu", "Steve Biko", "Thabo Mbeki"], cat: "histoire", sub: "monde", diff: "easy" },
  { q: "Quelle révolution sanglante a renversé la monarchie tsariste de Nicolas II en Russie en 1917 sous la conduite des bolcheviks ?", good: "La Révolution d'Octobre", bads: ["La Révolution de Février", "La Révolution de velours", "Le Printemps des peuples"], cat: "histoire", sub: "russie", diff: "easy" },
  { q: "Qui a dirigé la République populaire de Chine depuis sa proclamation en 1949 jusqu'à sa mort en 1976 ?", good: "Mao Zedong", bads: ["Deng Xiaoping", "Zhou Enlai", "Tchang Kaï-chek"], cat: "histoire", sub: "asie", diff: "easy" },
  { q: "Quelle civilisation mésoaméricaine a érigé la cité fortifiée de Tenochtitlan avant d'être conquise par Cortés en 1521 ?", good: "Les Aztèques", bads: ["Les Mayas", "Les Incas", "Les Toltèques"], cat: "histoire", sub: "ameriques", diff: "easy" },
];

export const SCIENCE_SPECS: QuestionSpec[] = [
  // Astronomie & Système Solaire
  { q: "Quelle est la planète la plus proche du Soleil dans notre système solaire ?", good: "Mercure", bads: ["Vénus", "Mars", "la Terre"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quelle planète géante gazeuse possède la plus grande masse et la fameuse « Grande Tache Rouge » ?", good: "Jupiter", bads: ["Saturne", "Neptune", "Uranus"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quelle planète du système solaire est surnommée la « planète rouge » en raison de l'oxyde de fer à sa surface ?", good: "Mars", bads: ["Vénus", "Mercure", "Jupiter"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quelle planète est entourée du système d'anneaux de glace et de poussière le plus spectaculaire et visible ?", good: "Saturne", bads: ["Uranus", "Neptune", "Jupiter"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "À quelle vitesse approximative la lumière se propage-t-elle dans le vide absolu ?", good: "300 000 km/s", bads: ["150 000 km/s", "500 000 km/s", "1 000 000 km/s"], cat: "science", sub: "physique", diff: "easy" },
  { q: "Quel physicien a formulé les lois de la relativité restreinte (1905) et générale (1915) ?", good: "Albert Einstein", bads: ["Isaac Newton", "Niels Bohr", "Max Planck"], cat: "science", sub: "physique", diff: "easy" },
  { q: "Quel scientifique britannique a énoncé la loi de la gravitation universelle après avoir observé la chute d'une pomme ?", good: "Isaac Newton", bads: ["Robert Hooke", "Galilée", "Johannes Kepler"], cat: "science", sub: "physique", diff: "easy" },
  { q: "Quel gaz représente environ 78 % de l'atmosphère terrestre ?", good: "Le diazote", bads: ["Le dioxygène", "Le dioxyde de carbone", "L'argon"], cat: "science", sub: "chimie", diff: "easy" },
  { q: "Quel est le symbole chimique du sodium dans le tableau périodique des éléments ?", good: "Na", bads: ["So", "Sd", "K"], cat: "science", sub: "chimie", diff: "medium" },
  { q: "Quel est le symbole chimique de l'or dans la classification périodique ?", good: "Au", bads: ["Ag", "Or", "Fe"], cat: "science", sub: "chimie", diff: "easy" },
  { q: "Combien d'os composent le squelette d'un être humain adulte en moyenne ?", good: "206", bads: ["180", "250", "312"], cat: "science", sub: "anatomie", diff: "easy" },
  { q: "Quel est le plus grand organe du corps humain en superficie et en poids ?", good: "La peau", bads: ["Le foie", "L'intestin grêle", "Les poumons"], cat: "science", sub: "anatomie", diff: "easy" },
  { q: "Quel est le groupe sanguin considéré comme « donneur universel » de globules rouges ?", good: "O négatif", bads: ["AB positif", "A positif", "O positif"], cat: "science", sub: "medecine", diff: "easy" },
  { q: "Quelle molécule en double hélice porte l'information génétique de tous les organismes vivants ?", good: "L'ADN", bads: ["L'ARN", "L'ATP", "La protéine C"], cat: "science", sub: "biologie", diff: "easy" },
  { q: "Combien de paires de chromosomes une cellule humaine normale possède-t-elle ?", good: "23 paires", bads: ["22 paires", "24 paires", "46 paires"], cat: "science", sub: "biologie", diff: "easy" },
  { q: "Quel médecin écossais a découvert le premier antibiotique, la pénicilline, en 1928 ?", good: "Alexander Fleming", bads: ["Louis Pasteur", "Robert Koch", "Edward Jenner"], cat: "science", sub: "medecine", diff: "easy" },
  { q: "Quel savant français a développé le vaccin contre la rage et le procédé de pasteurisation ?", good: "Louis Pasteur", bads: ["Claude Bernard", "René Laennec", "Antoine Lavoisier"], cat: "science", sub: "medecine", diff: "easy" },
  { q: "Quelle scientifique d'origine polonaise a reçu deux prix Nobel dans deux disciplines différentes (Physique et Chimie) ?", good: "Marie Curie", bads: ["Irène Joliot-Curie", "Rosalind Franklin", "Lise Meitner"], cat: "science", sub: "chimie", diff: "easy" },
  { q: "Quel astronome polonais du XVIe siècle a développé le modèle héliocentrique plaçant le Soleil au centre de l'univers ?", good: "Nicolas Copernic", bads: ["Galilée", "Tycho Brahe", "Giordano Bruno"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quelle force fondamentale maintient les électrons en orbite autour du noyau atomique ?", good: "La force électromagnétique", bads: ["La gravité", "L'interaction forte", "L'interaction faible"], cat: "science", sub: "physique", diff: "medium" },
  { q: "Quelle particule subatomique de charge électrique neutre compose le noyau atomique avec le proton ?", good: "Le neutron", bads: ["L'électron", "Le positron", "Le photon"], cat: "science", sub: "physique", diff: "easy" },
  { q: "Quelle échelle logarithmique mesure la magnitude de l'énergie libérée lors d'un séisme ?", good: "L'échelle de Richter", bads: ["L'échelle de Mercalli", "L'échelle de Beaufort", "L'échelle de Mohs"], cat: "science", sub: "geologie", diff: "easy" },
  { q: "Quel minéral se situe au sommet de l'échelle de dureté de Mohs avec une valeur maximale de 10 ?", good: "Le diamant", bads: ["Le corindon", "Le quartz", "Le topaze"], cat: "science", sub: "geologie", diff: "easy" },
  { q: "Quelle particule élémentaire de masse nulle est le quantum d'énergie associé au rayonnement lumineux ?", good: "Le photon", bads: ["Le gluon", "Le neutrino", "Le boson"], cat: "science", sub: "physique", diff: "easy" },
  { q: "Quel naturaliste anglais a posé les bases de la théorie de l'évolution par sélection naturelle dans L'Origine des espèces (1859) ?", good: "Charles Darwin", bads: ["Jean-Baptiste de Lamarck", "Gregor Mendel", "Alfred Russel Wallace"], cat: "science", sub: "biologie", diff: "easy" },
  { q: "Quel moine autrichien est considéré comme le père de la génétique moderne grâce à ses expériences sur les petits pois ?", good: "Gregor Mendel", bads: ["Thomas Morgan", "Carl Linnaeus", "Louis Pasteur"], cat: "science", sub: "biologie", diff: "easy" },
  { q: "Quel télescope spatial lancé en décembre 2021 étudie l'univers dans l'infrarouge depuis le point de Lagrange L2 ?", good: "Le James Webb (JWST)", bads: ["Hubble", "Spitzer", "Kepler"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quelle planète naine découverte en 1930 a été déclassée de son statut de planète principale par l'UAI en 2006 ?", good: "Pluton", bads: ["Cérès", "Éris", "Makémaké"], cat: "science", sub: "astronomie", diff: "easy" },
  { q: "Quel est l'élément chimique le plus abondant dans l'univers observable ?", good: "L'hydrogène", bads: ["L'hélium", "L'oxygène", "Le carbone"], cat: "science", sub: "chimie", diff: "easy" },
  { q: "Quelle glande située à la base du cou sécrète des hormones régulant le métabolisme de base (T3 et T4) ?", good: "La thyroïde", bads: ["L'hypophyse", "Le pancréas", "La surrénale"], cat: "science", sub: "anatomie", diff: "easy" },
];

export const LITTERATURE_SPECS: QuestionSpec[] = [
  { q: "Quel écrivain français a écrit le chef-d'œuvre Les Misérables mettant en scène Jean Valjean et Gavroche ?", good: "Victor Hugo", bads: ["Émile Zola", "Honoré de Balzac", "Gustave Flaubert"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Dans quelle pièce d'Edmond Rostand le héros au nez proéminent déclame-t-il la célèbre « tirade du nez » ?", good: "Cyrano de Bergerac", bads: ["L'Aiglon", "Chantecler", "Ruy Blas"], cat: "litterature", sub: "theatre", diff: "easy" },
  { q: "Quel auteur dramatique du XVIIe siècle a écrit Le Misanthrope, Tartuffe et L'Avare ?", good: "Molière", bads: ["Jean Racine", "Pierre Corneille", "Boileau"], cat: "litterature", sub: "theatre", diff: "easy" },
  { q: "Quel roman dystopique de George Orwell met en scène Big Brother et la Police de la Pensée ?", good: "1984", bads: ["La Ferme des animaux", "Le Meilleur des mondes", "Fahrenheit 451"], cat: "litterature", sub: "classiques", diff: "easy" },
  { q: "Dans quelle saga monumentale d'Honoré de Balzac trouve-t-on Le Père Goriot et Illusions perdues ?", good: "La Comédie humaine", bads: ["Les Rougon-Macquart", "Les Hommes de bonne volonté", "À la recherche du temps perdu"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Quel recueil de poèmes de Charles Baudelaire, paru en 1857, a fait l'objet d'un procès pour outrage aux bonnes mœurs ?", good: "Les Fleurs du mal", bads: ["Alcools", "Les Illuminations", "Poèmes saturniens"], cat: "litterature", sub: "poesie", diff: "easy" },
  { q: "Quel écrivain russe est l'auteur de Crime et Châtiment et des Frères Karamazov ?", good: "Fiodor Dostoïevski", bads: ["Léon Tolstoï", "Anton Tchekhov", "Alexandre Pouchkine"], cat: "litterature", sub: "classiques", diff: "easy" },
  { q: "Dans quel roman d'Albert Camus le narrateur Meursault tire-t-il sur un homme sur une plage d'Alger ?", good: "L'Étranger", bads: ["La Peste", "La Chute", "Le Premier Homme"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Quel poète français a écrit Le Bateau ivre et Une saison en enfer avant d'abandonner l'écriture à vingt ans ?", good: "Arthur Rimbaud", bads: ["Paul Verlaine", "Stéphane Mallarmé", "Gérard de Nerval"], cat: "litterature", sub: "poesie", diff: "easy" },
  { q: "Quel écrivain espagnol a créé les figures immortelles de Don Quichotte et de son écuyer Sancho Panza ?", good: "Miguel de Cervantes", bads: ["Federico García Lorca", "Lope de Vega", "Pedro Calderón de la Barca"], cat: "litterature", sub: "classiques", diff: "easy" },
  { q: "Quel auteur américain a écrit Gatsby le Magnifique en 1925 ?", good: "F. Scott Fitzgerald", bads: ["Ernest Hemingway", "John Steinbeck", "William Faulkner"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Dans quel roman d'aventures d'Alexandre Dumas Edmond Dantès s'évade-t-il du château d'If pour assouvir sa vengeance ?", good: "Le Comte de Monte-Cristo", bads: ["Les Trois Mousquetaires", "La Reine Margot", "Vingt Ans après"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Quel dramaturge anglais de l'époque élisabéthaine a écrit Hamlet, Macbeth et Roméo et Juliette ?", good: "William Shakespeare", bads: ["Christopher Marlowe", "Ben Jonson", "John Webster"], cat: "litterature", sub: "theatre", diff: "easy" },
  { q: "Quel roman de Gustave Flaubert raconte le destin tragique d'Emma Bovary, mariée à un médecin de province ?", good: "Madame Bovary", bads: ["L'Éducation sentimentale", "Salammbô", "Bouvard et Pécuchet"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Dans quelle monumentale suite romanesque de Marcel Proust trouve-t-on le célèbre épisode de la madeleine trempée dans le thé ?", good: "À la recherche du temps perdu", bads: ["Jean Santeuil", "Les Plaisirs et les Jours", "Du côté de chez Swann"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Quel auteur colombien a reçu le prix Nobel de littérature en 1982 pour son chef-d'œuvre Cent Ans de solitude ?", good: "Gabriel García Márquez", bads: ["Mario Vargas Llosa", "Jorge Luis Borges", "Julio Cortázar"], cat: "litterature", sub: "romans", diff: "easy" },
  { q: "Quel écrivain tchèque écrivant en allemand a écrit La Métamorphose, où Gregor Samsa se réveille transformé en insecte monstrueux ?", good: "Franz Kafka", bads: ["Stefan Zweig", "Thomas Mann", "Robert Musil"], cat: "litterature", sub: "classiques", diff: "easy" },
  { q: "Dans quel roman épique de J.R.R. Tolkien le hobbit Frodon Sacquet doit-il détruire l'Anneau Unique dans la Montagne du Destin ?", good: "Le Seigneur des Anneaux", bads: ["Le Silmarillion", "Les Enfants de Húrin", "Bilbo le Hobbit"], cat: "litterature", sub: "fantasy", diff: "easy" },
  { q: "Quelle tragédie de Jean Racine met en scène l'amour incestueux et dévorant de l'épouse de Thésée pour son beau-fils Hippolyte ?", good: "Phèdre", bads: ["Andromaque", "Bérénice", "Britannicus"], cat: "litterature", sub: "theatre", diff: "medium" },
  { q: "Quel poète latin de l'époque d'Auguste est l'auteur de L'Énéide et des Bucoliques ?", good: "Virgile", bads: ["Horace", "Ovide", "Lucrèce"], cat: "litterature", sub: "antiquite", diff: "medium" },
];

export const CINEMA_SPECS: QuestionSpec[] = [
  { q: "Quel cinéaste américain a réalisé Jurassic Park, La Liste de Schindler et E.T. l'extra-terrestre ?", good: "Steven Spielberg", bads: ["George Lucas", "James Cameron", "Martin Scorsese"], cat: "cinema", sub: "realisateurs", diff: "easy" },
  { q: "Quel réalisateur britannique a mis en scène la trilogie The Dark Knight, Inception, Interstellar et Oppenheimer ?", good: "Christopher Nolan", bads: ["Ridley Scott", "Denis Villeneuve", "David Fincher"], cat: "cinema", sub: "realisateurs", diff: "easy" },
  { q: "Quel réalisateur a remporté la Palme d'or à Cannes en 1994 avec son film culte Pulp Fiction ?", good: "Quentin Tarantino", bads: ["David Lynch", "Joel Coen", "Paul Thomas Anderson"], cat: "cinema", sub: "realisateurs", diff: "easy" },
  { q: "Quel film sud-coréen de Bong Joon-ho est devenu en 2020 le premier film non anglophone à remporter l'Oscar du Meilleur Film ?", good: "Parasite", bads: ["Old Boy", "Mademoiselle", "Dernier train pour Busan"], cat: "cinema", sub: "oscars", diff: "easy" },
  { q: "Quel cinéaste légendaire de l'animation japonaise a cofondé le Studio Ghibli et réalisé Le Voyage de Chihiro ?", good: "Hayao Miyazaki", bads: ["Isao Takahata", "Makoto Shinkai", "Satoshi Kon"], cat: "cinema", sub: "animation", diff: "easy" },
  { q: "Quel acteur incarne le détective Rick Deckard dans le film de science-fiction culte Blade Runner (1982) ?", good: "Harrison Ford", bads: ["Rutger Hauer", "Kurt Russell", "Arnold Schwarzenegger"], cat: "cinema", sub: "acteurs", diff: "easy" },
  { q: "Quel réalisateur américain a dirigé 2001 : L'Odyssée de l'espace, Shining et Orange mécanique ?", good: "Stanley Kubrick", bads: ["Francis Ford Coppola", "Woody Allen", "Brian De Palma"], cat: "cinema", sub: "realisateurs", diff: "easy" },
  { q: "Quel film de James Cameron sorti en 1997 a remporté 11 Oscars avec Leonardo DiCaprio et Kate Winslet ?", good: "Titanic", bads: ["Avatar", "Abyss", "Terminator 2"], cat: "cinema", sub: "oscars", diff: "easy" },
  { q: "Quel acteur interprète le parrain Don Vito Corleone dans le premier volet du film Le Parrain (1972) ?", good: "Marlon Brando", bads: ["Al Pacino", "Robert De Niro", "James Caan"], cat: "cinema", sub: "acteurs", diff: "easy" },
  { q: "Dans quelle saga cinématographique créée par George Lucas trouve-t-on les personnages de Luke Skywalker et Dark Vador ?", good: "Star Wars", bads: ["Star Trek", "Dune", "Battlestar Galactica"], cat: "cinema", sub: "sagas", diff: "easy" },
  { q: "Quel compositeur italien de musique de film a composé les bandes originales légendaires du Bon, la Brute et le Truand et d'Il était une fois dans l'Ouest ?", good: "Ennio Morricone", bads: ["Nino Rota", "Hans Zimmer", "John Williams"], cat: "cinema", sub: "musique-de-film", diff: "easy" },
  { q: "Quel compositeur américain a signé les thèmes musicaux mémorables de Star Wars, Indiana Jones, Jurassic Park et Harry Potter ?", good: "John Williams", bads: ["Hans Zimmer", "Danny Elfman", "Howard Shore"], cat: "cinema", sub: "musique-de-film", diff: "easy" },
  { q: "Quel réalisateur français de la Nouvelle Vague a réalisé Les Quatre Cents Coups et Jules et Jim ?", good: "François Truffaut", bads: ["Jean-Luc Godard", "Claude Chabrol", "Éric Rohmer"], cat: "cinema", sub: "nouvelle-vague", diff: "medium" },
  { q: "Dans quel film de science-fiction des sœurs Wachowski le héros Neo choisit-il entre la pilule rouge et la pilule bleue ?", good: "Matrix", bads: ["Dark City", "Equilibrium", "Total Recall"], cat: "cinema", sub: "sagas", diff: "easy" },
  { q: "Quel cinéaste québécois a réalisé Premier Contact, Blade Runner 2049 et le diptyque Dune ?", good: "Denis Villeneuve", bads: ["Jean-Marc Vallée", "Xavier Dolan", "David Cronenberg"], cat: "cinema", sub: "realisateurs", diff: "easy" },
];

export const ART_SPECS: QuestionSpec[] = [
  { q: "Quel génie de la Renaissance italienne a peint La Joconde et La Cène ?", good: "Léonard de Vinci", bads: ["Michel-Ange", "Raphaël", "Botticelli"], cat: "art", sub: "renaissance", diff: "easy" },
  { q: "Quel peintre et sculpteur florentin a peint le plafond de la chapelle Sixtine au Vatican ?", good: "Michel-Ange", bads: ["Le Caravage", "Le Bernin", "Donatello"], cat: "art", sub: "renaissance", diff: "easy" },
  { q: "Quel peintre postimpressionniste hollandais a réalisé La Nuit étoilée et Les Tournesols ?", good: "Vincent van Gogh", bads: ["Paul Gauguin", "Claude Monet", "Paul Cézanne"], cat: "art", sub: "postimpressionnisme", diff: "easy" },
  { q: "Quel peintre espagnol est le maître incontesté du surréalisme avec sa toile La Persistance de la mémoire (les montres molles) ?", good: "Salvador Dalí", bads: ["Pablo Picasso", "Joan Miró", "René Magritte"], cat: "art", sub: "surrealisme", diff: "easy" },
  { q: "Quel chef de file de l'impressionnisme français a peint la série des Nymphéas dans sa maison de Giverny ?", good: "Claude Monet", bads: ["Édouard Manet", "Auguste Renoir", "Edgar Degas"], cat: "art", sub: "impressionnisme", diff: "easy" },
  { q: "Quel artiste peintre espagnol a cofondé le cubisme et peint le gigantesque réquisitoire contre la guerre Guernica en 1937 ?", good: "Pablo Picasso", bads: ["Georges Braque", "Juan Gris", "Fernand Léger"], cat: "art", sub: "cubisme", diff: "easy" },
  { q: "Quel sculpteur français du XIXe siècle a sculpté Le Penseur et Le Baiser ?", good: "Auguste Rodin", bads: ["Antoine Bourdelle", "Camille Claudel", "Jean-Baptiste Carpeaux"], cat: "art", sub: "sculpture", diff: "easy" },
  { q: "Dans quel célèbre musée parisien, ancienne gare ferroviaire, peut-on admirer les plus grands chefs-d'œuvre impressionnistes ?", good: "Le musée d'Orsay", bads: ["Le musée du Louvre", "Le centre Pompidou", "Le musée de l'Orangerie"], cat: "art", sub: "musees", diff: "easy" },
  { q: "Quel peintre norvégien est l'auteur du tableau expressionniste angoissant Le Cri (1893) ?", good: "Edvard Munch", bads: ["Gustav Klimt", "Egon Schiele", "Wassily Kandinsky"], cat: "art", sub: "expressionnisme", diff: "easy" },
  { q: "Quel peintre autrichien de l'Art nouveau a peint la somptueuse toile dorée Le Baiser (1907-1908) ?", good: "Gustav Klimt", bads: ["Egon Schiele", "Oskar Kokoschka", "Alphonse Mucha"], cat: "art", sub: "art-nouveau", diff: "easy" },
  { q: "Quel peintre maître du clair-obscur baroque a réalisé La Ronde de nuit au Siècle d'or hollandais ?", good: "Rembrandt", bads: ["Johannes Vermeer", "Frans Hals", "Jan Steen"], cat: "art", sub: "baroque", diff: "easy" },
  { q: "Quel peintre de Delft a peint la célèbre toile intimiste La Jeune Fille à la perle ?", good: "Johannes Vermeer", bads: ["Rembrandt", "Pieter de Hooch", "Carel Fabritius"], cat: "art", sub: "baroque", diff: "easy" },
];

export const SPORT_FOOT_SPECS: QuestionSpec[] = [
  { q: "Quel pays a remporté la Coupe du Monde de football masculin en 1998 et en 2018 ?", good: "La France", bads: ["Le Brésil", "L'Allemagne", "L'Italie"], cat: "football", sub: "coupe-du-monde", diff: "easy" },
  { q: "Quel joueur argentin a remporté 8 Ballons d'Or et la Coupe du Monde 2022 au Qatar ?", good: "Lionel Messi", bads: ["Diego Maradona", "Cristiano Ronaldo", "Kylian Mbappé"], cat: "football", sub: "joueurs", diff: "easy" },
  { q: "Quel club espagnol détient le record absolu du plus grand nombre de victoires en Ligue des Champions de l'UEFA (15 titres) ?", good: "Le Real Madrid", bads: ["Le FC Barcelone", "L'AC Milan", "Le Bayern Munich"], cat: "football", sub: "clubs", diff: "easy" },
  { q: "Quel joueur brésilien de légende est le seul footballeur de l'histoire à avoir remporté trois Coupes du Monde (1958, 1962, 1970) ?", good: "Pelé", bads: ["Garrincha", "Ronaldo Nazário", "Zico"], cat: "football", sub: "legendes", diff: "easy" },
  { q: "Quel joueur de tennis espagnol détient le record exceptionnel de 14 victoires en simple messieurs au tournoi de Roland-Garros ?", good: "Rafael Nadal", bads: ["Roger Federer", "Novak Djokovic", "Carlos Alcaraz"], cat: "sport", sub: "tennis", diff: "easy" },
  { q: "Combien d'anneaux entrelacés composent le symbole officiel des Jeux Olympiques modernes ?", good: "5", bads: ["4", "6", "7"], cat: "sport", sub: "jeux-olympiques", diff: "easy" },
  { q: "Quel sprinteur jamaïcain détient les records du monde du 100 mètres (9,58 s) et du 200 mètres (19,19 s) ?", good: "Usain Bolt", bads: ["Tyson Gay", "Yohan Blake", "Carl Lewis"], cat: "sport", sub: "athletisme", diff: "easy" },
  { q: "Dans quelle ville se sont déroulés les Jeux Olympiques d'été de 2024 ?", good: "Paris", bads: ["Tokyo", "Londres", "Los Angeles"], cat: "sport", sub: "jeux-olympiques", diff: "easy" },
  { q: "Quel joueur de basket-ball américain portant le numéro 23 a mené les Chicago Bulls à six titres NBA dans les années 1990 ?", good: "Michael Jordan", bads: ["LeBron James", "Kobe Bryant", "Magic Johnson"], cat: "sport", sub: "basketball", diff: "easy" },
  { q: "Combien de joueurs composent une équipe de rugby à XV sur le terrain pendant le jeu ?", good: "15", bads: ["13", "11", "17"], cat: "sport", sub: "rugby", diff: "easy" },
];

async function main() {
  console.log("Génération du corpus encyclopédique structuré...");

  const hist = createValidQuestions(HISTOIRE_SPECS, "hist-bulk");
  saveInChunks("histoire", "histoire-corpus", hist, 50);

  const sci = createValidQuestions(SCIENCE_SPECS, "sci-bulk");
  saveInChunks("science", "science-corpus", sci, 50);

  const lit = createValidQuestions(LITTERATURE_SPECS, "lit-bulk");
  saveInChunks("litterature", "litterature-corpus", lit, 50);

  const cine = createValidQuestions(CINEMA_SPECS, "cine-bulk");
  saveInChunks("cinema", "cinema-corpus", cine, 50);

  const art = createValidQuestions(ART_SPECS, "art-bulk");
  saveInChunks("art", "art-corpus", art, 50);

  const sportFoot = createValidQuestions(SPORT_FOOT_SPECS, "sport-bulk");
  const footQuestions = sportFoot.filter((q) => q.category === "football");
  const sportQuestions = sportFoot.filter((q) => q.category === "sport");
  saveInChunks("football", "football-corpus", footQuestions, 50);
  saveInChunks("sport", "sport-corpus", sportQuestions, 50);

  console.log(`✓ Lot 1 terminé : ${hist.length + sci.length + lit.length + cine.length + art.length + sportFoot.length} questions générées.`);
}

main().catch(console.error);
