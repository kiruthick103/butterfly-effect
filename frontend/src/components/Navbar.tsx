import React from "react";
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  History,
  Download,
  ShieldCheck,
  Flame,
  Radio
} from "lucide-react";

export type LabTab =
  | "chaos-lab"
  | "microscope"
  | "heatmap"
  | "bifurcation"
  | "scenario-lab"
  | "evidence-ledger"
  | "lessons";

interface NavbarProps {
  currentTab: LabTab;
  onSelectTab: (tab: LabTab) => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHistory,
  onOpenExport,
  isSimulating
}) => {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(8, 12, 20, 0.88)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "0 24px"
    }}>
      <div style={{
        maxWidth: 1600,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64
      }}>
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(6, 182, 212, 0.35)"
          }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
                AI BUTTERFLY EFFECT LAB
              </span>
              <span style={{
                fontSize: "0.68rem",
                padding: "1px 6px",
                background: "rgba(6, 182, 212, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: 4,
                fontWeight: 600
              }}>
                v1.0 RESEARCH
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>DETERMINISTIC SIMULATOR = TRUTH</span>
              <span>•</span>
              <span style={{ color: "#a78bfa" }}>AI = SPECULATIVE EXPLORATION</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            className={`btn-secondary ${currentTab === "chaos-lab" ? "active" : ""}`}
            onClick={() => onSelectTab("chaos-lab")}
            title="Twin trajectory simulation and divergence"
          >
            <Activity size={15} />
            <span>Chaos Lab</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "microscope" ? "active" : ""}`}
            onClick={() => onSelectTab("microscope")}
            title="Flagship: Multi-decade perturbation sweep (10^-1 to 10^-7)"
          >
            <Radio size={15} color="#38bdf8" />
            <span>Microscope</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "heatmap" ? "active" : ""}`}
            onClick={() => onSelectTab("heatmap")}
            title="Flagship: 2D Initial Condition Sensitivity Grid"
          >
            <Flame size={15} color="#f59e0b" />
            <span>Sensitivity Heatmap</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "bifurcation" ? "active" : ""}`}
            onClick={() => onSelectTab("bifurcation")}
            title="Flagship: Logistic Map & Bifurcation Explorer"
          >
            <Layers size={15} color="#10b981" />
            <span>Bifurcation</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "scenario-lab" ? "active" : ""}`}
            onClick={() => onSelectTab("scenario-lab")}
            title="AI What-if Speculative Scenario Branching"
          >
            <Sparkles size={15} color="#a78bfa" />
            <span>AI Scenario Lab</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "evidence-ledger" ? "active" : ""}`}
            onClick={() => onSelectTab("evidence-ledger")}
            title="Provenance: Distinguish Computed Facts vs AI Hypotheses"
          >
            <ShieldCheck size={15} color="#34d399" />
            <span>Evidence Ledger</span>
          </button>

          <button
            className={`btn-secondary ${currentTab === "lessons" ? "active" : ""}`}
            onClick={() => onSelectTab("lessons")}
            title="7 Guided Inquiry-Based Lessons & Teacher Mode"
          >
            <BookOpen size={15} />
            <span>Lessons</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isSimulating && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.78rem",
              color: "#38bdf8",
              background: "rgba(56, 189, 248, 0.1)",
              padding: "4px 10px",
              borderRadius: 20,
              border: "1px solid rgba(56, 189, 248, 0.25)"
            }}>
              <Cpu size={14} className="spin-slow" />
              <span>Integrating RK4...</span>
            </div>
          )}

          <button
            className="btn-secondary"
            onClick={onOpenHistory}
            title="View saved runs, 1-click replay, and comparison"
          >
            <History size={15} />
            <span>History & Replay</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onOpenExport}
            title="Export experiment configuration (JSON, CSV, Report)"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
