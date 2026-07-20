import cv2
import numpy as np
import mediapipe as mp
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class FaceProctorService:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=5,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # 3D model points of a standard head.
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ], dtype=np.float32)

    def _calc_ear(self, landmarks, eye_indices, w, h):
        """Calculates Eye Aspect Ratio (EAR) for blink detection."""
        try:
            p1 = np.array([landmarks[eye_indices[0]].x * w, landmarks[eye_indices[0]].y * h])
            p2 = np.array([landmarks[eye_indices[1]].x * w, landmarks[eye_indices[1]].y * h])
            p3 = np.array([landmarks[eye_indices[2]].x * w, landmarks[eye_indices[2]].y * h])
            p4 = np.array([landmarks[eye_indices[3]].x * w, landmarks[eye_indices[3]].y * h])
            p5 = np.array([landmarks[eye_indices[4]].x * w, landmarks[eye_indices[4]].y * h])
            p6 = np.array([landmarks[eye_indices[5]].x * w, landmarks[eye_indices[5]].y * h])

            ear = (np.linalg.norm(p2 - p6) + np.linalg.norm(p3 - p5)) / (2.0 * np.linalg.norm(p1 - p4) + 1e-6)
            return float(ear)
        except Exception:
            return 0.30

    def analyze_frame(self, image_bgr):
        h, w, c = image_bgr.shape
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(image_rgb)
        
        faces_data = []
        
        if not results.multi_face_landmarks:
            return {
                "faces_detected": 0,
                "looking_away": False,
                "multiple_faces": False,
                "faces": []
            }
            
        faces_detected = len(results.multi_face_landmarks)
        multiple_faces = faces_detected > 1
        looking_away_overall = False
        
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark

            # Bounding box
            xs = [l.x * w for l in landmarks]
            ys = [l.y * h for l in landmarks]
            bbox = [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))]
            
            # Key 2D points for PnP
            image_points = np.array([
                (landmarks[1].x * w, landmarks[1].y * h),       # Nose tip
                (landmarks[152].x * w, landmarks[152].y * h),   # Chin
                (landmarks[33].x * w, landmarks[33].y * h),     # Left eye corner
                (landmarks[263].x * w, landmarks[263].y * h),   # Right eye corner
                (landmarks[61].x * w, landmarks[61].y * h),     # Left mouth corner
                (landmarks[291].x * w, landmarks[291].y * h)    # Right mouth corner
            ], dtype=np.float32)

            focal_length = w
            center = (w / 2, h / 2)
            camera_matrix = np.array([
                [focal_length, 0, center[0]],
                [0, focal_length, center[1]],
                [0, 0, 1]
            ], dtype=np.float32)

            dist_coeffs = np.zeros((4, 1))
            success, rotation_vector, translation_vector = cv2.solvePnP(
                self.model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
            )

            yaw, pitch, roll = 0.0, 0.0, 0.0
            if success:
                rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
                proj_matrix = np.hstack((rotation_matrix, translation_vector))
                _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)
                pitch = float(euler_angles[0][0])
                yaw = float(euler_angles[1][0])
                roll = float(euler_angles[2][0])

            looking_away = (
                abs(yaw) > settings.LOOK_AWAY_YAW_THRESHOLD or 
                abs(pitch) > settings.LOOK_AWAY_PITCH_THRESHOLD
            )
            
            if looking_away:
                looking_away_overall = True

            # Blink Detection (EAR)
            # Left Eye: 33, 160, 158, 133, 153, 144
            left_ear = self._calc_ear(landmarks, [33, 160, 158, 133, 153, 144], w, h)
            blink_detected = left_ear < 0.20

            # Gaze Estimation
            gaze_direction = "center"
            try:
                le_inner = np.array([landmarks[133].x * w, landmarks[133].y * h])
                le_outer = np.array([landmarks[33].x * w, landmarks[33].y * h])
                le_iris = np.array([landmarks[468].x * w, landmarks[468].y * h])
                d_inner = np.linalg.norm(le_iris - le_inner)
                d_outer = np.linalg.norm(le_iris - le_outer)
                gaze_ratio = d_inner / (d_outer + 1e-6)
                
                if gaze_ratio < 0.6:
                    gaze_direction = "right"
                elif gaze_ratio > 1.7:
                    gaze_direction = "left"
            except (IndexError, AttributeError):
                pass

            # Landmark Descriptor for verification
            landmark_vector = [float(landmarks[i].x) for i in range(0, 468, 10)]

            faces_data.append({
                "bbox": bbox,
                "yaw": round(yaw, 2),
                "pitch": round(pitch, 2),
                "roll": round(roll, 2),
                "looking_away": looking_away,
                "gaze_direction": gaze_direction,
                "blink_detected": blink_detected,
                "ear": round(left_ear, 3),
                "descriptor": landmark_vector
            })

        return {
            "faces_detected": faces_detected,
            "looking_away": looking_away_overall,
            "multiple_faces": multiple_faces,
            "faces": faces_data
        }

    def verify_candidate_face(self, registered_descriptor, current_descriptor, threshold=0.25):
        """Verifies candidate identity by calculating landmark Euclidean distance."""
        if not registered_descriptor or not current_descriptor:
            return {"is_matched": True, "similarity_score": 100.0}

        vec1 = np.array(registered_descriptor)
        vec2 = np.array(current_descriptor)
        if len(vec1) != len(vec2):
            return {"is_matched": True, "similarity_score": 100.0}

        dist = float(np.linalg.norm(vec1 - vec2))
        similarity = float(max(0.0, 100.0 - (dist * 100.0)))
        is_matched = dist <= threshold

        return {
            "is_matched": is_matched,
            "similarity_score": round(similarity, 2),
            "distance": round(dist, 4)
        }

    def close(self):
        self.face_mesh.close()
