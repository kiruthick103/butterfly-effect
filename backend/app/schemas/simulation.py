"""Pydantic schemas for numerical simulations."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    model: str = Field(default="lorenz", description="Model identifier: 'lorenz' or 'logistic'")
    initial_state: Optional[List[float]] = Field(default=None, description="Initial baseline state vector")
    perturbation: Optional[List[float]] = Field(default=None, description="Delta perturbation vector")
    parameters: Optional[Dict[str, float]] = Field(default=None, description="Model parameters")
    duration: float = Field(default=25.0, ge=0.1, le=100.0, description="Simulation duration in seconds")
    dt: float = Field(default=0.01, ge=0.0001, le=0.5, description="Timestep dt")
    max_display_points: int = Field(default=1500, ge=100, le=5000, description="Points downsampled for chart UI")
    divergence_threshold: float = Field(default=1.0, ge=0.01, le=50.0, description="Divergence threshold")


class SimulationMetrics(BaseModel):
    initial_distance: float
    final_distance: float
    max_distance: float
    min_distance: float
    mean_distance: float
    divergence_threshold: float
    time_to_threshold: Optional[float] = None
    time_to_saturation: Optional[float] = None
    saturation_detected: bool = False
    approx_finite_time_growth_rate: Optional[float] = None


class SimulationResponse(BaseModel):
    model: str
    model_version: str
    integrator: str
    software_version: str
    configuration_hash: str
    parameters: Dict[str, float]
    initial_state: List[float]
    perturbation: List[float]
    perturbed_initial_state: List[float]
    duration: float
    dt: float
    total_steps: int
    downsample_stride: int
    metrics: SimulationMetrics
    scientific_explanation: str
    times: List[float]
    baseline_trajectory: List[List[float]]
    perturbed_trajectory: List[List[float]]
    distances: List[float]
    log_divergences: List[float]


class LogisticSimulationResponse(BaseModel):
    model: str
    model_version: str
    parameters: Dict[str, float]
    initial_state: List[float]
    perturbation: List[float]
    perturbed_initial_state: List[float]
    iterations: int
    burn_in: int
    regime: str
    metrics: Dict[str, Any]
    scientific_explanation: str
    iterations_index: List[int]
    baseline_orbit: List[float]
    perturbed_orbit: List[float]
    distances: List[float]
