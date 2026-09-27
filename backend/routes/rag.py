from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Question
from ..rag.question_generator import generate_question


router = APIRouter()


@router.get("/rag/question")
def get_rag_question(
    topic: str,
    difficulty: str,
    db: Session = Depends(get_db)
):

    result = generate_question(
        topic,
        difficulty
    )

    if not result["question"]:
        return {
            "message": "Question generation failed"
        }

    question = Question(
        topic=topic,
        question=result["question"],
        difficulty=difficulty,
        source="RAG"
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "question_id": question.id,
        "question": question.question,
        "topic": topic,
        "difficulty": difficulty,
        "source": "RAG",
        "sources": result["sources"]
    }