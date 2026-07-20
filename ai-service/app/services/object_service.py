import os
import cv2
import logging
from ultralytics import YOLO
from app.core.config import settings

logger = logging.getLogger(__name__)

class ObjectProctorService:
    def __init__(self):
        model_name = settings.YOLO_MODEL_PATH
        logger.info(f"Loading YOLOv8 model: {model_name}...")
        try:
            self.model = YOLO(model_name)
            logger.info("YOLOv8 model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load YOLOv8 model: {e}. Running in dummy mode.")
            self.model = None

    def analyze_frame(self, image_bgr):
        if self.model is None:
            return {
                "phone_detected": False,
                "multiple_people": False,
                "objects_detected": []
            }

        # Run YOLOv8 prediction
        results = self.model.predict(
            source=image_bgr,
            verbose=False,
            device="cpu",
            conf=0.35
        )
        
        phone_detected = False
        book_detected = False
        laptop_detected = False
        person_count = 0
        objects = []
        
        if results and len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                class_name = self.model.names[class_id]
                bbox = [float(val) for val in box.xyxy[0].tolist()]

                if class_id == 0:  # person
                    person_count += 1
                elif class_id == 67:  # cell phone
                    phone_detected = True
                elif class_id == 73:  # book
                    book_detected = True
                elif class_id == 63:  # laptop
                    laptop_detected = True
                    
                objects.append({
                    "class": class_name,
                    "confidence": round(confidence, 3),
                    "box": bbox
                })
                
        multiple_people = person_count > 1
        
        return {
            "phone_detected": phone_detected,
            "book_detected": book_detected,
            "laptop_detected": laptop_detected,
            "multiple_people": multiple_people,
            "person_count": person_count,
            "objects_detected": objects
        }
