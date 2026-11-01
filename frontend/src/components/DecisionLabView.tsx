import React, { useState } from "react";
import {
  DecisionOption,
  FutureOutcome,
  ScenarioVariable,
  ScenarioWhatIfResponse
} from "../types";
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";

interface DecisionLabViewProps {
  description: string;
  baselineFutures: FutureOutcome[];
  decisionOptions: DecisionOption[];
  conditions: Record<string, ScenarioVariable>;
  whatifResult: ScenarioWhatIfResponse | null;
  onExecuteDecision: (decision: DecisionOption) => void;
  onResetDecision: () => void;
  isEvaluating: boolean;
}

export const DecisionLabView: React.FC<DecisionLabViewProps> = ({
  description,
  baselineFutures,
  decisionOptions,
  conditions,
  whatifResult,
  onExecuteDecision,
  onResetDecision,
  isEvaluating
}) => {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    decisionOptions.length > 0 ? decisionOptions[0].id : null
  );

  const selectedDecision = decisionOptions.find(d => d.id === selectedDecisionId) || decisionOptions[0];

  const handleSelectDecision = (dec: DecisionOption) => {
    setSelectedDecisionId(dec.id);
    onExecuteDecision(dec);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto 40px auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text-main)", letterSpacing: "-0.015em", marginBottom: 4 }}>
          Decision Consequences
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Select an action to see how the butterfly effect alters forward probabilities, reduces risks, and introduces tradeoffs.
        </p>
      </div>

      {/* Selectable Action Cards */}
      <div style={{ marginBottom: 28 }}>
        <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", marginBottom: 10 }}>
          Available actions
        </span>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12
        }}>
          {decisionOptions.map((dec) => {
            const isSelected = dec.id === (selectedDecision?.id || selectedDecisionId);

            return (
              <div
                key={dec.id}
                onClick={() => handleSelectDecision(dec)}
                className="glass-panel"
                style={{
                  padding: "16px 18px",
                  cursor: "pointer",
                  borderRadius: "var(--radius-md)",
                  border: isSelected ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  backgroundColor: isSelected ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h4 style={{ fontSize: "0.94rem", fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                    {dec.title}
                  </h4>
                  {dec.projected_pass_rate_shift && (
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--accent-primary)",
                      border: "1px solid var(--border-subtle)",
                      fontFamily: "var(--font-mono)"
                    }}>
                      {dec.projected_pass_rate_shift}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.45, margin: 0 }}>
                  {dec.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Comparison */}
      {selectedDecision && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>
              Before & after comparison
            </h3>
            {whatifResult && (
              <button
                type="button"
                onClick={onResetDecision}
                className="btn-secondary"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 20
          }}>
            {/* Column 1: Original situation */}
            <div className="glass-panel" style={{ padding: 22, backgroundColor: "var(--bg-card)" }}>
              <span style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-dim)",
                marginBottom: 10
              }}>
                Original situation
              </span>

              {/* Existing conditions */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 3 }}>
                  Existing conditions
                </span>
                <p style={{ fontSize: "0.86rem", color: "var(--text-main)", lineHeight: 1.45 }}>
                  {description}
                </p>
              </div>

              {/* Original possible outcomes */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 6 }}>
                  Original possible outcomes
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {baselineFutures.slice(0, 3).map((f) => (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "var(--text-main)" }}>{f.title}</span>
                      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {f.score_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important risks */}
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 4 }}>
                  Important risks
                </span>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  {baselineFutures[2]?.expected_result || "Risk of compounding delay if no proactive intervention is executed."}
                </p>
              </div>
            </div>

            {/* Column 2: After your decision */}
            <div className="glass-panel" style={{
              padding: 22,
              backgroundColor: "var(--bg-card)",
              border: "1.5px solid var(--accent-primary)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--accent-primary)"
                }}>
                  After your decision
                </span>
                <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--accent-primary)" }}>
                  {selectedDecision.projected_pass_rate_shift}
                </span>
              </div>

              {/* Selected action */}
              <h4 style={{ fontSize: "0.98rem", fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>
                {selectedDecision.title}
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: 14 }}>
                {selectedDecision.description}
              </p>

              {/* Changed conditions */}
              {selectedDecision.tradeoff && (
                <div style={{
                  marginBottom: 14,
                  padding: "8px 11px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-secondary)",
                  fontSize: "0.8rem",
                  color: "var(--text-main)"
                }}>
                  <strong style={{ color: "var(--text-dim)" }}>Tradeoff: </strong>
                  {selectedDecision.tradeoff}
                </div>
              )}

              {/* Risks reduced vs introduced */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ padding: "9px 10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--status-favorable-bg)", border: "1px solid var(--status-favorable-border)" }}>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--status-favorable)", textTransform: "uppercase", marginBottom: 4 }}>
                    Risks reduced
                  </span>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: "0.77rem", color: "var(--text-main)" }}>
                    {selectedDecision.pros?.map((p, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>{p}</li>
                    )) || <li>Stabilizes immediate trajectory</li>}
                  </ul>
                </div>

                <div style={{ padding: "9px 10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--status-adverse-bg)", border: "1px solid var(--status-adverse-border)" }}>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--status-adverse)", textTransform: "uppercase", marginBottom: 4 }}>
                    Risks / costs
                  </span>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: "0.77rem", color: "var(--text-main)" }}>
                    {selectedDecision.cons?.map((c, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>{c}</li>
                    )) || <li>Requires prompt execution</li>}
                  </ul>
                </div>
              </div>

              {/* Updated possible outcomes */}
              {whatifResult && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginBottom: 12 }}>
                  <span style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 6 }}>
                    Updated outcome probabilities
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {whatifResult.whatif_futures?.slice(0, 3).map((wf) => {
                      const baseF = baselineFutures.find(bf => bf.id === wf.id);
                      const basePct = baseF ? baseF.score_percentage : 0;
                      const diff = wf.score_percentage - basePct;

                      return (
                        <div key={wf.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--text-main)" }}>{wf.title}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{wf.score_percentage}%</span>
                            {diff !== 0 && (
                              <span style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: diff > 0 ? "var(--status-favorable)" : "var(--status-adverse)"
                              }}>
                                {diff > 0 ? `+${diff}%` : `${diff}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended next step */}
              <div style={{
                marginTop: 10,
                padding: "8px 11px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--accent-primary-subtle)",
                fontSize: "0.8rem",
                color: "var(--text-main)"
              }}>
                <strong style={{ color: "var(--accent-primary)" }}>Recommended next step: </strong>
                Execute this action immediately to secure the favorable recovery path.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
