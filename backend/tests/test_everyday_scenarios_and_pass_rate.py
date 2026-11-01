import pytest
from app.synthesis.interpreter import ScenarioInterpreter
from app.synthesis.simulation_engine import ScenarioSimulationEngine
from app.synthesis.next_scenarios_engine import NextScenariosEngine

EVERYDAY_SCENARIO_PROMPTS = [
    ("Missed Bus Before Exam", "Missed the morning 8:15 AM bus before a final university exam starting at 9:00 AM. 45 minutes until exam hall doors lock.", "exam_buffer_mins"),
    ("Waking Up Late", "Woke up 40 minutes late with an alarm failure; have an all-hands presentation in 50 minutes and a 35-minute commute.", "overslept_mins"),
    ("Phone Battery Dying", "Phone battery at 7% during an unfamiliar city commute without a charger or power bank and boarding pass on phone.", "battery_charge_pct"),
    ("Heavy Rain Before College", "Severe unexpected torrential downpour and waterlogging before mandatory semester lab exam; transit paralyzed.", "rainfall_mm_hr"),
    ("Exam Tomorrow", "Semester final exam in 14 hours; completed only 4 of 10 syllabus modules with high sleep deprivation.", "hours_until_exam"),
    ("Internet Goes Down", "Home fiber internet disconnected 15 minutes before submitting an online certification exam with hotspot at 15% data.", "hotspot_data_balance_gb"),
    ("Laptop Stops Working", "Laptop screen goes black with blinking error LED 3 hours before code freeze deadline with local uncommitted work.", "unpushed_commits_count"),
    ("Running Out of Money", "Bank account balance is ₹420 with 8 days remaining until monthly allowance or salary credit; utility bills due.", "cash_balance_inr"),
    ("Group Project Delay", "Two of four group members stopped replying 48 hours before final semester project submission with 40% work pending.", "remaining_work_hours"),
    ("Unexpected Illness", "Woke up with 102°F fever, severe headache, and chills on the day of a final-round job interview.", "body_temperature_f"),
    ("Traffic Jam", "Stuck in bumper-to-bumper standstill highway traffic with GPS adding 25 minutes; 40 minutes to airport boarding.", "minutes_to_gate_closure"),
    ("Late Package Delivery", "Critical replacement sensor package delayed in courier hub 20 km away with client hardware demo starting in 6 hours.", "courier_estimated_delivery_hrs"),
    ("Birthday on a Budget", "Planning a surprise birthday gathering for 12 close friends with a total strict budget of ₹3,500.", "total_budget_inr"),
    ("Power Cut During Work", "Sudden neighborhood blackout during remote client sprint review with laptop at 35% battery and no home inverter.", "laptop_battery_mins_left"),
    ("Missing a Deadline", "Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete.", "hours_until_portal_closes"),
]

def test_all_15_everyday_scenarios_have_domain_specific_variables():
    for title, prompt, expected_var in EVERYDAY_SCENARIO_PROMPTS:
        res = ScenarioInterpreter._interpret_heuristic(prompt, {})
        vars_dict = res["detected_conditions"]
        assert expected_var in vars_dict, f"Scenario '{title}' missing expected domain variable '{expected_var}'"
        assert "expected_attendance" not in vars_dict, f"Scenario '{title}' incorrectly defaulted to conference attendance!"
        assert "venue_capacity" not in vars_dict, f"Scenario '{title}' incorrectly defaulted to venue capacity!"

def test_simulation_and_pass_rate_engine():
    # Test missed bus
    bus_prompt = EVERYDAY_SCENARIO_PROMPTS[0][1]
    parsed = ScenarioInterpreter._interpret_heuristic(bus_prompt, {})
    vars_values = {k: v.value for k, v in parsed["detected_conditions"].items()}
    
    probs, stats = ScenarioSimulationEngine.run_monte_carlo(vars_values, domain=parsed["domain"], trials=1000, seed=42)
    assert stats.trials_run == 1000
    assert 0.0 <= probs["favorable"] <= 1.0
    
    pass_metrics = NextScenariosEngine.calculate_pass_rate_metrics(probs, stats, vars_values, domain=parsed["domain"])
    assert 0.0 <= pass_metrics.pass_rate_pct <= 100.0
    assert len(pass_metrics.confidence_interval_95) == 2
    assert pass_metrics.confidence_interval_95[0] <= pass_metrics.confidence_interval_95[1]
    
    next_scenarios = NextScenariosEngine.generate_next_scenarios(vars_values, pass_metrics, parsed["domain"], bus_prompt)
    assert len(next_scenarios) >= 4
    types = [ns.type for ns in next_scenarios]
    assert "Stress Test" in types
    assert "Boundary Test" in types
