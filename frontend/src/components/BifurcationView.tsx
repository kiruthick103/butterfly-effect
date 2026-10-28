import React, { useState, useEffect, useRef } from "react";
import { Layers, Play, Info, Sparkles, RefreshCw } from "lucide-react";
import { api } from "../api/client";
import { BifurcationResult } from "../types";

export const BifurcationView: React.FC = () => {
  const [r, setR] = useState<number>(3.82);
  const [x0, setX0] = useState<number>(0.5);
  const [iterations, setIterations] = useState<number>(75);
  const [orbit, setOrbit] = useState<number[]>([]);
  const [bifurcationData, setBifurcationData] = useState<BifurcationResult | null>(null);
  const [isLoadingBifurcation, setIsLoadingBifurcation] = useState<boolean>(false);

  const bifCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute local single orbit for time-series display
  useEffect(() => {
    let curr = x0;
    const pts = [curr];
    for (let i = 0; i < iterations; i++) {
      curr = r * curr * (1 - curr);
      pts.push(curr);
    }
    setOrbit(pts);
  }, [r, x0, iterations]);

  // Load bifurcation data once on mount
  useEffect(() => {
    const fetchBifurcation = async () => {
      setIsLoadingBifurcation(true);
      try {
        const data = await api.runBifurcation({
          r_min: 2.5,
          r_max: 4.0,
          r_steps: 400,
          iterations: 100,
          burn_in: 200,
        });
        setBifurcationData(data);
      } catch (err) {
        console.error("Failed to load bifurcation diagram:", err);
      } finally {
        setIsLoadingBifurcation(false);
      }
    };
    fetchBifurcation();
  }, []);

  // Render Time-Series
  useEffect(() => {
    const canvas = timeCanvasRef.current;
    if (!canvas || orbit.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const scaleX = (i: number) => padding.left + (i / (orbit.length - 1)) * chartW;
    const scaleY = (v: number) => padding.top + chartH - v * chartH;

    // Grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText((1 - i / 4).toFixed(2), padding.left - 6, y + 3);
    }

    // Connect dots
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < orbit.length; i++) {
      const x = scaleX(i);
      const y = scaleY(orbit[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Dots
    ctx.fillStyle = "#34d399";
    for (let i = 0; i < orbit.length; i++) {
      ctx.beginPath();
      ctx.arc(scaleX(i), scaleY(orbit[i]), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [orbit]);

  // Render Bifurcation Diagram
  useEffect(() => {
    const canvas = bifCanvasRef.current;
    if (!canvas || !bifurcationData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const rMin = 2.5;
    const rMax = 4.0;

    const scaleX = (val: number) => padding.left + ((val - rMin) / (rMax - rMin)) * chartW;
    const scaleY = (val: number) => padding.top + chartH - val * chartH;

    // Draw bifurcation points
    ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
    for (const entry of bifurcationData.data) {
      const sx = scaleX(entry.r);
      for (const val of entry.values) {
        const sy = scaleY(val);
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }
    }

    // Current parameter r vertical marker
    const currentRx = scaleX(r);
    ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(currentRx, padding.top);
    ctx.lineTo(currentRx, padding.top + chartH);
    ctx.stroke();

    // Accumulation point marker r_inf = 3.56995
    const rInfX = scaleX(3.56995);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(rInfX, padding.top);
    ctx.lineTo(rInfX, padding.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Growth Parameter r", padding.left + chartW / 2, height - 10);
  }, [bifurcationData, r]);

  // Determine regime description
  let regimeText = "Deterministic Chaos";
  if (r < 1.0) regimeText = "Extinction (asymptotic zero)";
  else if (r < 3.0) regimeText = "Stable non-zero fixed point";
  else if (r < 3.449) regimeText = "Period-2 Limit Cycle";
  else if (r < 3.544) regimeText = "Period-4 Limit Cycle";
  else if (r < 3.56995) regimeText = "Period-8 Cascade";
  else if (r > 3.82 && r < 3.84) regimeText = "Period-3 Periodic Window within Chaos";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={22} color="#10b981" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Logistic Map & Bifurcation Explorer</h2>
              <span className="badge-computed">DISCRETE CHAOS</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginTop: 6, maxWidth: 850 }}>
              Explore Robert May's famous quadratic population equation:{" "}
              <span className="mono" style={{ color: "#34d399" }}>x[n+1] = r · x[n] · (1 - x[n])</span>. Slide the parameter{" "}
              <strong>r</strong> to watch simple equilibrium bifurcate into stable oscillations and erupt into deterministic chaos.
            </p>
          </div>

          <div style={{
            padding: "8px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 8,
            textAlign: "right"
          }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Current Dynamic Regime</div>
            <div style={{ fontWeight: 700, color: "#34d399", fontSize: "0.92rem" }}>{regimeText}</div>
          </div>
        </div>
      </div>

      {/* Parameter Slider Bar */}
      <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ minWidth: 140 }}>
          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Parameter r: </span>
          <span className="mono" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>
            {r.toFixed(4)}
          </span>
        </div>

        <input
          type="range"
          min={2.5}
          max={4.0}
          step={0.005}
          value={r}
          onChange={(e) => setR(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "#10b981", cursor: "pointer" }}
        />

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Fixed Point (2.8)", val: 2.8 },
            { label: "Period-2 (3.2)", val: 3.2 },
            { label: "Period-4 (3.5)", val: 3.5 },
            { label: "Chaos (3.9)", val: 3.9 },
            { label: "Window (3.83)", val: 3.83 },
          ].map((preset) => (
            <button
              key={preset.val}
              className={`btn-secondary ${r === preset.val ? "active" : ""}`}
              onClick={() => setR(preset.val)}
              style={{ padding: "4px 8px", fontSize: "0.72rem" }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Full Bifurcation Diagram */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
              Asymptotic Bifurcation Diagram (r vs Attractor States)
            </span>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
              Red bar indicates current r = {r.toFixed(3)}
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 340, position: "relative" }}>
            {isLoadingBifurcation && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(9,13,22,0.8)" }}>
                <span style={{ color: "#10b981", fontSize: "0.85rem" }}>Computing Bifurcation Sweep...</span>
              </div>
            )}
            <canvas
              ref={bifCanvasRef}
              width={750}
              height={340}
              style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)" }}
            />
          </div>
        </div>

        {/* Orbit Time Series */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
              Iterated Orbit Time-Series (x[n] vs n)
            </span>
            <span className="mono" style={{ fontSize: "0.72rem", color: "#34d399" }}>
              {iterations} steps
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 340 }}>
            <canvas
              ref={timeCanvasRef}
              width={500}
              height={340}
              style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
