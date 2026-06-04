from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuizType(str, Enum):
    THEORETICAL = "theoretical"
    PRACTICAL = "practical"
    MIXED = "mixed"


class AIModel(str, Enum):
    MISTRAL = "mistral"
    GEMMA = "gemma"
    QWEN = "qwen"


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    OPEN_QUESTION = "open_question"


class QuizGenerationRequest(BaseModel):
    topic: Optional[str] = None
    content: Optional[str] = None
    file_id: Optional[str] = None
    quiz_type: QuizType = QuizType.THEORETICAL
    difficulty: Difficulty = Difficulty.MEDIUM
    question_count: int = Field(default=10, ge=1, le=50)
    model: AIModel = AIModel.MISTRAL


class Question(BaseModel):
    number: int
    type: QuestionType = QuestionType.MULTIPLE_CHOICE
    question: str
    options: List[str] = []
    correct_option: Optional[int] = None      # For multiple_choice
    correct_answer: Optional[bool] = None     # For true_false
    reference_answer: Optional[str] = None    # For open_question
    explanation: Optional[str] = None


class QuizResponse(BaseModel):
    id: str
    topic: str
    questions: List[Question]
    created_at: datetime
