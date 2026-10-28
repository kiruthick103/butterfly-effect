import React, { useState } from "react";
import { Sparkles, AlertTriangle, ShieldAlert, Send, HelpCircle, GitBranch, Compass } from "lucide-react";
import { api } from "../api/client";
import { ScenarioResult } from "../types";

interface ScenarioLabViewProps {
  currentMetrics?: any;
}

export const ScenarioLabView: React.FC<ScenarioLabViewProps> = ({ currentMetrics }) => {
  const [prompt, setPrompt] = useState<string>(
    "What if the perturbation was oriented purely along the z-axis instead of x?"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    "What if the perturbation was oriented purely along the z-axis instead of x?",
    "What if the Rayleigh number rho was increased to 45 (stronger thermal buoyancy)?",
    "What if the initial perturbation was reduced by another factor of 10x (down to 10^-7)?",
    "What happens if the system starts exactly on the origin saddle point?",
  ];

  const handleGenerate = async (queryText?: string) => {
    const activePrompt = queryText || prompt;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.generateScenario({
        prompt: activePrompt,
        numerical_context: currentMetrics || {
          initial_distance: 0.000001,
          final_distance: 7.82,
          model: "lorenz",
          time_to_threshold: 14.5,
        },
      });
      setScenario(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI scenario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title & Core Responsible AI Directive */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={22} color="#a78bfa" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>AI Scenario Lab</h2>
              <span className="badge-hypothesis">RESPONSIBLE EXPLORATION</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginTop: 6, maxWidth: 850 }}>
              Formulate speculative "what-if" hypotheses without violating physical reality. The AI is informed by{" "}
              <strong>actual verified numerical facts</strong> from the simulation engine, generating structured branching scenarios{" "}
              with explicit assumptions, uncertainties, and scientific limitations.
            </p>
          </div>

          <div style={{
            padding: "8px 14px",
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: 8,
            fontSize: "0.75rem",
            color: "#c4b5fd"
          }}>
            <div style={{ fontWeight: 600 }}>ARCHITECTURAL MANDATE</div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>AI explains hypotheses; physics computes truth.</div>
          </div>
        </div>
      </div>

      {/* Input Formulation Card */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
          Ask a Dynamical "What-If" Question
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            className="input-field"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. What if the perturbation was along the z-axis instead of x?"
            style={{ fontSize: "0.9rem", padding: "10px 14px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerate();
            }}
          />
          <button
            className="btn-primary"
            onClick={() => handleGenerate()}
            disabled={isLoading || !prompt.trim()}
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", minWidth: 160 }}
          >
            <Sparkles size={15} />
            <span>{isLoading ? "Reasoning..." : "Generate Hypotheses"}</span>
          </button>
        </div>

        {/* Quick Sample Questions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>Quick Scenarios:</span>
          {samplePrompts.map((q, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              onClick={() => {
                setPrompt(q);
                handleGenerate(q);
              }}
              style={{ padding: "3px 10px", fontSize: "0.72rem" }}
            >
              {q.substring(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 8, color: "#fca5a5", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Structured Scenario Output */}
      {scenario && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Scenario Banner */}
          <div style={{
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <span className="badge-hypothesis">
                  SPECULATIVE SCENARIO • AI GENERATED HYPOTHESIS
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 8 }}>
                  {scenario.scenario_title}
                </h3>
              </div>
              <span className="coord-pill" style={{ color: "#c4b5fd" }}>
                Provider: {scenario.ai_provider}
              </span>
            </div>
          </div>

          {/* Assumptions Box */}
          {scenario.assumptions && scenario.assumptions.length > 0 && (
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#38bdf8", marginBottom: 8, textTransform: "uppercase" }}>
                Underlying Physical Assumptions
              </div>
              <ul style={{ paddingLeft: 20, fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {scenario.assumptions.map((asm, i) => (
                  <li key={i}>{asm}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hypothesized Causal Branches */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 16 }}>
            {scenario.branches.map((b) => (
              <div
                key={b.id}
                className="glass-panel"
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderLeft: "4px solid #a78bfa"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(139, 92, 246, 0.2)",
                      color: "#c4b5fd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem"
                    }}>
                      {b.id}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Branch {b.id}</span>
                  </div>
                  <span className="coord-pill" style={{ textTransform: "uppercase", fontSize: "0.7rem", color: "#fbbf24" }}>
                    Horizon: {b.time_horizon}
                  </span>
                </div>

                {/* Trigger */}
                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "8px 12px", borderRadius: 6, fontSize: "0.82rem", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ color: "#38bdf8" }}>Hypothetical Trigger: </strong>
                  {b.trigger}
                </div>

                {/* Downstream Effects */}
                <div>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                    Conjectured Phase-Space Consequences:
                  </div>
                  <ul style={{ paddingLeft: 18, fontSize: "0.82rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                    {b.effects.map((eff, i) => (
                      <li key={i}>{eff}</li>
                    ))}
                  </ul>
                </div>

                {/* Epistemic Uncertainties */}
                <div style={{
                  marginTop: "auto",
                  padding: "8px 12px",
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  borderRadius: 6,
                  fontSize: "0.76rem",
                  color: "#fde68a"
                }}>
                  <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    <AlertTriangle size={12} />
                    <span>Identified Uncertainties</span>
                  </div>
                  {b.uncertainties.map((u, i) => (
                    <div key={i}>• {u}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Epistemic Limitations */}
          {scenario.limitations && scenario.limitations.length > 0 && (
            <div style={{
              padding: "14px 18px",
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              color: "var(--text-dim)",
              lineHeight: 1.5
            }}>
              <strong style={{ color: "#94a3b8" }}>Scientific Boundaries & AI Limitations: </strong>
              {scenario.limitations.join(" ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
