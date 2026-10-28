"""Pydantic schemas for experiments, runs, and replays."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from .simulation import SimulationMetrics


class ExperimentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    model: str = Field(default="lorenz")
    parameters: Dict[str, float]
    initial_state: List[float]
    perturbation: List[float]
    duration: float = Field(default=25.0)
    dt: float = Field(default=0.01)
    integrator: str = Field(default="rk4")
    tags: Optional[List[str]] = Field(default_factory=list)
    # Precomputed run result payload if already simulated on client
    metrics: Optional[Dict[str, Any]] = None
    trajectory_data: Optional[Dict[str, Any]] = None
    scientific_explanation: Optional[str] = None


class ExperimentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class ExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    model: str
    model_version: str
    parameters: Dict[str, float]
    initial_state: List[float]
    perturbation: List[float]
    duration: float
    dt: float
    integrator: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    latest_run_id: Optional[str] = None
    latest_metrics: Optional[Dict[str, Any]] = None
    latest_explanation: Optional[str] = None


class ExperimentReplayResponse(BaseModel):
    experiment_id: str
    original_run_id: str
    original_metrics: Dict[str, Any]
    current_metrics: Dict[str, Any]
    difference_detected: bool
    max_metric_drift: float
    status: str
    replay_simulation: Dict[str, Any]


class ExperimentCompareResponse(BaseModel):
    experiment_a: ExperimentResponse
    experiment_b: ExperimentResponse
    metrics_comparison: Dict[str, Any]
    parameter_deltas: Dict[str, Any]
    initial_state_deltas: List[float]
    perturbation_deltas: List[float]
