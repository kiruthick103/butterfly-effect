import React, { useState } from "react";
import { FailureMode } from "../types";
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface FailureSimulationViewProps {
  failureModes: FailureMode[];
  scenarioTitle?: string;
}

export const FailureSimulationView: React.FC<FailureSimulationViewProps> = ({
  failureModes,
  scenarioTitle = "Scenario"
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!failureModes || failureModes.length === 0) {
    return null;
  }

  const activeMode = failureModes[selectedIdx] || failureModes[0];

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.4)", text: "CRITICAL FAILURE" };
      case "HIGH":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.4)", text: "HIGH SEVERITY" };
      default:
        return { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.4)", text: "MODERATE RISK" };
    }
  };

  const badge = getSeverityBadge(activeMode.severity);

  return (
    <div className="glass-panel" style={{ padding: "24px 28px", marginBottom: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "rgba(239, 68, 68, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(239, 68, 68, 0.35)"
            }}>
              <Flame size={16} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
              FAILURE MODE SIMULATION & CASCADING COLLAPSE ANALYSIS
            </h2>
            <span className="provenance-tag computed" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}>
              FAULT TREE SUBSYSTEM
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Deep causal failure modeling: identifies first point of failure, non-linear cascade sequence, amplifying variables, and preventative interventions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {failureModes.map((m, idx) => (
            <button
              key={m.id || idx}
              onClick={() => setSelectedIdx(idx)}
              className={`btn-secondary ${selectedIdx === idx ? "active" : ""}`}
              style={{
                fontSize: "0.78rem",
                padding: "6px 12px",
                borderColor: selectedIdx === idx ? "#ef4444" : "var(--border-subtle)",
                color: selectedIdx === idx ? "#ef4444" : "var(--text-muted)",
                background: selectedIdx === idx ? "rgba(239, 68, 68, 0.1)" : undefined
              }}
            >
              Mode {idx + 1}: {m.name.length > 25 ? m.name.substring(0, 22) + "..." : m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Failure Mode Card */}
      <div style={{
        background: "rgba(10, 15, 29, 0.7)",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${badge.border}`,
        padding: "20px 24px"
      }}>
        {/* Title Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 4,
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              fontFamily: "var(--font-mono)"
            }}>
              {badge.text}
            </span>
            <h3 style={{ fontSize: "1.08rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
              {activeMode.name}
            </h3>
          </div>

          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            TRIGGER: <span style={{ color: "#f59e0b" }}>{activeMode.trigger_condition}</span>
          </div>
        </div>

        {/* 7 Questions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          {/* Question 1: What fails first? */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#ef4444", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: 5 }}>
              <Zap size={12} color="#ef4444" />
              1. What Fails First? (First Point of Failure)
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500, lineHeight: 1.4 }}>
              {activeMode.first_failure}
            </p>
          </div>

          {/* Question 2: Why does it fail? */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#f59e0b", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: 5 }}>
              <HelpCircle size={12} color="#f59e0b" />
              2. Why Does It Fail? (Root Cause Mechanism)
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              {activeMode.root_cause}
            </p>
          </div>

          {/* Question 5: Amplifying Variables */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#c084fc", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={12} color="#c084fc" />
              3. Amplifying Variables (Damage Multipliers)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {activeMode.amplifying_variables && activeMode.amplifying_variables.length > 0 ? (
                activeMode.amplifying_variables.map((v, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.74rem",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(192, 132, 252, 0.12)",
                      border: "1px solid rgba(192, 132, 252, 0.3)",
                      color: "#c084fc",
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    {v}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Operational load & capacity buffer</span>
              )}
            </div>
          </div>
        </div>

        {/* Question 4: What happens next? (Cascade Sequence) */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={13} color="#38bdf8" />
            4. Cascading Failure Chain (What Happens Next?)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {activeMode.cascade_steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.015)",
                  borderRadius: 6,
                  borderLeft: `3px solid ${idx === 0 ? "#ef4444" : idx === activeMode.cascade_steps.length - 1 ? "#dc2626" : "#f59e0b"}`
                }}
              >
                <div style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  color: "#ef4444",
                  padding: "2px 6px",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: 4,
                  minWidth: 26,
                  textAlign: "center"
                }}>
                  0{idx + 1}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question 6: What can prevent or limit failure? (Mitigation) */}
        <div style={{
          padding: "14px 18px",
          borderRadius: 6,
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px"
        }}>
          <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "3px" }}>
              5. Preventative Mitigation & Recovery Intervention
            </div>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-main)", lineHeight: 1.45 }}>
              {activeMode.mitigation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
