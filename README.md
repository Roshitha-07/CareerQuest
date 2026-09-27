# 🚀 CareerQuest

### AI-Powered Adaptive Interview & Career Development Platform

> **Practice smarter. Get evaluated. Track your growth.**

CareerQuest is an AI-powered interview practice platform that helps students and job seekers prepare for technical interviews through **personalized question generation, adaptive difficulty, speech-based answers, AI evaluation, and progress tracking.**

Unlike a traditional interview practice tool that recycles a fixed question bank, CareerQuest dynamically generates interview questions for the selected **topic and difficulty** using Retrieval-Augmented Generation (RAG), evaluates each answer across multiple dimensions, and continuously adapts the difficulty to the candidate's performance.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [System Architecture](#-system-architecture)
- [AI & RAG Pipeline](#-ai--rag-pipeline)
- [Adaptive Difficulty Logic](#-adaptive-difficulty-logic)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [Installation & Running](#-installation--running)
- [How to Use](#-how-to-use)
- [Major Challenges & Solutions](#-major-challenges--solutions)
- [Technical Decisions](#-technical-decisions)
- [Known Limitations](#-known-limitations)
- [Future Enhancements](#-future-enhancements)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)
- [License](#-license)

---

## 🎯 Overview

Technical interview preparation is often repetitive and disconnected from real interview conditions. Most existing tools rely on fixed question sets, manual self-evaluation, no personalized difficulty, and no performance history.

CareerQuest solves this by combining **RAG-based question generation, AI evaluation, adaptive difficulty, speech input, and gamified progress tracking** into one platform, so every practice session contributes to measurable, long-term improvement.

## ❗ Problem Statement

Candidates preparing for technical interviews commonly face:

1. Repetitive, fixed question sets
2. No way to know if their answer is technically correct
3. Little or no detailed feedback
4. Difficulty that never adapts to their actual skill level
5. No centralized way to track improvement across topics
6. Little practice explaining concepts *verbally*, as in a real interview

CareerQuest was built to address all of these in a single workflow.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎯 **Topic-based practice** | DBMS, Java, DSA, SQL, Operating Systems (easily extendable) |
| 📊 **Difficulty levels** | Basic, Intermediate, Hard |
| 🤖 **RAG question generation** | Questions grounded in a real document knowledge base via FAISS + Groq |
| 🌐 **Web search** | Tavily-powered supplementary research endpoint |
| 🎙️ **Speech-based answers** | Browser Speech Recognition API converts spoken answers to text |
| 🧠 **AI answer evaluation** | Scores Correctness, Relevance, Completeness, and Clarity (0–10 each) |
| 🔄 **Adaptive difficulty** | Next question's difficulty reacts to the previous score |
| 🏆 **Gamification** | XP, coins, current/best streaks, achievements |
| 📈 **Performance dashboard** | Activity heatmap, topic-wise scores, full interview history |

---

## 🔄 How It Works

```

Select Topic → Select Difficulty → RAG retrieves context
    → AI generates question → Candidate types or speaks answer
    → AI evaluates answer → Score + Feedback shown
    → Difficulty adapts → XP / Coins / Streak updated → Dashboard

```

---

## 🏗️ System Architecture

```

                FRONTEND (HTML • CSS • JS)
                          │
                          ▼
                   FASTAPI BACKEND
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
   RAG Pipeline     AI Evaluator (Groq)   Web Search (Tavily)
        │
        ▼
  PDF Documents → Sentence Transformers → FAISS Vector Index

                       MySQL
        (Users • Topics • Questions • Attempts)

```

---

## 🧠 AI & RAG Pipeline

1. **Document loading** — topic-specific PDFs (`dbms.pdf`, `java.pdf`, `dsa.pdf`, `sql.pdf`, `operating_systems.pdf`) from `documents/questions/`
2. **Text extraction** — via `PyPDF`
3. **Chunking** — 800-character chunks with 100-character overlap to preserve context
4. **Embeddings** — `all-MiniLM-L6-v2` (Sentence Transformers)
5. **Retrieval** — FAISS similarity search filtered by topic + difficulty
6. **Generation** — Groq LLM produces exactly one question, grounded only in the retrieved context, matching the requested topic and difficulty, without revealing the answer

## 🔁 Adaptive Difficulty Logic

```

Score 8–10   → Increase difficulty
Score 5–7    → Keep same difficulty
Score 0–4    → Decrease difficulty

```

Example: `Basic (9) → Intermediate (8) → Hard (4) → Intermediate`

---

## 🛠️ Technology Stack

**Frontend:** HTML5, CSS3, JavaScript, Chart.js, Web Speech API
**Backend:** Python, FastAPI, Uvicorn, SQLAlchemy
**Database:** MySQL, PyMySQL
**AI / ML:** Groq, Sentence Transformers, FAISS, RAG, PyPDF
**Search:** Tavily
**Tools:** VS Code, Git, GitHub, Python venv

---

## 📁 Project Structure

```

CareerQuest/
├── backend/
│   ├── rag/
│   │   ├── document_loader.py
│   │   ├── embeddings.py
│   │   ├── retriever.py
│   │   └── question_generator.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── interview.py
│   │   ├── performance.py
│   │   ├── questions.py
│   │   └── rag.py
│   ├── services/
│   │   └── ai_evaluator.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│   └── web_search.py
├── documents/
│   └── questions/
│       ├── dbms.pdf
│       ├── java.pdf
│       ├── dsa.pdf
│       ├── sql.pdf
│       └── operating_systems.pdf
├── frontend/
│   ├── css/style.css
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── interview.js
│   │   ├── login.js
│   │   ├── preparing.js
│   │   └── register.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── preparing.html
│   ├── interview.html
│   └── dashboard.html
├── .gitignore
├── requirements.txt
└── README.md

```

---

## 🗄️ Database Design

| Entity | Stores |
|---|---|
| **Users** | ID, Name, Email, Password, XP, Coins |
| **Topics** | Available interview topics |
| **Questions** | Topic, Question, Difficulty, Source |
| **Interview Attempts** | User ID, Question ID, Answer, Score, Feedback, Timestamp |

---

## ⚙️ Installation & Running

### Prerequisites
- Python 3.10+
- MySQL
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CareerQuest.git
cd CareerQuest
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create the MySQL database

```sql
CREATE DATABASE fake_interview;
```

### 5. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/fake_interview
GROQ_API_KEY=YOUR_GROQ_API_KEY
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
```

> ⚠️ Never commit `.env` to GitHub — it's already listed in `.gitignore`.

### 6. Start the backend

```bash
uvicorn backend.main:app --reload
```

- App: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

---

## 🧑‍💻 How to Use

1. **Register** an account (name, email, password)
2. **Login**
3. **Select** a topic and difficulty
4. **Answer** the AI-generated question by typing or speaking
5. **Submit** and receive an instant AI evaluation (score + strengths + improvements)
6. **Continue** — the next question's difficulty adapts to your score
7. **Track progress** on the Dashboard (streaks, XP, coins, topic performance, history, achievements)

---

## 🧩 Major Challenges & Solutions

| Challenge | Solution |
|---|---|
| Coordinating many moving parts (Frontend, FastAPI, MySQL, RAG, FAISS, Groq, Tavily, Speech Recognition) | Split into independent modules (`routes/`, `services/`, `rag/`) for isolated debugging |
| Inconsistent/unreadable PDFs breaking the RAG pipeline | Document loader skips empty files and handles extraction failures gracefully |
| Vector search pulling content from the wrong subject | Combined semantic similarity with a topic-based source filter |
| LLM returning multiple questions, answers, or wrong difficulty | Tightly constrained prompt: exactly one question, context-only, no answer included |
| A previously used Groq model returned `404` | Switched to `openai/gpt-oss-20b`, applied consistently across generation and evaluation |
| Free-form AI feedback was hard to render on the frontend | Evaluator returns structured JSON (`correctness`, `relevance`, `completeness`, `clarity`, `overall_score`, `strengths`, `improvements`, `encouragement`) |
| Schema drift (`topics` table missing, new columns needed) | Manually synced MySQL schema with SQLAlchemy models as the project evolved |
| Streaks miscounted across non-consecutive days | Practice dates deduplicated and compared sequentially to compute current/best streak |
| Needed spoken answers without a separate STT service | Used the browser's built-in Speech Recognition API |
| API keys should not be hardcoded | Loaded via `.env`, excluded from Git with `.gitignore` |
| Repeated practice sessions could resurface the same or reworded questions, reducing usefulness |Previously generated questions are pulled from MySQL and passed into the generation pipeline; the AI is instructed to avoid prior questions and simple rewordings and explore a different angle, and each new question is checked against stored questions before being saved |

---

## 🧠 Technical Decisions

- **FastAPI** — lightweight, fast, auto-generated Swagger docs, clean integration with Python AI libraries
- **MySQL** — reliable persistence for users, questions, attempts, and performance history
- **FAISS** — efficient local vector search without needing an external vector database
- **Sentence Transformers** — turns document chunks into comparable semantic embeddings
- **RAG** — grounds generated questions in real reference material instead of pure LLM guesswork
- **Groq** — fast inference, well suited to an interactive interview experience
- **Tavily** — programmatic web search to complement the local knowledge base

---

## ⚠️ Known Limitations

CareerQuest is currently a development/academic project:

- Authentication needs stronger password security (hashing, JWT) before production use
- Speech recognition depends on browser support
- AI responses depend on external LLM (Groq) availability
- Web search requires a valid Tavily API key
- RAG quality depends on the coverage of the uploaded PDF documents

---

## 🔮 Future Enhancements

- **AI:** multi-document ranking, hallucination detection, personalized recommendations
- **Interview modes:** full mock interviews, role- and company-specific modes, behavioral questions, follow-up questions
- **Speech:** confidence, speaking-speed, filler-word, and pronunciation analysis
- **Dashboard:** weekly/monthly reports, skill graphs, downloadable reports
- **Security:** password hashing, JWT auth, role-based access, rate limiting
- **Deployment:** Docker-based deployment to AWS / Render / Railway / Azure

---

## 📚 Learning Outcomes

Building CareerQuest provided hands-on experience with full-stack development, REST APIs, FastAPI, MySQL + SQLAlchemy, Retrieval-Augmented Generation, vector embeddings and FAISS, LLM integration and prompt engineering, speech recognition, adaptive algorithms, and debugging a multi-layer application end to end — reinforcing that building an AI product is as much about data pipelines, backend architecture, and UX as it is about calling an LLM.

---
## 📄 License

This project is intended for educational and portfolio purposes. Add an open-source license (e.g. MIT) here if you plan to accept external contributions.

---

> ⭐ **CareerQuest — Practice. Perform. Progress.**
> *Don't just practice interview questions. Build interview intelligence.*
