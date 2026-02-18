from database import Database
import json
import uuid

def seed_roommate_data():
    db = Database()
    
    students = [
        {
            "id": "rahul_001",
            "name": "Rahul Sharma",
            "email": "rahul@tcet.edu",
            "department": "Computer Engineering",
            "prefs": {
                "sleep_schedule": "night_owl",
                "cleanliness": "moderate",
                "study_time": "night",
                "social_energy": "extrovert",
                "noise_tolerance": "high",
                "guest_frequency": "sometimes",
                "morning_routine": "slow",
                "interests": ["gaming", "coding", "music"],
                "temperature": "cold",
                "lifestyle": []
            }
        },
        {
            "id": "priya_001",
            "name": "Priya Iyer",
            "email": "priya@tcet.edu",
            "department": "IT",
            "prefs": {
                "sleep_schedule": "early_bird",
                "cleanliness": "very_organized",
                "study_time": "day",
                "social_energy": "introvert",
                "noise_tolerance": "low",
                "guest_frequency": "rarely",
                "morning_routine": "productive",
                "interests": ["reading", "art"],
                "temperature": "warm",
                "lifestyle": []
            }
        },
        {
            "id": "aniket_001",
            "name": "Aniket Deshmukh",
            "email": "aniket@tcet.edu",
            "department": "Mechanical Engineering",
            "prefs": {
                "sleep_schedule": "moderate",
                "cleanliness": "moderate",
                "study_time": "flexible",
                "social_energy": "ambivert",
                "noise_tolerance": "medium",
                "guest_frequency": "often",
                "morning_routine": "productive",
                "interests": ["sports", "travel"],
                "temperature": "flexible",
                "lifestyle": ["smoking"]
            }
        },
        {
            "id": "sara_001",
            "name": "Sara Khan",
            "email": "sara@tcet.edu",
            "department": "Civil Engineering",
            "prefs": {
                "sleep_schedule": "night_owl",
                "cleanliness": "very_organized",
                "study_time": "night",
                "social_energy": "extrovert",
                "noise_tolerance": "medium",
                "guest_frequency": "sometimes",
                "morning_routine": "none",
                "interests": ["coding", "movies", "travel"],
                "temperature": "cold",
                "lifestyle": []
            }
        },
        {
            "id": "vikram_001",
            "name": "Vikram Singh",
            "email": "vikram@tcet.edu",
            "department": "Computer Science",
            "prefs": {
                "sleep_schedule": "moderate",
                "cleanliness": "relaxed",
                "study_time": "flexible",
                "social_energy": "extrovert",
                "noise_tolerance": "high",
                "guest_frequency": "often",
                "morning_routine": "none",
                "interests": ["gaming", "sports"],
                "temperature": "cold",
                "lifestyle": ["smoking", "drinking"]
            }
        }
    ]

    for s in students:
        print(f"Seeding {s['name']}...")
        db.create_student(s['name'], s['email'], s['department'], s['id'])
        db.save_roommate_preferences(s['id'], s['prefs'])
    
    print("✅ Seeding complete!")

if __name__ == "__main__":
    seed_roommate_data()
