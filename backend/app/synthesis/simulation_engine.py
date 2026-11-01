"""Hybrid Simulation Engine: Monte Carlo, Discrete-Event, and Deterministic Scenario Computing."""

import math
import time
import random
from typing import Dict, List, Any, Tuple
from .schemas import SimulationTrialStats, FutureOutcome, FutureMilestone, FailureMode


class ScenarioSimulationEngine:
    """Executes stochastic Monte Carlo simulations and queue-capacity models to determine genuine outcome frequencies."""

    @classmethod
    def _evaluate_trial_state(
        cls,
        demand: float,
        capacity: float,
        resources: float,
        budget_margin: float,
        domain: str
    ) -> str:
        """Evaluate a single stochastic realization into an outcome branch."""
        # Operational load ratio
        load_ratio = demand / max(capacity, 1.0)
        # Resource sufficiency ratio
        ideal_resources = demand / 40.0 if domain == "event_management" else demand / 20.0
        resource_ratio = resources / max(ideal_resources, 0.1)

        # Domain adjustments
        if "startup" in domain or "finance" in domain or "business" in domain:
            # In finance/startup, budget_margin (runway/cash) is the primary determinant
            if budget_margin <= 0.15:
                return "critical_failure"  # Insolvency / runway exhaustion
            elif budget_margin <= 0.40 or load_ratio < 0.60:
                return "adverse"  # High burn / stagnation
            elif load_ratio >= 0.90 and budget_margin > 0.60:
                return "favorable"  # Growth & profitability
            else:
                return "nominal"  # Sustainable baseline

        elif "tech" in domain or "cloud" in domain or "software" in domain or "payment" in domain:
            # Latency and queue blowout thresholds
            if load_ratio > 1.30 or resource_ratio < 0.50:
                return "critical_failure"  # Cascading outage / circuit breaker open
            elif load_ratio > 1.0 or resource_ratio < 0.75:
                return "adverse"  # Throttling / latency degradation
            elif load_ratio <= 0.75 and resource_ratio >= 0.90:
                return "favorable"  # Sub-millisecond SLA
            else:
                return "nominal"  # Normal operations

        else:
            # General operational / capacity domain
            if load_ratio > 1.25 or resource_ratio < 0.55:
                return "critical_failure"  # Overrun / lockout / emergency throttling
            elif load_ratio > 0.95 or resource_ratio < 0.80:
                return "adverse"  # Bottleneck / queue saturation
            elif load_ratio <= 0.80 and resource_ratio >= 0.90:
                return "favorable"  # Smooth execution
            else:
                return "nominal"  # Stable baseline

    @classmethod
    def run_monte_carlo(
        cls,
        variables: Dict[str, float],
        domain: str = "operations",
        trials: int = 1000,
        seed: int = 42
    ) -> Tuple[Dict[str, float], SimulationTrialStats]:
        """Run N Monte Carlo trials with reproducible seed and calculate empirical frequencies."""
        start_time = time.perf_counter()
        rng = random.Random(seed)

        # Extract or infer primary state dimensions with domain-specific awareness
        if "exam_buffer_mins" in variables or "transit_travel_mins" in variables:
            # Transit Delay / Missed Bus Before Exam
            base_demand = variables.get("transit_travel_mins", 30.0) + variables.get("next_bus_wait_mins", 25.0)
            base_capacity = variables.get("exam_buffer_mins", 45.0)
            base_resources = max(100.0, variables.get("ride_hail_cost_inr", 280.0)) / 10.0
            budget_margin_norm = 1.0 if variables.get("ride_hail_cost_inr", 280.0) < 500.0 else 0.5
        elif "overslept_mins" in variables or "minutes_to_meeting" in variables:
            # Waking Up Late
            base_demand = variables.get("overslept_mins", 40.0) + variables.get("commute_duration_mins", 35.0) + variables.get("express_prep_mins", 12.0)
            base_capacity = variables.get("minutes_to_meeting", 50.0)
            base_resources = 20.0 * (1.5 if variables.get("remote_join_permitted", 1.0) >= 0.5 else 0.8)
            budget_margin_norm = 1.0
        elif "battery_charge_pct" in variables:
            # Phone Battery Dying
            drain_expected = variables.get("hours_away_from_charger", 3.5) * variables.get("drain_rate_pct_hr", 6.0) + (variables.get("gps_navigation_usage_mins", 20.0) / 10.0)
            if variables.get("low_power_mode_active", 1.0) >= 0.5:
                drain_expected *= 0.45
            base_demand = drain_expected
            base_capacity = variables.get("battery_charge_pct", 7.0)
            base_resources = 15.0
            budget_margin_norm = 0.8
        elif "waterlog_depth_cm" in variables or "rainfall_mm_hr" in variables:
            # Heavy Rain Before College
            base_demand = variables.get("distance_to_campus_km", 12.0) * variables.get("transit_delay_multiplier", 2.2) * 5.0
            base_capacity = 60.0 + variables.get("attendance_leniency_pct", 30.0) * 0.4
            base_resources = 15.0
            budget_margin_norm = 0.9
        elif "hours_until_exam" in variables or "syllabus_covered_pct" in variables:
            # Exam Tomorrow
            uncovered_work = (100.0 - variables.get("syllabus_covered_pct", 40.0)) * 0.25 + variables.get("unstudied_highweight_topics", 5.0) * 2.5
            fatigue = 1.0 + (variables.get("cognitive_fatigue_penalty_pct", 35.0) / 100.0)
            base_demand = uncovered_work * fatigue
            base_capacity = variables.get("hours_until_exam", 14.0) * (variables.get("study_speed_pages_hr", 12.0) / 10.0)
            base_resources = 20.0
            budget_margin_norm = 1.0
        elif "hotspot_data_balance_gb" in variables or "upload_bandwidth_required_mbps" in variables:
            # Internet Goes Down
            base_demand = variables.get("upload_bandwidth_required_mbps", 4.0) * 1.5
            base_capacity = variables.get("cellular_signal_bars", 2.0) * 2.5 + variables.get("hotspot_data_balance_gb", 1.2) * 2.0
            base_resources = 15.0
            budget_margin_norm = 0.9
        elif "unpushed_commits_count" in variables or "hours_to_deadline" in variables:
            # Laptop Broken
            base_demand = variables.get("unpushed_commits_count", 8.0) * 1.5 + (variables.get("cloud_backup_recency_hours", 12.0) * 0.2)
            base_capacity = variables.get("hours_to_deadline", 3.0) * 4.0
            base_resources = 18.0
            budget_margin_norm = 0.9
        elif "cash_balance_inr" in variables or "days_until_refill" in variables:
            # Running Out of Money
            base_demand = variables.get("days_until_refill", 8.0) * variables.get("daily_essential_food_inr", 120.0) + variables.get("pending_bills_inr", 350.0)
            base_capacity = variables.get("cash_balance_inr", 420.0) + variables.get("emergency_credit_available_inr", 1000.0)
            base_resources = 15.0
            budget_margin_norm = min(max(base_capacity / max(base_demand, 1.0), 0.1), 2.0)
        elif "remaining_work_hours" in variables or "hours_until_submission" in variables:
            # Group Project Delay
            base_demand = variables.get("remaining_work_hours", 32.0)
            base_capacity = variables.get("hours_until_submission", 48.0) * (variables.get("active_contributors", 2.0) * 0.5)
            base_resources = variables.get("active_contributors", 2.0) * 8.0
            budget_margin_norm = 1.0
        elif "body_temperature_f" in variables or "cognitive_focus_pct" in variables:
            # Unexpected Illness
            fever_strain = max(variables.get("body_temperature_f", 102.0) - 98.6, 0.5) * 15.0
            base_demand = fever_strain + 20.0
            base_capacity = variables.get("cognitive_focus_pct", 45.0) + (variables.get("reschedule_leniency_prob", 65.0) * 0.4)
            base_resources = 15.0
            budget_margin_norm = 1.0
        elif "minutes_to_gate_closure" in variables or "gps_estimated_travel_mins" in variables:
            # Traffic Jam
            base_demand = variables.get("gps_estimated_travel_mins", 48.0) + (10.0 if variables.get("security_fast_track_available", 0.0) < 0.5 else 0.0)
            base_capacity = variables.get("minutes_to_gate_closure", 40.0)
            base_resources = 15.0
            budget_margin_norm = 0.9
        elif "courier_estimated_delivery_hrs" in variables or "hours_until_demo" in variables:
            # Late Package Delivery
            base_demand = variables.get("courier_estimated_delivery_hrs", 9.0)
            base_capacity = variables.get("hours_until_demo", 6.0) * (1.5 if variables.get("demo_mock_software_fallback", 1.0) >= 0.5 else 1.0)
            base_resources = 15.0
            budget_margin_norm = 1.0
        elif "total_budget_inr" in variables or "guest_count" in variables:
            # Birthday on a Budget
            total_cost = variables.get("guest_count", 12.0) * variables.get("food_budget_per_head_inr", 180.0) + variables.get("cake_cost_inr", 850.0) - variables.get("diy_decor_savings_inr", 600.0)
            base_demand = max(total_cost, 100.0)
            base_capacity = variables.get("total_budget_inr", 3500.0)
            base_resources = 20.0
            budget_margin_norm = base_capacity / max(base_demand, 1.0)
        elif "laptop_battery_mins_left" in variables or "client_meeting_duration_mins" in variables:
            # Power Cut During Work
            base_demand = variables.get("client_meeting_duration_mins", 60.0)
            base_capacity = variables.get("laptop_battery_mins_left", 45.0)
            base_resources = 15.0
            budget_margin_norm = 0.9
        elif "hours_until_portal_closes" in variables or "work_completed_pct" in variables:
            # Missing a Deadline
            needed_effort = (100.0 - variables.get("work_completed_pct", 65.0)) * 1.5 + (variables.get("references_left_to_format", 18.0) * 1.2)
            base_demand = needed_effort
            base_capacity = variables.get("hours_until_portal_closes", 2.0) * 60.0 * (variables.get("typing_speed_words_hr", 650.0) / 600.0) + variables.get("grace_period_mins", 15.0)
            base_resources = 18.0
            budget_margin_norm = 1.0
        else:
            # General operational / business fallback
            base_demand = variables.get("expected_attendance",
                          variables.get("expected_users",
                          variables.get("requests_per_sec",
                          variables.get("demand",
                          variables.get("attendance",
                          variables.get("traffic", 1000.0))))))

            base_capacity = variables.get("venue_capacity",
                            variables.get("server_capacity",
                            variables.get("capacity",
                            variables.get("inpatient_beds", 1200.0))))

            base_resources = variables.get("staff",
                             variables.get("engineers",
                             variables.get("team_size",
                             variables.get("resources",
                             variables.get("coordinators", 20.0)))))

            base_budget = variables.get("budget",
                          variables.get("runway_months",
                          variables.get("contingency", 200000.0)))
            budget_margin_norm = min(max(base_budget / 250000.0, 0.05), 2.0)

        # Tally outcomes
        counts = {"favorable": 0, "nominal": 0, "adverse": 0, "critical_failure": 0}
        stress_indices: List[float] = []

        log_demand_mean = math.log(max(base_demand, 1.0))

        for _ in range(trials):
            # Stochastic perturbations using pure python standard library
            d = rng.lognormvariate(log_demand_mean, 0.12)
            c = max(rng.gauss(base_capacity, max(base_capacity * 0.06, 1.0)), 1.0)
            r = max(rng.gauss(base_resources, max(base_resources * 0.08, 0.5)), 0.1)
            b = min(max(rng.gauss(budget_margin_norm, 0.08), 0.01), 2.0)

            outcome = cls._evaluate_trial_state(
                demand=d,
                capacity=c,
                resources=r,
                budget_margin=b,
                domain=domain
            )
            counts[outcome] += 1
            stress_indices.append(d / max(c, 1.0))

        # Empirical probabilities (strictly from trials!)
        empirical_probs = {k: counts[k] / trials for k in counts}

        # Calculate Wilson 95% Confidence Intervals for each branch: (z = 1.96)
        z = 1.96
        confidence_intervals = {}
        for k, p in empirical_probs.items():
            denominator = 1 + (z**2 / trials)
            center = (p + (z**2 / (2 * trials))) / denominator
            spread = z * math.sqrt((p * (1 - p) + (z**2 / (4 * trials))) / trials) / denominator
            confidence_intervals[k] = [round(max(center - spread, 0.0), 3), round(min(center + spread, 1.0), 3)]

        # Quantiles using sorted list
        stress_sorted = sorted(stress_indices)
        p10 = stress_sorted[int(len(stress_sorted) * 0.10)]
        p50 = stress_sorted[int(len(stress_sorted) * 0.50)]
        p90 = stress_sorted[int(len(stress_sorted) * 0.90)]

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        stats = SimulationTrialStats(
            method=f"Monte Carlo Simulation ({trials:,} trials)",
            trials_run=trials,
            seed=seed,
            distribution={k: round(v, 3) for k, v in empirical_probs.items()},
            confidence_intervals=confidence_intervals,
            p10=round(p10, 3),
            p50=round(p50, 3),
            p90=round(p90, 3),
            execution_time_ms=round(elapsed_ms, 2)
        )

        return empirical_probs, stats

    @classmethod
    def run_paired_simulation(
        cls,
        baseline_variables: Dict[str, float],
        whatif_variables: Dict[str, float],
        domain: str = "operations",
        trials: int = 1000,
        seed: int = 42
    ) -> Tuple[Dict[str, float], Dict[str, float], SimulationTrialStats]:
        """Paired-seed simulation: evaluates baseline and modified scenarios using identical pseudo-random numbers to eliminate variance noise."""
        p_base, stats_base = cls.run_monte_carlo(baseline_variables, domain, trials, seed)
        p_whatif, _ = cls.run_monte_carlo(whatif_variables, domain, trials, seed)

        return p_base, p_whatif, stats_base

    @classmethod
    def assemble_future_outcomes(
        cls,
        empirical_probs: Dict[str, float],
        domain: str,
        llm_futures: Optional[List[Dict[str, Any]]] = None,
        title: str = "",
        description: str = "",
        variables: Optional[Dict[str, float]] = None
    ) -> List[FutureOutcome]:
        from .everyday_predictions import EVERYDAY_SCENARIO_PREDICTIONS, generate_generic_human_predictions
        from .schemas import SubScenario, FutureMilestone

        p_fav = empirical_probs.get("favorable", 0.35)
        p_nom = empirical_probs.get("nominal", 0.35)
        p_adv = empirical_probs.get("adverse", 0.20)
        p_crit = empirical_probs.get("critical_failure", 0.10)

        # We construct 3 distinct real-world human branches:
        # 1. Favorable / Recoverable
        # 2. Alternative / Strained
        # 3. Adverse / Cascading Failure
        s_fav = p_fav + (p_nom * 0.4 if p_nom > 0 else 0)
        s_alt = max(0.10, p_nom * 0.6 if p_nom > 0 else p_adv * 0.6)
        s_adv = max(0.05, p_adv * 0.4 + p_crit)

        total_s = s_fav + s_alt + s_adv
        if total_s > 0:
            s_fav = round(s_fav / total_s, 2)
            s_alt = round(s_alt / total_s, 2)
            s_adv = round(1.0 - (s_fav + s_alt), 2)

        pct_fav = int(round(s_fav * 100))
        pct_alt = int(round(s_alt * 100))
        pct_adv = 100 - (pct_fav + pct_alt)

        def get_label(pct: int, rank: int) -> str:
            if rank == 0:
                return "More likely" if pct >= 45 else "Plausible"
            elif rank == 1:
                return "Plausible"
            else:
                return "Less likely, but important" if pct < 30 else "Plausible"

        scores_with_ranks = sorted([(pct_fav, 0), (pct_alt, 1), (pct_adv, 2)], key=lambda x: x[0], reverse=True)
        rank_map = {idx: rank for rank, (_, idx) in enumerate(scores_with_ranks)}

        label_fav = get_label(pct_fav, rank_map[0])
        label_alt = get_label(pct_alt, rank_map[1])
        label_adv = get_label(pct_adv, rank_map[2])

        if llm_futures and len(llm_futures) >= 3:
            branches = []
            configs = [
                ("future_favorable", s_fav, pct_fav, label_fav, "LOW" if s_fav >= 0.5 else "MODERATE", "favorable"),
                ("future_alternative", s_alt, pct_alt, label_alt, "MODERATE", "nominal"),
                ("future_adverse", s_adv, pct_adv, label_adv, "HIGH" if s_adv < 0.4 else "CRITICAL", "critical_failure"),
            ]
            for i, (fid, sc, pct, lbl, risk, cat) in enumerate(configs):
                lf = llm_futures[i]
                sub_scens = []
                if "sub_scenarios" in lf and isinstance(lf["sub_scenarios"], list):
                    for ss in lf["sub_scenarios"]:
                        sub_scens.append(SubScenario(**ss) if isinstance(ss, dict) else ss)
                elif "sub_scenario" in lf and isinstance(lf["sub_scenario"], dict):
                    sub_scens.append(SubScenario(**lf["sub_scenario"]))

                milestones = []
                if "milestones" in lf and isinstance(lf["milestones"], list):
                    for ms in lf["milestones"]:
                        if isinstance(ms, dict):
                            milestones.append(FutureMilestone(time=ms.get("time", f"T+{i*2}h"), event=ms.get("event", ""), impact=ms.get("impact", "")))
                        elif isinstance(ms, FutureMilestone):
                            milestones.append(ms)

                branches.append(FutureOutcome(
                    id=fid,
                    title=lf.get("title", f"Outcome Branch {i+1}"),
                    score=sc,
                    score_percentage=pct,
                    likelihood_label=lf.get("likelihood_label", lbl),
                    risk_level=risk,
                    category=cat,
                    decision_path=lf.get("decision_path", lf.get("decision", "")),
                    what_happens_next=lf.get("what_happens_next", lf.get("expected_result", "")),
                    why_this_happens=lf.get("why_this_happens", ", ".join(lf.get("primary_drivers", []))),
                    potential_impact=lf.get("potential_impact", "Noticeable practical consequence"),
                    recommended_action=lf.get("recommended_action", "Take proactive action immediately"),
                    what_happens_after=lf.get("what_happens_after", "Trajectory stabilizes into new normal"),
                    expected_result=lf.get("expected_result", lf.get("what_happens_next", "")),
                    sub_scenarios=sub_scens,
                    sub_scenario=sub_scens[0] if sub_scens else None,
                    butterfly_effect=lf.get("butterfly_effect", "Small initial variation reshapes downstream outcome."),
                    primary_drivers=lf.get("primary_drivers", ["Starting condition sensitivity", "Constraint pressure"]),
                    uncertainty="MODERATE",
                    milestones=milestones
                ))
            return branches

        if domain in EVERYDAY_SCENARIO_PREDICTIONS:
            ep = EVERYDAY_SCENARIO_PREDICTIONS[domain]
        else:
            ep = generate_generic_human_predictions(domain, title, description, variables or {})

        fav_data = ep.get("favorable", {})
        alt_data = ep.get("alternative", ep.get("adverse", {}))
        adv_data = ep.get("critical_failure", ep.get("adverse", {}))

        branches = []
        for fid, data, sc, pct, lbl, risk, cat in [
            ("future_favorable", fav_data, s_fav, pct_fav, label_fav, "LOW" if s_fav >= 0.5 else "MODERATE", "favorable"),
            ("future_alternative", alt_data, s_alt, pct_alt, label_alt, "MODERATE", "nominal"),
            ("future_adverse", adv_data, s_adv, pct_adv, label_adv, "HIGH" if s_adv < 0.4 else "CRITICAL", "critical_failure"),
        ]:
            sub_scens = []
            if "sub_scenarios" in data and isinstance(data["sub_scenarios"], list):
                for ss in data["sub_scenarios"]:
                    sub_scens.append(SubScenario(**ss) if isinstance(ss, dict) else ss)
            elif "sub_scenario" in data and isinstance(data["sub_scenario"], dict):
                sub_scens.append(SubScenario(**data["sub_scenario"]))

            milestones = []
            if "milestones" in data and isinstance(data["milestones"], list):
                for ms in data["milestones"]:
                    milestones.append(FutureMilestone(time=ms.get("time", ""), event=ms.get("event", ""), impact=ms.get("impact", "")))

            what_next = data.get("what_happens_next") or data.get("prediction", "")
            why_happens = data.get("why_this_happens") or (", ".join(data.get("drivers", [])) if data.get("drivers") else "Initial constraints and reaction timing")
            pot_impact = data.get("potential_impact") or "Noticeable impact on time, resources, or stress"
            rec_action = data.get("recommended_action") or data.get("decision", "Take decisive proactive action right now")
            
            clean_topic = description.split(";")[0].split(".")[0].strip()
            next_scen = data.get("next_scenario") or data.get("what_happens_after")
            if not next_scen or "stabilizes into resulting outcome" in next_scen.lower():
                if cat == "favorable":
                    next_scen = f"You successfully contained '{clean_topic}'. Next Scenario: Sustain momentum, optimize resource buffers, and prepare for downstream review."
                elif cat == "nominal":
                    next_scen = f"You reached a strained recovery under '{clean_topic}'. Next Scenario: Rebuild depleted safety margin, clear secondary backlog, and communicate delays."
                else:
                    next_scen = f"Critical breakdown occurred during '{clean_topic}'. Next Scenario: Execute emergency damage control, lodge an appeal or petition, and contain secondary operational losses."

            branches.append(FutureOutcome(
                id=fid,
                title=data.get("title", "Projected Outcome"),
                score=sc,
                score_percentage=pct,
                likelihood_label=data.get("likelihood_label", lbl),
                risk_level=risk,
                category=cat,
                decision_path=data.get("decision_path") or data.get("decision", ""),
                what_happens_next=what_next,
                why_this_happens=why_happens,
                potential_impact=pot_impact,
                recommended_action=rec_action,
                what_happens_after=next_scen,
                next_scenario=next_scen,
                expected_result=data.get("prediction") or what_next,
                sub_scenarios=sub_scens,
                sub_scenario=sub_scens[0] if sub_scens else None,
                butterfly_effect=data.get("butterfly_effect", "Small starting variable creates major consequence."),
                primary_drivers=data.get("drivers", ["Constraint pressure", "Response latency"]),
                uncertainty="MODERATE",
                milestones=milestones
            ))

        return branches
