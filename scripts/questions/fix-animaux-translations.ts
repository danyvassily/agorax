/**
 * Script de traduction et de remédiation linguistique pour questions/fr/animaux/
 * Traduit les 119 questions anglaises en français naturel en préservant strictement
 * la correspondance des index de réponses et correctAnswer.
 */
import fs from "node:fs";
import path from "node:path";
import { QUESTIONS_ROOT } from "./lib";

const TRANSLATIONS: Record<string, { q: string; a: string[] }> = {
  "animaux-opentrivia-014": {
    q: "Les cobras sont des serpents venimeux de la famille des Elapidae qui habitent principalement ces deux continents :",
    a: ["Asie et Australie", "Amérique du Sud et Asie", "Amérique du Sud et Australie", "Asie et Afrique"]
  },
  "animaux-opentrivia-035": {
    q: "Selon les croyances japonaises anciennes, quel animal provoquait les séismes ?",
    a: ["Les grenouilles", "Les oiseaux", "Les araignées", "Les serpents"]
  },
  "animaux-opentrivia-037": {
    q: "Quel animal peut se nettoyer les oreilles avec sa langue de plus de 50 cm ?",
    a: ["Le lion", "Le lézard", "La girafe", "L'éléphant"]
  },
  "animaux-dump-0110": {
    q: "Quelle affirmation concernant les éléphants est fausse ?",
    a: [
      "Les éléphants n'ont pas une bonne mémoire",
      "Les éléphants pleurent",
      "Les éléphants dorment debout",
      "Il existe des éléphants roses en Inde"
    ]
  },
  "animaux-dump-0115": {
    q: "Quel type d'animal est une lamproie ?",
    a: ["Un ver", "Un insecte", "Un amphibien", "Un poisson"]
  },
  "animaux-dump-0119": {
    q: "Quelle hauteur maximale au garrot un chihuahua peut-il atteindre ?",
    a: ["22 cm", "38 cm", "30 cm", "60 cm"]
  },
  "animaux-dump-0131": {
    q: "Aussi appelé 'biscuit de mer', quel animal vit à demi enfoui dans le sable des fonds marins ?",
    a: ["Le clypéastre (dollar des sables)", "La moule", "L'étoile de mer", "La coquille Saint-Jacques"]
  },
  "animaux-dump-0135": {
    q: "De quelle plante se compose principalement le régime alimentaire du koala ?",
    a: ["Le saule", "L'eucalyptus", "Le chêne-liège", "Le bambou"]
  },
  "animaux-dump-0137": {
    q: "Quel monotrème australien pond des œufs et possède un sens aigu d'électroréception ?",
    a: ["L'ornithorynque", "L'émeu", "Le dingo", "Le kangourou roux"]
  },
  "animaux-dump-0139": {
    q: "Quel animal australien figure sur le logo rouge et blanc de la compagnie aérienne Qantas ?",
    a: ["L'émeu", "Le koala", "Le kangourou", "Le diable de Tasmanie"]
  },
  "animaux-dump-0143": {
    q: "D'après quoi le monstre de Gila, lézard venimeux, a-t-il été nommé ?",
    a: ["L'île de Gilligan", "Le bassin de la rivière Gila", "L'expédition Gila de 1857", "Alberto Gilardino"]
  },
  "animaux-dump-0156": {
    q: "Quel requin est le nageur le plus rapide de l'océan ?",
    a: ["Le requin-lutin", "Le requin-taureau", "Le requin mako", "Le requin-nourrice"]
  },
  "animaux-dump-0160": {
    q: "Combien de temps dure la période de gestation d'une girafe ?",
    a: ["14 à 15 mois", "18 à 20 mois", "10 mois", "9 mois"]
  },
  "animaux-dump-0169": {
    q: "Combien de temps un poisson rouge peut-il vivre dans des conditions optimales ?",
    a: ["8 ans", "20 ans", "5 ans", "10 ans"]
  },
  "animaux-dump-0172": {
    q: "De quelle couleur sont les poissons rouges à l'état sauvage ?",
    a: ["Verte", "Argentée", "Jaune", "Orange"]
  },
  "animaux-dump-0208": {
    q: "Où vit l'ours polaire à l'état naturel ?",
    a: ["Au pôle Sud", "En Arctique", "En Antarctique", "Toutes ces réponses"]
  },
  "animaux-dump-0209": {
    q: "De quelle couleur est la peau de l'ours polaire sous sa fourrure ?",
    a: ["Rose", "Jaune", "Noire", "Blanche"]
  },
  "animaux-dump-0229": {
    q: "Pourquoi les chats piquent-ils soudainement des sprints à travers la maison ?",
    a: [
      "Ils veulent attirer votre attention",
      "Ils ressentent la présence d'un fantôme",
      "Ils sentent un changement de météo",
      "Ils ont un trop-plein d'énergie accumulée"
    ]
  },
  "animaux-dump-0230": {
    q: "Pourquoi un chat se frotte-t-il contre les jambes de son maître ?",
    a: [
      "Pour marquer son territoire en déposant son odeur",
      "Parce qu'il l'aime beaucoup",
      "Pour montrer sa confiance",
      "Parce que c'est agréable"
    ]
  },
  "animaux-dump-0231": {
    q: "Pourquoi un chat enterre-t-il ses excréments dans sa litière ?",
    a: [
      "Pour prouver sa dominance",
      "Pour masquer sa piste face aux prédateurs",
      "Parce que c'est un animal très propre",
      "Parce qu'il est très territorial"
    ]
  },
  "animaux-dump-0234": {
    q: "Pourquoi les chats deviennent-ils fous au contact de l'herbe aux chats (cataire) ?",
    a: [
      "Parce qu'elle sent la nourriture délicieuse",
      "Parce qu'elle imite l'odeur d'un chat en chaleur",
      "Parce qu'elle sent la proie",
      "Parce que c'est un aphrodisiaque"
    ]
  },
  "animaux-dump-0237": {
    q: "Pourquoi les vers de terre remontent-ils à la surface après une forte pluie ?",
    a: [
      "Plusieurs théories existent sans certitude absolue",
      "Ils se noient quand leurs galeries sont inondées",
      "Ils ne supportent pas l'acidité de la pluie",
      "La température de surface est plus fraîche"
    ]
  },
  "animaux-dump-0254": {
    q: "Que signifie littéralement le mot 'guépard' (cheetah) d'origine sanskrite ?",
    a: ["Rapide", "Éclair", "Félin furtif", "Le tacheté"]
  },
  "animaux-dump-0260": {
    q: "Quelle grenouille est la plus venimeuse au monde ?",
    a: ["La rainette aux yeux rouges", "La grenouille dendrobate", "La grenouille corroboree", "Le crapaud buffle"]
  },
  "animaux-dump-0265": {
    q: "Quelle est la taille typique d'un zèbre au garrot ?",
    a: ["1,6 m", "1,2 m", "1,8 m", "0,9 m"]
  },
  "animaux-dump-0266": {
    q: "À quelle vitesse maximale un zèbre peut-il courir ?",
    a: ["50 km/h", "80 km/h", "65 km/h", "40 km/h"]
  },
  "animaux-dump-0268": {
    q: "Combien d'années un zèbre peut-il vivre en captivité ?",
    a: ["30 ans", "20 ans", "40 ans", "15 ans"]
  },
  "animaux-dump-0278": {
    q: "Quelle affirmation sur les fourmis est fausse ?",
    a: [
      "Les fourmis sont parfois consommées en salades thaïlandaises",
      "La fourmi balle de fusil possède la piqûre la plus douloureuse",
      "Une colonie peut manger ses propres larves en cas de famine",
      "Le tamanoir ne mange que des fourmis à l'exclusion de tout autre aliment"
    ]
  },
  "animaux-dump-0283": {
    q: "Pourquoi les flamants roses dorment-ils souvent sur une seule patte ?",
    a: [
      "Personne ne le sait avec certitude",
      "Pour éviter que leurs pattes ne soient détrempées",
      "Pour éviter d'avoir les pattes fatiguées",
      "Pour remuer le moins de vase possible au fond de l'eau"
    ]
  },
  "animaux-dump-0284": {
    q: "Dans quelle décennie le flamant rose en plastique pour pelouse a-t-il été créé ?",
    a: ["Années 1950", "Années 1940", "Années 1930", "Années 1980"]
  },
  "animaux-dump-0287": {
    q: "Pourquoi le thylacine était-il surnommé 'tigre de Tasmanie' ?",
    a: [
      "Parce qu'il ressemblait à un félin",
      "En raison de son agressivité",
      "En raison des rayures sur son dos",
      "Pour sa manière féroce de tuer ses proies"
    ]
  },
  "animaux-dump-0325": {
    q: "Pourquoi voit-on très rarement les nids ou les œufs de pigeons des villes ?",
    a: [
      "Les pigeons ne construisent pas de nids",
      "Les pigeons camouflent parfaitement leurs nids",
      "Les pigeons nichent sur les falaises et bâtiments en hauteur",
      "Les pigeons ne nichent que dans de très rares arbres"
    ]
  },
  "animaux-dump-0337": {
    q: "Dans les années 1980, qui doublait la voix originale de Dino dans Les Pierrafeu ?",
    a: ["Mel Blanc", "Frank Welker", "Alan Reed", "Jean Vander Pyl"]
  },
  "animaux-dump-0364": {
    q: "Laquelle de ces affirmations sur les éléphants est vraie ?",
    a: [
      "L'éléphant n'est pas une espèce protégée",
      "L'éléphant est capable de sauter",
      "La peau de l'éléphant mesure 6 cm d'épaisseur",
      "L'éléphant est un très bon nageur"
    ]
  },
  "animaux-dump-0369": {
    q: "De quel groupe d'animaux se compose principalement le régime de l'échidné ?",
    a: ["Mammifères", "Poissons", "Insectes", "Oiseaux"]
  },
  "animaux-dump-0370": {
    q: "D'où le kookaburra, oiseau emblématique d'Australie, tire-t-il son nom ?",
    a: [
      "Du son de son cri",
      "De son régime alimentaire",
      "De son apparence physique",
      "D'un mot aborigène"
    ]
  },
  "animaux-dump-0388": {
    q: "De quel pays le cheval de race Clydesdale est-il originaire ?",
    a: ["Angleterre", "Écosse", "Irlande", "Espagne"]
  },
  "animaux-dump-0389": {
    q: "Quelle marque de bière utilise les chevaux Clydesdale comme mascotte légendaire ?",
    a: ["Foster's", "Heineken", "Upland", "Budweiser (Anheuser-Busch)"]
  },
  "animaux-dump-0390": {
    q: "En quelle année la Clydesdale Horse Society a-t-elle été officiellement fondée ?",
    a: ["1885", "1877", "1925", "1901"]
  },
  "animaux-dump-0393": {
    q: "Combien de temps dure la gestation d'une jument Clydesdale ?",
    a: ["15 mois", "11 mois", "9 mois", "24 mois"]
  },
  "animaux-dump-0396": {
    q: "Quel surnom donne-t-on au chien chanteur de Nouvelle-Guinée ?",
    a: ["Le nageur", "Le lutteur", "Le rôdeur", "Le chanteur"]
  },
  "animaux-dump-0397": {
    q: "De quelles couleurs peut être la robe du pékinois ?",
    a: ["Toutes ces couleurs", "Noir", "Blanc", "Fauve doré"]
  },
  "animaux-dump-0398": {
    q: "Dans quelle région européenne le colley à poil long (Rough Collie) est-il apparu ?",
    a: ["Écosse", "France", "Allemagne", "Irlande"]
  },
  "animaux-dump-0399": {
    q: "Quelle race de chien possède un corps allongé, de courtes pattes et un long museau ?",
    a: ["Elo", "Foxhound anglais", "Teckel", "Dogue du Guatemala"]
  },
  "animaux-dump2-0430": {
    q: "Pourquoi les nids de pigeons sont-ils si rarement observés en ville ?",
    a: [
      "Les pigeons nichent sur les façades élevées et corniches rocheuses",
      "Les pigeons ne font pas de nids",
      "Les pigeons dissimulent minutieusement leurs nids",
      "Les pigeons ne choisissent que certains types d'arbres rares"
    ]
  },
  "animaux-dump2-0442": {
    q: "Qui prêtait sa voix à Dino, le dinosaure domestique de la famille Pierrafeu ?",
    a: ["Alan Reed", "Mel Blanc", "Jean Vander Pyl", "Frank Welker"]
  },
  "animaux-dump2-0469": {
    q: "Parmi ces affirmations sur les éléphants, laquelle est correcte ?",
    a: [
      "L'éléphant est un excellent nageur",
      "La peau de l'éléphant fait 6 centimètres d'épaisseur",
      "L'éléphant n'est pas protégé",
      "L'éléphant est doué pour le saut"
    ]
  },
  "animaux-dump2-0474": {
    q: "De quoi l'échidné se nourrit-il essentiellement ?",
    a: ["D'insectes", "De mammifères", "De poissons", "D'oiseaux"]
  },
  "animaux-dump2-0475": {
    q: "Quelle est l'origine du nom de l'oiseau australien kookaburra ?",
    a: [
      "Son nom dans la langue aborigène Wiradjuri",
      "Son apparence physique",
      "Sa nourriture favorite",
      "L'onomatopée de son rire"
    ]
  },
  "animaux-dump2-0493": {
    q: "De quelle nation est originaire le cheval de trait Clydesdale ?",
    a: ["Écosse", "Espagne", "Irlande", "Angleterre"]
  },
  "animaux-dump2-0494": {
    q: "Quelle célèbre brasserie emploie un attelage de chevaux Clydesdale dans ses publicités ?",
    a: ["Anheuser-Busch", "Foster's", "Heineken", "Upland"]
  },
  "animaux-dump2-0495": {
    q: "En quelle année a été fondée la société officielle du cheval Clydesdale ?",
    a: ["1887", "1885", "1925", "1901"]
  },
  "animaux-dump2-0498": {
    q: "Quelle est la durée de gestation d'un cheval Clydesdale ?",
    a: ["11 mois", "9 mois", "15 mois", "24 mois"]
  },
  "animaux-dump2-0501": {
    q: "Quel qualificatif donne-t-on traditionnellement au chien des hautes terres de Nouvelle-Guinée ?",
    a: ["Rôdeur", "Chanteur", "Nageur", "Lutteur"]
  },
  "animaux-dump2-0502": {
    q: "Quelles couleurs de pelage sont admises pour le chien pékinois ?",
    a: ["Toutes ces couleurs", "Noir", "Blanc", "Doré"]
  },
  "animaux-dump2-0503": {
    q: "Quel pays d'Europe est le berceau historique du colley à poil long ?",
    a: ["Irlande", "France", "Écosse", "Allemagne"]
  },
  "animaux-dump2-0504": {
    q: "Quel chien est réputé pour son corps longiligne et ses pattes très courtes ?",
    a: ["Dogue guatémaltèque", "Teckel", "Elo", "Foxhound"]
  },
  "animaux-dump2-0505": {
    q: "Quelle très grande race de chien allemande est également appelée grand danois ?",
    a: ["Dogue allemand", "Boarhound", "Grand danois", "Tous ces noms"]
  },
  "animaux-dump2-0519": {
    q: "De quelle couleur sont généralement les yeux des tortues-boîtes mâles ?",
    a: ["Bleus", "Verts", "Noirs", "Rouges"]
  },
  "animaux-dump2-0529": {
    q: "Dans quel pays d'Amérique latine le chihuahua trouve-t-il ses origines ?",
    a: ["Cuba", "Mexique", "Nicaragua", "Guatemala"]
  },
  "animaux-dump2-0531": {
    q: "De quel pays la race de chien Akita est-elle originaire à la base ?",
    a: ["États-Unis", "Japon", "Chine", "Canada"]
  },
  "animaux-dump2-0533": {
    q: "Dans quelle région nordique le Husky sibérien a-t-il été développé ?",
    a: ["Finlande", "Russie", "Norvège", "Alaska"]
  },
  "animaux-dump2-0544": {
    q: "À quelle période de l'année le ragondin se reproduit-il ?",
    a: ["Pendant les mois d'hiver", "À l'automne", "Au printemps", "Toute l'année"]
  },
  "animaux-dump2-0548": {
    q: "À quel rang de popularité des races canines figurait le Yorkshire Terrier aux USA en 2008 ?",
    a: ["50e", "2e", "1er", "79e"]
  },
  "animaux-dump2-0559": {
    q: "À quel embranchement (phylum) les méduses appartiennent-elles ?",
    a: ["Mollusques", "Chordés", "Arthropodes", "Cnidaires"]
  },
  "animaux-dump2-0578": {
    q: "Où rencontre-t-on principalement les chauves-souris vampires ?",
    a: ["Mexique, Amérique centrale et Amérique du Sud", "Afrique", "Asie", "Australie"]
  },
  "animaux-dump2-0580": {
    q: "De quelles façons les loups marquent-ils leur territoire ?",
    a: ["Par l'urine", "Par les fèces", "Par toutes ces méthodes", "En se frottant aux objets"]
  },
  "animaux-dump2-0597": {
    q: "D'où le mamba noir tire-t-il son nom ?",
    a: [
      "De son venin noir",
      "De ses œufs noirs",
      "De l'intérieur noir de sa bouche",
      "De sa peau extérieure"
    ]
  },
  "animaux-dump2-0616": {
    q: "Quelle affirmation sur la reproduction du chinchilla est erronée ?",
    a: [
      "Les portées se composent majoritairement de jumeaux",
      "Les petits naissent avec des poils et les yeux ouverts",
      "Ils peuvent se reproduire à n'importe quelle saison",
      "La gestation ne dure que 45 jours"
    ]
  },
  "animaux-dump2-0622": {
    q: "À quel groupe canin appartient le chien chinois à crête ?",
    a: ["Chiens de compagnie (Toy)", "Chiens courants", "Chiens de travail", "Chiens de chasse"]
  },
  "animaux-dump2-0635": {
    q: "Quel chanteur célèbre a sorti l'album 'The Fox' en 1981 ?",
    a: ["Julio Iglesias", "Barry White", "Elton John", "Tom Jones"]
  },
  "animaux-dump2-0647": {
    q: "Pourquoi les colibris sont-ils appelés 'hummingbirds' en anglais ?",
    a: [
      "Pour la beauté de leur chant",
      "Pour le bourdonnement produit par leurs battements d'ailes",
      "En hommage à Michael Hummings",
      "Aucune de ces réponses"
    ]
  },
  "animaux-dump2-0655": {
    q: "Pourquoi le colibri d'Elena est-il surnommé 'colibri-abeille' ?",
    a: [
      "À cause de son plumage jaune et noir",
      "Parce qu'il a la taille approximative d'une grosse abeille",
      "Pour le bruit caractéristique de ses ailes",
      "Parce qu'il chasse les abeilles"
    ]
  },
  "animaux-dump2-0656": {
    q: "Où le vacher géant, oiseau parasite d'Amérique du Sud, pond-il ses œufs ?",
    a: ["Au sol", "Dans le nid d'autres oiseaux", "Sur les balcons", "Sur les falaises rocheuses"]
  },
  "animaux-dump2-0667": {
    q: "À quel moment de la journée le requin-tigre chasse-t-il préférentiellement ?",
    a: ["La nuit", "En milieu de matinée", "Tôt le matin", "À heures variables toute la journée"]
  },
  "animaux-dump2-0676": {
    q: "Quels aliments insolites les porcs omnivores peuvent-ils consommer occasionnellement ?",
    a: ["Leurs propres petits", "De l'écorce d'arbre", "Tous ces aliments", "Des carcasses en décomposition"]
  },
  "animaux-dump2-0703": {
    q: "Où se situent les membranes de vol plané chez le lézard dragon volant (Draco) ?",
    a: [
      "Il n'a pas de membrane",
      "Entre ses doigts et ses orteils",
      "Soutenues par ses côtes allongées",
      "Entre ses pattes avant et arrière"
    ]
  },
  "animaux-dump2-0714": {
    q: "Quel cétacé projette un liquide brun rougeâtre pour fuir lorsqu'il est menacé ?",
    a: ["La baleine à bec d'Andrew", "Le cachalot nain", "Le cachalot pygmée", "Le rorqual commun"]
  },
  "animaux-dump2-0717": {
    q: "Quelle famille de cétacés est désignée sous le terme scientifique 'Delphinidae' ?",
    a: ["Les rorquals", "Les baleines franches", "Les dauphins", "Les marsouins"]
  },
  "animaux-dump2-0718": {
    q: "Quel groupe de cétacés la famille 'Phocoenidae' regroupe-t-elle ?",
    a: ["Les marsouins", "Les dauphins", "Les dauphins de rivière", "Les baleines à bec"]
  },
  "animaux-dump2-0727": {
    q: "Dans quelle région actuelle vivait le Microraptor, petit dinosaure ailé du Crétacé inférieur ?",
    a: ["Madagascar", "Canada", "Australie", "Chine"]
  },
  "animaux-dump2-0742": {
    q: "À quel instrument de musique le cri du manchot gorfou doré (Macaroni) ressemble-t-il ?",
    a: ["La flûte", "La trompette", "L'ocarina", "Le saxophone"]
  },
  "animaux-final-0805": {
    q: "Où se trouvent les membranes portantes du lézard planeur Draco ?",
    a: [
      "Entre ses pattes avant et arrière",
      "Entre ses doigts",
      "Il n'a pas de membranes",
      "Déployées le long de ses côtes allongées"
    ]
  },
  "animaux-final-0816": {
    q: "Quel cétacé émet un nuage de liquide rouge-brun lorsqu'il est en danger ?",
    a: ["Baleine à bec d'Andrew", "Cachalot pygmée", "Rorqual commun", "Cachalot nain"]
  },
  "animaux-final-0819": {
    q: "Quels cétacés appartiennent à la famille des delphinidés ?",
    a: ["Les dauphins", "Les baleines franches", "Les marsouins", "Les rorquals"]
  },
  "animaux-final-0820": {
    q: "Quels animaux composent la famille scientifique des Phocoenidae ?",
    a: ["Les marsouins", "Les baleines à bec", "Les dauphins", "Les dauphins du Gange"]
  },
  "animaux-final-0829": {
    q: "Dans quel pays contemporain ont été découverts les fossiles du Microraptor ?",
    a: ["Canada", "Chine", "Australie", "Madagascar"]
  },
  "animaux-final-0844": {
    q: "Le chant nuptial du gorfou doré rappelle la sonorité de quel instrument ?",
    a: ["Le saxophone", "L'ocarina", "La trompette", "La flûte"]
  },
  "animaux-final-0845": {
    q: "La majorité des espèces de manchots sont piscivores, ce qui signifie :",
    a: ["Qu'ils se nourrissent de poissons", "Qu'ils mangent des plantes", "Qu'ils vivent en eau douce", "Qu'ils ne boivent jamais"]
  },
  "animaux-final-0852": {
    q: "Quelle posture de repos insolite la toupaye de Madras adopte-t-elle souvent ?",
    a: [
      "Suspendue la tête en bas",
      "Blottie contre ses pattes arrière",
      "Avec sa queue repliée sur sa tête",
      "Étendue de tout son long simulant la mort"
    ]
  },
  "animaux-final-0855": {
    q: "Comment les ornithorynques se reproduisent-ils ?",
    a: [
      "Par reproduction asexuée",
      "En pondant des œufs",
      "Comme des marsupiaux",
      "Aucune de ces réponses"
    ]
  },
  "animaux-final-0862": {
    q: "De quelle région géographique les chinchillas sont-ils originaires ?",
    a: ["Amérique du Nord", "Asie", "Amérique du Sud", "Afrique"]
  },
  "animaux-final-0866": {
    q: "Quelle variété de chinchilla a disparu en raison de la chasse pour sa fourrure ?",
    a: ["Le chinchilla géant", "Le chinchilla à longue queue", "Le chinchilla à nez rouge", "Toutes ces espèces"]
  },
  "animaux-final-0876": {
    q: "Quelle race de chat sans poils est originaire de Russie ?",
    a: ["Don Sphynx", "Donskoy", "Tous ces noms", "Don nu"]
  },
  "animaux-final-0877": {
    q: "Quelle race de chat originaire de Thaïlande a un corps élancé et de très grandes oreilles ?",
    a: ["Oriental shorthair", "Selkirk Rex", "Singapura", "Siamois"]
  },
  "animaux-final-0884": {
    q: "De quel organe interne essentiel l'autruche est-elle dépourvue ?",
    a: ["Le foie", "La rate", "La vésicule biliaire", "Tous ces organes"]
  },
  "animaux-final-0887": {
    q: "Quelle particularité anatomique remarquable possède l'autruche mâle ?",
    a: [
      "Elle possède quatre testicules",
      "Toutes ces caractéristiques",
      "Elle possède un organe copulateur",
      "Elle a une petite corne sur le crâne"
    ]
  },
  "animaux-final-0889": {
    q: "Quelle sous-espèce d'autruche possède de petites plumes sur la tête contrairement aux autres ?",
    a: ["Autruche de Somalie", "Autruche масаï", "Autruche rouge", "Autruche australe"]
  },
  "animaux-final-0890": {
    q: "Quelle sous-espèce d'autruche s'est éteinte vers le milieu du XXe siècle (1966) ?",
    a: ["Autruche de Somalie", "Autruche d'Arabie", "Autruche à cou rouge", "Autruche d'Afrique du Sud"]
  },
  "animaux-final-0894": {
    q: "Quelle espèce d'éléphant possède deux doigts préhensiles au bout de sa trompe ?",
    a: ["Éléphant d'Asie", "Éléphant du Sri Lanka", "Éléphant d'Afrique", "Toutes ces espèces"]
  },
  "animaux-final-0896": {
    q: "Quelle affirmation est exacte à propos des mamelles des éléphantes ?",
    a: [
      "Elles n'ont qu'une seule mamelle",
      "Elles ont deux paires de mamelles",
      "Elles ont une paire de mamelles pectorales",
      "Aucune de ces réponses"
    ]
  },
  "animaux-final-0897": {
    q: "Quelle est la durée moyenne de la gestation chez l'éléphant ?",
    a: ["12 mois", "30 mois", "22 mois", "18 mois"]
  },
  "animaux-final-0899": {
    q: "Pourquoi le jeune éléphanteau a-t-il du mal à contrôler sa trompe à la naissance ?",
    a: [
      "Elle est trop lourde",
      "Il manque de tonus musculaire et d'apprentissage nerveux",
      "Il ne ressent aucune sensation",
      "Toutes ces raisons"
    ]
  },
  "animaux-final-0921": {
    q: "De quel continent le cochon d'Inde est-il originaire ?",
    a: ["Amérique du Sud", "Australie et Nouvelle-Guinée", "Amérique du Nord", "Afrique"]
  },
  "animaux-final-0927": {
    q: "Quel acteur doublait le cochon d'Inde Rodney dans le film Docteur Dolittle (1998) ?",
    a: ["Eddie Murphy", "Chris Rock", "Jim Carrey", "Chris Tucker"]
  },
  "animaux-final-0929": {
    q: "De quel continent le raton laveur est-il indigène ?",
    a: ["Amérique du Nord", "Asie", "Europe", "Australie"]
  },
  "animaux-final-0930": {
    q: "Quel comportement de 'lavage' stéréotypé les ratons laveurs captifs pratiquent-ils ?",
    a: ["Nettoyer leurs pattes dans l'eau", "Laper des cailloux", "Cacher des graines", "Tourner sur eux-mêmes"]
  },
  "animaux-final-0932": {
    q: "Lequel de ces prédateurs s'attaque couramment au raton laveur sauvage ?",
    a: ["Tous ces prédateurs", "Le pygargue à tête blanche", "Le coyote", "Le lynx roux"]
  },
  "animaux-final-0936": {
    q: "Pour quel produit les ratons laveurs ont-ils été massivement chassés dans l'histoire ?",
    a: ["Leur graisse", "Leur viande", "Leur fourrure", "Leurs os"]
  },
  "animaux-final-0937": {
    q: "Dans quel grand film d'animation Disney l'héroïne a-t-elle un raton laveur nommé Meeko ?",
    a: ["Le Roi Lion", "Mulan", "Shrek", "Pocahontas"]
  },
  "animaux-final-0942": {
    q: "Pourquoi l'orvet ou 'lézard de verre' porte-t-il ce surnom singulier ?",
    a: [
      "Ses yeux brillent comme du verre",
      "Il est translucide",
      "Il grimpe sur les vitres",
      "Sa queue se brise très facilement lorsqu'il est attaqué"
    ]
  },
  "animaux-final-0963": {
    q: "Quelle espèce de grand kangourou peut atteindre une vitesse de pointe de 64 km/h ?",
    a: ["Toutes ces espèces", "Le kangourou géant", "Le kangourou de Tasmanie", "Le grand kangourou gris"]
  },
  "animaux-final-0967": {
    q: "Quel autre nom vernaculaire donne-t-on au necture tacheté (mudpuppy) ?",
    a: ["Chien d'eau", "Canin aquatique", "Salamandre géante", "Chien de boue"]
  },
  "animaux-final-0968": {
    q: "À quel ordre zoologique appartient le necture tacheté (mudpuppy) ?",
    a: ["Les scinques", "Les poissons", "Les salamandres (amphibiens urodèles)", "Les anguilles"]
  },
  "animaux-final-0972": {
    q: "Quelle taille moyenne mesure un necture tacheté adulte ?",
    a: ["30 cm", "15 cm", "5 cm", "35 à 40 cm"]
  },
  "animaux-final-0973": {
    q: "Dans quelle région géographique les wombats sont-ils endémiques ?",
    a: ["Australie", "Afrique", "Amérique du Sud", "Madagascar"]
  },
  "animaux-final-0976": {
    q: "Quelle particularité anatomique remarquable la poche des wombats présente-t-elle ?",
    a: [
      "Elle n'a pas de paupières",
      "Elle est orientée vers l'arrière pour ne pas recevoir de terre en creusant",
      "Elle ne possède pas de rate",
      "Toutes ces réponses"
    ]
  },
  "animaux-final-0991": {
    q: "Comment la plupart des chauves-souris tempérées passent-elles l'hiver froid ?",
    a: [
      "Aucune de ces réponses",
      "Elles migrent au sud dans les zones tropicales",
      "Elles ne modifient pas leurs habitudes",
      "Elles hibernent dans des grottes"
    ]
  },
  "animaux-final-0998": {
    q: "À quelle ère géologique les ammonites sont-elles apparues ?",
    a: ["Au Dévonien", "Au Crétacé", "Au Jurassique", "Au Cambrien"]
  },
  "animaux-final-1002": {
    q: "À la fin de quelle période géologique les ammonites ont-elles totalement disparu ?",
    a: ["Au Jurassique", "Au Crétacé", "Au Trias", "Au Permien"]
  },
  "animaux-final-1020": {
    q: "Quelle caractéristique singulière toutes les cécilies (amphibiens gymnophiones) partagent-elles ?",
    a: [
      "Elles ont des oreilles externes",
      "Elles sont hermaphrodites",
      "Elles possèdent quatre yeux",
      "Elles sont totalement apodes (sans pattes)"
    ]
  },
  "animaux-final-1021": {
    q: "À quel animal la grande sirène (amphibien aquatique) ressemble-t-elle à première vue ?",
    a: ["Une anguille", "Un lézard", "Une grenouille", "Un gecko"]
  },
  "animaux-final-1026": {
    q: "Où la femelle du crapaud du Surinam (Pipa pipa) incube-t-elle ses œufs ?",
    a: ["Dans son estomac", "Entre ses pattes arrière", "Enfouis dans la peau de son dos", "Dans son sac vocal"]
  },
  "animaux-final-1036": {
    q: "Quelle particularité physique célèbre caractérise le lémurien aye-aye de Madagascar ?",
    a: [
      "Il a quatre mamelles",
      "Toutes ces réponses",
      "Ses pupilles sont dilatées en permanence",
      "Il a un majeur extrêmement long et effilé pour déloger les larves"
    ]
  },
  "animaux-final-1037": {
    q: "Où le nocturne aye-aye dort-il pendant la journée ?",
    a: [
      "Dans des nids de branchages perchés dans les arbres",
      "Suspendu à une branche par les pieds",
      "Sur une branche sous une feuille de palmier",
      "Dans des terriers souterrains"
    ]
  },
  "animaux-final-1049": {
    q: "Quelle particularité anatomique remarquable caractérise l'appareil reproducteur des koalas ?",
    a: [
      "La femelle a deux vagins latéraux",
      "La femelle a deux utérus distincts",
      "Toutes ces caractéristiques",
      "Le mâle a un pénis bifide"
    ]
  },
  "animaux-dump-0151": {
    q: "Sur quel continent ne vit aucune espèce de lézard à l'état sauvage ?",
    a: ["Amérique du Sud", "Asie", "Europe", "Antarctique"]
  },
  "animaux-dump-0202": {
    q: "Environ quelle quantité de viande un lion mâle adulte doit-il consommer par jour ?",
    a: ["4,5 kg", "6,8 kg", "2,2 kg", "11 kg"]
  },
  "animaux-dump-0223": {
    q: "Par quel organe les papillons goûtent-ils leur nourriture ?",
    a: ["Les pattes", "Leurs yeux à facettes", "Les ailes", "La trompe"]
  },
  "animaux-dump-0271": {
    q: "Depuis environ combien de temps les fourmis existent-elles sur Terre ?",
    a: ["8 millions d'années", "60 millions d'années", "45 millions d'années", "25 millions d'années"]
  },
  "animaux-dump-0311": {
    q: "De quel animal les hyènes sont-elles génétiquement les plus proches phylogénétiquement ?",
    a: ["Les félins", "Les ours", "Les mangoustes", "Les blaireaux"]
  },
  "animaux-dump-0355": {
    q: "Jusqu'à quel âge environ une femelle éléphant peut-elle donner naissance à des petits ?",
    a: ["7 ans", "15 ans", "75 ans", "50 ans"]
  },
  "animaux-dump2-0416": {
    q: "De quel groupe d'animaux les hyènes sont-elles phylogénétiquement les plus proches ?",
    a: ["Blaireaux", "Félins", "Mangoustes", "Ours"]
  },
  "animaux-dump2-0460": {
    q: "Jusqu'à quel âge une femelle éléphant peut-elle avoir des petits ?",
    a: ["75 ans", "50 ans", "15 ans", "7 ans"]
  },
  "animaux-dump2-0521": {
    q: "De quoi les aleurodes (mouches blanches) se nourrissent-elles principalement ?",
    a: ["De fruits", "D'insectes", "De feuilles et sève", "De charognes"]
  },
  "animaux-dump2-0564": {
    q: "Selon les statistiques environnementales, par quels moyens les loups sont-ils tués de nos jours ?",
    a: ["Par les chasseurs et braconniers", "Par toutes ces causes réunies", "Par des activités humaines directes", "Par les poisons et tirs aériens"]
  },
  "animaux-dump2-0568": {
    q: "À quel âge un jeune loup quitte-t-il généralement sa meute d'origine ?",
    a: ["2 à 3 ans", "5 à 6 ans", "1 à 2 ans", "3 à 4 ans"]
  },
  "animaux-dump2-0573": {
    q: "Quel est le plus grand mollusque et le plus grand invertébré au monde ?",
    a: ["Le calmar colossal", "Le calmar géant", "La pieuvre géante du Pacifique", "L'escargot géant africain"]
  },
  "animaux-dump2-0621": {
    q: "Quelles sont les deux variétés officielles du chien chinois à crête ?",
    a: ["Nu et courant", "Sportif et tacheté", "Nu et houppette à poudre (Powderpuff)", "Aquatique et coureur"]
  },
  "animaux-dump2-0709": {
    q: "De quoi se nourrissent principalement les scarabées Goliath adultes dans les forêts tropicales d'Afrique ?",
    a: ["De charognes", "De fruits et de sève d'arbres", "D'insectes et invertébrés", "De feuilles et d'herbes"]
  },
  "animaux-dump2-0743": {
    q: "La plupart des manchots sont piscivores, ce qui signifie :",
    a: ["Qu'ils se nourrissent principalement de poissons", "Qu'ils sont strictement aquatiques", "Qu'ils ne boivent jamais", "Qu'ils ont un corps fuselé"]
  },
  "animaux-final-0811": {
    q: "De quoi les scarabées Goliath adultes d'Afrique se nourrissent-ils préférentiellement ?",
    a: ["De charognes", "De feuilles et d'herbes", "D'insectes et invertébrés", "De fruits mûrs et sève d'arbre"]
  }
};

export function applyTranslations() {
  const frDir = path.join(QUESTIONS_ROOT, "fr", "animaux");
  let updatedCount = 0;
  let fileCount = 0;

  for (const file of fs.readdirSync(frDir)) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(frDir, file);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const items = Array.isArray(raw) ? raw : [raw];
    let modified = false;

    for (const item of items) {
      const trans = TRANSLATIONS[item.id];
      if (trans) {
        if (trans.a.length !== item.answers.length) {
          throw new Error(`Incohérence answers length pour ${item.id}: trans=${trans.a.length}, orig=${item.answers.length}`);
        }
        item.question = trans.q;
        item.answers = trans.a;
        item.language = "fr";
        modified = true;
        updatedCount++;
      }
    }

    if (modified) {
      fileCount++;
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
    }
  }

  console.log(`✓ ${updatedCount} questions traduites et corrigées dans ${fileCount} fichiers de questions/fr/animaux/.`);
}

applyTranslations();
