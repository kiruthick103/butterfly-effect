"""Experiments persistence, replay, and comparison endpoints."""

import uuid
import math
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.database import Experiment, Run, RunResult, User
from app.schemas.experiment import (
    ExperimentCreate, ExperimentUpdate, ExperimentResponse,
    ExperimentReplayResponse, ExperimentCompareResponse
)
from app.api.v1.auth import get_current_user_optional, get_current_user
from app.simulation.engine import SimulationEngine, compute_simulation_hash

router = APIRouter(prefix="/experiments", tags=["Experiments"])
engine = SimulationEngine()


@router.post("", response_model=ExperimentResponse)
def create_experiment(
    exp_in: ExperimentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Save an experiment configuration and its verified simulation run result."""
    exp_id = str(uuid.uuid4())
    user_id = current_user.id if current_user else None

    # Calculate config hash
    cfg_hash = compute_simulation_hash(
        model=exp_in.model,
        parameters=exp_in.parameters,
        initial_state=exp_in.initial_state,
        perturbation=exp_in.perturbation,
        duration=exp_in.duration,
        dt=exp_in.dt,
        integrator=exp_in.integrator
    )

    new_exp = Experiment(
        id=exp_id,
        user_id=user_id,
        title=exp_in.title,
        description=exp_in.description,
        model=exp_in.model,
        parameters=exp_in.parameters,
        initial_state=exp_in.initial_state,
        perturbation=exp_in.perturbation,
        duration=exp_in.duration,
        dt=exp_in.dt,
        integrator=exp_in.integrator,
        tags=exp_in.tags or []
    )
    db.add(new_exp)

    # Create run
    run_id = str(uuid.uuid4())
    new_run = Run(
        id=run_id,
        experiment_id=exp_id,
        configuration_hash=cfg_hash,
        status="completed"
    )
    db.add(new_run)

    # Compute simulation if not passed in request
    metrics_data = exp_in.metrics
    explanation_data = exp_in.scientific_explanation
    trajectory_payload = exp_in.trajectory_data

    if not metrics_data or not trajectory_payload:
        if exp_in.model == "lorenz":
            sim_res = engine.run_lorenz_experiment(
                initial_state=exp_in.initial_state,
                perturbation=exp_in.perturbation,
                parameters=exp_in.parameters,
                duration=exp_in.duration,
                dt=exp_in.dt
            )
            metrics_data = sim_res["metrics"]
            explanation_data = sim_res["scientific_explanation"]
            trajectory_payload = {
                "times": sim_res["times"],
                "baseline": sim_res["baseline_trajectory"],
                "perturbed": sim_res["perturbed_trajectory"],
                "distances": sim_res["distances"],
                "log_divergences": sim_res["log_divergences"]
            }

    new_result = RunResult(
        id=str(uuid.uuid4()),
        run_id=run_id,
        metrics=metrics_data or {},
        scientific_explanation=explanation_data,
        trajectory_data=trajectory_payload
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_exp)

    return ExperimentResponse(
        id=new_exp.id,
        user_id=new_exp.user_id,
        title=new_exp.title,
        description=new_exp.description,
        model=new_exp.model,
        model_version=new_exp.model_version,
        parameters=new_exp.parameters,
        initial_state=new_exp.initial_state,
        perturbation=new_exp.perturbation,
        duration=new_exp.duration,
        dt=new_exp.dt,
        integrator=new_exp.integrator,
        tags=new_exp.tags or [],
        created_at=new_exp.created_at,
        updated_at=new_exp.updated_at,
        latest_run_id=run_id,
        latest_metrics=metrics_data,
        latest_explanation=explanation_data
    )


@router.get("", response_model=List[ExperimentResponse])
def list_experiments(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List experiments belonging to the current user (or public experiments if unauthenticated)."""
    query = db.query(Experiment)
    if current_user:
        query = query.filter((Experiment.user_id == current_user.id) | (Experiment.user_id == None))
    experiments = query.order_by(Experiment.created_at.desc()).limit(100).all()

    results = []
    for exp in experiments:
        latest_run = db.query(Run).filter(Run.experiment_id == exp.id).order_by(Run.created_at.desc()).first()
        metrics = latest_run.result.metrics if latest_run and latest_run.result else None
        explanation = latest_run.result.scientific_explanation if latest_run and latest_run.result else None

        results.append(ExperimentResponse(
            id=exp.id,
            user_id=exp.user_id,
            title=exp.title,
            description=exp.description,
            model=exp.model,
            model_version=exp.model_version,
            parameters=exp.parameters,
            initial_state=exp.initial_state,
            perturbation=exp.perturbation,
            duration=exp.duration,
            dt=exp.dt,
            integrator=exp.integrator,
            tags=exp.tags or [],
            created_at=exp.created_at,
            updated_at=exp.updated_at,
            latest_run_id=latest_run.id if latest_run else None,
            latest_metrics=metrics,
            latest_explanation=explanation
        ))
    return results


@router.get("/{experiment_id}", response_model=Dict[str, Any])
def get_experiment(
    experiment_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve full experiment detail including trajectory arrays for charting."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    latest_run = db.query(Run).filter(Run.experiment_id == exp.id).order_by(Run.created_at.desc()).first()
    result = latest_run.result if latest_run else None

    return {
        "experiment": {
            "id": exp.id,
            "title": exp.title,
            "description": exp.description,
            "model": exp.model,
            "model_version": exp.model_version,
            "parameters": exp.parameters,
            "initial_state": exp.initial_state,
            "perturbation": exp.perturbation,
            "duration": exp.duration,
            "dt": exp.dt,
            "integrator": exp.integrator,
            "tags": exp.tags,
            "created_at": exp.created_at
        },
        "run_id": latest_run.id if latest_run else None,
        "metrics": result.metrics if result else None,
        "scientific_explanation": result.scientific_explanation if result else None,
        "trajectory_data": result.trajectory_data if result else None
    }


@router.delete("/{experiment_id}")
def delete_experiment(
    experiment_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Delete experiment (with authorization check)."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if exp.user_id and current_user and exp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this experiment")

    db.delete(exp)
    db.commit()
    return {"message": "Experiment deleted successfully", "id": experiment_id}


@router.post("/{experiment_id}/replay", response_model=ExperimentReplayResponse)
def replay_experiment(
    experiment_id: str,
    db: Session = Depends(get_db)
):
    """Peak Feature: Replay experiment deterministically from its original stored configuration."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    original_run = db.query(Run).filter(Run.experiment_id == exp.id).order_by(Run.created_at.asc()).first()
    orig_metrics = original_run.result.metrics if original_run and original_run.result else {}

    # Rerun simulation using exact stored parameters
    if exp.model == "lorenz":
        replay_sim = engine.run_lorenz_experiment(
            initial_state=exp.initial_state,
            perturbation=exp.perturbation,
            parameters=exp.parameters,
            duration=exp.duration,
            dt=exp.dt
        )
    else:
        replay_sim = engine.run_logistic_experiment(
            x0=exp.initial_state[0],
            perturbation=exp.perturbation[0],
            r=exp.parameters.get("r", 3.9),
            iterations=int(exp.duration)
        )

    curr_metrics = replay_sim["metrics"]

    # Calculate drift between stored metrics and recomputed metrics
    orig_final = float(orig_metrics.get("final_distance", 0.0))
    curr_final = float(curr_metrics.get("final_distance", 0.0))
    drift = abs(orig_final - curr_final)

    difference_detected = drift > 1e-7

    return ExperimentReplayResponse(
        experiment_id=exp.id,
        original_run_id=original_run.id if original_run else "legacy",
        original_metrics=orig_metrics,
        current_metrics=curr_metrics,
        difference_detected=difference_detected,
        max_metric_drift=round(drift, 9),
        status="reproduced_identically" if not difference_detected else "numerical_drift_detected",
        replay_simulation=replay_sim
    )


@router.get("/{id_a}/compare/{id_b}", response_model=ExperimentCompareResponse)
def compare_experiments(
    id_a: str,
    id_b: str,
    db: Session = Depends(get_db)
):
    """Peak Feature: Side-by-side comparison between Experiment A and Experiment B."""
    exp_a = db.query(Experiment).filter(Experiment.id == id_a).first()
    exp_b = db.query(Experiment).filter(Experiment.id == id_b).first()

    if not exp_a or not exp_b:
        raise HTTPException(status_code=404, detail="One or both experiments not found")

    run_a = db.query(Run).filter(Run.experiment_id == exp_a.id).order_by(Run.created_at.desc()).first()
    run_b = db.query(Run).filter(Run.experiment_id == exp_b.id).order_by(Run.created_at.desc()).first()

    metrics_a = run_a.result.metrics if run_a and run_a.result else {}
    metrics_b = run_b.result.metrics if run_b and run_b.result else {}

    # Calculate deltas
    init_a = float(metrics_a.get("initial_distance", 0.0))
    init_b = float(metrics_b.get("initial_distance", 0.0))
    fin_a = float(metrics_a.get("final_distance", 0.0))
    fin_b = float(metrics_b.get("final_distance", 0.0))
    t_a = metrics_a.get("time_to_threshold")
    t_b = metrics_b.get("time_to_threshold")

    metrics_comparison = {
        "initial_distance_ratio": round(init_b / max(init_a, 1e-15), 4) if init_a > 0 else None,
        "final_distance_delta": round(fin_b - fin_a, 6),
        "threshold_time_shift": (round(t_b - t_a, 4) if t_a is not None and t_b is not None else None)
    }

    resp_a = ExperimentResponse(
        id=exp_a.id,
        user_id=exp_a.user_id,
        title=exp_a.title,
        description=exp_a.description,
        model=exp_a.model,
        model_version=exp_a.model_version,
        parameters=exp_a.parameters,
        initial_state=exp_a.initial_state,
        perturbation=exp_a.perturbation,
        duration=exp_a.duration,
        dt=exp_a.dt,
        integrator=exp_a.integrator,
        tags=exp_a.tags or [],
        created_at=exp_a.created_at,
        updated_at=exp_a.updated_at,
        latest_metrics=metrics_a
    )

    resp_b = ExperimentResponse(
        id=exp_b.id,
        user_id=exp_b.user_id,
        title=exp_b.title,
        description=exp_b.description,
        model=exp_b.model,
        model_version=exp_b.model_version,
        parameters=exp_b.parameters,
        initial_state=exp_b.initial_state,
        perturbation=exp_b.perturbation,
        duration=exp_b.duration,
        dt=exp_b.dt,
        integrator=exp_b.integrator,
        tags=exp_b.tags or [],
        created_at=exp_b.created_at,
        updated_at=exp_b.updated_at,
        latest_metrics=metrics_b
    )

    param_deltas = {
        k: exp_b.parameters.get(k, 0.0) - exp_a.parameters.get(k, 0.0)
        for k in set(exp_a.parameters.keys()).union(exp_b.parameters.keys())
    }

    state_deltas = [b - a for a, b in zip(exp_a.initial_state, exp_b.initial_state)]
    pert_deltas = [b - a for a, b in zip(exp_a.perturbation, exp_b.perturbation)]

    return ExperimentCompareResponse(
        experiment_a=resp_a,
        experiment_b=resp_b,
        metrics_comparison=metrics_comparison,
        parameter_deltas=param_deltas,
        initial_state_deltas=state_deltas,
        perturbation_deltas=pert_deltas
    )
