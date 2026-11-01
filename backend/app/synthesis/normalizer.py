"""Scenario Normalizer: Extracts structured variables, units, and constraints from descriptions."""

import re
from typing import Dict, Any, List
from .schemas import ScenarioVariable

TEMPLATES: List[Dict[str, Any]] = [
    {
        "id": "tech_event",
        "title": "College Technology Conference",
        "description": "A college is conducting a premier technology conference tomorrow with 1,000 expected attendees, 20 coordinating staff, ₹200,000 budget, 80% advance registration, and a venue capacity of 1,200.",
        "time_horizon": "24_hours",
        "domain": "event_management",
        "variables": {
            "expected_attendance": {
                "name": "expected_attendance",
                "label": "Expected Attendance",
                "value": 1000.0,
                "unit": "attendees",
                "min_val": 200.0,
                "max_val": 2500.0,
                "step": 50.0,
                "category": "demand",
                "description": "Total number of participants projected to arrive at the event"
            },
            "staff": {
                "name": "staff",
                "label": "Available Staff",
                "value": 20.0,
                "unit": "coordinators",
                "min_val": 5.0,
                "max_val": 50.0,
                "step": 1.0,
                "category": "capacity",
                "description": "Active event coordinators handling registration, badges, and stage ops"
            },
            "venue_capacity": {
                "name": "venue_capacity",
                "label": "Venue Capacity",
                "value": 1200.0,
                "unit": "seats",
                "min_val": 500.0,
                "max_val": 3000.0,
                "step": 50.0,
                "category": "capacity",
                "description": "Maximum safe auditorium and hall physical capacity"
            },
            "registration_rate": {
                "name": "registration_rate",
                "label": "Advance Registration Rate",
                "value": 80.0,
                "unit": "%",
                "min_val": 20.0,
                "max_val": 100.0,
                "step": 5.0,
                "category": "demand",
                "description": "Percentage of registered attendees who have confirmed in advance"
            },
            "budget": {
                "name": "budget",
                "label": "Operating Budget",
                "value": 200000.0,
                "unit": "₹",
                "min_val": 50000.0,
                "max_val": 1000000.0,
                "step": 10000.0,
                "category": "resources",
                "description": "Allocated contingency and operational budget pool"
            }
        }
    },
    {
        "id": "saas_launch",
        "title": "Global SaaS Product Launch",
        "description": "Deploying a major public API and web platform with 50,000 expected day-one users, 12 cloud server clusters, 4 on-call engineers, and an SLA uptime target of 99.9%.",
        "time_horizon": "48_hours",
        "domain": "software_infrastructure",
        "variables": {
            "expected_users": {
                "name": "expected_users",
                "label": "Day-One Active Users",
                "value": 50000.0,
                "unit": "users",
                "min_val": 5000.0,
                "max_val": 200000.0,
                "step": 5000.0,
                "category": "demand",
                "description": "Total unique concurrent and daily active requests"
            },
            "server_nodes": {
                "name": "server_nodes",
                "label": "Cloud Server Pods",
                "value": 12.0,
                "unit": "clusters",
                "min_val": 2.0,
                "max_val": 40.0,
                "step": 1.0,
                "category": "capacity",
                "description": "Autoscaling Kubernetes worker nodes provisioned for ingress traffic"
            },
            "oncall_engineers": {
                "name": "oncall_engineers",
                "label": "On-Call Incident Engineers",
                "value": 4.0,
                "unit": "engineers",
                "min_val": 1.0,
                "max_val": 12.0,
                "step": 1.0,
                "category": "resources",
                "description": "Site reliability engineers monitoring latency and error spikes"
            },
            "cache_hit_rate": {
                "name": "cache_hit_rate",
                "label": "Edge Cache Efficiency",
                "value": 85.0,
                "unit": "%",
                "min_val": 40.0,
                "max_val": 99.0,
                "step": 1.0,
                "category": "performance",
                "description": "Percentage of requests handled by Redis/CDN without database roundtrips"
            }
        }
    },
    {
        "id": "hospital_er",
        "title": "Metropolitan Hospital Emergency Surge",
        "description": "Hospital trauma unit preparing for an extreme weather weekend with 120 total inpatient beds, 25 emergency nurses, 8 triage physicians, and a target 30-minute triage threshold.",
        "time_horizon": "72_hours",
        "domain": "healthcare_operations",
        "variables": {
            "inpatient_beds": {
                "name": "inpatient_beds",
                "label": "Available Trauma Beds",
                "value": 120.0,
                "unit": "beds",
                "min_val": 40.0,
                "max_val": 250.0,
                "step": 5.0,
                "category": "capacity",
                "description": "ICU and emergency beds ready for acute admissions"
            },
            "er_nurses": {
                "name": "er_nurses",
                "label": "Active ER Nurses",
                "value": 25.0,
                "unit": "nurses",
                "min_val": 8.0,
                "max_val": 60.0,
                "step": 1.0,
                "category": "resources",
                "description": "Triage and critical care nursing staff on shift"
            },
            "triage_doctors": {
                "name": "triage_doctors",
                "label": "Attending Physicians",
                "value": 8.0,
                "unit": "doctors",
                "min_val": 2.0,
                "max_val": 20.0,
                "step": 1.0,
                "category": "resources",
                "description": "Licensed emergency physicians performing diagnosis"
            },
            "incoming_rate": {
                "name": "incoming_rate",
                "label": "Incoming Patient Rate",
                "value": 18.0,
                "unit": "patients/hr",
                "min_val": 5.0,
                "max_val": 45.0,
                "step": 1.0,
                "category": "demand",
                "description": "Average arrival rate of ambulatory and emergency admissions"
            }
        }
    }
]


def normalize_scenario(description: str, explicit_variables: Dict[str, float] = None) -> Dict[str, Any]:
    """Parse scenario description, detect relevant variables, and format conditions."""
    explicit_variables = explicit_variables or {}

    # Match against known templates if similar
    desc_lower = description.lower()
    selected_template = TEMPLATES[0]  # Default to tech event
    for tmpl in TEMPLATES:
        if tmpl["id"] in desc_lower or any(k in desc_lower for k in tmpl["title"].lower().split()):
            selected_template = tmpl
            break

    # Build detected conditions
    conditions: Dict[str, ScenarioVariable] = {}
    tmpl_vars = selected_template["variables"]

    for var_key, var_def in tmpl_vars.items():
        curr_val = explicit_variables.get(var_key, var_def["value"])
        conditions[var_key] = ScenarioVariable(
            name=var_key,
            label=var_def["label"],
            value=float(curr_val),
            unit=var_def["unit"],
            min_val=var_def["min_val"],
            max_val=var_def["max_val"],
            step=var_def["step"],
            category=var_def["category"],
            description=var_def["description"]
        )

    # Free-text numbers detection for custom values
    nums = re.findall(r'(\d+[\d,]*)\s*([a-zA-Z%₹$]+)?', description)
    # If explicit variables had extra keys not in template, add them
    for k, v in explicit_variables.items():
        if k not in conditions:
            conditions[k] = ScenarioVariable(
                name=k,
                label=k.replace('_', ' ').title(),
                value=float(v),
                unit="",
                min_val=0.0,
                max_val=max(v * 3.0, 100.0),
                step=1.0,
                category="custom",
                description=f"User-specified parameter for {k}"
            )

    return {
        "template_id": selected_template["id"],
        "title": selected_template["title"],
        "time_horizon": selected_template["time_horizon"],
        "detected_conditions": conditions
    }
