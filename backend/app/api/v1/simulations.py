"""Simulation execution endpoints."""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.simulation import SimulationRequest, SimulationResponse, LogisticSimulationResponse
from app.simulation.engine import SimulationEngine
from app.simulation.validation import SimulationValidationError

router = APIRouter(prefix="/simulations", tags=["Simulations"])
engine = SimulationEngine()

STANDARD_PRESETS = [
    {
        "id": "lorenz-canonical-micro-perturbation",
        "name": "Lorenz Canonical (10^-6 Perturbation)",
        "model": "lorenz",
        "description": "Standard benchmark with delta_x = 0.000001 illustrating the butterfly effect.",
        "initial_state": [1.0, 1.0, 1.0],
        "perturbation": [0.000001, 0.0, 0.0],
        "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667},
        "duration": 25.0,
        "dt": 0.01,
        "divergence_threshold": 1.0
    },
    {
        "id": "lorenz-zero-control",
        "name": "Lorenz Zero Perturbation (Control)",
        "model": "lorenz",
        "description": "Control experiment verifying that identical deterministic inputs produce 100% identical outputs.",
        "initial_state": [1.0, 1.0, 1.0],
        "perturbation": [0.0, 0.0, 0.0],
        "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667},
        "duration": 25.0,
        "dt": 0.01,
        "divergence_threshold": 1.0
    },
    {
        "id": "lorenz-saddle-sensitivity",
        "name": "Lorenz Saddle Sensitivity",
        "model": "lorenz",
        "description": "Origin saddle point test where small disturbances cause divergent lobe escapes.",
        "initial_state": [0.1, 0.1, 0.1],
        "perturbation": [0.00001, 0.0, 0.0],
        "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667},
        "duration": 20.0,
        "dt": 0.01,
        "divergence_threshold": 1.0
    },
    {
        "id": "logistic-chaotic-regime",
        "name": "Logistic Map (r = 3.9 Chaos)",
        "model": "logistic",
        "description": "Discrete quadratic iteration in the fully chaotic parameter regime.",
        "initial_state": [0.5],
        "perturbation": [0.000001],
        "parameters": {"r": 3.9},
        "duration": 60.0,
        "dt": 1.0,
        "divergence_threshold": 0.1
    },
    {
        "id": "logistic-period-4-window",
        "name": "Logistic Map (r = 3.5 Period-4 Cycle)",
        "model": "logistic",
        "description": "Periodic limit cycle before the infinite period-doubling accumulation point.",
        "initial_state": [0.5],
        "perturbation": [0.000001],
        "parameters": {"r": 3.5},
        "duration": 60.0,
        "dt": 1.0,
        "divergence_threshold": 0.1
    }
]


@router.get("/presets")
def get_presets() -> List[Dict[str, Any]]:
    """Retrieve standard benchmark experiment presets."""
    return STANDARD_PRESETS


@router.post("", response_model=Dict[str, Any])
def run_simulation(request: SimulationRequest):
    """Execute deterministic numerical simulation and compute exact divergence metrics."""
    try:
        if request.model == "lorenz":
            result = engine.run_lorenz_experiment(
                initial_state=request.initial_state,
                perturbation=request.perturbation,
                parameters=request.parameters,
                duration=request.duration,
                dt=request.dt,
                max_display_points=request.max_display_points,
                divergence_threshold=request.divergence_threshold
            )
            return result

        elif request.model == "logistic":
            x0 = request.initial_state[0] if request.initial_state else 0.5
            pert = request.perturbation[0] if request.perturbation else 0.000001
            r = request.parameters.get("r", 3.9) if request.parameters else 3.9
            iterations = int(request.duration) if request.duration else 100

            result = engine.run_logistic_experiment(
                x0=x0,
                perturbation=pert,
                r=r,
                iterations=iterations
            )
            return result

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model: {request.model}")

    except SimulationValidationError as e:
        raise HTTPException(status_code=422, detail=f"Invalid simulation configuration: {str(e)}")
    except FloatingPointError as e:
        raise HTTPException(status_code=400, detail=f"Numerical instability: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation computation error: {str(e)}")
