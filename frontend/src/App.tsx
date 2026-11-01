import React, { useState, useEffect, useCallback } from "react";
import { Navbar, LabTab } from "./components/Navbar";
import { SynthesisHeader } from "./components/SynthesisHeader";
import { ScenarioBuilder } from "./components/ScenarioBuilder";
import { FutureTree } from "./components/FutureTree";
import { FutureCardsGrid } from "./components/FutureCardsGrid";
import { DecisionLabView } from "./components/DecisionLabView";
import { AISynthesisPanel } from "./components/AISynthesisPanel";
import { PassRateAdaptivePanel } from "./components/PassRateAdaptivePanel";
import { ScenarioWhatIfLab } from "./components/ScenarioWhatIfLab";
import { ScenarioSensitivityView } from "./components/ScenarioSensitivityView";
import { ScenarioEvidenceView } from "./components/ScenarioEvidenceView";
import { FailureSimulationView } from "./components/FailureSimulationView";
import { ExperimentHistoryView } from "./components/ExperimentHistoryView";
import { Trajectory3D } from "./components/Trajectory3D";
import { DivergenceChart } from "./components/DivergenceChart";
import { MetricsPanel } from "./components/MetricsPanel";
import { GuidedLessonsView } from "./components/GuidedLessonsView";
import { api } from "./api/client";
import {
  ScenarioVariable,
  DecisionOption,
  FutureOutcome,
  SynthesisResponse,
  ScenarioWhatIfResponse,
  ScenarioTemplate,
  SimulationResult,
  Preset,
  ExperimentHistoryItem
} from "./types";

const INITIAL_CONDITIONS: Record<string, ScenarioVariable> = {
  hours_until_portal_closes: {
    name: "hours_until_portal_closes",
    label: "Hours to Portal Lockout",
    value: 2,
    unit: "hours",
    min_val: 0.5,
    max_val: 8,
    step: 0.25,
    category: "demand",
    description: "Hours remaining before automated portal submission lockout"
  },
  work_completed_pct: {
    name: "work_completed_pct",
    label: "Manuscript Completed",
    value: 65,
    unit: "%",
    min_val: 25,
    max_val: 95,
    step: 5,
    category: "resources",
    description: "Current percentage of paper written and verified"
  },
  typing_speed_words_hr: {
    name: "typing_speed_words_hr",
    label: "Writing Throughput",
    value: 650,
    unit: "words/hr",
    min_val: 200,
    max_val: 1500,
    step: 50,
    category: "resources",
    description: "Drafting and proofreading speed under pressure"
  },
  references_left_to_format: {
    name: "references_left_to_format",
    label: "Unformatted Citations",
    value: 18,
    unit: "entries",
    min_val: 2,
    max_val: 50,
    step: 2,
    category: "risk",
    description: "Bibliography citations requiring manual formatting"
  },
  grace_period_mins: {
    name: "grace_period_mins",
    label: "Portal Grace Period",
    value: 15,
    unit: "mins",
    min_val: 0,
    max_val: 60,
    step: 5,
    category: "resources",
    description: "Unofficial server clock submission grace buffer"
  }
};

