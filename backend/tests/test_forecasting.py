"""Tests for real-time situation, live forecasting, what-if, and sensitivity endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_forecasting_locations(client):
    res = client.get("/api/v1/forecasting/locations")
    assert res.status_code == 200
    locations = res.json()
    assert len(locations) >= 3
    assert any(l["id"] == "nyc" for l in locations)


def test_forecasting_current_state(client):
    res = client.get("/api/v1/forecasting/current?location=nyc&demo=true")
    assert res.status_code == 200
    data = res.json()
    assert "observation" in data
    assert "features" in data
    assert "forecast" in data
    assert "evidence" in data
    assert "intelligence_brief" in data

    obs = data["observation"]
    assert "temperature" in obs
    assert "convective_index" in obs
    assert "data_quality" in obs
    assert obs["data_quality"]["is_valid"] is True

    forecast = data["forecast"]
    assert "forecast_direction" in forecast
    assert "confidence_percentage" in forecast
    assert len(forecast["forecast_trajectory"]) == 15
    assert len(forecast["model_breakdown"]) == 3
    assert forecast["model_agreement_percentage"] >= 33


def test_forecasting_whatif(client):
    payload = {
        "variable": "temperature",
        "perturbation_percentage": 2.0,
        "horizon_steps": 15
    }
    res = client.post("/api/v1/forecasting/whatif", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["perturbed_variable"] == "temperature"
    assert "final_forecast_shift" in data
    assert "percentage_forecast_shift" in data
    assert len(data["baseline_forecast"]) == 15
    assert len(data["perturbed_forecast"]) == 15
    assert len(data["ripple_trace"]) == 4
    assert data["ripple_trace"][0]["stage"] == "INPUT"
    assert data["ripple_trace"][3]["stage"] == "FORECAST"


def test_forecasting_sensitivity_matrix(client):
    res = client.get("/api/v1/forecasting/sensitivity")
    assert res.status_code == 200
    data = res.json()
    assert "variables" in data
    assert len(data["variables"]) == 4
    assert "sensitivity_matrix" in data
    assert len(data["sensitivity_matrix"]) == 4


def test_forecasting_history_and_evaluator(client):
    res = client.get("/api/v1/forecasting/history")
    assert res.status_code == 200
    data = res.json()
    assert data["predictions_evaluated"] > 0
    assert data["mae"] is not None
    assert data["rmse"] is not None
    assert data["directional_accuracy_pct"] is not None
    assert len(data["history"]) > 0
