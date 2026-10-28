# AI BUTTERFLY EFFECT LAB
**Interactive Scientific Chaos Simulator & Responsible AI Exploration Laboratory**

> *"Tiny changes. Divergent futures. One experiment at a time."*

[![CI Pipeline](https://github.com/butterfly-effect-lab/core/actions/workflows/ci.yml/badge.svg)](https://github.com/butterfly-effect-lab/core/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Executive Summary & Core Mission

The **AI Butterfly Effect Lab** is an interactive scientific laboratory that allows researchers, educators, and students to explore deterministic chaos and sensitive dependence on initial conditions through rigorously controlled numerical experiments.

### The Inviolable Architectural Principle
> **THE NUMERICAL SIMULATOR IS THE SINGLE SOURCE OF TRUTH.**  
> **AI MUST NEVER PRETEND TO BE THE NUMERICAL SIMULATOR.**

Rather than letting an LLM hallucinate ODE trajectories, our classical 4th-Order Runge-Kutta (RK4) engine integrates the exact differential equations deterministically. The AI Scenario Lab only receives **verified empirical measurements** ($D(0), D(T), D_{\max}, t^*, \lambda_{\text{FT}}$) to formulate structured what-if hypotheses with explicit assumptions, uncertainties, and scientific boundaries.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BROWSER CLIENT (React 19 + TypeScript)                   │
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
                                       │ REST API (JSON / Typed Schemas)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI + Python 3.14)                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    API Routing & OWASP Security                       │  │
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
│  │   • RK4 Classical Integrator  │              │  • Provider Adapter    │  │
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

## 3. Flagship Features

1. **Numerical Chaos Lab:**
   - Real-time 4th-Order Runge-Kutta numerical solver for continuous (Lorenz-63) and discrete (Logistic Map) dynamical systems.
   - Interactive 3D WebGL/Canvas orbit visualizer with trajectory animation, point scrubbers, and camera rotation/zoom.
   - 2D Planar Phase Space Projections ($X-Z$, $X-Y$, $Y-Z$).
   - Dual divergence curves (Linear Euclidean Separation $D(t)$ and Logarithmic Separation $\ln(D(t)/D_0)$).
2. **Perturbation Microscope:**
   - Sweeps initial perturbations across **7 continuous orders of magnitude** ($10^{-1}$ to $10^{-7}$).
   - Verifies logarithmic predictability horizon scaling: $t^*(\delta) \approx \frac{1}{\lambda} \ln \frac{\tau}{\delta}$.
3. **Sensitivity Heatmap:**
   - 2D initial condition grid ($X_0 \times Y_0$) sensitivity scanner identifying fractal basin boundaries and laminar corridors.
4. **Logistic Map & Bifurcation Explorer:**
   - Real-time growth parameter $r$ slider $[0, 4.0]$.
   - Asymptotic bifurcation diagram displaying period-doubling cascades and periodic windows (e.g. period-3 window near $r = 3.83$).
5. **Responsible AI Scenario Lab:**
   - Generates structured what-if causal branches informed by actual computed facts.
   - Strict JSON Schema validation rejecting hallucinations.
   - Explicitly displays assumptions, uncertainties, and scientific limitations.
6. **Evidence Ledger:**
   - Epistemic provenance ledger distinguishing `COMPUTED` numerical facts from `HYPOTHESIS` speculative branches.
7. **Experiment Replay & Comparator:**
   - 1-Click Replay: Re-integrates from cryptographic configuration hash and verifies bit-level stability (max drift $< 10^{-7}$).
   - Experiment Comparator: Side-by-side synchronized comparison between two saved experiments.
8. **Guided Inquiry Lessons (POE Paradigm):**
   - 7 guided lessons utilizing the Predict-Observe-Explain (POE) science education methodology.
9. **Export Suite:**
   - Complete JSON experiment package, CSV raw trajectory export, and formatted printable scientific report.

---

## 4. Quick Start & Local Setup

### Prerequisites
- Python 3.12+ or 3.14+
- Node.js 20+ and npm

### 4.1 Backend Setup
```bash
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows (or: source venv/bin/activate on macOS/Linux)

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
```
The backend API and Swagger docs will be live at `http://127.0.0.1:8000/docs`.

### 4.2 Frontend Setup
```bash
# In another terminal:
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Automated Testing Suite

The repository contains a full automated testing suite spanning numerical validation, API integration, and OWASP security controls:

```bash
# Run all 31 tests
.\venv\Scripts\python.exe -m pytest -v

# Run numerical validation tests (Section 11 of specification)
.\venv\Scripts\python.exe -m pytest backend/tests/test_validation.py -v

# Run security tests
.\venv\Scripts\python.exe -m pytest backend/tests/test_security.py -v
```

---

## 6. 90-Second Hackathon Demo Workflow

1. **Open the Chaos Lab:**
   - Select the preset **"Lorenz Canonical (10⁻⁶ Perturbation)"**.
   - Show the explicit state comparison:
     - `BASELINE:` $[1.0, 1.0, 1.0]$
     - `PERTURBATION:` $[0.000001, 0, 0]$
     - `PERTURBED:` $[1.000001, 1.0, 1.0]$
2. **Click "RUN EXPERIMENT":**
   - In the **3D Orbit Visualizer**, rotate the attractor. Show how trajectories stay superimposed for 10 seconds, then dramatically split onto opposite lobes at $t = 14.5\text{s}$.
   - Point to the **Metrics Panel**: Initial separation was $10^{-6}$, final separation grew by $7.8\times 10^6\times$ to $7.82$.
3. **Open the Perturbation Microscope:**
   - Show 7 orders of magnitude ($10^{-1}$ down to $10^{-7}$).
   - Demonstrate that each $10\times$ smaller perturbation delays divergence by a constant $\approx 2.5$ seconds (proving the logarithmic law).
4. **Open the AI Scenario Lab:**
   - Ask: *"What if the perturbation was along the z-axis instead of x?"*
   - Show the structured branches generated with assumptions and uncertainties.
5. **Show the Evidence Ledger:**
   - Highlight the core differentiator: `COMPUTED` claims are verified by numerical code, while `HYPOTHESIS` claims are marked as AI speculation.

---

## 7. Scientific & Engineering References

- **Lorenz, E. N. (1963).** *Deterministic Nonperiodic Flow.* Journal of the Atmospheric Sciences, 20(2), 130–141.
- **May, R. M. (1976).** *Simple mathematical models with very complicated dynamics.* Nature, 261, 459–467.
- **Runge, C. (1895) & Kutta, W. (1901).** *Numerical Integration of Differential Equations.* Mathematische Annalen.
- **White, R., & Gunstone, R. (1992).** *Probing Understanding.* (Predict-Observe-Explain cognitive model).
- Detailed research dossier available at [`docs/research.md`](docs/research.md).
