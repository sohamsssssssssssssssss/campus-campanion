from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict
import database as db_module
import time

router = APIRouter()
db = db_module.Database()

class CompleteStepRequest(BaseModel):
    step_id: int
    data: Optional[Dict] = {}

@router.get("/api/onboarding/student/{student_id}")
async def get_progress(student_id: str):
    """Get full onboarding progress for a student"""
    steps = db.get_student_progress(student_id)
    total_xp = db.get_total_xp(student_id)
    
    # Calculate overall percentage
    completed_count = sum(1 for s in steps if s['status'] == 'completed')
    total_count = len(steps)
    percentage = int((completed_count / total_count) * 100) if total_count > 0 else 0
    
    # Determine current active step
    current_step = next((s for s in steps if s['status'] == 'unlocked'), None)
    
    return {
        "success": True,
        "steps": steps,
        "progress": {
            "percentage": percentage,
            "completed": completed_count,
            "total": total_count,
            "total_xp": total_xp,
            "current_step": current_step
        }
    }

@router.post("/api/onboarding/step/complete")
async def complete_step(request: CompleteStepRequest):
    """Mark a step as complete and unlock the next one"""
    # In a real app, we'd validate the data based on step_id
    # e.g., if step_id=1, check if documents were uploaded
    
    # For demo, we assume the frontend has done the validation/action
    # e.g. Payment flow handles payment validation, then calls this
    
    db.mark_step_complete("demo_student", request.step_id)
    
    # Fetch updated progress to return
    progress = await get_progress("demo_student")
    
    # Get details of the step just completed for the response
    completed_step = next((s for s in progress['steps'] if s['id'] == request.step_id), None)
    
    return {
        "success": True,
        "message": f"Step {request.step_id} completed!",
        "xp_awarded": completed_step['xp'] if completed_step else 0,
        "next_step": progress['progress']['current_step'] 
    }

@router.post("/api/onboarding/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Mock document upload for Step 1"""
    # Simulate processing time
    time.sleep(1)
    return {"success": True, "filename": file.filename, "status": "verified"}

