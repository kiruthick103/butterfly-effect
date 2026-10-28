"""Divergence and trajectory separation metrics."""

import math
from typing import Dict, List, Optional, Any
from .distance import euclidean_distance, logarithmic_divergence


def calculate_divergence_profile(
    times: List[float],
    baseline_states: List[List[float]],
    perturbed_states: List[List[float]],
    divergence_threshold: float = 1.0,
    attractor_scale: float = 20.0
) -> Dict[str, Any]:
    """Compute complete divergence metrics over time between baseline and perturbed trajectories.

    Parameters:
        times: Array of time values [t0, t1, ..., tN]
        baseline_states: Array of state vectors for baseline trajectory
        perturbed_states: Array of state vectors for perturbed trajectory
        divergence_threshold: Separation distance considered 'macroscopically divergent' (default: 1.0)
        attractor_scale: Bounding scale of the attractor manifold where separation saturates (default: 20.0)

    Returns:
        Dictionary containing distance series, logarithmic divergence series, and statistical summary metrics.
    """
    n = len(times)
    if n == 0 or len(baseline_states) != n or len(perturbed_states) != n:
        raise ValueError("Trajectory arrays length mismatch or empty trajectory")

    distances: List[float] = []
    log_divergences: List[float] = []

    d0 = euclidean_distance(baseline_states[0], perturbed_states[0])
    time_to_threshold: Optional[float] = None
    time_to_saturation: Optional[float] = None
    saturation_detected = False

    max_dist = -1.0
    min_dist = float("inf")
    total_dist = 0.0

    for i in range(n):
        d = euclidean_distance(baseline_states[i], perturbed_states[i])
        distances.append(d)
        log_d = logarithmic_divergence(d, d0)
        log_divergences.append(log_d)

        if d > max_dist:
            max_dist = d
        if d < min_dist:
            min_dist = d
        total_dist += d

        t_curr = times[i]
        if time_to_threshold is None and d >= divergence_threshold:
            time_to_threshold = round(t_curr, 4)

        if time_to_saturation is None and d >= attractor_scale:
            time_to_saturation = round(t_curr, 4)
            saturation_detected = True

    final_dist = distances[-1]
    mean_dist = total_dist / float(n)

    # Approximate finite-time exponential divergence rate before saturation
    # We estimate lambda_FT = ln(D(t_eval) / D(0)) / t_eval
    # We choose t_eval prior to saturation or at threshold
    approx_growth_rate: Optional[float] = None
    eval_index = None

    if d0 > 1e-14:
        if time_to_threshold is not None:
            # find index corresponding to threshold
            for idx, t_val in enumerate(times):
                if t_val >= time_to_threshold:
                    eval_index = idx
                    break
        elif n > 1:
            eval_index = n // 2

        if eval_index is not None and eval_index > 0:
            t_eval = times[eval_index]
            d_eval = distances[eval_index]
            if t_eval > 0 and d_eval > 0:
                approx_growth_rate = round(math.log(d_eval / d0) / t_eval, 4)

    return {
        "initial_distance": d0,
        "final_distance": round(final_dist, 6),
        "max_distance": round(max_dist, 6),
        "min_distance": round(min_dist, 6),
        "mean_distance": round(mean_dist, 6),
        "divergence_threshold": divergence_threshold,
        "time_to_threshold": time_to_threshold,
        "time_to_saturation": time_to_saturation,
        "saturation_detected": saturation_detected,
        "approx_finite_time_growth_rate": approx_growth_rate,
        "growth_metric_notes": (
            "Empirical finite-time exponential separation rate: ln(D(t*)/D(0))/t*. "
            "Note: This is an empirical observation metric, not an infinite-time Lyapunov exponent."
        ),
        "distances": distances,
        "log_divergences": log_divergences
    }
