# Scientific Models & Mathematical Reference
**AI Butterfly Effect Lab**

---

## 1. Model 1: The Lorenz-63 Atmospheric Convection System

### 1.1 Governing Equations
The system consists of three coupled, nonlinear, autonomous ordinary differential equations:

$$\begin{aligned}
\frac{dx}{dt} &= \sigma (y - x) \\
\frac{dy}{dt} &= x (\rho - z) - y \\
\frac{dz}{dt} &= x y - \beta z
\end{aligned}$$

### 1.2 Physical Interpretation of State Variables
- $x(t)$: Rate of convective overturning; sign indicates clockwise or counter-clockwise roll rotation.
- $y(t)$: Horizontal temperature difference between rising and falling thermal currents.
- $z(t)$: Distortion of the vertical temperature profile from linear conduction.

### 1.3 Parameters
- $\sigma = 10.0$ (Prandtl number)
- $\rho = 28.0$ (Rayleigh number)
- $\beta = \frac{8}{3} \approx 2.666667$ (Geometric aspect ratio factor)

### 1.4 Fixed Points and Stability Analysis
1. **Trivial Equilibrium:**
   The origin $O = (0, 0, 0)$ is always a fixed point. For $\rho > 1$, the Jacobian at the origin exhibits eigenvalues with at least one positive real part, rendering it an unstable saddle.
2. **Convection Equilibria:**
   For $\rho > 1$, two non-trivial fixed points emerge through a pitchfork bifurcation:
   $$C^\pm = \left(\pm\sqrt{\beta(\rho-1)}, \pm\sqrt{\beta(\rho-1)}, \rho - 1\right)$$
   For canonical parameters ($\rho = 28, \beta = 8/3$), $C^\pm = (\pm\sqrt{72}, \pm\sqrt{72}, 27) \approx (\pm 8.485, \pm 8.485, 27)$.
   At $\rho = \rho_c \approx 24.74$, $C^\pm$ lose stability via a subcritical Hopf bifurcation, producing the strange attractor.

### 1.5 Numerical Integration
- **Integrator:** Classical 4th-Order Runge-Kutta (RK4).
- **Default Timestep:** $\Delta t = 0.01\text{ s}$.
- **Local Truncation Error:** $\mathcal{O}(\Delta t^5)$; **Global Truncation Error:** $\mathcal{O}(\Delta t^4)$.

---

## 2. Model 2: The Logistic Map

### 2.1 Governing Discrete Equation
$$x_{n+1} = r x_n (1 - x_n), \quad x_0 \in (0, 1), \quad r \in [0, 4]$$

### 2.2 Dynamical Regimes by Parameter $r$
- $0 \le r \le 1$: Trajectory decays to 0 (extinction).
- $1 < r \le 3$: Stable asymptotic equilibrium at $x^* = 1 - \frac{1}{r}$.
- $3 < r < 1 + \sqrt{6} \approx 3.449$: Period-2 limit cycle.
- $3.449 \le r < 3.544$: Period-4 limit cycle.
- $r_\infty \approx 3.56995$: Feigenbaum accumulation point (infinite period-doubling cascade).
- $3.57 < r \le 4.0$: Chaotic band intermingled with periodic windows (e.g. period-3 window near $r \approx 3.8284$).

---

## 3. Trajectory Separation and Divergence Metrics

### 3.1 Euclidean Phase-Space Separation
$$D(t) = \|\mathbf{x}(t) - \mathbf{x}'(t)\|_2 = \sqrt{\sum_{i=1}^d (x_i(t) - x'_i(t))^2}$$

### 3.2 Logarithmic Divergence
$$\Lambda(t) = \ln \left(\frac{D(t)}{D(0)}\right)$$

### 3.3 Finite-Time Exponential Growth Indicator
$$\lambda_{\text{FT}} = \frac{1}{t^*} \ln \left(\frac{D(t^*)}{D(0)}\right)$$
*Note on Nomenclature:* This is an empirical observation metric over a finite duration, distinct from the infinite-time maximal Lyapunov exponent $\lambda = \lim_{t \to \infty} \lim_{D(0) \to 0} \frac{1}{t} \ln \frac{D(t)}{D(0)}$.
