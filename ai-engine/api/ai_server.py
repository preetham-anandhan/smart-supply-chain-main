"""
AI Engine API Router
Exposes endpoints for route optimization, ETA prediction, aggregation, and disruption detection.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

from models.route_optimizer import get_optimizer
from models.eta_predictor import get_predictor
from agents.aggregation_agent import get_aggregation_agent
from agents.shipment_agent import get_shipment_agent
from agents.vehicle_agent import get_vehicle_agent
from utils.helpers import generate_traffic_factor, generate_weather_factor

router = APIRouter()


# ── Request / Response Schemas ──────────────────────────────────

class RouteRequest(BaseModel):
    source_lat: float
    source_lng: float
    dest_lat: float
    dest_lng: float
    traffic_factor: float = 1.0
    weather_factor: float = 1.0
    optimization_mode: str = "balanced"

class ETARequest(BaseModel):
    distance_km: float
    traffic_factor: float = 1.0
    weather_factor: float = 1.0
    hour: int = 12
    num_stops: int = 0

class ParcelItem(BaseModel):
    id: str
    destination_lat: float
    destination_lng: float
    weight_kg: float = 1.0
    priority: str = "standard"

class AggregateRequest(BaseModel):
    parcels: List[ParcelItem]
    num_vehicles: int = 5
    max_capacity_kg: float = 200.0

class TransportModeRequest(BaseModel):
    weight_kg: float = 1.0
    distance_km: float = 10.0
    priority: str = "standard"

class DisruptionRequest(BaseModel):
    original_eta_min: float
    current_distance_remaining: float
    elapsed_min: float
    traffic_factor: float = 1.0
    weather_factor: float = 1.0


# ── Endpoints ───────────────────────────────────────────────────

@router.post("/optimize-route")
async def optimize_route(req: RouteRequest):
    """Find optimal route between two coordinates."""
    try:
        optimizer = get_optimizer()
        result = optimizer.optimize(
            req.source_lat, req.source_lng,
            req.dest_lat, req.dest_lng,
            req.traffic_factor, req.weather_factor,
            req.optimization_mode,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-eta")
async def predict_eta(req: ETARequest):
    """Predict estimated time of arrival."""
    try:
        predictor = get_predictor()
        return predictor.predict(
            req.distance_km, req.traffic_factor, req.weather_factor,
            req.hour, req.num_stops,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/aggregate-parcels")
async def aggregate_parcels(req: AggregateRequest):
    """Cluster parcels for batch delivery."""
    try:
        agent = get_aggregation_agent()
        parcels = [p.model_dump() for p in req.parcels]
        return agent.aggregate(parcels, req.num_vehicles, req.max_capacity_kg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-disruption")
async def detect_disruption(req: DisruptionRequest):
    """Check if a shipment is likely to be delayed."""
    try:
        predictor = get_predictor()
        return predictor.predict_delay(
            req.original_eta_min,
            req.current_distance_remaining,
            req.elapsed_min,
            req.traffic_factor,
            req.weather_factor,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport-mode")
async def decide_transport_mode(req: TransportModeRequest):
    """Decide optimal transport mode for a parcel."""
    try:
        agent = get_shipment_agent()
        parcel = {"weight_kg": req.weight_kg, "priority": req.priority}
        return agent.decide_transport_mode(parcel, req.distance_km)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conditions")
async def get_current_conditions():
    """Get simulated traffic and weather conditions."""
    traffic = generate_traffic_factor()
    weather = generate_weather_factor()
    return {
        "traffic_factor": round(traffic, 2),
        "weather": weather,
    }


@router.get("/health")
async def health_check():
    """AI engine health check."""
    return {
        "status": "healthy",
        "models": {
            "route_optimizer": "loaded",
            "eta_predictor": "loaded",
            "aggregation_agent": "loaded",
            "shipment_agent": "loaded",
            "vehicle_agent": "loaded",
        },
    }
