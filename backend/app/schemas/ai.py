"""Pydantic schemas for AI Scenario Lab and Evidence Ledger."""

from datetime import datetime
from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field


class ScenarioBranch(BaseModel):
    id: str = Field(description="Branch identifier (e.g., 'A', 'B')")
    trigger: str = Field(description="The underlying causal or parametric variation")
    effects: List[str] = Field(description="Hypothesized downstream phase-space consequences")
    time_horizon: Literal["short", "medium", "long"] = Field(description="Time horizon of impact")
    uncertainties: List[str] = Field(description="Identified sources of epistemic uncertainty")


class ScenarioRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000, description="User's what-if scenario exploration question")
    experiment_id: Optional[str] = Field(default=None, description="Optional associated experiment ID")
    # Ground truth numerical context provided from actual simulation
    numerical_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Verified scientific facts from numerical engine"
    )


class ScenarioResponse(BaseModel):
    scenario_title: str
    provenance_status: str = Field(default="SPECULATIVE SCENARIO - AI GENERATED HYPOTHESIS")
    verified_numerical_facts: Dict[str, Any] = Field(default_factory=dict)
    assumptions: List[str] = Field(default_factory=list)
    branches: List[ScenarioBranch] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    ai_provider: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EvidenceLedgerItem(BaseModel):
    id: str
    claim: str
    source: str
    measured: Optional[str] = None
    method: str
    status: Literal["COMPUTED", "HYPOTHESIS"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
