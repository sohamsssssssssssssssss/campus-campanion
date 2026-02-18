<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Llama_3.1-8B-7C3AED?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

# ⚡ CampusCompanion AI

> **A futuristic, AI-powered student onboarding and campus life platform built with a "Neural Identity" design language.**

CampusCompanion AI is a full-stack application that helps freshers navigate their first year of college — from document verification and hostel allocation to finding compatible roommates and AI-powered academic assistance. The entire system runs **locally** with zero API costs using Llama 3.1 via Ollama.

---

## ✨ Key Features

### 🧠 Neural Chat — AI Assistant
- Conversational AI powered by **Llama 3.1 8B** running locally via Ollama
- Context-aware responses tailored to TCET campus life
- Handles queries about admissions, hostel rules, campus facilities, and academics
- Zero API costs — completely offline-capable

### 📄 System Docs — OCR Document Processing
- Upload and extract text from ID cards, mark sheets, and admission letters
- Built with **PaddleOCR** for local, privacy-first document processing
- Supports multiple document types with automatic classification
- Extracted data is stored securely in a local SQLite database

### 👥 Node Sync — AI Roommate Matcher
- Tinder-style swipe interface for discovering compatible roommates
- Compatibility scoring based on sleep schedule, cleanliness, and shared interests
- Animated drag-to-swipe cards with real-time visual feedback
- "Liked" buffer that tracks your selected peer connections

### 📚 AcademAI — Academic Intelligence
- **Video Vectors**: Search and discover relevant lecture videos by topic
- **Neural Evaluation**: AI-generated quizzes with instant scoring and feedback
- **Peer Nodes**: Discover study groups filtered by subject, year, and location

### 📊 Dashboard — System Integration Monitor
- Visual progress tracker with an animated circular "Sync Rate" gauge
- Step-by-step onboarding checklist (completed vs. pending protocols)
- Quick-action cards linking to all platform modules
- Identity hash display and mainframe load indicator

### 🔐 System Access — Authentication
- Login and registration with a futuristic "Neural Identity" interface
- Department selection for personalized onboarding
- Password visibility toggle and form validation
- **Demo Mode** bypass for instant access during presentations

---

## 🎨 Design System: "Premium Dark / Neural Identity"

The entire application follows a meticulously crafted design language:

| Element | Implementation |
|---|---|
| **Theme** | Ultra-dark backgrounds (`#030712`) with glassmorphism overlays |
| **Colors** | Primary Cyan (`#06b6d4`), Primary Purple (`#8b5cf6`), Accent Pink (`#ec4899`) |
| **Typography** | Black-weight, italic, uppercase tracking with monospace accents |
| **Glass Effects** | `backdrop-blur` panels with subtle white borders (`border-white/5`) |
| **Animations** | Framer Motion page transitions, hover scales, and entrance animations |
| **Background** | Animated mesh gradients with floating blurred orbs |
| **Branding** | "System Core" CPU icon, status indicators, protocol version labels |

### Design Principles
- **Cinematic Headers**: Oversized italic text with gradient spans
- **Matrix Stats**: Grid-based stat cards with hover-reveal background icons
- **Terminal Aesthetic**: Monospaced labels like `Sync_Rate`, `Node_Behavior`, `Protocol_v1.0.4`
- **Micro-interactions**: Every button, card, and icon responds to hover and tap

---

## 🏗️ Architecture

```
campuscompanion/
├── main.py                          # FastAPI server — all API routes
├── llm_agent.py                     # Ollama integration for local AI chat
├── ocr_processor.py                 # PaddleOCR document processing
├── database.py                      # SQLite database manager
├── requirements.txt                 # Python dependencies
├── setup.sh                         # Automated backend setup script
├── campuscompanion.db               # SQLite database (auto-created)
│
└── frontend/                        # React 19 + Vite application
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx                 # App entry point
        ├── App.jsx                  # Router, layout, global background
        ├── App.css                  # Custom animations & utilities
        ├── index.css                # Design system tokens & base styles
        │
        ├── components/
        │   └── Sidebar.jsx          # Collapsible navigation sidebar
        │
        ├── pages/
        │   ├── LandingPage.jsx      # Hero landing with "Enter Platform" CTA
        │   ├── LoginPage.jsx        # Auth with demo bypass mode
        │   ├── Dashboard.jsx        # Progress tracking & quick actions
        │   ├── ChatPage.jsx         # AI chat interface
        │   ├── DocumentUpload.jsx   # OCR document upload & extraction
        │   ├── RoommateMatcher.jsx  # Swipe-based roommate discovery
        │   └── AcademAI.jsx         # Lectures, quizzes, study groups
        │
        └── services/
            └── api.js               # Axios API client with interceptors
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 18+** and npm
- **Ollama** (for local AI)

### Step 1: Clone & Install Backend
```bash
# Navigate to the project
cd backend

# Install Python dependencies
pip3 install -r requirements.txt

# Or use the automated setup script
chmod +x setup.sh && ./setup.sh
```

### Step 2: Install & Pull AI Model
```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the Llama 3.1 8B model (~4.7GB)
ollama pull llama3.1:8b
```

### Step 3: Install Frontend
```bash
cd frontend
npm install
```

### Step 4: Run Everything
Open **three terminal windows**:

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start FastAPI backend
python3 main.py
# → Running at http://localhost:8000
# → API docs at http://localhost:8000/docs

# Terminal 3: Start React frontend
cd frontend && npm run dev
# → Running at http://localhost:5173
```

### Step 5: Open the App
Navigate to **http://localhost:5173** in your browser.
- Click **"Enter the Platform"** on the landing page
- Use the **"Demo Mode"** button on the login page for instant access

---

## 📡 API Reference

All endpoints are prefixed with `/api` and served from `http://localhost:8000`.

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root — returns welcome message |
| `GET` | `/health` | Health check — confirms Ollama connection |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/register` | Register new student account |

**Request Body (Register):**
```json
{
  "name": "Rahul Verma",
  "email": "rahul@tcet.edu",
  "password": "securepassword",
  "department": "Computer Engineering"
}
```

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Chat with AI assistant |

**Request Body:**
```json
{
  "message": "How do I upload my documents?",
  "student_id": "demo_student"
}
```

### Student Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/create` | Create a new student profile |
| `GET` | `/api/student/{student_id}/progress` | Get onboarding progress |
| `POST` | `/api/student/{student_id}/update-progress` | Mark a step as complete |

### Document Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/document/upload` | Upload & OCR a document |

**Form Data:**
- `file`: The image file (JPEG/PNG)
- `student_id`: Student identifier
- `doc_type`: Type of document (`id_card`, `marksheet`, etc.)

### Roommate Matching

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roommates/matches/{student_id}` | Get AI roommate matches |

### Academic Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/acad/lectures` | Search for lecture videos |
| `POST` | `/api/acad/quiz` | Generate a quiz on a topic |
| `GET` | `/api/acad/groups` | Find study groups |

**Query Parameters (Groups):** `?subject=Physics&topic=Optics`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework with lazy-loaded pages |
| **Vite** | 7.3 | Lightning-fast build tool & dev server |
| **TailwindCSS** | 4.1 | Utility-first CSS with custom design tokens |
| **Framer Motion** | 12.34 | Page transitions, drag gestures, animations |
| **React Router** | 7.13 | Client-side routing with `AnimatePresence` |
| **Axios** | 1.13 | HTTP client with response interceptors |
| **Lucide React** | 0.566 | Consistent icon system |
| **React Hot Toast** | 2.6 | Styled notification system |
| **clsx + tailwind-merge** | Latest | Conditional class merging |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python API framework |
| **Ollama + Llama 3.1 8B** | Local LLM for conversational AI |
| **PaddleOCR** | Local OCR engine for document processing |
| **SQLite** | Lightweight database for prototyping |
| **Uvicorn** | ASGI server |

---

## 🔧 Troubleshooting

### "Connection refused" when calling the API
Ollama isn't running. Start it with:
```bash
ollama serve
```

### "Model not found"
Download the model first:
```bash
ollama pull llama3.1:8b
```

### OCR not working
Install the OCR dependencies:
```bash
pip3 install paddleocr opencv-python
```

### Port 8000 already in use
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or change the port in main.py
uvicorn.run("main:app", port=8001)
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 🎯 Demo / Judging Guide

### Quick Demo Flow
1. Open `http://localhost:5173`
2. Click **"Enter the Platform"** on the landing page
3. Click **"Demo Mode"** on the login page (bypasses authentication)
4. Explore each section via the sidebar:
   - **Dashboard** → See the onboarding progress tracker
   - **Neural Chat** → Talk to the AI assistant
   - **System Docs** → Upload a document for OCR
   - **Node Sync** → Swipe through roommate matches
   - **AcademAI** → Search lectures, take quizzes, find study groups

### Deploying with Ngrok
```bash
# Terminal 1: Backend
python3 main.py

# Terminal 2: Expose via Ngrok
ngrok http 8000
```
Update `VITE_API_URL` in the frontend `.env` to the Ngrok URL.

---

## 💡 Why Local AI?

| Benefit | Detail |
|---|---|
| **₹0 Cost** | No OpenAI/Claude API fees — runs entirely on your machine |
| **Complete Privacy** | Student data never leaves the local network |
| **Fast Responses** | Sub-second inference on modern hardware |
| **Works Offline** | No internet required after initial model download |
| **Scalable** | Can run on college server infrastructure |

---

## 👥 Team Dholakpur

| Member | Email |
|---|---|
| **Soham** | sohamsshinde21@gmail.com |
| **Habib** | habibmamsa349@gmail.com |
| **Aalef** | aalefshaikh@gmail.com |

---

<p align="center">
  <sub>Built with ⚡ at TCET • Powered by Local AI</sub>
</p>
