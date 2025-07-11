import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_response(prompt: str, temperature: float = 0.7) -> str:
    try:
        response = await openai.ChatCompletion.acreate(  # async version
            model="gpt-3.5-turbo",  # or "gpt-4" if available
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
        )
        return response.choices[0].message["content"].strip()
    except Exception as e:
        print(f"❌ OpenAI Error:", str(e))
        return "LLM Error"
