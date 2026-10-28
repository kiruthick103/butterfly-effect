"""Deterministic research-grounded AI provider fallback.

Generates structured speculative scenarios without external network/API dependencies.
Ensures zero-downtime demonstration and rigorous educational scaffolding.
"""

from typing import Dict, Any, List
from .provider import AIProvider


class MockAIProvider(AIProvider):
    name = "mock-deterministic"

    async def generate_scenario(
        self,
        prompt: str,
        numerical_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured scenario branches conditioned on actual numerical context."""
        lower_prompt = prompt.lower()

        # Extract verified facts if present
        init_d = numerical_context.get("initial_distance", 1e-6)
        final_d = numerical_context.get("final_distance", 7.82)
        model = numerical_context.get("model", "lorenz")

        # Scenario categorization
        if "axis" in lower_prompt or "z" in lower_prompt or "direction" in lower_prompt:
            title = "Perturbation Vector Orientation Sensitivity"
            assumptions = [
                "The system equations remain strictly autonomous and time-invariant.",
                "The base trajectory continues along the stable/unstable manifold decomposition of the attractor.",
                "Perturbations in the z-direction impact the thermal stratification variable rather than horizontal convection rolls."
            ]
            branches = [
                {
                    "id": "A",
                    "trigger": "Shift perturbation entirely to the z-axis (delta = [0, 0, dz])",
                    "effects": [
                        "Because z measures vertical temperature profile asymmetry, initial growth is governed by the -beta*z linear damping term.",
                        "Transient divergence may exhibit an initial delay before coupling into the nonlinear xy product.",
                        "Once coupled, macroscopic separation occurs at approximately the same global Lyapunov timescale."
                    ],
                    "time_horizon": "short",
                    "uncertainties": [
                        "Exact instantaneous coordinate coupling depends on whether the state is near the saddle at the origin.",
                        "Finite-time contraction along the stable eigenvector can temporarily compress z-axis perturbations."
                    ]
                },
                {
                    "id": "B",
                    "trigger": "Distribute perturbation isotropically across all three coordinates [dx, dy, dz]",
                    "effects": [
                        "Immediate alignment with the leading local Lyapunov vector.",
                        "More uniform exponential growth without transient hesitation.",
                        "Time to macroscopic threshold decreases by an estimated 8-15%."
                    ],
                    "time_horizon": "medium",
                    "uncertainties": [
                        "Local curvature along the attractor wing transitions can momentarily invert relative lobe transitions."
                    ]
                }
            ]
            limitations = [
                "Local manifold projection is purely qualitative; exact separation requires running RK4 with the new vector.",
                "AI cannot predict exact lobe switching sequences beyond the predictability horizon."
            ]

        elif "rho" in lower_prompt or "parameter" in lower_prompt or "temperature" in lower_prompt:
            title = "Rayleigh Number Parameter Variation Hypothesis"
            assumptions = [
                "Rayleigh parameter rho is varied while maintaining Prandtl sigma=10 and aspect beta=8/3.",
                "The system transitions through classical bifurcation sequences documented by Saltzman & Lorenz."
            ]
            branches = [
                {
                    "id": "A",
                    "trigger": "Increase rho from 28.0 to 45.0 (enhanced thermal buoyancy)",
                    "effects": [
                        "The strange attractor expands in phase-space diameter; maximum separation will increase from ~35 to ~50 units.",
                        "The maximal Lyapunov exponent increases, accelerating the rate of trajectory separation.",
                        "Lobe alternation frequency increases significantly."
                    ],
                    "time_horizon": "medium",
                    "uncertainties": [
                        "Higher rho introduces intermittent periodic windows and knot orbits.",
                        "Numerical stiffness increases, potentially requiring a reduced integration timestep dt."
                    ]
                },
                {
                    "id": "B",
                    "trigger": "Decrease rho below critical value rho_c approx 24.74",
                    "effects": [
                        "Chaotic attractor collapses via subcritical Hopf bifurcation.",
                        "Trajectories decay asymptotically toward one of the two stable convection roll fixed points C+ or C-.",
                        "Sensitive dependence on initial conditions disappears asymptotically."
                    ],
                    "time_horizon": "long",
                    "uncertainties": [
                        "Near the bifurcation threshold, transient chaos can persist for hundreds of seconds before settling."
                    ]
                }
            ]
            limitations = [
                "Bifurcation boundaries are analytically established, but transient durations require full numerical integration.",
                "Hypothesis assumes idealized fluid layer without boundary layer friction."
            ]

        else:
            title = "Perturbation Scale & Predictability Horizon Branching"
            assumptions = [
                f"Reference run verified initial separation of {init_d:.2e} and final separation of {final_d:.2f}.",
                "Exponential divergence rate follows leading Lyapunov exponent lambda approx 0.9056 s^-1.",
                "Attractor bounding diameter limits maximum physical separation to ~35 units."
            ]
            branches = [
                {
                    "id": "A",
                    "trigger": "Reduce initial perturbation by a factor of 10x (e.g. 10^-7)",
                    "effects": [
                        "Predictability horizon extends logarithmically: delta_t approx ln(10) / lambda approx 2.54 seconds.",
                        "Trajectories remain visually identical for an additional ~2.5 seconds of simulation time.",
                        "Long-term asymptotic distribution on the attractor remains unchanged."
                    ],
                    "time_horizon": "short",
                    "uncertainties": [
                        "Floating point precision limit (IEEE 754 double precision ~1e-16) bounds maximal observable extension.",
                        "Local divergence rate fluctuates significantly along different sections of the trajectory."
                    ]
                },
                {
                    "id": "B",
                    "trigger": "Increase initial perturbation into macroscopic regime (delta >= 1.0)",
                    "effects": [
                        "Trajectories immediately diverge onto separate wings on the very first oscillation.",
                        "The linear exponential divergence phase is completely bypassed.",
                        "Phase-space correlation drops to zero within the first orbital period (t < 1.5s)."
                    ],
                    "time_horizon": "short",
                    "uncertainties": [
                        "Nonlinear saturation dominates from step zero, making Lyapunov scaling invalid."
                    ]
                }
            ]
            limitations = [
                "This hypothesis models general dynamical tendencies; specific point-by-point values must be computed by the numerical simulator.",
                "AI cannot replace the Runge-Kutta numerical solver."
            ]

        return {
            "scenario_title": title,
            "provenance_status": "SPECULATIVE SCENARIO - AI GENERATED HYPOTHESIS",
            "verified_numerical_facts": {
                "reference_initial_distance": init_d,
                "reference_final_distance": final_d,
                "model": model,
                "note": "These numerical facts were computed by the numerical engine, not generated by AI."
            },
            "assumptions": assumptions,
            "branches": branches,
            "limitations": limitations,
            "ai_provider": self.name
        }
