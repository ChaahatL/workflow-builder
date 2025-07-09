import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-pro-latest")

def generate_response(prompt: str):
    try:
        response = model.generate_content(prompt)
        print("🔍 Raw Gemini response:", response)
        # Safe access
        if hasattr(response, "text"):
            return response.text.strip()
        elif hasattr(response, "candidates") and response.candidates:
            return response.candidates[0].text.strip()
        else:
            return "No response from Gemini"
    except Exception as e:
        print(f"Error generating response: {e}")
        return "LLM Error"
