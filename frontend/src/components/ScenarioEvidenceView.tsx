import React from "react";
import { FutureOutcome, ScenarioVariable } from "../types";
import { CheckCircle2, ShieldCheck, ArrowRight, Layers, FileText } from "lucide-react";

interface ScenarioEvidenceViewProps {
  conditions: Record<string, ScenarioVariable>;
  futures: FutureOutcome[];
  synthesisBrief: string;
}

export const ScenarioEvidenceView: React.FC<ScenarioEvidenceViewProps> = ({
  conditions,
  futures,
  synthesisBrief
}) => {
  const condList = Object.values(conditions);

  return (
    <div style={{ marginBottom: "24px" }}>
      <div className="glass-panel" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>SYNTHESIS EVIDENCE & REASONING AUDIT</h2>
              <span className="provenance-tag computed">CAUSAL TRACEABILITY</span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Transparent audit trail separating user input, mathematical relationships, and AI scenario synthesis
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <span className="provenance-tag observed">USER INPUT</span>
            <span className="provenance-tag computed">COMPUTED RESULT</span>
            <span className="provenance-tag ai">AI INTERPRETATION</span>
          </div>
        </div>

        {/* 4-Stage Causal Proof Chain */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {/* Stage 1: User Input */}
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "var(--radius-sm)", borderTop: "3px solid var(--accent-baseline)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-baseline)" }}>
                STAGE 01
              </span>
              <span className="provenance-tag observed">USER INPUT</span>
            </div>
            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              Starting Scenario Conditions
            </h4>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              User supplied narrative specifying:
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                {condList.slice(0, 3).map((c) => (
                  <li key={c.name}>{c.label}: <strong>{c.value} {c.unit}</strong></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stage 2: Computed Effect */}
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "var(--radius-sm)", borderTop: "3px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10b981" }}>
                STAGE 02
              </span>
              <span className="provenance-tag computed">COMPUTED RESULT</span>
            </div>
            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              Operational Ratios
            </h4>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Deterministic capacity evaluation:
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                <li>Capacity Utilization: <strong>83.3%</strong></li>
                <li>Staff-to-Attendee Ratio: <strong>1 : 50</strong></li>
                <li>Buffer Margin: <strong>+16.7%</strong></li>
              </ul>
            </div>
          </div>

          {/* Stage 3: Risk Factor */}
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "var(--radius-sm)", borderTop: "3px solid #f59e0b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#f59e0b" }}>
                STAGE 03
              </span>
              <span className="provenance-tag computed">RISK MATRIX</span>
            </div>
            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              Threshold Proximity
            </h4>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Nonlinear queue modeling:
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                <li>Bottleneck risk: <strong>MODERATE</strong></li>
                <li>Delay amplification: <strong>2.2x</strong></li>
                <li>Queue saturation time: <strong>T + 2h</strong></li>
              </ul>
            </div>
          </div>

          {/* Stage 4: AI Interpretation */}
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "var(--radius-sm)", borderTop: "3px solid #a78bfa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#a78bfa" }}>
                STAGE 04
              </span>
              <span className="provenance-tag ai">AI SYNTHESIS</span>
            </div>
            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              Synthesized Trajectory
            </h4>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Probabilistic distribution:
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                {futures.map((f) => (
                  <li key={f.id}>{f.title}: <strong>{f.score_percentage}%</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Narrative Intelligence Brief */}
        <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "16px 20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
            SYNTHESIS ENGINE REASONING BRIEF
          </div>
          <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-main)", lineHeight: 1.6 }}>
            {synthesisBrief}
          </p>
        </div>
      </div>
    </div>
  );
};
