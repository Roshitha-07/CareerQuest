import os

from dotenv import load_dotenv
from groq import Groq

from .retriever import search

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_question(topic, difficulty):

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

    prompt = f"""
You are an expert technical interviewer.

Generate ONE interview question.

Topic:
{topic}

Difficulty:
{difficulty}

Use only the information provided in the context.

Context:
{context}

Requirements:
- Ask exactly one interview question.
- Match the requested difficulty.
- Do not provide the answer.
- Do not mention the PDF.
- Keep the question clear and suitable for a technical interview.

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
        temperature=0.3
    )

    question = response.choices[0].message.content.strip()

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