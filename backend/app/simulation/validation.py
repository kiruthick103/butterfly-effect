"""Simulation input validation and safety assertions."""

import math
from typing import Dict, List, Any


MAX_DURATION = 100.0
MIN_DT = 0.0001
MAX_DT = 0.5
MAX_SIMULATION_STEPS = 100000
MAX_COORDINATE_MAGNITUDE = 10000.0


class SimulationValidationError(ValueError):
    """Raised when simulation parameters or states fail safety or validity checks."""
    pass


def validate_simulation_inputs(
    model_name: str,
    initial_state: List[float],
    perturbation: List[float],
    duration: float,
    dt: float,
    parameters: Dict[str, float]
) -> None:
    """Validate all simulation parameters before computation."""
    # 1. Model name
    if model_name not in ("lorenz", "logistic"):
        raise SimulationValidationError(f"Unsupported model: '{model_name}'. Supported models: 'lorenz', 'logistic'")

    # 2. Duration checks
    if duration is None or math.isnan(duration) or math.isinf(duration):
        raise SimulationValidationError(f"Duration must be a finite number, got {duration}")
    if duration <= 0.0:
        raise SimulationValidationError(f"Duration must be strictly positive (> 0), got {duration}")
    if duration > MAX_DURATION:
        raise SimulationValidationError(f"Duration ({duration}) exceeds maximum permitted duration of {MAX_DURATION}s")

    # 3. Timestep (dt) checks
    if dt is None or math.isnan(dt) or math.isinf(dt):
        raise SimulationValidationError(f"Timestep dt must be a finite number, got {dt}")
    if dt <= 0.0:
        raise SimulationValidationError(f"Timestep dt must be strictly positive (> 0), got {dt}")
    if dt < MIN_DT:
        raise SimulationValidationError(f"Timestep dt ({dt}) is below minimum allowable dt of {MIN_DT}")
    if dt > MAX_DT:
        raise SimulationValidationError(f"Timestep dt ({dt}) exceeds maximum allowable dt of {MAX_DT}")

    # 4. Total steps check
    steps = int(math.ceil(duration / dt))
    if steps > MAX_SIMULATION_STEPS:
        raise SimulationValidationError(
            f"Requested configuration requires {steps} steps, which exceeds step limit of {MAX_SIMULATION_STEPS}"
        )

    # 5. State and perturbation checks
    if not isinstance(initial_state, (list, tuple)):
        raise SimulationValidationError("Initial state must be a list of numbers")
    if not isinstance(perturbation, (list, tuple)):
        raise SimulationValidationError("Perturbation must be a list of numbers")

    if len(initial_state) != len(perturbation):
        raise SimulationValidationError(
            f"Dimension mismatch: initial_state has {len(initial_state)} coords, perturbation has {len(perturbation)}"
        )

    for i, (val, delta) in enumerate(zip(initial_state, perturbation)):
        if val is None or math.isnan(val) or math.isinf(val):
            raise SimulationValidationError(f"Initial state coordinate {i} is invalid (NaN/Inf): {val}")
        if delta is None or math.isnan(delta) or math.isinf(delta):
            raise SimulationValidationError(f"Perturbation coordinate {i} is invalid (NaN/Inf): {delta}")
        if abs(val) > MAX_COORDINATE_MAGNITUDE:
            raise SimulationValidationError(
                f"Initial state coordinate {i} ({val}) exceeds maximum bound of {MAX_COORDINATE_MAGNITUDE}"
            )
        if abs(delta) > MAX_COORDINATE_MAGNITUDE:
            raise SimulationValidationError(
                f"Perturbation coordinate {i} ({delta}) exceeds maximum bound of {MAX_COORDINATE_MAGNITUDE}"
            )


def check_state_health(state: List[float], step_idx: int) -> None:
    """Check for numerical overflow or non-finite numbers during step execution."""
    for i, val in enumerate(state):
        if math.isnan(val) or math.isinf(val) or abs(val) > MAX_COORDINATE_MAGNITUDE:
            raise FloatingPointError(
                f"Numerical overflow or divergence to infinity detected at step {step_idx}, coordinate {i}: {val}"
            )
