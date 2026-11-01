"""Pass-Rate Engine & Adaptive Next Scenarios Generator: Evaluates simulation pass/fail metrics and synthesizes follow-up experiments."""

import math
from typing import Dict, List, Any, Tuple
from .schemas import PassRateMetrics, AdaptiveNextScenario


class NextScenariosEngine:
    """Computes exact simulation pass rates, identifies critical bottlenecks, and generates adaptive follow-up experiments."""

    @classmethod
    def calculate_pass_rate_metrics(
        cls,
        empirical_probs: Dict[str, float],
        trials: Any,
        variables: Dict[str, float],
        domain: str
    ) -> PassRateMetrics:
        """Calculate pass rate, failure rate, Wilson 95% confidence interval, and bottleneck."""
        trial_count = trials.trials_run if hasattr(trials, "trials_run") else int(trials)
        p_fav = empirical_probs.get("favorable", 0.0)
        p_nom = empirical_probs.get("nominal", 0.0)
        p_adv = empirical_probs.get("adverse", 0.0)
        p_crit = empirical_probs.get("critical_failure", 0.0)

        # Successful trials are favorable + nominal
        success_ratio = min(max(p_fav + p_nom, 0.0), 1.0)
        successful_trials = int(round(success_ratio * trial_count))
        failed_trials = trial_count - successful_trials

        pass_rate_pct = round(success_ratio * 100.0, 1)
        failure_rate_pct = round(100.0 - pass_rate_pct, 1)
        critical_rate_pct = round(p_crit * 100.0, 1)

        # Wilson Score 95% Confidence Interval for Pass Rate
        z = 1.96
        p = success_ratio
        denominator = 1 + (z**2 / trial_count)
        center = (p + (z**2 / (2 * trial_count))) / denominator
        spread = z * math.sqrt((p * (1 - p) + (z**2 / (4 * trial_count))) / trial_count) / denominator
        ci_low = round(max(center - spread, 0.0) * 100.0, 1)
        ci_high = round(min(center + spread, 1.0) * 100.0, 1)

        # Estimate primary bottleneck based on variables and domain
        primary_bottleneck = "Operational Resource Constraint"
        if "exam" in domain or "commute" in domain or "transit" in domain:
            primary_bottleneck = "Transit Duration vs Strict Cutoff Buffer"
        elif "battery" in domain or "power" in domain:
            primary_bottleneck = "Energy Drain Velocity vs Hours to Charger"
        elif "money" in domain or "finance" in domain or "budget" in domain:
            primary_bottleneck = "Liquid Cash Reserve vs Daily Burn Rate"
        elif "study" in domain or "deadline" in domain:
            primary_bottleneck = "Work Remaining vs Hours to Portal Closure"
        elif "hardware" in domain or "network" in domain or "tech" in domain:
            primary_bottleneck = "Single Point of Failure (SPOF) Hardware Downtime"
        elif "team" in domain or "work" in domain:
            primary_bottleneck = "Member Availability & Task Redistribution"

        # Estimated Resource Utilization
        utilization = min(98.0, max(25.0, round((1.0 - p_fav * 0.6) * 100.0, 1)))
        # Recovery rate after emergency intervention
        recovery_rate = round(min(95.0, max(20.0, pass_rate_pct + (100.0 - pass_rate_pct) * 0.65)), 1)

        return PassRateMetrics(
            total_trials=trial_count,
            successful_trials=successful_trials,
            failed_trials=failed_trials,
            pass_rate_pct=pass_rate_pct,
            failure_rate_pct=failure_rate_pct,
            critical_failure_rate_pct=critical_rate_pct,
            primary_bottleneck=primary_bottleneck,
            resource_utilization_pct=utilization,
            recovery_rate_pct=recovery_rate,
            confidence_interval_95=[ci_low, ci_high]
        )

    @classmethod
    def generate_next_scenarios(
        cls,
        variables: Dict[str, float],
        pass_metrics: PassRateMetrics,
        domain: str,
        scenario_title: str
    ) -> List[AdaptiveNextScenario]:
        """Generate targeted next experiments based on the calculated pass rate and bottlenecks."""
        pass_rate = pass_metrics.pass_rate_pct
        experiments: List[AdaptiveNextScenario] = []

        # Find primary key variable to perturb
        var_keys = list(variables.keys())
        primary_key = var_keys[0] if var_keys else "demand"
        second_key = var_keys[1] if len(var_keys) > 1 else primary_key
        third_key = var_keys[2] if len(var_keys) > 2 else second_key

        val_1 = variables.get(primary_key, 100.0)
        val_2 = variables.get(second_key, 20.0)

        # 1. Stress Test: Increase demand / load or delay
        stress_vars = dict(variables)
        stress_vars[primary_key] = round(val_1 * 1.35, 1) if "time" not in primary_key.lower() and "buffer" not in primary_key.lower() else round(max(val_1 * 0.65, 5.0), 1)
        experiments.append(AdaptiveNextScenario(
            id="exp_stress_test",
            type="Stress Test",
            title=f"Stress Test: +35% Friction / Reduced Buffer",
            description=f"Applies acute pressure by adjusting {primary_key} to {stress_vars[primary_key]:g} to evaluate system resilience under surge.",
            hypothesis=f"Increasing system stress will reduce pass rate and accelerate bottleneck queue formation.",
            modified_variables=stress_vars,
            target_metric="Pass Rate & Critical Failure Boundary",
            projected_pass_rate_shift=f"Expected pass rate drop: -15% to -25%"
        ))

        # 2. Boundary Test: Find the exact failure cliff
        boundary_vars = dict(variables)
        if len(var_keys) > 1:
            boundary_vars[second_key] = round(val_2 * 1.5, 1)
        experiments.append(AdaptiveNextScenario(
            id="exp_boundary_test",
            type="Boundary Test",
            title=f"Boundary Test: Threshold Saturation Point",
            description=f"Probes the non-linear bifurcation boundary by shifting {second_key} to {boundary_vars.get(second_key, val_2):g}.",
            hypothesis=f"Locates the threshold value where pass rate transitions from nominal to uncontained failure.",
            modified_variables=boundary_vars,
            target_metric="Bifurcation Point & Tolerance Margin",
            projected_pass_rate_shift=f"Target: Identify 50% pass/fail equilibrium"
        ))

        # 3. Failure Injection & Cascade Test
        failure_vars = dict(variables)
        if "battery" in domain:
            failure_vars[primary_key] = 3.0  # Battery drops to 3%
        elif "transit" in domain or "commute" in domain or "bus" in domain:
            failure_vars[second_key] = round(val_2 * 2.2, 1)  # Next bus takes double time
        else:
            failure_vars[primary_key] = round(val_1 * 0.4, 1)
        experiments.append(AdaptiveNextScenario(
            id="exp_failure_injection",
            type="Failure Injection",
            title=f"Failure Injection: Downstream Component Outage",
            description=f"Simulates worst-case scenario where primary resource is severely degraded ({primary_key}={failure_vars[primary_key]:g}).",
            hypothesis=f"Single-point failure triggers cascading breakdown across secondary operations.",
            modified_variables=failure_vars,
            target_metric="Cascading Damage & Recovery Feasibility",
            projected_pass_rate_shift=f"Worst-case critical failure surge: +40%"
        ))

        # 4. Mitigation / Recovery Test: Targeted intervention to boost pass rate
        recovery_vars = dict(variables)
        if len(var_keys) > 1:
            # Increase resources or reduce friction
            recovery_vars[second_key] = round(max(val_2 * 0.5, 5.0), 1) if "delay" in second_key or "wait" in second_key else round(val_2 * 1.5, 1)
        experiments.append(AdaptiveNextScenario(
            id="exp_recovery_test",
            type="Recovery Test",
            title=f"Recovery Test: Emergency Mitigation Protocol",
            description=f"Introduces rapid countermeasure (adjusting {second_key} to {recovery_vars.get(second_key, val_2):g}) to arrest the cascade.",
            hypothesis=f"Targeted mitigation restores operational buffer, improving pass rate above 80%.",
            modified_variables=recovery_vars,
            target_metric="Recovery Rate & Intervention Efficacy",
            projected_pass_rate_shift=f"Expected pass rate improvement: +25% to +45%"
        ))

        # 5. Pass-Rate Improvement Search
        optimize_vars = dict(variables)
        for k, v in optimize_vars.items():
            if any(term in k.lower() for term in ["cash", "budget", "buffer", "stock", "nodes", "staff", "reps", "coverage"]):
                optimize_vars[k] = round(v * 1.25, 1)
            elif any(term in k.lower() for term in ["delay", "wait", "burn", "churn", "latency", "penalty"]):
                optimize_vars[k] = round(max(v * 0.75, 1.0), 1)
        experiments.append(AdaptiveNextScenario(
            id="exp_pass_rate_improvement",
            type="Pass-Rate Improvement",
            title=f"Pass-Rate Optimization: Minimal High-Leverage Fix",
            description=f"Calculates the minimum viable parameter adjustments required to maximize operational success.",
            hypothesis=f"Targeted 25% adjustment of high-sensitivity leverage points elevates pass rate to optimal band.",
            modified_variables=optimize_vars,
            target_metric="Overall Pass Rate Optimization",
            projected_pass_rate_shift=f"Target: Pass rate >= 85%"
        ))

        return experiments
