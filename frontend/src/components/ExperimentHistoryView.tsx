import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { ExperimentHistoryItem } from "../types";
import { History, RotateCcw, Trash2, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface ExperimentHistoryViewProps {
  onReplayExperiment?: (exp: ExperimentHistoryItem) => void;
}

export const ExperimentHistoryView: React.FC<ExperimentHistoryViewProps> = ({
  onReplayExperiment
}) => {
  const [history, setHistory] = useState<ExperimentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExperimentHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load experiment history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteScenarioExperiment(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete experiment:", err);
    }
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div className="glass-panel" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>EXPERIMENT HISTORY & REPLAY</h2>
              <span className="provenance-tag computed">REPRODUCIBLE SCENARIOS</span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Saved scenario runs, what-if perturbation branches, and measured Butterfly Effect sensitivity records
            </p>
          </div>

          <button onClick={fetchHistory} className="btn-secondary" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
            ↻ Refresh Log
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading historical experiment records...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No experiments saved yet. Run your first scenario synthesis!
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {history.map((item) => {
              const isWhatIf = !!item.whatif_applied;
              const bLevel = item.butterfly_effect?.level || "BASELINE";
              const levelColor = bLevel === "HIGH" || bLevel === "EXTREME" ? "#f43f5e" : bLevel === "MODERATE" ? "#fbbf24" : "var(--accent-baseline)";

              return (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: "18px 20px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    {/* Top Row: Title, Badge & Delete */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <h4 style={{ fontSize: "0.96rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                          {item.title}
                        </h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          background: `${levelColor}15`,
                          color: levelColor,
                          border: `1px solid ${levelColor}40`
                        }}>
                          {bLevel}
                        </span>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="btn-secondary"
                          style={{ padding: "3px 6px", fontSize: "0.7rem", color: "#f43f5e" }}
                          title="Delete record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Scenario Description snippet */}
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "12px" }}>
                      {item.scenario_description}
                    </p>

                    {/* What-If Tag if applied */}
                    {isWhatIf && item.whatif_applied && (
                      <div style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        fontSize: "0.74rem",
                        fontFamily: "var(--font-mono)",
                        marginBottom: "12px",
                        borderLeft: "2px solid #f43f5e"
                      }}>
                        Perturbation: <strong>{item.whatif_applied.variable}</strong> ({item.whatif_applied.old_value} → {item.whatif_applied.new_value}) • Change: {item.whatif_applied.change_pct}%
                      </div>
                    )}

                    {/* Future Probability Summary */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                        Outcome Distribution:
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "0.76rem", fontFamily: "var(--font-mono)" }}>
                        {Object.entries(item.futures_summary || {}).map(([fname, pct]) => (
                          <span key={fname} style={{ background: "rgba(15, 23, 42, 0.8)", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(148, 163, 184, 0.15)" }}>
                            {fname}: <strong>{pct}%</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Replay Action */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                      {item.uncertainty}
                    </span>
                    {onReplayExperiment && (
                      <button
                        onClick={() => onReplayExperiment(item)}
                        className="btn-primary"
                        style={{ fontSize: "0.75rem", padding: "4px 12px" }}
                      >
                        <RotateCcw size={12} />
                        <span>Replay Scenario</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
