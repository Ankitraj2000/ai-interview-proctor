from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    YOLO_MODEL_PATH: str = "yolov8n.pt"

    # Proctoring thresholds
    FACE_CONFIDENCE_THRESHOLD: float = 0.70
    LOOK_AWAY_YAW_THRESHOLD: float = 20.0    # degrees to left/right
    LOOK_AWAY_PITCH_THRESHOLD: float = 15.0  # degrees up/down
    AUDIO_DECIBEL_THRESHOLD: float = 65.0    # dB threshold

    # Pydantic v2 — replaces deprecated inner class Config
    model_config = SettingsConfigDict(
        env_prefix="AI_PROCTOR_",
        case_sensitive=True,
    )


settings = Settings()
