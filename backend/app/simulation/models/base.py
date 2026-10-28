"""Base interfaces for continuous and discrete dynamical systems."""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Tuple


class DynamicalSystem(ABC):
    """Abstract base class for continuous-time dynamical systems (ODEs)."""

    name: str
    dimension: int
    default_parameters: Dict[str, float]
    default_initial_state: List[float]

    @abstractmethod
    def derivative(self, t: float, state: List[float], parameters: Dict[str, float]) -> List[float]:
        """Compute the phase-space velocity vector dx/dt at time t."""
        pass

    @abstractmethod
    def validate_state(self, state: List[float]) -> None:
        """Validate state dimension and numerical health."""
        pass

    @abstractmethod
    def validate_parameters(self, parameters: Dict[str, float]) -> None:
        """Validate parameter names and physical bounds."""
        pass


class DiscreteDynamicalSystem(ABC):
    """Abstract base class for discrete-time dynamical systems (Iterated Maps)."""

    name: str
    dimension: int
    default_parameters: Dict[str, float]
    default_initial_state: float

    @abstractmethod
    def step(self, state: float, parameters: Dict[str, float]) -> float:
        """Iterate state by one discrete step: x_{n+1} = f(x_n)."""
        pass

    @abstractmethod
    def validate_state(self, state: float) -> None:
        """Validate state domain."""
        pass

    @abstractmethod
    def validate_parameters(self, parameters: Dict[str, float]) -> None:
        """Validate parameter bounds."""
        pass
