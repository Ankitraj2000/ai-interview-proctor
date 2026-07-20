# Contributing to AI Interview Proctor System

Thank you for contributing! This guide covers how to set up your development environment, run tests, and submit changes.

---

## Prerequisites

| Tool | Min Version | Purpose |
|------|------------|---------|
| Docker Desktop | 4.x | Run all services in containers |
| Java JDK | 21 | Backend local development |
| Maven | 3.9 | Backend build tool |
| Python | 3.10+ | AI service local development |
| Node.js | 20 LTS | Frontend local development |

---

## Project Structure

See [README.md](README.md) for the full directory breakdown.

---

## Development Setup

### Option A — Docker (Recommended)

```bash
cp .env.example .env
# Edit .env with at least MYSQL_ROOT_PASSWORD and JWT_SECRET
docker compose up --build
```

All four services start automatically with hot-reload-friendly configuration.

### Option B — Manual Per-Service

See the **Manual Development Setup** section in [README.md](README.md).

---

## Running Tests

### Backend Unit Tests (Java / JUnit 5 + Mockito)

All 33 tests run fully inside a Maven Docker container — no local JVM required:

```bash
docker run --rm \
  -v "$(pwd)/backend:/app" -w /app \
  maven:3.9.6-eclipse-temurin-21-alpine \
  mvn clean test
```

Expected result:
```
Tests run: 33, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Test suites live in `backend/src/test/java/com/proctor/`:
- `service/AuthServiceTest.java` — OTP, registration, password reset
- `service/InterviewServiceTest.java` — scheduling, code generation
- `service/ReportServiceTest.java` — scoring algorithm, PDF/Excel generation
- `service/SessionServiceTest.java` — session lifecycle
- `service/UserServiceTest.java` — profile updates, resume upload
- `controller/AuthControllerTest.java` — auth endpoint bindings
- `controller/SessionControllerTest.java` — session endpoint bindings

### AI Service Unit Tests (Python / pytest)

Seven tests run inside a slim Python container — no local Python or ML models needed:

```bash
docker run --rm \
  -v "$(pwd)/ai-service:/app" -w /app \
  python:3.10-slim \
  sh -c "pip install pytest httpx numpy fastapi pydantic pydantic-settings websockets opencv-python-headless && python -m pytest"
```

Expected result:
```
tests/test_audio_service.py ...   [ 42%]
tests/test_main.py ..             [ 71%]
tests/test_proctor_service.py ..  [100%]
7 passed, 2 warnings in 0.96s
```

Test files live in `ai-service/tests/`:
- `test_audio_service.py` — RMS/dB threshold checks
- `test_proctor_service.py` — violation scoring rules
- `test_main.py` — FastAPI `/health` and `/analyze-frame` endpoints
- `conftest.py` — global stubs for `mediapipe` and `ultralytics`

### Frontend (Manual)

```bash
cd frontend
npm install
npm run build  # Verify no TypeScript/JSX errors
```

---

## Code Style

### Java (Backend)
- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- All service methods must have Javadoc comments
- Use Lombok `@Builder`, `@Data`, `@Slf4j` where appropriate
- No raw SQL — use Spring Data JPA repositories

### Python (AI Service)
- Follow PEP 8
- Type-hint all function signatures
- Keep services stateless — do not store session state in memory

### JavaScript/React (Frontend)
- Functional components with hooks only (no class components)
- All API calls go through the `services/` layer — no inline `axios.get()` in components
- Use named exports for utilities, default exports for components

---

## Git Workflow

1. Fork and create a feature branch: `git checkout -b feat/your-feature-name`
2. Make changes with clear, atomic commits
3. Run the test suites (backend + Python) before opening a PR
4. Open a Pull Request against `main` with a description of:
   - What changed and why
   - Any breaking API changes
   - Test coverage added

---

## PR Checklist

Before submitting, confirm:

- [ ] All 33 backend unit tests pass (`mvn clean test`)
- [ ] All 7 Python unit tests pass (`pytest`)
- [ ] Frontend builds cleanly (`npm run build`)
- [ ] No hardcoded secrets or credentials in changed files
- [ ] New API endpoints are documented in Swagger (`@Operation`, `@Tag`)
- [ ] `README.md` updated if new env vars or features are added
- [ ] `.env.example` updated if new environment variables are introduced

---

## Reporting Issues

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs. actual behaviour
- Docker Compose version and OS
- Relevant log output (`docker logs proctor_backend`, etc.)
