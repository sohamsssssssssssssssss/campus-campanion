import numpy as np
import requests
import json
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any, Optional

class RoommateMatcher:
    """
    ML-powered Roommate Matching Engine
    Uses cosine similarity for compatibility and Local LLM for explanations.
    """
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model = "gemma3:4b" # Using Gemma 3 for faster explanations
        
        # Weights for different factors (Total should ideally be 1.0/100%)
        # Note: Weights are handled by multiplying features by weight before similarity
        self.weights = {
            "sleep_schedule": 0.15,
            "cleanliness": 0.15,
            "study_environment": 0.12,
            "social_preference": 0.10,
            "noise_tolerance": 0.10,
            "guest_frequency": 0.08,
            "morning_night": 0.07,
            "academic_interest": 0.06,
            "hobbies": 0.05,
            "food_preference": 0.04,
            "language": 0.03,
            "temperature": 0.02,
            "study_time": 0.02,
            "music_taste": 0.01
        }

    def encode_preferences(self, prefs: Dict[str, Any]) -> np.ndarray:
        """Convert preferences dict into a weighted feature vector"""
        features = []
        
        # 1. Sleep Schedule (Range 0-2)
        sleep_map = {"early_bird": 0, "moderate": 1, "night_owl": 2}
        features.append(sleep_map.get(prefs.get("sleep_schedule"), 1) * self.weights["sleep_schedule"])
        
        # 2. Cleanliness (Range 0-2)
        clean_map = {"very_organized": 2, "moderate": 1, "relaxed": 0}
        features.append(clean_map.get(prefs.get("cleanliness"), 1) * self.weights["cleanliness"])
        
        # 3. Study Environment (Range 0-2)
        study_map = {"silent": 0, "music": 1, "flexible": 2}
        features.append(study_map.get(prefs.get("study_environment"), 1) * self.weights["study_environment"])
        
        # 4. Social Preference (Range 0-2)
        social_map = {"introvert": 0, "ambivert": 1, "extrovert": 2}
        features.append(social_map.get(prefs.get("social_preference"), 1) * self.weights["social_preference"])
        
        # 5. Noise Tolerance (Range 0-2)
        noise_map = {"low": 0, "medium": 1, "high": 2}
        features.append(noise_map.get(prefs.get("noise_tolerance"), 1) * self.weights["noise_tolerance"])
        
        # 6. Guest Frequency (Range 0-2)
        guest_map = {"rarely": 0, "sometimes": 1, "often": 2}
        features.append(guest_map.get(prefs.get("guest_frequency"), 1) * self.weights["guest_frequency"])
        
        # 7. Morning/Night Routine (Range 0-2)
        routine_map = {"morning": 0, "flexible": 1, "night": 2}
        features.append(routine_map.get(prefs.get("morning_night"), 1) * self.weights["morning_night"])
        
        # 8. Academic Interest (Same branch vs Different)
        # In this simple encoding, we'll just use a placeholder. Branch matching is better handled in logic
        features.append(0.5 * self.weights["academic_interest"])
        
        # 9. Hobbies (Match count / Total categories)
        all_hobbies = ["sports", "gaming", "music", "reading", "coding", "movies", "travel", "art"]
        hobby_vec = [1 if h in prefs.get("hobbies", []) else 0 for h in all_hobbies]
        features.extend([v * self.weights["hobbies"] for v in hobby_vec])
        
        # 10. Food (Simplified similarity)
        food_map = {"veg": 0, "jain": 0, "non_veg": 1, "vegan": 2}
        features.append(food_map.get(prefs.get("food_preference"), 0) * self.weights["food_preference"])

        # 11. Temperature
        temp_map = {"ac_cold": 0, "warm": 1, "flexible": 2}
        features.append(temp_map.get(prefs.get("temperature"), 2) * self.weights["temperature"])

        return np.array(features)

    def calculate_compatibility(self, student1: Dict[str, Any], student2: Dict[str, Any]) -> float:
        """Calculate compatibility score (0-100) between two students"""
        
        # Deal Breakers Check (Smoking/Drinking)
        db1 = student1.get("dealbreakers", [])
        db2 = student2.get("dealbreakers", [])
        if set(db1) != set(db2):
            return 0.0 # Strict mismatch on lifestyle dealbreakers
        
        # Encode features
        vec1 = self.encode_preferences(student1)
        vec2 = self.encode_preferences(student2)
        
        # Reshape for scikit-learn
        vec1 = vec1.reshape(1, -1)
        vec2 = vec2.reshape(1, -1)
        
        # Cosine Similarity
        similarity = cosine_similarity(vec1, vec2)[0][0]
        
        # Normalize to 0-100% and round
        score = round((similarity * 100), 1)
        return score

    def explain_compatibility(self, s1: Dict[str, Any], s2: Dict[str, Any], score: float) -> str:
        """Generate AI explanation for why these two are a match"""
        
        matching = []
        if s1.get("sleep_schedule") == s2.get("sleep_schedule"):
            matching.append(f"shared sleep schedule ({s1['sleep_schedule'].replace('_', ' ')})")
        
        common_hobbies = set(s1.get("hobbies", [])) & set(s2.get("hobbies", []))
        if common_hobbies:
            matching.append(f"common interests in {', '.join(list(common_hobbies)[:2])}")
            
        if s1.get("cleanliness") == s2.get("cleanliness"):
            matching.append(f"similar cleaning habits")
            
        # Lifestyle habits
        db1 = set(s1.get("dealbreakers", []))
        if not db1 or db1 == {'none'}:
            matching.append("shared smoke-free/sober lifestyle")
        elif 'smoking' in db1 and 'drinking' in db1:
            matching.append("similar social lifestyle")
        elif 'smoking' in db1:
            matching.append("shared smoking preference")
        elif 'drinking' in db1:
            matching.append("shared drinking preference")

        prompt = f"""
        Generate a very short, friendly 2-sentence explanation for a roommate match.
        Match Score: {score}%
        Matches: {', '.join(matching)}
        Student 1 Name: {s1.get('name', 'You')}
        Student 2 Name: {s2.get('name', 'Roommate')}
        
        Example: "You're both night owls who love coding! Your shared study habits and mutual interest in gaming make you highly compatible."
        Return ONLY the explanation text. No introductions.
        """
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.7}
                },
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
        except:
            pass
            
        # Fallback if LLM fails
        return f"You share a {score}% compatibility score with matching habits in {', '.join(matching[:2])}!"

    def get_matches(self, current_student: Dict[str, Any], all_students: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find and rank matches for a student"""
        matches = []
        
        for other in all_students:
            if other.get("id") == current_student.get("id"):
                continue
                
            score = self.calculate_compatibility(current_student, other)
            if score > 50: # Only show decent matches
                matches.append({
                    "student": {
                        "id": other["id"],
                        "name": other["name"],
                        "department": other.get("department", "Engineering"),
                        "photo": f"https://api.dicebear.com/7.x/avataaars/svg?seed={other['id']}"
                    },
                    "compatibility": score,
                    "summary": self.explain_compatibility(current_student, other, score),
                    "matching_factors": [m.split(' (')[0] for m in self.explain_compatibility(current_student, other, score).split(' habits')[0].split(', ')] # Mocking for specific tags
                })
        
        # Sort by compatibility
        matches.sort(key=lambda x: x["compatibility"], reverse=True)
        return matches[:10] # Top 10 matches
