import React, { useState, useEffect } from "react";
import { X, History, RotateCcw, GitCompare, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../api/client";
import { ExperimentRecord } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExperiment: (exp: ExperimentRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadExperiment,
}) => {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [replayResult, setReplayResult] = useState<any | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState<any | null>(null);

  const fetchExperiments = async () => {
    setIsLoading(true);
    try {
      const data = await api.listExperiments();
      setExperiments(data);
    } catch (err) {
      console.error("Failed to list experiments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExperiments();
      setReplayResult(null);
      setCompareResult(null);
      setSelectedForCompare([]);
    }
  }, [isOpen]);

  const handleReplay = async (id: string) => {
    try {
      const res = await api.replayExperiment(id);
      setReplayResult(res);
    } catch (err: any) {
      alert(`Replay error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experiment?")) return;
    try {
      await api.deleteExperiment(id);
      fetchExperiments();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleToggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedForCompare.length !== 2) return;
    try {
      const res = await api.compareExperiments(selectedForCompare[0], selectedForCompare[1]);
      setCompareResult(res);
    } catch (err: any) {
      alert(`Comparison error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(3, 7, 18, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: 960,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.7)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 22px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <History size={20} color="#38bdf8" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Experiment History, Replay & Comparator</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: "4px 8px" }}>
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Replay Result Banner */}
          {replayResult && (
            <div style={{
              padding: "12px 16px",
              background: replayResult.difference_detected ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
              border: `1px solid ${replayResult.difference_detected ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
              borderRadius: 8,
              fontSize: "0.82rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: replayResult.difference_detected ? "#fbbf24" : "#10b981", marginBottom: 4 }}>
                {replayResult.difference_detected ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                <span>{replayResult.difference_detected ? "NUMERICAL DRIFT DETECTED" : "BIT-LEVEL REPRODUCIBILITY CONFIRMED"}</span>
              </div>
              <div>Original Final Distance: {replayResult.original_metrics?.final_distance}</div>
              <div>Current Replay Final Distance: {replayResult.current_metrics?.final_distance}</div>
              <div className="mono" style={{ color: "var(--text-dim)", marginTop: 2 }}>
                Max Metric Drift: {replayResult.max_metric_drift}
              </div>
            </div>
          )}

          {/* Comparison Result Banner */}
          {compareResult && (
            <div style={{
              padding: "14px 18px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: 8,
              fontSize: "0.82rem"
            }}>
              <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: 8 }}>
                Side-by-Side Comparison: {compareResult.experiment_a.title} vs {compareResult.experiment_b.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <strong>{compareResult.experiment_a.title}:</strong>
                  <div>Initial Distance: {compareResult.experiment_a.latest_metrics?.initial_distance}</div>
                  <div>Final Distance: {compareResult.experiment_a.latest_metrics?.final_distance}</div>
                </div>
                <div>
                  <strong>{compareResult.experiment_b.title}:</strong>
                  <div>Initial Distance: {compareResult.experiment_b.latest_metrics?.initial_distance}</div>
                  <div>Final Distance: {compareResult.experiment_b.latest_metrics?.final_distance}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, color: "#fbbf24" }}>
                Final Distance Delta: {compareResult.metrics_comparison?.final_distance_delta}
              </div>
            </div>
          )}

          {/* Compare Action Button */}
          {selectedForCompare.length === 2 && (
            <button className="btn-primary" onClick={handleRunComparison}>
              <GitCompare size={15} />
              <span>Compare Selected 2 Experiments</span>
            </button>
          )}

          {/* Experiments List */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)" }}>
              Loading experiments...
            </div>
          ) : experiments.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)" }}>
              No experiments saved yet. Run a simulation in the Chaos Lab and click "Save to History".
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {experiments.map((exp) => {
                const isSelected = selectedForCompare.includes(exp.id);

                return (
                  <div
                    key={exp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: isSelected ? "rgba(56, 189, 248, 0.12)" : "rgba(15, 23, 42, 0.6)",
                      border: isSelected ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{exp.title}</span>
                        <span className="coord-pill" style={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                          {exp.model}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", marginTop: 2 }}>
                        Perturbation: [{exp.perturbation.map((v) => v.toFixed(6)).join(", ")}] • {new Date(exp.created_at).toLocaleDateString()}
                      </div>
                      {exp.latest_metrics && (
                        <div className="mono" style={{ fontSize: "0.74rem", color: "#38bdf8", marginTop: 2 }}>
                          D₀: {exp.latest_metrics.initial_distance} | D(T): {exp.latest_metrics.final_distance}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        className={`btn-secondary ${isSelected ? "active" : ""}`}
                        onClick={() => handleToggleCompare(exp.id)}
                        style={{ padding: "5px 10px", fontSize: "0.72rem" }}
                        title="Select for side-by-side comparison"
                      >
                        <GitCompare size={13} />
                        <span>{isSelected ? "Selected" : "Compare"}</span>
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => handleReplay(exp.id)}
                        style={{ padding: "5px 10px", fontSize: "0.72rem" }}
                        title="Replay from original configuration"
                      >
                        <RotateCcw size={13} />
                        <span>Replay</span>
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => {
                          onLoadExperiment(exp);
                          onClose();
                        }}
                        style={{ padding: "5px 10px", fontSize: "0.72rem" }}
                      >
                        Load
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => handleDelete(exp.id)}
                        style={{ padding: "5px 8px", color: "#f87171" }}
                        title="Delete experiment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
