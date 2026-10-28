"""Unit tests for Lorenz 1963 dynamical system."""

import pytest
import math
from app.simulation.models.lorenz import LorenzSystem


def test_lorenz_initialization():
    system = LorenzSystem()
    assert system.name == "lorenz"
    assert system.dimension == 3
    assert system.default_parameters["sigma"] == 10.0
    assert system.default_parameters["rho"] == 28.0
    assert abs(system.default_parameters["beta"] - (8.0 / 3.0)) < 1e-10


def test_lorenz_derivatives_at_origin():
    """At origin (0, 0, 0), all time derivatives dx/dt, dy/dt, dz/dt must be zero."""
    system = LorenzSystem()
    derivs = system.derivative(0.0, [0.0, 0.0, 0.0], system.default_parameters)
    assert derivs == [0.0, 0.0, 0.0]


def test_lorenz_derivatives_at_fixed_points():
    """Test fixed points C+ and C- where derivatives are zero."""
    system = LorenzSystem()
    params = {"sigma": 10.0, "rho": 28.0, "beta": 8.0 / 3.0}
    # C+ = (sqrt(beta*(rho-1)), sqrt(beta*(rho-1)), rho - 1)
    c_coord = math.sqrt((8.0 / 3.0) * 27.0)  # sqrt(72) = 6*sqrt(2) approx 8.48528
    z_coord = 27.0
    fixed_point = [c_coord, c_coord, z_coord]

    derivs = system.derivative(0.0, fixed_point, params)
    assert abs(derivs[0]) < 1e-10
    assert abs(derivs[1]) < 1e-10
    assert abs(derivs[2]) < 1e-10


def test_lorenz_validation_rejects_nan_and_inf():
    system = LorenzSystem()
    with pytest.raises(ValueError):
        system.validate_state([1.0, float("nan"), 1.0])
    with pytest.raises(ValueError):
        system.validate_state([1.0, float("inf"), 1.0])
    with pytest.raises(ValueError):
        system.validate_state([1.0, 1.0])  # dimension mismatch
