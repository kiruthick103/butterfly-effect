"""Application configuration and environment settings."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

    PROJECT_NAME: str = "AI Butterfly Effect Lab"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./butterfly_effect.db")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "butterfly-effect-super-secret-key-change-in-production-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    # AI Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "synthesis")  # Unified AI Synthesis Engine
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "qwen/qwen3.8-27b")

    # Simulation Resource Limits (OWASP / DoS protection)
    MAX_SIMULATION_STEPS: int = 100000
    MAX_SIMULATION_DURATION: float = 100.0
    MIN_SIMULATION_DT: float = 0.0001
    MAX_SIMULATION_DT: float = 0.5
    MAX_HEATMAP_GRID_SIZE: int = 35  # Max 35x35 = 1,225 runs per heatmap request
    MAX_MICROSCOPE_LEVELS: int = 10
    SIMULATION_DEFAULT_TRIALS: int = 1000
    SIMULATION_MAX_TRIALS: int = 5000



settings = Settings()
