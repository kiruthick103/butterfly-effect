import React, { useRef, useEffect, useState } from "react";
import { TrendingUp, BarChart2 } from "lucide-react";

interface DivergenceChartProps {
  times: number[];
  distances: number[];
  logDivergences: number[];
  divergenceThreshold?: number;
  timeToThreshold?: number | null;
}

export const DivergenceChart: React.FC<DivergenceChartProps> = ({
  times,
  distances,
  logDivergences,
  divergenceThreshold = 1.0,
  timeToThreshold = null,
}) => {
  const [useLogScale, setUseLogScale] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tooltip hover state
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    time: number;
    distance: number;
    logDiv?: number;
  } | null>(null);

  const series = useLogScale ? logDivergences : distances;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    if (!series || series.length < 2 || !times || times.length < 2) return;

    const padding = { top: 30, right: 30, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxT = times[times.length - 1] || 1;
    let maxVal = Math.max(...series);
    if (useLogScale) {
      maxVal = Math.max(maxVal, 5.0);
    } else {
      maxVal = Math.max(maxVal, divergenceThreshold * 1.5, 5.0);
    }

    const minVal = useLogScale ? Math.min(0, ...series) : 0;
    const valRange = maxVal - minVal || 1;

    const scaleX = (t: number) => padding.left + (t / maxT) * chartW;
    const scaleY = (v: number) => padding.top + chartH - ((v - minVal) / valRange) * chartH;

    // Grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = minVal + (1 - i / 5) * valRange;
      ctx.fillStyle = "#64748b";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(val.toFixed(useLogScale ? 1 : 2), padding.left - 8, y + 3);
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

    // Divergence Threshold Line (linear mode)
    if (!useLogScale && divergenceThreshold <= maxVal) {
      const threshY = scaleY(divergenceThreshold);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padding.left, threshY);
      ctx.lineTo(width - padding.right, threshY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Threshold τ = ${divergenceThreshold}`, padding.left + 8, threshY - 6);
    }

    // Time to threshold marker
    if (timeToThreshold !== null && !useLogScale) {
      const tx = scaleX(timeToThreshold);
      const ty = scaleY(divergenceThreshold);
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gradient fill under divergence curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    if (useLogScale) {
      gradient.addColorStop(0, "rgba(167, 139, 250, 0.25)");
      gradient.addColorStop(1, "rgba(167, 139, 250, 0.0)");
    } else {
      gradient.addColorStop(0, "rgba(244, 63, 94, 0.28)");
      gradient.addColorStop(1, "rgba(244, 63, 94, 0.0)");
    }

    ctx.beginPath();
    ctx.moveTo(scaleX(times[0]), scaleY(series[0]));
    for (let i = 1; i < times.length; i++) {
      ctx.lineTo(scaleX(times[i]), scaleY(series[i]));
    }
    ctx.lineTo(scaleX(times[times.length - 1]), padding.top + chartH);
    ctx.lineTo(scaleX(times[0]), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Divergence line plot
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = useLogScale ? "#a78bfa" : "#f43f5e";
    ctx.beginPath();
    for (let i = 0; i < times.length; i++) {
      const x = scaleX(times[i]);
      const y = scaleY(series[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time Elapsed t (seconds)", padding.left + chartW / 2, height - 10);

    ctx.save();
    ctx.translate(16, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(
      useLogScale ? "Logarithmic Separation ln(D(t) / D₀)" : "Euclidean Separation Distance D(t)",
      0,
      0
    );
    ctx.restore();
  }, [times, series, useLogScale, divergenceThreshold, timeToThreshold]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !times || times.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const paddingLeft = 55;
    const paddingRight = 30;
    const chartW = rect.width - paddingLeft - paddingRight;

    if (mouseX < paddingLeft || mouseX > rect.width - paddingRight) {
      setHoverData(null);
      return;
    }

    const tFrac = (mouseX - paddingLeft) / chartW;
    const maxT = times[times.length - 1] || 1;
    const targetT = tFrac * maxT;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const diff = Math.abs(times[i] - targetT);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoverData({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: times[closestIdx],
      distance: distances[closestIdx],
      logDiv: logDivergences ? logDivergences[closestIdx] : undefined,
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 250 }}>
      {/* Scale Switcher Toggle */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
        zIndex: 5
      }}>
        <button
          className={`btn-secondary ${!useLogScale ? "active" : ""}`}
          onClick={() => setUseLogScale(false)}
          style={{ padding: "4px 9px", fontSize: "0.72rem" }}
          title="Euclidean distance D(t)"
        >
          <BarChart2 size={13} />
          <span>Linear D(t)</span>
        </button>

        <button
          className={`btn-secondary ${useLogScale ? "active" : ""}`}
          onClick={() => setUseLogScale(true)}
          style={{ padding: "4px 9px", fontSize: "0.72rem" }}
          title="Logarithmic separation ratio ln(D(t)/D(0))"
        >
          <TrendingUp size={13} color="#a78bfa" />
          <span>Log ln(D/D₀)</span>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
        style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)" }}
      />

      {/* Hover Tooltip */}
      {hoverData && (
        <div style={{
          position: "absolute",
          left: Math.min(hoverData.x + 12, 350),
          top: Math.max(hoverData.y - 45, 10),
          pointerEvents: "none",
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: "0.74rem",
          zIndex: 10
        }}>
          <div className="mono" style={{ color: "#94a3b8" }}>t = {hoverData.time.toFixed(2)}s</div>
          <div className="mono" style={{ color: "#f43f5e", fontWeight: 600 }}>
            D(t) = {hoverData.distance.toFixed(6)}
          </div>
          {hoverData.logDiv !== undefined && (
            <div className="mono" style={{ color: "#a78bfa" }}>
              ln(D/D₀) = {hoverData.logDiv.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
