import React from "react";
import {
  Sparkles,
  GitBranch,
  Sliders,
  FileText,
  Clock,
  Compass,
  BookOpen,
  Sun,
  Moon
} from "lucide-react";

export type LabTab =
  | "synthesis"
  | "what-if"
  | "sensitivity"
  | "evidence"
  | "history"
  | "foundations"
  | "learn"
  | "decision-lab";

interface NavbarProps {
  currentTab: LabTab;
  onSelectTab: (tab: LabTab) => void;
  onOpenHistory?: () => void;
  onOpenExport?: () => void;
  isSimulating?: boolean;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  theme = "dark",
  onToggleTheme
}) => {
  const navItems: { id: LabTab; label: string; icon: React.ReactNode }[] = [
    { id: "synthesis", label: "Synthesis", icon: <Sparkles size={14} /> },
    { id: "what-if", label: "What If", icon: <GitBranch size={14} /> },
    { id: "sensitivity", label: "Sensitivity", icon: <Sliders size={14} /> },
    { id: "evidence", label: "Evidence", icon: <FileText size={14} /> },
    { id: "history", label: "History", icon: <Clock size={14} /> },
    { id: "foundations", label: "Foundations", icon: <Compass size={14} /> },
    { id: "learn", label: "Learn", icon: <BookOpen size={14} /> },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8, 12, 20, 0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(30, 41, 59, 0.8)",
        padding: "0 24px"
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 16
        }}
      >
        {/* Brand / Logo Section */}
        <div
          onClick={() => onSelectTab("synthesis")}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          {/* Stylized Butterfly Icon Box */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(6, 182, 212, 0.35)",
              flexShrink: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Stylized Butterfly Wings */}
              <path d="M12 4v16" />
              <path d="M12 7c-4-4-9-2-9 4s5 5 9 1" />
              <path d="M12 7c4-4 9-2 9 4s-5 5-9 1" />
              <path d="M12 14c-3 2-6 5-6 6 2 0 5-1 6-4" />
              <path d="M12 14c3 2 6 5 6 6-2 0-5-1-6-4" />
            </svg>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  letterSpacing: "0.02em",
                  color: "#f8fafc"
                }}
              >
                BUTTERFLY EFFECT LAB
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  padding: "2px 8px",
                  background: "rgba(139, 92, 246, 0.2)",
                  color: "#c4b5fd",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  borderRadius: 4,
                  fontWeight: 700,
                  letterSpacing: "0.04em"
                }}
              >
                SCENARIO INTELLIGENCE
              </span>
            </div>
            {/* Sub-bullets */}
            <div
              style={{
                fontSize: "0.7rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2
              }}
            >
              <span>• SCENARIO FORECASTING</span>
              <span style={{ color: "#38bdf8" }}>• BUTTERFLY EFFECT SIMULATOR</span>
              <span style={{ color: "#10b981" }}>• SYNTHESIS ENGINE READY</span>
            </div>
          </div>
        </div>

        {/* Center Tab Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  background: isActive ? "rgba(6, 182, 212, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.35)" : "1px solid transparent",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* AI Synthesis Engine Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(30, 41, 59, 0.8)",
              borderRadius: 6,
              fontSize: "0.75rem",
              color: "#94a3b8"
            }}
          >
            <Sparkles size={12} color="#10b981" />
            <span style={{ letterSpacing: "0.04em", fontWeight: 600 }}>AI SYNTHESIS ENGINE</span>
          </div>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(30, 41, 59, 0.8)",
                borderRadius: 6,
                fontSize: "0.78rem",
                color: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {theme === "dark" ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#38bdf8" />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
