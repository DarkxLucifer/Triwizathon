import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ScoutForge"
    SECRET_KEY: str = "scoutforge-dev-secret-key-change-for-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    DATABASE_URL: str = "sqlite:///./scoutforge.db"
    PANDASCORE_API_KEY: str = "C7-JS9mtsSnbxSYr7ycz4I8ZO_S9TyPUaO_LVD9wNY-o13FD5P8"
    LEETIFY_API_KEY: Optional[str] = "9d02b2b6-d0b2-4372-bbc3-5823f9f925bc"
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    WHISPER_MODEL_SIZE: str = "small"
    WHISPER_DEVICE: str = "cuda"
    UPLOAD_DIR: str = "./uploads"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
