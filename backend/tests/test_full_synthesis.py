"""Comprehensive Automated Tests for AI Butterfly Effect Lab.
Covers:
1. College event with limited staffing
2. Startup with shrinking budget / runway
3. Software release with dependency failures
4. Supply chain disruption
5. Traffic or queue-capacity problem
6. Scenario with insufficient data / vague prompt
7. Scenario with invalid constraints / edge-case values
8. Graceful handling when AI provider fails
9. What-if experiment with paired-seed sensitivity calculation
10. Failure scenario with cascading dependencies
"""

import pytest
import asyncio
from app.synthesis.interpreter import ScenarioInterpreter
from app.synthesis.simulation_engine import ScenarioSimulationEngine
from app.synthesis.failure_engine import FailureSimulationEngine
from app.synthesis.engine import synthesize_scenario
from app.synthesis.whatif_engine import run_whatif_analysis
from app.synthesis.sensitivity import compute_scenario_sensitivity_matrix


@pytest.mark.asyncio
async def test_01_college_event_limited_staffing():
    """Scenario 1: College event with 1,000 attendees and only 10 staff."""
    res = await synthesize_scenario(
        description="A college tech symposium with 1,000 attendees, 10 staff coordinators, and 1200 capacity.",
        explicit_variables={"expected_attendance": 1000.0, "staff": 10.0, "venue_capacity": 1200.0},
        trials=500
    )
    assert res is not None
    assert len(res.futures) >= 3
    # With staff = 10 (half of recommended 20), adverse/failure probabilities should be elevated
    elevated_risk = [f for f in res.futures if f.category in ["adverse", "critical_failure"]]
    assert any(f.score > 0.05 for f in elevated_risk)


@pytest.mark.asyncio
async def test_02_startup_shrinking_budget():
    """Scenario 2: Startup with 2 months of runway and high burn rate."""
    spec = await ScenarioInterpreter.interpret("Our early-stage B2B startup has 2 months runway remaining and $60k monthly burn.")
    assert spec["domain"] == "startup_finance"
    assert "runway_months" in spec["detected_conditions"]

    res = await synthesize_scenario(
        description="Our early-stage B2B startup has 2 months runway remaining and $60k monthly burn.",
        explicit_variables={"runway_months": 2.0, "monthly_burn": 60000.0},
        trials=500
    )
    assert res is not None
    # Critical failure risk should be high when runway is 2 months
    crit = next((f for f in res.futures if f.category == "critical_failure" or "Collapse" in f.title), None)
    assert crit is not None
    assert crit.score_percentage >= 15


@pytest.mark.asyncio
async def test_03_software_release_dependency_failure():
    """Scenario 3: Software deployment under peak 5000 TPS with 150ms DB latency."""
    res = await synthesize_scenario(
        description="Software microservice deployment receiving 5000 requests per second with high downstream database latency.",
        explicit_variables={"requests_per_sec": 5000.0, "server_nodes": 8.0, "dependency_latency": 150.0},
        trials=500
    )
    assert res is not None
    assert res.simulation_stats is not None
    assert res.simulation_stats.trials_run == 500
    assert len(res.failure_modes) >= 1


@pytest.mark.asyncio
async def test_04_supply_chain_disruption():
    """Scenario 4: Supply chain port shutdown with 14 days delay."""
    spec = await ScenarioInterpreter.interpret("Supply chain cargo port congestion causing 14 days delay with 800 safety stock units.")
    assert spec["domain"] == "supply_chain"
    assert "inflow_delay_days" in spec["detected_conditions"]


@pytest.mark.asyncio
async def test_05_traffic_queue_capacity():
    """Scenario 5: Highway tunnel traffic bottleneck with 40% surge."""
    probs, stats = ScenarioSimulationEngine.run_monte_carlo(
        variables={"demand": 1400.0, "capacity": 1000.0, "resources": 15.0},
        domain="operations",
        trials=1000,
        seed=123
    )
    assert stats.trials_run == 1000
    # Over capacity (1400 / 1000 = 1.4), critical failure or adverse should dominate
    assert (probs["adverse"] + probs["critical_failure"]) > probs["favorable"]


@pytest.mark.asyncio
async def test_06_insufficient_data_vague_prompt():
    """Scenario 6: Extremely vague user input; engine should formulate sound defaults without crashing."""
    res = await synthesize_scenario(
        description="Something might go wrong tomorrow.",
        trials=200
    )
    assert res is not None
    assert len(res.futures) >= 3
    assert res.synthesis_quality.scenario_clarity in ["HIGH", "MODERATE"]


@pytest.mark.asyncio
async def test_07_invalid_constraints_and_edge_values():
    """Scenario 7: Zero capacity or negative variables should be clamped safely without DivisionByZero."""
    probs, stats = ScenarioSimulationEngine.run_monte_carlo(
        variables={"demand": 0.0, "capacity": 0.0, "resources": -5.0},
        domain="operations",
        trials=200,
        seed=42
    )
    assert stats.trials_run == 200
    assert sum(probs.values()) == pytest.approx(1.0, 0.01)


@pytest.mark.asyncio
async def test_08_provider_failure_graceful_handling(monkeypatch):
    """Scenario 8: If AI network calls fail or time out, computational engine carries through truthfully."""
    from app.synthesis.ai_adapters import GroqAdapter, GeminiAdapter

    async def mock_fail(*args, **kwargs):
        return None

    monkeypatch.setattr(GroqAdapter, "chat_completion", mock_fail)
    monkeypatch.setattr(GeminiAdapter, "generate_json", mock_fail)

    res = await synthesize_scenario(
        description="Metropolitan transit network during major storm",
        trials=300
    )
    assert res is not None
    # Must truthfully state computational consensus rather than pretending dual-model consensus
    assert "COMPUTATIONAL CONSENSUS" in res.synthesis_quality.analysis_agreement


@pytest.mark.asyncio
async def test_09_whatif_paired_seed_sensitivity():
    """Scenario 9: What-if experiment with paired seeds computes non-zero deterministic Butterfly Effect."""
    whatif = await run_whatif_analysis(
        scenario_id="test_scen",
        description="College technology event with 1,000 attendees",
        variable_name="staff",
        new_value=16.0,
        current_conditions={"expected_attendance": 1000.0, "staff": 20.0, "venue_capacity": 1200.0},
        simulation_seed=42
    )
    assert whatif.input_change_pct == pytest.approx(-20.0, 0.5)
    assert whatif.butterfly_effect_score > 0.0
    assert whatif.butterfly_effect_level in ["LOW", "MODERATE", "HIGH", "EXTREME"]
    assert len(whatif.ripple_effect_chain) == 6
    assert "Paired-Seed Monte Carlo" in whatif.simulation_method


def test_10_failure_cascade_subsystem():
    """Scenario 10: Dedicated failure analysis answers the 7 canonical questions."""
    modes = FailureSimulationEngine.identify_failure_modes(
        description="High volume checkout gateway with distributed microservices",
        variables={"requests_per_sec": 3000.0, "server_nodes": 10.0},
        domain="software_operations"
    )
    assert len(modes) >= 2
    f1 = modes[0]
    assert f1.first_failure != ""
    assert f1.root_cause != ""
    assert f1.trigger_condition != ""
    assert len(f1.cascade_steps) >= 2
    assert f1.mitigation != ""
