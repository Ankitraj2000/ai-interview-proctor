import warnings
from unittest.mock import patch
from fastapi.testclient import TestClient

# Suppress httpx/starlette deprecation warning from newer FastAPI versions
warnings.filterwarnings("ignore", category=DeprecationWarning, module="starlette")

# Import the FastAPI app under test
from main import app

client = TestClient(app)


def test_health_check():
    """Health endpoint returns status=healthy and yolo_model field."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "yolo_model" in data


@patch('main.proctor_service')
def test_analyze_frame_endpoint(mock_service_instance):
    """POST /analyze-frame returns proctoring results from the mocked service."""
    mock_service_instance.process_frame.return_value = {
        "cheating_score": 10.0,
        "events_flagged": ["LOOKING_AWAY"]
    }

    payload = {
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        "audio": "data:audio/wav;base64,AAAA"
    }

    response = client.post("/analyze-frame", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cheating_score"] == 10.0
    assert "LOOKING_AWAY" in data["events_flagged"]

    mock_service_instance.process_frame.assert_called_once()

