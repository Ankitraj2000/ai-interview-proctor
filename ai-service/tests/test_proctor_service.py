from unittest.mock import MagicMock, patch
import numpy as np
from app.services.proctor_service import ProctorService

@patch('app.services.proctor_service.FaceProctorService')
@patch('app.services.proctor_service.ObjectProctorService')
@patch('app.services.proctor_service.AudioProctorService')
@patch('cv2.imdecode')
def test_process_frame_no_violations(mock_imdecode, mock_audio_cls, mock_object_cls, mock_face_cls):
    # Set up mock instances
    mock_face = mock_face_cls.return_value
    mock_object = mock_object_cls.return_value
    mock_audio = mock_audio_cls.return_value
    
    # Mock return values for success state (no violations)
    mock_imdecode.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    
    mock_face.analyze_frame.return_value = {
        "faces_detected": 1,
        "looking_away": False,
        "multiple_faces": False,
        "faces": [{"yaw": 0.0, "pitch": 0.0, "roll": 0.0, "looking_away": False, "gaze_direction": "center"}]
    }
    mock_object.analyze_frame.return_value = {
        "phone_detected": False,
        "multiple_people": False,
        "person_count": 1,
        "objects_detected": []
    }
    mock_audio.analyze_audio_chunk.return_value = {
        "noise_detected": False,
        "decibels": 45.0
    }
    
    service = ProctorService()
    result = service.process_frame(b"dummy_image_bytes", b"dummy_audio_bytes")
    
    assert result["cheating_score"] == 0.0
    assert len(result["events_flagged"]) == 0
    assert result["face_analysis"]["faces_detected"] == 1
    assert result["object_analysis"]["phone_detected"] is False

@patch('app.services.proctor_service.FaceProctorService')
@patch('app.services.proctor_service.ObjectProctorService')
@patch('app.services.proctor_service.AudioProctorService')
@patch('cv2.imdecode')
def test_process_frame_multiple_violations(mock_imdecode, mock_audio_cls, mock_object_cls, mock_face_cls):
    mock_face = mock_face_cls.return_value
    mock_object = mock_object_cls.return_value
    mock_audio = mock_audio_cls.return_value
    
    mock_imdecode.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Mock values: phone detected and noise detected
    mock_face.analyze_frame.return_value = {
        "faces_detected": 1,
        "looking_away": False,
        "multiple_faces": False,
        "faces": [{"yaw": 0.0, "pitch": 0.0, "roll": 0.0, "looking_away": False, "gaze_direction": "center"}]
    }
    mock_object.analyze_frame.return_value = {
        "phone_detected": True, # +80.0
        "multiple_people": False,
        "person_count": 1,
        "objects_detected": [{"class": "cell phone", "confidence": 0.85, "box": [0,0,10,10]}]
    }
    mock_audio.analyze_audio_chunk.return_value = {
        "noise_detected": True, # +15.0
        "decibels": 75.0
    }
    
    service = ProctorService()
    result = service.process_frame(b"dummy_image_bytes", b"dummy_audio_bytes")
    
    assert result["cheating_score"] == 95.0
    assert "PHONE_DETECTED" in result["events_flagged"]
    assert "SUSPICIOUS_AUDIO" in result["events_flagged"]
