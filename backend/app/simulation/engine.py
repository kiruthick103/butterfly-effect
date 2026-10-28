"""Core simulation execution engine coordinating models, integrators, and metrics."""

import hashlib
import json
import math
from typing import Dict, List, Any, Optional

from .models.lorenz import LorenzSystem
from .models.logistic import LogisticMap
from .integrators.rk4 import RK4Integrator
from .metrics.divergence import calculate_divergence_profile
from .metrics.distance import euclidean_distance
from .validation import validate_simulation_inputs, check_state_health, SimulationValidationError

SOFTWARE_VERSION = "1.0.0"


def compute_simulation_hash(
    model: str,
    parameters: Dict[str, float],
    initial_state: List[float],
    perturbation: List[float],
    duration: float,
    dt: float,
    integrator: str = "rk4"
) -> str:
    """Generate deterministic SHA-256 fingerprint of the simulation configuration."""
    canonical_repr = {
        "model": model,
        "parameters": {k: round(v, 8) for k, v in sorted(parameters.items())},
        "initial_state": [round(v, 8) for v in initial_state],
        "perturbation": [round(v, 8) for v in perturbation],
        "duration": round(duration, 6),
        "dt": round(dt, 6),
        "integrator": integrator,
        "software_version": SOFTWARE_VERSION
    }
    dumped = json.dumps(canonical_repr, sort_keys=True)
    return hashlib.sha256(dumped.encode("utf-8")).hexdigest()


