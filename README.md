# AI Interview Proctor System

> An enterprise-ready, multi-tier AI-powered proctoring solution that protects the integrity of online evaluations using deep-learning computer vision, acoustic analysis, and real-time browser telemetry.

![Stack](https://img.shields.io/badge/Java-21-blue?logo=openjdk) ![Stack](https://img.shields.io/badge/Spring%20Boot-3.3-green?logo=springboot) ![Stack](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi) ![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Architecture Overview

```
                        ┌──────────────────────────────┐
                        │        React Frontend         │
                        │    (WebRTC & HTML5 Canvas)    │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      HTTPS REST (Auth, Sessions)                    WebSocket Frame Stream (2 FPS)
                │                                             │
                ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     Spring Boot Backend      │              │      FastAPI AI Service      │
│         (Port 8080)          │              │  (MediaPipe + YOLOv8, 8000)  │
└──────────────┬───────────────┘              └──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│        MySQL Database        │
│         (Port 3306)          │
└──────────────────────────────┘
```

1. **Client (React)**: Captures webcam/mic via WebRTC, streams 2-FPS Base64 JPEG frames over WebSocket to the AI service. Monitors browser events (tab switches, fullscreen exits, dev tools, copy-paste).
2. **AI Microservice (FastAPI + YOLOv8 + MediaPipe)**: Runs face mesh, eye-gaze deviation, phone/device detection, and acoustic amplitude checks. Returns real-time anomaly alerts.
3. **Core Backend (Spring Boot 3 + Spring Security + JPA)**: Manages auth (OTP email, JWT), interview schedules, session telemetry, cheating logs, and generates PDF/Excel audit reports.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Security, Hibernate/JPA, MySQL, Lombok, MapStruct, Apache POI, OpenPDF, Springdoc OpenAPI |
| AI Service | Python 3.10, FastAPI, Uvicorn, OpenCV, MediaPipe, Ultralytics YOLOv8, NumPy |
| Frontend | React 18, Vite, Tailwind CSS v3, Axios, React Router v6, Lucide Icons |
| Infrastructure | Docker, Nginx (reverse proxy + gzip), Docker Compose |

---

## Directory Structure

```
ai-interview-proctor/
├── backend/                    # Java Spring Boot REST API
│   ├── src/
│   │   ├── main/java/com/proctor/
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── service/        # Business logic
│   │   │   ├── entity/         # JPA entities
│   │   │   ├── dto/            # Request/Response DTOs
│   │   │   ├── repository/     # Spring Data JPA repos
│   │   │   ├── security/       # JWT, UserDetails, SecurityConfig
│   │   │   └── mapper/         # MapStruct mappers
│   │   └── resources/
│   │       └── application.yml # Config (env-var overridable)
│   ├── pom.xml
│   └── Dockerfile
├── ai-service/                 # FastAPI computer-vision microservice
│   ├── app/
│   │   ├── services/           # ProctorService, FaceService, ObjectService, AudioService
│   │   └── core/config.py      # Pydantic settings
│   ├── tests/                  # pytest unit tests
│   ├── main.py
│   ├── requirements.txt
│   ├── .dockerignore
│   └── Dockerfile
├── frontend/                   # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/              # Landing, Login, Register, Dashboards, InterviewRoom, ...
│   │   ├── components/         # Navbar, CameraStream, WarningOverlay, CodeEditor, QuestionBankStudio
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # useWebRTC
│   │   └── services/           # authService, interviewService, sessionService, reportService, userService
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── schema.sql              # Tables, roles, permissions, seed settings
├── docker/
│   └── nginx.conf              # Reverse proxy + gzip + WS upgrade
├── .env.example                # Required environment variables reference
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Docker Compose)

> **Prerequisites**: Docker Desktop (or Docker Engine + Compose plugin) installed.

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env — set MYSQL_ROOT_PASSWORD and JWT_SECRET at minimum
```

### 2. Build and start all services

```bash
docker compose up --build
```

> First build will take a few minutes (downloads Maven/npm/pip dependencies).

### 3. Access the application

| Service | URL |
|---|---|
| **Frontend UI** | http://localhost |
| **Backend Swagger Docs** | http://localhost/api/swagger-ui/index.html |
| **Backend OpenAPI JSON** | http://localhost/api/v3/api-docs |
| **AI Service Health** | http://localhost:8000/health |

---

## API Quick Reference

All REST endpoints are served under `/api`. JWT Bearer token required on protected routes.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register new user (roles: CANDIDATE/INTERVIEWER/ADMIN) |
| `POST` | `/auth/verify-otp` | Activate account with OTP |
| `POST` | `/auth/resend-otp` | Resend OTP |
| `POST` | `/auth/login` | Get JWT token pair |
| `POST` | `/auth/forgot-password` | Send password-reset OTP |
| `POST` | `/auth/reset-password` | Set new password with OTP |

### Interviews
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/interviews` | Schedule interview (Interviewer) |
| `GET`  | `/interviews/interviewer` | My interview schedule (Interviewer) |
| `GET`  | `/interviews/candidate` | My interview schedule (Candidate) |
| `GET`  | `/interviews/code/{code}` | Look up by access code |
| `PATCH`| `/interviews/{id}/status` | Update interview status |

### Sessions
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/sessions/start/{interviewId}` | Start live session |
| `POST` | `/sessions/{id}/violation?violationType=TAB_SWITCH&details=...` | Log browser violation |
| `POST` | `/sessions/{id}/ai-event?eventType=LOOKING_AWAY&confidence=0.9` | Log AI anomaly |
| `POST` | `/sessions/{id}/submit` | Submit session |
| `GET`  | `/sessions/{id}/cheating-logs` | Get violation logs |
| `GET`  | `/sessions/{id}/ai-events` | Get AI event logs |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/reports/generate/{sessionId}` | Generate report |
| `GET`  | `/reports/session/{sessionId}` | Get report |
| `GET`  | `/reports/download/pdf/{sessionId}` | Download PDF |
| `GET`  | `/reports/download/excel/{sessionId}` | Download Excel |

---

## Core User Flows

1. **Registration & Activation**: Register → receive OTP via email (or console log if SMTP unconfigured) → verify on `/verify-otp`.
2. **Scheduling (Interviewer)**: Log in → dashboard → Schedule Interview → fill candidate email, dates, duration → candidate receives access code.
3. **Taking the Exam (Candidate)**: Log in → enter access code → grant camera/mic → Start Exam (fullscreen) → submit or auto-submit on 3 warnings.
4. **Reviewing Results (Interviewer)**: Open completed card → Generate Report → view chronological violations → download PDF/Excel.

---

## Manual Development Setup

### Database (MySQL 8.0)
```bash
mysql -u root -p < database/schema.sql
```

### Backend (Java 21)
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

### AI Service (Python 3.10)
```bash
cd ai-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Node 20)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Running Tests

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

```bash
# Backend — 33 unit tests
docker run --rm \
  -v "$(pwd)/backend:/app" -w /app \
  maven:3.9.6-eclipse-temurin-21-alpine \
  mvn clean test

# AI Service — 7 unit tests
docker run --rm \
  -v "$(pwd)/ai-service:/app" -w /app \
  python:3.10-slim \
  sh -c "pip install pytest httpx numpy fastapi pydantic pydantic-settings websockets opencv-python-headless && python -m pytest"
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | ✅ | MySQL root password |
| `MYSQL_DATABASE` | — | Database name (default: `proctor_db`) |
| `JWT_SECRET` | ✅ | Base64-encoded JWT signing secret (256-bit min) |
| `SMTP_USERNAME` | — | Gmail address for OTP emails |
| `SMTP_PASSWORD` | — | Gmail App Password |
| `AI_SERVICE_URL` | — | AI microservice URL (default: `http://ai-service:8000`) |

> If SMTP credentials are not set, OTP codes are logged to the backend console output.

---

## License

MIT © ProctorPro Inc.
