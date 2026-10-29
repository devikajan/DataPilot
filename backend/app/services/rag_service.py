
import hashlib
import uuid
import os
from typing import Any

from openai import OpenAI
from qdrant_client import QdrantClient, models


COLLECTION_NAME = "datapilot_documents"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

openai_client = OpenAI()



qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant_client = QdrantClient(url=qdrant_url)


def ensure_collection() -> None:
    """Create the Qdrant collection if it does not exist."""
    collections = qdrant_client.get_collections().collections
    names = {collection.name for collection in collections}

    if COLLECTION_NAME not in names:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=EMBEDDING_DIMENSIONS,
                distance=models.Distance.COSINE,
            ),
        )


def chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks."""
    text = " ".join(text.split())

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end == len(text):
            break

        start = end - CHUNK_OVERLAP

    return chunks


def create_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for text chunks."""
    if not texts:
        return []

    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )

    return [item.embedding for item in response.data]


def index_document(
    text: str,
    document_id: str,
    filename: str,
) -> dict[str, Any]:
    """Chunk, embed, and index a document in Qdrant."""
    chunks = chunk_text(text)

    if not chunks:
        raise ValueError("The document contains no extractable text.")

    ensure_collection()

    embeddings = create_embeddings(chunks)

    points = []

    for index, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    ):
        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_URL,
                f"{document_id}:{index}",
            )
        )

        points.append(
            models.PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": index,
                    "text": chunk,
                    "content_hash": hashlib.sha256(
                        chunk.encode("utf-8")
                    ).hexdigest(),
                },
            )
        )

    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
        wait=True,
    )

    return {
        "document_id": document_id,
        "filename": filename,
        "chunks_indexed": len(points),
    }


def retrieve_context(
    question: str,
    limit: int = 5,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    """Retrieve semantically relevant document chunks."""
    ensure_collection()

    query_embedding = create_embeddings([question])[0]

    query_filter = None

    if document_id:
        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchValue(value=document_id),
                )
            ]
        )

    results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=query_filter,
        limit=limit,
        with_payload=True,
    ).points

    return [
        {
            "document_id": point.payload.get("document_id"),
            "filename": point.payload.get("filename"),
            "text": point.payload.get("text"),
            "score": point.score,
        }
        for point in results
    ]
