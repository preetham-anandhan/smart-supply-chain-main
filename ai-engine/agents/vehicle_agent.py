"""Vehicle Agent — Capacity and feasibility checks."""
from typing import Dict, List, Optional

class VehicleAgent:
    def check_feasibility(self, vehicle: Dict, parcels: List[Dict], route_distance: float) -> Dict:
        total_weight = sum(p.get("weight_kg", 0) for p in parcels)
        capacity = vehicle.get("capacity_kg", 200)
        fuel = vehicle.get("fuel_level", 100)
        fuel_needed = route_distance * 2  # 2% fuel per km estimate
        can_carry = total_weight <= capacity
        has_fuel = fuel >= fuel_needed
        return {
            "feasible": can_carry and has_fuel and vehicle.get("status") == "available",
            "vehicle_id": vehicle.get("id"), "total_weight_kg": total_weight,
            "capacity_kg": capacity, "utilization": round(total_weight / capacity * 100, 1),
            "fuel_level": fuel, "fuel_needed": round(fuel_needed, 1),
            "reasons": [] if (can_carry and has_fuel) else
                ([f"Over capacity: {total_weight}/{capacity} kg"] if not can_carry else []) +
                ([f"Low fuel: {fuel}% < {fuel_needed}% needed"] if not has_fuel else [])
        }

    def rank_vehicles(self, vehicles: List[Dict], parcels: List[Dict], route_distance: float) -> List[Dict]:
        results = []
        for v in vehicles:
            check = self.check_feasibility(v, parcels, route_distance)
            if check["feasible"]:
                score = 100 - check["utilization"] * 0.3 - (100 - v.get("fuel_level", 100)) * 0.2
                check["score"] = round(score, 1)
                results.append(check)
        return sorted(results, key=lambda x: x["score"], reverse=True)

_agent = None
def get_vehicle_agent():
    global _agent
    if _agent is None: _agent = VehicleAgent()
    return _agent
