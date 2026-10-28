"""Guided Inquiry Lessons endpoints."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.database import Lesson

router = APIRouter(prefix="/lessons", tags=["Guided Learning Mode"])


@router.get("", response_model=List[Dict[str, Any]])
def list_lessons(db: Session = Depends(get_db)):
    """List all guided inquiry lessons."""
    lessons = db.query(Lesson).order_by(Lesson.lesson_number.asc()).all()
    return [
        {
            "id": l.id,
            "lesson_number": l.lesson_number,
            "slug": l.slug,
            "title": l.title,
            "objective": l.objective,
            "explanation": l.explanation,
            "recommended_config": l.recommended_config,
            "prediction_question": l.prediction_question,
            "prediction_options": l.prediction_options,
            "reflection_prompt": l.reflection_prompt
        }
        for l in lessons
    ]


@router.get("/{slug}", response_model=Dict[str, Any])
def get_lesson(slug: str, db: Session = Depends(get_db)):
    """Get single guided inquiry lesson by slug."""
    l = db.query(Lesson).filter(Lesson.slug == slug).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {
        "id": l.id,
        "lesson_number": l.lesson_number,
        "slug": l.slug,
        "title": l.title,
        "objective": l.objective,
        "explanation": l.explanation,
        "recommended_config": l.recommended_config,
        "prediction_question": l.prediction_question,
        "prediction_options": l.prediction_options,
        "reflection_prompt": l.reflection_prompt
    }
