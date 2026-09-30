import os
from functools import lru_cache

from google import genai
from google.genai import types


# ============================================================
# GEMINI CLIENT
# ============================================================

@lru_cache(maxsize=1)
def get_client():

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:

        raise RuntimeError(
            "GEMINI_API_KEY is missing. "
            "Please add your Gemini API key to the .env file."
        )

    return genai.Client(
        api_key=api_key
    )


# ============================================================
# GENERATE TEXT
# ============================================================

def generate_text(
    prompt: str,
    temperature: float = 0.4,
    json_mode: bool = False
):

    client = get_client()

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-flash"
    )

    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=2500
    )

    if json_mode:

        config.response_mime_type = "application/json"

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config
    )

    text = getattr(
        response,
        "text",
        None
    )

    if not text:

        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return text.strip()