"""
Safety Module for CampusCompanion
Handles emergency contacts, SOS logic, and anonymous report formatting.
"""
from typing import Dict, List, Optional
import random
import string
from datetime import datetime

EMERGENCY_CONTACTS = [
    {
        "id": "security",
        "name": "Campus Security",
        "phone": "022-6714-5000",
        "category": "Emergency",
        "icon": "Shield",
        "color": "danger",
        "hours": "24/7"
    },
    {
        "id": "ambulance",
        "name": "Medical Emergency",
        "phone": "108",
        "category": "Medical",
        "icon": "Ambulance",
        "color": "danger",
        "hours": "24/7"
    },
    {
        "id": "counselor",
        "name": "Campus Counselor",
        "phone": "022-6714-5045",
        "category": "Mental Health",
        "icon": "Heart",
        "color": "accent",
        "hours": "9 AM - 6 PM"
    },
    {
        "id": "warden",
        "name": "Hostel Warden",
        "phone": "022-6714-5100",
        "category": "Hostel",
        "icon": "Home",
        "color": "primary",
        "hours": "24/7"
    },
    {
        "id": "anti_ragging",
        "name": "Anti-Ragging Helpline",
        "phone": "1800-180-5522",
        "category": "Legal",
        "icon": "Gavel",
        "color": "warning",
        "hours": "24/7"
    },
    {
        "id": "women_helpline",
        "name": "Women's Safety",
        "phone": "1091",
        "category": "Emergency",
        "icon": "UserCheck",
        "color": "danger",
        "hours": "24/7"
    }
]

HELPLINES = [
    {"name": "National Suicide Prevention", "number": "1800-599-0019", "org": "Kiran"},
    {"name": "Vandrevala Foundation", "number": "1860-2662-345", "org": "Vandrevala"},
    {"name": "iCall (TISS)", "number": "022-25521111", "org": "iCall"},
    {"name": "Campus Counselor", "number": "022-6714-5045", "org": "TCET"}
]

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end it all", "don't want to live", 
    "self harm", "cutting", "giving up", "no point living"
]

def generate_report_id() -> str:
    """Generate a random 6-digit report ID"""
    return ''.join(random.choices(string.digits, k=6))

def detect_crisis(message: str) -> bool:
    """Check if the message contains crisis keywords"""
    msg_lower = message.lower()
    return any(keyword in msg_lower for keyword in CRISIS_KEYWORDS)
