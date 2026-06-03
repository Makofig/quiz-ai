"""Quiz generation service - connects to Ollama"""

import json
import time
import httpx
import ollama
from app.core.config import settings

PROMPT_TEMPLATE = """Eres un experto en pedagoga y generacion de contenido educativo. 
Dada la siguiente informacion, genera un quiz con exactamente {count} preguntas.

Incluye el campo "topic" con el tema principal en la respuesta JSON.
Para cada pregunta, incluye:
- "type": uno de "multiple_choice", "true_false", "open_question"
- "question": la pregunta
- "options": lista de opciones (solo si type es "multiple_choice")
- "correct_answer": el indice de la respuesta correcta (0-based)
- "explanation": explicacion de por que la respuesta es correcta

IMPORTANTE:
- "correct_answer" DEBE ser SIEMPRE:
  - un entero (multiple_choice)
  - un booleano (true_false)
  - una string corta de referencia (open_question)
- NUNCA devuelvas explicaciones en "correct_answer"
- NUNCA devuelvas texto completo de la respuesta en "correct_answer"

IMPORTANTE: La respuesta DEBE ser un JSON valido, sin markdown, sin texto adicional.
El formato debe ser: {{"topic": "...", "questions": [{{...}}, ...]}}

Tema: {topic}
Contenido:{content}

Tipo de quiz: {quiz_type}
Dificultad: {difficulty}
Cantidad de preguntas: {count}
Modelo: {model}
"""

MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
MAX_CONTENT_CHARS = 15000

# Model mapping: frontend name -> actual Ollama model name
MODEL_MAP = {
    "mistral": "mistral:7b",
    "gemma": "gemma4:e4b",
    "qwen": "qwen3.6:35b",
}

# Reverse map: actual model name -> friendly name
REVERSE_MODEL_MAP = {v: k for k, v in MODEL_MAP.items()}

# Models we support (friendly names)
SUPPORTED_MODELS = list(MODEL_MAP.keys())


def list_available_models() -> list[dict]:
    """List available models from Ollama with friendly names."""
    # Always return our supported models
    models = []
    for friendly_name in SUPPORTED_MODELS:
        models.append({
            "id": friendly_name,
            "name": friendly_name,
            "model": MODEL_MAP[friendly_name],
        })
    return models


def resolve_model_name(model: str | None) -> str:
    """Resolve a friendly model name to its actual Ollama model name."""
    if model is None:
        return MODEL_MAP["mistral"]  # Default to mistral:7b
    return MODEL_MAP.get(model, model)  # If not in map, use as-is


def generate_quiz(
    topic: str, 
    content: str | None, 
    quiz_type: str, 
    difficulty: str, 
    count: int, 
    model: str | None = None
) -> dict:
    model_name = resolve_model_name(model)
    content = (content or "")[:MAX_CONTENT_CHARS]
    prompt = PROMPT_TEMPLATE.format(
        topic=topic, 
        content=content if content is not None else "",
        quiz_type=quiz_type, 
        difficulty=difficulty, 
        count=count, 
        model=model_name
    )
    
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = ollama.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                options={"num_predict": 4096},
            )
            content = response["message"]["content"]
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except json.JSONDecodeError as e:
            last_error = f"Invalid JSON from model: {e}"
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)

    raise RuntimeError(f"Failed to generate quiz after {MAX_RETRIES} attempts: {last_error}")
