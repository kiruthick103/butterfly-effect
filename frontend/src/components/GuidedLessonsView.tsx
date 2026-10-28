import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle2, HelpCircle, ArrowRight, Play, Sparkles } from "lucide-react";
import { api } from "../api/client";
import { GuidedLesson, SimulationResult } from "../types";
import { Trajectory3D } from "./Trajectory3D";
import { DivergenceChart } from "./DivergenceChart";

export const GuidedLessonsView: React.FC = () => {
  const [lessons, setLessons] = useState<GuidedLesson[]>([]);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [hasPredicted, setHasPredicted] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await api.listLessons();
        setLessons(data);
      } catch (err) {
        console.error("Failed to load lessons:", err);
      }
    };
    fetchLessons();
  }, []);

  const currentLesson = lessons[activeLessonIdx];

  const handleRunLessonExperiment = async () => {
    if (!currentLesson) return;
    setIsSimulating(true);
    try {
      const config = currentLesson.recommended_config;
      const res = await api.runSimulation({
        model: config.model,
        initial_state: config.initial_state,
        perturbation: config.perturbation,
        duration: config.duration,
        dt: config.dt,
        parameters: config.parameters,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Failed to run lesson simulation:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const nextLesson = () => {
    if (activeLessonIdx < lessons.length - 1) {
      setActiveLessonIdx(activeLessonIdx + 1);
      setSelectedPrediction(null);
      setHasPredicted(false);
      setSimulationResult(null);
    }
  };

  if (!currentLesson) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        Loading guided inquiry lessons...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Lesson Selector Breadcrumbs */}
      <div className="glass-panel" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        {lessons.map((lsn, idx) => (
          <button
            key={lsn.id}
            className={`btn-secondary ${activeLessonIdx === idx ? "active" : ""}`}
            onClick={() => {
              setActiveLessonIdx(idx);
              setSelectedPrediction(null);
              setHasPredicted(false);
              setSimulationResult(null);
            }}
            style={{ padding: "6px 12px", fontSize: "0.78rem", whiteSpace: "nowrap" }}
          >
            <span>Lesson {lsn.lesson_number}</span>
          </button>
        ))}
      </div>

      {/* Main POE Container */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: 20 }}>
        {/* Left Column: Lesson Content & POE Question */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-panel" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge-computed">LESSON {currentLesson.lesson_number} OF {lessons.length}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Inquiry-Based Learning</span>
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>{currentLesson.title}</h2>

            <div style={{ fontSize: "0.86rem", color: "#38bdf8", fontWeight: 500 }}>
              Objective: {currentLesson.objective}
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {currentLesson.explanation}
            </div>
          </div>

          {/* STEP 1: Predict (POE Paradigm) */}
          <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, borderLeft: "4px solid #38bdf8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={18} color="#38bdf8" />
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Step 1: Commit to a Hypothesis</span>
            </div>

            <p style={{ fontSize: "0.86rem", color: "var(--text-main)" }}>
              {currentLesson.prediction_question}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentLesson.prediction_options?.map((opt, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: selectedPrediction === idx ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.5)",
                    border: selectedPrediction === idx ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid var(--border-subtle)",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "0.82rem"
                  }}
                >
                  <input
                    type="radio"
                    name="prediction"
                    checked={selectedPrediction === idx}
                    onChange={() => {
                      setSelectedPrediction(idx);
                      setHasPredicted(true);
                    }}
                    style={{ accentColor: "#0284c7" }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {hasPredicted && (
              <button
                className="btn-primary"
                onClick={handleRunLessonExperiment}
                disabled={isSimulating}
                style={{ marginTop: 8 }}
              >
                <Play size={14} />
                <span>{isSimulating ? "Running Experiment..." : "Step 2: Run & Observe Experiment"}</span>
              </button>
            )}
          </div>

          {/* STEP 3: Explanation / Reflection */}
          {simulationResult && (
            <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, borderLeft: "4px solid #10b981" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Step 3: Reflect on the Evidence</span>
              </div>

              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {currentLesson.reflection_prompt}
              </div>

              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                {activeLessonIdx < lessons.length - 1 && (
                  <button className="btn-primary" onClick={nextLesson}>
                    <span>Next Lesson</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualizer for Lesson Experiment */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Lesson Trajectory Observation</span>
            {simulationResult && (
              <span className="badge-computed">MEASURED: D(T) = {simulationResult.metrics.final_distance.toFixed(4)}</span>
            )}
          </div>

          <div style={{ height: 320, background: "#090d16", borderRadius: 8, overflow: "hidden" }}>
            {simulationResult ? (
              <Trajectory3D
                baselineTrajectory={simulationResult.baseline_trajectory}
                perturbedTrajectory={simulationResult.perturbed_trajectory}
                times={simulationResult.times}
              />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                Make your prediction on the left, then click "Run & Observe Experiment".
              </div>
            )}
          </div>

          {simulationResult && (
            <div style={{ height: 200, background: "#090d16", borderRadius: 8, overflow: "hidden" }}>
              <DivergenceChart
                times={simulationResult.times}
                distances={simulationResult.distances}
                logDivergences={simulationResult.log_divergences}
                divergenceThreshold={simulationResult.metrics.divergence_threshold}
                timeToThreshold={simulationResult.metrics.time_to_threshold}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
