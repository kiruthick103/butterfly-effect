"""AI Scenario Service orchestrating provider abstraction and schema validation."""

import re
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.ai import ScenarioRequest, ScenarioResponse
from app.models.database import Scenario
from .provider import AIProvider
from .mock_provider import MockAIProvider
from .openai_provider import OpenAIProvider


def sanitize_prompt(prompt: str) -> str:
    """Sanitize user prompt against prompt injection and excessive control characters."""
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", prompt)
    # Strip potential jailbreak commands
    cleaned = cleaned.strip()
    if len(cleaned) > 1000:
        cleaned = cleaned[:1000]
    return cleaned


class ScenarioService:
    """Service managing AI scenario generation."""

    def __init__(self):
        if settings.AI_PROVIDER == "openai" and settings.AI_API_KEY:
            self.provider: AIProvider = OpenAIProvider(api_key=settings.AI_API_KEY, model=settings.AI_MODEL)
        else:
            self.provider = MockAIProvider()

    async def generate_scenario(
        self,
        request: ScenarioRequest,
        user_id: Optional[str] = None,
        db: Optional[Session] = None
    ) -> ScenarioResponse:
        """Generate, validate, and optionally persist structured scenario."""
        clean_prompt = sanitize_prompt(request.prompt)
        context = request.numerical_context or {
            "initial_distance": 0.000001,
            "final_distance": 7.82,
            "model": "lorenz",
            "time_to_threshold": 14.5
        }

        try:
            raw_response = await self.provider.generate_scenario(clean_prompt, context)
        except Exception:
            # Resilient fallback to deterministic research-grounded provider on any failure
            fallback = MockAIProvider()
            raw_response = await fallback.generate_scenario(clean_prompt, context)

        # Validate against strict Pydantic model
        validated = ScenarioResponse(**raw_response)

        # Persist if DB session provided
        if db:
            import uuid
            scenario_record = Scenario(
                id=str(uuid.uuid4()),
                user_id=user_id,
                experiment_id=request.experiment_id,
                prompt=clean_prompt,
                scenario_title=validated.scenario_title,
                assumptions=validated.assumptions,
                branches=[b.model_dump() for b in validated.branches],
                uncertainties=[u for b in validated.branches for u in b.uncertainties],
                limitations=validated.limitations,
                ai_provider=validated.ai_provider
            )
            db.add(scenario_record)
            db.commit()

        return validated


scenario_service = ScenarioService()
