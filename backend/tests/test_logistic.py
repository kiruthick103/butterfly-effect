"""Unit tests for Logistic Map."""

import pytest
from app.simulation.models.logistic import LogisticMap


def test_logistic_fixed_points():
    system = LogisticMap()
    # At r = 2.0, non-zero fixed point is x* = 1 - 1/r = 0.5
    next_x = system.step(0.5, {"r": 2.0})
    assert abs(next_x - 0.5) < 1e-12


def test_logistic_orbit_generation():
    system = LogisticMap()
    orbit = system.compute_orbit(x0=0.5, r=3.8, iterations=50, burn_in=10)
    assert len(orbit) == 50
    for val in orbit:
        assert 0.0 <= val <= 1.0


def test_logistic_validation():
    system = LogisticMap()
    with pytest.raises(ValueError):
        system.validate_state(-0.1)  # out of bounds
    with pytest.raises(ValueError):
        system.validate_state(1.5)  # out of bounds
    with pytest.raises(ValueError):
        system.validate_parameters({"r": 4.5})  # r > 4