export const App: React.FC = () => {
  // Navigation & Theme
  const [currentTab, setCurrentTab] = useState<LabTab>("synthesis");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Scenario Synthesis State
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tech_event");
  const [scenarioDescription, setScenarioDescription] = useState<string>(
    "Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete."
  );
  const [timeHorizon, setTimeHorizon] = useState<string>("24_hours");
  const [conditions, setConditions] = useState<Record<string, ScenarioVariable>>(INITIAL_CONDITIONS);
  const [synthesisResponse, setSynthesisResponse] = useState<SynthesisResponse | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationStepText, setSimulationStepText] = useState<string>("Analyzing scenario initial conditions...");
  const [selectedFutureId, setSelectedFutureId] = useState<string | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<ScenarioWhatIfResponse | null>(null);

  // Scientific Foundations (Chaos Engine) State
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
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("lorenz-canonical-micro-perturbation");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Auto-synthesize on initial load to match the initial scenario
  useEffect(() => {
    handleSynthesizeFutures("Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete.", {
      hours_until_portal_closes: 2,
      work_completed_pct: 65,
      typing_speed_words_hr: 650,
      references_left_to_format: 18,
      grace_period_mins: 15
    });
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Load Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const list = await api.getScenarioTemplates();
        if (list && list.length > 0) {
          setTemplates(list);
        }
      } catch (err) {
        console.error("Failed to load scenario templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  // Handle Template Selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setScenarioDescription(tmpl.description);
      setTimeHorizon(tmpl.time_horizon);
      if (tmpl.variables && Object.keys(tmpl.variables).length > 0) {
        setConditions(tmpl.variables);
      }
      setSelectedFutureId(null);
      setWhatIfResult(null);
    }
  };

  // Reset to default
  const handleResetScenario = () => {
    handleSelectTemplate("tech_event");
  };

  // Core Synthesize Futures Function with realistic 3.8s simulation wait
  const handleSynthesizeFutures = useCallback(async (overrideDesc?: string, overrideVars?: Record<string, number>) => {
    setIsSynthesizing(true);
    setSimulationProgress(8);
    setSimulationStepText("Detecting domain variables & parameter constraints...");

    const activeDesc = typeof overrideDesc === "string" ? overrideDesc : scenarioDescription;
    const varsPayload: Record<string, number> = overrideVars ? { ...overrideVars } : {};
    
    if (!overrideVars && conditions) {
      Object.entries(conditions).forEach(([k, v]) => {
        varsPayload[k] = v.value;
      });
    }

    // Start API request in parallel
    const apiPromise = api.synthesizeFutures(activeDesc, timeHorizon, varsPayload);

    // Realistic simulation progress ticker (3.8 seconds total wait)
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev < 28) {
          setSimulationStepText("Extracting sensitive initial conditions & boundaries...");
          return prev + 5;
        } else if (prev < 62) {
          setSimulationStepText("Executing 1,000 Monte Carlo perturbation runs...");
          return prev + 5;
        } else if (prev < 88) {
          setSimulationStepText("Computing dynamical bifurcation pass rates & bottlenecks...");
          return prev + 4;
        } else if (prev < 96) {
          setSimulationStepText("Synthesizing plausible future forks & decision pathways...");
          return prev + 2;
        }
        return prev;
      });
    }, 180);

    try {
      const [res] = await Promise.all([
        apiPromise,
        new Promise((resolve) => setTimeout(resolve, 3800)) // 3.8s fake run wait
      ]);

      clearInterval(interval);
      setSimulationProgress(100);
      setSimulationStepText("Simulation complete! Revealing future outcomes...");

      await new Promise((resolve) => setTimeout(resolve, 200));

      setSynthesisResponse(res);
      if (res.detected_conditions && Object.keys(res.detected_conditions).length > 0) {
        setConditions(res.detected_conditions);
      }
      if (res.futures && res.futures.length > 0) {
        setSelectedFutureId(res.futures[0].id);
      }
      setWhatIfResult(null);
    } catch (err) {
      clearInterval(interval);
      console.error("Synthesis error:", err);
    } finally {
      setIsSynthesizing(false);
      setSimulationProgress(0);
    }
  }, [scenarioDescription, timeHorizon, conditions]);

  // Handle Everyday Scenario Preset Click
  const handleSelectPresetScenario = useCallback((presetText: string) => {
    setScenarioDescription(presetText);
    // Passing empty object {} triggers domain variable detection for the preset!
    handleSynthesizeFutures(presetText, {});
  }, [handleSynthesizeFutures]);

  // Decision Lab Handlers
  const handleExecuteDecision = useCallback(async (dec: DecisionOption) => {
    if (!synthesisResponse) return;
    try {
      const varKeys = Object.keys(dec.variable_changes || {});
      const targetVar = varKeys.length > 0 ? varKeys[0] : Object.keys(conditions)[0];
      const newVal = dec.variable_changes && dec.variable_changes[targetVar] !== undefined
        ? dec.variable_changes[targetVar]
        : ((conditions[targetVar]?.value || 10) * 0.8);

      const currentConds: Record<string, number> = {};
      Object.entries(conditions).forEach(([k, v]) => {
        currentConds[k] = v.value;
      });

      const res = await api.runScenarioWhatIf(
        synthesisResponse.scenario_id,
        scenarioDescription,
        targetVar,
        newVal,
        currentConds,
        timeHorizon
      );
      setWhatIfResult(res);
    } catch (e) {
      console.error("Decision execution error:", e);
    }
  }, [synthesisResponse, conditions, scenarioDescription, timeHorizon]);

  const handleTestDecisionPath = useCallback((future: FutureOutcome) => {
    const matchedDec = synthesisResponse?.decision_options?.find(
      d => d.title.toLowerCase().includes(future.title.toLowerCase().split(":")[0]) ||
           d.id.includes(future.id.replace("future_", ""))
    ) || {
      id: future.id,
      title: future.title,
      description: future.decision_path || future.recommended_action || "Immediate high-leverage pivot",
      projected_pass_rate_shift: `${future.score_percentage}% projected likelihood`,
      tradeoff: "Allocating effort toward this branch vs accepting default cascade",
      pros: future.primary_drivers || ["Immediate stabilization", "Reduced cascade probability"],
      cons: [future.potential_impact || "Requires prompt execution under pressure"]
    };

    setCurrentTab("decision-lab");
    handleExecuteDecision(matchedDec);
  }, [synthesisResponse, handleExecuteDecision]);

  // Handle Running Adaptive Next Experiment
  const handleRunNextScenario = useCallback((modifiedVars: Record<string, number>, expTitle: string) => {
    console.log(`Executing adaptive next experiment: ${expTitle}`, modifiedVars);
    handleSynthesizeFutures(scenarioDescription, modifiedVars);
  }, [handleSynthesizeFutures, scenarioDescription]);

  // Initial Theme & Auto-Synthesis on Mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    handleSynthesizeFutures();
  }, []);

  // Scientific Foundations: Load Presets
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

  const executeChaosSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.runSimulation({
        model,
        initial_state: initialState,
        perturbation,
        parameters,
        duration,
        dt,
        divergence_threshold: divergenceThreshold,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Chaos simulation run failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (currentTab === "foundations" && !simulationResult) {
      executeChaosSimulation();
    }
  }, [currentTab]);

  // Replay Experiment Handler from History
  const handleReplayExperiment = (item: ExperimentHistoryItem) => {
    if (item.conditions) {
      setConditions((prev) => {
        const updated = { ...prev };
        Object.entries(item.conditions).forEach(([k, val]) => {
          if (updated[k]) {
            updated[k] = { ...updated[k], value: val };
          }
        });
        return updated;
      });
    }
    setScenarioDescription(item.scenario_description);
    setTimeHorizon(item.time_horizon);
    setCurrentTab("what-if");
  };

  const handleSelectVarFromSensitivity = (varName: string) => {
    setCurrentTab("what-if");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1600, width: "100%", margin: "0 auto", padding: "20px 24px" }}>
        
        {/* TAB: DECISION LAB (Decision Simulator) */}
        {currentTab === "decision-lab" && (
          <DecisionLabView
            description={scenarioDescription}
            baselineFutures={synthesisResponse?.futures || []}
            decisionOptions={synthesisResponse?.decision_options || []}
            conditions={conditions}
            whatifResult={whatIfResult}
            onExecuteDecision={handleExecuteDecision}
            onResetDecision={() => setWhatIfResult(null)}
            isEvaluating={isSynthesizing}
          />
        )}

        {/* TAB 1: SYNTHESIS (Default & Signature Screen) */}
        {currentTab === "synthesis" && (
          <div>
            {/* Primary Workspace: Scenario Input & Presets */}
            <ScenarioBuilder
              description={scenarioDescription}
              onChangeDescription={setScenarioDescription}
              conditions={conditions}
              onChangeConditionValue={(varName, val) => {
                setConditions((prev) => ({
                  ...prev,
                  [varName]: { ...prev[varName], value: val }
                }));
              }}
              onSynthesize={handleSynthesizeFutures}
              onSelectPresetScenario={handleSelectPresetScenario}
              isSynthesizing={isSynthesizing}
            />

            {/* Minimalist Simulation Run Progress Indicator (3-5s Wait) */}
            {isSynthesizing && (
              <div
                style={{
                  maxWidth: 1600,
                  margin: "0 auto 20px auto",
                  padding: "16px 20px",
                  background: "rgba(11, 17, 32, 0.95)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                  borderRadius: 10,
                  boxShadow: "0 4px 24px rgba(6, 182, 212, 0.2)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #06b6d4",
                        borderTopColor: "transparent",
                        animation: "spin 0.7s linear infinite"
                      }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#38bdf8", letterSpacing: "0.03em" }}>
                      {simulationStepText}
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, color: "#34d399" }}>
                    {simulationProgress}%
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, background: "rgba(255, 255, 255, 0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${simulationProgress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #06b6d4 0%, #10b981 100%)",
                      transition: "width 0.15s ease"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Possible Futures: Branching Trajectory Tree (Dynamic Scenario Forks) */}
            <FutureTree
              futures={synthesisResponse?.futures && synthesisResponse.futures.length > 0 ? synthesisResponse.futures : ([
  { id: "branch_1", title: "Automate Bibliography and Submit Early", likelihood_label: "Optimal Recovery", score_percentage: 97, what_happens_next: "Automated citation formatting completes on time.", why_this_happens: "Bypasses manual comma editing bottleneck.", potential_impact: "High - paper accepted on time", recommended_action: "Use BibTeX export immediately" },
  { id: "branch_2", title: "Prune to 20 Core Citations and Submit", likelihood_label: "Alternative Route", score_percentage: 2, what_happens_next: "Paper submits just under peak server load.", why_this_happens: "Reduces bibliography scope to meet cutoff.", potential_impact: "Moderate - minor citations pruned", recommended_action: "Cut non-essential secondary citations" },
  { id: "branch_3", title: "Manual Formatting Past Cutoff (Lockout)", likelihood_label: "Critical Risk", score_percentage: 1, what_happens_next: "Portal clock closes at 12:00:00 AM rejection.", why_this_happens: "Manual APA formatting exceeds remaining 2 hours.", potential_impact: "Severe - complete desk rejection", recommended_action: "Do not attempt manual punctuation formatting" }
] as any)}
              selectedFutureId={selectedFutureId}
              onSelectFuture={(id) => setSelectedFutureId(id)}
              scenarioTitle={synthesisResponse?.scenario_title || "Missing a Deadline: Portal Lockout Prevention"}
            />

            {/* The Three Next-Future Boxes (Primary Focal Point with Next Scenarios in all boxes) */}
            {synthesisResponse && (
              <FutureCardsGrid
                futures={synthesisResponse.futures}
                selectedFutureId={selectedFutureId}
                onSelectFuture={(id) => setSelectedFutureId(id)}
                onTestDecision={handleTestDecisionPath}
                onSelectNextScenario={handleSelectPresetScenario}
              />
            )}

            {/* Pass-Rate Engine & Adaptive Next Scenarios Observatory */}
            {synthesisResponse && (
              <PassRateAdaptivePanel
                passMetrics={synthesisResponse.pass_rate_metrics}
                nextScenarios={synthesisResponse.next_scenarios}
                onRunNextScenario={handleRunNextScenario}
                isSynthesizing={isSynthesizing}
              />
            )}

            {/* Step 7 & 8: AI Synthesis Panel & Analysis Agreement with Monte Carlo Telemetry */}
            {synthesisResponse && (
              <div style={{ marginBottom: "24px" }}>
                <AISynthesisPanel
                  synthesisBrief={synthesisResponse.ai_synthesis_brief}
                  quality={synthesisResponse.synthesis_quality}
                  simulationStats={synthesisResponse.simulation_stats}
                />
              </div>
            )}

            {/* Dedicated Failure Mode Simulation Subsystem (Answers the 7 Questions) */}
            {synthesisResponse && synthesisResponse.failure_modes && synthesisResponse.failure_modes.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <FailureSimulationView
                  failureModes={synthesisResponse.failure_modes}
                  scenarioTitle={synthesisResponse.scenario_title}
                />
              </div>
            )}

            {/* Step 5-8: Embedded What-If Perturbation Lab */}
            {synthesisResponse && (
              <div style={{ marginBottom: "24px" }}>
                <ScenarioWhatIfLab
                  scenarioId={synthesisResponse.scenario_id}
                  description={scenarioDescription}
                  timeHorizon={timeHorizon}
                  conditions={conditions}
                  whatIfResult={whatIfResult}
                  onSetWhatIfResult={setWhatIfResult}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHAT-IF (Dedicated Focus View) */}
        {currentTab === "what-if" && (
          <div>
            <ScenarioWhatIfLab
              scenarioId={synthesisResponse?.scenario_id || "event-scenario-default"}
              description={scenarioDescription}
              timeHorizon={timeHorizon}
              conditions={conditions}
              whatIfResult={whatIfResult}
              onSetWhatIfResult={setWhatIfResult}
            />
          </div>
        )}

        {/* TAB 3: SENSITIVITY (Variable Rankings & Heatmap) */}
        {currentTab === "sensitivity" && (
          <ScenarioSensitivityView
            onSelectVariableForWhatIf={handleSelectVarFromSensitivity}
          />
        )}

        {/* TAB 4: EVIDENCE (Traceable Causal Reasoning) */}
        {currentTab === "evidence" && (
          <ScenarioEvidenceView
            conditions={conditions}
            futures={synthesisResponse?.futures || []}
            synthesisBrief={synthesisResponse?.ai_synthesis_brief || "Analysis completed by multi-stream synthesis engine."}
          />
        )}

        {/* TAB 5: HISTORY (Replayable Experiments) */}
        {currentTab === "history" && (
          <ExperimentHistoryView onReplayExperiment={handleReplayExperiment} />
        )}

        {/* TAB 6: SCIENTIFIC FOUNDATIONS (Lorenz Attractor & Deterministic Chaos) */}
        {currentTab === "foundations" && (
          <div>
            <div className="glass-panel" style={{ padding: "16px 20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  SCIENTIFIC FOUNDATIONS: DETERMINISTIC CHAOS & THE LORENZ SYSTEM
                </h2>
                <span className="provenance-tag computed">MATHEMATICAL FOUNDATION</span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                This is the underlying physical dynamical ODE system discovered by Edward Lorenz in 1963. The non-linear equations demonstrate how deterministic systems exhibit extreme sensitive dependence on initial conditions.
              </p>
            </div>

            {/* Presets and Simulation Viewport */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginBottom: "20px" }}>
              <div className="glass-panel" style={{ padding: "18px" }}>
                <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
                  Canonical Presets
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPresetId(p.id);
                        setModel(p.model);
                        setInitialState(p.initial_state);
                        setPerturbation(p.perturbation);
                        setParameters(p.parameters);
                        setDuration(p.duration);
                        setDt(p.dt);
                        setDivergenceThreshold(p.divergence_threshold);
                      }}
                      className={`btn-secondary ${selectedPresetId === p.id ? "active" : ""}`}
                      style={{ textAlign: "left", fontSize: "0.78rem", padding: "8px 10px" }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={executeChaosSimulation}
                    disabled={isSimulating}
                    className="btn-primary"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  >
                    {isSimulating ? "Integrating RK4..." : "Rerun RK4 Simulation"}
                  </button>
                </div>
              </div>

              {/* 3D Attractor Viewport */}
              <div className="glass-panel" style={{ padding: "12px", minHeight: 380 }}>
                {simulationResult && (
                  <Trajectory3D
                    baselineTrajectory={simulationResult.baseline_trajectory}
                    perturbedTrajectory={simulationResult.perturbed_trajectory}
                    times={simulationResult.times}
                    divergenceThreshold={divergenceThreshold}
                  />
                )}
              </div>
            </div>

            {/* Divergence Chart & Metrics */}
            {simulationResult && (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <DivergenceChart
                  times={simulationResult.times}
                  distances={simulationResult.distances}
                  logDivergences={simulationResult.log_divergences}
                  divergenceThreshold={divergenceThreshold}
                />
                <MetricsPanel
                  metrics={simulationResult.metrics}
                  explanation={simulationResult.scientific_explanation}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 7: LEARN (Guided Educational Lessons) */}
        {currentTab === "learn" && (
          <GuidedLessonsView />
        )}
      </main>
    </div>
  );
};

export default App;
