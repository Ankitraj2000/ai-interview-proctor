# ProctorPro API Documentation

All REST APIs are served under the `/api` servlet context path. Secure endpoints require a standard JWT Bearer token in the `Authorization` request header.

## 1. Authentication Endpoints

### Register User
* **Method**: `POST`
* **Path**: `/auth/register`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "username": "candidate_jane",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "ROLE_CANDIDATE"
}
```
* **Response (200 OK)**:
```json
{
  "message": "User registered successfully. Please verify using the OTP sent to your email."
}
```

### Verify OTP (Activate Account)
* **Method**: `POST`
* **Path**: `/auth/verify-otp`
* **Request Parameters**:
  - `email` (string, required)
  - `otp` (string, required)
* **Response (200 OK)**:
```json
{
  "message": "Account activated successfully."
}
```

### Log In (Retrieve Token)
* **Method**: `POST`
* **Path**: `/auth/login`
* **Request Body**:
```json
{
  "username": "candidate_jane",
  "password": "SecurePassword123!"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 12,
  "username": "candidate_jane",
  "email": "jane@example.com",
  "roles": ["ROLE_CANDIDATE"]
}
```

---

## 2. Proctoring & Evaluation Session Endpoints

### Start Candidate Session
* **Method**: `POST`
* **Path**: `/sessions/start/{interviewId}`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
```json
{
  "id": 45,
  "interviewId": 3,
  "candidateId": 12,
  "startedAt": "2026-07-20T12:00:00",
  "warningCount": 0,
  "clientIp": "192.168.1.105",
  "userAgent": "Mozilla/5.0 Chrome/120.0"
}
```

### Log Browser Violation Anomaly
* **Method**: `POST`
* **Path**: `/sessions/{id}/violation`
* **Request Parameters**:
  - `violationType` (string, e.g. `TAB_SWITCH`, `FULLSCREEN_EXIT`)
  - `details` (string)
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
```json
{
  "message": "Violation logged successfully."
}
```

### Log AI Computer Vision Telemetry Anomaly
* **Method**: `POST`
* **Path**: `/sessions/{id}/ai-event`
* **Request Parameters**:
  - `eventType` (string, e.g. `PHONE_DETECTED`, `CAMERA_BLOCKED`)
  - `confidence` (double)
* **Headers**: `Authorization: Bearer <token>`

### Finalize & Submit Session
* **Method**: `POST`
* **Path**: `/sessions/{id}/submit`
* **Headers**: `Authorization: Bearer <token>`

---

## 3. Evaluation Reports & Comparative Analytics

### Retrieve All Reports (Recruiter / Admin only)
* **Method**: `GET`
* **Path**: `/reports/all`
* **Headers**: `Authorization: Bearer <token>`

### Aggregated Global Statistics (Recruiter / Admin only)
* **Method**: `GET`
* **Path**: `/reports/analytics`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
```json
{
  "totalCandidates": 24,
  "averageScore": 76.5,
  "passedCount": 18,
  "flaggedCount": 4,
  "lowRiskCount": 20
}
```

### Compare Candidate Sessions Side-by-Side (Recruiter / Admin only)
* **Method**: `GET`
* **Path**: `/reports/compare`
* **Request Parameters**:
  - `sessionIds` (comma-separated list of IDs)
* **Headers**: `Authorization: Bearer <token>`

### Download Evaluation PDF Report
* **Method**: `GET`
* **Path**: `/reports/download/pdf/{sessionId}`
* **Response**: `application/pdf` binary stream.

### Download Evaluation Logs Excel Sheet
* **Method**: `GET`
* **Path**: `/reports/download/excel/{sessionId}`
* **Response**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` binary stream.
