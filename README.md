# CLeO
it is a mental health chatbot
Table of contents

About

Key features

Tech stack & architecture (high-level)

Quick start (dev & docker)

Database schema (SQL)

API endpoints (summary + examples)

Emergency “Share My Live Location” flow & message format

Authentication & security highlights

Testing & local checks

Scalability, improvements & roadmap

How this maps to hackathon judging criteria

Contributing, license & contact

1. About

CLeO is a socially-focused mental health chatbot that provides CBT-inspired conversational support, mood-tracking, journaling, and a one-tap Emergency Help system that shares live location with saved emergency contacts (via WhatsApp link or Cloud API). It’s built to be accessible, mobile-first, and privacy-respecting — designed for use in colleges, workplaces and community health programs.

2. Key features

AI-powered conversational support (CBT-style prompts)

Sign-up / Sign-in (email) with secure password hashing

Mood tracker, journaling, and trend analytics (exportable CSV/PDF)

Emergency Help: Share live location → auto-generate WhatsApp message (wa.me link or Cloud API)

Weather-aware nudges and reminders (integrates weather APIs)

Privacy controls: data export / delete, encryption of PII fields

Mobile-first responsive UI and accessible design

3. Tech stack & architecture (high-level)

Frontend

React (Vite) or plain JS fallback

Tailwind CSS for styling

PWA support (optional)

Uses Fetch / WebSocket for chat

Backend

Python (FastAPI) — REST + WebSocket support

Celery + Redis for background jobs (notifications, WhatsApp dispatch)

PostgreSQL (primary DB), Redis (cache, rate limit)

AI & integrations

AI model via API (Gemini / OpenAI / HuggingFace)

Weather APIs (OpenWeatherMap / Open-Meteo)

WhatsApp via wa.me link (simple) or WhatsApp Cloud API (automatic)

Deployment

Docker / docker-compose for local dev

CI/CD (GitHub Actions) → Render / Vercel / AWS / GCP in production

HTTPS with Let's Encrypt

Simple architecture flow

Browser (React) -> API Gateway (Nginx) -> FastAPI app
                                   ↕
                                PostgreSQL
                                   ↕
                                Redis / Celery
                                   ↕
                      External APIs: AI, Weather, WhatsApp

4. Quick start
Prerequisites

Python 3.11+

Node 18+ (if using React frontend)

Docker & docker-compose (optional but recommended)

Environment (.env.example)
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/cleo
SECRET_KEY=change_this_to_a_secure_value
AI_API_KEY=your_ai_key_here
WHATSAPP_API_TOKEN=your_whatsapp_token_if_using_cloud_api
WEATHER_API_KEY=your_weather_key
FRONTEND_URL=http://localhost:3000

Local (without Docker)
Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run DB migrations (Alembic / your tool)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Frontend
cd frontend
npm install
npm run dev
# open http://localhost:3000

Docker (recommended)

docker-compose up --build
This will bring up backend, frontend, postgres and redis services (if configured).

5. Database schema (key tables)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(150),
  phone_number VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE moods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mood_score SMALLINT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20), -- 'user' / 'bot'
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

6. API endpoints (summary + cURL examples)

All protected endpoints require Authorization (JWT via HttpOnly cookie or Bearer token).

Auth

POST /auth/signup — body: { "name","email","password" }

POST /auth/login — body: { "email","password" }

POST /auth/logout

User

GET /user/me — get profile & associated data

PUT /user/me — update profile

Chat & AI

POST /chat/message — { "message": "..." } → returns bot reply (and logs chat)

Mood & Journal

POST /moods — { "mood_score": 7, "note": "..." }

GET /moods — list by date

Emergency

POST /emergency/share-location — { "latitude", "longitude", "accuracy", "timestamp" } → returns { "wa_link": "https://wa.me/..." } OR triggers WhatsApp API in background

Example: generate a wa.me link (cURL)
curl -X POST https://your-api/emergency/share-location \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude":27.2443,"longitude":78.0044,"accuracy":112617,"timestamp":"2025-09-04T19:21:24.348Z"}'

7. Emergency flow & message format

When user presses Share My Live Location:

Frontend asks for geolocation permission via navigator.geolocation.getCurrentPosition.

It sends { latitude, longitude, accuracy, timestamp } to backend.

Backend fetches saved emergency contact for the user and formats the message.

Backend returns a wa.me link, or queues a job to call WhatsApp Cloud API.

WhatsApp message template (exact format)

🚨 EMERGENCY ALERT 🚨

I NEED IMMEDIATE HELP!

LIVE LOCATION (DD/MM/YYYY, HH:MM:SS AM/PM):
https://maps.google.com/?q=<latitude>,<longitude>

Precise Coordinates:
Latitude: <latitude>
Longitude: <longitude>
Accuracy: ±<accuracy> meters

Timestamp: <ISO timestamp>

PLEASE SEND HELP OR CALL EMERGENCY SERVICES IMMEDIATELY!

This is my current live position - not cached data.


Note: wa.me opens WhatsApp with a pre-filled message — for automatic send (no user interaction) use WhatsApp Cloud API (requires Business Account and permissions).

8. Authentication & security highlights

Passwords hashed with bcrypt / argon2 (no plaintext).

JWT tokens (short-lived access + refresh) stored in HttpOnly, Secure cookies.

HTTPS enforced (HSTS).

All user-input validated server-side (pydantic schemas).

Rate-limiting via Redis (login attempts, emergency sends).

Field-level encryption for PII (emergency phone numbers) — rotate keys regularly.

Privacy: data export & delete endpoints; explicit consent flow for location sharing.

9. Testing & local checks

Unit tests for core modules (auth, emergency flow, AI wrapper).

Integration test for /emergency/share-location to assert message formatting and wa.me link generation.

End-to-end demo script (automated steps to demo chat, mood logging, emergency flow) for hackathon judges.

10. Scalability, improvements & roadmap

Short-term

Add analytics dashboard (mood vs time, active users).

Implement email verification & password reset.

Add multilingual support.

Mid-term

Move AI processing to a dedicated service (fine-tune models with anonymized consented data).

Add background workers for WhatsApp Cloud API integration and SMS fallback.

Add SSO (Google), and mobile apps (React Native).

Long-term

Kubernetes + auto-scaling, managed RDS with read-replicas.

Federated learning or on-device inference for sensitive data.

Institutional onboarding (B2B), NGO & government partnerships.

11. Hackathon judging mapping (guide for presentation)

We map our deliverables to the judge criteria (out of 100):

Problem Understanding (PU) — 20 pts
Show validation (small survey/metrics), social welfare impact, and clear problem statement.

Technical Implementation — 25 pts
Demonstrate architecture diagram, deployed app, backend code, database, authentication, and AI integration.

Functionality — 25 pts
Live demo: sign-up/login, chat, mood entry, emergency share → wa.me link works.

Creativity & Innovation — 15 pts
Highlight the emergency live-location + WhatsApp auto-alert, weather-aware nudges, and privacy-first design.

Presentation & Communication — 15 pts
Clear slides, live demo, prepared fallback screenshots/videos, and concise one-minute pitch.

Goal: Demonstrate a working end-to-end flow + security & ethics notes; target 90+ total across sections.

12. Contributing, license & contact

Contributions welcome — please open issues / PRs. See CONTRIBUTING.md for guidelines.

License: MIT (add LICENSE file)
Contact: lakshya sharma — use project Trickle or GitHub PRs/issues for questions.

CLeO — Mental Health Chatbot (Hackathon Project)

Project links

Live demo: https://bbvza2icoaor.trickle.host/
