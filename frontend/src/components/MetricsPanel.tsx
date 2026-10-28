import React from "react";
import { ShieldCheck, Clock, Zap, ArrowUpRight, Scale } from "lucide-react";
import { SimulationMetrics } from "../types";

interface MetricsPanelProps {
  metrics: SimulationMetrics | null;
  explanation: string;
  configHash?: string;
  onSaveExperiment?: () => void;
  isSaved?: boolean;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  explanation,
  configHash,
  onSaveExperiment,
  isSaved = false,
}) => {
  if (!metrics) {
    return (
      <div className="glass-panel" style={{ padding: 20, textAlign: "center", color: "var(--text-dim)" }}>
        Configure parameters and run the simulation to compute physical divergence metrics.
      </div>
    );
  }

  const d0 = metrics.initial_distance;
  const dFin = metrics.final_distance;
  const dMax = metrics.max_distance;
  const tThresh = metrics.time_to_threshold;
  const ftRate = metrics.approx_finite_time_growth_rate;

  const separationRatio = d0 > 0 ? dFin / d0 : 1;

  return (
    <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header with Provenance Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge-computed">
            <ShieldCheck size={13} />
            COMPUTED FROM SIMULATION
          </span>
          {configHash && (
            <span className="coord-pill" title={`Reproducibility Hash: ${configHash}`}>
              SHA: {configHash.substring(0, 10)}...
            </span>
          )}
        </div>

        {onSaveExperiment && (
          <button
            className={`btn-secondary ${isSaved ? "active" : ""}`}
            onClick={onSaveExperiment}
            disabled={isSaved}
            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
          >
            {isSaved ? "Experiment Saved" : "Save to History"}
          </button>
        )}
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
        gap: 10
      }}>
        {/* Initial Separation D0 */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 12px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
            Initial Separation D(0)
          </div>
          <div className="mono" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#38bdf8" }}>
            {d0 < 1e-4 && d0 > 0 ? d0.toExponential(2) : d0.toFixed(6)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
            Input Perturbation
          </div>
        </div>

        {/* Final Separation D(T) */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 12px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
            Final Separation D(T)
          </div>
          <div className="mono" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f43f5e" }}>
            {dFin.toFixed(4)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
            {separationRatio > 1 ? `${separationRatio.toExponential(1)}x growth` : "Identical"}
          </div>
        </div>

        {/* Peak Separation D_max */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 12px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
            Peak Distance D_max
          </div>
          <div className="mono" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fbbf24" }}>
            {dMax.toFixed(4)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
            Attractor Bound
          </div>
        </div>

        {/* Time to Threshold t* */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 12px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
            Time to Threshold t*
          </div>
          <div className="mono" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#10b981" }}>
            {tThresh !== null ? `${tThresh.toFixed(2)}s` : "None"}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
            D(t) ≥ {metrics.divergence_threshold}
          </div>
        </div>

        {/* Finite-Time Growth Indicator */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 12px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
            FT Growth Rate λ_FT
          </div>
          <div className="mono" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#a78bfa" }}>
            {ftRate !== null ? `${ftRate.toFixed(3)} s⁻¹` : "N/A"}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
            Empirical Separation
          </div>
        </div>
      </div>

      {/* Grounded Scientific Interpretation */}
      <div style={{
        background: "rgba(8, 12, 20, 0.7)",
        border: "1px solid rgba(148, 163, 184, 0.1)",
        borderRadius: 8,
        padding: "12px 14px",
        fontSize: "0.84rem",
        lineHeight: 1.55,
        color: "var(--text-main)"
      }}>
        <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--accent-cyan)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Empirical Scientific Finding
        </div>
        {explanation}
      </div>
    </div>
  );
};
