"""Sensitivity Heatmap flagship feature endpoint."""

import time
from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.features import HeatmapRequest, HeatmapResponse
from app.simulation.engine import SimulationEngine
from app.core.config import settings

router = APIRouter(prefix="/heatmap", tags=["Sensitivity Heatmap"])
engine = SimulationEngine()


@router.post("", response_model=HeatmapResponse)
def compute_sensitivity_heatmap(request: HeatmapRequest):
    """Compute 2D initial condition grid (X0 vs Y0) sensitivity heatmap."""
    start_time = time.time()
    res = min(request.resolution, settings.MAX_HEATMAP_GRID_SIZE)

    x_min, x_max = request.x_range
    y_min, y_max = request.y_range

    if x_min >= x_max or y_min >= y_max:
        raise HTTPException(status_code=400, detail="Invalid range boundaries (min must be < max)")

    dx = (x_max - x_min) / float(res - 1)
    dy = (y_max - y_min) / float(res - 1)

    x_coords = [round(x_min + i * dx, 3) for i in range(res)]
    y_coords = [round(y_min + j * dy, 3) for j in range(res)]

    matrix: List[List[float]] = []

    # Fast parameters for grid sweep
    pert = [request.perturbation, 0.0, 0.0]
    duration = min(request.duration, 15.0)
    dt = max(request.dt, 0.02)

    for y in y_coords:
        row: List[float] = []
        for x in x_coords:
            init_s = [x, y, request.fixed_z]
            sim = engine.run_lorenz_experiment(
                initial_state=init_s,
                perturbation=pert,
                duration=duration,
                dt=dt,
                max_display_points=100
            )
            fin_d = sim["metrics"]["final_distance"]
            row.append(round(fin_d, 3))
        matrix.append(row)

    elapsed_ms = (time.time() - start_time) * 1000.0

    return HeatmapResponse(
        x_coords=x_coords,
        y_coords=y_coords,
        matrix=matrix,
        metric_name="final_distance",
        computation_time_ms=round(elapsed_ms, 2)
    )
