"""
RAG Engine — ChromaDB-based retrieval for student onboarding knowledge
Indexes markdown knowledge base files and performs semantic search
"""

import os
import hashlib
from pathlib import Path
from typing import List, Dict, Optional

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except Exception:
    CHROMADB_AVAILABLE = False
    print("⚠️  chromadb not available. RAG will use keyword fallback.")

try:
    from sentence_transformers import SentenceTransformer
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    print("⚠️  sentence-transformers not installed. Using ChromaDB default embeddings.")


class RAGEngine:
    """
    Retrieval-Augmented Generation engine using ChromaDB.
    Indexes knowledge base documents and retrieves relevant chunks for LLM context.
    """

    def __init__(self, knowledge_dir: str = "knowledge_base", db_dir: str = "chroma_db"):
        self.knowledge_dir = Path(knowledge_dir)
        self.db_dir = Path(db_dir)
        self.collection = None
        self.embedding_model = None
        self._initialized = False

        self._init_store()

    def _init_store(self):
        """Initialize ChromaDB and embedding model."""
        if not CHROMADB_AVAILABLE:
            print("⚠️  RAG disabled — chromadb not available")
            return

        try:
            # Initialize ChromaDB with persistent storage
            self.client = chromadb.PersistentClient(path=str(self.db_dir))

            # Load embedding model if available
            if EMBEDDINGS_AVAILABLE:
                print("📦 Loading embedding model (all-MiniLM-L6-v2)...")
                self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
                self.collection = self.client.get_or_create_collection(
                    name="campus_knowledge",
                    metadata={"hnsw:space": "cosine"}
                )
            else:
                # Use ChromaDB's default embeddings
                self.collection = self.client.get_or_create_collection(
                    name="campus_knowledge"
                )

            self._initialized = True
            print(f"✅ RAG engine initialized (collection: {self.collection.count()} docs)")

            # Auto-index knowledge base if empty or changed
            self._auto_index()

        except Exception as e:
            print(f"❌ RAG init error: {e}")
            self._initialized = False

    def _auto_index(self):
        """Index knowledge base files if not already indexed or if content changed."""
        if not self._initialized or not self.knowledge_dir.exists():
            return

        # Check if we need to re-index by comparing file hashes
        current_hash = self._compute_kb_hash()
        hash_file = self.db_dir / ".kb_hash"

        if hash_file.exists() and hash_file.read_text().strip() == current_hash:
            print("📚 Knowledge base unchanged, skipping re-index")
            return

        print("📚 Indexing knowledge base...")
        self._index_all_documents()

        # Save hash
        self.db_dir.mkdir(parents=True, exist_ok=True)
        hash_file.write_text(current_hash)

    def _compute_kb_hash(self) -> str:
        """Compute a hash of all knowledge base files for change detection."""
        hasher = hashlib.md5()
        for f in sorted(self.knowledge_dir.glob("*.md")):
            hasher.update(f.read_bytes())
        return hasher.hexdigest()

    def _index_all_documents(self):
        """Index all markdown files from knowledge_base directory."""
        if not self._initialized:
            return

        # Clear existing collection
        try:
            self.client.delete_collection("campus_knowledge")
            if self.embedding_model:
                self.collection = self.client.get_or_create_collection(
                    name="campus_knowledge",
                    metadata={"hnsw:space": "cosine"}
                )
            else:
                self.collection = self.client.get_or_create_collection(
                    name="campus_knowledge"
                )
        except Exception:
            pass

        doc_count = 0
        for md_file in self.knowledge_dir.glob("*.md"):
            chunks = self._chunk_document(md_file)
            category = md_file.stem  # e.g., "documents", "fees", "courses"

            for i, chunk in enumerate(chunks):
                doc_id = f"{category}_{i}"
                metadata = {
                    "source": md_file.name,
                    "category": category,
                    "chunk_index": i,
                }

                if self.embedding_model:
                    embedding = self.embedding_model.encode(chunk).tolist()
                    self.collection.add(
                        ids=[doc_id],
                        embeddings=[embedding],
                        documents=[chunk],
                        metadatas=[metadata],
                    )
                else:
                    self.collection.add(
                        ids=[doc_id],
                        documents=[chunk],
                        metadatas=[metadata],
                    )
                doc_count += 1

        print(f"✅ Indexed {doc_count} chunks from {len(list(self.knowledge_dir.glob('*.md')))} files")

    def _chunk_document(self, file_path: Path, chunk_size: int = 500) -> List[str]:
        """
        Split a markdown document into chunks by sections.
        Each section header (##) starts a new chunk.
        """
        content = file_path.read_text(encoding="utf-8")
        chunks = []
        current_chunk = []
        current_length = 0

        for line in content.split("\n"):
            # Start a new chunk on section headers if current chunk is big enough
            if line.startswith("## ") and current_length > 100:
                chunks.append("\n".join(current_chunk))
                current_chunk = [line]
                current_length = len(line)
            else:
                current_chunk.append(line)
                current_length += len(line)

                # Also split if chunk gets too large
                if current_length > chunk_size and not line.startswith("#"):
                    chunks.append("\n".join(current_chunk))
                    current_chunk = []
                    current_length = 0

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        # Filter out very short chunks
        return [c.strip() for c in chunks if len(c.strip()) > 50]

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Search the knowledge base for relevant content.

        Args:
            query: User's question
            top_k: Number of results to return

        Returns:
            List of dicts with 'text', 'category', 'score' keys
        """
        if not self._initialized or not self.collection or self.collection.count() == 0:
            return self._keyword_fallback(query)

        try:
            if self.embedding_model:
                query_embedding = self.embedding_model.encode(query).tolist()
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(top_k, self.collection.count()),
                )
            else:
                results = self.collection.query(
                    query_texts=[query],
                    n_results=min(top_k, self.collection.count()),
                )

            if not results or not results["documents"] or not results["documents"][0]:
                return self._keyword_fallback(query)

            output = []
            for i, doc in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i] if results["metadatas"] else {}
                distance = results["distances"][0][i] if results.get("distances") else 0
                score = 1 - distance  # Convert distance to similarity

                output.append({
                    "text": doc,
                    "category": meta.get("category", "unknown"),
                    "source": meta.get("source", ""),
                    "score": round(score, 3),
                })

            return output

        except Exception as e:
            print(f"RAG search error: {e}")
            return self._keyword_fallback(query)

    def _keyword_fallback(self, query: str) -> List[Dict]:
        """
        Simple keyword-based fallback when ChromaDB is not available.
        Searches raw markdown files for matching content.
        """
        if not self.knowledge_dir.exists():
            return []

        query_lower = query.lower()
        results = []

        for md_file in self.knowledge_dir.glob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            content_lower = content.lower()

            # Score based on keyword matches
            keywords = query_lower.split()
            matches = sum(1 for kw in keywords if kw in content_lower)

            if matches > 0:
                # Extract the most relevant section
                sections = content.split("\n## ")
                best_section = ""
                best_score = 0

                for section in sections:
                    section_lower = section.lower()
                    section_matches = sum(1 for kw in keywords if kw in section_lower)
                    if section_matches > best_score:
                        best_score = section_matches
                        best_section = section

                if best_section:
                    results.append({
                        "text": best_section[:500],
                        "category": md_file.stem,
                        "source": md_file.name,
                        "score": round(matches / len(keywords), 3),
                    })

        # Sort by score, return top results
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:3]

    def add_document(self, text: str, category: str, source: str = "manual") -> bool:
        """Add a single document chunk to the knowledge base."""
        if not self._initialized:
            return False

        try:
            doc_id = f"{category}_{hashlib.md5(text.encode()).hexdigest()[:8]}"
            metadata = {"source": source, "category": category}

            if self.embedding_model:
                embedding = self.embedding_model.encode(text).tolist()
                self.collection.add(
                    ids=[doc_id],
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[metadata],
                )
            else:
                self.collection.add(
                    ids=[doc_id],
                    documents=[text],
                    metadatas=[metadata],
                )
            return True
        except Exception as e:
            print(f"Error adding document: {e}")
            return False

    def get_stats(self) -> Dict:
        """Get RAG engine statistics."""
        return {
            "initialized": self._initialized,
            "chromadb_available": CHROMADB_AVAILABLE,
            "embeddings_available": EMBEDDINGS_AVAILABLE,
            "total_documents": self.collection.count() if self._initialized and self.collection else 0,
            "knowledge_files": len(list(self.knowledge_dir.glob("*.md"))) if self.knowledge_dir.exists() else 0,
        }


# Test if run directly
if __name__ == "__main__":
    print("Testing RAG Engine...")
    print("=" * 50)

    engine = RAGEngine()
    print(f"\nStats: {engine.get_stats()}")

    # Test search
    queries = [
        "What documents do I need to upload?",
        "When is the fee deadline?",
        "How do I register for courses?",
        "Tell me about hostel rules",
    ]

    for q in queries:
        print(f"\n🔍 Query: {q}")
        results = engine.search(q)
        for r in results:
            print(f"   [{r['category']}] (score: {r['score']}): {r['text'][:100]}...")

    print("\n" + "=" * 50)
    print("✓ RAG tests complete!")
