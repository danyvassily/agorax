const fs = require('fs');
const path = require('path');

const countries = [
  { code: 'fr', name: 'France' }, { code: 'jp', name: 'Japon' },
  { code: 'br', name: 'Brésil' }, { code: 'ca', name: 'Canada' },
  { code: 'za', name: 'Afrique du Sud' }, { code: 'us', name: 'États-Unis' },
  { code: 'gb', name: 'Royaume-Uni' }, { code: 'de', name: 'Allemagne' },
  { code: 'it', name: 'Italie' }, { code: 'es', name: 'Espagne' },
  { code: 'cn', name: 'Chine' }, { code: 'in', name: 'Inde' },
  { code: 'au', name: 'Australie' }, { code: 'ru', name: 'Russie' },
  { code: 'mx', name: 'Mexique' }, { code: 'ar', name: 'Argentine' },
  { code: 'kr', name: 'Corée du Sud' }, { code: 'tr', name: 'Turquie' },
  { code: 'sa', name: 'Arabie Saoudite' }, { code: 'eg', name: 'Égypte' },
  { code: 'ng', name: 'Nigeria' }, { code: 'ke', name: 'Kenya' },
  { code: 'dz', name: 'Algérie' }, { code: 'ma', name: 'Maroc' },
  { code: 'se', name: 'Suède' }, { code: 'no', name: 'Norvège' },
  { code: 'fi', name: 'Finlande' }, { code: 'dk', name: 'Danemark' },
  { code: 'ch', name: 'Suisse' }, { code: 'at', name: 'Autriche' },
  { code: 'gr', name: 'Grèce' }, { code: 'pt', name: 'Portugal' },
  { code: 'nl', name: 'Pays-Bas' }, { code: 'be', name: 'Belgique' },
  { code: 'pl', name: 'Pologne' }, { code: 'ua', name: 'Ukraine' },
  { code: 'ie', name: 'Irlande' }, { code: 'nz', name: 'Nouvelle-Zélande' },
  { code: 'cl', name: 'Chili' }, { code: 'co', name: 'Colombie' },
  { code: 'pe', name: 'Pérou' }, { code: 've', name: 'Venezuela' },
  { code: 'cu', name: 'Cuba' }, { code: 'jm', name: 'Jamaïque' },
  { code: 'th', name: 'Thaïlande' }, { code: 'vn', name: 'Vietnam' },
  { code: 'id', name: 'Indonésie' }, { code: 'my', name: 'Malaisie' },
  { code: 'ph', name: 'Philippines' }, { code: 'sg', name: 'Singapour' },
  { code: 'ir', name: 'Iran' }, { code: 'iq', name: 'Irak' },
  { code: 'il', name: 'Israël' }, { code: 'pk', name: 'Pakistan' }
];

function getRandomDistractors(correctName, count) {
    const distractors = [];
    while (distractors.length < count) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)].name;
        if (randomCountry !== correctName && !distractors.includes(randomCountry)) {
            distractors.push(randomCountry);
        }
    }
    return distractors;
}

const questions = countries.map((country, index) => {
    const distractors = getRandomDistractors(country.name, 3);
    const answers = [country.name, ...distractors];
    
    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    const correctAnswerIndex = answers.indexOf(country.name);

    return {
        id: `flag-${country.code}`,
        conceptId: `flag-${country.code}`,
        familyId: "flag-recognition",
        type: "mcq",
        inputMode: "mcq",
        question: "À quel pays appartient ce drapeau ?",
        answers: answers,
        correctAnswer: correctAnswerIndex,
        media: {
            type: "svg",
            url: `https://flagcdn.com/${country.code}.svg`,
            alt: `Drapeau : ${country.name}`,
            attribution: "FlagCDN"
        },
        category: "geographie",
        subcategory: "Drapeaux du Monde",
        difficulty: "easy",
        language: "fr",
        tags: ["drapeau", "visuel", "pays"],
        source: { provider: "flagcdn" },
        verification: { status: "verified", sources: [] },
        confidence: 1.0,
        qualityScore: 1.0,
        version: 1
    };
});

const outputPath = path.join(__dirname, '../../questions/fr/geographie/drapeaux.json');
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Generated ${questions.length} flag questions to ${outputPath}`);
