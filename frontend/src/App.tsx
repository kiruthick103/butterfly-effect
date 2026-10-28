import React, { useState, useEffect } from "react";
import {
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  BookmarkPlus
} from "lucide-react";
import { Navbar, LabTab } from "./components/Navbar";
import { Trajectory3D } from "./components/Trajectory3D";
import { PhasePortrait2D } from "./components/PhasePortrait2D";
import { DivergenceChart } from "./components/DivergenceChart";
import { MetricsPanel } from "./components/MetricsPanel";
import { MicroscopeView } from "./components/MicroscopeView";
import { HeatmapView } from "./components/HeatmapView";
import { BifurcationView } from "./components/BifurcationView";
import { ScenarioLabView } from "./components/ScenarioLabView";
import { EvidenceLedger } from "./components/EvidenceLedger";
import { GuidedLessonsView } from "./components/GuidedLessonsView";
import { HistoryModal } from "./components/HistoryModal";
import { ExportModal } from "./components/ExportModal";
import { api } from "./api/client";
import { SimulationResult, Preset, ExperimentRecord } from "./types";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<LabTab>("chaos-lab");

  // Numerical Model Configuration
  const [model, setModel] = useState<"lorenz" | "logistic">("lorenz");
  const [initialState, setInitialState] = useState<number[]>([1.0, 1.0, 1.0]);
  const [perturbation, setPerturbation] = useState<number[]>([0.000001, 0.0, 0.0]);
  const [parameters, setParameters] = useState<Record<string, number>>({
    sigma: 10.0,
    rho: 28.0,
    beta: 2.666667,
  });
  const [duration, setDuration] = useState<number>(25.0);
  const [dt, setDt] = useState<number>(0.01);
  const [divergenceThreshold, setDivergenceThreshold] = useState<number>(1.0);

  // Presets
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("lorenz-canonical-micro-perturbation");

  // Simulation Execution State
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Load Presets on Mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const data = await api.getPresets();
        setPresets(data);
      } catch (err) {
        console.error("Failed to load presets:", err);
      }
    };
    fetchPresets();
  }, []);

  // Run initial simulation on mount
  useEffect(() => {
    executeSimulation();
  }, []);

  // Apply selected preset
  const handleSelectPreset = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(presetId);
    setModel(found.model);
    setInitialState(found.initial_state);
    setPerturbation(found.perturbation);
    setParameters(found.parameters);
    setDuration(found.duration);
    setDt(found.dt);
    setDivergenceThreshold(found.divergence_threshold);
  };

  const executeSimulation = async () => {
    setIsSimulating(true);
    setSimulationError(null);
    setIsSaved(false);

    try {
      const result = await api.runSimulation({
        model,
        initial_state: initialState,
        perturbation,
        parameters,
        duration,
        dt,
        divergence_threshold: divergenceThreshold,
      });
      setSimulationResult(result);
    } catch (err: any) {
      setSimulationError(err.message || "Failed to execute numerical simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveExperiment = async () => {
    if (!simulationResult) return;
    try {
      await api.createExperiment({
        title: `Lorenz δ = ${perturbation[0]} (${duration}s)`,
        description: `Simulated with RK4 at dt=${dt}, rho=${parameters.rho || 28}`,
        model,
        parameters,
        initial_state: initialState,
        perturbation,
        duration,
        dt,
        metrics: simulationResult.metrics,
        scientific_explanation: simulationResult.scientific_explanation,
        trajectory_data: {
          times: simulationResult.times,
          baseline: simulationResult.baseline_trajectory,
          perturbed: simulationResult.perturbed_trajectory,
          distances: simulationResult.distances,
          log_divergences: simulationResult.log_divergences,
        },
      });
      setIsSaved(true);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleLoadExperiment = (exp: ExperimentRecord) => {
    setModel(exp.model as any);
    setInitialState(exp.initial_state);
    setPerturbation(exp.perturbation);
    setParameters(exp.parameters);
    setDuration(exp.duration);
    setDt(exp.dt);
    setCurrentTab("chaos-lab");
    setTimeout(executeSimulation, 100);
  };

  // Compute perturbed initial coordinate display
  const perturbedInitialState = initialState.map((v, i) => v + (perturbation[i] || 0));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main style={{ flex: 1, paddingBottom: 60 }}>
        {/* Render Views based on Tab */}
        {currentTab === "microscope" && <MicroscopeView />}
        {currentTab === "heatmap" && <HeatmapView />}
        {currentTab === "bifurcation" && <BifurcationView />}
        {currentTab === "scenario-lab" && <ScenarioLabView currentMetrics={simulationResult?.metrics} />}
        {currentTab === "evidence-ledger" && <EvidenceLedger items={[]} />}
        {currentTab === "lessons" && <GuidedLessonsView />}

        {/* NUMERICAL CHAOS LAB (Flagship Core Laboratory) */}
        {currentTab === "chaos-lab" && (
          <div style={{ maxWidth: 1600, margin: "0 auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Scientific Hero Banner */}
            <div className="glass-panel" style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge-computed">NUMERICAL CHAOS LAB</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>Lorenz 1963 Attractor Integration</span>
                </div>
                <h1 style={{ fontSize: "1.45rem", fontWeight: 700, marginTop: 4 }}>
                  Sensitive Dependence on Initial Conditions
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", maxWidth: 880, marginTop: 2 }}>
                  Set up a baseline state, introduce an explicit perturbation as small as 0.000001 (one-millionth), and observe the exact moment the trajectories diverge.
                </p>
              </div>

              {/* Benchmark Presets Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Standard Preset:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="input-field"
                  style={{ width: 260, fontSize: "0.82rem", padding: "6px 10px" }}
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Notification */}
            {simulationError && (
              <div style={{ padding: "12px 18px", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.35)", borderRadius: 8, color: "#fca5a5", fontSize: "0.84rem" }}>
                {simulationError}
              </div>
            )}

            {/* Top Workspace: Controls on Left, 3D Trajectory on Right */}
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
              {/* Controls Column */}
              <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>Experiment Parameters</span>
                  <span className="coord-pill" style={{ color: "#38bdf8" }}>RK4 • dt = {dt}</span>
                </div>

                {/* Model Selector */}
                <div>
                  <label style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                    Dynamical Model
                  </label>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <button
                      className={`btn-secondary ${model === "lorenz" ? "active" : ""}`}
                      onClick={() => setModel("lorenz")}
                      style={{ flex: 1, padding: "6px 10px", fontSize: "0.78rem" }}
                    >
                      Lorenz 3D (1963)
                    </button>
                    <button
                      className={`btn-secondary ${model === "logistic" ? "active" : ""}`}
                      onClick={() => {
                        setModel("logistic");
                        setInitialState([0.5]);
                        setPerturbation([0.000001]);
                        setParameters({ r: 3.9 });
                      }}
                      style={{ flex: 1, padding: "6px 10px", fontSize: "0.78rem" }}
                    >
                      Logistic Map (1976)
                    </button>
                  </div>
                </div>

                {/* Initial Conditions vs Perturbation Comparison */}
                <div style={{
                  background: "rgba(15, 23, 42, 0.65)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>
                    Explicit Phase-Space Perturbation
                  </div>

                  {/* Baseline State inputs */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.76rem", color: "#38bdf8", fontWeight: 600 }}>
                        Baseline State x₀
                      </span>
                      <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                        [{initialState.map((v) => v.toFixed(2)).join(", ")}]
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: model === "lorenz" ? "1fr 1fr 1fr" : "1fr", gap: 6 }}>
                      {initialState.map((val, idx) => (
                        <input
                          key={idx}
                          type="number"
                          step={0.1}
                          className="input-field"
                          value={val}
                          onChange={(e) => {
                            const newInit = [...initialState];
                            newInit[idx] = parseFloat(e.target.value) || 0;
                            setInitialState(newInit);
                          }}
                          title={`Initial coordinate ${idx === 0 ? "X" : idx === 1 ? "Y" : "Z"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Perturbation Delta inputs */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.76rem", color: "#f43f5e", fontWeight: 600 }}>
                        Delta Perturbation δ
                      </span>
                      <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                        Δx = {perturbation[0]}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: model === "lorenz" ? "1fr 1fr 1fr" : "1fr", gap: 6 }}>
                      {perturbation.map((val, idx) => (
                        <input
                          key={idx}
                          type="number"
                          step={0.000001}
                          className="input-field"
                          value={val}
                          onChange={(e) => {
                            const newP = [...perturbation];
                            newP[idx] = parseFloat(e.target.value) || 0;
                            setPerturbation(newP);
                          }}
                          title={`Perturbation coordinate ${idx === 0 ? "Δx" : idx === 1 ? "Δy" : "Δz"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Explicit BASELINE vs PERTURBED Verification Banner */}
                  <div style={{
                    padding: "8px 10px",
                    background: "rgba(8, 12, 20, 0.7)",
                    borderRadius: 6,
                    fontSize: "0.72rem",
                    lineHeight: 1.5,
                    border: "1px solid rgba(148, 163, 184, 0.1)"
                  }}>
                    <div><span style={{ color: "#38bdf8", fontWeight: 600 }}>BASELINE:</span> [{initialState.join(", ")}]</div>
                    <div><span style={{ color: "#f43f5e", fontWeight: 600 }}>PERTURBED:</span> [{perturbedInitialState.map((v) => v.toFixed(6)).join(", ")}]</div>
                  </div>
                </div>

                {/* Duration & Threshold Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: 2 }}>
                      <span>Duration: {duration}s</span>
                      <span className="mono">Steps: {Math.round(duration / dt)}</span>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={60.0}
                      step={5.0}
                      value={duration}
                      onChange={(e) => setDuration(parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: "#0284c7", cursor: "pointer" }}
                    />
                  </div>

                  {model === "lorenz" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>σ (Prandtl)</span>
                        <input
                          type="number"
                          className="input-field"
                          value={parameters.sigma ?? 10.0}
                          onChange={(e) => setParameters({ ...parameters, sigma: parseFloat(e.target.value) || 10.0 })}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>ρ (Rayleigh)</span>
                        <input
                          type="number"
                          className="input-field"
                          value={parameters.rho ?? 28.0}
                          onChange={(e) => setParameters({ ...parameters, rho: parseFloat(e.target.value) || 28.0 })}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>β (Aspect)</span>
                        <input
                          type="number"
                          className="input-field"
                          value={parameters.beta ?? 2.666667}
                          onChange={(e) => setParameters({ ...parameters, beta: parseFloat(e.target.value) || 2.666667 })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Execute Simulation Action Button */}
                <button
                  className="btn-primary"
                  onClick={executeSimulation}
                  disabled={isSimulating}
                  style={{ width: "100%", padding: "12px", fontSize: "0.95rem", marginTop: 4 }}
                >
                  <Play size={16} />
                  <span>{isSimulating ? "Computing Runge-Kutta..." : "RUN EXPERIMENT"}</span>
                </button>
              </div>

              {/* 3D Visualization Canvas */}
              <div className="glass-panel" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 8px 10px 8px" }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>Interactive 3D Phase Space (Lorenz Attractor)</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Drag to orbit • Scroll to zoom</span>
                </div>

                <div style={{ flex: 1, minHeight: 460, background: "#090d16", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {simulationResult ? (
                    <Trajectory3D
                      baselineTrajectory={simulationResult.baseline_trajectory}
                      perturbedTrajectory={simulationResult.perturbed_trajectory}
                      times={simulationResult.times}
                      divergenceThreshold={divergenceThreshold}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
                      Executing simulation...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Workspace: Divergence Charts & Verified Numerical Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
              {/* Divergence over Time Chart */}
              <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>
                    Measured Trajectory Divergence D(t) = ||x(t) - x'(t)||₂
                  </span>
                  <span className="mono" style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                    {simulationResult ? `${simulationResult.total_steps} points computed` : ""}
                  </span>
                </div>

                <div style={{ height: 260, background: "#090d16", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {simulationResult && (
                    <DivergenceChart
                      times={simulationResult.times}
                      distances={simulationResult.distances}
                      logDivergences={simulationResult.log_divergences}
                      divergenceThreshold={divergenceThreshold}
                      timeToThreshold={simulationResult.metrics.time_to_threshold}
                    />
                  )}
                </div>
              </div>

              {/* 2D Planar Phase Portrait Projections */}
              <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>2D Planar Phase Projections</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Switch planes</span>
                </div>

                <div style={{ height: 260, background: "#090d16", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {simulationResult && (
                    <PhasePortrait2D
                      baselineTrajectory={simulationResult.baseline_trajectory}
                      perturbedTrajectory={simulationResult.perturbed_trajectory}
                      defaultPlane="xz"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Verified Numerical Metrics Panel & Explanation */}
            <MetricsPanel
              metrics={simulationResult?.metrics || null}
              explanation={simulationResult?.scientific_explanation || ""}
              configHash={simulationResult?.configuration_hash}
              onSaveExperiment={handleSaveExperiment}
              isSaved={isSaved}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadExperiment={handleLoadExperiment}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        simulationResult={simulationResult}
      />
    </div>
  );
};

export default App;
