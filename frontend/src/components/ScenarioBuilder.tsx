import React, { useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { ScenarioVariable } from "../types";

interface ScenarioBuilderProps {
  description: string;
  onChangeDescription: (desc: string) => void;
  conditions: Record<string, ScenarioVariable>;
  onChangeConditionValue: (varName: string, value: number) => void;
  onSynthesize: () => void;
  onSelectPresetScenario?: (desc: string) => void;
  isSynthesizing: boolean;
}

const EVERYDAY_PRESETS = [
  { id: "missed_bus", label: "🚌 Missed Bus Before Exam", text: "Missed the morning 8:15 AM bus before a final university exam starting at 9:00 AM. 45 minutes until exam hall doors lock." },
  { id: "wake_late", label: "⏰ Waking Up Late", text: "Woke up 40 minutes late with an alarm failure; have an all-hands presentation in 50 minutes and a 35-minute commute." },
  { id: "battery_dying", label: "🔋 Phone Battery Dying", text: "Phone battery at 7% during an unfamiliar city commute without a charger or power bank and boarding pass on phone." },
  { id: "heavy_rain", label: "🌧️ Heavy Rain Before College", text: "Severe unexpected torrential downpour and waterlogging before mandatory semester lab exam; transit paralyzed." },
  { id: "exam_tomorrow", label: "📚 Exam Tomorrow", text: "Semester final exam in 14 hours; completed only 4 of 10 syllabus modules with high sleep deprivation." },
  { id: "internet_down", label: "🌐 Internet Goes Down", text: "Home fiber internet disconnected 15 minutes before submitting an online certification exam with hotspot at 15% data." },
  { id: "laptop_broken", label: "💻 Laptop Stops Working", text: "Laptop screen goes black with blinking error LED 3 hours before code freeze deadline with local uncommitted work." },
  { id: "out_of_money", label: "💸 Running Out of Money", text: "Bank account balance is ₹420 with 8 days remaining until monthly allowance or salary credit; utility bills due." },
  { id: "group_delay", label: "👥 Group Project Delay", text: "Two of four group members stopped replying 48 hours before final semester project submission with 40% work pending." },
  { id: "illness", label: "🤒 Unexpected Illness", text: "Woke up with 102°F fever, severe headache, and chills on the day of a final-round job interview." },
  { id: "traffic_jam", label: "🚦 Traffic Jam", text: "Stuck in bumper-to-bumper standstill highway traffic with GPS adding 25 minutes; 40 minutes to airport boarding." },
  { id: "late_package", label: "📦 Late Package Delivery", text: "Critical replacement sensor package delayed in courier hub 20 km away with client hardware demo starting in 6 hours." },
  { id: "birthday_budget", label: "🎂 Birthday on a Budget", text: "Planning a surprise birthday gathering for 12 close friends with a total strict budget of ₹3,500." },
  { id: "power_cut", label: "⚡ Power Cut During Work", text: "Sudden neighborhood blackout during remote client sprint review with laptop at 35% battery and no home inverter." },
  { id: "miss_deadline", label: "⏳ Missing a Deadline", text: "Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete." },
];

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  description,
  onChangeDescription,
  conditions,
  onChangeConditionValue,
  onSynthesize,
  onSelectPresetScenario,
  isSynthesizing
}) => {
  const [editingVar, setEditingVar] = useState<string | null>(null);

  const conditionList = Object.values(conditions);

  const handleSelectPreset = (text: string) => {
    onChangeDescription(text);
    if (onSelectPresetScenario) {
      onSelectPresetScenario(text);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1600,
        margin: "0 auto 20px auto",
        background: "rgba(11, 17, 32, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
      }}
    >
      {/* 1. Large Main Text Area with Action Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="Describe any real-life situation in ordinary English (or select a preset below)..."
            rows={3}
            style={{
              width: "100%",
              padding: "14px 16px",
              paddingRight: 170,
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(8, 12, 20, 0.75)",
              color: "#f8fafc",
              fontFamily: "var(--font-sans)",
              fontSize: "0.94rem",
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s ease"
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(6, 182, 212, 0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
          />
          {/* Minimalist Run Button */}
          <button
            type="button"
            onClick={onSynthesize}
            disabled={isSynthesizing || !description.trim()}
            style={{
              position: "absolute",
              right: 12,
              bottom: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: isSynthesizing
                ? "rgba(15, 23, 42, 0.8)"
                : "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: isSynthesizing ? "wait" : "pointer",
              boxShadow: "0 2px 10px rgba(6, 182, 212, 0.3)",
              transition: "all 0.15s ease"
            }}
          >
            {isSynthesizing ? (
              <>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    animation: "spin 0.6s linear infinite"
                  }}
                />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Simulate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Quick Everyday Scenarios Bar (All 15 Presets) */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>⚡</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", letterSpacing: "0.04em" }}>
            QUICK EVERYDAY SCENARIOS (15 PRESETS):
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Select any real-world situation to parse domain parameters & compute pass rates
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {EVERYDAY_PRESETS.map((preset) => {
            const isActive =
              description.trim() === preset.text.trim() ||
              (preset.id === "miss_deadline" && description.includes("Research paper"));

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                style={{
                  background: isActive ? "rgba(6, 182, 212, 0.12)" : "rgba(15, 23, 42, 0.5)",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  border: isActive ? "1px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 9999,
                  padding: "4px 12px",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: isActive ? "0 0 10px rgba(6, 182, 212, 0.2)" : "none"
                }}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detected Conditions & Parameters Header */}
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10
          }}
        >
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "#38bdf8",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}
          >
            DETECTED CONDITIONS & PARAMETERS
          </span>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
            Click any value to adjust starting conditions
          </span>
        </div>

        {/* 4. Grid of 5 Parameter Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 10
          }}
        >
          {conditionList.map((cond) => {
            const isEditing = editingVar === cond.name;

            return (
              <div
                key={cond.name}
                onClick={() => setEditingVar(isEditing ? null : cond.name)}
                style={{
                  background: "rgba(15, 23, 42, 0.65)",
                  border: isEditing ? "1px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  minHeight: 102,
                  boxShadow: isEditing ? "0 0 10px rgba(6, 182, 212, 0.2)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {/* Top: Label and Unit */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {cond.label}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    {cond.unit}
                  </span>
                </div>

                {/* Middle: Large Bold Number */}
                <div style={{ margin: "2px 0" }}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={cond.value}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChangeConditionValue(cond.name, parseFloat(e.target.value) || 0)}
                      step={cond.step || 1}
                      min={cond.min_val}
                      max={cond.max_val}
                      style={{
                        width: "100%",
                        background: "rgba(8, 12, 20, 0.9)",
                        color: "#38bdf8",
                        border: "1px solid #06b6d4",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        outline: "none"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#f8fafc",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "-0.02em"
                      }}
                    >
                      {cond.value}
                    </div>
                  )}
                </div>

                {/* Bottom: Description */}
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    lineHeight: 1.3,
                    marginTop: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {cond.description || "System initial condition parameter"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
