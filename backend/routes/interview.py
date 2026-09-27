from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import InterviewAttempt, Question, User
from ..services.ai_evaluator import evaluate_answer
from ..rag.question_generator import generate_question

router = APIRouter()


# =========================================
# SUBMIT ANSWER
# =========================================

@router.post("/interview/submit")
def submit_answer(
    user_id: int,
    question_id: int,
    answer: str,
    db: Session = Depends(get_db)
):

    if not answer or not answer.strip():
        return {
            "message": "Answer cannot be empty."
        }


    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found."
        }


    question = db.query(Question).filter(
        Question.id == question_id
    ).first()

    if not question:
        return {
            "message": "Question not found."
        }


    # Prevent duplicate submission

    existing = db.query(
        InterviewAttempt
    ).filter(
        InterviewAttempt.user_id == user_id,
        InterviewAttempt.question_id == question_id
    ).first()

    if existing:
        return {
            "message": "This question has already been submitted."
        }


    # AI evaluation

    analysis = evaluate_answer(
        question.question,
        answer.strip()
    )


    score = round(
        analysis.get("overall_score", 0)
    )


    score = max(
        0,
        min(10, score)
    )


    # Save attempt

    attempt = InterviewAttempt(
        user_id=user_id,
        question_id=question_id,
        answer=answer.strip(),
        score=score,
        feedback=analysis.get(
            "encouragement",
            ""
        )
    )


    db.add(attempt)


    # XP

    xp_earned = score * 10

    user.xp = (
        user.xp or 0
    ) + xp_earned


    # Coins

    coins_earned = 5

    user.coins = (
        user.coins or 0
    ) + coins_earned


    db.commit()

    db.refresh(attempt)
    db.refresh(user)


    return {

        "attempt_id": attempt.id,

        "score": score,

        "correctness":
            analysis.get("correctness", 0),

        "relevance":
            analysis.get("relevance", 0),

        "completeness":
            analysis.get("completeness", 0),

        "clarity":
            analysis.get("clarity", 0),

        "strengths":
            analysis.get("strengths", []),

        "improvements":
            analysis.get("improvements", []),

        "encouragement":
            analysis.get(
                "encouragement",
                ""
            ),

        "xp_earned": xp_earned,

        "total_xp":
            user.xp,

        "coins_earned":
            coins_earned,

        "total_coins":
            user.coins
    }


# =========================================
# ADAPTIVE DIFFICULTY
# =========================================

def get_next_difficulty(
    current_difficulty,
    score
):

    difficulty = (
        current_difficulty
        .strip()
        .lower()
    )


    if score >= 8:

        if difficulty == "basic":
            return "Intermediate"

        if difficulty == "intermediate":
            return "Hard"

        return "Hard"


    if score >= 5:

        if difficulty == "basic":
            return "Basic"

        if difficulty == "intermediate":
            return "Intermediate"

        return "Hard"


    if difficulty == "hard":
        return "Intermediate"

    if difficulty == "intermediate":
        return "Basic"

    return "Basic"


# =========================================
# NEXT ADAPTIVE QUESTION
# =========================================

@router.get("/interview/next-question")
def next_question(
    topic: str,
    difficulty: str,
    previous_score: int,
    db: Session = Depends(get_db)
):

    next_difficulty = get_next_difficulty(
        difficulty,
        previous_score
    )


    result = generate_question(
        topic,
        next_difficulty
    )


    if not result.get("question"):

        return {
            "message":
                "Unable to generate question."
        }


    question = Question(
        topic=topic,
        question=result["question"],
        difficulty=next_difficulty,
        source="RAG"
    )


    db.add(question)

    db.commit()

    db.refresh(question)


    return {

        "question_id":
            question.id,

        "question":
            question.question,

        "topic":
            topic,

        "difficulty":
            next_difficulty,

        "previous_score":
            previous_score,

        "sources":
            result.get("sources", [])
    }


# =========================================
# INTERVIEW HISTORY
# =========================================

@router.get("/interview/history/{user_id}")
def interview_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    attempts = db.query(
        InterviewAttempt
    ).filter(
        InterviewAttempt.user_id == user_id
    ).order_by(
        InterviewAttempt.created_at.desc()
    ).limit(20).all()


    history = []


    for attempt in attempts:

        question = db.query(
            Question
        ).filter(
            Question.id ==
            attempt.question_id
        ).first()


        history.append({

            "id": attempt.id,

            "question":
                question.question
                if question
                else "Unknown question",

            "topic":
                question.topic
                if question
                else "Unknown",

            "difficulty":
                question.difficulty
                if question
                else "Unknown",

            "score":
                attempt.score,

            "feedback":
                attempt.feedback,

            "date":
                str(attempt.created_at)
                if attempt.created_at
                else None

        })


    return {
        "history": history
    }