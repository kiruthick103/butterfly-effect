"""Unit tests for distance and trajectory divergence calculations."""

import pytest
import math
from app.simulation.metrics.distance import euclidean_distance, logarithmic_divergence
from app.simulation.metrics.divergence import calculate_divergence_profile


def test_euclidean_distance():
    assert euclidean_distance([0.0, 0.0], [3.0, 4.0]) == 5.0
    assert euclidean_distance([1.0, 2.0, 3.0], [1.0, 2.0, 3.0]) == 0.0


def test_logarithmic_divergence():
    # If distance grows from 1e-6 to 1e-3, ratio is 1000, ln(1000) approx 6.9077
    log_div = logarithmic_divergence(1e-3, 1e-6)
    assert abs(log_div - math.log(1000.0)) < 1e-8


def test_divergence_profile_computation():
    times = [0.0, 1.0, 2.0, 3.0]
    b_states = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [2.0, 0.0, 0.0], [3.0, 0.0, 0.0]]
    # Perturbed starts 0.001 away, grows exponentially
    p_states = [[0.001, 0.0, 0.0], [1.01, 0.0, 0.0], [2.1, 0.0, 0.0], [4.0, 0.0, 0.0]]

    profile = calculate_divergence_profile(
        times=times,
        baseline_states=b_states,
        perturbed_states=p_states,
        divergence_threshold=0.5
    )

    assert profile["initial_distance"] == 0.001
    assert profile["final_distance"] == 1.0
    assert profile["max_distance"] == 1.0
    assert profile["time_to_threshold"] == 3.0  # reached at t=3.0 where d=1.0 >= 0.5
    assert profile["approx_finite_time_growth_rate"] is not None
