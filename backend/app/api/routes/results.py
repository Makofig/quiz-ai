"""Quiz results service"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Union, Optional, List
from datetime import datetime

from app.core.database import get_db
from app.models.result import QuizResult

router = APIRouter()


def normalize_answer(value):
    """Normalize answer for comparison (strip whitespace, lowercase strings)."""
    if isinstance(value, str):
        return value.strip().lower()
    return value


class Answer(BaseModel):
    question_number: int
    selected_answer: Union[int, bool, str]


class GradingRequest(BaseModel):
    """Send answers and the questions that were answered so we can grade them."""
    topic: str = "General Knowledge"
    difficulty: str = "easy"
    quiz_type: str = "theoretical"
    answers: list[Answer]
    questions: list[dict]


class ScoreResponse(BaseModel):
    total_questions: int
    correct: int
    wrong: int
    percentage: float
    correct_answers: list[dict] = []
    wrong_answers: list[dict] = []
    explanation: str = ""


# --- Schemas for GET /results ---

class QuizResultSummary(BaseModel):
    total_quizzes: int
    total_questions: int
    total_correct: int
    total_wrong: int
    average_percentage: float
    best_score: float
    worst_score: float


class QuizResultItem(BaseModel):
    id: str
    topic: str
    difficulty: str
    quiz_type: Optional[str] = None
    total_questions: int
    correct: int
    wrong: int
    percentage: float
    time_spent: Optional[int] = None
    created_at: datetime


class QuizResultsResponse(BaseModel):
    summary: QuizResultSummary
    results: List[QuizResultItem]


@router.post("/grade")
async def grade_quiz(
    request: GradingRequest,
    db: AsyncSession = Depends(get_db),
) -> ScoreResponse:
    """Grade a quiz by comparing submitted answers against the correct answers."""
    total = len(request.answers)
    if total == 0 or total != len(request.questions):
        raise HTTPException(400, "Number of answers must match number of questions")

    correct = 0
    wrong = 0
    correct_answers = []
    wrong_answers = []

    submitted_num_to_answer = {a.question_number: a for a in request.answers}

    for q in request.questions:
        num = q["number"]
        user_answer = submitted_num_to_answer.get(num)
        if not user_answer:
            continue

        is_correct = (
            normalize_answer(user_answer.selected_answer)
            ==
            normalize_answer(q["correct_answer"])
        )
        if is_correct:
            correct += 1
            correct_answers.append({
                "question": q.get("question", ""),
                "selected_answer": user_answer.selected_answer,
                "correct_answer": q["correct_answer"],
            })
        else:
            wrong += 1
            wrong_answers.append({
                "question": q.get("question", ""),
                "user_answer": user_answer.selected_answer,
                "correct_answer": q["correct_answer"],
            })

    percentage = round((correct / total) * 100, 2) if total else 0.0

    response = ScoreResponse(
        total_questions=total,
        correct=correct,
        wrong=wrong,
        percentage=percentage,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
        explanation=f"Obtuviste {correct}/{total} ({percentage}%)",
    )

    # Save result to database (without user_id — local results)
    result_db = QuizResult(
        user_id=None,  # Open source: no user accounts
        topic=request.topic,
        difficulty=request.difficulty,
        quiz_type=request.quiz_type,
        total_questions=total,
        correct=correct,
        wrong=wrong,
        percentage=percentage,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
        explanation=response.explanation,
    )
    db.add(result_db)
    await db.commit()
    await db.refresh(result_db)

    return response


@router.get("/history", response_model=QuizResultsResponse)
async def get_quiz_results(
    db: AsyncSession = Depends(get_db),
):
    """Get all quiz results (no authentication required for open-source version)."""
    stmt = (
        select(QuizResult)
        .order_by(QuizResult.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    if not rows:
        return QuizResultsResponse(
            summary=QuizResultSummary(
                total_quizzes=0,
                total_questions=0,
                total_correct=0,
                total_wrong=0,
                average_percentage=0.0,
                best_score=0.0,
                worst_score=0.0,
            ),
            results=[],
        )

    # Compute summary
    total_quizzes = len(rows)
    total_questions = sum(r.total_questions for r in rows)
    total_correct = sum(r.correct for r in rows)
    total_wrong = sum(r.wrong for r in rows)
    percentages = [r.percentage for r in rows]
    average_percentage = round(sum(percentages) / total_quizzes, 2) if total_quizzes else 0.0
    best_score = max(percentages) if percentages else 0.0
    worst_score = min(percentages) if percentages else 0.0

    summary = QuizResultSummary(
        total_quizzes=total_quizzes,
        total_questions=total_questions,
        total_correct=total_correct,
        total_wrong=total_wrong,
        average_percentage=average_percentage,
        best_score=best_score,
        worst_score=worst_score,
    )

    items = [
        QuizResultItem(
            id=str(r.id),
            topic=r.topic,
            difficulty=r.difficulty,
            quiz_type=r.quiz_type,
            total_questions=r.total_questions,
            correct=r.correct,
            wrong=r.wrong,
            percentage=r.percentage,
            time_spent=r.time_spent,
            created_at=r.created_at,
        )
        for r in rows
    ]

    return QuizResultsResponse(summary=summary, results=items)
