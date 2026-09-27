from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Question

router = APIRouter()


@router.get("/questions")
def get_questions(
    topic: str,
    difficulty: str,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(Question)
        .filter(
            Question.topic == topic,
            Question.difficulty == difficulty
        )
        .all()
    )

    return questions