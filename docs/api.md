# REST API Reference & Specification
**AI Butterfly Effect Lab**

Base URL: `/api/v1`  
API Spec Standard: OpenAPI 3.1 / RFC 7807 Structured Errors

---

## 1. System Health & Metadata

### `GET /health`
Returns system health and provider status.
```json
{
  "status": "healthy",
  "service": "AI Butterfly Effect Lab",
  "version": "1.0.0",
  "ai_provider": "mock"
}
```

### `GET /version`
Returns software versions, numerical integrators, and supported dynamical models.

---

## 2. Numerical Simulations

### `GET /api/v1/simulations/presets`
Returns curated scientific benchmark presets (Canonical $10^{-6}$, Zero Control, Saddle Sensitivity, Logistic Chaos, Period-4 window).

### `POST /api/v1/simulations`
Executes twin trajectory simulation and computes divergence metrics.

**Request Body:**
```json
{
  "model": "lorenz",
  "initial_state": [1.0, 1.0, 1.0],
  "perturbation": [0.000001, 0.0, 0.0],
  "parameters": {
    "sigma": 10.0,
    "rho": 28.0,
    "beta": 2.666667
  },
  "duration": 25.0,
  "dt": 0.01,
  "max_display_points": 1500,
  "divergence_threshold": 1.0
}
```

**Response:**
```json
{
  "model": "lorenz",
  "model_version": "1963-canonical",
  "integrator": "rk4",
  "configuration_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "metrics": {
    "initial_distance": 0.000001,
    "final_distance": 7.821435,
    "max_distance": 12.456891,
    "time_to_threshold": 14.48,
    "approx_finite_time_growth_rate": 0.9021
  },
  "scientific_explanation": "The trajectories originate with an initial separation of 1.00e-06. Over 25.0s, the distance grew to 7.8214...",
  "times": [0.0, 0.02, 0.04],
  "baseline_trajectory": [[1.0, 1.0, 1.0]],
  "perturbed_trajectory": [[1.000001, 1.0, 1.0]],
  "distances": [0.000001],
  "log_divergences": [0.0]
}
```

---

## 3. Flagship Laboratories

### `POST /api/v1/microscope`
Runs a multi-decade perturbation sweep ($10^{-1}$ down to $10^{-7}$).
```json
{
  "model": "lorenz",
  "axis": 0,
  "duration": 25.0,
  "dt": 0.01,
  "scales": [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7]
}
```

### `POST /api/v1/heatmap`
Computes 2D initial-condition phase-space grid sensitivity ($X_0$ vs $Y_0$).

### `POST /api/v1/bifurcation`
Computes period-doubling bifurcation data for the Logistic Map across $r \in [2.4, 4.0]$.

---

## 4. Responsible AI Scenario Lab

### `POST /api/v1/scenarios`
Generates structured speculative what-if branches grounded on verified numerical context.

**Request:**
```json
{
  "prompt": "What if the perturbation was along the z-axis instead of x?",
  "numerical_context": {
    "initial_distance": 0.000001,
    "final_distance": 7.82,
    "model": "lorenz"
  }
}
```

**Response:**
```json
{
  "scenario_title": "Perturbation Vector Orientation Sensitivity",
  "provenance_status": "SPECULATIVE SCENARIO - AI GENERATED HYPOTHESIS",
  "assumptions": ["..."],
  "branches": [
    {
      "id": "A",
      "trigger": "Shift perturbation entirely to the z-axis",
      "effects": ["..."],
      "time_horizon": "short",
      "uncertainties": ["..."]
    }
  ],
  "limitations": ["AI cannot replace numerical ODE integration."],
  "ai_provider": "mock-deterministic"
}
```

---

## 5. Experiments, Replay & Exports

- `POST /api/v1/experiments`: Save experiment
- `GET /api/v1/experiments`: List saved runs
- `GET /api/v1/experiments/{id}`: Detailed run with full trajectory arrays
- `POST /api/v1/experiments/{id}/replay`: Re-runs from stored configuration hash to verify bit-level reproducibility
- `GET /api/v1/experiments/{id_a}/compare/{id_b}`: Side-by-side comparison
- `GET /api/v1/exports/{id}/json`: Full JSON export
- `GET /api/v1/exports/{id}/csv`: Trajectory CSV download
