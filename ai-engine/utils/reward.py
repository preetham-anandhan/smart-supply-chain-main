"""
Reward Functions for RL-based Route Optimization
Defines multi-objective reward signals for the logistics RL agent.
"""

import math
from typing import Dict, Optional


def delivery_reward(
    distance_traveled: float,
    time_taken_min: float,
    sla_hours: float,
    delivered: bool,
    fuel_remaining: float,
    priority: str = "standard",
) -> float:
    """
    Compute reward for a delivery outcome.

    Rewards:
        +100 for successful delivery
        Bonus for beating SLA deadline
        Penalties for fuel waste, distance, and time

    Args:
        distance_traveled: Total km traveled
        time_taken_min: Minutes elapsed
        sla_hours: Delivery deadline in hours
        delivered: Whether parcel was delivered
        fuel_remaining: Remaining fuel percentage
        priority: Parcel priority level

    Returns:
        Float reward value
    """
    if not delivered:
        return -50.0  # Failed delivery

    priority_bonus = {
        "critical": 3.0,
        "express": 2.0,
        "standard": 1.0,
        "economy": 0.5,
    }.get(priority, 1.0)

    # Base reward for delivery
    reward = 100.0 * priority_bonus

    # SLA bonus / penalty
    sla_minutes = sla_hours * 60
    time_ratio = time_taken_min / sla_minutes if sla_minutes > 0 else 1.0

    if time_ratio < 0.5:
        reward += 30.0  # Well within SLA
    elif time_ratio < 0.8:
        reward += 15.0  # Comfortable margin
    elif time_ratio > 1.0:
        reward -= 40.0 * (time_ratio - 1.0)  # Over SLA penalty

    # Distance efficiency (less is better)
    reward -= distance_traveled * 0.5

    # Fuel efficiency bonus
    if fuel_remaining > 50:
        reward += 10.0
    elif fuel_remaining < 10:
        reward -= 20.0

    return round(reward, 2)


def route_step_reward(
    current_distance_to_dest: float,
    previous_distance_to_dest: float,
    step_distance: float,
    traffic_factor: float = 1.0,
    weather_factor: float = 1.0,
    revisited_node: bool = False,
) -> float:
    """
    Compute per-step reward for route optimization.

    Encourages:
        - Moving closer to destination
        - Shorter step distances
        - Avoiding revisited nodes
        - Favorable traffic/weather conditions

    Returns:
        Float reward for this step
    """
    reward = 0.0

    # Reward for getting closer to destination
    progress = previous_distance_to_dest - current_distance_to_dest
    reward += progress * 10.0

    # Penalty for step distance (efficiency)
    reward -= step_distance * traffic_factor * weather_factor * 0.5

    # Penalty for revisiting nodes
    if revisited_node:
        reward -= 15.0

    # Adverse conditions penalty
    combined_factor = traffic_factor * weather_factor
    if combined_factor > 2.0:
        reward -= 5.0  # High-risk conditions

    return round(reward, 2)


def aggregation_reward(
    num_parcels: int,
    num_batches: int,
    avg_utilization: float,
    priority_violations: int = 0,
) -> float:
    """
    Compute reward for parcel aggregation quality.

    Rewards:
        - Higher utilization per batch
        - Fewer batches (consolidation)
        - No priority violations

    Returns:
        Float reward value
    """
    if num_parcels == 0:
        return 0.0

    # Consolidation ratio (fewer batches for more parcels = better)
    consolidation = num_parcels / max(1, num_batches)
    reward = consolidation * 10.0

    # Utilization bonus (higher is better, up to 95%)
    if avg_utilization > 80:
        reward += 20.0
    elif avg_utilization > 60:
        reward += 10.0
    elif avg_utilization < 30:
        reward -= 10.0

    # Priority violation penalty
    reward -= priority_violations * 15.0

    return round(reward, 2)


def multi_objective_reward(
    time_score: float,
    cost_score: float,
    risk_score: float,
    weights: Optional[Dict[str, float]] = None,
) -> float:
    """
    Combine multiple objectives into a single reward using weighted sum.

    Args:
        time_score: Normalized time performance [0, 1]
        cost_score: Normalized cost efficiency [0, 1]
        risk_score: Normalized risk level [0, 1] (lower is better)
        weights: Custom weights for each objective

    Returns:
        Combined reward value
    """
    if weights is None:
        weights = {"time": 0.4, "cost": 0.4, "risk": 0.2}

    reward = (
        weights.get("time", 0.4) * time_score * 100
        + weights.get("cost", 0.4) * cost_score * 100
        - weights.get("risk", 0.2) * risk_score * 100
    )

    return round(reward, 2)
