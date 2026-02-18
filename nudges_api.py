from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uuid
import json
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import database as db_module

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nudges")

db = db_module.Database()
router = APIRouter()

# Models
class DeadlineRequest(BaseModel):
    title: str
    due_date: str # ISO format
    description: str = ""
    intervals: List[int] = [168, 72, 24, 6, 1] # Hours before
    batch: str = "all"

class NudgeActionRequest(BaseModel):
    nudge_id: str

# Scheduler
scheduler = BackgroundScheduler()

def mock_send_notification(student: Dict, message: str, channels: List[str]):
    """Simulate sending notifications via various channels"""
    for channel in channels:
        if channel == "whatsapp":
            logger.info(f"📱 [WhatsApp] To {student['email']}: {message}")
            # In prod: twilio_client.send_whatsapp(...)
        elif channel == "email":
            logger.info(f"📧 [Email] To {student['email']}: {message}")
            # In prod: sendgrid_client.send_email(...)
        elif channel == "in_app":
            logger.info(f"🔔 [In-App] To {student['email']}: {message}")

def check_and_fire_nudges():
    """Core logic to check deadlines and fire nudges"""
    logger.info("⏰ Running Nudge Scheduler...")
    
    # 1. Check Smart Timing (Don't disturb between 10 PM and 7 AM)
    current_hour = datetime.now().hour
    if current_hour >= 22 or current_hour < 7:
        logger.info("🌙 Night time. Skipping nudges.")
        return

    upcoming_deadlines = db.get_upcoming_deadlines()
    students = db.get_all_students() 
    # Optimization: In real app, filter students by batch
    
    now = datetime.now()

    for deadline in upcoming_deadlines:
        due_date = datetime.fromisoformat(deadline['due_date'].replace('Z', ''))
        remaining = due_date - now
        remaining_hours = remaining.total_seconds() / 3600
        
        # Determine which interval bucket we are in
        # We want to fire the nudge for the *check* that we just passed
        # e.g. if 70 hours remaining, and intervals are [72, 24], we passed 72.
        
        target_interval = None
        for interval in sorted(deadline['nudge_intervals']):
            # If we are within the window of (Interval) to (Interval - 1 hour)
            # Or just simple logic: finds the smallest interval that is >= remaining_hours
            if remaining_hours <= interval and remaining_hours > (interval - 1.1):
                target_interval = interval
                break
        
        if not target_interval:
            continue
            
        logger.info(f"🔍 Checking deadline '{deadline['title']}' for {target_interval}h mark.")

        for student in students:
            # Check if already sent
            # This is a bit inefficient for MVP, but works for mock DB
            existing_nudges = db.get_student_nudges(student['id'])
            # Create a unique key for this specific nudge instance
            nudge_key = f"{deadline['id']}_{target_interval}h"
            
            already_sent = any(n['type'] == nudge_key for n in existing_nudges)
            
            if not already_sent:
                # Fire Nudge!
                msg = f"⏳ {deadline['title']} is due in {int(remaining_hours)} hours! {deadline['description']}"
                channels = ["in_app", "whatsapp"] 
                
                # Escalation logic: If < 24 hours, notify parent (simulate)
                if remaining_hours < 24:
                     msg += " (Parent notified)"
                     
                mock_send_notification(student, msg, channels)
                
                db.create_nudge(
                    student_id=student['id'],
                    n_type=nudge_key,
                    message=msg,
                    channels=channels,
                    scheduled_at=now.isoformat()
                )

# API Endpoints

@router.on_event("startup")
def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(check_and_fire_nudges, 'interval', minutes=60)
        scheduler.start()
        logger.info("🚀 Nudge Scheduler Started (Hourly)")

@router.post("/api/nudges/schedule")
async def schedule_deadline(request: DeadlineRequest):
    """Admin: Schedule a new deadline"""
    d_id = db.create_deadline(
        title=request.title,
        due_date=request.due_date,
        intervals=request.intervals,
        batch=request.batch,
        description=request.description
    )
    return {"success": True, "deadline_id": d_id, "message": "Deadline scheduled"}

@router.get("/api/nudges/student/{student_id}")
async def get_my_nudges(student_id: str):
    """Student: Get all my nudges"""
    nudges = db.get_student_nudges(student_id)
    # Mock some initial nudges if empty for demo
    if not nudges and student_id == "demo_student":
        seed_demo_nudges(student_id)
        nudges = db.get_student_nudges(student_id)
        
    unread_count = sum(1 for n in nudges if not n['is_seen'])
    return {"success": True, "nudges": nudges, "unread_count": unread_count}

@router.post("/api/nudges/seen")
async def mark_seen(request: NudgeActionRequest):
    db.mark_nudge_seen(request.nudge_id)
    return {"success": True}

@router.post("/api/nudges/done")
async def mark_done(request: NudgeActionRequest):
    db.mark_nudge_done(request.nudge_id)
    return {"success": True}

@router.post("/api/nudges/trigger-test")
async def trigger_test_run(background_tasks: BackgroundTasks):
    """Dev: Force run scheduler now"""
    background_tasks.add_task(check_and_fire_nudges)
    return {"success": True, "message": "Scheduler triggered in background"}

def seed_demo_nudges(student_id: str):
    """Seed some fake nudges for the demo experience"""
    now = datetime.now()
    deadlines = [
        ("Fee Payment", "Tuition fee for Semester 1 is pending.", 3),
        ("Document Verification", "10th Marksheet upload is rejected. Please re-upload.", 24),
    ]
    
    for title, desc, hours_ago in deadlines:
        db.create_nudge(
            student_id=student_id,
            n_type="demo_seed",
            message=f"⚠️ {title}: {desc}",
            channels=["in_app", "whatsapp"],
            scheduled_at=(now - timedelta(hours=hours_ago)).isoformat()
        )
