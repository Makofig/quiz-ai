from fastapi import APIRouter, HTTPException
from app.schemas.quiz import QuizGenerationRequest, QuizResponse, Question, QuestionType
from app.services.ollama import generate_quiz, list_available_models
from datetime import datetime, timezone

router = APIRouter()


def normalize_question(question: dict, number: int) -> dict:
    """Map AI response fields to internal schema fields."""
    qtype = question.get("type", "multiple_choice")

    normalized = {
        "number": number,
        "type": qtype,
        "question": question.get("question", ""),
        "options": question.get("options", []),
        "explanation": question.get("explanation", ""),
    }

    raw_answer = question.get("correct_answer")

    if qtype == "multiple_choice":
        normalized["correct_option"] = int(raw_answer) if raw_answer is not None else 0

    elif qtype == "true_false":
        if isinstance(raw_answer, str):
            normalized["correct_answer"] = raw_answer.lower() in ("true", "verdadero", "cierto", "si", "sí", "1")
        else:
            normalized["correct_answer"] = bool(raw_answer) if raw_answer is not None else True

    elif qtype == "open_question":
        normalized["reference_answer"] = str(raw_answer) if raw_answer is not None else ""

    return normalized


@router.get("/models")
async def get_models():
    """List available Ollama models."""
    models = list_available_models()
    return {"models": models}


@router.post("/generate")
async def generate_q(request: QuizGenerationRequest):
    try:
        quiz_data = generate_quiz(
            topic=request.topic or "General Knowledge",
            content=request.content,
            quiz_type=request.quiz_type.value,
            difficulty=request.difficulty.value,
            count=request.question_count,
            model=request.model.value if isinstance(request.model, str) else str(request.model),
        )
        questions = [
            Question(**normalize_question(q, i + 1))
            for i, q in enumerate(quiz_data.get("questions", []))
        ]
        result = QuizResponse(
            id=f"quiz-{datetime.now(timezone.utc).timestamp()}",
            topic=quiz_data.get("topic", request.topic),
            questions=questions,
            created_at=datetime.now(timezone.utc),
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
