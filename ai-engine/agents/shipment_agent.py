"""Shipment Agent — Transport mode selection and lifecycle."""
from typing import Dict
from utils.helpers import select_transport_mode, calculate_cost

class ShipmentAgent:
    def decide_transport_mode(self, parcel: Dict, distance_km: float) -> Dict:
        weight = parcel.get("weight_kg", 1)
        priority = parcel.get("priority", "standard")
        mode = select_transport_mode(distance_km, weight)
        if priority == "critical" and distance_km > 20:
            mode = "air"
        elif priority == "economy" and mode == "air":
            mode = "road"
        cost = calculate_cost(distance_km, mode, priority)
        speed = {"road": 30, "air": 200, "water": 15}.get(mode, 30)
        eta_min = (distance_km / speed) * 60
        return {
            "transport_mode": mode, "cost": cost, "estimated_speed_kmh": speed,
            "base_eta_min": round(eta_min, 1),
            "reasoning": f"Distance: {distance_km:.1f}km, Weight: {weight}kg, Priority: {priority} → {mode}"
        }

_agent = None
def get_shipment_agent():
    global _agent
    if _agent is None: _agent = ShipmentAgent()
    return _agent
