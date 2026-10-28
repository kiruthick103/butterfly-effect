"""Distance metrics in phase space."""

import math
from typing import List


def euclidean_distance(state1: List[float], state2: List[float]) -> float:
    """Calculate Euclidean distance between two states in phase space:

    D = sqrt( sum( (state1_i - state2_i)^2 ) )
    """
    if len(state1) != len(state2):
        raise ValueError(f"State dimensions mismatch: {len(state1)} vs {len(state2)}")
    total = sum((a - b) ** 2 for a, b in zip(state1, state2))
    return math.sqrt(total)


def logarithmic_divergence(distance: float, initial_distance: float) -> float:
    """Calculate logarithmic separation ratio ln(D(t) / D(0)).

    Guards against division by zero or negative/zero distances.
    """
    eps = 1e-15
    d = max(eps, distance)
    d0 = max(eps, initial_distance)
    return math.log(d / d0)
