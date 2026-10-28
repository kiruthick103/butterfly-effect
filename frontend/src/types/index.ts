/**
 * Scientific and UI TypeScript types.
 */

export interface SimulationParameters {
  [key: string]: number;
}

export interface SimulationMetrics {
  initial_distance: number;
  final_distance: number;
  max_distance: number;
  min_distance: number;
  mean_distance: number;
  divergence_threshold: number;
  time_to_threshold: number | null;
  time_to_saturation: number | null;
  saturation_detected: boolean;
  approx_finite_time_growth_rate: number | null;
}

export interface SimulationResult {
  model: "lorenz" | "logistic";
  model_version: string;
  integrator: string;
  software_version: string;
  configuration_hash: string;
  parameters: Record<string, number>;
  initial_state: number[];
  perturbation: number[];
  perturbed_initial_state: number[];
  duration: number;
  dt: number;
  total_steps: number;
  downsample_stride: number;
  metrics: SimulationMetrics;
  scientific_explanation: string;
  times: number[];
  baseline_trajectory: number[][];
  perturbed_trajectory: number[][];
  distances: number[];
  log_divergences: number[];
  // For logistic
  baseline_orbit?: number[];
  perturbed_orbit?: number[];
  regime?: string;
  iterations_index?: number[];
}

export interface Preset {
  id: string;
  name: string;
  model: "lorenz" | "logistic";
  description: string;
  initial_state: number[];
  perturbation: number[];
  parameters: Record<string, number>;
  duration: number;
  dt: number;
  divergence_threshold: number;
}

export interface ScenarioBranch {
  id: string;
  trigger: string;
  effects: string[];
  time_horizon: "short" | "medium" | "long";
  uncertainties: string[];
}

export interface ScenarioResult {
  scenario_title: string;
  provenance_status: string;
  verified_numerical_facts: Record<string, any>;
  assumptions: string[];
  branches: ScenarioBranch[];
  limitations: string[];
  ai_provider: string;
  created_at?: string;
}

export interface EvidenceItem {
  id: string;
  claim: string;
  source: string;
  measured?: string;
  method: string;
  status: "COMPUTED" | "HYPOTHESIS";
  timestamp: string;
}

export interface MicroscopeScale {
  scale: number;
  exponent: number;
  initial_distance: number;
  final_distance: number;
  max_distance: number;
  time_to_threshold: number | null;
  distances: number[];
}

export interface MicroscopeResult {
  model: string;
  axis_name: string;
  initial_state: number[];
  duration: number;
  dt: number;
  times: number[];
  levels: MicroscopeScale[];
  summary_analysis: string;
}

export interface HeatmapResult {
  x_coords: number[];
  y_coords: number[];
  matrix: number[][];
  metric_name: string;
  computation_time_ms: number;
}

export interface BifurcationPoint {
  r: number;
  values: number[];
}

export interface BifurcationResult {
  data: BifurcationPoint[];
  total_points: number;
  explanation: string;
}

export interface GuidedLesson {
  id: string;
  lesson_number: number;
  slug: string;
  title: string;
  objective: string;
  explanation: string;
  recommended_config: {
    model: "lorenz" | "logistic";
    initial_state: number[];
    perturbation: number[];
    duration: number;
    dt: number;
    parameters: Record<string, number>;
  };
  prediction_question: string;
  prediction_options: string[];
  reflection_prompt: string;
}

export interface ExperimentRecord {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  model: string;
  model_version: string;
  parameters: Record<string, number>;
  initial_state: number[];
  perturbation: number[];
  duration: number;
  dt: number;
  integrator: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  latest_run_id?: string;
  latest_metrics?: SimulationMetrics;
  latest_explanation?: string;
}
