"""FastAPI Router for Scenario-Based Future Forecasting, Failure Simulation, and Butterfly-Effect Analysis."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel

from app.synthesis.schemas import (
    ScenarioRequest,
    SynthesisResponse,
    WhatIfRequest,
    WhatIfResponse,
    SensitivityMatrixResponse,
    FailureAnalysisResponse
)
from app.synthesis.normalizer import TEMPLATES
from app.synthesis.interpreter import ScenarioInterpreter
from app.synthesis.engine import synthesize_scenario
from app.synthesis.whatif_engine import run_whatif_analysis
from app.synthesis.sensitivity import compute_scenario_sensitivity_matrix
from app.synthesis.failure_engine import FailureSimulationEngine
from app.synthesis.history import history_manager

router = APIRouter(prefix="/synthesis", tags=["AI Scenario Synthesis & Butterfly Effect Lab"])


class InterpretRequest(BaseModel):
    description: str
    variables: Dict[str, float] = {}


@router.get("/templates")
def get_scenario_templates() -> List[Dict[str, Any]]:
    """Retrieve pre-built scenario templates across operations, startup finance, and infrastructure."""
    return TEMPLATES


@router.post("/interpret")
@router.post("/normalize")
async def interpret_scenario_endpoint(payload: InterpretRequest) -> Dict[str, Any]:
    """Parse raw text description of ANY situation into structured variables, bounds, and failure modes."""
    return await ScenarioInterpreter.interpret(payload.description, payload.variables)


@router.post("/generate", response_model=SynthesisResponse)
async def generate_futures_endpoint(payload: ScenarioRequest) -> SynthesisResponse:
    """Run AI Synthesis Engine: parse scenario, execute Monte Carlo simulation, evaluate failure modes, and generate futures."""
    # 1. Interpret scenario
    spec = await ScenarioInterpreter.interpret(payload.description, payload.variables)
    detected_conds = spec["detected_conditions"]

    # 2. Run synthesis with Monte Carlo simulation
    result = await synthesize_scenario(
        description=payload.description,
        time_horizon=payload.time_horizon,
        detected_conditions=detected_conds,
        explicit_variables=payload.variables,
        simulation_seed=payload.simulation_seed or 42,
        trials=payload.trials or 1000
    )

    # 3. Log initial baseline to history
    futures_summary = {f.title: f.score_percentage for f in result.futures}
    history_manager.add({
        "title": f"{result.scenario_title} — Baseline",
        "scenario_description": payload.description,
        "time_horizon": payload.time_horizon,
        "conditions": {k: v.value for k, v in result.detected_conditions.items()},
        "whatif_applied": None,
        "futures_summary": futures_summary,
        "butterfly_effect": {
            "score": 0.0,
            "level": "BASELINE",
            "largest_shift": "0.0%"
        },
        "uncertainty": result.synthesis_quality.uncertainty
    })

    return result


@router.post("/failures", response_model=FailureAnalysisResponse)
async def failure_simulation_endpoint(payload: InterpretRequest) -> FailureAnalysisResponse:
    """Analyze and simulate plausible failure modes, cascading dependency collapses, and mitigation interventions."""
    spec = await ScenarioInterpreter.interpret(payload.description, payload.variables)
    numeric_vars = {k: float(v.value) for k, v in spec["detected_conditions"].items()}
    modes = FailureSimulationEngine.identify_failure_modes(
        description=payload.description,
        variables=numeric_vars,
        domain=spec["domain"],
        llm_failures=spec.get("failure_modes")
    )
    return FailureSimulationEngine.generate_analysis_response(
        title=spec["title"],
        domain=spec["domain"],
        modes=modes
    )


@router.post("/whatif", response_model=WhatIfResponse)
async def whatif_simulation_endpoint(payload: WhatIfRequest) -> WhatIfResponse:
    """Run What-If Perturbation: re-simulate with paired seeds, compute probability shifts, and measure Butterfly Effect."""
    result = await run_whatif_analysis(
        scenario_id=payload.scenario_id,
        description=payload.description,
        variable_name=payload.variable_name,
        new_value=payload.new_value,
        current_conditions=payload.current_conditions,
        time_horizon=payload.time_horizon,
        simulation_seed=payload.simulation_seed or 42
    )

    # Log what-if experiment to history
    futures_summary = {f.title: f.score_percentage for f in result.whatif_futures}
    input_str = f"+{result.input_change_pct}" if result.input_change_pct > 0 else f"{result.input_change_pct}"
    shift_str = f"+{result.largest_shift_pct}" if result.largest_shift_pct > 0 else f"{result.largest_shift_pct}"
    history_manager.add({
        "title": f"What-If: {result.variable_label} ({input_str}%)",
        "scenario_description": payload.description,
        "time_horizon": payload.time_horizon,
        "conditions": payload.current_conditions,
        "whatif_applied": {
            "variable": result.variable_name,
            "old_value": result.current_value,
            "new_value": result.new_value,
            "change_pct": result.input_change_pct
        },
        "futures_summary": futures_summary,
        "butterfly_effect": {
            "score": result.butterfly_effect_score,
            "level": result.butterfly_effect_level,
            "largest_shift": f"{result.largest_shift_outcome} {shift_str}%"
        },
        "uncertainty": f"Butterfly Effect: {result.butterfly_effect_level}"
    })

    return result


@router.post("/sensitivity", response_model=SensitivityMatrixResponse)
def get_custom_sensitivity_matrix_endpoint(
    payload: Dict[str, float] = Body(default_factory=dict)
) -> SensitivityMatrixResponse:
    """Retrieve sensitivity heatmap and impact ranking for custom scenario variables."""
    return compute_scenario_sensitivity_matrix(current_variables=payload)


@router.get("/sensitivity", response_model=SensitivityMatrixResponse)
def get_default_sensitivity_matrix_endpoint() -> SensitivityMatrixResponse:
    """Retrieve sensitivity heatmap and impact ranking answering which small changes have the largest future effect."""
    return compute_scenario_sensitivity_matrix()


@router.get("/history")
def get_experiment_history() -> List[Dict[str, Any]]:
    """Retrieve logged scenario and what-if experiments."""
    return history_manager.list_all()


@router.delete("/history/{exp_id}")
def delete_experiment(exp_id: str) -> Dict[str, Any]:
    """Delete an experiment record."""
    success = history_manager.delete(exp_id)
    if not success:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {"status": "deleted", "id": exp_id}
