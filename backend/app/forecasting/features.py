"""Feature engineering extracting rate of change, momentum, volatility, and trend."""

import math
from typing import Dict, List, Any


def extract_features(history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute empirical dynamical features from recent observation window."""
    if not history:
        raise ValueError("Cannot extract features from empty history")

    latest = history[-1]
    prev = history[-2] if len(history) >= 2 else latest

    # Target variable for real-time demonstration: Convective Instability Index
    # (Coupled nonlinearly to barometric pressure tendency, thermal gradient, and wind shear)
    curr_target = latest.get("convective_index", 14.2)
    prev_target = prev.get("convective_index", curr_target)

    # 1. Delta change
    delta = round(curr_target - prev_target, 3)
    pct_change = round((delta / max(abs(prev_target), 0.1)) * 100.0, 2)

    # 2. Rate of change (units per minute)
    dt_sec = max(1.0, latest.get("timestamp_unix", 0) - prev.get("timestamp_unix", 0))
    rate_per_min = round((delta / (dt_sec / 60.0)), 3)

    # 3. Recent window statistics (last 15 points)
    window = [obs.get("convective_index", 14.0) for obs in history[-15:]]
    mean_val = sum(window) / float(len(window))
    variance = sum((x - mean_val) ** 2 for x in window) / float(len(window))
    volatility = round(math.sqrt(variance), 3)

    # 4. Barometric Tendency (dP/dt)
    press_curr = latest.get("pressure", 1013.0)
    press_prev = prev.get("pressure", press_curr)
    pressure_tendency = round((press_curr - press_prev) / (dt_sec / 60.0), 3)

    # 5. Trend categorization
    if rate_per_min > 0.05:
        trend = "ACCELERATING_INCREASE"
    elif rate_per_min > 0.01:
        trend = "MODERATE_INCREASE"
    elif rate_per_min < -0.05:
        trend = "ACCELERATING_DECREASE"
    elif rate_per_min < -0.01:
        trend = "MODERATE_DECREASE"
    else:
        trend = "STABLE"

    return {
        "current_value": curr_target,
        "convective_index": curr_target,
        "previous_value": prev_target,
        "delta": delta,
        "percentage_change": pct_change,
        "rate_per_min": rate_per_min,
        "volatility_1h": volatility,
        "pressure_tendency_hpa_min": pressure_tendency,
        "trend": trend,
        "recent_window_points": len(window),
        "temperature": latest.get("temperature", 18.0),
        "pressure": latest.get("pressure", 1013.2),
        "wind_speed": latest.get("wind_speed", 12.0),
        "humidity": latest.get("humidity", 60.0),
        "timestamp": latest.get("timestamp")
    }
