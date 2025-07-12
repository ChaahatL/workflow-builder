import httpx
import os

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

async def generate_response(prompt: str, temperature: float = 0.7) -> str:
    if not prompt.strip():
        return "Prompt is empty."

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url="https://api.together.xyz/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {TOGETHER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/Llama-3-8b-chat-hf",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 512,
                    "temperature": temperature  # ✅ Use passed value
                }
            )

            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as http_err:
        return f"HTTP error: {http_err.response.status_code} - {http_err.response.text}"
    except Exception as e:
        return f"Error generating LLM response: {str(e)}"
