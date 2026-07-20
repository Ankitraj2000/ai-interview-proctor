import numpy as np
from app.services.audio_service import AudioProctorService
from app.core.config import settings

def test_analyze_audio_chunk_silence():
    service = AudioProctorService()
    samples = np.zeros(1000, dtype=np.float32)
    audio_bytes = samples.tobytes()
    
    result = service.analyze_audio_chunk(audio_bytes)
    assert "noise_detected" in result
    assert "decibels" in result
    assert result["noise_detected"] is False
    assert result["decibels"] < settings.AUDIO_DECIBEL_THRESHOLD

def test_analyze_audio_chunk_loud():
    service = AudioProctorService()
    t = np.linspace(0, 1, 1000, endpoint=False)
    samples = np.sin(2 * np.pi * 440 * t).astype(np.float32) * 0.9
    audio_bytes = samples.tobytes()
    
    result = service.analyze_audio_chunk(audio_bytes)
    assert "noise_detected" in result
    assert "decibels" in result
    assert result["noise_detected"] is True
    assert result["decibels"] > settings.AUDIO_DECIBEL_THRESHOLD

def test_analyze_audio_chunk_empty():
    service = AudioProctorService()
    result = service.analyze_audio_chunk(b"")
    assert result["noise_detected"] is False
    assert result["decibels"] == 0.0
