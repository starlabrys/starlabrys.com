from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ADVISOR_DIR = Path(__file__).resolve().parent.parent
_ROOT_DIR = _ADVISOR_DIR.parent

_settings = None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_ROOT_DIR / ".env", _ADVISOR_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    advisor_cors_origins: str = "http://localhost:30000,http://127.0.0.1:30000"
    advisor_rate_limit_per_minute: int = 30
    advisor_llm_api_key: str = ""
    advisor_llm_base_url: str = "https://api.openai.com/v1"
    advisor_llm_model: str = "gpt-4o-mini"
    advisor_llm_timeout_seconds: float = 45.0

    @property
    def cors_origin_list(self):
        result = []
        parts = self.advisor_cors_origins.split(",")
        for part in parts:
            item = part.strip()
            if item:
                result.append(item)
        return result


def get_settings():
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
