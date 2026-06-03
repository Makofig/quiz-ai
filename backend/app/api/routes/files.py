"""File upload endpoint"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_parser import parse_file_from_bytes, SUPPORTED_EXTENSIONS, MAX_SIZE

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and extract its text content."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_SIZE // (1024 * 1024)}MB"
        )

    try:
        text = parse_file_from_bytes(content, ext)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error parsing file: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="File is empty or contains no readable text")

    return {
        "filename": file.filename,
        "extension": ext,
        "size": len(content),
        "content": text,
        "content_length": len(text),
    }
