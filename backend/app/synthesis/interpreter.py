"""General-Purpose Scenario Interpreter: Parses natural language scenarios across any domain into structured simulation models."""

import re
import logging
from typing import Dict, List, Any, Tuple
from .schemas import ScenarioVariable, FailureMode
from .ai_adapters import DualModelSynthesizer

logger = logging.getLogger("butterfly_effect_lab.interpreter")


class ScenarioInterpreter:
    """Interprets free-form narrative descriptions into validated mathematical parameters and failure modes."""

    @classmethod
    async def interpret(
        cls,
        description: str,
        user_overrides: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """Convert natural language scenario into structured simulation parameters."""
        user_overrides = user_overrides or {}
        
        # 1. Attempt AI-based deep interpretation via Groq / Gemini
        ai_spec = await DualModelSynthesizer.interpret_raw_scenario(description)
        if ai_spec and "variables" in ai_spec and len(ai_spec["variables"]) >= 2:
            logger.info("Successfully interpreted scenario via AI Synthesis Engine.")
            title = ai_spec.get("title", "Custom Scenario Simulation")
            domain = ai_spec.get("domain", "operations")
            time_horizon = ai_spec.get("time_horizon", "24_hours")
            assumptions = ai_spec.get("assumptions", [
                "Stochastic inputs follow standard operational distributions",
                "Subsystems exhibit threshold-dependent nonlinear behavior"
            ])

            variables: Dict[str, ScenarioVariable] = {}
            for k, raw_v in ai_spec["variables"].items():
                val = float(user_overrides.get(k, raw_v.get("value", 100.0)))
                variables[k] = ScenarioVariable(
                    name=k,
                    label=raw_v.get("label", k.replace("_", " ").title()),
                    value=val,
                    unit=raw_v.get("unit", ""),
                    min_val=float(raw_v.get("min_val", val * 0.2)),
                    max_val=float(raw_v.get("max_val", val * 3.0)),
                    step=float(raw_v.get("step", max(1.0, round(val * 0.05, 1)))),
                    category=raw_v.get("category", "general"),
                    description=raw_v.get("description", f"Parameter for {k}")
                )

            failure_modes = ai_spec.get("failure_modes", [])
            return {
                "title": title,
                "domain": domain,
                "time_horizon": time_horizon,
                "assumptions": assumptions,
                "detected_conditions": variables,
                "failure_modes": failure_modes
            }

        # 2. Heuristic Pattern Fallback (guarantees 100% uptime for any domain)
        logger.info("Using heuristic scenario interpreter fallback.")
        return cls._interpret_heuristic(description, user_overrides)

    @classmethod
    def _interpret_heuristic(
        cls,
        description: str,
        user_overrides: Dict[str, float]
    ) -> Dict[str, Any]:
        desc_lower = description.lower()

        # 15 Simple Everyday Scenarios Detection & Rich Domain Modeling
        if bool(re.search(r'\b(bus|buses|missed bus|transit bus)\b', desc_lower)):
            domain = "transit_delay"
            title = "Missed Bus Before Exam: Critical Transit Recovery"
            time_horizon = "2_hours"
            assumptions = [
                "Exam hall doors lock strictly at scheduled start time",
                "Traffic congestion variance follows a log-normal distribution",
                "Ride-hail surge pricing may apply during peak morning hours"
            ]
            vars_data = {
                "exam_buffer_mins": {"label": "Exam Door Buffer", "value": 45.0, "unit": "mins", "min": 5.0, "max": 120.0, "step": 5.0, "cat": "demand", "desc": "Minutes remaining before exam hall doors lock"},
                "next_bus_wait_mins": {"label": "Next Bus Departure Wait", "value": 25.0, "unit": "mins", "min": 5.0, "max": 60.0, "step": 5.0, "cat": "risk", "desc": "Wait time for the subsequent transit bus"},
                "transit_travel_mins": {"label": "Bus Ride Duration", "value": 30.0, "unit": "mins", "min": 10.0, "max": 90.0, "step": 5.0, "cat": "demand", "desc": "Estimated bus travel time to campus"},
                "ride_hail_wait_mins": {"label": "Cab / Auto Pickup Wait", "value": 8.0, "unit": "mins", "min": 2.0, "max": 30.0, "step": 1.0, "cat": "resources", "desc": "Pickup arrival time for emergency ride-hail"},
                "ride_hail_cost_inr": {"label": "Ride-Hail Fare", "value": 280.0, "unit": "INR", "min": 100.0, "max": 1000.0, "step": 20.0, "cat": "finance", "desc": "Cost of emergency cab or auto-rickshaw"}
            }

        elif any(w in desc_lower for w in ["waking up late", "woke up late", "overslept", "alarm failure", "missed alarm"]):
            domain = "time_management"
            title = "Waking Up Late: Morning Buffer Compression"
            time_horizon = "3_hours"
            assumptions = [
                "Morning preparation tasks can be compressed under emergency triage",
                "Traffic travel times increase as morning rush hour progresses"
            ]
            vars_data = {
                "overslept_mins": {"label": "Overslept Duration", "value": 40.0, "unit": "mins", "min": 10.0, "max": 120.0, "step": 5.0, "cat": "risk", "desc": "Minutes lost past scheduled wake-up alarm"},
                "minutes_to_meeting": {"label": "Time to Presentation", "value": 50.0, "unit": "mins", "min": 15.0, "max": 120.0, "step": 5.0, "cat": "demand", "desc": "Window before all-hands meeting starts"},
                "express_prep_mins": {"label": "Express Prep Duration", "value": 12.0, "unit": "mins", "min": 5.0, "max": 40.0, "step": 1.0, "cat": "resources", "desc": "Minimum triage time to get dressed and pack essentials"},
                "commute_duration_mins": {"label": "Morning Commute Time", "value": 35.0, "unit": "mins", "min": 15.0, "max": 90.0, "step": 5.0, "cat": "demand", "desc": "Travel time to destination in current traffic"},
                "remote_join_permitted": {"label": "Remote Dial-in Option", "value": 1.0, "unit": "avail", "min": 0.0, "max": 1.0, "step": 1.0, "cat": "resources", "desc": "1 if remote mobile presentation is permitted, 0 if in-person mandatory"}
            }

        elif any(w in desc_lower for w in ["phone battery", "battery dying", "low battery", "charger", "power bank"]):
            domain = "device_resilience"
            title = "Phone Battery Depletion & Digital Lockout"
            time_horizon = "6_hours"
            assumptions = [
                "Active screen and GPS increase discharge rate nonlinearly",
                "Low Power Mode throttles background tasks to extend lifetime"
            ]
            vars_data = {
                "battery_charge_pct": {"label": "Current Battery Level", "value": 7.0, "unit": "%", "min": 1.0, "max": 50.0, "step": 1.0, "cat": "resources", "desc": "Remaining percentage of smartphone battery"},
                "hours_away_from_charger": {"label": "Hours Until Charger", "value": 3.5, "unit": "hours", "min": 0.5, "max": 10.0, "step": 0.5, "cat": "demand", "desc": "Time before reaching an available charging port"},
                "drain_rate_pct_hr": {"label": "Baseline Drain Rate", "value": 6.0, "unit": "%/hr", "min": 2.0, "max": 20.0, "step": 1.0, "cat": "risk", "desc": "Standby battery consumption rate"},
                "gps_navigation_usage_mins": {"label": "Navigation Screen Time", "value": 20.0, "unit": "mins", "min": 0.0, "max": 60.0, "step": 5.0, "cat": "demand", "desc": "Active map display minutes required for route"},
                "low_power_mode_active": {"label": "Ultra Battery Saver", "value": 1.0, "unit": "mode", "min": 0.0, "max": 1.0, "step": 1.0, "cat": "resources", "desc": "1 if Ultra Power Saver active (cuts drain by 60%), 0 otherwise"}
            }

        elif any(w in desc_lower for w in ["heavy rain", "downpour", "waterlogging", "rain before college", "monsoon"]):
            domain = "weather_disruption"
            title = "Heavy Rain Before College: Urban Gridlock & Transit"
            time_horizon = "4_hours"
            assumptions = [
                "Urban arterial roads waterlog rapidly when rainfall exceeds 30mm/hr",
                "Public transit frequency drops as street water levels rise"
            ]
            vars_data = {
                "rainfall_mm_hr": {"label": "Precipitation Intensity", "value": 45.0, "unit": "mm/hr", "min": 10.0, "max": 120.0, "step": 5.0, "cat": "risk", "desc": "Current rainfall precipitation rate"},
                "waterlog_depth_cm": {"label": "Road Waterlog Depth", "value": 25.0, "unit": "cm", "min": 0.0, "max": 80.0, "step": 5.0, "cat": "risk", "desc": "Flood water depth on main college route"},
                "transit_delay_multiplier": {"label": "Transit Delay Factor", "value": 2.2, "unit": "x", "min": 1.0, "max": 4.0, "step": 0.2, "cat": "risk", "desc": "Congestion transit slowdown multiplier"},
                "distance_to_campus_km": {"label": "Distance to Campus", "value": 12.0, "unit": "km", "min": 2.0, "max": 35.0, "step": 1.0, "cat": "demand", "desc": "Total travel distance to college campus"},
                "attendance_leniency_pct": {"label": "College Late Leniency", "value": 30.0, "unit": "prob", "min": 0.0, "max": 100.0, "step": 10.0, "cat": "resources", "desc": "Probability college administration relaxes late gate entry"}
            }

        elif any(w in desc_lower for w in ["exam tomorrow", "study", "syllabus", "revision", "semester exam"]):
            domain = "academic_crunch"
            title = "Exam Tomorrow: Syllabus Crunch & Cognitive Load"
            time_horizon = "14_hours"
            assumptions = [
                "Cognitive retention degrades after 8 continuous hours of study",
                "Selective high-yield topic coverage yields disproportionate exam points"
            ]
            vars_data = {
                "hours_until_exam": {"label": "Hours Until Exam", "value": 14.0, "unit": "hours", "min": 4.0, "max": 48.0, "step": 1.0, "cat": "demand", "desc": "Time remaining before exam papers are distributed"},
                "syllabus_covered_pct": {"label": "Syllabus Covered", "value": 40.0, "unit": "%", "min": 10.0, "max": 90.0, "step": 5.0, "cat": "resources", "desc": "Portion of academic syllabus mastered"},
                "study_speed_pages_hr": {"label": "Reading Speed", "value": 12.0, "unit": "pg/hr", "min": 4.0, "max": 30.0, "step": 2.0, "cat": "resources", "desc": "Active revision pages mastered per hour"},
                "unstudied_highweight_topics": {"label": "High-Weight Unread Units", "value": 5.0, "unit": "units", "min": 1.0, "max": 12.0, "step": 1.0, "cat": "risk", "desc": "Critical high-mark chapters not yet opened"},
                "cognitive_fatigue_penalty_pct": {"label": "Sleep Deprivation Penalty", "value": 35.0, "unit": "%", "min": 0.0, "max": 70.0, "step": 5.0, "cat": "risk", "desc": "Expected retention drop from pulling an all-nighter"}
            }

        elif any(w in desc_lower for w in ["internet goes down", "internet down", "wifi down", "fiber cut", "broadband", "fiber internet", "hotspot", "wifi disconnected"]):
            domain = "connectivity_failure"
            title = "Internet Goes Down: Critical Session Continuity"
            time_horizon = "3_hours"
            assumptions = [
                "Cellular hotspot stability depends on local tower load",
                "Video proctoring streams require persistent minimum throughput"
            ]
            vars_data = {
                "hotspot_data_balance_gb": {"label": "Hotspot Data Balance", "value": 1.2, "unit": "GB", "min": 0.2, "max": 10.0, "step": 0.2, "cat": "resources", "desc": "Mobile cellular data remaining on phone"},
                "cellular_signal_bars": {"label": "Cellular Signal Strength", "value": 2.0, "unit": "bars", "min": 1.0, "max": 5.0, "step": 1.0, "cat": "resources", "desc": "Mobile network reception quality indoors"},
                "upload_bandwidth_required_mbps": {"label": "Required Upload Speed", "value": 4.0, "unit": "Mbps", "min": 1.0, "max": 25.0, "step": 1.0, "cat": "demand", "desc": "Minimum bandwidth required for active exam stream"},
                "exam_duration_mins": {"label": "Session Duration", "value": 90.0, "unit": "mins", "min": 15.0, "max": 180.0, "step": 15.0, "cat": "demand", "desc": "Remaining duration of the critical online session"},
                "isp_estimated_repair_hrs": {"label": "ISP Restoration ETA", "value": 4.0, "unit": "hours", "min": 1.0, "max": 24.0, "step": 1.0, "cat": "risk", "desc": "Estimated hours until primary fiber connection returns"}
            }

        elif any(w in desc_lower for w in ["laptop stops working", "laptop broken", "laptop crash", "laptop dead", "laptop screen goes black", "macbook broken", "black screen", "hard drive failure", "pc crash"]):
            domain = "hardware_failure"
            title = "Laptop Stops Working: Emergency Code Recovery"
            time_horizon = "4_hours"
            assumptions = [
                "Uncommitted local Git repositories cannot be restored without hardware reboot",
                "Secondary loaner machines require fresh environment setup time"
            ]
            vars_data = {
                "hours_to_deadline": {"label": "Hours to Merge Freeze", "value": 3.0, "unit": "hours", "min": 0.5, "max": 12.0, "step": 0.5, "cat": "demand", "desc": "Hours remaining before repository merge freeze"},
                "unpushed_commits_count": {"label": "Unpushed Local Commits", "value": 8.0, "unit": "commits", "min": 1.0, "max": 25.0, "step": 1.0, "cat": "risk", "desc": "Critical code changes trapped on crashed device"},
                "backup_machine_proximity_km": {"label": "Distance to Spare PC", "value": 4.5, "unit": "km", "min": 0.0, "max": 20.0, "step": 0.5, "cat": "resources", "desc": "Distance to friend or campus lab loaner machine"},
                "cloud_backup_recency_hours": {"label": "Last Cloud Backup Age", "value": 12.0, "unit": "hours", "min": 1.0, "max": 48.0, "step": 1.0, "cat": "risk", "desc": "Hours since last successful cloud sync"},
                "reboot_triage_attempts": {"label": "Hardware Reboot Tries", "value": 3.0, "unit": "tries", "min": 1.0, "max": 10.0, "step": 1.0, "cat": "resources", "desc": "Hard reboot cycles attempted before calling technician"}
            }

        elif any(w in desc_lower for w in ["running out of money", "broke", "no cash", "empty bank", "allowance"]):
            domain = "personal_finance"
            title = "Running Out of Money: Essential Living Runway"
            time_horizon = "10_days"
            assumptions = [
                "Discretionary spending drops immediately to zero",
                "Emergency peer credit has finite availability and social limits"
            ]
            vars_data = {
                "cash_balance_inr": {"label": "Liquid Bank Balance", "value": 420.0, "unit": "INR", "min": 50.0, "max": 5000.0, "step": 50.0, "cat": "resources", "desc": "Available liquid cash in student bank account"},
                "days_until_refill": {"label": "Days Until Allowance", "value": 8.0, "unit": "days", "min": 1.0, "max": 25.0, "step": 1.0, "cat": "demand", "desc": "Days remaining until next stipend or salary transfer"},
                "daily_essential_food_inr": {"label": "Essential Food Cost/Day", "value": 120.0, "unit": "INR/day", "min": 50.0, "max": 400.0, "step": 10.0, "cat": "demand", "desc": "Bare minimum daily cost for campus canteen meals"},
                "pending_bills_inr": {"label": "Pending Urgent Bills", "value": 350.0, "unit": "INR", "min": 0.0, "max": 2000.0, "step": 50.0, "cat": "risk", "desc": "Overdue mobile recharge and utility dues"},
                "emergency_credit_available_inr": {"label": "Peer Emergency Credit", "value": 1000.0, "unit": "INR", "min": 0.0, "max": 5000.0, "step": 200.0, "cat": "resources", "desc": "Amount friends or roommates can lend immediately"}
            }

        elif any(w in desc_lower for w in ["group project", "group members", "teammate", "team members", "slacking", "project submission", "collaborative project", "semester project"]):
            domain = "team_coordination"
            title = "Group Project Delay: Team Collapse & Delivery"
            time_horizon = "48_hours"
            assumptions = [
                "Remaining active team members take on linear overtime burden",
                "Project submission portal closes strictly with no grace period"
            ]
            vars_data = {
                "hours_until_submission": {"label": "Hours to Submission", "value": 48.0, "unit": "hours", "min": 6.0, "max": 96.0, "step": 6.0, "cat": "demand", "desc": "Time left before academic portal deadline"},
                "project_completion_pct": {"label": "Project Progress", "value": 60.0, "unit": "%", "min": 20.0, "max": 90.0, "step": 5.0, "cat": "resources", "desc": "Current percentage of project code and report completed"},
                "active_contributors": {"label": "Active Working Members", "value": 2.0, "unit": "peers", "min": 1.0, "max": 6.0, "step": 1.0, "cat": "resources", "desc": "Members actively doing work"},
                "non_responsive_members": {"label": "Unresponsive Teammates", "value": 2.0, "unit": "peers", "min": 1.0, "max": 4.0, "step": 1.0, "cat": "risk", "desc": "Teammates who went dark with assigned sections"},
                "remaining_work_hours": {"label": "Remaining Workload", "value": 32.0, "unit": "hrs", "min": 8.0, "max": 80.0, "step": 4.0, "cat": "demand", "desc": "Total person-hours needed to finish project deliverable"}
            }

        elif any(w in desc_lower for w in ["unexpected illness", "fever", "sick on interview", "illness", "headache"]):
            domain = "health_crisis"
            title = "Unexpected Illness: Interview Performance & Triage"
            time_horizon = "12_hours"
            assumptions = [
                "Cognitive acuity peaks 90 minutes after antipyretic medication",
                "Recruiters evaluate communication and problem-solving resilience"
            ]
            vars_data = {
                "body_temperature_f": {"label": "Body Temperature", "value": 102.0, "unit": "°F", "min": 99.0, "max": 104.5, "step": 0.5, "cat": "risk", "desc": "Patient oral thermometer reading"},
                "hours_until_interview": {"label": "Hours Until Interview", "value": 5.0, "unit": "hours", "min": 1.0, "max": 24.0, "step": 1.0, "cat": "demand", "desc": "Hours before final-round video interview"},
                "cognitive_focus_pct": {"label": "Cognitive Focus Level", "value": 45.0, "unit": "%", "min": 15.0, "max": 85.0, "step": 5.0, "cat": "resources", "desc": "Self-rated mental focus under fever symptoms"},
                "paracetamol_relief_hours": {"label": "Medication Relief Window", "value": 4.0, "unit": "hours", "min": 1.0, "max": 8.0, "step": 0.5, "cat": "resources", "desc": "Expected window of reduced headache and fever"},
                "reschedule_leniency_prob": {"label": "Reschedule Acceptance", "value": 65.0, "unit": "%", "min": 10.0, "max": 95.0, "step": 5.0, "cat": "resources", "desc": "Probability hiring manager approves a 24-hr reschedule"}
            }

        elif any(w in desc_lower for w in ["traffic", "jam", "bumper-to-bumper", "bumper to bumper", "standstill", "gridlock", "highway", "road congestion"]):
            domain = "traffic_delay"
            title = "Traffic Jam: Airport Flight Gate Race"
            time_horizon = "2_hours"
            assumptions = [
                "Bottleneck clearance speed follows slow-wave queue dissipation",
                "Flight boarding doors close strictly 15 minutes before departure"
            ]
            vars_data = {
                "minutes_to_gate_closure": {"label": "Minutes to Gate Close", "value": 40.0, "unit": "mins", "min": 10.0, "max": 120.0, "step": 5.0, "cat": "demand", "desc": "Time left before flight boarding doors lock"},
                "gps_estimated_travel_mins": {"label": "GPS Predicted Travel", "value": 48.0, "unit": "mins", "min": 15.0, "max": 120.0, "step": 3.0, "cat": "demand", "desc": "Current navigation arrival estimate in heavy traffic"},
                "current_crawl_speed_kmh": {"label": "Traffic Crawl Speed", "value": 8.0, "unit": "km/h", "min": 0.0, "max": 50.0, "step": 2.0, "cat": "risk", "desc": "Current vehicle speed on jammed highway"},
                "distance_to_airport_km": {"label": "Distance to Terminal", "value": 14.0, "unit": "km", "min": 3.0, "max": 40.0, "step": 1.0, "cat": "demand", "desc": "Remaining road distance to airport terminal"},
                "security_fast_track_available": {"label": "Express Security Pass", "value": 0.0, "unit": "access", "min": 0.0, "max": 1.0, "step": 1.0, "cat": "resources", "desc": "1 if priority security checkpoint access available, 0 otherwise"}
            }

        elif any(w in desc_lower for w in ["package", "courier", "parcel", "delivery", "late delivery"]):
            domain = "logistics_delay"
            title = "Late Package Delivery: Demo Hardware Replacement"
            time_horizon = "12_hours"
            assumptions = [
                "Hub pickup requires manual warehouse package retrieval and security verification",
                "Local retail electronics stores carry generic functional alternatives"
            ]
            vars_data = {
                "hours_until_demo": {"label": "Hours Until Client Demo", "value": 6.0, "unit": "hours", "min": 1.0, "max": 24.0, "step": 1.0, "cat": "demand", "desc": "Time remaining before hardware presentation to stakeholders"},
                "courier_estimated_delivery_hrs": {"label": "Courier Delivery ETA", "value": 9.0, "unit": "hours", "min": 2.0, "max": 36.0, "step": 1.0, "cat": "risk", "desc": "Courier estimated arrival window"},
                "hub_self_pickup_distance_km": {"label": "Hub Warehouse Distance", "value": 22.0, "unit": "km", "min": 5.0, "max": 60.0, "step": 2.0, "cat": "demand", "desc": "Distance to regional courier sorting hub for self-pickup"},
                "emergency_store_component_cost_inr": {"label": "Local Replacement Cost", "value": 1800.0, "unit": "INR", "min": 500.0, "max": 6000.0, "step": 100.0, "cat": "finance", "desc": "Cost of buying sensor from nearby physical electronics shop"},
                "demo_mock_software_fallback": {"label": "Mock Telemetry Stub", "value": 1.0, "unit": "stub", "min": 0.0, "max": 1.0, "step": 1.0, "cat": "resources", "desc": "1 if demo can substitute real sensor with mock data stub, 0 otherwise"}
            }

        elif any(w in desc_lower for w in ["birthday", "party budget", "surprise party", "birthday gathering", "birthday celebration"]):
            domain = "event_finance"
            title = "Birthday on a Budget: Cost Allocation Optimization"
            time_horizon = "24_hours"
            assumptions = [
                "Food and cake represent fixed non-negotiable celebration costs",
                "DIY decor provides high visual value with low expenditure"
            ]
            vars_data = {
                "total_budget_inr": {"label": "Strict Party Budget", "value": 3500.0, "unit": "INR", "min": 1000.0, "max": 15000.0, "step": 250.0, "cat": "finance", "desc": "Total expenditure budget allocated for celebration"},
                "guest_count": {"label": "Confirmed Friends", "value": 12.0, "unit": "guests", "min": 4.0, "max": 30.0, "step": 1.0, "cat": "demand", "desc": "Total attendees confirmed for surprise gathering"},
                "cake_cost_inr": {"label": "Birthday Cake Price", "value": 850.0, "unit": "INR", "min": 300.0, "max": 2500.0, "step": 50.0, "cat": "finance", "desc": "Price of primary bakery celebration cake"},
                "food_budget_per_head_inr": {"label": "Snack Cost Per Person", "value": 180.0, "unit": "INR/head", "min": 60.0, "max": 600.0, "step": 10.0, "cat": "finance", "desc": "Target snack and beverage spend per guest"},
                "diy_decor_savings_inr": {"label": "DIY Decoration Savings", "value": 600.0, "unit": "INR", "min": 100.0, "max": 1500.0, "step": 50.0, "cat": "resources", "desc": "Cost saved by crafting handmade streamers and lights"}
            }

        elif any(w in desc_lower for w in ["power cut", "blackout", "load shedding", "electricity outage", "power outage", "grid outage", "no inverter"]):
            domain = "infrastructure_failure"
            title = "Power Cut During Work: Battery & Session Triage"
            time_horizon = "4_hours"
            assumptions = [
                "Mobile data hotspot consumes 2-3x normal phone battery",
                "Commercial cafe generators provide reliable secondary power"
            ]
            vars_data = {
                "laptop_battery_mins_left": {"label": "Laptop Battery Left", "value": 45.0, "unit": "mins", "min": 10.0, "max": 180.0, "step": 5.0, "cat": "resources", "desc": "Minutes of battery operational runtime remaining"},
                "client_meeting_duration_mins": {"label": "Sprint Review Length", "value": 60.0, "unit": "mins", "min": 15.0, "max": 120.0, "step": 15.0, "cat": "demand", "desc": "Scheduled duration of live remote client sprint review"},
                "grid_power_restoration_hrs": {"label": "Grid Outage Duration", "value": 2.5, "unit": "hours", "min": 0.5, "max": 8.0, "step": 0.5, "cat": "risk", "desc": "Expected hours until utility grid power returns"},
                "mobile_hotspot_drain_pct_hr": {"label": "Phone Hotspot Drain", "value": 25.0, "unit": "%/hr", "min": 10.0, "max": 50.0, "step": 5.0, "cat": "risk", "desc": "Phone battery drain rate while tethering laptop"},
                "nearby_cafe_distance_km": {"label": "Distance to Powered Cafe", "value": 1.8, "unit": "km", "min": 0.2, "max": 8.0, "step": 0.2, "cat": "resources", "desc": "Travel distance to nearest coffee shop with generator"}
            }

        elif any(w in desc_lower for w in ["deadline", "portal closes", "portal closing", "submission portal", "paper submission", "missing a deadline", "late submission"]):
            domain = "academic_deadline"
            title = "Missing a Deadline: Portal Lockout Prevention"
            time_horizon = "3_hours"
            assumptions = [
                "Automated university portals reject submissions past deadline timestamp by 1 millisecond",
                "Formatting shortcuts can buy up to 45 minutes of critical writing time"
            ]
            vars_data = {
                "hours_until_portal_closes": {"label": "Hours to Portal Lockout", "value": 2.0, "unit": "hours", "min": 0.5, "max": 8.0, "step": 0.25, "cat": "demand", "desc": "Hours remaining before automated portal submission lockout"},
                "work_completed_pct": {"label": "Manuscript Completed", "value": 65.0, "unit": "%", "min": 25.0, "max": 95.0, "step": 5.0, "cat": "resources", "desc": "Current percentage of paper written and verified"},
                "typing_speed_words_hr": {"label": "Writing Throughput", "value": 650.0, "unit": "words/hr", "min": 200.0, "max": 1500.0, "step": 50.0, "cat": "resources", "desc": "Drafting and proofreading speed under pressure"},
                "references_left_to_format": {"label": "Unformatted Citations", "value": 18.0, "unit": "entries", "min": 2.0, "max": 50.0, "step": 2.0, "cat": "risk", "desc": "Bibliography citations requiring manual formatting"},
                "grace_period_mins": {"label": "Portal Grace Period", "value": 15.0, "unit": "mins", "min": 0.0, "max": 60.0, "step": 5.0, "cat": "resources", "desc": "Unofficial server clock submission grace buffer"}
            }

        # Domain classification for other business / engineering systems
        elif any(w in desc_lower for w in ["startup", "mrr", "arr", "burn", "investor", "valuation", "runway", "seed"]):
            domain = "startup_finance"
            title = "Startup Runway & Cashflow Failure Analysis"
            time_horizon = "6_months"
            assumptions = [
                "Fixed monthly burn rate without immediate bridge capital",
                "Customer acquisition velocity depends on sales capacity"
            ]
            vars_data = {
                "runway_months": {"label": "Runway", "value": 6.0, "unit": "months", "min": 1.0, "max": 24.0, "step": 0.5, "cat": "finance", "desc": "Months of operational cash remaining"},
                "monthly_burn": {"label": "Monthly Burn Rate", "value": 45000.0, "unit": "USD", "min": 10000.0, "max": 200000.0, "step": 5000.0, "cat": "finance", "desc": "Net cash outflow per month"},
                "monthly_revenue": {"label": "Monthly Revenue (MRR)", "value": 15000.0, "unit": "USD", "min": 0.0, "max": 100000.0, "step": 2500.0, "cat": "finance", "desc": "Recurring monthly revenue"},
                "customer_churn": {"label": "Monthly Churn Rate", "value": 5.0, "unit": "%", "min": 1.0, "max": 25.0, "step": 0.5, "cat": "risk", "desc": "Percentage of customers cancelling each month"},
                "sales_reps": {"label": "Active Sales Reps", "value": 4.0, "unit": "reps", "min": 1.0, "max": 15.0, "step": 1.0, "cat": "resources", "desc": "Quota-carrying account executives"}
            }

        elif any(w in desc_lower for w in ["supply chain", "cargo", "shipment", "inventory", "shipping port", "logistics", "warehouse buffer"]):
            domain = "supply_chain"
            title = "Supply Chain Disruption & Buffer Depletion"
            time_horizon = "30_days"
            assumptions = [
                "Supplier transit delays propagate downstream without dynamic rerouting",
                "Warehouse buffer stock absorbs short-term volatility"
            ]
            vars_data = {
                "inflow_delay_days": {"label": "Supplier Inflow Delay", "value": 7.0, "unit": "days", "min": 0.0, "max": 30.0, "step": 1.0, "cat": "risk", "desc": "Days supplier delivery is delayed beyond schedule"},
                "safety_stock_units": {"label": "Safety Buffer Stock", "value": 1200.0, "unit": "units", "min": 200.0, "max": 5000.0, "step": 100.0, "cat": "capacity", "desc": "On-hand emergency inventory reserve"},
                "daily_demand": {"label": "Daily Fulfill Demand", "value": 150.0, "unit": "units/day", "min": 50.0, "max": 500.0, "step": 10.0, "cat": "demand", "desc": "Daily outgoing order consumption rate"},
                "dock_workers": {"label": "Warehouse Operations Crew", "value": 12.0, "unit": "workers", "min": 3.0, "max": 30.0, "step": 1.0, "cat": "resources", "desc": "Fulfillment and unloader staff"}
            }

        elif any(w in desc_lower for w in ["software", "server nodes", "deploy", "database latency", "developer", "git", "cloud cluster", "payment gateway", "api requests"]):
            domain = "software_operations"
            title = "Software Deployment & Service Resilience Analysis"
            time_horizon = "14_days"
            assumptions = [
                "Incoming traffic exhibits peak hour multiplier spikes",
                "Upstream database latency degrades non-linearly under load"
            ]
            vars_data = {
                "requests_per_sec": {"label": "Peak Ingestion Rate", "value": 2500.0, "unit": "req/sec", "min": 500.0, "max": 10000.0, "step": 250.0, "cat": "demand", "desc": "Peak concurrent requests arriving at API gateway"},
                "server_nodes": {"label": "Active Compute Nodes", "value": 16.0, "unit": "nodes", "min": 4.0, "max": 64.0, "step": 2.0, "cat": "capacity", "desc": "Worker containers serving requests"},
                "dependency_latency": {"label": "Downstream DB Latency", "value": 45.0, "unit": "ms", "min": 10.0, "max": 500.0, "step": 5.0, "cat": "risk", "desc": "Average response time of external database"},
                "oncall_engineers": {"label": "On-Call Incident Staff", "value": 3.0, "unit": "engineers", "min": 1.0, "max": 10.0, "step": 1.0, "cat": "resources", "desc": "Engineers available for active mitigation"},
                "circuit_breaker_threshold": {"label": "Circuit Breaker Limit", "value": 85.0, "unit": "%", "min": 50.0, "max": 99.0, "step": 5.0, "cat": "risk", "desc": "Error rate threshold triggering circuit cut-off"}
            }

        else:
            # Default Event / Operations Domain
            domain = "event_management"
            title = "Operational Event & Capacity Resilience Simulator"
            time_horizon = "24_hours"
            assumptions = [
                "Peak arrival occurs in a 90-minute concentrated window",
                "Intake processing rate is 8 attendees per staff per 15 minutes"
            ]
            vars_data = {
                "expected_attendance": {"label": "Expected Attendance", "value": 1000.0, "unit": "attendees", "min": 200.0, "max": 2500.0, "step": 50.0, "cat": "demand", "desc": "Total participants projected to arrive"},
                "staff": {"label": "Available Staff", "value": 20.0, "unit": "coordinators", "min": 5.0, "max": 50.0, "step": 1.0, "cat": "resources", "desc": "Active event coordinators handling intake and security"},
                "venue_capacity": {"label": "Venue Capacity", "value": 1200.0, "unit": "seats", "min": 500.0, "max": 3000.0, "step": 50.0, "cat": "capacity", "desc": "Maximum legal auditorium capacity"},
                "registration_rate": {"label": "Advance Registration Rate", "value": 80.0, "unit": "%", "min": 20.0, "max": 100.0, "step": 5.0, "cat": "demand", "desc": "Percentage of confirmed pre-registrations"},
                "budget": {"label": "Operational Budget", "value": 200000.0, "unit": "INR", "min": 50000.0, "max": 1000000.0, "step": 10000.0, "cat": "finance", "desc": "Available operational contingency fund"}
            }

        # Apply numerical regex extractions if user entered specific numbers in narrative
        numbers = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', description)
        if numbers:
            try:
                first_num = float(numbers[0].replace(",", ""))
                first_key = list(vars_data.keys())[0]
                if 10.0 <= first_num <= 50000.0:
                    vars_data[first_key]["value"] = first_num
            except Exception:
                pass

        variables: Dict[str, ScenarioVariable] = {}
        for k, v in vars_data.items():
            val = float(user_overrides.get(k, v["value"]))
            variables[k] = ScenarioVariable(
                name=k,
                label=v["label"],
                value=val,
                unit=v["unit"],
                min_val=float(v["min"]),
                max_val=float(v["max"]),
                step=float(v["step"]),
                category=v["cat"],
                description=v["desc"]
            )

        return {
            "title": title,
            "domain": domain,
            "time_horizon": time_horizon,
            "assumptions": assumptions,
            "detected_conditions": variables,
            "failure_modes": []
        }
