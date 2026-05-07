"""
AI Engine Helper Utilities
"""

import math
import random
from typing import Dict, List


def calculate_cost(distance_km: float, transport_mode: str, priority: str) -> float:
    """Calculate shipping cost based on distance, mode, and priority."""
    base_rates = {"road": 5.0, "air": 25.0, "water": 3.0}
    priority_multipliers = {"critical": 3.0, "express": 2.0, "standard": 1.0, "economy": 0.7}

    base = base_rates.get(transport_mode, 5.0)
    multiplier = priority_multipliers.get(priority, 1.0)
    return round(distance_km * base * multiplier, 2)


def select_transport_mode(distance_km: float, weight_kg: float) -> str:
    """Determine optimal transport mode."""
    if weight_kg >= 500:
        return "water"
    if distance_km > 50:
        return "air"
    return "road"


def generate_traffic_factor(hour: int = None) -> float:
    """Generate realistic traffic factor based on time of day."""
    if hour is None:
        import datetime
        hour = datetime.datetime.now().hour

    # Peak hours: 8-10 AM and 5-8 PM
    if 8 <= hour <= 10:
        return random.uniform(1.5, 2.5)
    elif 17 <= hour <= 20:
        return random.uniform(1.8, 3.0)
    elif 22 <= hour or hour <= 5:
        return random.uniform(0.7, 1.0)
    else:
        return random.uniform(1.0, 1.5)


def generate_weather_factor() -> Dict:
    """Generate simulated weather conditions."""
    conditions = [
        {"condition": "clear", "factor": 1.0, "risk": 0.0},
        {"condition": "cloudy", "factor": 1.05, "risk": 0.05},
        {"condition": "light_rain", "factor": 1.3, "risk": 0.2},
        {"condition": "heavy_rain", "factor": 1.8, "risk": 0.5},
        {"condition": "storm", "factor": 2.5, "risk": 0.8},
        {"condition": "fog", "factor": 1.5, "risk": 0.3},
    ]
    weights = [0.4, 0.25, 0.15, 0.1, 0.03, 0.07]
    return random.choices(conditions, weights=weights, k=1)[0]


def normalize_score(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-1 range."""
    if max_val == min_val:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))
