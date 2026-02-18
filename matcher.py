"""
AI Roommate Matching Algorithm
15-factor compatibility scoring system
"""
import math
import json
from typing import Dict, List, Tuple


def calculate_compatibility(student_a: Dict, student_b: Dict) -> Tuple[int, Dict]:
    """
    Calculate compatibility score between two students (0-100)
    Returns: (score, detailed_breakdown)
    """
    score = 0
    breakdown = {
        "strengths": [],
        "challenges": [],
        "tips": []
    }
    
    # Factor 1: Sleep Schedule (15 points)
    if student_a.get("sleep_schedule") == student_b.get("sleep_schedule"):
        score += 15
        breakdown["strengths"].append("Same sleep schedule — less conflict")
    else:
        breakdown["challenges"].append("Different sleep schedules")
        breakdown["tips"].append("Set quiet hours and use sleep masks")
    
    # Factor 2: Cleanliness (12 points)
    clean_map = {"very_organized": 10, "moderate": 6, "relaxed": 2}
    def get_clean_val(s):
        val = s.get("cleanliness", 5)
        if isinstance(val, str) and val in clean_map:
            return clean_map[val]
        try: return int(val)
        except: return 5
        
    clean_diff = abs(get_clean_val(student_a) - get_clean_val(student_b))
    if clean_diff <= 1:
        score += 12
        breakdown["strengths"].append("Similar cleanliness standards")
    elif clean_diff <= 2:
        score += 6
        breakdown["tips"].append("Create a weekly cleaning schedule together")
    else:
        breakdown["challenges"].append("Very different cleanliness expectations")
        breakdown["tips"].append("Discuss cleanliness rules on day one")
    
    # Factor 3: Study Habits (10 points)
    if student_a.get("study_time") == student_b.get("study_time"):
        score += 10
        breakdown["strengths"].append("Both prefer studying at the same time")
    
    # Factor 4: Noise Tolerance (8 points)
    if student_a.get("noise_tolerance") == student_b.get("noise_tolerance"):
        score += 8
        breakdown["strengths"].append("Similar noise tolerance levels")
    else:
        breakdown["tips"].append("Agree on headphone hours for music/videos")
    
    # Factor 5: Guest Policy (7 points)
    if student_a.get("guest_frequency") == student_b.get("guest_frequency"):
        score += 7
        breakdown["strengths"].append("Aligned on how often to have guests over")
    
    # Factor 6: Shared Interests (12 points)
    interests_a = set(student_a.get("interests", []))
    interests_b = set(student_b.get("interests", []))
    shared = interests_a.intersection(interests_b)
    overlap = len(shared) / max(len(interests_a), len(interests_b), 1)
    interest_score = int(overlap * 12)
    score += interest_score
    if shared:
        breakdown["strengths"].append(f"Shared interests: {', '.join(list(shared))}")
    
    # Factor 7: Same Department (6 points)
    if student_a.get("department") == student_b.get("department"):
        score += 6
        breakdown["strengths"].append("Same department — easy to collaborate on projects")
    
    # Factor 8: Introvert/Extrovert (8 points)
    if student_a.get("social_energy") == student_b.get("social_energy"):
        score += 8
        breakdown["strengths"].append("Compatible social energy levels")
    else:
        breakdown["tips"].append("Respect each other's alone time needs")
    
    # Factor 9: Temperature Preference (5 points)
    if student_a.get("temperature") == student_b.get("temperature"):
        score += 5
    else:
        breakdown["challenges"].append("Different temperature preferences")
        breakdown["tips"].append("Compromise on AC/fan settings")
    
    # Factor 10: Morning/Night Routine (7 points)
    if student_a.get("morning_routine") == student_b.get("morning_routine"):
        score += 7
    
    # Factor 11: Lifestyle Choices (10 points)
    lifestyle_a = set(student_a.get("lifestyle", []))
    lifestyle_b = set(student_b.get("lifestyle", []))
    if lifestyle_a == lifestyle_b:
        score += 10
        if "None of these" in lifestyle_a:
            breakdown["strengths"].append("Both have similar healthy habits")
    elif lifestyle_a.intersection(lifestyle_b):
        score += 5
    
    # Normalize to 0-100
    score = min(score, 100)
    
    return score, breakdown


def find_matches(student_id: str, all_students: List[Dict], top_n: int = 10) -> List[Dict]:
    """
    Find top N compatible roommates for a student
    """
    current_student = next((s for s in all_students if s["id"] == student_id), None)
    if not current_student:
        return []
    
    matches = []
    for candidate in all_students:
        if candidate["id"] == student_id:
            continue
        
        score, breakdown = calculate_compatibility(current_student, candidate)
        matches.append({
            "id": candidate["id"],
            "name": candidate["name"],
            "department": candidate["department"],
            "compatibility": score,
            "shared_interests": list(set(current_student.get("interests", [])).intersection(set(candidate.get("interests", [])))),
            "sleep_schedule": candidate.get("sleep_schedule", "Flexible"),
            "cleanliness": candidate.get("cleanliness", 7),
            "strengths": breakdown["strengths"][:3],
            "challenges": breakdown["challenges"][:2],
            "tips": breakdown["tips"][:2],
            "photo": f"https://api.dicebear.com/7.x/avataaars/svg?seed={candidate['id']}" # Added photo for UI consistency
        })
    
    # Sort by compatibility descending
    matches.sort(key=lambda x: x["compatibility"], reverse=True)
    return matches[:top_n]
