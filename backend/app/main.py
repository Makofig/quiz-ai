"""AI Quiz Platform - FastAPI Application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import quiz, results, files, exams

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(exams.router, prefix="/api/exams", tags=["exams"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}
