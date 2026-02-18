from roommate_matcher import RoommateMatcher
import json

def test_matcher():
    matcher = RoommateMatcher()
    
    # 1. Test Data (Two Night Owls who love gaming)
    student_a = {
        "id": "a",
        "name": "Alice",
        "sleep_schedule": "night_owl",
        "cleanliness": "very_organized",
        "study_environment": "music",
        "social_preference": "extrovert",
        "noise_tolerance": "high",
        "guest_frequency": "sometimes",
        "morning_night": "night",
        "hobbies": ["gaming", "coding", "music"],
        "food_preference": "non_veg",
        "temperature": "ac_cold",
        "dealbreakers": []
    }
    
    student_b = {
        "id": "b",
        "name": "Bob",
        "sleep_schedule": "night_owl",
        "cleanliness": "very_organized",
        "study_environment": "flexible",
        "social_preference": "extrovert",
        "noise_tolerance": "medium",
        "guest_frequency": "rarely",
        "morning_night": "night",
        "hobbies": ["gaming", "reading"],
        "food_preference": "veg",
        "temperature": "ac_cold",
        "dealbreakers": []
    }
    
    # 2. Test Data (Deal Breaker Mismatch)
    student_c = {
        "id": "c",
        "name": "Charlie",
        "dealbreakers": ["smoking"]
    }

    print("--- 🧪 Testing AI Roommate Matcher Core ---")
    
    # Test Compatibility (High)
    score_ab = matcher.calculate_compatibility(student_a, student_b)
    print(f"✅ Alice & Bob Score: {score_ab}% (Expected: ~80% - 90%)")
    
    # Test Deal Breakers
    score_ac = matcher.calculate_compatibility(student_a, student_c)
    print(f"✅ Alice & Charlie (Dealbreaker) Score: {score_ac}% (Expected: 0.0%)")
    
    # Test AI Explanation
    print("\n--- 🤖 Testing AI Explanation ---")
    if score_ab > 0:
        explanation = matcher.explain_compatibility(student_a, student_b, score_ab)
        print(f"Explanation for Alice & Bob:\n\"{explanation}\"")

if __name__ == "__main__":
    test_matcher()
