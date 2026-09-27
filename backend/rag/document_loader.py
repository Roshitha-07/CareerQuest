import os
from pypdf import PdfReader


DOCUMENT_FOLDER = "documents/questions"


def load_documents():

    documents = []

    if not os.path.exists(DOCUMENT_FOLDER):
        return documents

    for filename in os.listdir(DOCUMENT_FOLDER):

        if not filename.lower().endswith(".pdf"):
            continue

        path = os.path.join(
            DOCUMENT_FOLDER,
            filename
        )

        if os.path.getsize(path) == 0:
            print(f"Skipping empty PDF: {filename}")
            continue

        try:
            reader = PdfReader(path)

            text = ""

            for page in reader.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                print(f"Skipping PDF with no text: {filename}")
                continue

            documents.append({
                "filename": filename,
                "text": text
            })

        except Exception as e:

            print(
                f"Skipping unreadable PDF {filename}: {e}"
            )

    return documents


def split_text(
    text,
    chunk_size=800,
    overlap=100
):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end]

        if chunk.strip():
            chunks.append(chunk.strip())

        start += chunk_size - overlap

    return chunks