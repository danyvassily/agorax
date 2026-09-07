import os
import json
import urllib.request
import time

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
ROOT_DIR = "/Users/danyvassily/Documents/dev/Agorax"
FR_DIR = os.path.join(ROOT_DIR, "questions", "fr")
EN_DIR = os.path.join(ROOT_DIR, "questions", "en")

def call_deepseek(messages):
    url = "https://api.deepseek.com/chat/completions"
    data = json.dumps({
        "model": "deepseek-chat",
        "messages": messages,
        "response_format": {"type": "json_object"}
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    })
    
    with urllib.request.urlopen(req) as response:
        body = response.read().decode("utf-8")
        parsed = json.loads(body)
        return parsed["choices"][0]["message"]["content"]

def get_all_json_files(directory):
    results = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".json"):
                results.append(os.path.join(root, file))
    return results

def translate_file(file_path):
    rel_path = os.path.relpath(file_path, FR_DIR)
    target_path = os.path.join(EN_DIR, rel_path)
    
    if os.path.exists(target_path):
        print(f"⏭️ Ignoré (déjà traduit) : {rel_path}")
        return
        
    print(f"⏳ Traduction en cours : {rel_path}...")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = json.load(f)
        
    system_prompt = '''You are an expert translator. Translate the following array of trivia questions from French to English. 
Return ONLY a valid JSON object with a single key "questions" containing the translated array.
The JSON schema for each question must remain EXACTLY the same:
{
  "id": "same-id",
  "question": "translated question",
  "answers": ["translated answer 1", "translated answer 2", "translated answer 3", "translated answer 4"],
  "correct_answer": "translated correct answer",
  "explanation": "translated explanation (if present)",
  "language": "en"
}
Ensure the correct_answer exactly matches one of the items in the answers array. Do NOT translate IDs.'''

    try:
        response_text = call_deepseek([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(content)}
        ])
        
        result = json.loads(response_text)
        translated_array = result.get("questions")
        
        if not isinstance(translated_array, list) or len(translated_array) == 0:
            raise Exception("Invalid format returned by DeepSeek")
            
        for q in translated_array:
            q["language"] = "en"
            
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(translated_array, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Succès : {rel_path}")
    except Exception as e:
        print(f"❌ Échec pour {rel_path} : {str(e)}")

def main():
    print("🚀 Démarrage de la traduction de la base de données en anglais...")
    files = get_all_json_files(FR_DIR)
    print(f"📁 {len(files)} fichiers JSON trouvés dans questions/fr/\n")
    
    for file in files:
        translate_file(file)
        time.sleep(1)
        
    print("✨ Traduction terminée !")

if __name__ == "__main__":
    main()
