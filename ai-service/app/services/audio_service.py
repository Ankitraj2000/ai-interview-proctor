import numpy as np
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class AudioProctorService:
    def __init__(self):
        # We target settings.AUDIO_DECIBEL_THRESHOLD
        pass

    def analyze_audio_chunk(self, audio_bytes: bytes) -> dict:
        """
        Analyzes a chunk of raw floating point PCM audio data (32-bit float).
        The browser Web Audio API typically outputs 32-bit float PCM data (-1.0 to 1.0).
        """
        if not audio_bytes:
            return {"noise_detected": False, "decibels": 0.0}

        try:
            # Convert raw bytes to float32 numpy array
            samples = np.frombuffer(audio_bytes, dtype=np.float32)
            
            if len(samples) == 0:
                return {"noise_detected": False, "decibels": 0.0}
            
            # Calculate Root Mean Square (RMS) energy
            rms = np.sqrt(np.mean(np.square(samples)))
            
            # Calculate Decibels relative to standard full scale (adding epsilon to avoid log(0))
            # Reference: 20 * log10(rms) + 120 (to scale float PCM to typical ambient dB range 0-100)
            decibels = 20 * np.log10(rms + 1e-5) + 100.0
            decibels = float(np.clip(decibels, 0.0, 120.0))
            
            noise_detected = decibels > settings.AUDIO_DECIBEL_THRESHOLD
            
            return {
                "noise_detected": noise_detected,
                "decibels": round(decibels, 2)
            }
        except Exception as e:
            logger.error(f"Error analyzing audio chunk: {e}")
            return {"noise_detected": False, "decibels": 0.0}
