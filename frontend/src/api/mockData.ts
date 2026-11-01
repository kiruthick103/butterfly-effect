import mockScenariosRaw from "./mock_scenarios.json";
import {
  SynthesisResponse,
  ScenarioTemplate,
  ScenarioWhatIfResponse,
  ScenarioSensitivityMatrixResponse,
  ExperimentHistoryItem,
  Preset,
  FutureOutcome
} from "../types";

export const PRESET_SYNTHESIS_MAP: Record<string, SynthesisResponse> = mockScenariosRaw as any;

export const DEFAULT_SYNTHESIS: SynthesisResponse = PRESET_SYNTHESIS_MAP["miss_deadline"] || Object.values(PRESET_SYNTHESIS_MAP)[0];

export const FALLBACK_TEMPLATES: ScenarioTemplate[] = [
  {
    id: "miss_deadline",
    title: "Missing a Deadline: Portal Lockout Prevention",
    description: "Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete.",
    time_horizon: "24_hours",
    domain: "academic_deadline",
    variables: PRESET_SYNTHESIS_MAP["miss_deadline"]?.detected_conditions || {}
  },
  {
    id: "missed_bus",
    title: "Missed Bus Before Exam",
    description: "Missed the morning 8:15 AM bus before a final university exam starting at 9:00 AM. 45 minutes until exam hall doors lock.",
    time_horizon: "24_hours",
    domain: "transit_delay",
    variables: PRESET_SYNTHESIS_MAP["missed_bus"]?.detected_conditions || {}
  },
  {
    id: "battery_dying",
    title: "Phone Battery Dying",
    description: "Phone battery at 7% during an unfamiliar city commute without a charger or power bank and boarding pass on phone.",
    time_horizon: "24_hours",
    domain: "device_resilience",
    variables: PRESET_SYNTHESIS_MAP["battery_dying"]?.detected_conditions || {}
  },
  {
    id: "exam_tomorrow",
    title: "Exam Tomorrow: 14-Hour Syllabus Crunch",
    description: "Semester final exam in 14 hours; completed only 4 of 10 syllabus modules with high sleep deprivation.",
    time_horizon: "24_hours",
    domain: "academic_crunch",
    variables: PRESET_SYNTHESIS_MAP["exam_tomorrow"]?.detected_conditions || {}
  },
  {
    id: "laptop_broken",
    title: "Laptop Screen Crash Before Code Freeze",
    description: "Laptop screen goes black with blinking error LED 3 hours before code freeze deadline with local uncommitted work.",
    time_horizon: "24_hours",
    domain: "hardware_failure",
    variables: PRESET_SYNTHESIS_MAP["laptop_broken"]?.detected_conditions || {}
  }
];

