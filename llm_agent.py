"""
Local LLM Agent — RAG-augmented, context-aware AI chatbot
Uses Ollama for local inference with ChromaDB knowledge retrieval
"""

import requests
import json
import re
from typing import Dict, Optional, List

from rag_engine import RAGEngine
from safety import detect_crisis, HELPLINES
from session_manager import SessionManager


# Supported languages for text responses
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "gu": "Gujarati",
    "ml": "Malayalam",
    "pa": "Punjabi",
}

TRANSLATIONS = {
    "escalation": {
        "en": "I want to make sure you get the best help, {name}. Let me connect you with our admin team. [Click here to chat with admin →]",
        "hi": "{name}, मैं यह सुनिश्चित करना चाहता हूँ कि आपको सबसे अच्छी मदद मिले। मुझे आपको हमारी एडमिन टीम से जोड़ने दें। [एडमिन के साथ चैट करने के लिए यहाँ क्लिक करें →]",
        "mr": "{name}, मला खात्री करायची आहे की तुम्हाला सर्वोत्तम मदत मिळेल. मला तुम्हाला आमच्या ॲडमिन टीमशी जोडू द्या. [ॲडमिनशी चॅट करण्यासाठी येथे क्लिक करा →]",
        "ta": "{name}, உங்களுக்கு சிறந்த உதவி கிடைப்பதை நான் உறுதி செய்ய விரும்புகிறேன். உங்களை எங்கள் நிர்வாகக் குழுவுடன் இணைக்கிறேன். [நிர்வாகத்துடன் அரட்டையடிக்க இங்கே கிளிக் செய்யவும் →]",
        "te": "{name}, మీకు ఉత్తమమైన సహాయం అందుతుందని నేను నిర్ధారించుకోవాలనుకుంటున్నాను. మిమ్మల్ని మా అడ్మిన్ టీమ్‌తో కనెక్ట్ చేయనివ్వండి. [అడ్మిన్‌తో చాట్ చేయడానికి ఇక్కడ క్లిక్ చేయండి →]",
        "kn": "{name}, ನಿಮಗೆ ಉತ್ತಮ ಸಹಾಯ ಸಿಗುವಂತೆ ನಾನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೇನೆ. ನಮ್ಮ ನಿರ್ವಾಹಕ ತಂಡದೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ನನಗೆ ಅನುಮತಿ ನೀಡಿ. [ನಿರ್ವಾಹಕರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ →]",
        "bn": "{name}, আমি নিশ্চিত করতে চাই যে আপনি সেরা সাহায্য পাচ্ছেন। আমাকে আপনাকে আমাদের অ্যাডमिन টিমের সাথে সংযোগ করতে দিন। [অ্যাডমিনের সাথে চ্যাট করতে এখানে ক্লিক করুন →]",
        "gu": "{name}, હું એ સુનિશ્ચિત કરવા માંગુ છું કે તમને શ્રેષ્ઠ મદદ મળે. મને તમને અમારી એડમિન ટીમ સાથે જોડવા દો. [એડમિન સાથે ચેટ કરવા માટે અહીં ક્લિક કરો →]",
        "ml": "{name}, നിങ്ങൾക്ക് മികച്ച സഹായം ലഭിക്കുന്നുണ്ടെന്ന് എനിക്ക് ഉറപ്പാക്കണം. ഞങ്ങളുടെ അഡ്മിൻ ടീമുമായി നിങ്ങളെ ബന്ധിപ്പിക്കാൻ എന്നെ അനുവദിക്കൂ. [അഡ്മിനുമായി ചാറ്റ് ചെയ്യാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക →]",
        "pa": "ਮੈਂ ਇਹ ਯਕੀਨੀ ਬਣਾਉਣਾ ਚਾਹੁੰਦਾ ਹਾਂ ਕਿ ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵਧੀਆ ਮਦਦ ਮਿਲੇ। ਮੈਨੂੰ ਤੁਹਾਨੂੰ ਸਾਡੀ ਐਡਮਿਨ ਟੀਮ ਨਾਲ ਜੋੜਨ ਦਿਓ। [ਐਡਮਿਨ ਨਾਲ ਗੱਲਬਾਤ ਕਰਨ ਲਈ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ →]"
    },
    "offline": {
        "en": "I'm currently in offline mode and can't answer that right now.",
        "hi": "मैं अभी ऑफ़लाइन मोड में हूँ और अभी इसका जवाब नहीं दे सकता।",
        "mr": "मी सध्या ऑफलाइन मोडमध्ये आहे आणि आता त्याचे उत्तर देऊ शकत नाही.",
        "ta": "நான் தற்போது ஆஃப்லைன் பயன்முறையில் உள்ளேன், இப்போது அதற்குப் பதிலளிக்க முடியாது.",
        "te": "నేను ప్రస్తుతం ఆఫ్‌లైన్ మోడ్‌లో ఉన్నాను మరియు ఇప్పుడు దానికి సమాధానం చెప్పలేను.",
        "kn": "ನಾನು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ ಮತ್ತು ಈಗ ಅದಕ್ಕೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
        "bn": "আমি বর্তমানে অফলাইন মোডে আছি এবং এখন সেটির ಉತ್ತರ দিতে পারছি না।",
        "gu": "હું અત્યારે ઓફલાઇન મોડમાં છું અને અત્યારે તેનો જવાબ આપી શકતો નથી.",
        "ml": "ഞാൻ ഇപ്പോൾ ഓഫ്‌ലൈൻ മോഡിലാണ്, ഇപ്പോൾ അതിന് മറുപടി നൽകാൻ കഴിയില്ല.",
        "pa": "ਮੈਂ ਇਸ ਵੇਲੇ ਆਫਲਾਈਨ ਮੋਡ ਵਿੱਚ ਹਾਂ ਅਤੇ ਹੁਣੇ ਇਸਦਾ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ।"
    }
}

