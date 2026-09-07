import os
import json

src_dir = "questions/fr"
dst_dir = "questions/en"

for root, dirs, files in os.walk(src_dir):
    rel_path = os.path.relpath(root, src_dir)
    dst_path = os.path.join(dst_dir, rel_path)
    os.makedirs(dst_path, exist_ok=True)
    
    for file in files:
        if file.endswith(".json"):
            with open(os.path.join(root, file), "r") as f:
                data = json.load(f)
            
            for q in data:
                q["question"] = "[EN] " + q.get("question", "")
                
            with open(os.path.join(dst_path, file), "w") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

print("Created dummy english dataset")
