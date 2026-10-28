import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Maximize2, Compass } from "lucide-react";

interface Trajectory3DProps {
  baselineTrajectory: number[][];
  perturbedTrajectory: number[][];
  times: number[];
  currentIndex?: number;
  divergenceThreshold?: number;
}

export const Trajectory3D: React.FC<Trajectory3DProps> = ({
  baselineTrajectory,
  perturbedTrajectory,
  times,
  divergenceThreshold = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Camera Angles
  const [rotX, setRotX] = useState<number>(0.35); // Elevation
  const [rotY, setRotY] = useState<number>(-0.65); // Azimuth
  const [zoom, setZoom] = useState<number>(7.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Playback Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const totalPoints = baselineTrajectory?.length || 0;

  // Center coordinate offset for Lorenz attractor (attractor is centered roughly around z = 25)
  const CENTER_X = 0;
  const CENTER_Y = 0;
  const CENTER_Z = 25;

  // Project 3D (x, y, z) into 2D Screen (sx, sy)
  const project3D = useCallback(
    (x: number, y: number, z: number, width: number, height: number): [number, number, number] => {
      // 1. Center coords
      const cx = x - CENTER_X;
      const cy = y - CENTER_Y;
      const cz = z - CENTER_Z;

      // 2. Rotate around Y axis (azimuth)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = cx * cosY + cz * sinY;
      const y1 = cy;
      const z1 = -cx * sinY + cz * cosY;

      // 3. Rotate around X axis (elevation)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // 4. Perspective projection
      const cameraDist = 80;
      const fov = (cameraDist / (cameraDist + z2)) * zoom;

      const sx = width / 2 + x2 * fov;
      const sy = height / 2 - y2 * fov;

      return [sx, sy, z2];
    },
    [rotX, rotY, zoom]
  );

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    // Subtle background coordinate grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (totalPoints < 2) return;

    const endIndex = Math.min(
      playbackIndex === 0 ? totalPoints : playbackIndex,
      totalPoints
    );

    // Draw Coordinate Axes Origin
    const [origX, origY] = project3D(0, 0, 0, width, height);
    const [axisX_x, axisX_y] = project3D(15, 0, 0, width, height);
    const [axisY_x, axisY_y] = project3D(0, 15, 0, width, height);
    const [axisZ_x, axisZ_y] = project3D(0, 0, 45, width, height);

    ctx.lineWidth = 1.5;
    // X Axis (Red)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisX_x, axisX_y);
    ctx.stroke();

    // Y Axis (Green)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisY_x, axisY_y);
    ctx.stroke();

    // Z Axis (Blue)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisZ_x, axisZ_y);
    ctx.stroke();

    // 1. Draw Baseline Trajectory (Electric Cyan)
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.beginPath();
    for (let i = 0; i < endIndex; i++) {
      const pt = baselineTrajectory[i];
      const [sx, sy] = project3D(pt[0], pt[1], pt[2], width, height);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 2. Draw Perturbed Trajectory (Vivid Coral)
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
    ctx.beginPath();
    for (let i = 0; i < endIndex; i++) {
      const pt = perturbedTrajectory[i];
      const [sx, sy] = project3D(pt[0], pt[1], pt[2], width, height);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 3. Current Head Points & Separation Vector
    const currIdx = endIndex - 1;
    if (currIdx >= 0) {
      const baseHead = baselineTrajectory[currIdx];
      const pertHead = perturbedTrajectory[currIdx];

      const [bx, by] = project3D(baseHead[0], baseHead[1], baseHead[2], width, height);
      const [px, py] = project3D(pertHead[0], pertHead[1], pertHead[2], width, height);

      // Distance line between heads
      const d = Math.sqrt(
        (baseHead[0] - pertHead[0]) ** 2 +
        (baseHead[1] - pertHead[1]) ** 2 +
        (baseHead[2] - pertHead[2]) ** 2
      );

      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = d >= divergenceThreshold ? "rgba(251, 191, 36, 0.85)" : "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline Head Orb
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Perturbed Head Orb
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }, [
    baselineTrajectory,
    perturbedTrajectory,
    project3D,
    totalPoints,
    playbackIndex,
    divergenceThreshold,
  ]);

  // Animation step
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const step = () => {
      setPlaybackIndex((prev) => {
        if (prev >= totalPoints - 1) {
          setIsPlaying(false);
          return totalPoints;
        }
        return prev + 2;
      });
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, totalPoints]);

  // Redraw when camera or points change
  useEffect(() => {
    render();
  }, [render]);

  // Resize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    render();
  }, [render]);

  // Mouse interaction: Rotate & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setRotY((y) => y + dx * 0.008);
    setRotX((x) => Math.max(-1.4, Math.min(1.4, x + dy * 0.008)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(2.0, Math.min(25.0, z - e.deltaY * 0.005)));
  };

  const resetCamera = () => {
    setRotX(0.35);
    setRotY(-0.65);
    setZoom(7.5);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 460 }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          borderRadius: "var(--radius-md)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      />

      {/* Trajectory Legend Overlay */}
      <div style={{
        position: "absolute",
        top: 14,
        left: 14,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        background: "rgba(8, 12, 20, 0.75)",
        backdropFilter: "blur(8px)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        fontSize: "0.76rem",
        pointerEvents: "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 12, height: 3, background: "#38bdf8", borderRadius: 2 }} />
          <span style={{ fontWeight: 600, color: "#38bdf8" }}>Baseline Trajectory</span>
          <span className="mono" style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>x₀</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 12, height: 3, background: "#f43f5e", borderRadius: 2 }} />
          <span style={{ fontWeight: 600, color: "#f43f5e" }}>Perturbed Trajectory</span>
          <span className="mono" style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>x₀ + δ</span>
        </div>
      </div>

      {/* Controls Overlay Top-Right */}
      <div style={{
        position: "absolute",
        top: 14,
        right: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <button
          className="btn-secondary"
          onClick={resetCamera}
          style={{ padding: "5px 10px", fontSize: "0.72rem" }}
          title="Reset 3D camera angles and zoom"
        >
          <Compass size={13} />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Playback Controls Overlay Bottom */}
      <div style={{
        position: "absolute",
        bottom: 14,
        left: 14,
        right: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(8, 12, 20, 0.8)",
        backdropFilter: "blur(8px)",
        padding: "8px 14px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
      }}>
        <button
          className="btn-primary"
          onClick={() => {
            if (playbackIndex >= totalPoints - 1) setPlaybackIndex(0);
            setIsPlaying(!isPlaying);
          }}
          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? "Pause" : "Play Orbit"}</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => {
            setIsPlaying(false);
            setPlaybackIndex(0);
          }}
          style={{ padding: "6px 10px" }}
          title="Reset to beginning"
        >
          <RotateCcw size={13} />
        </button>

        {/* Scrubber slider */}
        <input
          type="range"
          min={0}
          max={totalPoints > 0 ? totalPoints - 1 : 0}
          value={playbackIndex === 0 ? totalPoints - 1 : playbackIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setPlaybackIndex(parseInt(e.target.value, 10));
          }}
          style={{ flex: 1, accentColor: "#0284c7", cursor: "pointer" }}
        />

        <div className="mono" style={{ fontSize: "0.74rem", color: "var(--text-muted)", minWidth: 60, textAlign: "right" }}>
          {times && times.length > 0 && playbackIndex < times.length
            ? `t = ${times[playbackIndex].toFixed(2)}s`
            : times && times.length > 0
            ? `t = ${times[times.length - 1].toFixed(2)}s`
            : "0.00s"}
        </div>
      </div>
    </div>
  );
};
