"""Classical Fourth-Order Runge-Kutta (RK4) Integrator.

Scientific Reference:
Runge, C. (1895). Über die numerische Auflösung von Differentialgleichungen.
Mathematische Annalen, 46(2), 167-178.
Kutta, W. (1901). Beitrag zur näherungsweisen Integration totaler Differentialgleichungen.
Zeitschrift für Mathematik und Physik, 46, 435-453.
"""

from typing import Callable, List
from .base import Integrator


def rk4_step(
    f: Callable[[float, List[float]], List[float]],
    t: float,
    y: List[float],
    dt: float
) -> List[float]:
    """Pure classical 4th-order Runge-Kutta single step integration.

    Formula:
        k1 = f(t, y)
        k2 = f(t + dt/2, y + dt*k1/2)
        k3 = f(t + dt/2, y + dt*k2/2)
        k4 = f(t + dt, y + dt*k3)
        y_{n+1} = y + dt*(k1 + 2*k2 + 2*k3 + k4)/6
    """
    n = len(y)

    # Stage 1
    k1 = f(t, y)

    # Stage 2
    dt2 = dt * 0.5
    t_half = t + dt2
    y_stage2 = [y[i] + dt2 * k1[i] for i in range(n)]
    k2 = f(t_half, y_stage2)

    # Stage 3
    y_stage3 = [y[i] + dt2 * k2[i] for i in range(n)]
    k3 = f(t_half, y_stage3)

    # Stage 4
    t_full = t + dt
    y_stage4 = [y[i] + dt * k3[i] for i in range(n)]
    k4 = f(t_full, y_stage4)

    # Accumulate result
    dt6 = dt / 6.0
    return [
        y[i] + dt6 * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i])
        for i in range(n)
    ]


class RK4Integrator(Integrator):
    """Fourth-Order Runge-Kutta integrator class implementing Integrator interface."""

    name = "rk4"
    order = 4

    def step(
        self,
        f: Callable[[float, List[float]], List[float]],
        t: float,
        y: List[float],
        dt: float
    ) -> List[float]:
        return rk4_step(f, t, y, dt)
