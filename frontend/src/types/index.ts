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

export interface DataSourceInfo {
  provider: string;
  station: string;
  latitude: number;
  longitude: number;
  endpoint: string;
  status: "LIVE" | "DEMO" | "STALE" | "OFFLINE";
  latency_ms: number;
  last_ingested_iso: string;
  update_frequency: string;
  note: string;
}

export interface DataQualityReport {
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  healthy: boolean;
  volatility_1h: number;
  checks_passed: string[];
  warnings: string[];
}

export interface CurrentTelemetry {
  temperature_celsius: number;
  surface_pressure_hpa: number;
  wind_speed_kmh: number;
  relative_humidity_pct: number;
  timestamp: string;
}

export interface AtmosphericFeatures {
  current_value: number;
  convective_index?: number;
  previous_value: number;
  delta: number;
  percentage_change: number;
  rate_per_min: number;
  volatility_1h: number;
  pressure_tendency_hpa_min: number;
  trend: "ACCELERATING_INCREASE" | "MODERATE_INCREASE" | "STABLE" | "MODERATE_DECREASE" | "ACCELERATING_DECREASE";
  recent_window_points: number;
  temperature: number;
  pressure: number;
  wind_speed: number;
  humidity: number;
  timestamp?: string;
}

export interface ModelBreakdownItem {
  name: string;
  type: string;
  direction: "INCREASING" | "DECREASING" | "STABLE";
  confidence: number;
  final_prediction: number;
  explanation: string;
}

export interface ForecastResult {
  direction: "INCREASING" | "DECREASING" | "STABLE";
  confidence_score: number;
  confidence_pct: number;
  horizon_minutes: number;
  expected_delta: number;
  trajectory: number[];
  confidence_band: {
    upper: number[];
    lower: number[];
  };
  alternative_probabilities: {
    increasing: number;
    stable: number;
    decreasing: number;
  };
  model_breakdown: ModelBreakdownItem[];
}

export interface ForecastEvidenceItem {
  id: string;
  category: string;
  title: string;
  detail: string;
  status: "COMPUTED" | "OBSERVED" | "VERIFIED";
}

export interface TimelinePoint {
  timestamp: string;
  minute_offset: number;
  value: number;
  upper?: number;
  lower?: number;
  is_projected?: boolean;
}

export interface CurrentForecastResponse {
  domain: string;
  target_description: string;
  is_live: boolean;
  data_source: DataSourceInfo;
  data_quality: DataQualityReport;
  current_telemetry: CurrentTelemetry;
  features: AtmosphericFeatures;
  forecast: ForecastResult;
  evidence: ForecastEvidenceItem[];
  intelligence_brief: string;
  provenance_tag: string;
  past_timeline: TimelinePoint[];
  future_timeline: TimelinePoint[];
}

export interface RippleTraceItem {
  stage: "INPUT" | "FEATURES" | "MODEL" | "FORECAST";
  label: string;
  value: string;
  detail: string;
}

export interface WhatIfResponse {
  perturbed_variable: string;
  perturbation_percentage: number;
  baseline_initial: number;
  perturbed_initial: number;
  final_forecast_shift: number;
  percentage_forecast_shift: number;
  baseline_forecast: number[];
  perturbed_forecast: number[];
  divergence_series: number[];
  time_minutes: number[];
  ripple_trace: RippleTraceItem[];
  interpretation: string;
}

export interface SensitivityMatrixCell {
  variable: string;
  perturbation: number;
  forecast_shift: number;
  pct_shift: number;
  sensitivity_level: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
}

export interface SensitivityMatrixResponse {
  variables: string[];
  variable_labels: Record<string, string>;
  perturbation_percentages: number[];
  sensitivity_matrix: Record<string, Record<string, SensitivityMatrixCell>>;
  most_sensitive_variable: string;
  explanation: string;
}

export interface ForecastHistoryItem {
  id: string;
  timestamp: string;
  forecast_target: string;
  predicted_value: number;
  actual_outcome: number | null;
  error: number | null;
  direction_predicted: string;
  direction_actual: string | null;
  confidence: number;
  evaluated: boolean;
  model_version: string;
  data_status: string;
}

export interface ForecastHistoryResponse {
  predictions_made: number;
  predictions_evaluated: number;
  mae: number;
  rmse: number;
  directional_accuracy_pct: number;
  history: ForecastHistoryItem[];
}

