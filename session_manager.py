"""
Session Manager — In-memory conversation history for student chat sessions
Maintains context across messages within a session with auto-expiry
"""

import time
import uuid
from typing import Dict, List, Optional
from datetime import datetime


class SessionManager:
    """
    In-memory session store for conversation history.
    Each student has their own conversation buffer with auto-expiry.
    """

    def __init__(self, max_history: int = 50, expiry_seconds: int = 1800):
        """
        Args:
            max_history: Maximum messages to store per session
            expiry_seconds: Session expiry time in seconds (default: 30 minutes)
        """
        self.sessions: Dict[str, Dict] = {}
        self.max_history = max_history
        self.expiry_seconds = expiry_seconds
        self.feedback_store: List[Dict] = []
        self.latency_metrics: List[float] = []

    def _ensure_session(self, student_id: str):
        """Create session if it doesn't exist."""
        if student_id not in self.sessions:
            self.sessions[student_id] = {
                "messages": [],
                "created_at": time.time(),
                "last_active": time.time(),
                "latencies": [],
            }
        else:
            # Check expiry
            session = self.sessions[student_id]
            if time.time() - session["last_active"] > self.expiry_seconds:
                # Session expired, create fresh
                self.sessions[student_id] = {
                    "messages": [],
                    "created_at": time.time(),
                    "last_active": time.time(),
                    "latencies": [],
                }
            else:
                session["last_active"] = time.time()

    def add_latency(self, student_id: str, latency: float):
        """Record a response latency."""
        self._ensure_session(student_id)
        self.sessions[student_id]["latencies"].append(latency)
        self.latency_metrics.append(latency)
        if len(self.latency_metrics) > 100:  # Keep last 100 for global avg
            self.latency_metrics = self.latency_metrics[-100:]

    def get_avg_latency(self) -> float:
        """Global average latency."""
        if not self.latency_metrics:
            return 0.0
        return round(sum(self.latency_metrics) / len(self.latency_metrics), 2)

    def add_message(self, student_id: str, role: str, content: str, message_id: Optional[str] = None) -> str:
        """
        Add a message to the session history.

        Args:
            student_id: Student identifier
            role: "user" or "ai"
            content: Message text
            message_id: Optional custom message ID

        Returns:
            The message ID
        """
        self._ensure_session(student_id)

        msg_id = message_id or str(uuid.uuid4())[:8]
        message = {
            "id": msg_id,
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        }

        self.sessions[student_id]["messages"].append(message)

        # Trim if over max
        if len(self.sessions[student_id]["messages"]) > self.max_history:
            self.sessions[student_id]["messages"] = self.sessions[student_id]["messages"][-self.max_history:]

        return msg_id

    def get_history(self, student_id: str) -> List[Dict]:
        """Get full conversation history for a student."""
        self._ensure_session(student_id)
        return self.sessions[student_id]["messages"]

    def get_context_window(self, student_id: str, max_turns: int = 6) -> List[Dict]:
        """
        Get the last N turns for LLM context injection.
        A 'turn' is one user message + one AI response.

        Args:
            student_id: Student identifier
            max_turns: Maximum number of message pairs to return

        Returns:
            List of recent messages (up to max_turns * 2 messages)
        """
        self._ensure_session(student_id)
        messages = self.sessions[student_id]["messages"]

        # Return last max_turns * 2 messages (user + ai pairs)
        max_messages = max_turns * 2
        return messages[-max_messages:] if len(messages) > max_messages else messages

    def clear_session(self, student_id: str) -> bool:
        """Clear conversation history for a student."""
        if student_id in self.sessions:
            self.sessions[student_id] = {
                "messages": [],
                "created_at": time.time(),
                "last_active": time.time(),
            }
            return True
        return False

    def add_feedback(self, student_id: str, message_id: str, rating: int, comment: Optional[str] = None) -> bool:
        """
        Store feedback for a specific AI response.

        Args:
            student_id: Student identifier
            message_id: ID of the message being rated
            rating: 1 (thumbs down) or 5 (thumbs up)
            comment: Optional text feedback
        """
        feedback = {
            "student_id": student_id,
            "message_id": message_id,
            "rating": rating,
            "comment": comment,
            "timestamp": datetime.now().isoformat(),
        }
        self.feedback_store.append(feedback)
        return True

    def get_feedback_stats(self) -> Dict:
        """Get aggregate feedback statistics."""
        if not self.feedback_store:
            return {"total": 0, "positive": 0, "negative": 0, "avg_rating": 0}

        total = len(self.feedback_store)
        positive = sum(1 for f in self.feedback_store if f["rating"] >= 4)
        negative = sum(1 for f in self.feedback_store if f["rating"] <= 2)
        avg = sum(f["rating"] for f in self.feedback_store) / total

        return {
            "total": total,
            "positive": positive,
            "negative": negative,
            "avg_rating": round(avg, 2),
        }

    def get_active_sessions(self) -> int:
        """Get count of active (non-expired) sessions."""
        now = time.time()
        return sum(
            1 for s in self.sessions.values()
            if now - s["last_active"] < self.expiry_seconds
        )

    def cleanup_expired(self):
        """Remove expired sessions to free memory."""
        now = time.time()
        expired = [
            sid for sid, s in self.sessions.items()
            if now - s["last_active"] > self.expiry_seconds
        ]
        for sid in expired:
            del self.sessions[sid]
        return len(expired)
