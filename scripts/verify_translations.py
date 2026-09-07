import os
import json
import random
import asyncio
from openai import AsyncOpenAI

async def verify_translations():
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key and os.path.exists(".env.local"):
        with open(".env.local") as f:
            for line in f:
                if line.startswith("DEEPSEEK_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
                    break
    if not api_key:
        print("Error: DEEPSEEK_API_KEY environment variable is missing.")
        return
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.deepseek.com")

    src_dir = "questions/fr"
    dst_dir = "questions/en"
    
    files_to_check = []
    for root, _, files in os.walk(src_dir):
        rel_path = os.path.relpath(root, src_dir)
        for f in files:
            if f.endswith(".json") and not f.startswith("."):
                files_to_check.append(os.path.join(rel_path, f))
                
    if not files_to_check:
        print("No files found.")
        return
        
    random.shuffle(files_to_check)
    sample_files = files_to_check[:3]
    
    samples_to_audit = []
    for rel_f in sample_files:
        src_path = os.path.join(src_dir, rel_f)
        dst_path = os.path.join(dst_dir, rel_f)
        
        if not os.path.exists(dst_path):
            continue
            
        try:
            with open(src_path, 'r', encoding='utf-8') as f:
                src_data = json.load(f)
            with open(dst_path, 'r', encoding='utf-8') as f:
                dst_data = json.load(f)
                
            if src_data and dst_data and isinstance(src_data, list) and isinstance(dst_data, list):
                idx = random.randint(0, len(src_data)-1)
                if idx < len(dst_data):
                    samples_to_audit.append({
                        "file": rel_f,
                        "original": src_data[idx],
                        "translated": dst_data[idx]
                    })
        except Exception as e:
            pass

    if not samples_to_audit:
        print("No translated samples found to audit.")
        return

    persona = """You are a bilingual (French/English) Trivia Translation Auditor. 
Your task is to analyze translations of trivia questions. 
For each pair of original French question and translated English question, you must evaluate:
1. Is the meaning perfectly preserved?
2. Is the English translation idiomatic and natural for an international audience?
3. Did the order of answers remain identical?
Output a verdict: [PASS] or [FAIL], followed by a short explanation.
"""

    results = []
    print(f"Starting audit on {len(samples_to_audit)} samples...")
    for sample in samples_to_audit:
        prompt = f"File: {sample['file']}\n\nORIGINAL FRENCH:\n{json.dumps(sample['original'], ensure_ascii=False, indent=2)}\n\nTRANSLATED ENGLISH:\n{json.dumps(sample['translated'], ensure_ascii=False, indent=2)}\n\nPlease provide your verdict."
        
        try:
            response = await client.chat.completions.create(
                model='deepseek-chat',
                messages=[
                    {"role": "system", "content": persona},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
            )
            verdict = response.choices[0].message.content
            results.append({
                "file": sample['file'],
                "verdict": verdict
            })
        except Exception as e:
            results.append({
                "file": sample['file'],
                "verdict": f"ERROR during verification: {e}"
            })
            
    with open("AUDIT_REPORT_EN.md", "w") as f:
        f.write("# Translation Audit Report\n\n")
        for res in results:
            f.write(f"## File: {res['file']}\n\n")
            f.write(res['verdict'])
            f.write("\n\n---\n\n")
            
    print("Audit complete. Report saved to AUDIT_REPORT_EN.md")

if __name__ == "__main__":
    asyncio.run(verify_translations())
