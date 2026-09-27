import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def evaluate_answer(question, answer):

    prompt = f"""
You are an expert technical interview evaluator.

Evaluate the candidate's answer to the interview question.

Question:
{question}

Candidate Answer:
{answer}

Evaluate these four areas:

1. Correctness
2. Relevance
3. Completeness
4. Clarity

Give each area a score from 0 to 10.

Also provide:
- strengths: 2 short points about what the candidate did well
- improvements: 2 short points about what the candidate should improve
- encouragement: one short encouraging sentence

Calculate the overall score as the average of the four scores.

Return ONLY valid JSON in exactly this format:

{{
    "correctness": 0,
    "relevance": 0,
    "completeness": 0,
    "clarity": 0,
    "overall_score": 0,
    "strengths": [
        "point 1",
        "point 2"
    ],
    "improvements": [
        "point 1",
        "point 2"
    ],
    "encouragement": "encouraging sentence"
}}

Do not add markdown.
Do not add explanations outside the JSON.
"""

    response = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0
    )


    result = response.choices[0].message.content.strip()


    try:

        result = result.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()


        data = json.loads(result)


        return data


    except Exception as error:

        print(
            "AI evaluation parsing error:",
            error
        )


        return {
            "correctness": 0,
            "relevance": 0,
            "completeness": 0,
            "clarity": 0,
            "overall_score": 0,
            "strengths": [],
            "improvements": [
                "Unable to analyze the answer."
            ],
            "encouragement":
                "Keep practicing and try again!"
        }