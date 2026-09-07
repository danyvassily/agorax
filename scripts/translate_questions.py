import os
import json
import asyncio
from openai import AsyncOpenAI
import argparse

async def translate_question(client, q):
    if not isinstance(q, dict) or 'question' not in q or 'answers' not in q:
        return q
        
    prompt = f"""
You are a professional translator and trivia expert. Your task is to TRANSLATE the following trivia question, all its answers, and the explanation (if any) from French to English.

CRITICAL INSTRUCTIONS:
1. You MUST actually translate the text into English. Do not just copy the French text.
2. Ensure the English translation is natural and idiomatic for an international audience.
3. You MUST maintain the EXACT order of the answers as provided.
4. Output valid JSON ONLY.

Here is the data to translate:
Question in French: {q['question']}
Explanation in French (if present): {q.get('explanation', '')}
Answers in French (must maintain exact order!):
"""
    for i, ans in enumerate(q['answers']):
        prompt += f"[{i}] {ans}\n"
        
    prompt += "\nOutput JSON in this format: {\"question\": \"translated question\", \"explanation\": \"translated explanation\", \"answers\": [\"ans1\", \"ans2\", \"ans3\", \"ans4\"]}"

    try:
        response = await client.chat.completions.create(
            model='deepseek-chat',
            messages=[
                {"role": "system", "content": "You are a professional translator and trivia expert. You must output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        translated_data = response.choices[0].message.content
        parsed = json.loads(translated_data)
        
        # Create a new question object
        new_q = q.copy()
        new_q['question'] = parsed['question']
        new_q['answers'] = parsed['answers']
        if 'explanation' in parsed and parsed['explanation']:
            new_q['explanation'] = parsed['explanation']
        new_q['language'] = 'en'
        return new_q
    except Exception as e:
        print(f"Failed to translate question {q.get('id', 'unknown')}: {e}")
        return q

async def process_file(client, src_file, dst_file):
    print(f"Processing {src_file}...")
    try:
        with open(src_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {src_file}: {e}")
        return

    if not isinstance(data, list):
        print(f"Skipping {src_file}, not a list of questions.")
        return

    # DeepSeek concurrency limits
    semaphore = asyncio.Semaphore(10)
    async def sem_translate(q):
        async with semaphore:
            return await translate_question(client, q)
            
    tasks = [sem_translate(q) for q in data]
    translated_data = await asyncio.gather(*tasks)

    # Make sure output directory exists
    os.makedirs(os.path.dirname(dst_file), exist_ok=True)
    with open(dst_file, 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    print(f"Saved {dst_file}")


async def main():
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

    # Initialize the OpenAI client for DeepSeek
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.deepseek.com")
    
    src_dir = "questions/fr"
    dst_dir = "questions/en"
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-run", action="store_true", help="Run on a single small file")
    args = parser.parse_args()
    
    files_to_process = []
    
    for root, dirs, files in os.walk(src_dir):
        rel_path = os.path.relpath(root, src_dir)
        for file in files:
            if file.endswith(".json") and not file.startswith("."): 
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dst_dir, rel_path, file)
                files_to_process.append((src_file, dst_file))

    if args.test_run and files_to_process:
        files_to_process = files_to_process[:1] # just one file
                
    print(f"Found {len(files_to_process)} files to process.")
    
    file_semaphore = asyncio.Semaphore(2)
    
    async def sem_process(src, dst):
        async with file_semaphore:
            await process_file(client, src, dst)
            await asyncio.sleep(1)

    tasks = [sem_process(src, dst) for src, dst in files_to_process]
    await asyncio.gather(*tasks)
    print("Translation complete.")

if __name__ == "__main__":
    asyncio.run(main())