export interface LocationOption {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

// --- Scenario-Based Synthesis & Butterfly Effect Simulation ---

export interface ScenarioVariable {
  name: string;
  label: string;
  value: number;
  unit: string;
  min_val: number;
  max_val: number;
  step: number;
  category: string;
  description: string;
}

export interface FutureMilestone {
  time: string;
  event: string;
  impact: string;
}

export interface SubScenario {
  title: string;
  effect_percentage: number;
  trigger_event: string;
  consequence: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  variable_changes?: Record<string, number>;
  projected_pass_rate_shift?: string;
  tradeoff?: string;
  pros?: string[];
  cons?: string[];
}

export interface FutureOutcome {
  likelihood_label?: string;
  category?: string;
  decision_path?: string;
  what_happens_next?: string;
  why_this_happens?: string;
  potential_impact?: string;
  recommended_action?: string;
  what_happens_after?: string;
  next_scenario?: string;
  sub_scenarios?: SubScenario[];
  sub_scenario?: SubScenario;
  butterfly_effect?: string;
  id: string;
  title: string;
  score: number;
  score_percentage: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  expected_result: string;
  primary_drivers: string[];
  uncertainty: string;
  milestones: FutureMilestone[];
}

export interface SynthesisQuality {
  input_completeness_pct: number;
  scenario_clarity: string;
  outcome_separation: string;
  uncertainty: string;
  analysis_agreement: string;
  agreement_score: number;
}

export interface FailureMode {
  id: string;
  name: string;
  trigger_condition: string;
  root_cause: string;
  first_failure: string;
  cascade_steps: string[];
  amplifying_variables: string[];
  mitigation: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export interface SimulationTrialStats {
  method: string;
  trials_run: number;
  seed: number;
  distribution: Record<string, number>;
  confidence_intervals: Record<string, [number, number]>;
  p10: number;
  p50: number;
  p90: number;
  execution_time_ms: number;
}

export interface PassRateMetrics {
  total_trials: number;
  successful_trials: number;
  failed_trials: number;
  pass_rate_pct: number;
  failure_rate_pct: number;
  critical_failure_rate_pct: number;
  primary_bottleneck: string;
  resource_utilization_pct: number;
  recovery_rate_pct: number;
  confidence_interval_95: [number, number];
}

export interface AdaptiveNextScenario {
  id: string;
  type: string;
  title: string;
  description: string;
  hypothesis: string;
  modified_variables: Record<string, number>;
  target_metric: string;
  projected_pass_rate_shift: string;
}

export interface SynthesisResponse {
  scenario_id: string;
  scenario_title: string;
  time_horizon: string;
  domain?: string;
  detected_conditions: Record<string, ScenarioVariable>;
  futures: FutureOutcome[];
  failure_modes?: FailureMode[];
  simulation_stats?: SimulationTrialStats;
  pass_rate_metrics?: PassRateMetrics;
  next_scenarios?: AdaptiveNextScenario[];
  decision_options?: DecisionOption[];
  ai_synthesis_brief: string;
  synthesis_quality: SynthesisQuality;
  assumptions?: string[];
  created_at: string;
}

export interface RippleStep {
  stage: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "danger" | "success";
}

export interface ProbabilityShift {
  baseline_pct: number;
  whatif_pct: number;
  delta_pct: number;
  relative_change_pct: number;
}

export interface ScenarioWhatIfResponse {
  variable_name: string;
  variable_label: string;
  current_value: number;
  new_value: number;
  input_change_pct: number;
  baseline_futures: FutureOutcome[];
  whatif_futures: FutureOutcome[];
  probability_shifts: Record<string, ProbabilityShift>;
  largest_shift_outcome: string;
  largest_shift_pct: number;
  butterfly_effect_score: number;
  butterfly_effect_level: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  ripple_effect_chain: RippleStep[];
  synthesis_explanation: string;
}

export interface ScenarioSensitivityRanking {
  variable: string;
  label: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  sensitivity_score: number;
  primary_risk: string;
  default_value: number;
  unit: string;
}

export interface ScenarioSensitivityMatrixResponse {
  variables: string[];
  variable_labels: Record<string, string>;
  perturbation_percentages: number[];
  matrix: Record<string, Record<string, {
    variable: string;
    label: string;
    perturbation: number;
    outcome_shift_pct: number;
    sensitivity_score: number;
    sensitivity_level: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
    divergence_description: string;
  }>>;
  rankings: ScenarioSensitivityRanking[];
  most_sensitive_variable: string;
  synthesis_insight: string;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  time_horizon: string;
  domain: string;
  variables: Record<string, ScenarioVariable>;
}

export interface ExperimentHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  scenario_description: string;
  time_horizon: string;
  conditions: Record<string, number>;
  whatif_applied: {
    variable: string;
    old_value: number;
    new_value: number;
    change_pct: number;
  } | null;
  futures_summary: Record<string, number>;
  butterfly_effect: {
    score: number;
    level: string;
    largest_shift: string;
  };
  uncertainty: string;
}


