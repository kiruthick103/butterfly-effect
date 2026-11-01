"""AI Adapters Layer: Dual-provider inference (Groq & Gemini) for scenario interpretation and synthesis."""

import json
import logging
from typing import Dict, List, Any, Optional, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger("butterfly_effect_lab.ai_adapters")

COMMON_HEADERS = {
    "User-Agent": "ButterflyEffectLab/1.0 (SimulationObservatory)",
    "Content-Type": "application/json"
}


class GroqAdapter:
    """Groq API Adapter for ultra-fast structured analytical scenario inference."""

    @staticmethod
    async def is_available() -> bool:
        return bool(settings.GROQ_API_KEY)

    @staticmethod
    async def chat_completion(prompt: str, system_prompt: str = "You are a quantitative systems simulation scientist. Respond in valid JSON only.", temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        if not settings.GROQ_API_KEY:
            return None

        headers = {
            **COMMON_HEADERS,
            "Authorization": f"Bearer {settings.GROQ_API_KEY}"
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": temperature
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"].strip()
                    return json.loads(content)
                else:
                    logger.warning(f"Groq API error {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Groq invocation failed: {e}")
        return None


class GeminiAdapter:
    """Gemini API Adapter for adversarial stress-testing, edge-case failure modes, and scenario critiquing."""

    @staticmethod
    async def is_available() -> bool:
        return bool(settings.GEMINI_API_KEY)

    @staticmethod
    async def generate_json(prompt: str, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        if not settings.GEMINI_API_KEY:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": temperature
            }
        }

        try:
            async with httpx.AsyncClient(timeout=14.0) as client:
                resp = await client.post(url, headers=COMMON_HEADERS, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                        return json.loads(raw_text)
                else:
                    logger.warning(f"Gemini API error {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini invocation failed: {e}")
        return None


class OpenRouterAdapter:
    """OpenRouter API Adapter connecting to DeepSeek, Llama 3.3, and 100+ models."""

    @staticmethod
    async def is_available() -> bool:
        return bool(settings.OPENROUTER_API_KEY)

    @staticmethod
    async def chat_completion(prompt: str, system_prompt: str = "You are a quantitative systems simulation scientist. Respond in valid JSON only.", temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        if not settings.OPENROUTER_API_KEY:
            return None

        headers = {
            **COMMON_HEADERS,
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://127.0.0.1:5173",
            "X-Title": "Butterfly Effect Lab"
        }
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": temperature
        }

        try:
            async with httpx.AsyncClient(timeout=16.0) as client:
                resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"].strip()
                    return json.loads(content)
                else:
                    logger.warning(f"OpenRouter API error {resp.status_code}: {resp.text[300:]}")
        except Exception as e:
            logger.warning(f"OpenRouter invocation failed: {e}")
        return None


class DualModelSynthesizer:
    """Coordinates independent multi-stream scenario intelligence from Groq & Gemini."""

    @classmethod
    async def interpret_raw_scenario(cls, description: str) -> Optional[Dict[str, Any]]:
        """Extract domain, numerical variables with bounds, constraints, and failure modes from free text."""
        prompt = f"""You are a quantitative systems analyst. Analyze this scenario description and convert it into a structured mathematical simulation model:
"{description}"

Return JSON strictly matching this schema:
{{
  "title": "Concise Scenario Title (e.g. Startup Runway & Customer Acquisition)",
  "domain": "business|operations|tech|logistics|health|environmental",
  "time_horizon": "e.g. 6_months, 24_hours, 30_days",
  "assumptions": ["assumption 1", "assumption 2"],
  "variables": {{
    "variable_key": {{
      "name": "variable_key",
      "label": "Human Readable Label",
      "value": 100.0,
      "unit": "USD/req/staff/days",
      "min_val": 10.0,
      "max_val": 500.0,
      "step": 5.0,
      "category": "demand|capacity|resources|finance|risk",
      "description": "What this represents in the system"
    }}
  }},
  "failure_modes": [
    {{
      "id": "fail_1",
      "name": "Failure Mode Name",
      "trigger_condition": "e.g. runway < 1.5 months or server load > 90%",
      "root_cause": "Underlying operational or market mechanism",
      "first_failure": "What breaks first?",
      "cascade_steps": ["step 1", "step 2", "step 3"],
      "amplifying_variables": ["variable_key_1"],
      "mitigation": "Recommended preventative or recovery action",
      "severity": "CRITICAL|HIGH|MODERATE"
    }}
  ]
}}
Ensure you detect at least 3 to 5 key numerical variables that determine success or failure. Output valid JSON only."""

        # Try Groq first for sub-second parsing; fall back to Gemini
        res = await GroqAdapter.chat_completion(prompt)
        if res and "variables" in res and len(res["variables"]) >= 2:
            return res

        res_gem = await GeminiAdapter.generate_json(prompt)
        if res_gem and "variables" in res_gem and len(res_gem["variables"]) >= 2:
            return res_gem

        res_or = await OpenRouterAdapter.chat_completion(prompt)
        if res_or and "variables" in res_or and len(res_or["variables"]) >= 2:
            return res_or

        return None

    @classmethod
    async def run_dual_analysis(cls, description: str, variables: Dict[str, float]) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """Run Groq (Stream A: Operational Model) and Gemini (Stream B: Adversarial Stress Test)."""
        prompt_groq = f"""Analyze the forward outcomes and plausible future states of this scenario:
Scenario: "{description}"
Parameters: {json.dumps(variables)}

Return JSON with:
{{
  "futures": [
    {{
      "id": "favorable",
      "title": "Title of favorable/nominal outcome",
      "category": "favorable",
      "expected_result": "Detailed operational result",
      "primary_drivers": ["driver 1", "driver 2"],
      "uncertainty": "Uncertainty description",
      "milestones": [
        {{"time": "t1", "event": "Milestone event 1", "impact": "Impact 1"}},
        {{"time": "t2", "event": "Milestone event 2", "impact": "Impact 2"}},
        {{"time": "t3", "event": "Milestone event 3", "impact": "Impact 3"}}
      ]
    }},
    {{
      "id": "adverse",
      "title": "Title of strained/overload outcome",
      "category": "adverse",
      "expected_result": "Detailed degradation result",
      "primary_drivers": ["driver 1", "driver 2"],
      "uncertainty": "Uncertainty description",
      "milestones": [...]
    }},
    {{
      "id": "critical_failure",
      "title": "Title of failure/breakdown outcome",
      "category": "critical_failure",
      "expected_result": "Detailed failure result",
      "primary_drivers": ["driver 1", "driver 2"],
      "uncertainty": "Uncertainty description",
      "milestones": [...]
    }}
  ],
  "synthesis_brief": "2-3 sentence structural assessment of primary risks."
}}
Output raw JSON only."""

        prompt_gemini = f"""You are an adversarial stress-testing simulation analyst.
Scrutinize this system for hidden cascades, nonlinear feedback loops, and failure modes:
Scenario: "{description}"
Parameters: {json.dumps(variables)}

Return JSON with:
{{
  "adversarial_findings": [
    "Vulnerability 1 with cascading potential",
    "Hidden dependency 2"
  ],
  "critical_failure_modes": [
    {{
      "id": "cascade_fail",
      "name": "Cascade Failure Mode",
      "first_failure": "Component that fails first",
      "trigger_condition": "Threshold that triggers it",
      "cascade_steps": ["Step 1", "Step 2"],
      "amplifying_variables": ["var1"],
      "mitigation": "Mitigation action",
      "severity": "CRITICAL"
    }}
  ],
  "adversarial_brief": "2-3 sentence adversarial verdict explaining why initial conditions may rapidly diverge into collapse."
}}
Output raw JSON only."""

        res_a = await GroqAdapter.chat_completion(prompt_groq)
        res_b = await GeminiAdapter.generate_json(prompt_gemini)

        if not res_a:
            res_a = await OpenRouterAdapter.chat_completion(prompt_groq)
        if not res_b and settings.OPENROUTER_API_KEY:
            res_b = await OpenRouterAdapter.chat_completion(prompt_gemini)

        return res_a, res_b
