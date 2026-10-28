"""AI Provider abstract base interface."""

from abc import ABC, abstractmethod
from typing import Dict, Any


class AIProvider(ABC):
    """Abstract base provider for LLM scenario generation."""

    name: str

    @abstractmethod
    async def generate_scenario(
        self,
        prompt: str,
        numerical_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured scenario branches with assumptions and uncertainties."""
        pass
