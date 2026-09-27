import os

from dotenv import load_dotenv
from tavily import TavilyClient


load_dotenv()


api_key = os.getenv("TAVILY_API_KEY")

client = TavilyClient(
    api_key=api_key
)


def search_web(topic, difficulty):

    query = (
        f"{topic} interview questions "
        f"{difficulty} level"
    )

    response = client.search(
        query=query,
        search_depth="basic",
        max_results=5
    )

    results = []

    for item in response["results"]:

        results.append({
            "title": item.get("title", ""),
            "content": item.get("content", ""),
            "url": item.get("url", "")
        })

    return results