import React, { useRef, useEffect, useState } from "react";

interface PhasePortrait2DProps {
  baselineTrajectory: number[][];
  perturbedTrajectory: number[][];
  defaultPlane?: "xz" | "xy" | "yz";
}

export const PhasePortrait2D: React.FC<PhasePortrait2DProps> = ({
  baselineTrajectory,
  perturbedTrajectory,
  defaultPlane = "xz"
}) => {
  const [plane, setPlane] = useState<"xz" | "xy" | "yz">(defaultPlane);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    if (!baselineTrajectory || baselineTrajectory.length < 2) return;

    // Determine coordinate indices based on plane
    let idxH = 0; // Horizontal
    let idxV = 2; // Vertical
    let labelH = "X (Circulation)";
    let labelV = "Z (Profile Distortion)";

    if (plane === "xy") {
      idxH = 0;
      idxV = 1;
      labelH = "X (Circulation)";
      labelV = "Y (Temperature Gradient)";
    } else if (plane === "yz") {
      idxH = 1;
      idxV = 2;
      labelH = "Y (Temperature Gradient)";
      labelV = "Z (Profile Distortion)";
    }

    // Compute bounding box
    let minH = Infinity, maxH = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < baselineTrajectory.length; i++) {
      const bH = baselineTrajectory[i][idxH];
      const bV = baselineTrajectory[i][idxV];
      if (bH < minH) minH = bH;
      if (bH > maxH) maxH = bH;
      if (bV < minV) minV = bV;
      if (bV > maxV) maxV = bV;
    }

    const padH = (maxH - minH) * 0.1 || 5;
    const padV = (maxV - minV) * 0.1 || 5;
    minH -= padH;
    maxH += padH;
    minV -= padV;
    maxV += padV;

    const scaleX = (val: number) => 40 + ((val - minH) / (maxH - minH)) * (width - 60);
    const scaleY = (val: number) => height - 30 - ((val - minV) / (maxV - minV)) * (height - 50);

    // Grid lines & Axis labels
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = 40 + (i / 4) * (width - 60);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 30);
      ctx.stroke();

      const y = height - 30 - (i / 4) * (height - 50);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Draw Baseline Trajectory (Cyan)
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
    ctx.beginPath();
    for (let i = 0; i < baselineTrajectory.length; i++) {
      const sx = scaleX(baselineTrajectory[i][idxH]);
      const sy = scaleY(baselineTrajectory[i][idxV]);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Draw Perturbed Trajectory (Coral)
    if (perturbedTrajectory && perturbedTrajectory.length > 0) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
      ctx.beginPath();
      for (let i = 0; i < perturbedTrajectory.length; i++) {
        const sx = scaleX(perturbedTrajectory[i][idxH]);
        const sy = scaleY(perturbedTrajectory[i][idxV]);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Axes captions
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(labelH, width / 2 - 40, height - 10);

    ctx.save();
    ctx.translate(15, height / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(labelV, 0, 0);
    ctx.restore();
  }, [baselineTrajectory, perturbedTrajectory, plane]);

  // Handle high-dpi sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Plane Switcher */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 12,
        display: "flex",
        gap: 4,
        zIndex: 5
      }}>
        {(["xz", "xy", "yz"] as const).map((p) => (
          <button
            key={p}
            className={`btn-secondary ${plane === p ? "active" : ""}`}
            onClick={() => setPlane(p)}
            style={{ padding: "3px 8px", fontSize: "0.72rem", textTransform: "uppercase" }}
          >
            {p[0]}-{p[1]}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", borderRadius: "var(--radius-sm)" }}
      />
    </div>
  );
};
