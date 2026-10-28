"""Base interface for numerical ODE integrators."""

from abc import ABC, abstractmethod
from typing import Callable, List


class Integrator(ABC):
    """Abstract base class for numerical ODE integrators."""

    name: str
    order: int

    @abstractmethod
    def step(
        self,
        f: Callable[[float, List[float]], List[float]],
        t: float,
        y: List[float],
        dt: float
    ) -> List[float]:
        """Advance state y by one timestep dt."""
        pass
