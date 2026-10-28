"""Lorenz 1963 atmospheric convection model.

Scientific Reference:
Lorenz, E. N. (1963). Deterministic Nonperiodic Flow. Journal of the Atmospheric Sciences, 20(2), 130-141.
"""

import math
from typing import Dict, List
from .base import DynamicalSystem


class LorenzSystem(DynamicalSystem):
    """Lorenz-63 Three-Dimensional Autonomous Chaotic ODE System."""

    name = "lorenz"
    dimension = 3
    default_parameters: Dict[str, float] = {
        "sigma": 10.0,
        "rho": 28.0,
        "beta": 8.0 / 3.0,
    }
    default_initial_state: List[float] = [1.0, 1.0, 1.0]

    def derivative(self, t: float, state: List[float], parameters: Dict[str, float]) -> List[float]:
        """Compute the instantaneous time derivative [dx/dt, dy/dt, dz/dt]."""
        x, y, z = state
        sigma = parameters.get("sigma", 10.0)
        rho = parameters.get("rho", 28.0)
        beta = parameters.get("beta", 8.0 / 3.0)

        dx = sigma * (y - x)
        dy = x * (rho - z) - y
        dz = x * y - beta * z

        return [dx, dy, dz]

    def validate_state(self, state: List[float]) -> None:
        """Ensure state has 3 valid numerical coordinates within finite bounds."""
        if not isinstance(state, (list, tuple)) or len(state) != 3:
            raise ValueError(f"Lorenz state must be a 3D coordinate [x, y, z], got {state}")
        for idx, val in enumerate(state):
            if val is None or math.isnan(val) or math.isinf(val):
                raise ValueError(f"State coordinate at index {idx} is invalid: {val}")
            if abs(val) > 1e4:
                raise ValueError(f"State coordinate at index {idx} ({val}) exceeds stability bound (|val| <= 10000)")

    def validate_parameters(self, parameters: Dict[str, float]) -> None:
        """Validate parameter ranges for physical and numerical stability."""
        if not isinstance(parameters, dict):
            raise ValueError("Parameters must be provided as a dictionary")

        for key in ("sigma", "rho", "beta"):
            if key not in parameters:
                continue
            val = parameters[key]
            if val is None or math.isnan(val) or math.isinf(val):
                raise ValueError(f"Parameter '{key}' has non-finite value: {val}")
            if val <= 0:
                raise ValueError(f"Parameter '{key}' must be strictly positive, got {val}")
            if val > 500.0:
                raise ValueError(f"Parameter '{key}' exceeds maximum permitted bound of 500.0")
