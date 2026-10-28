# Testing Strategy & Automated Validation
**AI Butterfly Effect Lab**

---

## 1. Test Suite Architecture

The test suite is built on `pytest` and `fastapi.testclient.TestClient`, organized into 4 testing tiers:

```
backend/tests/
├── test_lorenz.py          # Lorenz-63 derivatives, fixed points, state validation
├── test_logistic.py        # Logistic map iterations, stability regimes, fixed points
├── test_rk4.py             # Classical RK4 analytical solution & O(dt^4) convergence
├── test_divergence.py      # Euclidean metric, log separation, threshold detection
├── test_validation.py      # Mandatory Section 11 numerical validation requirements
├── test_api.py             # Full FastAPI route integration tests
└── test_security.py        # OWASP security tests (BOLA, DoS limits, prompt injection)
```

---

## 2. Section 11 Numerical Validation Requirements

| Test ID | Test Condition | Expected Behavior | Test Function |
|---|---|---|---|
| **Test 1** | Zero perturbation ($\boldsymbol{\delta} = 0$) | Baseline and perturbed trajectories are 100% identical | `test_section11_test1_zero_perturbation` |
| **Test 2** | Identical inputs | Identical outputs & configuration hash | `test_section11_test2_deterministic_reproducibility` |
| **Test 3** | Same initial state | Initial separation distance $D(0) = 0$ | `test_section11_test3_same_initial_state_distance_zero` |
| **Test 4** | Halving timestep $\Delta t$ | Cauchy convergence of trajectory | `test_section11_test4_convergence_with_smaller_dt` |
| **Test 5** | Invalid inputs | Rejection of NaN, Inf, negative/zero $\Delta t$, excessive steps | `test_section11_test5_invalid_input_rejections` |
| **Test 6** | Numerical overflow | Graceful failure without unhandled process termination | `test_section11_test6_numerical_overflow_safeguard` |

---

## 3. Running the Test Suite

```bash
# Run complete test suite with verbose reporting
.\venv\Scripts\python.exe -m pytest -v

# Run only numerical validation tests
.\venv\Scripts\python.exe -m pytest backend/tests/test_validation.py -v

# Run security tests
.\venv\Scripts\python.exe -m pytest backend/tests/test_security.py -v
```
