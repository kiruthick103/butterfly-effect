"""Unit tests for RK4 integrator and order of convergence."""

import pytest
import math
from app.simulation.integrators.rk4 import RK4Integrator, rk4_step


def test_rk4_exponential_growth():
    """Verify RK4 against exact analytical solution dy/dt = y -> y(t) = exp(t)."""
    f = lambda t, y: [y[0]]
    dt = 0.05
    steps = 20  # t = 1.0
    y = [1.0]
    t = 0.0
    for _ in range(steps):
        y = rk4_step(f, t, y, dt)
        t += dt

    exact = math.exp(1.0)
    error = abs(y[0] - exact)
    # RK4 error for dt=0.05 over t=1 is < 1e-6
    assert error < 1e-6


def test_rk4_fourth_order_convergence():
    """Verify that halving dt reduces error by a factor of ~2^4 = 16."""
    f = lambda t, y: [y[0]]
    exact = math.exp(1.0)

    # Coarse dt = 0.1
    y_coarse = [1.0]
    t = 0.0
    dt_c = 0.1
    for _ in range(10):
        y_coarse = rk4_step(f, t, y_coarse, dt_c)
        t += dt_c
    error_coarse = abs(y_coarse[0] - exact)

    # Fine dt = 0.05
    y_fine = [1.0]
    t = 0.0
    dt_f = 0.05
    for _ in range(20):
        y_fine = rk4_step(f, t, y_fine, dt_f)
        t += dt_f
    error_fine = abs(y_fine[0] - exact)

    ratio = error_coarse / error_fine
    # Expected ratio for 4th order: 16 (allow tolerance for higher order terms)
    assert ratio > 14.0
