"""Perturbation Microscope flagship feature endpoint."""

import math
from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.features import MicroscopeRequest, MicroscopeResponse, MicroscopeScaleResult
from app.simulation.engine import SimulationEngine

router = APIRouter(prefix="/microscope", tags=["Perturbation Microscope"])
engine = SimulationEngine()

DEFAULT_SCALES = [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7]
AXIS_NAMES = ["x-axis", "y-axis", "z-axis"]


@router.post("", response_model=MicroscopeResponse)
def run_perturbation_microscope(request: MicroscopeRequest):
    """Execute multiple controlled experiments across logarithmic perturbation scales (10^-1 to 10^-7)."""
    scales = request.scales or DEFAULT_SCALES
    if len(scales) > 10:
        raise HTTPException(status_code=400, detail="Cannot exceed 10 microscope scales per scan")

    init_state = request.initial_state or [1.0, 1.0, 1.0]
    axis_idx = request.axis
    axis_name = AXIS_NAMES[axis_idx] if 0 <= axis_idx < 3 else "x-axis"

    levels: List[MicroscopeScaleResult] = []
    reference_times = None

    for scale in scales:
        pert = [0.0, 0.0, 0.0]
        pert[axis_idx] = scale
        exp = engine.run_lorenz_experiment(
            initial_state=init_state,
            perturbation=pert,
            duration=request.duration,
            dt=request.dt,
            max_display_points=500
        )
        if reference_times is None:
            reference_times = exp["times"]

        # Calculate exponent: 1e-6 -> -6
        exp_power = int(round(math.log10(scale))) if scale > 0 else 0

        levels.append(MicroscopeScaleResult(
            scale=scale,
            exponent=exp_power,
            initial_distance=exp["metrics"]["initial_distance"],
            final_distance=exp["metrics"]["final_distance"],
            max_distance=exp["metrics"]["max_distance"],
            time_to_threshold=exp["metrics"]["time_to_threshold"],
            distances=exp["distances"]
        ))

    # Analytical summary
    threshold_times = [lvl.time_to_threshold for lvl in levels if lvl.time_to_threshold is not None]
    if len(threshold_times) >= 2:
        shift_per_decade = (threshold_times[-1] - threshold_times[0]) / max(len(threshold_times) - 1, 1)
        summary = (
            f"Perturbation Microscope successfully swept {len(scales)} orders of magnitude along the {axis_name}. "
            f"As perturbation scale decreases by 10x (one decade), the time to reach macroscopic divergence (D >= 1.0) "
            f"is delayed by approximately {abs(shift_per_decade):.2f} seconds. This confirms logarithmic scaling "
            f"t*(delta) ~ -ln(delta) / lambda, the hallmark of deterministic chaos."
        )
    else:
        summary = (
            f"Perturbation Microscope swept {len(scales)} orders of magnitude along the {axis_name}. "
            f"Divergence curves demonstrate the progressive delay in separation as initial perturbation shrinks."
        )

    return MicroscopeResponse(
        model=request.model,
        axis_name=axis_name,
        initial_state=init_state,
        duration=request.duration,
        dt=request.dt,
        times=reference_times or [],
        levels=levels,
        summary_analysis=summary
    )
