from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, InterviewAttempt

router = APIRouter()


@router.get("/achievements/{user_id}")
def get_achievements(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    attempts = db.query(
        InterviewAttempt
    ).filter(
        InterviewAttempt.user_id == user_id
    ).all()

    total_questions = len(attempts)

    achievements = []


    # -------------------------
    # FIRST INTERVIEW
    # -------------------------

    if total_questions >= 1:

        achievements.append({
            "id": "first_interview",
            "title": "First Step",
            "description": "Completed your first interview.",
            "icon": "🎯",
            "unlocked": True
        })


    # -------------------------
    # 10 QUESTIONS
    # -------------------------

    achievements.append({
        "id": "ten_questions",
        "title": "Getting Started",
        "description": "Answer 10 interview questions.",
        "icon": "📝",
        "unlocked": total_questions >= 10
    })


    # -------------------------
    # 25 QUESTIONS
    # -------------------------

    achievements.append({
        "id": "twenty_five_questions",
        "title": "Practice Builder",
        "description": "Answer 25 interview questions.",
        "icon": "📚",
        "unlocked": total_questions >= 25
    })


    # -------------------------
    # 50 QUESTIONS
    # -------------------------

    achievements.append({
        "id": "fifty_questions",
        "title": "Interview Pro",
        "description": "Answer 50 interview questions.",
        "icon": "🏆",
        "unlocked": total_questions >= 50
    })


    # -------------------------
    # 100 QUESTIONS
    # -------------------------

    achievements.append({
        "id": "hundred_questions",
        "title": "Interview Master",
        "description": "Answer 100 interview questions.",
        "icon": "👑",
        "unlocked": total_questions >= 100
    })


    # -------------------------
    # XP ACHIEVEMENTS
    # -------------------------

    achievements.append({
        "id": "five_hundred_xp",
        "title": "XP Hunter",
        "description": "Earn 500 XP.",
        "icon": "⚡",
        "unlocked": (user.xp or 0) >= 500
    })


    achievements.append({
        "id": "thousand_xp",
        "title": "XP Champion",
        "description": "Earn 1000 XP.",
        "icon": "💎",
        "unlocked": (user.xp or 0) >= 1000
    })


    return {
        "xp": user.xp or 0,
        "coins": user.coins or 0,
        "achievements": achievements
    }