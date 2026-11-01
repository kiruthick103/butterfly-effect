import React from "react";
import { FutureOutcome } from "../types";

interface FutureTreeProps {
  futures: FutureOutcome[];
  selectedFutureId: string | null;
  onSelectFuture: (futureId: string) => void;
  scenarioTitle?: string;
}

export const FutureTree: React.FC<FutureTreeProps> = ({
  futures,
  selectedFutureId,
  onSelectFuture,
  scenarioTitle = "Current Situation"
}) => {
  if (!futures || futures.length === 0) return null;

  const f1 = futures[0] || { id: "branch_1", score_percentage: 97, likelihood_label: "High Probability", title: "Optimal Recovery" };
  const f2 = futures[1] || { id: "branch_2", score_percentage: 2, likelihood_label: "Low Probability", title: "Compromised Route" };
  const f3 = futures[2] || { id: "branch_3", score_percentage: 1, likelihood_label: "Critical Risk", title: "Severe Lockout" };

  const selectedFuture = futures.find(f => f.id === selectedFutureId) || f1;

  const width = 1000;
  const height = 300;
  const originX = 500;
  const originY = 65;

  const b1X = 310;
  const b1Y = 240;

  const b2X = 500;
  const b2Y = 240;

  const b3X = 690;
  const b3Y = 240;

  const isB1Selected = selectedFuture.id === f1.id;
  const isB2Selected = selectedFuture.id === f2.id;
  const isB3Selected = selectedFuture.id === f3.id;

  return (
    <div
      style={{
        maxWidth: 1600,
        margin: "0 auto 24px auto",
        background: "rgba(11, 17, 32, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        position: "relative"
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2
              style={{
                fontSize: "1.02rem",
                fontWeight: 700,
                color: "#f8fafc",
                letterSpacing: "0.02em",
                margin: 0
              }}
            >
              POSSIBLE FUTURES: BRANCHING TRAJECTORY TREE
            </h2>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: "2px 8px",
                borderRadius: 4
              }}
            >
              DYNAMIC SCENARIO FORKS
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "4px 0 0 0" }}>
            Click any branch to inspect underlying drivers, operational risks, and milestone progression
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: "0.76rem" }}>
          <div
            onClick={() => onSelectFuture(f1.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.7)"
              }}
            />
            <span style={{ color: "#34d399", fontWeight: 600 }}>Low Risk</span>
          </div>

          <div
            onClick={() => onSelectFuture(f2.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.7)"
              }}
            />
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>Moderate / Overload</span>
          </div>

          <div
            onClick={() => onSelectFuture(f3.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f43f5e",
                boxShadow: "0 0 8px rgba(244, 63, 94, 0.7)"
              }}
            />
            <span style={{ color: "#fb7185", fontWeight: 600 }}>Critical Failure</span>
          </div>
        </div>
      </div>

      {/* SVG Tree Graph */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            minWidth: 700
          }}
        >
          <defs>
            <linearGradient id="greenRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* BRANCH 1: Ribbon and Glowing Trajectory */}
          <g
            onClick={() => onSelectFuture(f1.id)}
            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          >
            {/* Smooth Ribbon Area */}
            <path
              d={`M ${originX - 4} ${originY + 6} C 460 110, 350 170, ${b1X - 25} ${b1Y} L ${b1X + 25} ${b1Y} C 380 170, 480 110, ${originX + 4} ${originY + 6} Z`}
              fill="url(#greenRibbonGrad)"
              opacity={isB1Selected ? 0.95 : 0.6}
            />
            {/* Glow Underlay */}
            <path
              d={`M ${originX} ${originY} C 460 110, 350 170, ${b1X} ${b1Y}`}
              fill="none"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth={isB1Selected ? 10 : 7}
              strokeLinecap="round"
            />
            {/* Core Line */}
            <path
              d={`M ${originX} ${originY} C 460 110, 350 170, ${b1X} ${b1Y}`}
              fill="none"
              stroke="#34d399"
              strokeWidth={isB1Selected ? 4 : 3}
              strokeLinecap="round"
            />
          </g>

          {/* BRANCH 2: Moderate Amber Trajectory (Always 100% visible & reliably rendered) */}
          <g
            onClick={() => onSelectFuture(f2.id)}
            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          >
            {/* Glow Underlay */}
            <path
              d={`M ${originX} ${originY + 6} C 508 120, 492 180, ${b2X} ${b2Y}`}
              fill="none"
              stroke="rgba(245, 158, 11, 0.3)"
              strokeWidth={isB2Selected ? 10 : 6}
              strokeLinecap="round"
            />
            {/* Core Amber Line */}
            <path
              d={`M ${originX} ${originY + 6} C 508 120, 492 180, ${b2X} ${b2Y}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={isB2Selected ? 4 : 3}
              strokeLinecap="round"
            />
          </g>

          {/* BRANCH 3: Critical Red Dashed Trajectory */}
          <g
            onClick={() => onSelectFuture(f3.id)}
            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          >
            {/* Glow Underlay */}
            <path
              d={`M ${originX} ${originY + 6} C 540 110, 650 170, ${b3X} ${b3Y}`}
              fill="none"
              stroke="rgba(244, 63, 94, 0.25)"
              strokeWidth={isB3Selected ? 9 : 6}
              strokeLinecap="round"
            />
            {/* Core Dashed Line */}
            <path
              d={`M ${originX} ${originY + 6} C 540 110, 650 170, ${b3X} ${b3Y}`}
              fill="none"
              stroke="#fb7185"
              strokeWidth={isB3Selected ? 3.5 : 2.5}
              strokeDasharray="7 5"
              strokeLinecap="round"
            />
          </g>

          {/* TOP CENTER: Origin Node (CURRENT STATE) */}
          <g>
            <text
              x={originX}
              y={originY - 26}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="14"
              fontWeight="700"
              letterSpacing="0.08em"
              style={{ textTransform: "uppercase" }}
            >
              CURRENT STATE (NOW)
            </text>

            <circle
              cx={originX}
              cy={originY}
              r="18"
              fill="rgba(6, 182, 212, 0.12)"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />
            <circle
              cx={originX}
              cy={originY}
              r="10"
              fill="#080c14"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <circle
              cx={originX}
              cy={originY}
              r="4.5"
              fill="#38bdf8"
            />
          </g>

          {/* BRANCH 1 PILL BUTTON (Low Risk) */}
          <g
            onClick={() => onSelectFuture(f1.id)}
            style={{ cursor: "pointer" }}
          >
            {isB1Selected && (
              <rect
                x={b1X - 44}
                y={b1Y - 18}
                width="88"
                height="36"
                rx="18"
                ry="18"
                fill="none"
                stroke="rgba(52, 211, 153, 0.4)"
                strokeWidth="2"
              />
            )}
            <rect
              x={b1X - 40}
              y={b1Y - 16}
              width="80"
              height="32"
              rx="16"
              ry="16"
              fill="rgba(8, 12, 20, 0.95)"
              stroke="#10b981"
              strokeWidth="2"
            />
            <text
              x={b1X}
              y={b1Y + 5}
              textAnchor="middle"
              fill="#34d399"
              fontSize="14"
              fontWeight="700"
              letterSpacing="0.02em"
            >
              {f1.score_percentage}%
            </text>
          </g>

          {/* BRANCH 2 PILL BUTTON (Moderate) */}
          <g
            onClick={() => onSelectFuture(f2.id)}
            style={{ cursor: "pointer" }}
          >
            {isB2Selected && (
              <rect
                x={b2X - 44}
                y={b2Y - 18}
                width="88"
                height="36"
                rx="18"
                ry="18"
                fill="none"
                stroke="rgba(251, 191, 36, 0.4)"
                strokeWidth="2"
              />
            )}
            <rect
              x={b2X - 40}
              y={b2Y - 16}
              width="80"
              height="32"
              rx="16"
              ry="16"
              fill="rgba(8, 12, 20, 0.95)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <text
              x={b2X}
              y={b2Y + 5}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="14"
              fontWeight="700"
              letterSpacing="0.02em"
            >
              {f2.score_percentage}%
            </text>
          </g>

          {/* BRANCH 3 PILL BUTTON (Critical) */}
          <g
            onClick={() => onSelectFuture(f3.id)}
            style={{ cursor: "pointer" }}
          >
            {isB3Selected && (
              <rect
                x={b3X - 44}
                y={b3Y - 18}
                width="88"
                height="36"
                rx="18"
                ry="18"
                fill="none"
                stroke="rgba(251, 113, 133, 0.4)"
                strokeWidth="2"
              />
            )}
            <rect
              x={b3X - 40}
              y={b3Y - 16}
              width="80"
              height="32"
              rx="16"
              ry="16"
              fill="rgba(8, 12, 20, 0.95)"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <text
              x={b3X}
              y={b3Y + 5}
              textAnchor="middle"
              fill="#fb7185"
              fontSize="14"
              fontWeight="700"
              letterSpacing="0.02em"
            >
              {f3.score_percentage}%
            </text>
          </g>
        </svg>
      </div>

      {/* Quick Active Branch Bar */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 8,
          background: "rgba(15, 23, 42, 0.7)",
          border: `1px solid ${
            isB1Selected
              ? "rgba(16, 185, 129, 0.35)"
              : isB2Selected
              ? "rgba(245, 158, 11, 0.35)"
              : "rgba(244, 63, 94, 0.35)"
          }`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.74rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: isB1Selected ? "#34d399" : isB2Selected ? "#fbbf24" : "#fb7185"
            }}
          >
            {isB1Selected ? "Branch 1: Optimal Route" : isB2Selected ? "Branch 2: Alternative Route" : "Branch 3: Critical Risk"}
          </span>
          <span style={{ color: "rgba(148, 163, 184, 0.3)" }}>|</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f8fafc" }}>
            {selectedFuture.title}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.08)",
              color: "#94a3b8",
              fontFamily: "var(--font-mono)"
            }}
          >
            {selectedFuture.likelihood_label} ({selectedFuture.score_percentage}%)
          </span>
        </div>

        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
          Scroll down for causal drivers, sub-scenarios & decision impacts ↓
        </span>
      </div>
    </div>
  );
};
