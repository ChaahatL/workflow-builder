import os
from dotenv import load_dotenv
import openai
import cohere
import together

load_dotenv()

# 🔑 Load all keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

# ✅ Initialize clients
openai.api_key = OPENAI_API_KEY  # still useful for fallback or hybrid setups

cohere_client = cohere.Client(COHERE_API_KEY)

together.api_key = TOGETHER_API_KEY