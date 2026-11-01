"""Schemas for Scenario-Based Future Forecasting, Failure Simulation, and Butterfly-Effect Analysis."""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ScenarioVariable(BaseModel):
    name: str
    label: str
    value: float
    unit: str = ""
    min_val: float = 0.0
    max_val: float = 10000.0
    step: float = 1.0
    category: str = "general"
    description: str = ""


class ScenarioRequest(BaseModel):
    description: str = Field(..., description="Free-text or structured description of any situation")
    time_horizon: str = Field(default="24_hours", description="Time horizon, e.g. 6 hours, 24 hours, 7 days, 6 months")
    variables: Dict[str, float] = Field(default_factory=dict, description="Explicit numerical conditions")
    domain: Optional[str] = Field(default="operations", description="business, operations, tech, logistics, medical, etc.")
    simulation_seed: Optional[int] = Field(default=42, description="Configurable random seed for reproducible Monte Carlo simulation")
    trials: Optional[int] = Field(default=1000, description="Number of Monte Carlo trials to run")


class FutureMilestone(BaseModel):
    time: str
    event: str
    impact: str


class FailureMode(BaseModel):
    id: str
    name: str
    trigger_condition: str
    root_cause: str
    first_failure: str
    cascade_steps: List[str]
    amplifying_variables: List[str]
    mitigation: str
    severity: str = "HIGH"  # LOW, MODERATE, HIGH, CRITICAL


class SubScenario(BaseModel):
    title: str = ""
    effect_percentage: int = 35
    trigger_event: str = ""
    consequence: str = ""


class FutureOutcome(BaseModel):
    id: str
    title: str
    score: float = Field(..., ge=0.0, le=1.0, description="Model score between 0.0 and 1.0")
    score_percentage: int = Field(..., ge=0, le=100)
    risk_level: str = Field(default="LOW", description="LOW, MODERATE, HIGH, CRITICAL")
    category: str = Field(default="nominal", description="favorable, nominal, adverse, critical_failure, recovery")
    decision_path: str = Field(default="", description="The specific decision or action that leads to this outcome")
    likelihood_label: str = Field(default="Plausible", description="'More likely', 'Plausible', 'Less likely, but important'")
    what_happens_next: str = Field(default="", description="Chain of events in simple language")
    why_this_happens: str = Field(default="", description="Specific factors influencing outcome")
    potential_impact: str = Field(default="", description="Time lost, cost, stress, etc.")
    recommended_action: str = Field(default="", description="Actionable immediate step")
    what_happens_after: str = Field(default="", description="Next major event following this branch")
    next_scenario: str = Field(default="", description="Concrete follow-up situation scenario prompt")
    sub_scenarios: List[SubScenario] = Field(default_factory=list)
    expected_result: str = Field(..., description="Real-life scenario prediction narrative")
    sub_scenario: Optional[SubScenario] = None
    butterfly_effect: str = Field(default="", description="Causal chain from tiny starting variable to major life outcome")
    primary_drivers: List[str]
    uncertainty: str
    milestones: List[FutureMilestone] = Field(default_factory=list)
    failure_modes: List[str] = Field(default_factory=list)


class SimulationTrialStats(BaseModel):
    method: str = "Monte Carlo Simulation"
    trials_run: int = 1000
    seed: int = 42
    distribution: Dict[str, float] = Field(default_factory=dict)
    confidence_intervals: Dict[str, List[float]] = Field(default_factory=dict)
    p10: float = 0.0
    p50: float = 0.0
    p90: float = 0.0
    execution_time_ms: float = 0.0


class PassRateMetrics(BaseModel):
    total_trials: int = 1000
    successful_trials: int = 700
    failed_trials: int = 300
    pass_rate_pct: float = 70.0
    failure_rate_pct: float = 30.0
    critical_failure_rate_pct: float = 10.0
    primary_bottleneck: str = "Capacity vs Arrival Rate"
    resource_utilization_pct: float = 85.0
    recovery_rate_pct: float = 65.0
    confidence_interval_95: List[float] = Field(default_factory=lambda: [67.0, 73.0])


class AdaptiveNextScenario(BaseModel):
    id: str
    type: str  # Stress Test, Boundary Test, Failure Injection, Cascade Test, Recovery Test, Pass-Rate Improvement
    title: str
    description: str
    hypothesis: str
    modified_variables: Dict[str, float]
    target_metric: str
    projected_pass_rate_shift: str


class DecisionOption(BaseModel):
    id: str
    title: str
    description: str
    variable_changes: Dict[str, float] = Field(default_factory=dict)
    projected_pass_rate_shift: str = ""
    tradeoff: str = ""
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)


class SynthesisQuality(BaseModel):
    input_completeness_pct: int = 92
    scenario_clarity: str = "HIGH"
    outcome_separation: str = "HIGH"
    uncertainty: str = "MODERATE"
    analysis_agreement: str = "HIGH"
    agreement_score: float = 0.88


class SynthesisResponse(BaseModel):
    scenario_id: str
    scenario_title: str
    time_horizon: str
    domain: str = "operations"
    detected_conditions: Dict[str, ScenarioVariable]
    futures: List[FutureOutcome]
    failure_modes: List[FailureMode] = Field(default_factory=list)
    simulation_stats: Optional[SimulationTrialStats] = None
    pass_rate_metrics: Optional[PassRateMetrics] = None
    next_scenarios: List[AdaptiveNextScenario] = Field(default_factory=list)
    decision_options: List[DecisionOption] = Field(default_factory=list)
    ai_synthesis_brief: str
    synthesis_quality: SynthesisQuality
    assumptions: List[str] = Field(default_factory=list)
    created_at: str


class WhatIfRequest(BaseModel):
    scenario_id: str
    description: str
    variable_name: str
    new_value: float
    current_conditions: Dict[str, float]
    time_horizon: str = "24_hours"
    simulation_seed: Optional[int] = 42


class RippleStep(BaseModel):
    stage: str
    title: str
    detail: str
    severity: str = "info"


class ProbabilityShift(BaseModel):
    baseline_pct: int
    whatif_pct: int
    delta_pct: int
    relative_change_pct: float


class WhatIfResponse(BaseModel):
    variable_name: str
    variable_label: str
    current_value: float
    new_value: float
    input_change_pct: float
    baseline_futures: List[FutureOutcome]
    whatif_futures: List[FutureOutcome]
    probability_shifts: Dict[str, ProbabilityShift]
    largest_shift_outcome: str
    largest_shift_pct: float
    butterfly_effect_score: float
    butterfly_effect_level: str  # LOW, MODERATE, HIGH, EXTREME
    ripple_effect_chain: List[RippleStep]
    synthesis_explanation: str
    simulation_method: str = "Paired-Seed Monte Carlo (N=1,000)"


class SensitivityRanking(BaseModel):
    variable: str
    label: str
    impact: str  # HIGH, MEDIUM, LOW
    sensitivity_score: float
    primary_risk: str
    default_value: float
    unit: str


class SensitivityMatrixResponse(BaseModel):
    variables: List[str]
    variable_labels: Dict[str, str]
    perturbation_percentages: List[float]
    matrix: Dict[str, Dict[str, Dict[str, Any]]]
    rankings: List[SensitivityRanking]
    most_sensitive_variable: str
    synthesis_insight: str


class FailureAnalysisResponse(BaseModel):
    scenario_title: str
    domain: str
    failure_modes: List[FailureMode]
    critical_thresholds: Dict[str, str]
    cascading_risk_level: str
    recommended_interventions: List[str]
