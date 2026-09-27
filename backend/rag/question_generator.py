import os

from dotenv import load_dotenv
from groq import Groq

from .retriever import search

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_question(
    topic,
    difficulty,
    previous_questions=None
):

    if previous_questions is None:
        previous_questions = []

    query = f"""
    {topic} interview questions
    {difficulty} level
    important concepts
    """

    results = search(
        query,
        topic=topic,
        top_k=5
    )

    if not results:
        return {
            "question": "",
            "sources": []
        }

    context = "\n\n".join(
        item["text"]
        for item in results
    )

    previous_text = ""

    if previous_questions:

        previous_text = "\n".join(
            f"- {question}"
            for question in previous_questions
        )

    prompt = f"""
You are an expert technical interviewer.

Generate ONE new interview question.

Topic:
{topic}

Difficulty:
{difficulty}

Use only the information provided in the context.

Context:
{context}

Previously asked questions:
{previous_text if previous_text else "None"}

Requirements:

- Ask exactly one interview question.
- Match the requested topic.
- Match the requested difficulty.
- Use the provided context.
- Do NOT repeat any previously asked question.
- Do NOT create a question that is only a small rewording of a previous question.
- Choose a different concept, angle, or subtopic when possible.
- Do not provide the answer.
- Do not mention the PDF.
- Return only the question.

Return only the question.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    question = (
        response.choices[0]
        .message.content
        .strip()
    )

    question = (
        question
        .replace("```", "")
        .strip()
    )

    sources = list(
        set(
            item["source"]
            for item in results
        )
    )

    return {
        "question": question,
        "sources": sources
    }