import React, { useState, useEffect, useRef } from "react";
import { Radio, Play, RefreshCw, Info, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import { MicroscopeResult } from "../types";

export const MicroscopeView: React.FC = () => {
  const [axis, setAxis] = useState<number>(0); // 0=x, 1=y, 2=z
  const [duration, setDuration] = useState<number>(25.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MicroscopeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const runSweep = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.runMicroscope({
        axis,
        duration,
        scales: [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7],
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run perturbation microscope sweep");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSweep();
  }, [axis]);

  // Render multi-curve divergence canvas
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const times = result.times;
    if (!times || times.length < 2) return;
    const maxT = times[times.length - 1];
    const maxDist = 25.0; // scale up to attractor boundary

    const scaleX = (t: number) => padding.left + (t / maxT) * chartW;
    const scaleY = (d: number) => padding.top + chartH - (Math.min(d, maxDist) / maxDist) * chartH;

    // Grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const dVal = maxDist * (1 - i / 5);
      ctx.fillStyle = "#64748b";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(dVal.toFixed(1), padding.left - 8, y + 3);
    }

    for (let i = 0; i <= 5; i++) {
      const t = (i / 5) * maxT;
      const x = scaleX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t.toFixed(0)}s`, x, height - padding.bottom + 16);
    }

    // Threshold line
    const threshY = scaleY(1.0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
    ctx.beginPath();
    ctx.moveTo(padding.left, threshY);
    ctx.lineTo(width - padding.right, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve colors across the 7 decades (from Red/Coral 10^-1 down to Cyan 10^-7)
    const curveColors = [
      "#f43f5e", // 10^-1
      "#fb7185", // 10^-2
      "#f59e0b", // 10^-3
      "#eab308", // 10^-4
      "#10b981", // 10^-5
      "#06b6d4", // 10^-6
      "#38bdf8", // 10^-7
    ];

    result.levels.forEach((lvl, idx) => {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = curveColors[idx % curveColors.length];
      ctx.beginPath();
      for (let i = 0; i < times.length && i < lvl.distances.length; i++) {
        const x = scaleX(times[i]);
        const y = scaleY(lvl.distances[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw point at threshold if crossed
      if (lvl.time_to_threshold !== null) {
        const tx = scaleX(lvl.time_to_threshold);
        ctx.fillStyle = curveColors[idx % curveColors.length];
        ctx.beginPath();
        ctx.arc(tx, threshY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Axis labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Simulation Time t (seconds)", padding.left + chartW / 2, height - 10);
  }, [result]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title & Concept Header */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Radio size={22} color="#38bdf8" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Perturbation Microscope</h2>
              <span className="badge-computed">FLAGSHIP EXPERIMENT</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginTop: 6, maxWidth: 850 }}>
              Instead of observing a single divergence run, the Perturbation Microscope sweeps initial perturbations across{" "}
              <strong>7 continuous orders of magnitude</strong> (from 10⁻¹ down to 10⁻⁷). Directly observe how each 10x reduction{" "}
              in initial difference consistently shifts the macroscopic divergence horizon further in time.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Axis Selector */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { label: "Δx", idx: 0 },
                { label: "Δy", idx: 1 },
                { label: "Δz", idx: 2 },
              ].map(({ label, idx }) => (
                <button
                  key={idx}
                  className={`btn-secondary ${axis === idx ? "active" : ""}`}
                  onClick={() => setAxis(idx)}
                  style={{ padding: "6px 12px", fontWeight: 600 }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={runSweep}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? "spin-slow" : ""} />
              <span>{isLoading ? "Sweeping Decades..." : "Run Microscope"}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 8, color: "#fca5a5", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Main Grid: Chart + Decades Table */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 20 }}>
        {/* Chart View */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
              Multi-Decade Divergence Trajectory Overlay
            </span>
            <span className="mono" style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
              Threshold τ = 1.0
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 380, position: "relative" }}>
            <canvas
              ref={canvasRef}
              width={750}
              height={380}
              style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)" }}
            />
          </div>

          {/* Analysis Summary */}
          {result?.summary_analysis && (
            <div style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: 8,
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "#e0f2fe"
            }}>
              <div style={{ fontWeight: 600, color: "#38bdf8", marginBottom: 3, fontSize: "0.75rem", textTransform: "uppercase" }}>
                Scientific Finding
              </div>
              {result.summary_analysis}
            </div>
          )}
        </div>

        {/* Decades Comparison Table */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
            Decade Separation Horizons
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result?.levels.map((lvl, idx) => {
              const colors = ["#f43f5e", "#fb7185", "#f59e0b", "#eab308", "#10b981", "#06b6d4", "#38bdf8"];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={lvl.exponent}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    borderLeft: `4px solid ${color}`
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: "0.95rem", color }}>
                        10{lvl.exponent}
                      </span>
                      <span className="mono" style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                        ({lvl.scale.toExponential(1)})
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      Initial perturbation magnitude
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: "0.9rem", fontWeight: 600, color: lvl.time_to_threshold ? "#10b981" : "var(--text-dim)" }}>
                      {lvl.time_to_threshold ? `t* = ${lvl.time_to_threshold.toFixed(2)}s` : "Never Crossed"}
                    </div>
                    <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                      Final D: {lvl.final_distance.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theoretical Law Note */}
          <div style={{
            marginTop: "auto",
            padding: "10px 12px",
            background: "rgba(8, 12, 20, 0.5)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            fontSize: "0.74rem",
            color: "var(--text-muted)",
            lineHeight: 1.5
          }}>
            <strong>Mathematical Rule:</strong> Predictability horizon scales as{" "}
            <span className="mono" style={{ color: "#38bdf8" }}>t*(δ) ≈ (1/λ) · ln(τ / δ)</span>. Each factor of 10
            reduction in perturbation only adds a constant time increment of ≈ 2.5 seconds.
          </div>
        </div>
      </div>
    </div>
  );
};
