from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Models de Ollama 
    OLLAMA_MODEL: str = "gemma"
    
    # App
    APP_NAME: str = "AI Quiz Platform"
    APP_VERSION: str = "0.1.0"

    # Server
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/quiz"
    DEBUG: bool = False
    API_V1_STR: str = "/api"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
