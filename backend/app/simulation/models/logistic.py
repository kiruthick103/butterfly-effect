"""Logistic Map discrete dynamical system.

Scientific Reference:
May, R. M. (1976). Simple mathematical models with very complicated dynamics. Nature, 261, 459-467.
"""

import math
from typing import Dict, List, Tuple, Any
from .base import DiscreteDynamicalSystem


class LogisticMap(DiscreteDynamicalSystem):
    """One-Dimensional Quadratic Iterated Map: x_{n+1} = r * x_n * (1 - x_n)."""

    name = "logistic"
    dimension = 1
    default_parameters: Dict[str, float] = {
        "r": 3.9,
    }
    default_initial_state: float = 0.5

    def step(self, state: float, parameters: Dict[str, float]) -> float:
        """Compute the next state x_{n+1}."""
        r = parameters.get("r", 3.9)
        return r * state * (1.0 - state)

    def validate_state(self, state: float) -> None:
        """Ensure initial condition is strictly within the unit interval (0, 1)."""
        if state is None or math.isnan(state) or math.isinf(state):
            raise ValueError(f"State value is non-finite: {state}")
        if state <= 0.0 or state >= 1.0:
            raise ValueError(f"Logistic initial state must be strictly in (0, 1), got {state}")

    def validate_parameters(self, parameters: Dict[str, float]) -> None:
        """Validate parameter r in range [0, 4]."""
        if not isinstance(parameters, dict):
            raise ValueError("Parameters must be a dictionary")
        if "r" in parameters:
            r = parameters["r"]
            if r is None or math.isnan(r) or math.isinf(r):
                raise ValueError(f"Parameter 'r' is non-finite: {r}")
            if r < 0.0 or r > 4.0:
                raise ValueError(f"Parameter 'r' must be in [0.0, 4.0], got {r}")

    def compute_orbit(
        self,
        x0: float,
        r: float,
        iterations: int,
        burn_in: int = 0
    ) -> List[float]:
        """Compute iterated orbit values after discarding burn-in iterations."""
        self.validate_state(x0)
        self.validate_parameters({"r": r})
        if iterations < 1:
            raise ValueError("Iterations must be at least 1")
        if iterations > 20000:
            raise ValueError("Iterations exceed max limit of 20000")

        curr = x0
        for _ in range(burn_in):
            curr = r * curr * (1.0 - curr)
            if curr < 0.0 or curr > 1.0:
                curr = max(0.0, min(1.0, curr))

        orbit: List[float] = [curr]
        for _ in range(iterations - 1):
            curr = r * curr * (1.0 - curr)
            if curr < 0.0 or curr > 1.0:
                curr = max(0.0, min(1.0, curr))
            orbit.append(curr)

        return orbit

    def compute_bifurcation(
        self,
        r_min: float = 2.4,
        r_max: float = 4.0,
        r_steps: int = 400,
        iterations: int = 150,
        burn_in: int = 250,
        x0: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Generate bifurcation diagram data points (r vs asymptotic attractor values)."""
        r_min = max(0.0, min(r_min, 3.99))
        r_max = max(r_min + 0.01, min(r_max, 4.0))
        r_steps = max(50, min(r_steps, 800))

        results = []
        dr = (r_max - r_min) / float(r_steps - 1)

        for step in range(r_steps):
            r = r_min + step * dr
            orbit = self.compute_orbit(x0=x0, r=r, iterations=iterations, burn_in=burn_in)
            # Store rounded points for compact transmission
            unique_vals = sorted(list({round(v, 4) for v in orbit}))
            results.append({
                "r": round(r, 4),
                "values": unique_vals
            })

        return results
