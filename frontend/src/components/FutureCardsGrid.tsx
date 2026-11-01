import React, { useState } from "react";
import { FutureOutcome } from "../types";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Activity,
  Compass,
  Sparkles
} from "lucide-react";

interface FutureCardsGridProps {
  futures: FutureOutcome[];
  selectedFutureId: string | null;
  onSelectFuture: (futureId: string) => void;
  onTestDecision?: (future: FutureOutcome) => void;
  onSelectNextScenario?: (nextScenarioText: string) => void;
}

export const FutureCardsGrid: React.FC<FutureCardsGridProps> = ({
  futures,
  selectedFutureId,
  onSelectFuture,
  onTestDecision,
  onSelectNextScenario
}) => {
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});

  if (!futures || futures.length === 0) return null;

  const toggleSub = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBranchBadge = (category: string | undefined, index: number) => {
    if (category === "favorable" || index === 0) {
      return {
        label: "FAVORABLE / RECOVERABLE",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.3)"
      };
    } else if (category === "nominal" || index === 1) {
      return {
        label: "REALISTIC ALTERNATIVE / STRAINED",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.12)",
        border: "rgba(56, 189, 248, 0.3)"
      };
    } else {
      return {
        label: "ADVERSE / CASCADING RISK",
        color: "#fb7185",
        bg: "rgba(244, 63, 94, 0.12)",
        border: "rgba(244, 63, 94, 0.3)"
      };
    }
  };

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--accent-baseline)", letterSpacing: "0.06em", fontWeight: 700 }}>
            THREE NEXT-FUTURE SCENARIOS
          </span>
          <span className="badge-hypothesis">EMPIRICAL FORECAST</span>
        </div>
        <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          QUALIFIED LIKELIHOOD RATINGS
        </span>
      </div>

      {/* 3-Column Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "18px"
      }}>
        {futures.slice(0, 3).map((future, idx) => {
          const isSelected = selectedFutureId === future.id;
          const badge = getBranchBadge(future.category, idx);
          const isExpanded = !!expandedSubs[future.id];
          const subScenarios = future.sub_scenarios || (future.sub_scenario ? [future.sub_scenario] : []);
          const nextScenarioContent = future.next_scenario || future.what_happens_after || "Proceed to downstream operational verification and subsequent milestone triage.";

          return (
            <div
              key={future.id}
              onClick={() => onSelectFuture(future.id)}
              className="glass-panel"
              style={{
                padding: "22px 20px",
                borderRadius: "var(--radius-md)",
                border: isSelected ? `2px solid ${badge.color}` : "1px solid var(--border-subtle)",
                boxShadow: isSelected ? `0 0 24px ${badge.color}33` : "none",
                background: isSelected ? "rgba(15, 23, 42, 0.92)" : "rgba(15, 23, 42, 0.72)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                {/* Top Badge & Likelihood Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 9px",
                    borderRadius: "4px",
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>
                    {badge.label}
                  </span>

                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: badge.color,
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1
                    }}>
                      {future.score_percentage}%
                    </div>
                    <span style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600
                    }}>
                      {future.likelihood_label || "Plausible"}
                    </span>
                  </div>
                </div>

                {/* A. Future Title */}
                <h3 style={{
                  fontSize: "1.08rem",
                  fontWeight: 700,
                  margin: "0 0 12px 0",
                  color: "var(--text-main)",
                  lineHeight: 1.35
                }}>
                  {future.title}
                </h3>

                {/* B. What happens next? */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <ArrowRight size={13} color="var(--accent-baseline)" />
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "var(--text-dim)" }}>
                      What happens next?
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.45 }}>
                    {future.what_happens_next || future.expected_result}
                  </p>
                </div>

                {/* C. Why could this happen? */}
                {future.why_this_happens && (
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Activity size={13} color="var(--text-dim)" />
                      <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "var(--text-dim)" }}>
                        Why could this happen?
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                      {future.why_this_happens}
                    </p>
                  </div>
                )}

                {/* D. Potential Impact */}
                {future.potential_impact && (
                  <div style={{
                    marginBottom: "14px",
                    padding: "8px 11px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(30, 41, 59, 0.55)",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6
                  }}>
                    <Clock size={14} color="var(--accent-baseline)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "var(--text-main)" }}>Impact: </strong>
                      {future.potential_impact}
                    </div>
                  </div>
                )}

                {/* E. Recommended Action */}
                {future.recommended_action && (
                  <div style={{
                    marginBottom: "14px",
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(14, 165, 233, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    fontSize: "0.82rem",
                    color: "var(--text-main)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <Zap size={13} color="#38bdf8" />
                      <span style={{ fontWeight: 700, color: "#38bdf8", fontSize: "0.72rem", textTransform: "uppercase" }}>
                        Recommended action right now
                      </span>
                    </div>
                    <div style={{ color: "#e0f2fe" }}>{future.recommended_action}</div>
                  </div>
                )}

                {/* F. NEXT SCENARIO IN ALL BOXES (Consequence of this branch) */}
                <div style={{
                  marginBottom: "14px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(8, 12, 20, 0.85)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={13} color="#38bdf8" />
                      <span style={{ fontSize: "0.73rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "#38bdf8" }}>
                        Next Scenario / What Happens Next:
                      </span>
                    </div>
                    <span style={{
                      fontSize: "0.66rem",
                      color: "#94a3b8",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      background: "rgba(255, 255, 255, 0.08)",
                      padding: "1px 6px",
                      borderRadius: 3
                    }}>
                      STAGE 2
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "0.84rem", color: "#f8fafc", lineHeight: 1.45, fontWeight: 500 }}>
                    {nextScenarioContent}
                  </p>

                  {onSelectNextScenario && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNextScenario(nextScenarioContent);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(6, 182, 212, 0.15)",
                        border: "1px solid rgba(6, 182, 212, 0.4)",
                        borderRadius: 6,
                        color: "#38bdf8",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        alignSelf: "flex-start",
                        transition: "all 0.15s ease",
                        marginTop: 4
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6, 182, 212, 0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)")}
                    >
                      <Sparkles size={12} />
                      <span>Simulate this next scenario</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                {/* G. View Sub-Scenarios */}
                {subScenarios.length > 0 && (
                  <div style={{ marginTop: 10, borderTop: "1px solid rgba(148, 163, 184, 0.12)", paddingTop: 10 }}>
                    <button
                      type="button"
                      onClick={(e) => toggleSub(future.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "4px 0",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-muted)"
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Compass size={13} color="var(--accent-baseline)" />
                        View sub-scenarios ({subScenarios.length})
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                        {subScenarios.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              padding: "10px 12px",
                              background: "rgba(30, 41, 59, 0.7)",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid rgba(148, 163, 184, 0.18)",
                              fontSize: "0.79rem"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                {sub.title}
                              </span>
                              <span style={{
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                fontFamily: "var(--font-mono)",
                                background: "rgba(56, 189, 248, 0.15)",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                                color: "#38bdf8"
                              }}>
                                {sub.effect_percentage}% effect
                              </span>
                            </div>
                            <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>
                              <strong style={{ color: "var(--text-dim)" }}>Trigger: </strong>
                              {sub.trigger_event}
                            </div>
                            <div style={{ color: "#e2e8f0" }}>
                              <strong style={{ color: "var(--text-dim)" }}>Consequence: </strong>
                              {sub.consequence}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* H. Interactive Decision Trigger: "Test this decision path" */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(148, 163, 184, 0.12)" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTestDecision) onTestDecision(future);
                  }}
                  className="btn-secondary"
                  style={{
                    width: "100%",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <span>Test this decision path</span>
                  <ArrowRight size={13} color="var(--accent-baseline)" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
