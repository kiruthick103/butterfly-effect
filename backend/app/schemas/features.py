"""Pydantic schemas for flagship laboratory features: Microscope, Heatmap, Bifurcation."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class MicroscopeRequest(BaseModel):
    model: str = Field(default="lorenz")
    initial_state: Optional[List[float]] = Field(default=None)
    scales: Optional[List[float]] = Field(
        default=None,
        description="List of perturbation magnitudes, e.g. [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7]"
    )
    axis: int = Field(default=0, ge=0, le=2, description="Axis to perturb: 0=x, 1=y, 2=z")
    duration: float = Field(default=25.0, ge=5.0, le=50.0)
    dt: float = Field(default=0.01, ge=0.005, le=0.05)


class MicroscopeScaleResult(BaseModel):
    scale: float
    exponent: int
    initial_distance: float
    final_distance: float
    max_distance: float
    time_to_threshold: Optional[float] = None
    distances: List[float]


class MicroscopeResponse(BaseModel):
    model: str
    axis_name: str
    initial_state: List[float]
    duration: float
    dt: float
    times: List[float]
    levels: List[MicroscopeScaleResult]
    summary_analysis: str


class HeatmapRequest(BaseModel):
    model: str = Field(default="lorenz")
    fixed_z: float = Field(default=1.0)
    x_range: List[float] = Field(default=[-5.0, 5.0], min_length=2, max_length=2)
    y_range: List[float] = Field(default=[-5.0, 5.0], min_length=2, max_length=2)
    resolution: int = Field(default=20, ge=5, le=35, description="Grid resolution per axis (N x N)")
    perturbation: float = Field(default=0.0001)
    duration: float = Field(default=15.0, ge=2.0, le=25.0)
    dt: float = Field(default=0.02, ge=0.01, le=0.05)


class HeatmapResponse(BaseModel):
    x_coords: List[float]
    y_coords: List[float]
    matrix: List[List[float]]  # matrix of final separation distance
    metric_name: str
    computation_time_ms: float


class BifurcationRequest(BaseModel):
    r_min: float = Field(default=2.4, ge=0.0, le=3.99)
    r_max: float = Field(default=4.0, ge=0.1, le=4.0)
    r_steps: int = Field(default=350, ge=50, le=600)
    iterations: int = Field(default=120, ge=20, le=300)
    burn_in: int = Field(default=200, ge=50, le=500)
    x0: float = Field(default=0.5, gt=0.0, lt=1.0)


class BifurcationResponse(BaseModel):
    data: List[Dict[str, Any]]
    total_points: int
    explanation: str