export function getFallbackSynthesis(
  description: string,
  timeHorizon: string = "24_hours",
  variables: Record<string, number> = {}
): SynthesisResponse {
  // Check exact match in preset map
  if (PRESET_SYNTHESIS_MAP[description]) {
    const base = JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP[description]));
    return applyVariableOverrides(base, variables);
  }

  // Keyword match across all 15 presets
  const descLower = description.toLowerCase();
  for (const [key, preset] of Object.entries(PRESET_SYNTHESIS_MAP)) {
    if (
      descLower.includes(key.toLowerCase()) ||
      preset.scenario_title?.toLowerCase().includes(descLower.slice(0, 15)) ||
      (preset as any).description?.toLowerCase().includes(descLower.slice(0, 15))
    ) {
      const base = JSON.parse(JSON.stringify(preset));
      return applyVariableOverrides(base, variables);
    }
  }

  // Check specific keywords
  if (descLower.includes("bus") || descLower.includes("exam hall") || descLower.includes("transit")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["missed_bus"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("battery") || descLower.includes("phone") || descLower.includes("charger")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["battery_dying"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("laptop") || descLower.includes("screen") || descLower.includes("code freeze")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["laptop_broken"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("rain") || descLower.includes("waterlog") || descLower.includes("downpour")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["heavy_rain"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("internet") || descLower.includes("wifi") || descLower.includes("hotspot")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["internet_down"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("traffic") || descLower.includes("airport") || descLower.includes("jam")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["traffic_jam"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("money") || descLower.includes("balance") || descLower.includes("salary")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["out_of_money"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("fever") || descLower.includes("illness") || descLower.includes("interview")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["illness"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("power") || descLower.includes("blackout") || descLower.includes("inverter")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["power_cut"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("package") || descLower.includes("delivery") || descLower.includes("courier")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["late_package"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("birthday") || descLower.includes("party") || descLower.includes("budget")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["birthday_budget"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("group") || descLower.includes("team") || descLower.includes("members")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["group_delay"] || DEFAULT_SYNTHESIS)), variables);
  }
  if (descLower.includes("wake") || descLower.includes("late") || descLower.includes("alarm")) {
    return applyVariableOverrides(JSON.parse(JSON.stringify(PRESET_SYNTHESIS_MAP["wake_late"] || DEFAULT_SYNTHESIS)), variables);
  }

  // Fallback default
  return applyVariableOverrides(JSON.parse(JSON.stringify(DEFAULT_SYNTHESIS)), variables);
}

function applyVariableOverrides(synth: SynthesisResponse, variables: Record<string, number>): SynthesisResponse {
  if (!variables || Object.keys(variables).length === 0) return synth;

  const updated = { ...synth };
  // Update conditions
  if (updated.detected_conditions) {
    Object.entries(variables).forEach(([k, val]) => {
      if (updated.detected_conditions[k]) {
        updated.detected_conditions[k] = { ...updated.detected_conditions[k], value: val };
      }
    });
  }

  // Slightly shift futures based on modified variables
  const varKeys = Object.keys(variables);
  if (varKeys.length > 0 && updated.futures && updated.futures.length === 3) {
    const firstVal = variables[varKeys[0]];
    const cond = updated.detected_conditions ? updated.detected_conditions[varKeys[0]] : null;
    if (cond) {
      const ratio = firstVal / Math.max(cond.max_val, 1);
      const isBufferVar = cond.name.includes("hour") || cond.name.includes("grace") || cond.name.includes("balance") || cond.name.includes("battery");
      const delta = isBufferVar ? Math.round((ratio - 0.5) * 30) : Math.round((0.5 - ratio) * 30);
      
      const newFavorable = Math.max(10, Math.min(95, updated.futures[0].score_percentage + delta));
      const remaining = 100 - newFavorable;
      const newAdverse = Math.round(remaining * 0.7);
      const newCritical = 100 - newFavorable - newAdverse;

      updated.futures[0].score_percentage = newFavorable;
      updated.futures[1].score_percentage = newAdverse;
      updated.futures[2].score_percentage = newCritical;

      if (updated.pass_rate_metrics) {
        updated.pass_rate_metrics.pass_rate_pct = newFavorable;
        updated.pass_rate_metrics.failure_rate_pct = newAdverse;
        updated.pass_rate_metrics.critical_failure_rate_pct = newCritical;
      }
    }
  }

  return updated;
}

export function getFallbackWhatIf(
  scenarioId: string,
  description: string,
  variableName: string,
  newValue: number,
  currentConditions: Record<string, number>,
  timeHorizon: string = "24_hours"
): ScenarioWhatIfResponse {
  const currentVal = currentConditions[variableName] || newValue * 0.8;
  const pctChange = currentVal !== 0 ? Math.round(((newValue - currentVal) / currentVal) * 100) : 10;
  
  const baseSynth = getFallbackSynthesis(description, timeHorizon, currentConditions);
  const whatifSynth = getFallbackSynthesis(description, timeHorizon, { ...currentConditions, [variableName]: newValue });

  return {
    variable_name: variableName,
    variable_label: baseSynth.detected_conditions?.[variableName]?.label || variableName,
    current_value: currentVal,
    new_value: newValue,
    input_change_pct: pctChange,
    baseline_futures: baseSynth.futures,
    whatif_futures: whatifSynth.futures,
    probability_shifts: {
      optimal: {
        baseline_pct: baseSynth.futures[0]?.score_percentage || 85,
        whatif_pct: whatifSynth.futures[0]?.score_percentage || 92,
        delta_pct: (whatifSynth.futures[0]?.score_percentage || 92) - (baseSynth.futures[0]?.score_percentage || 85),
        relative_change_pct: 8.2
      }
    },
    largest_shift_outcome: "Favorable / Optimal Route",
    largest_shift_pct: Math.abs(pctChange),
    butterfly_effect_score: Math.min(10, Math.max(1, Math.round(Math.abs(pctChange) / 10))),
    butterfly_effect_level: Math.abs(pctChange) > 40 ? "HIGH" : "MODERATE",
    ripple_effect_chain: [
      {
        stage: "INPUT_PERTURBATION",
        title: `Perturbation on ${variableName}`,
        detail: `Shifted from ${currentVal} to ${newValue} (${pctChange > 0 ? "+" : ""}${pctChange}%)`,
        severity: "info"
      },
      {
        stage: "BUFFER_ABSORPTION",
        title: "Dynamic Operational Shock Absorption",
        detail: "Downstream delays compressed through available margin buffers.",
        severity: "warning"
      },
      {
        stage: "OUTCOME_BIFURCATION",
        title: "Trajectory Realignment",
        detail: `Pass rate shifts to ${whatifSynth.futures[0]?.score_percentage || 90}% with critical failure rate adjusted.`,
        severity: "success"
      }
    ],
    synthesis_explanation: `Perturbing ${variableName} by ${pctChange}% induces a dynamical shift across the 1,000 Monte Carlo trajectories.`
  };
}

export function getFallbackSensitivity(): ScenarioSensitivityMatrixResponse {
  return {
    variables: ["hours_until_portal_closes", "work_completed_pct", "grace_period_mins"],
    variable_labels: {
      hours_until_portal_closes: "Hours to Portal Lockout",
      work_completed_pct: "Manuscript Completed",
      grace_period_mins: "Portal Grace Period"
    },
    perturbation_percentages: [-20, -10, 0, 10, 20],
    matrix: {
      hours_until_portal_closes: {
        "-20": {
          variable: "hours_until_portal_closes",
          label: "Hours to Portal Lockout",
          perturbation: -20,
          outcome_shift_pct: -35.2,
          sensitivity_score: 9.2,
          sensitivity_level: "EXTREME",
          divergence_description: "Cutting remaining time collapses drafting buffer."
        }
      }
    },
    rankings: [
      {
        variable: "hours_until_portal_closes",
        label: "Hours to Portal Lockout",
        impact: "HIGH",
        sensitivity_score: 9.4,
        primary_risk: "Downstream task lockout cascade",
        default_value: 2,
        unit: "hours"
      },
      {
        variable: "work_completed_pct",
        label: "Manuscript Completed",
        impact: "HIGH",
        sensitivity_score: 8.1,
        primary_risk: "Unfinished drafting backlog",
        default_value: 65,
        unit: "%"
      },
      {
        variable: "grace_period_mins",
        label: "Portal Grace Period",
        impact: "MEDIUM",
        sensitivity_score: 6.2,
        primary_risk: "Server clock network latency jitter",
        default_value: 15,
        unit: "mins"
      }
    ],
    most_sensitive_variable: "hours_until_portal_closes",
    synthesis_insight: "Temporal proximity to hard portal lockout represents the dominant dynamical bifurcation driver."
  };
}

export function getFallbackHistory(): ExperimentHistoryItem[] {
  return [
    {
      id: "exp-init-001",
      title: "Missing a Deadline: Portal Lockout Prevention",
      timestamp: new Date().toISOString(),
      scenario_description: "Research paper submission portal closes in 2 hours; formatting checklist and bibliography 35% incomplete.",
      time_horizon: "24_hours",
      conditions: {
        hours_until_portal_closes: 2,
        work_completed_pct: 65,
        typing_speed_words_hr: 650,
        references_left_to_format: 18,
        grace_period_mins: 15
      },
      whatif_applied: null,
      futures_summary: { optimal: 97, alternative: 2, critical_failure: 1 },
      butterfly_effect: {
        score: 7,
        level: "HIGH",
        largest_shift: "Favorable / Optimal Route"
      },
      uncertainty: "LOW"
    }
  ];
}

export function getFallbackPresets(): Preset[] {
  return [
    {
      id: "lorenz-canonical-micro-perturbation",
      name: "Lorenz-63 Butterfly Attractor",
      model: "lorenz",
      description: "Canonical Lorenz 1963 chaotic attractor with micro-perturbation delta = 10^-6.",
      initial_state: [1.0, 1.0, 1.0],
      perturbation: [0.000001, 0.0, 0.0],
      parameters: { sigma: 10.0, rho: 28.0, beta: 2.666667 },
      duration: 25.0,
      dt: 0.01,
      divergence_threshold: 1.0
    },
    {
      id: "logistic-bifurcation-edge-of-chaos",
      name: "Logistic Map: Edge of Chaos (r = 3.99)",
      model: "logistic",
      description: "Period-doubling cascade into full deterministic chaos.",
      initial_state: [0.5],
      perturbation: [0.000001],
      parameters: { r: 3.99 },
      duration: 100.0,
      dt: 1.0,
      divergence_threshold: 0.1
    }
  ];
}
