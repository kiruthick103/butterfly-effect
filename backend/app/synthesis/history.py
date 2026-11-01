"""Experiment History: Tracks, replays, and compares scenario experiments."""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

DEFAULT_HISTORY: List[Dict[str, Any]] = [
    {
        "id": "exp-001",
        "title": "College Technology Conference — Baseline",
        "timestamp": "2026-10-28T16:15:00Z",
        "scenario_description": "A college is conducting a premier technology conference with 1,000 expected attendees, 20 coordinating staff, ₹200k budget, and 1,200 capacity.",
        "time_horizon": "24_hours",
        "conditions": {
            "expected_attendance": 1000.0,
            "staff": 20.0,
            "venue_capacity": 1200.0,
            "budget": 200000.0,
            "registration_rate": 80.0
        },
        "whatif_applied": None,
        "futures_summary": {
            "Success": 63,
            "Overload": 27,
            "Failure": 10
        },
        "butterfly_effect": {
            "score": 0.0,
            "level": "BASELINE",
            "largest_shift": "0.0%"
        },
        "uncertainty": "LOW — Strong multi-stream consensus"
    },
    {
        "id": "exp-002",
        "title": "Staff Reduction (-20%) Micro-Perturbation",
        "timestamp": "2026-10-28T16:22:30Z",
        "scenario_description": "College Tech Conference: Micro-perturbation reducing staff from 20 to 16 coordinators.",
        "time_horizon": "24_hours",
        "conditions": {
            "expected_attendance": 1000.0,
            "staff": 16.0,
            "venue_capacity": 1200.0,
            "budget": 200000.0,
            "registration_rate": 80.0
        },
        "whatif_applied": {
            "variable": "staff",
            "old_value": 20.0,
            "new_value": 16.0,
            "change_pct": -20.0
        },
        "futures_summary": {
            "Success": 51,
            "Overload": 39,
            "Failure": 10
        },
        "butterfly_effect": {
            "score": 2.22,
            "level": "HIGH",
            "largest_shift": "Overload +44.4%"
        },
        "uncertainty": "MODERATE — Threshold sensitivity"
    },
    {
        "id": "exp-003",
        "title": "Demand Surge (+15%) Perturbation",
        "timestamp": "2026-10-28T16:35:10Z",
        "scenario_description": "College Tech Conference: Registration burst increasing attendance to 1,150 participants.",
        "time_horizon": "24_hours",
        "conditions": {
            "expected_attendance": 1150.0,
            "staff": 20.0,
            "venue_capacity": 1200.0,
            "budget": 200000.0,
            "registration_rate": 92.0
        },
        "whatif_applied": {
            "variable": "expected_attendance",
            "old_value": 1000.0,
            "new_value": 1150.0,
            "change_pct": 15.0
        },
        "futures_summary": {
            "Success": 48,
            "Overload": 36,
            "Failure": 16
        },
        "butterfly_effect": {
            "score": 2.22,
            "level": "HIGH",
            "largest_shift": "Failure +60.0%"
        },
        "uncertainty": "MODERATE — Capacity saturation"
    }
]


class ExperimentHistoryManager:
    def __init__(self):
        self.experiments: List[Dict[str, Any]] = list(DEFAULT_HISTORY)

    def list_all(self) -> List[Dict[str, Any]]:
        return sorted(self.experiments, key=lambda x: x["timestamp"], reverse=True)

    def add(self, record: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in record:
            record["id"] = f"exp-{str(uuid.uuid4())[:6]}"
        if "timestamp" not in record:
            record["timestamp"] = datetime.now(timezone.utc).isoformat()
        self.experiments.insert(0, record)
        if len(self.experiments) > 50:
            self.experiments.pop()
        return record

    def delete(self, exp_id: str) -> bool:
        initial_len = len(self.experiments)
        self.experiments = [e for e in self.experiments if e["id"] != exp_id]
        return len(self.experiments) < initial_len


history_manager = ExperimentHistoryManager()
