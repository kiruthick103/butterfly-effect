"""Logistic Map Bifurcation Explorer endpoint."""

from fastapi import APIRouter
from app.schemas.features import BifurcationRequest, BifurcationResponse
from app.simulation.models.logistic import LogisticMap

router = APIRouter(prefix="/bifurcation", tags=["Bifurcation Explorer"])
logistic = LogisticMap()


@router.post("", response_model=BifurcationResponse)
def compute_bifurcation_diagram(request: BifurcationRequest):
    """Compute period-doubling bifurcation diagram across parameter r."""
    data = logistic.compute_bifurcation(
        r_min=request.r_min,
        r_max=request.r_max,
        r_steps=request.r_steps,
        iterations=request.iterations,
        burn_in=request.burn_in,
        x0=request.x0
    )

    total_points = sum(len(entry["values"]) for entry in data)

    explanation = (
        f"Bifurcation diagram computed across r in [{request.r_min}, {request.r_max}]. "
        f"Notice the progression from a single fixed point (r < 3.0), to 2-cycle, 4-cycle, and 8-cycle bifurcations, "
        f"culminating in the chaotic accumulation point at r_infinity approx 3.56995. "
        f"Within the chaotic regime (r > 3.57), observe dark periodic windows such as the period-3 window near r = 3.83."
    )

    return BifurcationResponse(
        data=data,
        total_points=total_points,
        explanation=explanation
    )
