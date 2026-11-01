import {
  DEFAULT_SYNTHESIS,
  PRESET_SYNTHESIS_MAP,
  FALLBACK_TEMPLATES,
  getFallbackSynthesis,
  getFallbackWhatIf,
  getFallbackSensitivity,
  getFallbackPresets,
  getFallbackHistory,
} from './mockData';
/**
 * API Client communicating with the FastAPI scientific simulation backend.
 */

import {
  SimulationResult, Preset, ScenarioResult,
  MicroscopeResult, HeatmapResult, BifurcationResult,
  GuidedLesson, ExperimentRecord,
  CurrentForecastResponse, WhatIfResponse,
  SensitivityMatrixResponse, ForecastHistoryResponse,
  LocationOption,
  ScenarioTemplate, ScenarioVariable, SynthesisResponse,
  ScenarioWhatIfResponse, ScenarioSensitivityMatrixResponse,
  ExperimentHistoryItem
} from "../types";

const BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL ? `${(import.meta as any).env.VITE_API_BASE_URL}/api/v1` : "/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("butterfly_auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("butterfly_auth_token", token);
    } else {
      localStorage.removeItem("butterfly_auth_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        return await response.json();
      }

      let errorMsg = `HTTP Error ${response.status}`;
      try {
        if (contentType.includes("application/json")) {
          const errJson = await response.json();
          if (errJson.detail) errorMsg = errJson.detail;
          else if (errJson.error?.message) errorMsg = errJson.error.message;
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    } catch (err) {
      throw err;
    }
  }

  // --- Simulations ---
  async getPresets(): Promise<Preset[]> {
    try {
      return await this.request<Preset[]>("/simulations/presets");
    } catch {
      return getFallbackPresets();
    }
  }

  async runSimulation(payload: {
    model: string;
    initial_state?: number[];
    perturbation?: number[];
    parameters?: Record<string, number>;
    duration?: number;
    dt?: number;
    max_display_points?: number;
    divergence_threshold?: number;
  }): Promise<SimulationResult> {
    return this.request<SimulationResult>("/simulations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- Experiments ---
  async createExperiment(payload: any): Promise<ExperimentRecord> {
    return this.request<ExperimentRecord>("/experiments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async listExperiments(): Promise<ExperimentRecord[]> {
    return this.request<ExperimentRecord[]>("/experiments");
  }

  async getExperiment(id: string): Promise<any> {
    return this.request<any>(`/experiments/${id}`);
  }

  async deleteExperiment(id: string): Promise<any> {
    return this.request<any>(`/experiments/${id}`, {
      method: "DELETE",
    });
  }

  async replayExperiment(id: string): Promise<any> {
    return this.request<any>(`/experiments/${id}/replay`, {
      method: "POST",
    });
  }

  async compareExperiments(idA: string, idB: string): Promise<any> {
    return this.request<any>(`/experiments/${idA}/compare/${idB}`);
  }

  // --- Flagship Features ---
  async runMicroscope(payload: {
    model?: string;
    initial_state?: number[];
    scales?: number[];
    axis?: number;
    duration?: number;
    dt?: number;
  }): Promise<MicroscopeResult> {
    return this.request<MicroscopeResult>("/microscope", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async runHeatmap(payload: {
    fixed_z?: number;
    x_range?: number[];
    y_range?: number[];
    resolution?: number;
    perturbation?: number;
    duration?: number;
    dt?: number;
  }): Promise<HeatmapResult> {
    return this.request<HeatmapResult>("/heatmap", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async runBifurcation(payload: {
    r_min?: number;
    r_max?: number;
    r_steps?: number;
    iterations?: number;
    burn_in?: number;
    x0?: number;
  }): Promise<BifurcationResult> {
    return this.request<BifurcationResult>("/bifurcation", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- AI Scenario Lab ---
  async generateScenario(payload: {
    prompt: string;
    experiment_id?: string;
    numerical_context?: Record<string, any>;
  }): Promise<ScenarioResult> {
    return this.request<ScenarioResult>("/scenarios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- Guided Lessons ---
  async listLessons(): Promise<GuidedLesson[]> {
    return this.request<GuidedLesson[]>("/lessons");
  }

  async getLesson(slug: string): Promise<GuidedLesson> {
    return this.request<GuidedLesson>(`/lessons/${slug}`);
  }

  // --- Authentication ---
  async login(payload: { email: string; password: string }): Promise<any> {
    const res = await this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async register(payload: { email: string; password: string; full_name?: string }): Promise<any> {
    const res = await this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async getMe(): Promise<any> {
    return this.request<any>("/auth/me");
  }

  // --- Real-Time Forecasting & Sensitivity Lab ---
  async getForecastingLocations(): Promise<LocationOption[]> {
    return this.request<LocationOption[]>("/forecasting/locations");
  }

  async getCurrentForecast(location: string = "nyc", demo: boolean = false): Promise<CurrentForecastResponse> {
    return this.request<CurrentForecastResponse>(`/forecasting/current?location=${encodeURIComponent(location)}&demo=${demo}`);
  }

  async runWhatIf(variable: string, perturbationPercentage: number, horizonSteps: number = 15): Promise<WhatIfResponse> {
    return this.request<WhatIfResponse>("/forecasting/whatif", {
      method: "POST",
      body: JSON.stringify({
        variable,
        perturbation_percentage: perturbationPercentage,
        horizon_steps: horizonSteps
      })
    });
  }

  async getSensitivityMatrix(): Promise<SensitivityMatrixResponse> {
    return this.request<SensitivityMatrixResponse>("/forecasting/sensitivity");
  }

  async getForecastHistory(): Promise<ForecastHistoryResponse> {
    return this.request<ForecastHistoryResponse>("/forecasting/history");
  }

  // --- Scenario-Based Future Forecasting & Butterfly Effect Simulator ---
  async getScenarioTemplates(): Promise<ScenarioTemplate[]> {
    try {
      return await this.request<ScenarioTemplate[]>("/synthesis/templates");
    } catch {
      return FALLBACK_TEMPLATES;
    }
  }

  async normalizeScenario(description: string, variables: Record<string, number> = {}): Promise<{ template_id: string; title: string; time_horizon: string; detected_conditions: Record<string, ScenarioVariable> }> {
    return this.request("/synthesis/normalize", {
      method: "POST",
      body: JSON.stringify({ description, variables })
    });
  }

  async synthesizeFutures(description: string, time_horizon: string = "24_hours", variables: Record<string, number> = {}): Promise<SynthesisResponse> {
    try {
      return await this.request<SynthesisResponse>("/synthesis/generate", {
        method: "POST",
        body: JSON.stringify({ description, time_horizon, variables })
      });
    } catch (err) {
      console.info("[Offline/Vercel Engine] Running dynamical synthesis fallback:", err);
      return getFallbackSynthesis(description, time_horizon, variables);
    }
  }

  async runScenarioWhatIf(
    scenario_id: string,
    description: string,
    variable_name: string,
    new_value: number,
    current_conditions: Record<string, number>,
    time_horizon: string = "24_hours"
  ): Promise<ScenarioWhatIfResponse> {
    try {
      return await this.request<ScenarioWhatIfResponse>("/synthesis/whatif", {
        method: "POST",
        body: JSON.stringify({
          scenario_id,
          description,
          variable_name,
          new_value,
          current_conditions,
          time_horizon
        })
      });
    } catch {
      return getFallbackWhatIf(scenario_id, description, variable_name, new_value, current_conditions, time_horizon);
    }
  }

  async getScenarioSensitivity(): Promise<ScenarioSensitivityMatrixResponse> {
    try {
      return await this.request<ScenarioSensitivityMatrixResponse>("/synthesis/sensitivity");
    } catch {
      return getFallbackSensitivity();
    }
  }

  async getExperimentHistory(): Promise<ExperimentHistoryItem[]> {
    try {
      return await this.request<ExperimentHistoryItem[]>("/synthesis/history");
    } catch {
      return getFallbackHistory();
    }
  }

  async deleteScenarioExperiment(expId: string): Promise<{ status: string; id: string }> {
    return this.request<{ status: string; id: string }>(`/synthesis/history/${encodeURIComponent(expId)}`, {
      method: "DELETE"
    });
  }
}

export const api = new ApiClient();


