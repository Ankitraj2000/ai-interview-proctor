# ProctorPro Developer & Refactoring Guide

Welcome to the ProctorPro development workspace. This guide outlines coding guidelines, module architectures, and instructions for running and modifying the code.

## 1. Codebase Architecture

The application is structured as a decoupled, multi-language repository:

### Backend (Spring Boot 3.3)
- **Controller Layer**: REST mappings to endpoints.
- **Service Layer**: Houses core business logic (e.g., auto-evaluating MCQ, executing SQL validations, running gaze assessments).
- **Security**: Houses JWT filter routines and password hashing enforcers.

### AI Service (FastAPI)
- **Object Tracking**: Uses YOLOv8 for camera object logging.
- **WebSocket Gateway**: Receives 2-FPS base64 images and performs MediaPipe mapping on CPU threads.

## 2. Refactoring Guidelines

To maintain code cleanliness:
* **Lombok & MapStruct**: Keep entity classes simple and map DTO layers using MapStruct.
* **Database Queries**: Avoid writing duplicate query hooks in repositories. Use indexes on foreign keys to optimize query performance.
* **Component Size**: Keep React elements focused and move large logic tasks to helper modules (e.g., `reportService.js`).
