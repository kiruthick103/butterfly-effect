# User & Educator Guide
**AI Butterfly Effect Lab**

---

## 1. Quick Walkthrough: Your First Chaos Experiment

1. **Select Model & Preset:**
   - In the top navigation, ensure you are in the **Chaos Lab**.
   - Choose the preset **"Lorenz Canonical (10⁻⁶ Perturbation)"**.
2. **Review the State Vectors:**
   - **BASELINE:** $[1.00, 1.00, 1.00]$
   - **PERTURBATION:** $[0.000001, 0.00, 0.00]$ (one-millionth along X)
   - **PERTURBED:** $[1.000001, 1.00, 1.00]$
3. **Execute:**
   - Click the blue **RUN EXPERIMENT** button.
   - The numerical engine integrates both trajectories deterministically using 4th-Order Runge-Kutta.
4. **Observe the Divergence:**
   - In the **3D Interactive Orbit Visualizer**, drag your mouse to rotate the perspective.
   - For the first $\approx 10$ seconds, the cyan (baseline) and coral (perturbed) trajectories are visually superimposed.
   - Around $t = 14.5\text{ s}$, the trajectories suddenly split onto opposite lobes of the strange attractor.
5. **Inspect the Metrics Panel:**
   - Observe **Initial Separation** $D(0) = 1.00\times 10^{-6}$.
   - Observe **Final Separation** $D(T) = 7.8214$ (a factor of $7.8\times 10^6$ growth).
   - Check **Time to Threshold** $t^* = 14.48\text{ s}$.

---

## 2. Flagship Laboratories

### 2.1 Perturbation Microscope
- Switch to the **Microscope** tab in the top navigation.
- The system sweeps 7 orders of magnitude ($10^{-1}, 10^{-2}, 10^{-3}, 10^{-4}, 10^{-5}, 10^{-6}, 10^{-7}$).
- Notice how every $10\times$ decrease in initial difference adds a predictable $\approx 2.5\text{ s}$ delay to the threshold crossing time.

### 2.2 Sensitivity Heatmap
- Switch to the **Sensitivity Heatmap** tab.
- Set the grid resolution to $20 \times 20$ or $30 \times 30$.
- Move your cursor across the phase-space contour to view initial coordinate sensitivity.

### 2.3 Logistic Map & Bifurcation Explorer
- Switch to the **Bifurcation** tab.
- Drag the **r** slider from $2.8$ (fixed point) $\to 3.2$ (period 2) $\to 3.5$ (period 4) $\to 3.9$ (chaos).
- Click on the preset **"Window (3.83)"** to observe the period-3 periodic window within the chaotic band.

---

## 3. Responsible AI Scenario Lab & Evidence Ledger

1. **Formulating What-If Questions:**
   - Open the **AI Scenario Lab**.
   - Ask: *"What if the initial perturbation was along the z-axis instead of x?"*
   - The AI receives **verified physical facts** from your simulation run and generates structured speculative causal branches with stated assumptions, uncertainties, and limitations.
2. **Checking Epistemic Provenance in the Evidence Ledger:**
   - Open the **Evidence Ledger** to inspect every scientific claim.
   - Claims tagged with **`COMPUTED`** originate from the numerical Runge-Kutta engine.
   - Claims tagged with **`HYPOTHESIS`** originate from AI qualitative projections.

---

## 4. Guided Lessons & Teacher Mode

- Open the **Lessons** tab.
- Engage in the **Predict-Observe-Explain (POE)** workflow:
  1. Commit to a hypothesis before running the simulation.
  2. Run the experiment to observe empirical divergence.
  3. Reflect on the scientific explanation.
