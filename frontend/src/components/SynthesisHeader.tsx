import React from "react";
import { Sparkles, Clock, Layers, RotateCcw } from "lucide-react";
import { ScenarioTemplate } from "../types";

interface SynthesisHeaderProps {
  templates: ScenarioTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  timeHorizon: string;
  onChangeHorizon: (horizon: string) => void;
  onResetScenario: () => void;
  isSynthesizing: boolean;
}

export const SynthesisHeader: React.FC<SynthesisHeaderProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  timeHorizon,
  onChangeHorizon,
  onResetScenario,
  isSynthesizing
}) => {
  return (
    <header className="glass-panel" style={{ padding: "16px 24px", marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Brand & Subtitle */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--accent-baseline)" }}>AI SYNTHESIS ENGINE</span>
            </h1>

            {/* Tri-State Operational Health Indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <span className="live-pulse-dot live" />
                <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10b981", letterSpacing: "0.06em" }}>
                  ENGINE READY
                </span>
              </div>

              <span className="provenance-tag computed">DATA READY</span>
              <span className="provenance-tag ai">ANALYSIS READY</span>
            </div>
          </div>

          <p style={{ margin: "4px 0 0 0", fontSize: "0.86rem", color: "var(--text-muted)" }}>
            Explore possible futures and discover how small changes in the present reshape outcomes.
          </p>
        </div>

        {/* Templates Quick Picker & Horizon Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Preset Templates */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Template:
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="input-field"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.82rem", cursor: "pointer" }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Horizon:
            </span>
            <select
              value={timeHorizon}
              onChange={(e) => onChangeHorizon(e.target.value)}
              className="input-field"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.82rem", cursor: "pointer" }}
            >
              <option value="6_hours">6 Hours</option>
              <option value="24_hours">24 Hours</option>
              <option value="48_hours">48 Hours</option>
              <option value="7_days">7 Days</option>
              <option value="30_days">30 Days</option>
            </select>
          </div>

          {/* Reset / Demo Action */}
          <button
            onClick={onResetScenario}
            disabled={isSynthesizing}
            className="btn-secondary"
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            title="Reset scenario to template default starting conditions"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
