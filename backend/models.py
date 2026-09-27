from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))

    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(100))
    question = Column(String(500))
    difficulty = Column(String(50))
    source = Column(String(255))

class InterviewAttempt(Base):
    __tablename__ = "interview_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    question_id = Column(Integer)
    answer = Column(String(2000))
    score = Column(Integer)
    feedback = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow)