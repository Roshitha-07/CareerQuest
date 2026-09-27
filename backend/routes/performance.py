from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InterviewAttempt, Question, User
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/performance/{user_id}")
def get_performance(
    user_id: int,
    db: Session = Depends(get_db)
):

    # -------------------------
    # GET USER
    # -------------------------

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }


    # -------------------------
    # GET INTERVIEW ATTEMPTS
    # -------------------------

    attempts = db.query(
        InterviewAttempt
    ).filter(
        InterviewAttempt.user_id == user_id
    ).order_by(
        InterviewAttempt.created_at
    ).all()


    total = len(attempts)


    # -------------------------
    # NO ATTEMPTS
    # -------------------------

    if total == 0:

        return {
            "questions_answered": 0,
            "average_score": 0,
            "current_streak": 0,
            "best_streak": 0,

            "xp": user.xp or 0,
            "coins": user.coins or 0,

            "activity": [],

            "topic_performance": {}
        }


    # -------------------------
    # AVERAGE SCORE
    # -------------------------

    total_score = sum(
        attempt.score or 0
        for attempt in attempts
    )

    average_score = round(
        total_score / total,
        2
    )


    # -------------------------
    # GET UNIQUE PRACTICE DATES
    # -------------------------

    dates = sorted(
        set(
            attempt.created_at.date()
            for attempt in attempts
            if attempt.created_at
        )
    )


    current_streak = 0
    best_streak = 0


    # -------------------------
    # CALCULATE STREAK
    # -------------------------

    if dates:

        streak = 1
        best_streak = 1


        for i in range(1, len(dates)):

            if dates[i] == dates[i - 1] + timedelta(days=1):

                streak += 1

            else:

                streak = 1


            best_streak = max(
                best_streak,
                streak
            )


        today = datetime.now().date()


        if dates[-1] == today:

            current_streak = streak

        elif dates[-1] == today - timedelta(days=1):

            current_streak = streak

        else:

            current_streak = 0


    # -------------------------
    # XP AND COINS
    # -------------------------

    xp = user.xp or 0

    coins = user.coins or 0


    # -------------------------
    # ACTIVITY DATA
    # -------------------------

    activity_data = {}


    for attempt in attempts:

        if not attempt.created_at:
            continue


        date = str(
            attempt.created_at.date()
        )


        if date not in activity_data:

            activity_data[date] = 0


        activity_data[date] += 1


    activity = []


    for date, count in activity_data.items():

        activity.append({
            "date": date,
            "count": count
        })


    # -------------------------
    # TOPIC PERFORMANCE
    # -------------------------

    topic_data = {}


    for attempt in attempts:

        question = db.query(
            Question
        ).filter(
            Question.id == attempt.question_id
        ).first()


        if question:

            topic = question.topic


            if topic not in topic_data:

                topic_data[topic] = []


            topic_data[topic].append(
                attempt.score or 0
            )


    topic_performance = {}


    for topic, scores in topic_data.items():

        topic_performance[topic] = round(
            sum(scores) / len(scores),
            2
        )


    # -------------------------
    # FINAL RESPONSE
    # -------------------------

    return {

        "questions_answered": total,

        "average_score": average_score,

        "current_streak": current_streak,

        "best_streak": best_streak,

        "xp": xp,

        "coins": coins,

        "activity": activity,

        "topic_performance": topic_performance

    }