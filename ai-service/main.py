import base64
import logging
import os
import time
import cv2
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.core.config import settings
from app.services.proctor_service import ProctorService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

proctor_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global proctor_service
    logger.info("Initializing AI proctoring service...")
    proctor_service = ProctorService()
    yield
    logger.info("Shutting down AI proctoring service...")
    if proctor_service:
        proctor_service.shutdown()

app = FastAPI(
    title="AI Interview Proctor Service",
    description="Computer vision proctoring microservice: face detection, gaze tracking, object detection, audio monitoring",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class ImageFrameRequest(BaseModel):
    image: str
    audio: Optional[str] = None

class FaceVerifyRequest(BaseModel):
    registered_descriptor: List[float]
    current_descriptor: List[float]
    threshold: Optional[float] = 0.25

class ReportViolationRequest(BaseModel):
    candidate_id: int
    interview_id: int
    violation_type: str
    severity: str
    confidence: float
    description: str

class BrowserEventRequest(BaseModel):
    session_id: str
    event_type: str
    timestamp: str
    details: Optional[str] = None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def decode_image_bytes(image_base64: str) -> bytes:
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
    return base64.b64decode(image_base64)


def _decode_to_bgr(image_base64: str):
    """Decode a base64 image string to an OpenCV BGR numpy array."""
    img_bytes = decode_image_bytes(image_base64)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Interview Proctor Microservice",
        "yolo_model": settings.YOLO_MODEL_PATH,
        "vision_engine": "MediaPipe FaceMesh 468 3D + YOLOv8"
    }


# ─── Proctoring Endpoints ─────────────────────────────────────────────────────

@app.post("/analyze-frame")
async def analyze_frame_http(payload: ImageFrameRequest):
    try:
        img_bytes = decode_image_bytes(payload.image)
        audio_bytes = decode_image_bytes(payload.audio) if payload.audio else None
        return proctor_service.process_frame(img_bytes, audio_bytes)
    except Exception as e:
        logger.error(f"Analyze frame error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect-face")
async def detect_face(payload: ImageFrameRequest):
    try:
        image = _decode_to_bgr(payload.image)
        if image is None:
            return {"faces_detected": 0, "looking_away": False, "multiple_faces": False, "faces": []}
        return proctor_service.face_service.analyze_frame(image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/verify-face")
async def verify_face(payload: FaceVerifyRequest):
    try:
        return proctor_service.face_service.verify_candidate_face(
            payload.registered_descriptor,
            payload.current_descriptor,
            payload.threshold or 0.25
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect-eye")
async def detect_eye(payload: ImageFrameRequest):
    try:
        image = _decode_to_bgr(payload.image)
        if image is None:
            return {"faces_count": 0, "gaze_direction": "center", "blink_detected": False, "ear": 0.30}
        res = proctor_service.face_service.analyze_frame(image)
        faces = res.get("faces", [])
        return {
            "faces_count": res.get("faces_detected", 0),
            "gaze_direction": faces[0].get("gaze_direction") if faces else "center",
            "blink_detected": faces[0].get("blink_detected") if faces else False,
            "ear": faces[0].get("ear") if faces else 0.30
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect-headpose")
async def detect_headpose(payload: ImageFrameRequest):
    try:
        image = _decode_to_bgr(payload.image)
        if image is None:
            return {"faces_count": 0, "yaw": 0.0, "pitch": 0.0, "roll": 0.0, "looking_away": False}
        res = proctor_service.face_service.analyze_frame(image)
        faces = res.get("faces", [])
        return {
            "faces_count": res.get("faces_detected", 0),
            "yaw": faces[0].get("yaw") if faces else 0.0,
            "pitch": faces[0].get("pitch") if faces else 0.0,
            "roll": faces[0].get("roll") if faces else 0.0,
            "looking_away": res.get("looking_away", False)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect-objects")
async def detect_objects(payload: ImageFrameRequest):
    try:
        image = _decode_to_bgr(payload.image)
        return proctor_service.object_service.analyze_frame(image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect-audio")
async def detect_audio(payload: ImageFrameRequest):
    try:
        if not payload.audio:
            return {"noise_detected": False, "decibels": 0.0}
        audio_bytes = decode_image_bytes(payload.audio)
        return proctor_service.audio_service.analyze_audio_chunk(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/report-violation")
async def report_violation(payload: ReportViolationRequest):
    return {
        "violation_id": int(time.time()),
        "candidate_id": payload.candidate_id,
        "interview_id": payload.interview_id,
        "violation_type": payload.violation_type,
        "severity": payload.severity,
        "confidence": payload.confidence,
        "status": "LOGGED",
        "description": payload.description
    }


@app.post("/browser-event")
async def record_browser_event(payload: BrowserEventRequest):
    return {
        "status": "RECORDED",
        "session_id": payload.session_id,
        "event_type": payload.event_type,
        "timestamp": payload.timestamp,
        "violation_flagged": payload.event_type in [
            "FULLSCREEN_EXIT", "TAB_SWITCH", "COPY_PASTE", "DEVTOOLS_OPEN"
        ]
    }


@app.get("/interview-status")
def interview_status():
    return {
        "active_ai_sessions": 2,
        "engine_fps": 30.0,
        "average_confidence": 98.4,
        "status": "RUNNING"
    }


@app.get("/live-monitor")
def live_monitor():
    return {
        "running_sessions": [
            {"session_id": "16", "candidate": "Jane Doe", "violations_today": 0, "status": "SECURE"},
            {"session_id": "18", "candidate": "Alex Smith", "violations_today": 1, "status": "WARN"}
        ]
    }


@app.get("/ai-report/{session_id}")
def generate_ai_report(session_id: str):
    return {
        "session_id": session_id,
        "total_violations": 1,
        "face_statistics": {"face_present_percentage": 99.2, "multiple_faces_detected": 0},
        "object_statistics": {"phone_detections": 0, "books_detected": 0},
        "eye_tracking_summary": {"avg_gaze_alignment": 96.5, "excessive_blinks": 0},
        "risk_score": 5.0,
        "integrity_score": 95.0,
        "final_recommendation": "TRUSTED"
    }


# ─── WebSocket Proctoring Stream ──────────────────────────────────────────────

@app.websocket("/ws/proctor/{session_id}")
async def proctor_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connected for session: {session_id}")

    try:
        while True:
            data = await websocket.receive_json()
            image_base64 = data.get("image")
            audio_base64 = data.get("audio")

            if not image_base64:
                await websocket.send_json({"error": "No image field in packet"})
                continue

            img_bytes = decode_image_bytes(image_base64)
            audio_bytes = decode_image_bytes(audio_base64) if audio_base64 else None

            result = proctor_service.process_frame(img_bytes, audio_bytes)
            await websocket.send_json(result)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass
