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

    previous_questions = (
        db.query(Question)
        .filter(
            Question.topic == topic
        )
        .order_by(
            Question.id.desc()
        )
        .limit(50)
        .all()
    )

    previous_question_text = [
        item.question
        for item in previous_questions
    ]

    result = generate_question(
        topic,
        difficulty,
        previous_question_text
    )

    if not result["question"]:
        return {
            "message": "Question generation failed"
        }

    new_question = (
        result["question"]
        .strip()
        .lower()
    )

    for old_question in previous_question_text:

        old_question_clean = (
            old_question
            .strip()
            .lower()
        )

        if new_question == old_question_clean:

            result = generate_question(
                topic,
                difficulty,
                previous_question_text
            )

            break

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