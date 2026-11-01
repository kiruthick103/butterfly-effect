"""What-If Engine: Micro-perturbation re-synthesis, Butterfly Effect sensitivity, and Ripple Effect causal chain."""

from typing import Dict, List, Any
from .schemas import (
    WhatIfResponse,
    ProbabilityShift,
    RippleStep,
    ScenarioVariable
)
from .simulation_engine import ScenarioSimulationEngine
from .engine import synthesize_scenario


async def run_whatif_analysis(
    scenario_id: str,
    description: str,
    variable_name: str,
    new_value: float,
    current_conditions: Dict[str, float],
    time_horizon: str = "24_hours",
    simulation_seed: int = 42
) -> WhatIfResponse:
    """Execute paired before vs after scenario re-synthesis and calculate exact Butterfly Effect metrics."""
    old_value = float(current_conditions.get(variable_name, new_value))

    # 1. Baseline Synthesis
    base_vars: Dict[str, ScenarioVariable] = {
        k: ScenarioVariable(name=k, label=k.replace('_', ' ').title(), value=float(v))
        for k, v in current_conditions.items()
    }
    baseline_res = await synthesize_scenario(
        description=description,
        time_horizon=time_horizon,
        detected_conditions=base_vars,
        simulation_seed=simulation_seed
    )

    # 2. Perturbed Synthesis with PAIRED SEED
    perturbed_conditions = dict(current_conditions)
    perturbed_conditions[variable_name] = float(new_value)

    pert_vars: Dict[str, ScenarioVariable] = {
        k: ScenarioVariable(name=k, label=k.replace('_', ' ').title(), value=float(v))
        for k, v in perturbed_conditions.items()
    }
    whatif_res = await synthesize_scenario(
        description=description,
        time_horizon=time_horizon,
        detected_conditions=pert_vars,
        simulation_seed=simulation_seed  # Paired seed guarantees variance reduction
    )

    # 3. Calculate Relative Input Change
    delta_input = new_value - old_value
    base_input_safe = max(abs(old_value), 0.001)
    input_change_pct = round((delta_input / base_input_safe) * 100.0, 1)

    # 4. Compare Probability Distributions
    base_map = {f.id: f.score_percentage for f in baseline_res.futures}
    whatif_map = {f.id: f.score_percentage for f in whatif_res.futures}

    prob_shifts: Dict[str, ProbabilityShift] = {}
    largest_outcome = list(base_map.keys())[0] if base_map else "future_adverse"
    largest_abs_shift = 0.0
    largest_rel_shift = 0.0

    all_keys = list(dict.fromkeys(list(base_map.keys()) + list(whatif_map.keys())))
    for f_id in all_keys:
        b_pct = base_map.get(f_id, 25)
        w_pct = whatif_map.get(f_id, 25)
        delta_p = w_pct - b_pct
        rel_p = round((delta_p / max(float(b_pct), 0.1)) * 100.0, 1)

        prob_shifts[f_id] = ProbabilityShift(
            baseline_pct=b_pct,
            whatif_pct=w_pct,
            delta_pct=delta_p,
            relative_change_pct=rel_p
        )

        if abs(rel_p) > abs(largest_rel_shift):
            largest_abs_shift = delta_p
            largest_rel_shift = rel_p
            largest_outcome = f_id

    # 5. Calculate Deterministic Butterfly Effect Score
    # S = | (delta_P / P_0) / (delta_x / x_0) |
    rel_outcome_frac = abs(largest_rel_shift) / 100.0
    rel_input_frac = max(abs(input_change_pct) / 100.0, 0.001)
    butterfly_score = round(rel_outcome_frac / rel_input_frac, 2)

    # Butterfly Effect Classification
    if butterfly_score >= 2.5:
        level = "EXTREME"
    elif butterfly_score >= 1.2:
        level = "HIGH"
    elif butterfly_score >= 0.6:
        level = "MODERATE"
    else:
        level = "LOW"

    # 6. Generate 6-Stage Ripple Effect Causal Chain
    var_label = base_vars.get(variable_name, ScenarioVariable(name=variable_name, label=variable_name.replace('_', ' ').title(), value=new_value)).label
    direction_sign = "+" if delta_input > 0 else ""
    direction_word = "increased" if delta_input > 0 else "reduced"

    ripple_chain: List[RippleStep] = [
        RippleStep(
            stage="INPUT",
            title=f"Perturbation: {var_label} ({direction_sign}{input_change_pct}%)",
            detail=f"{var_label} {direction_word} from {old_value:g} to {new_value:g}.",
            severity="info"
        ),
        RippleStep(
            stage="CAPACITY PRESSURE",
            title="Operational Throughput Shift",
            detail=f"Throughput velocity modifies queue arrival and service rates.",
            severity="warning" if level in ["HIGH", "EXTREME"] else "info"
        ),
        RippleStep(
            stage="RESOURCE CONSTRAINT",
            title="Threshold Proximity",
            detail=f"System margin adjusts relative to critical operational thresholds.",
            severity="warning" if delta_input < 0 else "info"
        ),
        RippleStep(
            stage="RISK AMPLIFICATION",
            title="Nonlinear Amplification",
            detail=f"Nonlinear feedback loop produces {largest_rel_shift:+.1f}% shift in '{largest_outcome.replace('_', ' ').title()}'.",
            severity="danger" if level in ["HIGH", "EXTREME"] else "warning"
        ),
        RippleStep(
            stage="OUTCOME PROBABILITY",
            title="Probability Distribution Migration",
            detail=f"Monte Carlo density shifts across future branches with sensitivity index S={butterfly_score}.",
            severity="warning"
        ),
        RippleStep(
            stage="NEW FUTURE",
            title="New Divergent Future State",
            detail=f"New attractor state established with altered risk profile.",
            severity="danger" if level == "EXTREME" else "success" if delta_input > 0 else "warning"
        )
    ]

    largest_title = next((f.title for f in whatif_res.futures if f.id == largest_outcome), largest_outcome.replace('_', ' ').title())
    explanation = (
        f"A {direction_sign}{input_change_pct}% perturbation in {var_label} altered the system trajectory, "
        f"driving a {largest_rel_shift:+.1f}% relative movement in '{largest_title}'. "
        f"With a sensitivity multiplier of {butterfly_score}x ({level} BUTTERFLY EFFECT), this variable "
        f"represents a {'critical leverage point' if level in ['HIGH', 'EXTREME'] else 'stable operational buffer'}."
    )

    return WhatIfResponse(
        variable_name=variable_name,
        variable_label=var_label,
        current_value=old_value,
        new_value=new_value,
        input_change_pct=input_change_pct,
        baseline_futures=baseline_res.futures,
        whatif_futures=whatif_res.futures,
        probability_shifts=prob_shifts,
        largest_shift_outcome=largest_title,
        largest_shift_pct=round(largest_rel_shift, 1),
        butterfly_effect_score=butterfly_score,
        butterfly_effect_level=level,
        ripple_effect_chain=ripple_chain,
        synthesis_explanation=explanation,
        simulation_method=f"Paired-Seed Monte Carlo (N=1,000 trials, Seed: {simulation_seed})"
    )
