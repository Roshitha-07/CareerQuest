from fastapi import FastAPI
from .database import Base, engine
from . import models

from .routes.auth import router as auth_router
from .routes.questions import router as question_router
from .routes.interview import router as interview_router
from .routes.performance import router as performance_router
from .routes.rag import router as rag_router

from .web_search import search_web

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Fake Interview Simulator 2"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(
    auth_router,
    prefix="/auth"
)

app.include_router(
    question_router
)

app.include_router(
    interview_router
)

app.include_router(
    performance_router
)

app.include_router(
    rag_router
)


@app.get("/web-search")
def web_search_questions(
    topic: str,
    difficulty: str
):
    results = search_web(
        topic,
        difficulty
    )

    return {
        "topic": topic,
        "difficulty": difficulty,
        "results": results
    }


app.mount(
    "/",
    StaticFiles(
        directory="frontend",
        html=True
    ),
    name="frontend"
)