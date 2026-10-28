"""Comprehensive tests for numerical validation, stability, determinism, and safety.

Directly tests requirements from Section 11 of specification:
Test 1: Zero perturbation -> baseline == perturbed
Test 2: Same input -> Same output (determinism)
Test 3: Same initial state -> Distance = 0
Test 4: Smaller timestep -> Result converges
Test 5: Invalid input -> Reject NaN, Inf, negative/zero dt, invalid duration, excessive steps
Test 6: Numerical overflow -> Engine fails safely without crashing
"""

import pytest
import math
from app.simulation.engine import SimulationEngine
from app.simulation.validation import SimulationValidationError


@pytest.fixture
def engine():
    return SimulationEngine()


def test_section11_test1_zero_perturbation(engine):
    """Test 1: Zero perturbation (delta = 0) -> baseline == perturbed across entire duration."""
    res = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[0.0, 0.0, 0.0],
        duration=10.0,
        dt=0.01
    )
    b_traj = res["baseline_trajectory"]
    p_traj = res["perturbed_trajectory"]

    assert len(b_traj) == len(p_traj)
    for b_pt, p_pt in zip(b_traj, p_traj):
        assert b_pt == p_pt

    assert res["metrics"]["initial_distance"] == 0.0
    assert res["metrics"]["final_distance"] == 0.0
    assert res["metrics"]["max_distance"] == 0.0


def test_section11_test2_deterministic_reproducibility(engine):
    """Test 2: Same input -> Same output."""
    res1 = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[1e-5, 0.0, 0.0],
        duration=15.0,
        dt=0.01
    )
    res2 = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[1e-5, 0.0, 0.0],
        duration=15.0,
        dt=0.01
    )

    assert res1["configuration_hash"] == res2["configuration_hash"]
    assert res1["metrics"] == res2["metrics"]
    assert res1["baseline_trajectory"] == res2["baseline_trajectory"]
    assert res1["perturbed_trajectory"] == res2["perturbed_trajectory"]


def test_section11_test3_same_initial_state_distance_zero(engine):
    """Test 3: Same initial state -> Initial distance = 0."""
    res = engine.run_lorenz_experiment(
        initial_state=[5.0, -2.0, 18.0],
        perturbation=[0.0, 0.0, 0.0],
        duration=5.0,
        dt=0.01
    )
    assert res["metrics"]["initial_distance"] == 0.0


def test_section11_test4_convergence_with_smaller_dt(engine):
    """Test 4: Smaller timestep -> Trajectories converge/stabilize."""
    # Compare t=2.0 state with dt=0.01 vs dt=0.005 vs dt=0.0025
    r_dt01 = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[0.0, 0.0, 0.0],
        duration=2.0,
        dt=0.01
    )
    r_dt005 = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[0.0, 0.0, 0.0],
        duration=2.0,
        dt=0.005
    )

    r_dt0025 = engine.run_lorenz_experiment(
        initial_state=[1.0, 1.0, 1.0],
        perturbation=[0.0, 0.0, 0.0],
        duration=2.0,
        dt=0.0025
    )

    final_dt01 = r_dt01["baseline_trajectory"][-1]
    final_dt005 = r_dt005["baseline_trajectory"][-1]
    final_dt0025 = r_dt0025["baseline_trajectory"][-1]

    diff1 = math.sqrt(sum((a - b) ** 2 for a, b in zip(final_dt01, final_dt005)))
    diff2 = math.sqrt(sum((a - b) ** 2 for a, b in zip(final_dt005, final_dt0025)))

    # diff2 must be substantially smaller than diff1 (Cauchy convergence)
    assert diff1 < 5e-4
    assert diff2 < 5e-5
    assert diff2 < diff1 / 8.0


def test_section11_test5_invalid_input_rejections(engine):
    """Test 5: Reject NaN, infinity, negative dt, zero dt, invalid duration, excessive steps."""
    # NaN in initial state
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(initial_state=[float("nan"), 1.0, 1.0])

    # Infinity in perturbation
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(perturbation=[float("inf"), 0.0, 0.0])

    # Negative dt
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(dt=-0.01)

    # Zero dt
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(dt=0.0)

    # Negative duration
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(duration=-5.0)

    # Excessive steps
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(duration=100.0, dt=0.0001)  # 1,000,000 steps > 100,000 limit


def test_section11_test6_numerical_overflow_safeguard(engine):
    """Test 6: Numerical overflow fails safely with an explicit error rather than an unhandled crash."""
    # Highly explosive initial state coordinates
    with pytest.raises(SimulationValidationError):
        engine.run_lorenz_experiment(initial_state=[1e6, 1e6, 1e6])
