"""Exam routes"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.core.database import get_db
from app.models.exam import Exam, ExamAttempt, ExamAnswer
from app.schemas.exam import (
    ExamCreateRequest,
    ExamCreateResponse,
    ExamDetailResponse,
    ExamStartResponse,
    ExamQuestion,
    AnswerSaveRequest,
    AnswerSaveResponse,
    ExamSubmitResponse,
    ExamHistoryItem,
    ExamHistoryResponse,
    ExamResultDetail,
)
from app.services.ollama import generate_quiz

router = APIRouter()

PASSING_SCORE = 70


def _parse_questions(raw_questions: list) -> list[dict]:
    """Normalize AI-generated questions for exams."""
    normalized = []
    for i, q in enumerate(raw_questions):
        qtype = q.get("type", "multiple_choice")
        item = {
            "number": i + 1,
            "type": qtype,
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "explanation": q.get("explanation", ""),
        }
        raw_answer = q.get("correct_answer")
        if qtype == "multiple_choice":
            item["correct_option"] = int(raw_answer) if raw_answer is not None else 0
        elif qtype == "true_false":
            if isinstance(raw_answer, str):
                item["correct_answer"] = raw_answer.lower() in ("true", "verdadero", "cierto", "si", "sí", "1")
            else:
                item["correct_answer"] = bool(raw_answer) if raw_answer is not None else True
        elif qtype == "open_question":
            item["reference_answer"] = str(raw_answer) if raw_answer is not None else ""
        normalized.append(item)
    return normalized


@router.post("/create", response_model=ExamCreateResponse)
async def create_exam(
    request: ExamCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new exam with AI-generated questions (no auth required)."""
    # Generate questions via Ollama
    try:
        quiz_data = generate_quiz(
            topic=request.topic,
            content=None, # Open-source version does not support content input to Ollama
            quiz_type=request.exam_type.value,
            difficulty=request.difficulty,
            count=request.questions,
            model="gemma", # Default to gemma for better question quality in open-source version 
        )
        raw_questions = quiz_data.get("questions", [])
        print(f"Examen: {request.topic}")
        questions = _parse_questions(raw_questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating exam questions: {str(e)}")

    if not questions:
        raise HTTPException(status_code=500, detail="No questions were generated")

    title = f"{request.exam_type.value.title()} — {request.topic}"

    exam = Exam(
        user_id=None,  # Open source: no user accounts
        title=title,
        exam_type=request.exam_type.value,
        topic=request.topic,
        difficulty=request.difficulty,
        total_questions=len(questions),
        duration_minutes=request.duration_minutes,
        status="pending",
        questions=questions,
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    
    return ExamCreateResponse(
        id=str(exam.id),
        title=exam.title,
        exam_type=exam.exam_type,
        topic=exam.topic,
        difficulty=exam.difficulty,
        total_questions=exam.total_questions,
        duration_minutes=exam.duration_minutes,
        status=exam.status,
        created_at=exam.created_at,
    )


@router.get("/history", response_model=ExamHistoryResponse)
async def get_exam_history(
    db: AsyncSession = Depends(get_db),
):
    """Get all exam history (no auth required for open-source version)."""
    stmt = (
        select(Exam)
        .order_by(Exam.created_at.desc())
    )
    result = await db.execute(stmt)
    exams = result.scalars().all()

    # Get best attempt for each exam
    exam_items = []
    for exam in exams:
        # Get latest completed attempt
        if exam.user_id is not None:
            attempt_stmt = (
                select(ExamAttempt)
                .where(ExamAttempt.exam_id == exam.id, ExamAttempt.status == "completed")
                .order_by(ExamAttempt.submitted_at.desc())
                .limit(1)
            )
        else:
            attempt_stmt = (
                select(ExamAttempt)
                .where(ExamAttempt.exam_id == exam.id, ExamAttempt.status == "completed")
                .order_by(ExamAttempt.submitted_at.desc())
                .limit(1)
            )
        attempt_result = await db.execute(attempt_stmt)
        attempt = attempt_result.scalar_one_or_none()

        exam_items.append(
            ExamHistoryItem(
                id=str(exam.id),
                title=exam.title,
                exam_type=exam.exam_type,
                topic=exam.topic,
                difficulty=exam.difficulty,
                total_questions=exam.total_questions,
                duration_minutes=exam.duration_minutes,
                status=exam.status if not attempt else "completed",
                percentage=attempt.percentage if attempt else None,
                passed=(attempt.percentage >= PASSING_SCORE) if attempt and attempt.percentage is not None else None,
                created_at=exam.created_at,
            )
        )

    # Summary stats
    completed = [e for e in exam_items if e.percentage is not None]
    total_exams = len(exam_items)
    total_completed = len(completed)
    avg_pct = round(sum(e.percentage for e in completed) / total_completed, 2) if total_completed else 0
    best = max((e.percentage for e in completed), default=0)
    worst = min((e.percentage for e in completed), default=0)
    passed_count = sum(1 for e in completed if e.passed)

    summary = {
        "total_exams": total_exams,
        "total_completed": total_completed,
        "average_percentage": avg_pct,
        "best_score": best,
        "worst_score": worst,
        "passed": passed_count,
        "failed": total_completed - passed_count,
    }

    return ExamHistoryResponse(summary=summary, exams=exam_items)


@router.get("/{exam_id}", response_model=ExamDetailResponse)
async def get_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get exam details including questions."""
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = [ExamQuestion(**q) for q in exam.questions]

    return ExamDetailResponse(
        id=str(exam.id),
        title=exam.title,
        exam_type=exam.exam_type,
        topic=exam.topic,
        difficulty=exam.difficulty,
        total_questions=exam.total_questions,
        duration_minutes=exam.duration_minutes,
        status=exam.status,
        questions=questions,
        created_at=exam.created_at,
    )


@router.post("/{exam_id}/start", response_model=ExamStartResponse)
async def start_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Start an exam attempt. Creates a new attempt with timer."""
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Check if there's already an in_progress attempt
    existing_stmt = (
        select(ExamAttempt)
        .where(
            ExamAttempt.exam_id == exam_id,
            ExamAttempt.status == "in_progress",
        )
    )
    existing_result = await db.execute(existing_stmt)
    existing = existing_result.scalar_one_or_none()

    if existing:
        started_at = existing.started_at
        expires_at = started_at + timedelta(minutes=exam.duration_minutes)
        questions = [ExamQuestion(**q) for q in exam.questions]
        return ExamStartResponse(
            attempt_id=str(existing.id),
            exam_id=str(exam.id),
            started_at=started_at,
            expires_at=expires_at,
            duration_minutes=exam.duration_minutes,
            questions=questions,
        )

    # Create new attempt
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=exam.duration_minutes)

    attempt = ExamAttempt(
        exam_id=exam.id,
        user_id=None,  # Open source: no user accounts
        started_at=now,
        status="in_progress",
    )
    db.add(attempt)
    exam.status = "in_progress"
    await db.commit()
    await db.refresh(attempt)

    questions = [ExamQuestion(**q) for q in exam.questions]

    return ExamStartResponse(
        attempt_id=str(attempt.id),
        exam_id=str(exam.id),
        started_at=now,
        expires_at=expires_at,
        duration_minutes=exam.duration_minutes,
        questions=questions,
    )


@router.post("/{exam_id}/answer", response_model=AnswerSaveResponse)
async def save_answer(
    exam_id: str,
    request: AnswerSaveRequest,
    db: AsyncSession = Depends(get_db),
):
    """Save a single answer immediately (no wait for submit)."""
    # Find in-progress attempt
    stmt = (
        select(ExamAttempt)
        .where(
            ExamAttempt.exam_id == exam_id,
            ExamAttempt.status == "in_progress",
        )
    )
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")

    # Check if expired
    exam_stmt = select(Exam).where(Exam.id == exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one_or_none()

    if exam and attempt.started_at:
        expires_at = attempt.started_at + timedelta(minutes=exam.duration_minutes)
        if datetime.now(timezone.utc) > expires_at:
            attempt.status = "expired"
            await db.commit()
            raise HTTPException(status_code=400, detail="Exam time has expired")

    # Upsert answer
    existing_answer_stmt = (
        select(ExamAnswer)
        .where(
            ExamAnswer.attempt_id == attempt.id,
            ExamAnswer.question_number == request.question_number,
        )
    )
    existing_result = await db.execute(existing_answer_stmt)
    existing_answer = existing_result.scalar_one_or_none()

    if existing_answer:
        existing_answer.selected_answer = request.selected_answer
    else:
        answer = ExamAnswer(
            attempt_id=attempt.id,
            question_number=request.question_number,
            selected_answer=request.selected_answer,
        )
        db.add(answer)

    await db.commit()

    return AnswerSaveResponse(
        success=True,
        question_number=request.question_number,
    )


@router.post("/{exam_id}/submit", response_model=ExamSubmitResponse)
async def submit_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Submit and grade the exam."""
    # Find in-progress attempt
    stmt = (
        select(ExamAttempt)
        .where(
            ExamAttempt.exam_id == exam_id,
            ExamAttempt.status == "in_progress",
        )
        .order_by(ExamAttempt.started_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")

    # Get exam with questions
    exam_stmt = select(Exam).where(Exam.id == exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Get all saved answers
    answers_stmt = select(ExamAnswer).where(ExamAnswer.attempt_id == attempt.id)
    answers_result = await db.execute(answers_stmt)
    answers_list = answers_result.scalars().all()

    answers_map = {a.question_number: a for a in answers_list}

    # Grade
    correct = 0
    wrong = 0
    correct_answers = []
    wrong_answers = []

    for q in exam.questions:
        num = q["number"]
        user_answer = answers_map.get(num)
        selected = user_answer.selected_answer if user_answer else None

        # Determine correct value
        if q["type"] == "multiple_choice":
            correct_val = str(q.get("correct_option", 0))
        elif q["type"] == "true_false":
            correct_val = q.get("correct_answer", True)
        else:
            correct_val = q.get("reference_answer", "")

        if q["type"] == "multiple_choice":
            selected_norm = (
                int(selected)
                if selected is not None and str(selected).isdigit()
                else None
            )

            correct_norm = int(correct_val)

        elif q["type"] == "true_false":
            selected_norm = (
                str(selected).strip().lower()
                if selected is not None
                else None
            )

            correct_norm = str(correct_val).strip().lower()

        else:
            selected_norm = (
                str(selected).strip().lower()
                if selected is not None
                else None
            )

            correct_norm = str(correct_val).strip().lower()

        is_correct = (
            selected_norm is not None
            and selected_norm == correct_norm
        )

        if is_correct:
            correct += 1
            correct_answers.append({
                "question": q.get("question", ""),
                "selected_answer": selected,
                "correct_answer": correct_val,
            })
        else:
            wrong += 1
            wrong_answers.append({
                "question": q.get("question", ""),
                "user_answer": selected,
                "correct_answer": correct_val,
            })

        # Update answer record
        if user_answer:
            user_answer.is_correct = is_correct

    total = exam.total_questions
    percentage = round((correct / total) * 100, 2) if total else 0.0
    passed = percentage >= PASSING_SCORE

    # Calculate time spent
    now = datetime.now(timezone.utc)
    time_spent = 0
    if attempt.started_at:
        delta = now - attempt.started_at
        time_spent = int(delta.total_seconds())

    # Update attempt
    attempt.submitted_at = now
    attempt.score = correct
    attempt.percentage = percentage
    attempt.correct = correct
    attempt.wrong = wrong
    attempt.status = "completed"
    attempt.time_spent_seconds = time_spent

    # Update exam status
    exam.status = "completed"

    await db.commit()

    return ExamSubmitResponse(
        attempt_id=str(attempt.id),
        score=correct,
        correct=correct,
        wrong=wrong,
        total_questions=total,
        percentage=percentage,
        passed=passed,
        time_spent_seconds=time_spent,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
    )


@router.get("/{exam_id}/result", response_model=ExamResultDetail)
async def get_exam_result(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the result of a completed exam."""
    exam_stmt = select(Exam).where(Exam.id == exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Get latest completed attempt
    if exam.user_id is not None:
        attempt_stmt = (
            select(ExamAttempt)
            .where(
                ExamAttempt.exam_id == exam_id,
                ExamAttempt.status == "completed",
            )
            .order_by(ExamAttempt.submitted_at.desc())
            .limit(1)
        )
    else:
        attempt_stmt = (
            select(ExamAttempt)
            .where(
                ExamAttempt.exam_id == exam_id,
                ExamAttempt.status == "completed",
            )
            .order_by(ExamAttempt.submitted_at.desc())
            .limit(1)
        )
    attempt_result = await db.execute(attempt_stmt)
    attempt = attempt_result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=404, detail="No completed attempt found")

    # Get answers
    answers_stmt = select(ExamAnswer).where(ExamAnswer.attempt_id == attempt.id)
    answers_result = await db.execute(answers_stmt)
    answers_list = answers_result.scalars().all()

    answers_map = {a.question_number: a for a in answers_list}
    correct_answers = []
    wrong_answers = []

    for q in exam.questions:
        num = q["number"]
        user_answer = answers_map.get(num)
        selected = user_answer.selected_answer if user_answer else None
        is_correct = user_answer.is_correct if user_answer else False

        # if q["type"] == "multiple_choice":
        #     correct_val = str(q.get("correct_option", 0))
        if q["type"] == "multiple_choice":
            correct_val = q.get("correct_option", 0)

            options = q.get("options", [])

            selected_text = (
                options[int(selected)]
                if selected is not None
                and str(selected).isdigit()
                and int(selected) < len(options)
                else None
            )

            correct_text = (
                options[int(correct_val)]
                if int(correct_val) < len(options)
                else None
            )
        elif q["type"] == "true_false":
            correct_val = q.get("correct_answer", True)

            selected_text = selected
            correct_text = correct_val
        else:
            correct_val = q.get("reference_answer", "")

            selected_text = selected
            correct_text = correct_val

        entry = {
            "question": q.get("question", ""),
            "selected_answer": selected_text,
            "correct_answer": correct_text,
            "explanation": q.get("explanation", ""),
        }

        if is_correct:
            correct_answers.append(entry)
        else:
            wrong_answers.append(entry)

    return ExamResultDetail(
        attempt_id=str(attempt.id),
        exam_title=exam.title,
        exam_type=exam.exam_type,
        topic=exam.topic,
        score=attempt.score or 0,
        correct=attempt.correct or 0,
        wrong=attempt.wrong or 0,
        total_questions=exam.total_questions,
        percentage=attempt.percentage or 0,
        passed=(attempt.percentage or 0) >= PASSING_SCORE,
        time_spent_seconds=attempt.time_spent_seconds or 0,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
    )
