import json
import random
import os

countries = [
  {"code": "fr", "name": "France"}, {"code": "jp", "name": "Japon"},
  {"code": "br", "name": "Brésil"}, {"code": "ca", "name": "Canada"},
  {"code": "za", "name": "Afrique du Sud"}, {"code": "us", "name": "États-Unis"},
  {"code": "gb", "name": "Royaume-Uni"}, {"code": "de", "name": "Allemagne"},
  {"code": "it", "name": "Italie"}, {"code": "es", "name": "Espagne"},
  {"code": "cn", "name": "Chine"}, {"code": "in", "name": "Inde"},
  {"code": "au", "name": "Australie"}, {"code": "ru", "name": "Russie"},
  {"code": "mx", "name": "Mexique"}, {"code": "ar", "name": "Argentine"},
  {"code": "kr", "name": "Corée du Sud"}, {"code": "tr", "name": "Turquie"},
  {"code": "sa", "name": "Arabie Saoudite"}, {"code": "eg", "name": "Égypte"},
  {"code": "ng", "name": "Nigeria"}, {"code": "ke", "name": "Kenya"},
  {"code": "dz", "name": "Algérie"}, {"code": "ma", "name": "Maroc"},
  {"code": "se", "name": "Suède"}, {"code": "no", "name": "Norvège"},
  {"code": "fi", "name": "Finlande"}, {"code": "dk", "name": "Danemark"},
  {"code": "ch", "name": "Suisse"}, {"code": "at", "name": "Autriche"},
  {"code": "gr", "name": "Grèce"}, {"code": "pt", "name": "Portugal"},
  {"code": "nl", "name": "Pays-Bas"}, {"code": "be", "name": "Belgique"},
  {"code": "pl", "name": "Pologne"}, {"code": "ua", "name": "Ukraine"},
  {"code": "ie", "name": "Irlande"}, {"code": "nz", "name": "Nouvelle-Zélande"},
  {"code": "cl", "name": "Chili"}, {"code": "co", "name": "Colombie"},
  {"code": "pe", "name": "Pérou"}, {"code": "ve", "name": "Venezuela"},
  {"code": "cu", "name": "Cuba"}, {"code": "jm", "name": "Jamaïque"},
  {"code": "th", "name": "Thaïlande"}, {"code": "vn", "name": "Vietnam"},
  {"code": "id", "name": "Indonésie"}, {"code": "my", "name": "Malaisie"},
  {"code": "ph", "name": "Philippines"}, {"code": "sg", "name": "Singapour"},
  {"code": "ir", "name": "Iran"}, {"code": "iq", "name": "Irak"},
  {"code": "il", "name": "Israël"}, {"code": "pk", "name": "Pakistan"}
]

def get_random_distractors(correct_name, count):
    distractors = []
    while len(distractors) < count:
        rand_name = random.choice(countries)["name"]
        if rand_name != correct_name and rand_name not in distractors:
            distractors.append(rand_name)
    return distractors

questions = []
for country in countries:
    distractors = get_random_distractors(country["name"], 3)
    answers = [country["name"]] + distractors
    random.shuffle(answers)
    correct_idx = answers.index(country["name"])
    
    questions.append({
        "id": f"flag-{country['code']}",
        "conceptId": f"flag-{country['code']}",
        "familyId": "flag-recognition",
        "type": "mcq",
        "inputMode": "mcq",
        "question": "À quel pays appartient ce drapeau ?",
        "answers": answers,
        "correctAnswer": correct_idx,
        "media": {
            "type": "svg",
            "url": f"https://flagcdn.com/{country['code']}.svg",
            "alt": f"Drapeau : {country['name']}",
            "attribution": "FlagCDN"
        },
        "category": "geographie",
        "subcategory": "Drapeaux du Monde",
        "difficulty": "easy",
        "language": "fr",
        "tags": ["drapeau", "visuel", "pays"],
        "source": { "provider": "flagcdn" },
        "verification": { "status": "verified", "sources": [] },
        "confidence": 1.0,
        "qualityScore": 1.0,
        "version": 1
    })

output_path = os.path.join(os.path.dirname(__file__), '../../questions/fr/geographie/drapeaux.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Generated {len(questions)} flag questions.")
