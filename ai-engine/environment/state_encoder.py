"""
State Encoder — Converts logistics state to RL observation vectors.
Used by the RL environment to represent the current delivery state.
"""

import numpy as np
from typing import Dict, List, Optional


class StateEncoder:
    """Encodes logistics state into normalized observation vectors for RL models."""

    def __init__(self, num_nodes: int = 31, max_parcels: int = 50, max_vehicles: int = 10):
        self.num_nodes = num_nodes
        self.max_parcels = max_parcels
        self.max_vehicles = max_vehicles

        # Bangalore coordinate bounds for normalization
        self.lat_min, self.lat_max = 12.75, 13.15
        self.lng_min, self.lng_max = 77.35, 77.80

    def normalize_coordinates(self, lat: float, lng: float) -> tuple:
        """Normalize lat/lng to [0, 1] range."""
        norm_lat = (lat - self.lat_min) / (self.lat_max - self.lat_min)
        norm_lng = (lng - self.lng_min) / (self.lng_max - self.lng_min)
        return (
            max(0.0, min(1.0, norm_lat)),
            max(0.0, min(1.0, norm_lng)),
        )

    def encode_parcel(self, parcel: Dict) -> np.ndarray:
        """Encode a single parcel into a feature vector."""
        src_lat, src_lng = self.normalize_coordinates(
            parcel.get("source_lat", 12.97), parcel.get("source_lng", 77.59)
        )
        dst_lat, dst_lng = self.normalize_coordinates(
            parcel.get("destination_lat", 12.97), parcel.get("destination_lng", 77.59)
        )

        priority_map = {"critical": 1.0, "express": 0.75, "standard": 0.5, "economy": 0.25}
        status_map = {
            "pending": 0.0, "aggregating": 0.2, "routed": 0.4,
            "assigned": 0.6, "in_transit": 0.8, "delivered": 1.0, "failed": -1.0,
        }

        return np.array([
            src_lat, src_lng,
            dst_lat, dst_lng,
            parcel.get("weight_kg", 1.0) / 100.0,  # Normalize weight
            priority_map.get(parcel.get("priority", "standard"), 0.5),
            status_map.get(parcel.get("status", "pending"), 0.0),
            parcel.get("sla_hours", 24) / 72.0,  # Normalize SLA
        ], dtype=np.float32)

    def encode_vehicle(self, vehicle: Dict) -> np.ndarray:
        """Encode a single vehicle into a feature vector."""
        lat, lng = self.normalize_coordinates(
            vehicle.get("current_lat", 12.97), vehicle.get("current_lng", 77.59)
        )

        type_map = {"bike": 0.0, "van": 0.33, "truck": 0.66, "drone": 1.0}
        status_map = {"available": 1.0, "assigned": 0.5, "in_transit": 0.25, "maintenance": 0.0}

        return np.array([
            lat, lng,
            vehicle.get("capacity_kg", 200) / 1000.0,
            vehicle.get("fuel_level", 100) / 100.0,
            type_map.get(vehicle.get("type", "van"), 0.33),
            status_map.get(vehicle.get("status", "available"), 0.5),
            len(vehicle.get("assigned_shipments", [])) / 10.0,
        ], dtype=np.float32)

    def encode_state(
        self, parcels: List[Dict], vehicles: List[Dict],
        traffic_factor: float = 1.0, weather_factor: float = 1.0
    ) -> np.ndarray:
        """Encode the full logistics state into a flat observation vector."""
        parcel_features = []
        for i, p in enumerate(parcels[:self.max_parcels]):
            parcel_features.append(self.encode_parcel(p))

        # Pad if fewer parcels than max
        while len(parcel_features) < self.max_parcels:
            parcel_features.append(np.zeros(8, dtype=np.float32))

        vehicle_features = []
        for v in vehicles[:self.max_vehicles]:
            vehicle_features.append(self.encode_vehicle(v))

        while len(vehicle_features) < self.max_vehicles:
            vehicle_features.append(np.zeros(7, dtype=np.float32))

        global_features = np.array([
            len(parcels) / self.max_parcels,
            len(vehicles) / self.max_vehicles,
            traffic_factor / 3.0,
            weather_factor / 3.0,
        ], dtype=np.float32)

        return np.concatenate([
            np.concatenate(parcel_features),
            np.concatenate(vehicle_features),
            global_features,
        ])

    def get_observation_size(self) -> int:
        """Return the total size of the flattened observation vector."""
        return self.max_parcels * 8 + self.max_vehicles * 7 + 4


# Singleton
_encoder: Optional[StateEncoder] = None


def get_encoder() -> StateEncoder:
    global _encoder
    if _encoder is None:
        _encoder = StateEncoder()
    return _encoder
