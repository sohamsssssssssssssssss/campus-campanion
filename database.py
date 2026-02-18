"""
SQLite Database Manager
Handles student data persistence for the prototype
"""

import sqlite3
import json
import uuid
from datetime import datetime
from typing import Dict, Optional, List
import threading

class Database:
    """
    Simple SQLite database for student onboarding data
    Uses a single persistent connection with WAL mode and timeout for reliability.
    """
    
    _instance = None
    _lock = threading.Lock()

    def __init__(self, db_path: str = "campuscompanion.db"):
        self.db_path = db_path
        # Use a single connection with check_same_thread=False for FastAPI/Multithreading
        self.conn = sqlite3.connect(self.db_path, timeout=30, check_same_thread=False)
        self.conn.execute('PRAGMA journal_mode=WAL')
        self.conn.execute('PRAGMA synchronous=NORMAL')
        self.init_database()
    
    def init_database(self):
        """Create tables if they don't exist"""
        cursor = self.conn.cursor()
        
        # Students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                department TEXT,
                progress INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # Documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                doc_type TEXT,
                status TEXT,
                data TEXT,
                uploaded_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')
        
        # Roommate Preferences table (Guide Schema)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS roommate_preferences (
                student_id TEXT PRIMARY KEY,
                sleep_schedule TEXT,
                cleanliness INTEGER,
                study_time TEXT,
                noise_tolerance TEXT,
                guest_frequency TEXT,
                interests TEXT,
                social_energy TEXT,
                temperature TEXT,
                morning_routine TEXT,
                lifestyle TEXT,
                updated_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')
        
        # Swipes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS swipes (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                target_id TEXT,
                action TEXT,
                timestamp TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (target_id) REFERENCES students(id)
            )
        ''')
        
        # Mutual Matches table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mutual_matches (
                id TEXT PRIMARY KEY,
                student1_id TEXT,
                student2_id TEXT,
                timestamp TEXT,
                FOREIGN KEY (student1_id) REFERENCES students(id),
                FOREIGN KEY (student2_id) REFERENCES students(id)
            )
        ''')

        # SOS Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sos_alerts (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                location_lat REAL,
                location_lng REAL,
                message TEXT,
                timestamp TEXT,
                status TEXT DEFAULT 'pending',
                responded_by TEXT,
                resolved_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Anonymous Reports table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anonymous_reports (
                id TEXT PRIMARY KEY,
                category TEXT,
                description TEXT,
                photo_url TEXT,
                timestamp TEXT,
                status TEXT DEFAULT 'submitted',
                admin_notes TEXT
            )
        ''')

        # Mental Health Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mental_health_sessions (
                session_id TEXT PRIMARY KEY,
                created_at TEXT,
                last_message_at TEXT,
                message_count INTEGER DEFAULT 0,
                crisis_detected BOOLEAN DEFAULT 0
            )
        ''')
        
        # Onboarding Steps table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS onboarding_steps (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                step_name TEXT,
                completed INTEGER DEFAULT 0,
                completed_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Payments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                amount INTEGER,
                currency TEXT DEFAULT 'INR',
                razorpay_order_id TEXT,
                razorpay_payment_id TEXT,
                razorpay_signature TEXT,
                status TEXT DEFAULT 'pending',
                receipt_url TEXT,
                created_at TEXT,
                paid_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                type TEXT,
                message TEXT,
                status TEXT DEFAULT 'pending',
                sent_at TEXT,
                error TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Calendar Events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calendar_events (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                google_event_id TEXT,
                title TEXT,
                description TEXT,
                start_time TEXT,
                end_time TEXT,
                location TEXT,
                synced_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # OAuth Tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                student_id TEXT PRIMARY KEY,
                provider TEXT,
                access_token TEXT,
                refresh_token TEXT,
                expires_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Nudges table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nudges (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                type TEXT,
                message TEXT,
                scheduled_at TEXT,
                sent_at TEXT,
                channels TEXT,
                is_seen INTEGER DEFAULT 0,
                action_taken INTEGER DEFAULT 0,
                escalated INTEGER DEFAULT 0,
                created_at TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # Deadlines table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deadlines (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                due_date TEXT,
                nudge_intervals TEXT,
                target_batch TEXT,
                created_at TEXT
            )
        ''')
        
        self.conn.commit()
        
        # --- FEATURE 10 FIX: Force Drop to ensure schema update ---
        cursor.execute('DROP TABLE IF EXISTS onboarding_progress')
        cursor.execute('DROP TABLE IF EXISTS onboarding_steps')
        self.conn.commit()

        # Onboarding Steps table (Static definitions)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS onboarding_steps (
                id INTEGER PRIMARY KEY,
                title TEXT,
                description TEXT,
                route TEXT,
                xp_reward INTEGER,
                estimated_minutes INTEGER,
                is_optional INTEGER DEFAULT 0
            )
        ''')

        # Onboarding Progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS onboarding_progress (
                student_id TEXT,
                step_id INTEGER,
                status TEXT DEFAULT 'locked', -- locked, unlocked, completed
                completed_at TEXT,
                xp_awarded INTEGER DEFAULT 0,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (step_id) REFERENCES onboarding_steps(id),
                PRIMARY KEY (student_id, step_id)
            )
        ''')

        self.conn.commit()
        
        # Seed initial steps if empty
        self._seed_onboarding_steps()
        
        # Create demo student if database is empty
        self._create_demo_student()

    def _seed_onboarding_steps(self):
        """Seed the 10 mandatory onboarding steps"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM onboarding_steps")
        if cursor.fetchone()[0] == 0:
            steps = [
                (1, "Document Upload", "Upload Aadhar, Marksheets, and Certificates", "/documents", 50, 10),
                (2, "Fee Payment", "Pay Tuition and Hostel Fees", "/payment", 100, 5),
                (3, "Course Registration", "Select Electives and Specializations", "/acad/register", 75, 15),
                (4, "Hostel Allocation", "Choose Room and Roommates", "/hostel", 80, 20),
                (5, "Timetable Setup", "View and Sync Timetable", "/timetable", 40, 5),
                (6, "LMS Onboarding", "Setup Moodle Account", "/lms", 60, 10),
                (7, "Mentor Matching", "Connect with Faculty Mentor", "/mentor", 70, 15),
                (8, "ID Card Generation", "Upload Photo for Digital ID", "/id-card", 30, 5),
                (9, "Compliance Training", "Anti-Ragging & Safety Quiz", "/compliance", 90, 20),
                (10, "All Done!", "Celebration & Certificate", "/completion", 100, 1)
            ]
            cursor.executemany(
                "INSERT INTO onboarding_steps (id, title, description, route, xp_reward, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?)",
                steps
            )
            self.conn.commit()
    
    def _create_demo_student(self):
        """Create a demo student for testing"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM students")
        count = cursor.fetchone()[0]
        
        if count == 0:
            self.create_student(
                name="Demo Student",
                email="demo@tcet.edu",
                department="Computer Engineering",
                student_id="demo_student"
            )
    
    def create_student(
        self,
        name: str,
        email: str,
        department: str,
        student_id: Optional[str] = None
    ) -> str:
        """Create a new student profile"""
        if not student_id:
            student_id = str(uuid.uuid4())
        
        now = datetime.now().isoformat()
        cursor = self.conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO students (id, name, email, department, progress, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, ?)
            ''', (student_id, name, email, department, now, now))
            
            self.conn.commit()
            
            # Initialize Onboarding Progress (Feature 10)
            self._init_student_progress(student_id)
            
            return student_id
            
            self.conn.commit()
            return student_id
            
        except sqlite3.IntegrityError:
            cursor.execute("SELECT id FROM students WHERE email = ?", (email,))
            existing_id = cursor.fetchone()[0]
            return existing_id
    
    def get_student(self, student_id: str) -> Optional[Dict]:
        """Get student information"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, name, email, department, progress, created_at, updated_at
            FROM students WHERE id = ?
        ''', (student_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
        
        student = {
            "id": row[0], "name": row[1], "email": row[2],
            "department": row[3], "progress": row[4],
            "created_at": row[5], "updated_at": row[6]
        }
        
        cursor.execute('''
            SELECT s.title, p.status 
            FROM onboarding_steps s
            JOIN onboarding_progress p ON s.id = p.step_id
            WHERE p.student_id = ?
            ORDER BY s.id
        ''', (student_id,))
        
        steps = cursor.fetchall()  # [(Title, Status), ...]
        student["completed_steps"] = [s[0] for s in steps if s[1] == 'completed']
        student["pending_steps"] = [s[0] for s in steps if s[1] != 'completed']
        
        return student
    
    def update_document_status(
        self,
        student_id: str,
        doc_type: str,
        status: str,
        data: Optional[Dict] = None
    ):
        """Update document upload status (Fix #3 Upsert behavior)"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE student_id = ? AND doc_type = ?", (student_id, doc_type))
        row = cursor.fetchone()
        
        now = datetime.now().isoformat()
        data_json = json.dumps(data) if data else "{}"
        
        if row:
            cursor.execute('''
                UPDATE documents 
                SET status = ?, data = ?, uploaded_at = ? 
                WHERE id = ?
            ''', (status, data_json, now, row[0]))
        else:
            doc_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO documents (id, student_id, doc_type, status, data, uploaded_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (doc_id, student_id, doc_type, status, data_json, now))
        
        if status == "verified" or status == "validated":
            self.mark_step_complete(student_id, "Upload Documents")
        
        self.conn.commit()

    def get_document_progress(self, student_id: str) -> Dict:
        """Calculate document upload progress for TCET required docs"""
        required_docs = [
            "10th_marksheet", "12th_marksheet", "aadhar_card",
            "passport_photo", "caste_certificate", "domicile_certificate"
        ]
        
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT doc_type FROM documents 
            WHERE student_id = ? AND (status = 'verified' OR status = 'validated')
        ''', (student_id,))
        
        uploaded = [r[0] for r in cursor.fetchall()]
        completed = [d for d in uploaded if d in required_docs]
        pending = [d for d in required_docs if d not in completed]
        
        return {
            "total": len(required_docs),
            "completed": len(completed),
            "percentage": int((len(completed) / len(required_docs)) * 100) if required_docs else 0,
            "pending": pending,
            "completed_list": completed
        }

    def get_student_documents(self, student_id: str) -> List[Dict]:
        """Get all documents for a student"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, doc_type, status, data, uploaded_at 
            FROM documents WHERE student_id = ?
        ''', (student_id,))
        
        rows = cursor.fetchall()
        return [
            {
                "id": r[0], "doc_type": r[1], "status": r[2],
                "data": json.loads(r[3]), "uploaded_at": r[4]
            }
            for r in rows
        ]
    
    def mark_step_complete(self, student_id: str, step_name: str):
        """Mark an onboarding step as complete"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        
        cursor.execute('''
            UPDATE onboarding_steps
            SET completed = 1, completed_at = ?
            WHERE student_id = ? AND step_name = ?
        ''', (now, student_id, step_name))
        
        cursor.execute('SELECT COUNT(*) FROM onboarding_steps WHERE student_id = ?', (student_id,))
        total_steps = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM onboarding_steps WHERE student_id = ? AND completed = 1', (student_id,))
        completed_steps = cursor.fetchone()[0]
        
        progress = int((completed_steps / total_steps) * 100) if total_steps > 0 else 0
        
        cursor.execute('''
            UPDATE students SET progress = ?, updated_at = ? WHERE id = ?
        ''', (progress, now, student_id))
        
        self.conn.commit()
    
    def get_all_students(self) -> List[Dict]:
        """Get all students (for admin dashboard)"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, name, email, department, progress
            FROM students
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        return [
            {"id": r[0], "name": r[1], "email": r[2], "department": r[3], "progress": r[4]}
            for r in rows
        ]

    def save_roommate_preferences(self, student_id: str, preferences: Dict):
        """Save student's roommate preferences (Guide implementation)"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO roommate_preferences
            (student_id, sleep_schedule, cleanliness, study_time, noise_tolerance, 
             guest_frequency, interests, social_energy, temperature, morning_routine, 
             lifestyle, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            student_id,
            preferences.get("sleep_schedule"),
            preferences.get("cleanliness", 5),
            preferences.get("study_time"),
            preferences.get("noise_tolerance"),
            preferences.get("guest_frequency"),
            json.dumps(preferences.get("interests", [])),
            preferences.get("social_energy"),
            preferences.get("temperature"),
            preferences.get("morning_routine"),
            json.dumps(preferences.get("lifestyle", [])),
            now
        ))
        
        self.conn.commit()

    def get_all_students_with_preferences(self) -> List[Dict]:
        """Get all students with their preferences for matching (Guide implementation)"""
        cursor = self.conn.cursor()
        
        cursor.execute('''
            SELECT s.id, s.name, s.department,
                   p.sleep_schedule, p.cleanliness, p.study_time, p.noise_tolerance,
                   p.guest_frequency, p.interests, p.social_energy, p.temperature,
                   p.morning_routine, p.lifestyle
            FROM students s
            LEFT JOIN roommate_preferences p ON s.id = p.student_id
            WHERE p.student_id IS NOT NULL
        ''')
        
        students = []
        for row in cursor.fetchall():
            students.append({
                "id": row[0],
                "name": row[1],
                "department": row[2],
                "sleep_schedule": row[3],
                "cleanliness": row[4],
                "study_time": row[5],
                "noise_tolerance": row[6],
                "guest_frequency": row[7],
                "interests": json.loads(row[8]) if row[8] else [],
                "social_energy": row[9],
                "temperature": row[10],
                "morning_routine": row[11],
                "lifestyle": json.loads(row[12]) if row[12] else []
            })
        
        return students

    def save_swipe(self, student_id: str, target_id: str, action: str):
        """Record a swipe (like/pass)"""
        cursor = self.conn.cursor()
        swipe_id = f"{student_id}_{target_id}"
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO swipes (id, student_id, target_id, action, timestamp)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET action = excluded.action
        ''', (swipe_id, student_id, target_id, action, now))
        
        self.conn.commit()

    def check_mutual_match(self, student_id: str, target_id: str) -> bool:
        """Check if both students liked each other"""
        cursor = self.conn.cursor()
        
        # Check if the other person liked the current student
        cursor.execute('''
            SELECT action FROM swipes 
            WHERE student_id = ? AND target_id = ? AND action = 'like'
        ''', (target_id, student_id))
        
        return cursor.fetchone() is not None

    def create_match(self, student1_id: str, student2_id: str):
        """Create a definitive mutual match"""
        cursor = self.conn.cursor()
        match_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO mutual_matches (id, student1_id, student2_id, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (match_id, student1_id, student2_id, now))
        
        self.conn.commit()

    def get_student_matches(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all mutual matches for a student"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT s.id, s.name, s.department
            FROM students s
            JOIN mutual_matches m ON (s.id = m.student1_id OR s.id = m.student2_id)
            WHERE (m.student1_id = ? OR m.student2_id = ?) AND s.id != ?
        ''', (student_id, student_id, student_id))
        
        rows = cursor.fetchall()
        return [{"id": r[0], "name": r[1], "department": r[2]} for r in rows]

    def save_sos_alert(self, alert_id: str, student_id: str, lat: float, lng: float, message: str):
        """Save student SOS alert"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO sos_alerts (id, student_id, location_lat, location_lng, message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (alert_id, student_id, lat, lng, message, now))
        self.conn.commit()

    def save_anonymous_report(self, report_id: str, category: str, description: str, photo_url: str = None):
        """Save anonymous safety report"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO anonymous_reports (id, category, description, photo_url, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (report_id, category, description, photo_url, now))
        self.conn.commit()

    def create_mental_health_session(self, session_id: str):
        """Initialize a new anonymous mental health session"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO mental_health_sessions (session_id, created_at, last_message_at)
            VALUES (?, ?, ?)
        ''', (session_id, now, now))
        self.conn.commit()

    def update_mental_health_session(self, session_id: str, crisis: bool = False):
        """Update session activity and crisis status"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            UPDATE mental_health_sessions 
            SET last_message_at = ?, 
                message_count = message_count + 1,
                crisis_detected = MAX(crisis_detected, ?)
            WHERE session_id = ?
        ''', (now, 1 if crisis else 0, session_id))
        self.conn.commit()

    # --- Feature 7: Integrations Methods ---

    def save_payment(self, payment_id: str, student_id: str, amount: int, order_id: str):
        """Record a new pending payment"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO payments (id, student_id, amount, razorpay_order_id, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
        ''', (payment_id, student_id, amount, order_id, now))
        self.conn.commit()

    def update_payment_status(self, order_id: str, status: str, payment_id: str = None, signature: str = None):
        """Update payment outcome"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute('''
            UPDATE payments 
            SET status = ?, razorpay_payment_id = ?, razorpay_signature = ?, paid_at = ?
            WHERE razorpay_order_id = ?
        ''', (status, payment_id, signature, now if status == 'success' else None, order_id))
        
        if status == 'success':
            # Identify student_id for step completion
            cursor.execute("SELECT student_id FROM payments WHERE razorpay_order_id = ?", (order_id,))
            student_row = cursor.fetchone()
            if student_row:
                self.mark_step_complete(student_row[0], "Fee Payment")
                
        self.conn.commit()

    def save_notification(self, student_id: str, n_type: str, message: str, status: str = 'sent', error: str = None):
        """Log a sent notification"""
        cursor = self.conn.cursor()
        n_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO notifications (id, student_id, type, message, status, sent_at, error)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (n_id, student_id, n_type, message, status, now, error))
        self.conn.commit()

    def save_oauth_token(self, student_id: str, provider: str, access: str, refresh: str, expires: str):
        """Store OAuth tokens for external services"""
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO oauth_tokens (student_id, provider, access_token, refresh_token, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (student_id, provider, access, refresh, expires))
        self.conn.commit()

    def get_oauth_token(self, student_id: str, provider: str) -> Optional[Dict]:
        """Retrieve OAuth tokens"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT access_token, refresh_token, expires_at 
            FROM oauth_tokens WHERE student_id = ? AND provider = ?
        ''', (student_id, provider))
        row = cursor.fetchone()
        return {"access": row[0], "refresh": row[1], "expires": row[2]} if row else None
    
    # --- Feature 9: Nudges Methods ---

    def create_deadline(self, title: str, due_date: str, intervals: List[int], batch: str = "all", description: str = ""):
        """Create a new deadline for nudges"""
        cursor = self.conn.cursor()
        d_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        intervals_json = json.dumps(intervals)
        
        cursor.execute('''
            INSERT INTO deadlines (id, title, description, due_date, nudge_intervals, target_batch, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (d_id, title, description, due_date, intervals_json, batch, now))
        self.conn.commit()
        return d_id

    def get_upcoming_deadlines(self) -> List[Dict]:
        """Get deadlines that haven't passed yet"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        
        cursor.execute('''
            SELECT id, title, description, due_date, nudge_intervals, target_batch
            FROM deadlines
            WHERE due_date > ?
        ''', (now,))
        
        return [
            {
                "id": r[0], "title": r[1], "description": r[2],
                "due_date": r[3], "nudge_intervals": json.loads(r[4]),
                "target_batch": r[5]
            }
            for r in cursor.fetchall()
        ]

    def create_nudge(self, student_id: str, n_type: str, message: str, channels: List[str], scheduled_at: str):
        """Record a nudge to be sent"""
        cursor = self.conn.cursor()
        n_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        channels_json = json.dumps(channels)
        
        cursor.execute('''
            INSERT INTO nudges (id, student_id, type, message, scheduled_at, sent_at, channels, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (n_id, student_id, n_type, message, scheduled_at, now, channels_json, now))
        self.conn.commit()
        return n_id

    def get_student_nudges(self, student_id: str) -> List[Dict]:
        """Get all nudges for a student"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, type, message, sent_at, is_seen, action_taken, channels
            FROM nudges
            WHERE student_id = ?
            ORDER BY sent_at DESC
        ''', (student_id,))
        
        return [
            {
                "id": r[0], "type": r[1], "message": r[2],
                "sent_at": r[3], "is_seen": bool(r[4]),
                "action_taken": bool(r[5]), "channels": json.loads(r[6])
            }
            for r in cursor.fetchall()
        ]

    def mark_nudge_seen(self, nudge_id: str):
        """Mark nudge as read"""
        cursor = self.conn.cursor()
        cursor.execute('UPDATE nudges SET is_seen = 1 WHERE id = ?', (nudge_id,))
        self.conn.commit()

    def mark_nudge_done(self, nudge_id: str):
        """Mark action as completed for this nudge"""
        cursor = self.conn.cursor()
        cursor.execute('UPDATE nudges SET action_taken = 1 WHERE id = ?', (nudge_id,))
        self.conn.commit()

    # --- Feature 10: Onboarding Methods ---

    def get_onboarding_steps(self) -> List[Dict]:
        """Get all defined onboarding steps"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM onboarding_steps ORDER BY id ASC")
        return [
            {"id": r[0], "title": r[1], "description": r[2], "route": r[3], "xp": r[4], "minutes": r[5]}
            for r in cursor.fetchall()
        ]

    def get_student_progress(self, student_id: str) -> List[Dict]:
        """Get progress for all steps for a student"""
        cursor = self.conn.cursor()
        
        # Ensure progress records exist for this student
        self._init_student_progress(student_id)
        
        query = '''
            SELECT s.id, s.title, s.description, s.route, p.status, p.completed_at, s.xp_reward
            FROM onboarding_steps s
            LEFT JOIN onboarding_progress p ON s.id = p.step_id AND p.student_id = ?
            ORDER BY s.id ASC
        '''
        cursor.execute(query, (student_id,))
        
        return [
            {
                "id": r[0], "title": r[1], "description": r[2], "route": r[3],
                "status": r[4] or 'locked', "completed_at": r[5], "xp": r[6]
            }
            for r in cursor.fetchall()
        ]

    def _init_student_progress(self, student_id: str):
        """Initialize progress records if they don't exist"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM onboarding_progress WHERE student_id = ?", (student_id,))
        if cursor.fetchone()[0] == 0:
            steps = self.get_onboarding_steps()
            # Unlock first step, lock others
            records = [(student_id, s['id'], 'unlocked' if s['id'] == 1 else 'locked') for s in steps]
            cursor.executemany(
                "INSERT INTO onboarding_progress (student_id, step_id, status) VALUES (?, ?, ?)",
                records
            )
            self.conn.commit()

    def mark_step_complete(self, student_id: str, step_id: int):
        """Mark step as complete and unlock next"""
        cursor = self.conn.cursor()
        now = datetime.now().isoformat()
        
        # 1. Mark current step complete
        cursor.execute('''
            UPDATE onboarding_progress 
            SET status = 'completed', completed_at = ?, xp_awarded = (SELECT xp_reward FROM onboarding_steps WHERE id = ?)
            WHERE student_id = ? AND step_id = ?
        ''', (now, step_id, student_id, step_id))
        
        # 2. Unlock next step
        next_step_id = step_id + 1
        cursor.execute('''
            UPDATE onboarding_progress 
            SET status = 'unlocked'
            WHERE student_id = ? AND step_id = ?
        ''', (student_id, next_step_id))
        
        self.conn.commit()
    
    def get_total_xp(self, student_id: str) -> int:
        """Calculate total XP"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT SUM(xp_awarded) FROM onboarding_progress WHERE student_id = ?", (student_id,))
        return cursor.fetchone()[0] or 0

    def __del__(self):
        """Close connection when object is destroyed"""
        try:
            self.conn.close()
        except:
            pass
