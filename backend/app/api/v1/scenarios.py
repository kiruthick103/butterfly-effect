"""AI Scenario Lab endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.database import Scenario, User
from app.schemas.ai import ScenarioRequest, ScenarioResponse
from app.ai.service import scenario_service
from app.api.v1.auth import get_current_user_optional

router = APIRouter(prefix="/scenarios", tags=["AI Scenario Lab"])


@router.post("", response_model=ScenarioResponse)
async def generate_scenario(
    request: ScenarioRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Formulate structured speculative what-if scenario branches grounded on verified numerical metrics."""
    user_id = current_user.id if current_user else None
    response = await scenario_service.generate_scenario(request, user_id=user_id, db=db)
    return response


@router.get("", response_model=List[ScenarioResponse])
def list_scenarios(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List historical AI scenarios."""
    query = db.query(Scenario)
    if current_user:
        query = query.filter((Scenario.user_id == current_user.id) | (Scenario.user_id == None))
    scenarios = query.order_by(Scenario.created_at.desc()).limit(50).all()

    results = []
    for sc in scenarios:
        results.append(ScenarioResponse(
            scenario_title=sc.scenario_title or "Speculative Branching Scenario",
            provenance_status="SPECULATIVE SCENARIO - AI GENERATED HYPOTHESIS",
            verified_numerical_facts={},
            assumptions=sc.assumptions or [],
            branches=sc.branches or [],
            limitations=sc.limitations or [],
            ai_provider=sc.ai_provider or "mock",
            created_at=sc.created_at
        ))
    return results
