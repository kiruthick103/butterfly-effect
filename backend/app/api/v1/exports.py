"""Export endpoints for JSON, CSV, and summary reports."""

import io
import csv
import json
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.database import Experiment, Run

router = APIRouter(prefix="/exports", tags=["Exports"])


@router.get("/{experiment_id}/json")
def export_experiment_json(experiment_id: str, db: Session = Depends(get_db)):
    """Export complete experiment configuration and metrics in JSON format."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    latest_run = db.query(Run).filter(Run.experiment_id == exp.id).order_by(Run.created_at.desc()).first()
    result = latest_run.result if latest_run else None

    payload = {
        "export_metadata": {
            "platform": "AI Butterfly Effect Lab",
            "format_version": "1.0.0",
            "experiment_id": exp.id,
            "exported_at": str(exp.created_at)
        },
        "experiment": {
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
            "tags": exp.tags
        },
        "run": {
            "run_id": latest_run.id if latest_run else None,
            "configuration_hash": latest_run.configuration_hash if latest_run else None,
            "metrics": result.metrics if result else {},
            "scientific_explanation": result.scientific_explanation if result else None
        }
    }

    content = json.dumps(payload, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="experiment_{exp.id}.json"'}
    )


@router.get("/{experiment_id}/csv")
def export_experiment_csv(experiment_id: str, db: Session = Depends(get_db)):
    """Export trajectory state and separation data as CSV."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    latest_run = db.query(Run).filter(Run.experiment_id == exp.id).order_by(Run.created_at.desc()).first()
    if not latest_run or not latest_run.result or not latest_run.result.trajectory_data:
        raise HTTPException(status_code=400, detail="No trajectory data recorded for this experiment")

    traj = latest_run.result.trajectory_data
    times = traj.get("times", [])
    baseline = traj.get("baseline", [])
    perturbed = traj.get("perturbed", [])
    distances = traj.get("distances", [])

    output = io.StringIO()
    writer = csv.writer(output)

    if exp.model == "lorenz":
        writer.writerow(["time", "base_x", "base_y", "base_z", "pert_x", "pert_y", "pert_z", "euclidean_distance"])
        for i in range(len(times)):
            bx = baseline[i][0] if i < len(baseline) else ""
            by = baseline[i][1] if i < len(baseline) else ""
            bz = baseline[i][2] if i < len(baseline) else ""
            px = perturbed[i][0] if i < len(perturbed) else ""
            py = perturbed[i][1] if i < len(perturbed) else ""
            pz = perturbed[i][2] if i < len(perturbed) else ""
            d = distances[i] if i < len(distances) else ""
            writer.writerow([times[i], bx, by, bz, px, py, pz, d])
    else:
        writer.writerow(["step", "baseline_value", "perturbed_value", "distance"])
        for i in range(len(times)):
            b = baseline[i] if i < len(baseline) else ""
            p = perturbed[i] if i < len(perturbed) else ""
            d = distances[i] if i < len(distances) else ""
            writer.writerow([times[i], b, p, d])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="trajectory_{exp.id}.csv"'}
    )