class SimulationEngine:
    """Unified scientific simulation orchestrator."""

    def __init__(self):
        self.lorenz = LorenzSystem()
        self.logistic = LogisticMap()
        self.rk4 = RK4Integrator()

    def run_lorenz_experiment(
        self,
        initial_state: Optional[List[float]] = None,
        perturbation: Optional[List[float]] = None,
        parameters: Optional[Dict[str, float]] = None,
        duration: float = 25.0,
        dt: float = 0.01,
        max_display_points: int = 1500,
        divergence_threshold: float = 1.0
    ) -> Dict[str, Any]:
        """Execute twin trajectory experiment for the Lorenz-63 system."""
        # 1. Defaults
        params = dict(self.lorenz.default_parameters)
        if parameters:
            params.update(parameters)

        init_s = list(self.lorenz.default_initial_state) if initial_state is None else list(initial_state)
        pert = [0.000001, 0.0, 0.0] if perturbation is None else list(perturbation)

        # 2. Validation
        validate_simulation_inputs("lorenz", init_s, pert, duration, dt, params)
        self.lorenz.validate_state(init_s)
        self.lorenz.validate_parameters(params)

        perturbed_init_s = [a + b for a, b in zip(init_s, pert)]
        self.lorenz.validate_state(perturbed_init_s)

        # 3. Time stepping
        steps = int(math.ceil(duration / dt))
        times: List[float] = [0.0] * (steps + 1)
        baseline_trajectory: List[List[float]] = [[0.0, 0.0, 0.0] for _ in range(steps + 1)]
        perturbed_trajectory: List[List[float]] = [[0.0, 0.0, 0.0] for _ in range(steps + 1)]

        times[0] = 0.0
        baseline_trajectory[0] = list(init_s)
        perturbed_trajectory[0] = list(perturbed_init_s)

        deriv = lambda t, s: self.lorenz.derivative(t, s, params)

        b_curr = list(init_s)
        p_curr = list(perturbed_init_s)
        t_curr = 0.0

        for step in range(1, steps + 1):
            b_curr = self.rk4.step(deriv, t_curr, b_curr, dt)
            p_curr = self.rk4.step(deriv, t_curr, p_curr, dt)
            t_curr = step * dt

            # Safeguard against divergence/overflow
            check_state_health(b_curr, step)
            check_state_health(p_curr, step)

            times[step] = round(t_curr, 6)
            baseline_trajectory[step] = b_curr
            perturbed_trajectory[step] = p_curr

        # 4. Compute exact divergence profile on full high-res data
        metrics = calculate_divergence_profile(
            times=times,
            baseline_states=baseline_trajectory,
            perturbed_states=perturbed_trajectory,
            divergence_threshold=divergence_threshold
        )

        # 5. Downsample for visualization if steps exceed max_display_points
        stride = 1
        if steps + 1 > max_display_points:
            stride = int(math.ceil((steps + 1) / float(max_display_points)))

        sampled_times = times[::stride]
        sampled_baseline = baseline_trajectory[::stride]
        sampled_perturbed = perturbed_trajectory[::stride]
        sampled_distances = metrics["distances"][::stride]
        sampled_log_div = metrics["log_divergences"][::stride]

        # Always include the last endpoint for accuracy
        if sampled_times[-1] != times[-1]:
            sampled_times.append(times[-1])
            sampled_baseline.append(baseline_trajectory[-1])
            sampled_perturbed.append(perturbed_trajectory[-1])
            sampled_distances.append(metrics["distances"][-1])
            sampled_log_div.append(metrics["log_divergences"][-1])

        # 6. Build scientific explanation grounded directly on actual measured numbers
        init_d = metrics["initial_distance"]
        fin_d = metrics["final_distance"]
        max_d = metrics["max_distance"]
        t_thresh = metrics["time_to_threshold"]

        if pert == [0.0, 0.0, 0.0] or init_d == 0.0:
            explanation = (
                f"Control test with zero perturbation (delta = 0). "
                f"As expected from a deterministic dynamical system, the trajectories remain strictly identical "
                f"across all {steps} steps (final distance = 0.000000)."
            )
        else:
            sep_factor = fin_d / max(init_d, 1e-15)
            thresh_clause = (
                f"The separation crossed the macroscopic threshold ({divergence_threshold}) at t = {t_thresh}s. "
                if t_thresh is not None else
                f"The separation did not cross the threshold ({divergence_threshold}) within duration {duration}s. "
            )
            explanation = (
                f"The trajectories originate with an initial separation of {init_d:.2e}. "
                f"Over {duration}s, the distance grew to {fin_d:.4f} (a factor of {sep_factor:.1e}x growth), "
                f"peaking at {max_d:.4f}. {thresh_clause}"
                f"Because the Lorenz equations are strictly deterministic, this divergence arises solely from "
                f"sensitive dependence on initial conditions (the butterfly effect), not random noise."
            )

        config_hash = compute_simulation_hash(
            model="lorenz",
            parameters=params,
            initial_state=init_s,
            perturbation=pert,
            duration=duration,
            dt=dt,
            integrator="rk4"
        )

        return {
            "model": "lorenz",
            "model_version": "1963-canonical",
            "integrator": "rk4",
            "software_version": SOFTWARE_VERSION,
            "configuration_hash": config_hash,
            "parameters": params,
            "initial_state": init_s,
            "perturbation": pert,
            "perturbed_initial_state": perturbed_init_s,
            "duration": duration,
            "dt": dt,
            "total_steps": steps,
            "downsample_stride": stride,
            "metrics": {
                "initial_distance": metrics["initial_distance"],
                "final_distance": metrics["final_distance"],
                "max_distance": metrics["max_distance"],
                "min_distance": metrics["min_distance"],
                "mean_distance": metrics["mean_distance"],
                "divergence_threshold": metrics["divergence_threshold"],
                "time_to_threshold": metrics["time_to_threshold"],
                "time_to_saturation": metrics["time_to_saturation"],
                "saturation_detected": metrics["saturation_detected"],
                "approx_finite_time_growth_rate": metrics["approx_finite_time_growth_rate"],
            },
            "scientific_explanation": explanation,
            "times": sampled_times,
            "baseline_trajectory": sampled_baseline,
            "perturbed_trajectory": sampled_perturbed,
            "distances": sampled_distances,
            "log_divergences": sampled_log_div
        }

    def run_logistic_experiment(
        self,
        x0: float = 0.5,
        perturbation: float = 0.000001,
        r: float = 3.9,
        iterations: int = 100,
        burn_in: int = 0
    ) -> Dict[str, Any]:
        """Execute twin orbit experiment for the Logistic Map."""
        self.logistic.validate_state(x0)
        self.logistic.validate_parameters({"r": r})

        x0_pert = x0 + perturbation
        self.logistic.validate_state(x0_pert)

        baseline_orbit = self.logistic.compute_orbit(x0=x0, r=r, iterations=iterations, burn_in=burn_in)
        perturbed_orbit = self.logistic.compute_orbit(x0=x0_pert, r=r, iterations=iterations, burn_in=burn_in)

        distances = [abs(b - p) for b, p in zip(baseline_orbit, perturbed_orbit)]
        init_d = distances[0]
        final_d = distances[-1]
        max_d = max(distances)

        # Regimes explanation
        if r < 1.0:
            regime = "Extinction (asymptotic fixed point at 0)"
        elif r < 3.0:
            regime = "Stable non-zero fixed point"
        elif r < 3.56995:
            regime = "Period-doubling cascade (limit cycles)"
        else:
            regime = "Deterministic chaos with periodic windows"

        explanation = (
            f"Logistic map evaluated at r = {r} ({regime}). "
            f"Starting from x0 = {x0} and x0' = {x0_pert} (initial delta = {perturbation:.2e}), "
            f"the final difference after {iterations} iterations is {final_d:.6f} with peak difference {max_d:.6f}."
        )

        return {
            "model": "logistic",
            "model_version": "1976-canonical",
            "parameters": {"r": r},
            "initial_state": [x0],
            "perturbation": [perturbation],
            "perturbed_initial_state": [x0_pert],
            "iterations": iterations,
            "burn_in": burn_in,
            "regime": regime,
            "metrics": {
                "initial_distance": init_d,
                "final_distance": round(final_d, 6),
                "max_distance": round(max_d, 6),
                "min_distance": round(min(distances), 6),
            },
            "scientific_explanation": explanation,
            "iterations_index": list(range(len(baseline_orbit))),
            "baseline_orbit": baseline_orbit,
            "perturbed_orbit": perturbed_orbit,
            "distances": distances
        }
