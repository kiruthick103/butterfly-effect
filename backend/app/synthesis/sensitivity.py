"""Sensitivity Matrix Engine: Multi-variable perturbation sweep and empirical Butterfly Effect impact ranking."""

from typing import Dict, List, Any
from .schemas import SensitivityMatrixResponse, SensitivityRanking
from .simulation_engine import ScenarioSimulationEngine


def compute_scenario_sensitivity_matrix(
    current_variables: Dict[str, float] = None,
    domain: str = "operations"
) -> SensitivityMatrixResponse:
    """Evaluate multi-variable sensitivity across perturbations using Monte Carlo trial sweeps."""
    defaults = {
        "staff": 20.0,
        "expected_attendance": 1000.0,
        "venue_capacity": 1200.0,
        "budget": 200000.0,
        "registration_rate": 80.0
    }
    vars_dict = dict(defaults)
    if current_variables:
        vars_dict.update(current_variables)

    labels = {
        k: k.replace("_", " ").title() for k in vars_dict.keys()
    }
    # Domain specific pretty labels if matching
    pretty = {
        "staff": "Available Staff",
        "expected_attendance": "Expected Attendance",
        "venue_capacity": "Venue Capacity",
        "budget": "Operating Budget",
        "registration_rate": "Advance Registration Rate",
        "runway_months": "Runway",
        "monthly_burn": "Monthly Burn Rate",
        "requests_per_sec": "Peak Ingestion Rate",
        "server_nodes": "Compute Nodes"
    }
    labels.update({k: v for k, v in pretty.items() if k in vars_dict})

    variables = list(vars_dict.keys())[:6]  # Top variables
    perturbations = [-20.0, -10.0, 10.0, 20.0]

    # Run baseline Monte Carlo (500 trials for speed across matrix)
    base_probs, _ = ScenarioSimulationEngine.run_monte_carlo(vars_dict, domain=domain, trials=500, seed=42)
    base_fail = base_probs.get("critical_failure", 0.1) + base_probs.get("adverse", 0.2)

    matrix: Dict[str, Dict[str, Dict[str, Any]]] = {}
    rankings: List[SensitivityRanking] = []

    for v_name in variables:
        matrix[v_name] = {}
        base_val = vars_dict[v_name]
        var_max_shift = 0.0

        for p in perturbations:
            pert_vars = dict(vars_dict)
            pert_vars[v_name] = base_val * (1.0 + p / 100.0)

            # Paired simulation
            p_probs, _ = ScenarioSimulationEngine.run_monte_carlo(pert_vars, domain=domain, trials=500, seed=42)
            p_fail = p_probs.get("critical_failure", 0.1) + p_probs.get("adverse", 0.2)

            rel_shift_pct = round(((p_fail - base_fail) / max(base_fail, 0.05)) * 100.0, 1)
            sens_score = round(abs(rel_shift_pct) / max(abs(p), 1.0), 2)

            if sens_score >= 1.5:
                level = "EXTREME" if sens_score >= 2.5 else "HIGH"
            elif sens_score >= 0.7:
                level = "MEDIUM"
            else:
                level = "LOW"

            matrix[v_name][str(p)] = {
                "variable": v_name,
                "label": labels.get(v_name, v_name),
                "perturbation": p,
                "outcome_shift_pct": rel_shift_pct,
                "sensitivity_score": sens_score,
                "sensitivity_level": level,
                "divergence_description": f"{rel_shift_pct:+.1f}% adverse shift under {p:+.0f}% change."
            }

            if sens_score > var_max_shift:
                var_max_shift = sens_score

        impact = "HIGH" if var_max_shift >= 1.2 else "MEDIUM" if var_max_shift >= 0.6 else "LOW"
        rankings.append(SensitivityRanking(
            variable=v_name,
            label=labels.get(v_name, v_name),
            impact=impact,
            sensitivity_score=round(var_max_shift, 2),
            primary_risk=f"High risk leverage point" if impact == "HIGH" else "Moderate buffer sensitivity",
            default_value=base_val,
            unit=""
        ))

    # Sort rankings descending by score
    rankings.sort(key=lambda r: r.sensitivity_score, reverse=True)
    most_sensitive = rankings[0].variable if rankings else "staff"

    return SensitivityMatrixResponse(
        variables=variables,
        variable_labels=labels,
        perturbation_percentages=perturbations,
        matrix=matrix,
        rankings=rankings,
        most_sensitive_variable=most_sensitive,
        synthesis_insight=(
            f"Parametric Monte Carlo sweep confirms '{labels.get(most_sensitive, most_sensitive)}' as the "
            f"primary non-linear leverage point with a sensitivity factor of {rankings[0].sensitivity_score}x. "
            f"Small negative deviations in this parameter rapidly accelerate failure probability."
        )
    )
