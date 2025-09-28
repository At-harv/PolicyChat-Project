# retrieval_api_updated.py
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
from google import genai
from db import fetch_policy_metadata  # function to get SQL metadata for a policy

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
        # "You are an assistant that answers user questions about the user's insurance policies.\n"
        # "Use ONLY the context provided below. If the information is not present, say you don't know.\n\n"
        "You are an assistant that answers questions about user's insurance policies.\n"
        "Use ONLY context provided below. If the information is not present, answer from general knowledge regarding policies.\n\n"
    )
    context_pieces = []
    total_chars = 0
    for idx, chunk in enumerate(chunks):
        # Prioritize metadata documents
        doc_type = chunk['metadata'].get('type', 'pdf')
        source_label = f"Metadata" if doc_type == "metadata" else f"File: {chunk['metadata'].get('file', 'unknown')}"
        piece = f"[Source {idx+1}] {source_label} | Policy: {chunk['metadata'].get('policy_id')}\n{chunk['document']}\n---\n"
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
        return {"text": response.text, "response_obj": response.dict()}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API call failed: {e}")

# -------------------------
# API Endpoint
# -------------------------
@app.post("/query", response_model=QueryResponse)
def query_endpoint(body: QueryRequest):
    if not body.query or not body.user_id:
        raise HTTPException(status_code=400, detail="user_id and query are required")

    # -------------------------
    # 1) Fetch SQL metadata (if any)
    # -------------------------
    try:
        metadata_docs = fetch_policy_metadata(body.user_id)
        metadata_chunks = []
        for meta in metadata_docs:
            text_doc = (
                f"Policy Name: {meta['policyName']}\n"
                f"Policy Number: {meta['policyNumber']}\n"
                f"Insurance Company: {meta['insuranceCompany']}\n"
                f"Policy Type: {meta['policyType']}\n"
                f"Premium: {meta['premiumAmount']} ({meta['premiumFrequency']})\n"
                f"Coverage: {meta['coverageAmount']}\n"
                f"Status: {meta['status']}\n"
                f"Start Date: {meta['startDate']}\n"
                f"End Date: {meta['endDate']}\n"
            )
            metadata_chunks.append({
                "document": text_doc,
                "metadata": {"policy_id": meta['id'], "user_id": body.user_id, "type": "metadata"}
            })
    except Exception as e:
        print("[DEBUG] Failed to fetch SQL metadata:", e)
        metadata_chunks = []

    # -------------------------
    # 2) Semantic search in Chroma for PDF chunks
    # -------------------------
    try:
        results = collection.query(
            query_texts=[body.query],
            n_results=body.top_k,
            where={"user_id": body.user_id},
            include=["documents", "metadatas", "distances"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query failed: {e}")

    docs_list = results.get("documents", [[]])[0]
    metas_list = results.get("metadatas", [[]])[0]

    pdf_chunks = [{"document": docs_list[i], "metadata": metas_list[i]} for i in range(len(docs_list))] if docs_list else []

    # -------------------------
    # 3) Combine metadata + PDF chunks
    # -------------------------
    combined_chunks = metadata_chunks + pdf_chunks
    if not combined_chunks:
        return {"answer": "No relevant documents found.", "sources": [], "raw_gemini_response": {}}

    # -------------------------
    # 4) Build prompt & call Gemini
    # -------------------------
    prompt = build_prompt(body.query, combined_chunks)
    try:
        gemini_resp = call_gemini(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to call Gemini: {e}")

    # -------------------------
    # 5) Prepare sources list
    # -------------------------
    sources = [
        {
            "source_index": idx + 1,
            "policy_id": chunk["metadata"].get("policy_id"),
            "file": chunk["metadata"].get("file"),
            "type": chunk["metadata"].get("type")
        }
        for idx, chunk in enumerate(combined_chunks[:body.top_k])
    ]

    # -------------------------
    # 6) Return response
    # -------------------------
    return {
        "answer": gemini_resp["text"].strip(),
        "sources": sources,
        "raw_gemini_response": gemini_resp["response_obj"]
    }
