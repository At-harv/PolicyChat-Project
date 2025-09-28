import os
import sys
import json
import csv
from datetime import datetime
from pypdf import PdfReader
import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
from db import fetch_policies, fetch_policies_by_id  # Your SQL fetch functions

# -----------------------------
# Configs
# -----------------------------
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STATE_FILE = "last_ingested.txt"
SPECIFIC_POLICY_ID = int(sys.argv[1]) if len(sys.argv) > 1 else None

# -----------------------------
# Chroma client & collection
# -----------------------------
client = chromadb.PersistentClient(path="./chroma_store")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction("all-MiniLM-L6-v2")
collection = client.get_or_create_collection(
    name="policy_docs",
    embedding_function=embedding_fn
)

# -----------------------------
# SentenceTransformer model (optional, only for extra embeddings)
# -----------------------------
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------------
# State functions
# -----------------------------
def get_last_ingested():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return int(f.read().strip())
    return None

def set_last_ingested(policy_id):
    with open(STATE_FILE, "w") as f:
        f.write(str(policy_id))

# -----------------------------
# PDF helpers
# -----------------------------
def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        return "\n".join([page.extract_text() or "" for page in reader.pages])
    except Exception as e:
        print(f"Failed to read {pdf_path}: {e}")
        return ""

def chunk_text(text, chunk_size=800, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

# -----------------------------
# Ingest one policy
# -----------------------------
def ingest_policy(policy):
    policy_id = policy["id"]
    user_id = policy["userId"]

    # -------------------------
    # 1) Ingest SQL metadata as a "document"
    # -------------------------
    metadata_doc = f"""
Policy Name: {policy['policyName']}
Policy Number: {policy['policyNumber']}
Insurance Company: {policy['insuranceCompany']}
Policy Type: {policy['policyType']}
Premium Amount: {policy['premiumAmount']} ({policy['premiumFrequency']})
Coverage Amount: {policy['coverageAmount']}
Status: {policy['status']}
Start Date: {policy['startDate']}
End Date: {policy['endDate']}
User ID: {policy['userId']}
"""
    collection.add(
        ids=[f"policy_meta_{policy_id}"],
        documents=[metadata_doc],
        metadatas=[{"policy_id": policy_id, "user_id": user_id, "type": "metadata"}]
    )
    print(f"Ingested metadata for policy {policy_id}")

    # -------------------------
    # 2) Ingest PDF chunks
    # -------------------------
    documents = policy.get("documents", [])
    if not documents:
        return

    for doc_path in documents:
        doc_path = doc_path.lstrip("/")
        full_path = os.path.join(BACKEND_ROOT, doc_path)
        if not os.path.exists(full_path):
            print(f"Skipping missing file: {full_path}")
            continue

        text = extract_text_from_pdf(full_path)
        chunks = chunk_text(text)

        ids = [f"{policy_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"policy_id": policy_id, "user_id": user_id, "file": full_path, "chunk": i, "type": "pdf"} for i in range(len(chunks))]

        collection.add(ids=ids, documents=chunks, metadatas=metadatas)
        print(f"Ingested {full_path} with {len(chunks)} chunks for policy {policy_id}")

# -----------------------------
# Main ingestion
# -----------------------------
def run_ingestion():
    if SPECIFIC_POLICY_ID:
        policies = fetch_policies_by_id(SPECIFIC_POLICY_ID)
    else:
        last_ingested = get_last_ingested()
        policies = fetch_policies(last_ingested)

    if not policies:
        print("No new policies to ingest.")
        return

    for policy in policies:
        ingest_policy(policy)
        set_last_ingested(policy["id"])

# -----------------------------
# Optional dumps
# -----------------------------
def dump_chroma_to_json(collection, output_dir="dumps"):
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = os.path.join(output_dir, f"chroma_dump_{timestamp}.json")
    all_items = {"ids": [], "documents": [], "metadatas": []}
    offset = 0
    batch_size = 100

    while True:
        results = collection.get(include=["documents", "metadatas"], limit=batch_size, offset=offset)
        if not results["ids"]:
            break
        all_items["ids"].extend(results["ids"])
        all_items["documents"].extend(results["documents"])
        all_items["metadatas"].extend(results["metadatas"])
        offset += batch_size

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)
    print(f"Chroma collection dumped to {out_file}")

def dump_chroma_to_csv(collection, output_dir="dumps"):
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = os.path.join(output_dir, f"chroma_dump_{timestamp}.csv")
    offset = 0
    batch_size = 100

    with open(out_file, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["id", "document", "metadata"])

        while True:
            results = collection.get(include=["documents", "metadatas"], limit=batch_size, offset=offset)
            if not results["ids"]:
                break
            for i in range(len(results["ids"])):
                writer.writerow([
                    results["ids"][i],
                    results["documents"][i],
                    json.dumps(results["metadatas"][i])
                ])
            offset += batch_size

    print(f"Chroma collection dumped to {out_file}")

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    run_ingestion()
    dump_chroma_to_json(collection)
    dump_chroma_to_csv(collection)
