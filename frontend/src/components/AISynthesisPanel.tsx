import React from "react";
import { SynthesisQuality, SimulationTrialStats } from "../types";
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Cpu, BarChart2 } from "lucide-react";

interface AISynthesisPanelProps {
  synthesisBrief: string;
  quality: SynthesisQuality;
  simulationStats?: SimulationTrialStats;
}

export const AISynthesisPanel: React.FC<AISynthesisPanelProps> = ({
  synthesisBrief,
  quality,
  simulationStats
}) => {
  const isHighAgreement = quality.analysis_agreement.includes("HIGH");
  const agreementColor = isHighAgreement ? "#10b981" : quality.analysis_agreement.includes("MODERATE") ? "#38bdf8" : "#f59e0b";

  return (
    <div className="glass-panel" style={{ padding: "22px 26px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>AI SYNTHESIS & SIMULATION INTELLIGENCE</h2>
          <span className="provenance-tag ai">HYBRID SIMULATION OBSERVER</span>
        </div>
        {simulationStats && (
          <span style={{ fontSize: "0.74rem", color: "#38bdf8", fontFamily: "var(--font-mono)", background: "rgba(56, 189, 248, 0.1)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            ⚡ {simulationStats.method} • {simulationStats.execution_time_ms}ms
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Left Column: Narrative Synthesis Brief */}
        <div>
          <div style={{
            background: "rgba(15, 23, 42, 0.75)",
            padding: "16px 18px",
            borderRadius: "var(--radius-sm)",
            borderLeft: "3px solid var(--accent-baseline)",
            lineHeight: 1.6,
            fontSize: "0.88rem",
            color: "var(--text-main)",
            marginBottom: "12px"
          }}>
            {synthesisBrief}
          </div>

          {/* Simulation Quantiles & Confidence Intervals */}
          {simulationStats && (
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "6px", display: "flex", alignItems: "center", gap: 6 }}>
                <BarChart2 size={12} color="#38bdf8" />
                Monte Carlo Empirical Confidence (95% Wilson Score Interval)
              </div>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Seed: </span>
                  <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{simulationStats.seed}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Trials: </span>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>{simulationStats.trials_run.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>p10 Stress: </span>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>{simulationStats.p10}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>p50 (Median): </span>
                  <span style={{ color: "#fbbf24", fontWeight: 700 }}>{simulationStats.p50}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>p90 Stress: </span>
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>{simulationStats.p90}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Synthesis Quality & Analysis Agreement */}
        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", fontWeight: 600 }}>
              ANALYSIS AGREEMENT
            </span>
            <span style={{
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: agreementColor,
              padding: "2px 8px",
              background: `${agreementColor}15`,
              borderRadius: "4px",
              border: `1px solid ${agreementColor}40`
            }}>
              {quality.analysis_agreement}
            </span>
          </div>

          {/* Agreement Progress Bar */}
          <div style={{ width: "100%", height: "7px", background: "rgba(30, 41, 59, 0.8)", borderRadius: "4px", overflow: "hidden", marginBottom: "14px" }}>
            <div
              style={{
                width: `${Math.round((quality.agreement_score || 0.88) * 100)}%`,
                height: "100%",
                background: `linear-gradient(90deg, #0284c7 0%, ${agreementColor} 100%)`,
                transition: "width 0.5s ease"
              }}
            />
          </div>

          {/* Synthesis Quality Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.76rem" }}>
            <div style={{ background: "rgba(30, 41, 59, 0.45)", padding: "8px 10px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-dim)" }}>Input Completeness</div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-main)", marginTop: "2px" }}>
                {quality.input_completeness_pct}%
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.45)", padding: "8px 10px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-dim)" }}>Scenario Clarity</div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#10b981", marginTop: "2px" }}>
                {quality.scenario_clarity}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.45)", padding: "8px 10px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-dim)" }}>Outcome Separation</div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-baseline)", marginTop: "2px" }}>
                {quality.outcome_separation}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.45)", padding: "8px 10px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-dim)" }}>Uncertainty Level</div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#fbbf24", marginTop: "2px" }}>
                {quality.uncertainty}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
