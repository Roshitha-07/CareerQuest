import faiss
import numpy as np

from .document_loader import load_documents, split_text
from .embeddings import create_embeddings

chunks = []
index = None


def build_index():
    global chunks
    global index

    documents = load_documents()
    chunks = []

    for document in documents:
        document_chunks = split_text(document["text"])

        for chunk in document_chunks:
            chunks.append({
                "text": chunk,
                "source": document["filename"]
            })

    if not chunks:
        return False

    texts = [item["text"] for item in chunks]

    embeddings = create_embeddings(texts)
    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    return True


def search(query, topic=None, top_k=5):
    global chunks
    global index

    if index is None:
        build_index()

    if index is None:
        return []

    query_embedding = create_embeddings([query])
    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    for i in indices[0]:

        if i >= len(chunks):
            continue

        item = chunks[i]

        if topic:
            topic_name = topic.lower().replace(" ", "_")
            source = item["source"].lower()

            if topic_name not in source:
                continue

        results.append(item)

    return results