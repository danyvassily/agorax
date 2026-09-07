import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env.local if present
dotenv.config({ path: ".env.local" });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error("❌ ERREUR: La clé DEEPSEEK_API_KEY est manquante dans .env.local");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");
const FR_DIR = path.join(ROOT_DIR, "questions", "fr");
const EN_DIR = path.join(ROOT_DIR, "questions", "en");

async function callDeepSeek(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      response_format: { type: "json_object" }
    });

    const req = https.request(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${body}`));
          } else {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed.choices[0].message.content);
            } catch (e) {
              reject(e);
            }
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getAllJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(fullPath));
    } else if (file.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function translateFile(filePath) {
  const relPath = path.relative(FR_DIR, filePath);
  const targetPath = path.join(EN_DIR, relPath);

  if (fs.existsSync(targetPath)) {
    console.log(`⏭️ Ignoré (déjà traduit) : ${relPath}`);
    return;
  }

  console.log(`⏳ Traduction en cours : ${relPath}...`);
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  const systemPrompt = `You are an expert translator. Translate the following array of trivia questions from French to English. 
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
Ensure the correct_answer exactly matches one of the items in the answers array. Do NOT translate IDs.`;

  try {
    const responseText = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(content) }
    ]);

    const result = JSON.parse(responseText);
    const translatedArray = result.questions;

    if (!Array.isArray(translatedArray) || translatedArray.length === 0) {
      throw new Error("Invalid format returned by DeepSeek");
    }

    // Force language to 'en'
    translatedArray.forEach(q => q.language = "en");

    ensureDirSync(path.dirname(targetPath));
    fs.writeFileSync(targetPath, JSON.stringify(translatedArray, null, 2), "utf-8");
    console.log(`✅ Succès : ${relPath}`);
  } catch (err) {
    console.error(`❌ Échec pour ${relPath} :`, err.message);
  }
}

async function main() {
  console.log("🚀 Démarrage de la traduction de la base de données en anglais...");
  const files = getAllJsonFiles(FR_DIR);
  console.log(`📁 ${files.length} fichiers JSON trouvés dans questions/fr/\n`);

  for (let i = 0; i < files.length; i++) {
    await translateFile(files[i]);
    // Petite pause pour éviter le rate-limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("✨ Traduction terminée !");
}

main().catch(console.error);
