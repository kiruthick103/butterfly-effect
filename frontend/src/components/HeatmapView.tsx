import React, { useState, useEffect, useRef } from "react";
import { Flame, RefreshCw, ZoomIn, Info } from "lucide-react";
import { api } from "../api/client";
import { HeatmapResult } from "../types";

export const HeatmapView: React.FC = () => {
  const [resolution, setResolution] = useState<number>(20);
  const [fixedZ, setFixedZ] = useState<number>(1.0);
  const [perturbation, setPerturbation] = useState<number>(0.0001);
  const [duration, setDuration] = useState<number>(12.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; val: number; screenX: number; screenY: number } | null>(null);

  const runHeatmapCompute = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.runHeatmap({
        fixed_z: fixedZ,
        resolution,
        perturbation,
        duration,
        x_range: [-5.0, 5.0],
        y_range: [-5.0, 5.0],
      });
      setHeatmapData(data);
    } catch (err: any) {
      setError(err.message || "Failed to compute sensitivity heatmap");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runHeatmapCompute();
  }, []);

  // Map value in [0, 25] to color gradient
  const getColor = (val: number, maxVal: number = 25.0): string => {
    const t = Math.max(0, Math.min(1, val / maxVal));
    // Color stops: Deep Navy (0.0) -> Cyan (0.3) -> Amber (0.7) -> Magenta/White (1.0)
    if (t < 0.3) {
      const f = t / 0.3;
      return `rgb(${Math.round(15 + f * 41)}, ${Math.round(23 + f * 159)}, ${Math.round(42 + f * 170)})`;
    } else if (t < 0.7) {
      const f = (t - 0.3) / 0.4;
      return `rgb(${Math.round(56 + f * 195)}, ${Math.round(182 - f * 20)}, ${Math.round(212 - f * 170)})`;
    } else {
      const f = (t - 0.7) / 0.3;
      return `rgb(${Math.round(251 - f * 7)}, ${Math.round(162 - f * 100)}, ${Math.round(42 + f * 120)})`;
    }
  };

  // Render heatmap to canvas
  useEffect(() => {
    if (!heatmapData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    const matrix = heatmapData.matrix;
    const rows = matrix.length;
    if (rows === 0) return;
    const cols = matrix[0].length;

    const padding = { top: 30, right: 70, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const cellW = chartW / cols;
    const cellH = chartH / rows;

    // Render cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = matrix[r][c];
        ctx.fillStyle = getColor(val);
        // Canvas rows: row 0 is top (highest y)
        const x = padding.left + c * cellW;
        const y = padding.top + (rows - 1 - r) * cellH;
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      }
    }

    // Color bar on right
    const barX = width - padding.right + 20;
    const barW = 16;
    for (let y = 0; y < chartH; y++) {
      const val = 25.0 * (1 - y / chartH);
      ctx.fillStyle = getColor(val);
      ctx.fillRect(barX, padding.top + y, barW, 1);
    }
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.strokeRect(barX, padding.top, barW, chartH);

    ctx.fillStyle = "#64748b";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText("25.0", barX + 22, padding.top + 10);
    ctx.fillText("12.5", barX + 22, padding.top + chartH / 2 + 3);
    ctx.fillText("0.0", barX + 22, padding.top + chartH);

    // Axes
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Initial Condition X₀", padding.left + chartW / 2, height - 10);

    ctx.save();
    ctx.translate(16, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Initial Condition Y₀", 0, 0);
    ctx.restore();
  }, [heatmapData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!heatmapData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padding = { top: 30, right: 70, bottom: 40, left: 55 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = rect.height - padding.top - padding.bottom;

    if (
      mouseX < padding.left || mouseX > rect.width - padding.right ||
      mouseY < padding.top || mouseY > rect.height - padding.bottom
    ) {
      setHoveredCell(null);
      return;
    }

    const cols = heatmapData.x_coords.length;
    const rows = heatmapData.y_coords.length;

    const c = Math.floor(((mouseX - padding.left) / chartW) * cols);
    const r = rows - 1 - Math.floor(((mouseY - padding.top) / chartH) * rows);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      setHoveredCell({
        x: heatmapData.x_coords[c],
        y: heatmapData.y_coords[r],
        val: heatmapData.matrix[r][c],
        screenX: mouseX,
        screenY: mouseY,
      });
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title & Controls */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Flame size={22} color="#f59e0b" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Initial Condition Sensitivity Heatmap</h2>
              <span className="badge-computed">PEAK FEATURE</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginTop: 6, maxWidth: 850 }}>
              Computes trajectory divergence across a 2D phase-space grid of initial states (X₀ vs Y₀) at fixed Z₀ = {fixedZ}.{" "}
              Identifies regions of high dynamical sensitivity (fractal basin boundaries) vs laminar stability.
            </p>
          </div>

          {/* Grid Resolution & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Grid: {resolution}×{resolution} ({resolution * resolution} runs)
              </div>
              <input
                type="range"
                min={10}
                max={30}
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value, 10))}
                style={{ width: 110, accentColor: "#f59e0b", cursor: "pointer" }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={runHeatmapCompute}
              disabled={isLoading}
              style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" }}
            >
              <RefreshCw size={14} className={isLoading ? "spin-slow" : ""} />
              <span>{isLoading ? "Simulating Grid..." : "Recompute Heatmap"}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: 8, color: "#fca5a5", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Main Heatmap Canvas */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
            Phase-Space Divergence Contour (Final Distance D(T))
          </span>
          {heatmapData && (
            <span className="mono" style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
              Computed {resolution * resolution} simulations in {heatmapData.computation_time_ms}ms
            </span>
          )}
        </div>

        <div style={{ position: "relative", width: "100%", maxWidth: 800, height: 480 }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={480}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredCell(null)}
            style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)", cursor: "crosshair" }}
          />

          {hoveredCell && (
            <div style={{
              position: "absolute",
              left: Math.min(hoveredCell.screenX + 15, 620),
              top: Math.max(hoveredCell.screenY - 45, 10),
              pointerEvents: "none",
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: "0.75rem",
              zIndex: 10
            }}>
              <div className="mono" style={{ color: "var(--text-muted)" }}>
                X₀ = {hoveredCell.x.toFixed(2)}, Y₀ = {hoveredCell.y.toFixed(2)}
              </div>
              <div className="mono" style={{ color: "#f59e0b", fontWeight: 700, marginTop: 2 }}>
                Final Separation: {hoveredCell.val.toFixed(3)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
