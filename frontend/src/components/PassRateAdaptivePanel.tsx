import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import { PassRateMetrics, AdaptiveNextScenario } from "../types";

interface PassRateAdaptivePanelProps {
  passMetrics?: PassRateMetrics;
  nextScenarios?: AdaptiveNextScenario[];
  onRunNextScenario: (modifiedVars: Record<string, number>, title: string) => void;
  isSynthesizing: boolean;
}

export const PassRateAdaptivePanel: React.FC<PassRateAdaptivePanelProps> = ({
  passMetrics,
  nextScenarios,
  onRunNextScenario,
  isSynthesizing
}) => {
  if (!passMetrics) return null;

  const passRate = passMetrics.pass_rate_pct;
  const failureRate = passMetrics.failure_rate_pct;
  const criticalRate = passMetrics.critical_failure_rate_pct;
  const [ciLow, ciHigh] = passMetrics.confidence_interval_95 || [0, 0];

  // Determine badge color for pass rate
  const passColor =
    passRate >= 75 ? "#10b981" : passRate >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* 1. REAL PASS-RATE TELEMETRY OBSERVATORY */}
      <div
        className="glass-panel"
        style={{
          padding: "24px 28px",
          marginBottom: "20px",
          borderLeft: `4px solid ${passColor}`
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                PASS-RATE ENGINE & SYSTEM RESILIENCE
              </h2>
              <span className="provenance-tag computed">SIMULATION OBSERVER</span>
            </div>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.82rem",
                color: "var(--text-muted)"
              }}
            >
              Calculated from {passMetrics.total_trials.toLocaleString()} empirical Monte Carlo trials with Wilson 95% Confidence Interval
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                background: "rgba(15, 23, 42, 0.6)",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)"
              }}
            >
              TRIALS: {passMetrics.successful_trials} PASS / {passMetrics.failed_trials} FAIL
            </span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "18px"
          }}
        >
          {/* Card 1: Pass Rate */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(16, 185, 129, 0.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                SIMULATION PASS RATE
              </span>
              <CheckCircle2 size={16} color={passColor} />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: passColor, fontFamily: "var(--font-mono)" }}>
              {passRate}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "4px" }}>
              95% CI: [{ciLow}% – {ciHigh}%]
            </div>
          </div>

          {/* Card 2: Failure Rate */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(245, 158, 11, 0.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                TOTAL FAILURE RATE
              </span>
              <AlertTriangle size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", fontFamily: "var(--font-mono)" }}>
              {failureRate}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "4px" }}>
              Adverse & degraded branches
            </div>
          </div>

          {/* Card 3: Critical Cascading Risk */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(239, 68, 68, 0.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                CRITICAL COLLAPSE RATE
              </span>
              <Flame size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ef4444", fontFamily: "var(--font-mono)" }}>
              {criticalRate}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "4px" }}>
              Bifurcation into cascading failure
            </div>
          </div>

          {/* Card 4: Utilization & Recovery */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                RESOURCE UTILIZATION
              </span>
              <Cpu size={16} color="var(--accent-baseline)" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>
              {passMetrics.resource_utilization_pct}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "4px" }}>
              Recovery potential: {passMetrics.recovery_rate_pct}%
            </div>
          </div>
        </div>

        {/* Primary Bottleneck Callout */}
        <div
          style={{
            background: "rgba(2, 132, 199, 0.08)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={18} color="var(--accent-baseline)" />
            <div>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                ACTIVE SYSTEM BOTTLENECK:
              </span>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
                {passMetrics.primary_bottleneck}
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono)",
              color: "var(--accent-baseline)",
              background: "rgba(6, 182, 212, 0.15)",
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            ADAPTIVE TARGET ENGINE ACTIVE
          </span>
        </div>
      </div>

      {/* 2. ADAPTIVE NEXT SCENARIOS (GENERATED FROM RESULTS) */}
      {nextScenarios && nextScenarios.length > 0 && (
        <div className="glass-panel" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  ADAPTIVE NEXT EXPERIMENTS
                </h3>
                <span className="provenance-tag computed">AI GENERATED FROM RESULTS</span>
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Generated dynamically from current {passRate}% pass rate and failure bottlenecks
              </p>
            </div>

            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
              {nextScenarios.length} HYPOTHESES READY
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "14px"
            }}
          >
            {nextScenarios.map((ns) => {
              // Badge type colors
              const isStress = ns.type.includes("Stress");
              const isBoundary = ns.type.includes("Boundary");
              const isRecovery = ns.type.includes("Recovery") || ns.type.includes("Improvement");
              const isCascade = ns.type.includes("Cascade") || ns.type.includes("Injection");

              const badgeColor = isRecovery ? "#10b981" : isBoundary ? "#38bdf8" : isStress ? "#f59e0b" : "#ef4444";

              return (
                <div
                  key={ns.id}
                  style={{
                    background: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: badgeColor,
                          background: `${badgeColor}18`,
                          border: `1px solid ${badgeColor}40`,
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {ns.type}
                      </span>

                      <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "#10b981", fontWeight: 600 }}>
                        {ns.projected_pass_rate_shift}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "0.92rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-main)" }}>
                      {ns.title}
                    </h4>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                      {ns.description}
                    </p>

                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        fontSize: "0.74rem",
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      <strong style={{ color: "var(--accent-baseline)" }}>Hypothesis:</strong> {ns.hypothesis}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSynthesizing}
                    onClick={() => onRunNextScenario(ns.modified_variables, ns.title)}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "0.82rem",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${badgeColor}33, ${badgeColor}66)`,
                      borderColor: badgeColor,
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    <Zap size={14} />
                    <span>Run Experiment →</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
