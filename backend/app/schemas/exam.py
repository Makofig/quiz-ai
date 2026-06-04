"""Exam schemas"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ExamType(str, Enum):
    THEORETICAL = "theoretical"
    PRACTICAL = "practical"
    COMPLETE = "complete"


class ExamStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXPIRED = "expired"


class ExamCreateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=100)
    exam_type: ExamType = ExamType.COMPLETE
    difficulty: str = Field(default="medium", max_length=20)
    questions: int = Field(default=20, ge=5, le=100)
    duration_minutes: int = Field(default=60, ge=5, le=240)


class ExamQuestion(BaseModel):
    number: int
    type: str = "multiple_choice"
    question: str
    options: List[str] = []
    correct_option: Optional[int] = None
    correct_answer: Optional[bool] = None
    reference_answer: Optional[str] = None
    explanation: str = ""


class ExamCreateResponse(BaseModel):
    id: str
    title: str
    exam_type: str
    topic: str | None
    difficulty: str | None
    total_questions: int
    duration_minutes: int
    status: str
    created_at: datetime


class ExamDetailResponse(BaseModel):
    id: str
    title: str
    exam_type: str
    topic: str | None
    difficulty: str | None
    total_questions: int
    duration_minutes: int
    status: str
    questions: List[ExamQuestion]
    created_at: datetime


class ExamStartResponse(BaseModel):
    attempt_id: str
    exam_id: str
    started_at: datetime
    expires_at: datetime
    duration_minutes: int
    questions: List[ExamQuestion]


class AnswerSaveRequest(BaseModel):
    question_number: int
    selected_answer: str


class AnswerSaveResponse(BaseModel):
    success: bool
    question_number: int


class ExamSubmitResponse(BaseModel):
    attempt_id: str
    score: float
    correct: int
    wrong: int
    total_questions: int
    percentage: float
    passed: bool
    time_spent_seconds: int
    correct_answers: List[dict] = []
    wrong_answers: List[dict] = []


class ExamHistoryItem(BaseModel):
    id: str
    title: str
    exam_type: str
    topic: str | None
    difficulty: str | None
    total_questions: int
    duration_minutes: int
    status: str
    percentage: float | None
    passed: bool | None
    created_at: datetime


class ExamHistoryResponse(BaseModel):
    summary: dict
    exams: List[ExamHistoryItem]


class ExamResultDetail(BaseModel):
    attempt_id: str
    exam_title: str
    exam_type: str
    topic: str | None
    score: float
    correct: int
    wrong: int
    total_questions: int
    percentage: float
    passed: bool
    time_spent_seconds: int
    started_at: datetime | None
    submitted_at: datetime | None
    correct_answers: List[dict] = []
    wrong_answers: List[dict] = []