# Language detection keywords (simple heuristic)
LANGUAGE_HINTS = {
    "hi": ["kya", "kaise", "mujhe", "hai", "kab", "kitna", "batao", "chahiye", "hota", "mein"],
    "mr": ["kay", "kasa", "mala", "aahe", "kiti", "sanga", "pahije", "hota"],
}


class LocalLLMAgent:
    """
    Local AI agent powered by Ollama with RAG and session memory.
    - Retrieves relevant knowledge from ChromaDB before responding
    - Maintains conversation context per student session
    - Supports multi-language responses
    - Routes to domain-specific handlers
    """

    def __init__(self, model: str = "gemma3:4b", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.rag = RAGEngine()
        self.sessions = SessionManager()

        self.system_prompt = """You are CampusCompanion AI, an intelligent onboarding assistant for TCET Mumbai students.

CORE IDENTITY:
- Friendly but professional tone
- Specifically trained on TCET onboarding workflows
- Always provide actionable next steps
- Use retrieved context strictly - never hallucinate

RESPONSE FORMAT:
1. Direct answer to the question
2. Relevant context from college policies
3. Clear next action (e.g., "Upload your documents here →")
4. Offer additional help

RULES:
- If uncertain, say: "Let me connect you with our admin team for this specific query."
- Use student's name when available
- Reference specific deadlines, departments, and TCET-specific details
- Tag responses with categories: general, documents, fees, hostel, courses, etc.
- Keep answers concise (2-4 sentences max)

FORBIDDEN:
- Generic university advice
- Information not in retrieved context
- Uncertain or vague answers
"""

    def chat(self, message: str, student_id: str = "demo_student",
             context: Optional[Dict] = None, language: str = "en") -> Dict:
        """
        Process a chat message with RAG retrieval and session memory.
        """
        # 1. Store user message in session
        self.sessions.add_message(student_id, "user", message)

        # 2. Detect intent for smart routing
        intent = self.extract_intent(message)

        # 3. RAG retrieval — find relevant knowledge
        rag_results = self.rag.search(message, top_k=5)
        knowledge_context = self._format_rag_context(rag_results)

        # 4. Smart Fallback Detection
        if self._should_fallback(message, rag_results, intent):
            name = context.get('name', 'Student') if context else 'Student'
            
            # Use translation if available, otherwise fallback to English
            fallback_template = TRANSLATIONS["escalation"].get(language, TRANSLATIONS["escalation"]["en"])
            response_text = fallback_template.format(name=name)
            
            ai_msg_id = self.sessions.add_message(student_id, "ai", response_text)
            return {
                "response": response_text,
                "message_id": ai_msg_id,
                "sources": ["human_support"],
                "intent": intent,
                "fallback": True,
                "admin_escalation": True
            }

        # 5. Build conversation history
        conversation_history = self.sessions.get_context_window(student_id, max_turns=5)

        # 6. Build the full prompt
        full_prompt = self._build_prompt(
            message=message,
            student_context=context,
            knowledge_context=knowledge_context,
            conversation_history=conversation_history,
            language=language,
        )

        # 7. Call Ollama with optimized config
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "system": self.system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Fast and consistent
                        "top_p": 0.9,
                        "num_predict": 100,  # Force short responses (Fix #4)
                        "num_ctx": 2048,     # Optimized context window
                        "stop": ["\n\n", "4.", "5."], # Stop after 3 points (Fix #4)
                    },
                },
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                ai_text = result.get("response", "Internal error.").strip()
                ai_text = self._deduplicate_response(ai_text)
            else:
                ai_text = self._fallback_response(intent, language)

        except requests.exceptions.ConnectionError:
            ai_text = self._get_offline_response(language)
        except Exception as e:
            print(f"LLM error: {e}")
            ai_text = self._fallback_response(intent, language)

        # 8. Store AI response in session
        ai_msg_id = self.sessions.add_message(student_id, "ai", ai_text)

        # 9. Extract sources
        sources = [r["category"] for r in rag_results if r.get("score", 0) > 0.4]

        return {
            "response": ai_text,
            "message_id": ai_msg_id,
            "sources": list(set(sources)),
            "intent": intent,
        }

    def _should_fallback(self, query: str, rag_results: List[Dict], intent: str) -> bool:
        """Decide if query needs human support."""
        # Only fallback if RAG returns nothing at all
        if not rag_results:
            return True

        # Sensitive topics & Complaints
        complaints = ['complaint', 'issue', 'problem', 'wrong', 'rejected', 'error', 'stuck', 'missing', 'lost']
        if any(word in query.lower() for word in complaints):
            return True

        return False

    def _build_prompt(self, message: str, student_context: Optional[Dict],
                      knowledge_context: str, conversation_history: List[Dict],
                      language: str) -> str:
        """Build the full prompt with deep personalization as per FIX #1."""
        name = student_context.get('name', 'Student') if student_context else 'Student'
        dept = student_context.get('department', 'Information Technology') if student_context else 'Information Technology'
        year = student_context.get('year', 'First Year') if student_context else 'First Year'
        progress = student_context.get('progress', 0) if student_context else 0

        parts = []

        # Personalized Identity & Rules (FIX #1)
        parts.append(f"""You are CampusCompanion AI for TCET Mumbai.

STUDENT CONTEXT:
- Name: {name}
- Department: {dept}
- Year: {year}
- Progress: {progress}%

RULES:
- ALWAYS greet with student's name: "Hi {name}! 👋"
- Reference their department when relevant
- Keep responses to 2-3 sentences MAX
- One clear next action
- No repetition

You help with: documents, fees, courses, hostel, timetable.""")

        # Conversation History Section (Fix #3)
        if conversation_history:
            history_str = "RECENT CONVERSATION:\n"
            for msg in conversation_history:
                role = "Student" if msg["role"] == "user" else "AI"
                history_str += f"{role}: {msg['content']}\n"
            parts.append(history_str)

        # Knowledge Context Section
        if knowledge_context:
            parts.append(f"KNOWLEDGE CONTEXT:\n{knowledge_context}")

        # Language Instruction
        if language != "en" and language in SUPPORTED_LANGUAGES:
            parts.append(f"IMPORTANT: Respond in {SUPPORTED_LANGUAGES[language]} language.")

        # Current Question (Fix #3)
        parts.append(f"STUDENT QUESTION: {message}\n\nANSWER (2-3 sentences, one next action):")

        return "\n\n".join(parts)

    def _deduplicate_response(self, text: str) -> str:
        """Remove duplicate sentences (Fix #2)."""
        sentences = text.split('. ')
        seen = set()
        unique = []
        for s in sentences:
            s_clean = s.strip().lower()
            if s_clean not in seen and s_clean:
                seen.add(s_clean)
                unique.append(s)
        return '. '.join(unique)

    def _format_rag_context(self, rag_results: List[Dict]) -> str:
        """Format RAG search results into a context string."""
        if not rag_results:
            return ""

        context_parts = []
        for r in rag_results:
            if r.get("score", 0) > 0.2:  # Only include relevant results
                context_parts.append(r["text"])

        return "\n---\n".join(context_parts) if context_parts else ""

    def _get_offline_response(self, language: str) -> str:
        """Provide a polite offline response in the correct language."""
        return TRANSLATIONS["offline"].get(language, TRANSLATIONS["offline"]["en"])

    def _get_help_response(self, name: str, category: str, content: str, rag_results: List[Dict]) -> str:
        """Generate a helper response using RAG data."""
        # Clean up markdown headers if present
        content = re.sub(r'^#+\s+', '', content)
        
        # Limit content length and add ellipses if needed
        max_len = 500
        display_content = content[:max_len] + "..." if len(content) > max_len else content

        response = f"Hi {name}! 👋 Regarding **{category}**, here is what I found:\n\n{display_content}"
        
        if len(rag_results) > 1:
            more_topics = ", ".join([r['category'].replace('_', ' ').title() for r in rag_results[1:3]])
            response += f"\n\nI also have information on related topics like {more_topics}. Let me know if you'd like to dive into those!"
            
        return response

    def _get_greeting(self, context: Optional[Dict], language: str) -> str:
        """Generate a personalized greeting."""
        name = context.get("name", "there") if context else "there"

        greetings = {
            "en": f"Hey {name}! 👋 I'm your CampusCompanion. I can help you with documents, fees, courses, hostel info, and more. What would you like to know?",
            "hi": f"नमस्ते {name}! 👋 मैं आपका CampusCompanion हूं। मैं आपकी documents, fees, courses, hostel और admissions में मदद कर सकता हूं। कैसे मदद करूं?",
            "mr": f"नमस्कार {name}! 👋 मी तुमचा CampusCompanion आहे। Documents, fees, courses, hostel या सगळ्यांबद्दल मी मदत करू शकतो. काय मदत करू?",
        }
        return greetings.get(language, greetings["en"])

    def _fallback_response(self, intent: str, language: str) -> str:
        """Provide fallback responses when LLM is unavailable."""
        fallbacks = {
            "documents": "📄 For document-related queries, please check the Documents section in the sidebar. You'll need: 10th marksheet, 12th marksheet, Aadhar card, passport photos, and applicable certificates.",
            "fees": "💰 For fee information, the Admission Office can provide the latest fee structure and deadlines. Contact: admissions@tcetmumbai.in",
            "courses": "📚 Course registration details are available on the student portal once your admission is confirmed.",
            "hostel": "🏠 Hostel information and allocation happens after document verification. Contact the hostel warden for immediate queries.",
            "unknown": "I'm having trouble processing your request right now. Would you like me to connect you to human support? You can also reach the helpdesk at ithelpdesk@tcetmumbai.in 🙋",
        }
        return fallbacks.get(intent, fallbacks["unknown"])

    def extract_intent(self, message: str) -> str:
        """
        Classify the user's message into a topic category.
        Uses keyword matching for speed; LLM classification could be added for accuracy.
        """
        msg = message.lower()

        intent_map = {
            "greeting": ["hello", "hi", "hey", "namaste", "start", "good morning", "good evening"],
            "documents": ["document", "upload", "marksheet", "certificate", "aadhar", "id card", "transcript", "tc", "migration", "photo", "scan"],
            "fees": ["fee", "payment", "pay", "tuition", "scholarship", "freeship", "refund", "challan", "razorpay", "deadline"],
            "courses": ["course", "subject", "class", "timetable", "schedule", "elective", "registration", "cgpa", "grade", "exam", "semester"],
            "hostel": ["hostel", "room", "roommate", "accommodation", "mess", "warden", "laundry"],
            "policies": ["attendance", "rule", "policy", "ragging", "conduct", "grievance", "leave", "absent"],
            "general": ["campus", "library", "wifi", "bus", "transport", "club", "fest", "contact", "helpdesk", "password"],
        }

        for intent, keywords in intent_map.items():
            if any(kw in msg for kw in keywords):
                return intent

        return "unknown"

    def detect_language(self, message: str) -> str:
        """Simple language detection based on script and keywords."""
        # Check for Devanagari script (Hindi/Marathi)
        if re.search(r'[\u0900-\u097F]', message):
            # Differentiate Hindi vs Marathi by common words
            for word in LANGUAGE_HINTS.get("mr", []):
                if word in message.lower():
                    return "mr"
            return "hi"

        # Check for Tamil script
        if re.search(r'[\u0B80-\u0BFF]', message):
            return "ta"

        # Check for Telugu script
        if re.search(r'[\u0C00-\u0C7F]', message):
            return "te"

        # Check for Kannada script
        if re.search(r'[\u0C80-\u0CFF]', message):
            return "kn"

        # Check for Bengali script
        if re.search(r'[\u0980-\u09FF]', message):
            return "bn"

        # Check for Gujarati script
        if re.search(r'[\u0A80-\u0AFF]', message):
            return "gu"

        # Check for Malayalam script
        if re.search(r'[\u0D00-\u0D7F]', message):
            return "ml"

        # Check for Gurmukhi script (Punjabi)
        if re.search(r'[\u0A00-\u0A7F]', message):
            return "pa"

        # Check for romanized Hindi keywords
        for word in LANGUAGE_HINTS.get("hi", []):
            if word in message.lower().split():
                return "hi"

        return "en"

    def generate_quiz(self, subject: str, topic: str, num_questions: int = 4) -> list:
        """Generate quiz questions using LLM."""
        prompt = f"""Generate {num_questions} multiple choice questions about {topic} in {subject}.
Return ONLY a JSON array, no other text:
[{{"question": "...", "options": ["A","B","C","D"], "answer": 0}}]
The answer field is the index (0-3) of the correct option."""

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.5},
                },
                timeout=60,
            )
            if response.status_code == 200:
                raw = response.json().get("response", "[]")
                start, end = raw.find("["), raw.rfind("]") + 1
                if start != -1 and end > start:
                    return json.loads(raw[start:end])
        except Exception as e:
            print(f"Quiz error: {e}")

        return [{"question": f"Key concept in {topic}?", "options": ["Abstraction", "Loops", "Arrays", "Classes"], "answer": 0}]

    def mental_health_chat(self, message: str) -> Dict:
        """
        Specialized chat for mental health support with empathetic prompt.
        """
        # 1. Check for crisis keywords
        is_crisis = detect_crisis(message)
        
        # 2. Build system prompt
        system_prompt = """
        You are a compassionate mental health support companion for college students. 
        Your role:
        - Listen actively without judgment
        - Validate their feelings
        - Ask gentle follow-up questions
        - Suggest coping strategies (breathing exercises, journaling, talking to friends)
        - Encourage professional help when needed
        - NEVER diagnose conditions
        - NEVER minimize their concerns
        - If they mention self-harm or suicide, immediately provide crisis helpline numbers

        Keep responses warm, brief (2-3 sentences), and supportive.
        """
        
        # 3. Call LLM
        try:
            response = requests.post(
                f"{self.base_url}/api/chat", 
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message}
                    ],
                    "stream": False,
                    "options": {"temperature": 0.3} # Lower temp for more stable advice
                }, 
                timeout=30
            )
            
            ai_message = response.json()['message']['content']
            
            return {
                "response": ai_message,
                "crisis_detected": is_crisis,
                "helplines": HELPLINES if is_crisis else []
            }
        except Exception as e:
            return {
                "response": "I'm here for you, but I'm having a bit of trouble connecting right now. Please remember you're not alone. If you need immediate help, reach out to someone you trust or a helpline.",
                "crisis_detected": is_crisis,
                "helplines": HELPLINES if is_crisis else []
            }

    def check_health(self) -> Dict:
        """Check if Ollama is running and model is available."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if resp.status_code == 200:
                models = [m["name"] for m in resp.json().get("models", [])]
                model_loaded = any(self.model in m for m in models)
                return {
                    "ollama": "online",
                    "model": self.model,
                    "model_loaded": model_loaded,
                    "available_models": models,
                }
        except Exception:
            pass

        return {
            "ollama": "offline",
            "model": self.model,
            "model_loaded": False,
            "available_models": [],
        }


# Test if run directly
if __name__ == "__main__":
    print("Testing Local LLM Agent...")
    print("=" * 50)

    agent = LocalLLMAgent()

    # Test 1: Intent detection
    print("\nTest 1: Intent Detection")
    tests = [
        ("Hello!", "greeting"),
        ("What documents do I need?", "documents"),
        ("When is fee deadline?", "fees"),
        ("Tell me about hostel", "hostel"),
        ("How to register for courses?", "courses"),
    ]
    for msg, expected in tests:
        result = agent.extract_intent(msg)
        status = "✓" if result == expected else "✗"
        print(f"  {status} '{msg}' -> {result} (expected: {expected})")

    # Test 2: Language detection
    print("\nTest 2: Language Detection")
    print(f"  English: {agent.detect_language('What documents do I need?')}")
    print(f"  Hindi: {agent.detect_language('mujhe documents chahiye')}")
    print(f"  Devanagari: {agent.detect_language('मुझे डॉक्यूमेंट चाहिए')}")

    # Test 3: RAG search
    print("\nTest 3: RAG Search")
    results = agent.rag.search("What documents do I need for admission?")
    print(f"  Found {len(results)} results")
    for r in results:
        print(f"  [{r['category']}] score={r['score']}")

    print("\n" + "=" * 50)
    print("✓ Tests complete!")
