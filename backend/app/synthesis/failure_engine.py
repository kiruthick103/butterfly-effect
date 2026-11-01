"""Dedicated Failure Engine: Structural fault-tree, cascading delay, and root-cause failure simulation."""

from typing import Dict, List, Any
from .schemas import FailureMode, FailureAnalysisResponse


class FailureSimulationEngine:
    """Analyzes and simulates plausible failure modes, cascading dependency collapses, and mitigation interventions."""

    @classmethod
    def identify_failure_modes(
        cls,
        description: str,
        variables: Dict[str, float],
        domain: str = "operations",
        llm_failures: List[Dict[str, Any]] = None
    ) -> List[FailureMode]:
        """Generate structured failure modes answering the 7 canonical failure questions."""
        modes: List[FailureMode] = []

        # If LLM returned structured failure modes, incorporate them
        if llm_failures:
            for item in llm_failures:
                if isinstance(item, dict) and "name" in item:
                    modes.append(FailureMode(
                        id=item.get("id", f"fail_{len(modes)+1}"),
                        name=item.get("name", "Cascading Bottleneck Failure"),
                        trigger_condition=item.get("trigger_condition", "Operational demand exceeds buffer threshold by >25%"),
                        root_cause=item.get("root_cause", "Throughput imbalance between arrival rate and processing capacity"),
                        first_failure=item.get("first_failure", "Primary intake checkpoint or message queue saturation"),
                        cascade_steps=item.get("cascade_steps", [
                            "Intake queue builds up beyond target clearance window",
                            "Staff or CPU threads diverted to manage backlog, starving secondary pipelines",
                            "Upstream callers experience timeout cascade, triggering retry storms"
                        ]),
                        amplifying_variables=item.get("amplifying_variables", ["expected_attendance", "staff"]),
                        mitigation=item.get("mitigation", "Introduce rate limiting, pre-allocated burst capacity, and active queue shedding"),
                        severity=item.get("severity", "HIGH")
                    ))

        # Ensure we always have robust domain-tailored failure models
        if "startup" in domain or "finance" in domain or "budget" in description.lower():
            modes.append(FailureMode(
                id="fail_runway_depletion",
                name="Runway Exhaustion & Cashflow Inversion",
                trigger_condition="Monthly burn rate exceeds revenue growth velocity; runway drops below 2.5 months",
                root_cause="Fixed operational burn without scalable customer acquisition conversion",
                first_failure="Payroll and infrastructure commitments breach minimum contingency reserve",
                cascade_steps=[
                    "Contingency cash reserves depleted within 60 days",
                    "Emergency hiring freeze reduces delivery velocity",
                    "Customer attrition accelerates under diminished support bandwidth",
                    "Involuntary operational wind-down triggered"
                ],
                amplifying_variables=["burn_rate", "runway_months", "customer_acquisition_cost"],
                mitigation="Implement variable cost structure, extend runway via bridge financing, or pivot to high-margin contracts",
                severity="CRITICAL"
            ))
            modes.append(FailureMode(
                id="fail_customer_churn_cascade",
                name="Product-Market Disconnect & Negative Word-of-Mouth",
                trigger_condition="Churn rate exceeds 6% per month; Net Promoter Score turns negative",
                root_cause="Over-promising roadmap deliverables without underlying core reliability",
                first_failure="Enterprise customer tier cancels renewal contracts",
                cascade_steps=[
                    "Key account loss creates 30% revenue deficit",
                    "Downsized product team slows bug resolution",
                    "Secondary tiers churn due to unaddressed technical debt"
                ],
                amplifying_variables=["churn_rate", "marketing_spend"],
                mitigation="Pause outbound expansion to resolve core onboarding bottlenecks; establish high-touch customer success",
                severity="HIGH"
            ))

        elif "tech" in domain or "cloud" in domain or "software" in domain or "payment" in domain:
            modes.append(FailureMode(
                id="fail_cascading_timeout",
                name="Database Connection Pool Starvation & Retry Storm",
                trigger_condition="Incoming request concurrency exceeds database pool limit by 40%",
                root_cause="Unindexed slow queries lock connection pool threads under burst traffic",
                first_failure="API gateway returns HTTP 504 Gateway Timeout on checkout endpoints",
                cascade_steps=[
                    "Checkout endpoints queue behind blocked database connections",
                    "Clients and background workers trigger automatic retries every 500ms",
                    "Retry storm amplifies incoming request volume by 350%",
                    "Circuit breakers trip system-wide, causing total application blackout"
                ],
                amplifying_variables=["requests_per_sec", "database_connections", "timeout_ms"],
                mitigation="Deploy aggressive circuit breakers, exponential backoff with jitter, and read-replica offloading",
                severity="CRITICAL"
            ))
            modes.append(FailureMode(
                id="fail_dependency_outage",
                name="Third-Party Gateway Outage & Synchronous Lockup",
                trigger_condition="External payment or authentication provider experiences >2.0s latency",
                root_cause="Synchronous blocking RPC calls without fallback circuit breaker",
                first_failure="Web worker threads exhaust available threadpool waiting on external partner response",
                cascade_steps=[
                    "Worker threads block awaiting external HTTP response",
                    "Kubernetes liveness probes fail due to unresponsive health endpoints",
                    "Pod orchestrator restarts containers concurrently, losing in-flight state"
                ],
                amplifying_variables=["dependency_latency", "timeout_threshold"],
                mitigation="Decouple external integrations via asynchronous event queues and graceful offline fallback",
                severity="HIGH"
            ))

        else:
            # Operational & Event Domain
            modes.append(FailureMode(
                id="fail_intake_saturation",
                name="Check-in Chokepoint Saturation & Crowd Stagnation",
                trigger_condition="Arrival velocity exceeds registration desk throughput (arrivals > 18/min per desk)",
                root_cause="Manual credential printing and badge scanning latency",
                first_failure="Primary entrance queue spills past physical perimeter barriers",
                cascade_steps=[
                    "Queue delay increases from 4 minutes to 35 minutes within 45 minutes",
                    "Floor managers reassign auditorium staff to handle door crowd control",
                    "Stage events delayed due to empty main hall, causing programmatic cascade",
                    "Safety marshal intervenes due to unauthorized hallway occupancy density"
                ],
                amplifying_variables=["expected_attendance", "staff", "registration_rate"],
                mitigation="Deploy digital self-check-in QR terminals and pre-print attendee badges 24h prior",
                severity="CRITICAL"
            ))
            modes.append(FailureMode(
                id="fail_venue_capacity_lockout",
                name="Auditorium Overflow & Compulsory Fire Lockout",
                trigger_condition="Actual headcount exceeds 100% of legal hall seat capacity",
                root_cause="Uncapped registration confirmations without physical capacity gating",
                first_failure="Auditorium doors locked by safety compliance officer",
                cascade_steps=[
                    "Main auditorium doors sealed against further admittance",
                    "Disgruntled attendees overflow foyer and secondary exhibition zones",
                    "Emergency egress routes obstructed by standing room spillover"
                ],
                amplifying_variables=["venue_capacity", "expected_attendance"],
                mitigation="Implement dual-hall overflow streaming and enforce pre-allocated seat reservations",
                severity="HIGH"
            ))

        return modes[:4]

    @classmethod
    def generate_analysis_response(
        cls,
        title: str,
        domain: str,
        modes: List[FailureMode]
    ) -> FailureAnalysisResponse:
        """Construct full failure analysis report."""
        critical_count = sum(1 for m in modes if m.severity == "CRITICAL")
        risk_level = "CRITICAL" if critical_count >= 2 else "HIGH" if critical_count == 1 else "MODERATE"

        thresholds = {
            m.name: m.trigger_condition for m in modes
        }

        interventions = [m.mitigation for m in modes]

        return FailureAnalysisResponse(
            scenario_title=title,
            domain=domain,
            failure_modes=modes,
            critical_thresholds=thresholds,
            cascading_risk_level=risk_level,
            recommended_interventions=interventions
        )
