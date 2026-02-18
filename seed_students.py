import sqlite3
import json
import random
import uuid
from datetime import datetime

# Configuration
DB_PATH = "campuscompanion.db"
DEPARTMENTS = {
    "CS": "Computer Engineering",
    "IT": "Information Technology",
    "MECH": "Mechanical Engineering",
    "CIVIL": "Civil Engineering",
    "EXTC": "Electronics & Telecommunication",
    "AIDS": "AI & Data Science"
}

# Distribution requirements (count for 50 students)
DEPT_DIST = ["CS"] * 20 + ["IT"] * 10 + ["MECH"] * 10 + ["CIVIL"] * 5 + ["EXTC"] * 5
SLEEP_DIST = ["early_bird"] * 15 + ["moderate"] * 25 + ["night_owl"] * 10
CLEAN_DIST = ["very_organized"] * 20 + ["moderate"] * 20 + ["relaxed"] * 10
SOCIAL_DIST = ["introvert"] * 17 + ["ambivert"] * 17 + ["extrovert"] * 16
FOOD_DIST = ["veg"] * 30 + ["non_veg"] * 15 + ["vegan"] * 3 + ["jain"] * 2
DEALBREAKER_DIST = [["smoking"]] * 10 + [["drinking"]] * 8 + [[]] * 32

# Lists provided by user
MALE_NAMES = ["Rahul", "Arjun", "Rohan", "Aditya", "Karan", "Vivek", "Aarav", "Siddharth", "Nikhil", "Akash", "Harsh", "Varun", "Kunal", "Sahil", "Aryan", "Ritesh", "Abhishek", "Arnav", "Ayush", "Dev", "Mayank", "Pranav", "Yash", "Shubham"]
FEMALE_NAMES = ["Priya", "Ananya", "Diya", "Ishita", "Sneha", "Neha", "Riya", "Kavya", "Pooja", "Simran", "Tanya", "Shreya", "Meera", "Anjali", "Aditi", "Shruti", "Nisha", "Divya", "Tanvi", "Kritika", "Kriti", "Sakshi", "Isha", "Avni"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Mehta", "Shah", "Verma", "Reddy", "Nair", "Joshi", "Desai", "Kapoor", "Malhotra", "Iyer", "Rao", "Kulkarni", "Bhat", "Chopra", "Agarwal"]

HOBBIES_LIST = ["sports", "gaming", "music", "reading", "coding", "movies", "travel", "art"]
MUSIC_LIST = ["bollywood", "edm", "rock", "classical", "indie"]
LANGUAGES = ["hindi", "marathi", "english", "gujarati"]

def generate_students(count=50):
    students = []
    
    # Shuffle distributions to ensure randomness while keeping counts exact
    random.shuffle(DEPT_DIST)
    random.shuffle(SLEEP_DIST)
    random.shuffle(CLEAN_DIST)
    random.shuffle(SOCIAL_DIST)
    random.shuffle(FOOD_DIST)
    random.shuffle(DEALBREAKER_DIST)
    
    for i in range(count):
        dept_code = DEPT_DIST[i]
        dept_name = DEPARTMENTS[dept_code]
        
        # Name and Gender
        is_male = random.random() > 0.5
        first_name = random.choice(MALE_NAMES) if is_male else random.choice(FEMALE_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        
        # Basic Info
        student_id = f"TCET2024{dept_code}{str(i+1).zfill(3)}"
        email = f"{first_name.lower()}.{last_name.lower()}{i}@tcetmumbai.in"
        phone = f"+91-{random.randint(70000, 99999)}-{random.randint(10000, 99999)}"
        photo = f"https://i.pravatar.cc/150?img={random.randint(1, 70)}"
        
        # Preferences
        sleep = SLEEP_DIST[i]
        clean = CLEAN_DIST[i]
        # Cleanliness mapping: very_organized(10), moderate(6), relaxed(2)
        clean_score = 10 if clean == "very_organized" else (6 if clean == "moderate" else 2)
        
        social = SOCIAL_DIST[i]
        food = FOOD_DIST[i]
        dealbreakers = DEALBREAKER_DIST[i]
        
        # Hobbies based on sleep schedule (Night owls like gaming/coding)
        hobbies = random.sample(HOBBIES_LIST, random.randint(2, 4))
        if sleep == "night_owl":
            if random.random() > 0.3: hobbies.append(random.choice(["gaming", "coding"]))
            hobbies = list(set(hobbies))
            
        study_time = "night" if sleep == "night_owl" else (random.choice(["morning", "afternoon"]) if sleep == "early_bird" else random.choice(["morning", "afternoon", "night"]))
        
        lifestyle = {
            "food_preference": food,
            "language_preference": random.choice(LANGUAGES),
            "music_taste": random.sample(MUSIC_LIST, random.randint(1, 3)),
            "dealbreakers": dealbreakers,
            "temperature_preference": random.choice(["cold", "warm", "neutral"]),
            "study_environment": random.choice(["silent", "music", "flexible"]),
            "phone": phone, # Added phone to lifestyle since it's not in schema
            "photo": photo
        }
        
        student = {
            "id": student_id,
            "name": full_name,
            "email": email,
            "department": dept_name,
            "preferences": {
                "sleep_schedule": sleep,
                "cleanliness": clean_score,
                "study_time": study_time,
                "noise_tolerance": random.choice(["low", "medium", "high"]),
                "guest_frequency": random.choice(["rarely", "sometimes", "often"]),
                "interests": hobbies,
                "social_energy": social,
                "temperature": lifestyle["temperature_preference"],
                "morning_routine": "early_morning" if sleep == "early_bird" else ("late_night" if sleep == "night_owl" else "flexible"),
                "lifestyle": lifestyle
            }
        }
        students.append(student)
    
    return students

def seed_database():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    students_data = generate_students(50)
    now = datetime.now().isoformat()
    
    inserted_count = 0
    try:
        for s in students_data:
            # 1. Insert Student
            cursor.execute('''
                INSERT OR IGNORE INTO students (id, name, email, department, progress, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, ?)
            ''', (s["id"], s["name"], s["email"], s["department"], now, now))
            
            if cursor.rowcount > 0:
                # 2. Insert Preferences
                p = s["preferences"]
                cursor.execute('''
                    INSERT OR REPLACE INTO roommate_preferences
                    (student_id, sleep_schedule, cleanliness, study_time, noise_tolerance, 
                     guest_frequency, interests, social_energy, temperature, morning_routine, 
                     lifestyle, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    s["id"],
                    p["sleep_schedule"],
                    p["cleanliness"],
                    p["study_time"],
                    p["noise_tolerance"],
                    p["guest_frequency"],
                    json.dumps(p["interests"]),
                    p["social_energy"],
                    p["temperature"],
                    p["morning_routine"],
                    json.dumps(p["lifestyle"]),
                    now
                ))
                inserted_count += 1
        
        conn.commit()
        print(f"✅ Successfully seeded {inserted_count} new student profiles.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during seeding: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()
