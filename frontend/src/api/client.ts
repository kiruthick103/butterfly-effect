/**
 * API Client communicating with the FastAPI scientific simulation backend.
 */

import {
  SimulationResult, Preset, ScenarioResult,
  MicroscopeResult, HeatmapResult, BifurcationResult,
  GuidedLesson, ExperimentRecord
} from "../types";

const BASE_URL = "/api/v1";

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

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) errorMsg = errJson.detail;
        else if (errJson.error?.message) errorMsg = errJson.error.message;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // --- Simulations ---
  async getPresets(): Promise<Preset[]> {
    return this.request<Preset[]>("/simulations/presets");
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

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
