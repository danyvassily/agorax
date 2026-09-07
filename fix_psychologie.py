import json
import glob
import os

files = glob.glob("questions/fr/psychologie/*.json")
for file in files:
    with open(file, "r") as f:
        data = json.load(f)
    
    for q in data:
        q["conceptId"] = q["id"]
        q["familyId"] = "psychology-lore"
        q["inputMode"] = q.get("inputMode", "mcq")
        if "source" not in q:
            q["source"] = {"provider": "original"}
        if "verification" not in q:
            q["verification"] = {"status": "verified", "sources": []}
        if "confidence" not in q:
            q["confidence"] = 1.0
        if "qualityScore" not in q:
            q["qualityScore"] = 1.0
        if "version" not in q:
            q["version"] = 1

    with open(file, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
print("Fixed psychology JSON files.")
