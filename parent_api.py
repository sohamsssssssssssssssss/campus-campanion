from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import database as db_module

db = db_module.Database()

router = APIRouter()

# Models
class ParentLoginRequest(BaseModel):
    phone: str

class ParentVerifyRequest(BaseModel):
    phone: str
    otp: str

class SOSRequest(BaseModel):
    student_id: str
    location: str

# Mock Data
MOCK_OTP = "123456"
PARENT_DB = {
    "+919999999999": {
        "id": "parent_001",
        "name": "Mr. Sharma",
        "student_id": "demo_student"
    }
}

# Endpoints

@router.post("/api/parent/send-otp")
async def send_otp(request: ParentLoginRequest):
    """Simulate sending OTP via Twilio WhatsApp"""
    # In production: Use twilio_client.send_whatsapp
    if request.phone in PARENT_DB:
        return {"success": True, "message": "OTP sent to WhatsApp"}
    else:
        # Allow demo login even for unknown numbers for testing
        return {"success": True, "message": "OTP sent (Demo Mode)"}

@router.post("/api/parent/verify-otp")
async def verify_otp(request: ParentVerifyRequest):
    """Verify OTP and return parent/student data"""
    if request.otp == MOCK_OTP:
        # Get linked student
        parent_data = PARENT_DB.get(request.phone, {
            "id": "parent_demo",
            "name": "Demo Parent",
            "student_id": "demo_student"
        })
        
        # Get basic student info
        student = db.get_student(parent_data["student_id"])
        
        return {
            "success": True,
            "token": "mock_jwt_token_parent",
            "parent": parent_data,
            "student": {
                "id": student["id"],
                "name": student["name"],
                "roll_no": student.get("roll_no", "2023-CS-001"),
                "branch": student.get("department", "Engineering")
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")

@router.get("/api/parent/student/{student_id}/overview")
async def get_student_overview(student_id: str):
    """Aggregate data for Parent Dashboard"""
    # Force creation of demo student if not exists (for testing)
    if student_id == "demo_student":
        student = db.get_student("demo_student")
        if not student:
            db.create_student(
                name="Demo Student",
                email="demo@tcet.edu",
                department="Computer Engineering",
                student_id="demo_student"
            )
            student = db.get_student("demo_student")
    else:
        student = db.get_student(student_id)
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Calculate progress from Onboarding System
    # progress = student.get("progress", 0) # OLD LEGACY
    onboarding_data = db.get_student_progress(student_id)
    completed_count = sum(1 for s in onboarding_data if s['status'] == 'completed')
    total_count = len(onboarding_data)
    progress_percentage = int((completed_count / total_count) * 100) if total_count > 0 else 0
    
    # Update student object with calculated progress
    student['progress'] = progress_percentage

    # Mock specific stats not yet in DB
    return {
        "success": True,
        "student": student,
        "stats": {
            "attendance": "87%",
            "fees_due": "₹1,000", # Library deposit only
            "location": "Library (Block B)",
            "last_active": "10 mins ago"
        },
        "notifications": [
            {"id": 1, "type": "info", "message": "Fee payment confirmed for Semester 1", "date": "Today, 10:30 AM"},
            {"id": 2, "type": "alert", "message": "Attendance below 75% in Engineering Mechanics", "date": "Yesterday"},
            {"id": 3, "type": "success", "message": "Hostel Room B-304 allocated", "date": "16 Feb 2024"}
        ]
    }

@router.post("/api/parent/sos")
async def trigger_sos(request: SOSRequest):
    """Trigger emergency SOS alert"""
    # In production: Send high-priority WhatsApp/SMS to admin & security
    print(f"🆘 SOS ALERT! Student {request.student_id} at {request.location}")
    
    return {
        "success": True,
        "message": "🚨 Emergency alert sent to Campus Security and Administrator."
    }
