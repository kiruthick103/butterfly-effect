"""Integration tests for all FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db


@pytest.fixture(scope="module")
def client():
    # Ensure database tables exist and are seeded
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

    with TestClient(app) as test_client:
        yield test_client


def test_health_and_version(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_ver = client.get("/version")
    assert res_ver.status_code == 200
    assert "simulation_engine" in res_ver.json()


def test_simulation_presets(client):
    res = client.get("/api/v1/simulations/presets")
    assert res.status_code == 200
    presets = res.json()
    assert len(presets) >= 3
    assert presets[0]["model"] == "lorenz"


def test_simulation_lorenz_endpoint(client):
    payload = {
        "model": "lorenz",
        "initial_state": [1.0, 1.0, 1.0],
        "perturbation": [0.000001, 0.0, 0.0],
        "duration": 15.0,
        "dt": 0.01
    }
    res = client.post("/api/v1/simulations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["model"] == "lorenz"
    assert "metrics" in data
    assert data["metrics"]["initial_distance"] == pytest.approx(0.000001, rel=1e-6)
    assert data["metrics"]["final_distance"] > 0.0
    assert len(data["baseline_trajectory"]) > 10


def test_simulation_logistic_endpoint(client):
    payload = {
        "model": "logistic",
        "initial_state": [0.5],
        "perturbation": [0.000001],
        "parameters": {"r": 3.9},
        "duration": 50.0
    }
    res = client.post("/api/v1/simulations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["model"] == "logistic"
    assert "baseline_orbit" in data
    assert len(data["baseline_orbit"]) == 50


def test_experiments_crud_and_replay(client):
    # 1. Create experiment
    payload = {
        "title": "Automated Benchmark Experiment",
        "description": "Integration test experiment",
        "model": "lorenz",
        "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667},
        "initial_state": [1.0, 1.0, 1.0],
        "perturbation": [0.000001, 0.0, 0.0],
        "duration": 10.0,
        "dt": 0.01,
        "tags": ["test", "automated"]
    }
    res = client.post("/api/v1/experiments", json=payload)
    assert res.status_code == 200
    exp = res.json()
    exp_id = exp["id"]

    # 2. Get experiment detail
    res_get = client.get(f"/api/v1/experiments/{exp_id}")
    assert res_get.status_code == 200
    detail = res_get.json()
    assert detail["experiment"]["title"] == "Automated Benchmark Experiment"
    assert "metrics" in detail

    # 3. Replay experiment
    res_replay = client.post(f"/api/v1/experiments/{exp_id}/replay")
    assert res_replay.status_code == 200
    replay = res_replay.json()
    assert replay["difference_detected"] is False
    assert replay["max_metric_drift"] < 1e-6
    assert replay["status"] == "reproduced_identically"

    # 4. Export JSON
    res_exp_json = client.get(f"/api/v1/exports/{exp_id}/json")
    assert res_exp_json.status_code == 200
    assert "export_metadata" in res_exp_json.json()

    # 5. Export CSV
    res_exp_csv = client.get(f"/api/v1/exports/{exp_id}/csv")
    assert res_exp_csv.status_code == 200
    assert "time,base_x" in res_exp_csv.text

    # 6. Delete experiment
    res_del = client.delete(f"/api/v1/experiments/{exp_id}")
    assert res_del.status_code == 200


def test_ai_scenario_lab_endpoint(client):
    payload = {
        "prompt": "What if the perturbation was along the z-axis instead of x?",
        "numerical_context": {
            "initial_distance": 0.000001,
            "final_distance": 8.45,
            "model": "lorenz"
        }
    }
    res = client.post("/api/v1/scenarios", json=payload)
    assert res.status_code == 200
    scenario = res.json()
    assert "provenance_status" in scenario
    assert "SPECULATIVE SCENARIO" in scenario["provenance_status"]
    assert len(scenario["assumptions"]) > 0
    assert len(scenario["branches"]) > 0
    assert len(scenario["limitations"]) > 0


def test_microscope_endpoint(client):
    payload = {
        "model": "lorenz",
        "initial_state": [1.0, 1.0, 1.0],
        "scales": [1e-2, 1e-4, 1e-6],
        "axis": 0,
        "duration": 15.0,
        "dt": 0.02
    }
    res = client.post("/api/v1/microscope", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["levels"]) == 3
    assert data["axis_name"] == "x-axis"


def test_bifurcation_endpoint(client):
    payload = {
        "r_min": 2.8,
        "r_max": 3.8,
        "r_steps": 50,
        "iterations": 40,
        "burn_in": 50
    }
    res = client.post("/api/v1/bifurcation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) == 50
    assert "explanation" in data


def test_guided_lessons_endpoint(client):
    res = client.get("/api/v1/lessons")
    assert res.status_code == 200
    lessons = res.json()
    assert len(lessons) == 7
    assert lessons[0]["slug"] == "what-is-deterministic-chaos"
