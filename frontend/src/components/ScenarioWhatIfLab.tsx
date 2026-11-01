import React, { useState } from "react";
import { ScenarioWhatIfResponse, ScenarioVariable } from "../types";
import { api } from "../api/client";
import { GitBranch, ArrowRight, Zap, Play, RotateCcw } from "lucide-react";

interface ScenarioWhatIfLabProps {
  scenarioId: string;
  description: string;
  timeHorizon: string;
  conditions: Record<string, ScenarioVariable>;
  whatIfResult: ScenarioWhatIfResponse | null;
  onSetWhatIfResult: (result: ScenarioWhatIfResponse | null) => void;
}

export const ScenarioWhatIfLab: React.FC<ScenarioWhatIfLabProps> = ({
  scenarioId,
  description,
  timeHorizon,
  conditions,
  whatIfResult,
  onSetWhatIfResult
}) => {
  const conditionKeys = Object.keys(conditions);
  const defaultVar = conditionKeys[0] || "staff";

  const [selectedVarName, setSelectedVarName] = useState<string>(defaultVar);
  const currentVar = conditions[selectedVarName] || { name: selectedVarName, label: selectedVarName, value: 20, min_val: 5, max_val: 50, step: 1, unit: "" };

  const [sliderValue, setSliderValue] = useState<number>(currentVar.value);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeRippleStage, setActiveRippleStage] = useState<number>(0);

  const handleSelectVar = (varName: string) => {
    setSelectedVarName(varName);
    const target = conditions[varName];
    if (target) {
      setSliderValue(target.value);
    }
  };

  const handleRunWhatIf = async () => {
    setIsRunning(true);
    try {
      const condMap: Record<string, number> = {};
      Object.entries(conditions).forEach(([k, v]) => {
        condMap[k] = v.value;
      });

      const res = await api.runScenarioWhatIf(
        scenarioId || "default-scenario",
        description,
        selectedVarName,
        sliderValue,
        condMap,
        timeHorizon
      );
      onSetWhatIfResult(res);

      // Trigger sequential Ripple Effect animation
      setActiveRippleStage(0);
      setTimeout(() => setActiveRippleStage(1), 250);
      setTimeout(() => setActiveRippleStage(2), 500);
      setTimeout(() => setActiveRippleStage(3), 750);
      setTimeout(() => setActiveRippleStage(4), 1000);
      setTimeout(() => setActiveRippleStage(5), 1250);
    } catch (err) {
      console.error("Failed to run What-If simulation:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const inputDelta = sliderValue - currentVar.value;
  const inputPctChange = currentVar.value !== 0 ? Math.round((inputDelta / currentVar.value) * 100) : 0;

  return (
    <section className="glass-panel" style={{ padding: "24px 28px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>WHAT-IF PERTURBATION LAB</h2>
            <span className="provenance-tag computed">SENSITIVITY EXPERIMENT</span>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Change one condition and observe how the future probability distribution shifts
          </p>
        </div>

        <button
          onClick={handleRunWhatIf}
          disabled={isRunning}
          className="btn-primary"
          style={{
            fontSize: "0.88rem",
            padding: "8px 22px",
            background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
            fontWeight: 700
          }}
        >
          <Play size={15} />
          <span>{isRunning ? "Simulating Future Divergence..." : "RUN WHAT-IF"}</span>
        </button>
      </div>

      {/* Variable Selector & Slider Control */}
      <div style={{
        background: "rgba(15, 23, 42, 0.65)",
        padding: "18px 20px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "22px"
      }}>
        {/* Variable Pills */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
            Select Variable to Perturb:
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {conditionKeys.map((key) => {
              const cond = conditions[key];
              const isSelected = selectedVarName === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectVar(key)}
                  className={`btn-secondary ${isSelected ? "active" : ""}`}
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                >
                  {cond.label} ({cond.value} {cond.unit})
                </button>
              );
            })}
          </div>
        </div>

        {/* What-If Slider Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-main)" }}>
              {currentVar.label} Perturbation
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", fontFamily: "var(--font-mono)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Current: <strong>{currentVar.value} {currentVar.unit}</strong>
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>→</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-baseline)" }}>
                What-If: {sliderValue} {currentVar.unit}
              </span>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: inputPctChange >= 0 ? "#10b981" : "#f43f5e",
                background: inputPctChange >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {inputPctChange >= 0 ? `+${inputPctChange}%` : `${inputPctChange}%`}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={currentVar.min_val}
            max={currentVar.max_val}
            step={currentVar.step}
            value={sliderValue}
            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
            <span>Min: {currentVar.min_val} {currentVar.unit}</span>
            <span>Current: {currentVar.value} {currentVar.unit}</span>
            <span>Max: {currentVar.max_val} {currentVar.unit}</span>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY: BEFORE VS AFTER & BUTTERFLY EFFECT SCORE */}
      {whatIfResult && (
        <div>
          {/* Top Comparison Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "22px" }}>
            {/* Before vs After Comparative Table */}
            <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>
                  PROBABILITY DISTRIBUTION: BEFORE VS AFTER
                </span>
                <span className="provenance-tag computed">COMPUTED SHIFT</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {whatIfResult.baseline_futures.map((bFuture, idx) => {
                  const wFuture = whatIfResult.whatif_futures[idx] || bFuture;
                  const shift = whatIfResult.probability_shifts[bFuture.id];
                  const delta = shift ? shift.delta_pct : wFuture.score_percentage - bFuture.score_percentage;
                  const isPositive = delta > 0;

                  return (
                    <div key={bFuture.id} style={{ background: "rgba(30, 41, 59, 0.4)", padding: "12px 14px", borderRadius: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {bFuture.title}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--text-muted)" }}>{bFuture.score_percentage}%</span>
                          <span style={{ color: "var(--text-dim)" }}>→</span>
                          <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{wFuture.score_percentage}%</span>
                          <span style={{
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            color: delta === 0 ? "var(--text-dim)" : isPositive ? "#fbbf24" : "#38bdf8"
                          }}>
                            {delta > 0 ? `+${delta}%` : `${delta}%`}
                          </span>
                        </div>
                      </div>

                      {/* Visual Comparative Bars */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ width: "100%", height: "5px", background: "rgba(15, 23, 42, 0.7)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${bFuture.score_percentage}%`, height: "100%", background: "#64748b" }} />
                        </div>
                        <div style={{ width: "100%", height: "5px", background: "rgba(15, 23, 42, 0.7)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            width: `${wFuture.score_percentage}%`,
                            height: "100%",
                            background: delta > 0 ? "linear-gradient(90deg, #0284c7, #f59e0b)" : "linear-gradient(90deg, #0284c7, #10b981)",
                            transition: "width 0.4s ease"
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Butterfly Effect Score Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              borderRadius: "var(--radius-md)",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#f43f5e", fontWeight: 700 }}>
                    MEASURED SENSITIVITY
                  </span>
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.74rem",
                    background: "rgba(244, 63, 94, 0.15)",
                    color: "#fb7185",
                    border: "1px solid rgba(244, 63, 94, 0.4)"
                  }}>
                    BUTTERFLY EFFECT: {whatIfResult.butterfly_effect_level}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px 0" }}>
                  A Small Change Shifted the Future Distribution
                </h3>

                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                  {whatIfResult.synthesis_explanation}
                </p>
              </div>

              {/* Numerical Metrics Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontFamily: "var(--font-mono)" }}>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Relative Input Change</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: whatIfResult.input_change_pct >= 0 ? "#10b981" : "#f43f5e", marginTop: "2px" }}>
                    {whatIfResult.input_change_pct > 0 ? `+${whatIfResult.input_change_pct}%` : `${whatIfResult.input_change_pct}%`}
                  </div>
                </div>

                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Largest Outcome Shift</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>
                    {whatIfResult.largest_shift_outcome} ({whatIfResult.largest_shift_pct > 0 ? `+${whatIfResult.largest_shift_pct}%` : `${whatIfResult.largest_shift_pct}%`})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIGNATURE VISUAL MOMENT: THE RIPPLE EFFECT CAUSAL CHAIN */}
          <div>
            <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "10px" }}>
              SIGNATURE CAUSAL DYNAMICS: THE RIPPLE EFFECT
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {whatIfResult.ripple_effect_chain.map((step, idx) => {
                const isLit = activeRippleStage >= idx;
                const isCurrent = activeRippleStage === idx;

                return (
                  <div
                    key={idx}
                    className={isCurrent ? "ripple-active" : ""}
                    style={{
                      background: isLit ? "rgba(30, 41, 59, 0.75)" : "rgba(15, 23, 42, 0.45)",
                      border: `1px solid ${isLit ? "var(--border-focus)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 14px",
                      transition: "all 0.25s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: isLit ? "var(--accent-baseline)" : "var(--text-dim)" }}>
                        {step.stage}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>→</span>
                    </div>

                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "3px" }}>
                      {step.title}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                      {step.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
