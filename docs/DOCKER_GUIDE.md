# ProctorPro Docker deployment & Optimization Guide

This guide describes how to configure, run, and scale the ProctorPro multi-tier architecture using Docker and Docker Compose.

## 1. Container Architecture

ProctorPro is divided into 4 main isolated services:

* **db (mysql:8.0)**: Relational storage for tables, candidate responses, and audit records.
* **ai-service (FastAPI + YOLOv8)**: Python service executing real-time object detection and gaze mesh classification.
* **backend (eclipse-temurin:21)**: Java Spring Boot REST controller executing scheduling, scoring, and PDF compiles.
* **frontend (nginx:alpine)**: Static file Nginx gateway that forwards REST requests to `/api` and WebSockets to the AI engine.

## 2. Docker Compose Configuration

The default configuration is defined in `docker-compose.yml`:

```yaml
services:
  db:
    image: mysql:8.0
    container_name: proctor_db
    restart: always
    environment:
      MYSQL_DATABASE: proctor_db
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-ppassword"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: proctor_backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/proctor_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=password
      - APP_JWT_SECRET=YW50aWdyYXZpdHlwcm9jdG9yc3lzdGVtc2VjcmV0a2V5Zm9ycHJvZHVjdGlvbnNlY3VyaXR5dG9rZW5nZW5lcmF0aW9u
      - AI_SERVICE_URL=http://ai-service:8000
    volumes:
      - backend_uploads:/app/uploads
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "8080"]
      interval: 15s
      timeout: 5s
      retries: 3
...
```

## 3. Production Health Checks & Logging

Each service includes native local checks (`healthcheck` block) to ensure services start in the correct order:
- `db` validates connections using `mysqladmin ping`.
- `backend` and `frontend` validate ports using `nc -z`.
- `ai-service` checks health status using `python urllib` query check.

Logs are centralized in `/var/lib/docker/containers` and rotate automatically. For application-level logging, the Spring Boot app writes to stdout, which is managed by Nginx proxy caches.
