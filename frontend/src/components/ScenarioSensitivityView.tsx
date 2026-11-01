import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { ScenarioSensitivityMatrixResponse, ScenarioSensitivityRanking } from "../types";
import { Sliders, AlertTriangle, ArrowUpRight } from "lucide-react";

interface ScenarioSensitivityViewProps {
  onSelectVariableForWhatIf?: (varName: string) => void;
}

export const ScenarioSensitivityView: React.FC<ScenarioSensitivityViewProps> = ({
  onSelectVariableForWhatIf
}) => {
  const [data, setData] = useState<ScenarioSensitivityMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<any | null>(null);

  useEffect(() => {
    const fetchSensitivity = async () => {
      setIsLoading(true);
      try {
        const res = await api.getScenarioSensitivity();
        setData(res);
      } catch (err) {
        console.error("Failed to load scenario sensitivity:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSensitivity();
  }, []);

  const getCellColor = (level: string) => {
    switch (level) {
      case "EXTREME":
        return { bg: "rgba(244, 63, 94, 0.4)", border: "rgba(244, 63, 94, 0.8)", text: "#fecdd3" };
      case "HIGH":
        return { bg: "rgba(245, 158, 11, 0.3)", border: "rgba(245, 158, 11, 0.7)", text: "#fde68a" };
      case "MEDIUM":
        return { bg: "rgba(56, 189, 248, 0.22)", border: "rgba(56, 189, 248, 0.6)", text: "#bae6fd" };
      case "LOW":
      default:
        return { bg: "rgba(30, 41, 59, 0.4)", border: "rgba(148, 163, 184, 0.2)", text: "#94a3b8" };
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return { bg: "rgba(244, 63, 94, 0.15)", color: "#fb7185", border: "rgba(244, 63, 94, 0.3)" };
      case "MEDIUM":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
      case "LOW":
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", border: "rgba(148, 163, 184, 0.3)" };
    }
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div className="glass-panel" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>SENSITIVITY MATRIX & VARIABLE RANKING</h2>
              <span className="provenance-tag computed">NONLINEAR SENSITIVITY ANALYSIS</span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Quantitative evaluation answering: Which small changes in the present have the greatest effect on the future?
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-dim)" }}>Impact Level:</span>
            {["LOW", "MEDIUM", "HIGH", "EXTREME"].map((lvl) => {
              const c = getCellColor(lvl);
              return (
                <div key={lvl} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 10, height: 10, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 2 }} />
                  <span style={{ color: c.text }}>{lvl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Calculating sensitivity across multi-dimensional state space...
          </div>
        ) : !data ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Unable to retrieve sensitivity matrix.
          </div>
        ) : (
          <div>
            {/* Top Impact Ranking Table */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "8px" }}>
                VARIABLE BUTTERFLY IMPACT RANKING
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {data.rankings.map((rank) => {
                  const badge = getImpactBadge(rank.impact);
                  return (
                    <div
                      key={rank.variable}
                      className="glass-panel"
                      style={{
                        padding: "14px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                            {rank.label}
                          </span>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}>
                            {rank.impact} IMPACT
                          </span>
                        </div>

                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "8px", lineHeight: 1.4 }}>
                          {rank.primary_risk}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "8px" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                          Default: {rank.default_value} {rank.unit}
                        </span>
                        {onSelectVariableForWhatIf && (
                          <button
                            onClick={() => onSelectVariableForWhatIf(rank.variable)}
                            className="btn-secondary"
                            style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                          >
                            Simulate What-If →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Heatmap Matrix */}
            <div>
              <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "8px" }}>
                PERTURBATION HEATMAP (INPUT CHANGE VS RISK PROBABILITY SHIFT)
              </div>

              <div style={{ overflowX: "auto", marginBottom: "14px" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "6px", fontSize: "0.82rem" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        State Variable
                      </th>
                      {data.perturbation_percentages.map((pct) => (
                        <th
                          key={pct}
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            color: pct > 0 ? "var(--accent-baseline)" : "#fb7185",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700
                          }}
                        >
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.variables.map((varName) => {
                      const rowData = data.matrix[varName] || {};
                      const label = data.variable_labels[varName] || varName;

                      return (
                        <tr key={varName}>
                          <td style={{
                            padding: "12px 14px",
                            background: "rgba(15, 23, 42, 0.6)",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            border: "1px solid var(--border-subtle)"
                          }}>
                            {label}
                          </td>
                          {data.perturbation_percentages.map((pct) => {
                            const cell = rowData[String(pct)];
                            if (!cell) {
                              return <td key={pct} style={{ textAlign: "center", color: "var(--text-dim)" }}>-</td>;
                            }
                            const style = getCellColor(cell.sensitivity_level);
                            const isHovered = hoveredCell === cell;

                            return (
                              <td
                                key={pct}
                                onMouseEnter={() => setHoveredCell(cell)}
                                onMouseLeave={() => setHoveredCell(null)}
                                style={{
                                  textAlign: "center",
                                  padding: "12px 8px",
                                  background: style.bg,
                                  border: `1px solid ${isHovered ? "#ffffff" : style.border}`,
                                  borderRadius: "var(--radius-sm)",
                                  color: style.text,
                                  fontFamily: "var(--font-mono)",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  transform: isHovered ? "scale(1.05)" : "none",
                                  boxShadow: isHovered ? "0 0 12px rgba(255,255,255,0.2)" : "none"
                                }}
                              >
                                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                                  {cell.outcome_shift_pct > 0 ? `+${cell.outcome_shift_pct}%` : `${cell.outcome_shift_pct}%`}
                                </div>
                                <div style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                                  Score: {cell.sensitivity_score}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Hover Inspect Detail Box */}
              <div style={{
                background: "rgba(15, 23, 42, 0.5)",
                padding: "14px 18px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.8rem",
                color: "var(--text-muted)"
              }}>
                {hoveredCell ? (
                  <div>
                    <strong style={{ color: "var(--text-main)" }}>{hoveredCell.label} ({hoveredCell.perturbation > 0 ? `+${hoveredCell.perturbation}%` : `${hoveredCell.perturbation}%`})</strong>:{" "}
                    {hoveredCell.divergence_description} (Sensitivity: <span style={{ color: "#fbbf24", fontWeight: 700 }}>{hoveredCell.sensitivity_level}</span>)
                  </div>
                ) : (
                  <div>
                    Hover over any matrix cell to inspect exact future divergence mechanics.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
