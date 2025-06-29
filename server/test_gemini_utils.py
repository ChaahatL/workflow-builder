from app.utils.llm_utils import generate_response

def test_generate_response():
    prompt = "List 3 use cases of AI-powered workflow builders"
    response = generate_response(prompt)
    print("\n🔹 Gemini LLM Response:")
    print(response)

if __name__ == "__main__":
    test_generate_response()
