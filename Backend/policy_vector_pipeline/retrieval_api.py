# retrieval_api.py
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

from google import genai

# -------------------------
# Load environment
# -------------------------
load_dotenv()

print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))

# -------------------------
# Config
# -------------------------
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_store")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "policy_docs")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DEFAULT_TOP_K = int(os.getenv("TOP_K", "3"))
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS", "3000"))

# -------------------------
# FastAPI app & models
# -------------------------
app = FastAPI(title="Policy Retrieval + Gemini API")

class QueryRequest(BaseModel):
    user_id: int
    query: str
    top_k: Optional[int] = DEFAULT_TOP_K

class QueryResponse(BaseModel):
    answer: str
    sources: list
    raw_gemini_response: dict

# -------------------------
# Chroma client init
# -------------------------
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction("all-MiniLM-L6-v2")

collection = chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    embedding_function=embedding_fn
)

# -------------------------
# Gemini client init
# -------------------------
gemini_client = genai.Client()  # reads GEMINI_API_KEY from env

# -------------------------
# Helpers
# -------------------------
def build_prompt(query: str, chunks: list):
    header = (
        "You are an assistant that answers user questions about the user's insurance policies.\n"
        "Use ONLY the context provided below. If the information is not present, say you don't know.\n\n"
    )
    context_pieces = []
    total_chars = 0
    for idx, chunk in enumerate(chunks):
        piece = f"[Source {idx+1}] File: {chunk['metadata'].get('file', 'unknown')} | Policy: {chunk['metadata'].get('policy_id')}\n{chunk['document']}\n---\n"
        if total_chars + len(piece) > MAX_PROMPT_CHARS:
            break
        context_pieces.append(piece)
        total_chars += len(piece)
    context = "\n".join(context_pieces).strip()
    prompt = f"{header}CONTEXT:\n{context}\n\nUser question: {query}\n\nAnswer concisely and cite sources like [Source 1], [Source 2]."
    return prompt

def call_gemini(prompt: str):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"text": response.text, "response_obj": response.dict()}  # convert to dict
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API call failed: {e}")

# -------------------------
# API Endpoint
# -------------------------
@app.post("/query", response_model=QueryResponse)
def query_endpoint(body: QueryRequest):
    # 1) Validate request
    if not body.query or not body.user_id:
        raise HTTPException(status_code=400, detail="user_id and query are required")

    # 2) Debug: check total docs
    all_docs = collection.get(include=["documents", "metadatas"])
    print(f"[DEBUG] Total documents in collection: {len(all_docs.get('documents', []))}")

    # 3) Semantic search in Chroma
    try:
        results = collection.query(
            query_texts=[body.query],
            n_results=body.top_k,
            where={"user_id": body.user_id},
            include=["documents", "metadatas", "distances"]
        )
        print(f"[DEBUG] Raw Chroma results: {results}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query failed: {e}")

    docs_list = results.get("documents", [[]])[0]
    metas_list = results.get("metadatas", [[]])[0]

    if not docs_list:
        print("[DEBUG] No matching documents found")
        return {
            "answer": "No relevant documents found.",
            "sources": [],
            "raw_gemini_response": {}
        }

    # 4) Build chunks for prompt
    docs = [{"document": docs_list[i], "metadata": metas_list[i]} for i in range(len(docs_list))]
    for idx, doc in enumerate(docs):
        print(f"[DEBUG] Retrieved: Policy={doc['metadata'].get('policy_id')}, Chunk={doc['metadata'].get('chunk')}")

    # 5) Build prompt for Gemini
    prompt = build_prompt(body.query, docs)

    # 6) Call Gemini
# 6) Call Gemini with debug prints
    try:
        gemini_resp = call_gemini(prompt)
        print("[DEBUG] Gemini response text:", gemini_resp.get("text") or str(gemini_resp))
    except Exception as e:
        print("[DEBUG] Gemini call failed:", e)
        raise HTTPException(status_code=502, detail=f"Failed to call Gemini: {e}")

    # 7) Prepare sources list
    sources = [
        {
            "source_index": idx + 1,
            "policy_id": doc["metadata"].get("policy_id"),
            "file": doc["metadata"].get("file"),
            "chunk": doc["metadata"].get("chunk")
        }
        for idx, doc in enumerate(docs[:body.top_k])
    ]

    # 8) Return response
    return {
        "answer": gemini_resp["text"].strip(),
        "sources": sources,
        "raw_gemini_response": gemini_resp["response_obj"]
    }
