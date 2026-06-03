"""Leaderboard service — open source: no user_id filtering"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.core.database import get_db
from app.models.result import QuizResult

router = APIRouter()


@router.get("/")
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
):
    """Get top results leaderboard (no user filtering)."""
    # Get total count for pagination
    total_query = await db.execute(func.count(QuizResult.id))
    total = total_query.scalar()

    # Get top results ordered by percentage descending, then by date
    result = await db.execute(
        QuizResult.__table__.select()
        .order_by(QuizResult.percentage.desc(), QuizResult.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    leaderboard = []
    for row in result.mappings().all():
        leaderboard.append({
            "id": row["id"],
            "topic": row["topic"],
            "difficulty": row["difficulty"],
            "total_questions": row["total_questions"],
            "correct": row["correct"],
            "wrong": row["wrong"],
            "percentage": row["percentage"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        })

    return {
        "leaderboard": leaderboard,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total,
    }
