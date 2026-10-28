# System Architecture & Technical Specifications
**AI Butterfly Effect Lab**

---

## 1. High-Level Architecture Overview

The AI Butterfly Effect Lab is structured on a strict boundary separating deterministic physical computation from speculative AI reasoning:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT (React + TypeScript)                  │
│                                                                             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │  Numerical Chaos Lab  │ │Perturbation Microscope│ │ Sensitivity Grid  │  │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘  │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │   AI Scenario Lab     │ │    Evidence Ledger    │ │  Replay / Compare │  │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘  │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │ 3D/2D Phase Visualizer│ │  Divergence Charts    │ │  Guided Lessons   │  │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST APIs
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (FastAPI + Python)                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       API Routing & Security Layer                     │  │
│  │   • Token Authentication (JWT/Bcrypt) • Input Sanitization (OWASP)     │  │
│  │   • Resource Limit Guards • RFC 7807 Error Responses                  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│         ┌────────────────────────────┴───────────────────────────┐          │
│         ▼                                                        ▼          │
│  ┌───────────────────────────────┐              ┌────────────────────────┐  │
│  │   PURE NUMERICAL ENGINE       │              │    AI SCENARIO LAB     │  │
│  │   (Single Source of Truth)    │              │                        │  │
│  │                               │              │  • Strict JSON Schema  │  │
│  │   • RK4 Classical Integrator  │              │  • Provider Abstraction│  │
│  │   • Lorenz 1963 Model         ├─────────────►│    (OpenAI / Mock)     │  │
│  │   • Logistic 1976 Model       │ Verified     │  • Provenance Tag:     │  │
│  │   • Euclidean Separation      │ Empirical    │    "SPECULATIVE        │  │
│  │   • SHA-256 Reproducibility   │ Metrics      │     SCENARIO"          │  │
│  └──────────────┬────────────────┘              └───────────┬────────────┘  │
│                 │                                           │               │
│                 └─────────────────────┬─────────────────────┘               │
│                                       ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      PERSISTENCE & STORAGE (SQLAlchemy)               │  │
│  │   Users • Experiments • Runs • RunResults • Scenarios • Lessons       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Invariants

### 2.1 The Inviolable Source of Truth
**The numerical simulator is the single source of truth. AI must never pretend to be the numerical simulator.**
- When a user asks "What happens if $X_0$ changes by $10^{-6}$?", the numerical engine computes the trajectory through numerical integration.
- The AI only receives the *verified empirical output* (e.g. $D(0) = 10^{-6}$, $D_T = 7.82$, $t^* = 14.5\text{s}$) and formulates causal hypotheses, contextual explanations, and speculative scenario branches.

### 2.2 Deterministic Reproducibility
Every simulation run produces a deterministic configuration hash:
$$\text{hash} = \text{SHA-256}(\text{model}, \text{params}, \mathbf{x}_0, \boldsymbol{\delta}, T, \Delta t, \text{integrator}, \text{software\_version})$$
Replaying an experiment with the same hash verifies bit-level stability and alerts the researcher to numerical drift if the integration algorithm or platform changes.

### 2.3 Evidence Ledger & Provenance
Every scientific finding displayed in the user interface is tagged with its origin:
- **`STATUS: COMPUTED`**: Originates from verified numerical integration; displays run ID, measured coordinates, step counts, and Euclidean distance.
- **`STATUS: HYPOTHESIS`**: Originates from the AI Scenario Lab; explicitly flagged as a speculative what-if projection with stated assumptions, uncertainties, and scientific limitations.
