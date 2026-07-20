import cv2
import numpy as np
import logging
from app.services.face_service import FaceProctorService
from app.services.object_service import ObjectProctorService
from app.services.audio_service import AudioProctorService

logger = logging.getLogger(__name__)

class ProctorService:
    def __init__(self):
        self.face_service = FaceProctorService()
        self.object_service = ObjectProctorService()
        self.audio_service = AudioProctorService()
        
        # Anomaly detection state
        self.pose_history = []
        self.last_frame_gray = None
        self.frozen_frames_count = 0

    def process_frame(self, image_bytes: bytes, audio_bytes: bytes = None) -> dict:
        """
        Decodes incoming image frame, performs vision analysis, performs audio analysis,
        and calculates a consolidated frame cheating score.
        """
        # 1. Decode Image BGR
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("Could not decode image from WebSocket packet.")
            return {"error": "Invalid image payload"}

        # 2. Analyze face landmarks
        face_result = self.face_service.analyze_frame(image)
        
        # 3. Analyze objects (YOLO)
        object_result = self.object_service.analyze_frame(image)
        
        # 4. Analyze audio if provided
        audio_result = {"noise_detected": False, "decibels": 0.0}
        if audio_bytes:
            audio_result = self.audio_service.analyze_audio_chunk(audio_bytes)

        # 5. Calculate Cheating Score for this window
        cheating_score = 0.0
        events = []

        # A. Camera Blocked / Covered / Black Screen Detection
        avg_brightness = float(np.mean(image))
        if avg_brightness < 12.0:
            cheating_score += 50.0
            events.append("CAMERA_BLOCKED")

        # B. Camera Frozen Detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray_resized = cv2.resize(gray, (80, 60))
        if self.last_frame_gray is not None:
            diff = cv2.absdiff(self.last_frame_gray, gray_resized)
            mean_diff = float(np.mean(diff))
            if mean_diff < 0.1:
                self.frozen_frames_count += 1
            else:
                self.frozen_frames_count = 0
        self.last_frame_gray = gray_resized

        if self.frozen_frames_count > 8:
            cheating_score += 40.0
            events.append("CAMERA_FROZEN")

        # C. Static Image Attack / Virtual Camera Detection (Pose variance check)
        if face_result["faces_detected"] == 1:
            yaw = face_result["faces"][0]["yaw"]
            pitch = face_result["faces"][0]["pitch"]
            roll = face_result["faces"][0]["roll"]
            self.pose_history.append((yaw, pitch, roll))
            if len(self.pose_history) > 15:
                self.pose_history.pop(0)
                
            if len(self.pose_history) >= 12:
                yaws = [p[0] for p in self.pose_history]
                pitches = [p[1] for p in self.pose_history]
                rolls = [p[2] for p in self.pose_history]
                
                var_y = np.var(yaws)
                var_p = np.var(pitches)
                var_r = np.var(rolls)
                total_var = var_y + var_p + var_r
                
                if total_var < 0.0001:
                    cheating_score += 70.0
                    events.append("STATIC_IMAGE_ATTACK")

        # D. Standard Vision / Object Penalties
        # No face detected
        if face_result["faces_detected"] == 0:
            cheating_score += 40.0
            events.append("FACE_MISSING")
        # Multiple faces
        elif face_result["multiple_faces"] or object_result["multiple_people"]:
            cheating_score += 60.0
            events.append("MULTIPLE_PEOPLE")
        # Looking away
        elif face_result["looking_away"]:
            cheating_score += 20.0
            events.append("LOOKING_AWAY")

        # Cell phone detected
        if object_result["phone_detected"]:
            cheating_score += 80.0
            events.append("PHONE_DETECTED")

        # Noise / Voice detected
        if audio_result["noise_detected"]:
            cheating_score += 15.0
            events.append("SUSPICIOUS_AUDIO")

        # Clip final cheating score to maximum 100.0
        cheating_score = min(cheating_score, 100.0)

        return {
            "cheating_score": round(cheating_score, 2),
            "events_flagged": events,
            "face_analysis": {
                "faces_detected": face_result["faces_detected"],
                "looking_away": face_result["looking_away"],
                "gaze_details": face_result["faces"]
            },
            "object_analysis": {
                "phone_detected": object_result["phone_detected"],
                "person_count": object_result["person_count"],
                "detections": [
                    {"class": obj["class"], "confidence": round(obj["confidence"], 2)}
                    for obj in object_result["objects_detected"]
                ]
            },
            "audio_analysis": audio_result
        }

    def shutdown(self):
        self.face_service.close()
