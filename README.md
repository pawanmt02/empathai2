# EmpathAI: Real-Time Emotional Intelligence Communication Intermediary

> **AFFECIO HACKS '26** | **Track:** AI & Social Interaction  
> *Correcting emotional intent before friction damages human connection.*

---

## 1. Executive Summary

Digital text strips away facial expressions, vocal tone, and body language. Consequently, research shows that negative intent is frequently inferred in neutral messages, and actual negative intent is amplified into full-blown conflict.

**EmpathAI** is a real-time, artificial intelligence-driven communication intermediary. Operating silently in the background as users type, it continuously analyzes emotional volatility, passive-aggression, defensiveness, and hostility. Instead of correcting grammar, EmpathAI corrects emotional intent—flagging toxic friction and providing context-aware, empathetic alternatives within milliseconds.

---

## 2. Key Architecture: Dual-Model Pipeline

Relying on a cloud LLM for every single keystroke is cost-prohibitive and introduces latency (>1000ms). EmpathAI resolves this with an asynchronous **Dual-Model Pipeline**:

```
+-------------------------------------------------------------+
|                     React Client (UI)                       |
|          (Debounced Keystroke Streaming ~220ms)             |
+------------------------------+------------------------------+
                               |
                               | (WebSocket /ws/tone)
                               v
+-------------------------------------------------------------+
|                     FastAPI Async Layer                     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|        Gatekeeper Model (Local NLP / Sub-2ms Latency)        |
|  - Sentiment Intensity (VADER)                              |
|  - Passive-Aggressive Pattern Matching                      |
|  - Defensiveness & Blame-Shift Lexical Scanners             |
|  - Hostility & Aggressive Punctuation Detectors             |
|  - Volatility Temperature Scoring (0 - 100)                 |
+------------------------------+------------------------------+
                               |
                 Is Volatility >= 70% (Red Zone)?
                     /                   \
                   YES                    NO
                   /                        \
                  v                          v
+-----------------------------------+   +--------------------+
|   Generator Model (Google Gemini) |   | Return Score Only  |
| - Gemini 2.5 Flash API            |   | (Sub-2ms response) |
| - 3 Empathetic Alternative Modes: |   +--------------------+
|   1. Collaborative & Warm         |
|   2. Assertive & Clear            |
|   3. Diplomatic & De-escalating   |
| - 1-Click Substitution Payload    |
+-----------------------------------+
```

---

## 3. Core Features

- **Real-Time Tone & Temperature Gauge**:
  - Color-coded indicator: **Green (0-35)**, **Yellow (36-69)**, **Red (70-100)**.
  - Granular metric breakdown: Sentiment polarity, aggression index, passive-aggressive index, defensiveness score, and latency counters.
- **One-Click Empathetic Substitution**:
  - Contextual alternatives appear in a non-blocking overlay.
  - A single click seamlessly updates the user's drafted message without interrupting workflow.
- **Side-by-Side Escalation vs. Empathetic Simulator**:
  - Demonstrates the tangible relational outcome of sending the raw, volatile message vs. sending the empathetic rewrite.
- **Privacy-First Zero Storage Architecture**:
  - All keystrokes and messages are processed strictly in-memory. Zero database logging, zero persistent retention.
- **Resilient Offline Fallback**:
  - Fully functional with Google Gemini API, with an intelligent built-in heuristic transformer when offline or without an API key.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide Icons | Responsive chat simulator, live gauges, and overlay cards |
| **Backend API** | Python 3.13, FastAPI, Uvicorn, WebSockets | Asynchronous streaming, low latency orchestration |
| **Gatekeeper NLP** | NLTK VADER, Lexical Pattern Scoring | Sub-2ms local emotional volatility evaluation |
| **Generative AI** | Google Gemini API (`gemini-2.5-flash`), `google-genai` SDK | Empathetic re-phrasing preserving core intent |

---

## 5. Quickstart & Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ & npm

### Method 1: One-Click Launch (Windows)
Double-click `start.bat` in the root folder, or execute:
```bash
.\start.bat
```
This automatically launches both the FastAPI backend and the Vite frontend.

---

### Method 2: Manual Step-by-Step

#### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

*(Optional)* Configure your Gemini API Key in `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```
*(Note: You can also enter the Gemini API Key directly in the frontend UI Settings modal).*

Run Backend Server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: `http://127.0.0.1:8000/health`
- Swagger Docs: `http://127.0.0.1:8000/docs`

#### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to: `http://localhost:5173`

---

## 6. Testing the Application

Run the backend unit and integration test suite:
```bash
cd backend
.\venv\Scripts\python.exe test_suite.py
```

### Preloaded Test Scenarios in UI:
1. **Passive-Aggressive Email**: `"Per my last email, if you actually bothered to read the specs you would know this."`
2. **Hostile Review**: `"This is a complete waste of my time. Are you serious??"`
3. **Defensive Disengagement**: `"Fine, whatever. Do whatever you want, not my problem."`
4. **Deploy Escalation**: `"Did you even test this before pushing to main?? Completely broken."`
5. **Constructive Praise**: `"Hey team, thanks for pushing through the sprint milestones!"`

---

## 7. Hackathon Evaluation Alignment

- **Technical Implementation (30%)**: Dual-model pipeline, sub-2ms local NLP classification, asynchronous WebSockets, and clean FastAPI architecture.
- **Innovation (25%)**: Focuses on emotional intent and psychological safety rather than standard grammar correction.
- **Impact & Usefulness (20%)**: Directly prevents workplace misunderstandings, toxic escalations, and digital burnout.
- **UI/UX (15%)**: Non-intrusive, supportive overlay with 1-click replacement and instant feedback.
- **Demo & Presentation (10%)**: Dedicated side-by-side comparison mode contrasting raw escalation vs. empathetic outcomes.
