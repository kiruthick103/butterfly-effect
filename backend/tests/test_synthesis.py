"""Unit tests for Scenario Synthesis, What-If Perturbation, and Butterfly Effect engine."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_synthesis_templates():
    res = client.get("/api/v1/synthesis/templates")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    assert data[0]["id"] == "tech_event"
    assert "expected_attendance" in data[0]["variables"]


def test_synthesis_normalize():
    payload = {
        "description": "A college tech event with 1,000 attendees, 20 staff, and 1,200 capacity.",
        "variables": {"expected_attendance": 1000.0, "staff": 20.0}
    }
    res = client.post("/api/v1/synthesis/normalize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "detected_conditions" in data
    conds = data["detected_conditions"]
    assert "expected_attendance" in conds
    assert conds["expected_attendance"]["value"] == 1000.0
    assert conds["staff"]["value"] == 20.0


def test_synthesis_generate():
    payload = {
        "description": "A college tech event with 1,000 attendees, 20 staff, and 1,200 capacity.",
        "time_horizon": "24_hours",
        "variables": {"expected_attendance": 1000.0, "staff": 20.0, "venue_capacity": 1200.0}
    }
    res = client.post("/api/v1/synthesis/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "futures" in data
    assert len(data["futures"]) >= 3
    assert "ai_synthesis_brief" in data
    assert "synthesis_quality" in data
    # Check that score percentages sum to 100
    total_pct = sum(f["score_percentage"] for f in data["futures"])
    assert total_pct == 100
    # Verify first future structure
    f0 = data["futures"][0]
    assert "id" in f0
    assert "title" in f0
    assert "score" in f0
    assert len(f0["primary_drivers"]) >= 2
    assert len(f0["milestones"]) >= 2


def test_synthesis_whatif_butterfly_effect():
    payload = {
        "scenario_id": "test-scenario",
        "description": "A college tech event with 1,000 attendees and 20 staff.",
        "variable_name": "staff",
        "new_value": 16.0,
        "current_conditions": {
            "expected_attendance": 1000.0,
            "staff": 20.0,
            "venue_capacity": 1200.0
        },
        "time_horizon": "24_hours"
    }
    res = client.post("/api/v1/synthesis/whatif", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["variable_name"] == "staff"
    assert data["current_value"] == 20.0
    assert data["new_value"] == 16.0
    assert data["input_change_pct"] == -20.0
    assert "butterfly_effect_score" in data
    assert data["butterfly_effect_score"] > 0
    assert data["butterfly_effect_level"] in ["LOW", "MODERATE", "HIGH", "EXTREME"]
    assert "probability_shifts" in data
    assert len(data["ripple_effect_chain"]) >= 4
    # Check that ripple chain starts with INPUT and ends with NEW FUTURE
    assert data["ripple_effect_chain"][0]["stage"] == "INPUT"
    assert data["ripple_effect_chain"][-1]["stage"] == "NEW FUTURE"


def test_synthesis_sensitivity_matrix():
    res = client.get("/api/v1/synthesis/sensitivity")
    assert res.status_code == 200
    data = res.json()
    assert "variables" in data
    assert "rankings" in data
    assert len(data["rankings"]) >= 3
    assert data["most_sensitive_variable"] == "staff"
    assert "matrix" in data


def test_synthesis_history():
    res = client.get("/api/v1/synthesis/history")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "butterfly_effect" in data[0]
