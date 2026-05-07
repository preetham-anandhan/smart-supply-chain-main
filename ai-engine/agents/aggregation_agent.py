"""
Aggregation Agent — Parcel Clustering
Uses KMeans clustering to group parcels by destination proximity.
"""
import numpy as np
from sklearn.cluster import KMeans
from typing import Dict, List, Optional
from collections import defaultdict

class AggregationAgent:
    def aggregate(self, parcels: List[Dict], num_vehicles: int = 5, max_capacity_kg: float = 200.0) -> Dict:
        if not parcels:
            return {"clusters": [], "summary": {"total_parcels": 0}}
        coords = np.array([[p["destination_lat"], p["destination_lng"]] for p in parcels])
        n_clusters = min(num_vehicles, len(parcels), max(1, len(parcels) // 3))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        clusters = defaultdict(list)
        for i, label in enumerate(labels):
            clusters[int(label)].append(parcels[i])
        load_plans = []
        for cluster_id, cluster_parcels in clusters.items():
            center = kmeans.cluster_centers_[cluster_id]
            priority_order = {"critical": 0, "express": 1, "standard": 2, "economy": 3}
            sorted_parcels = sorted(cluster_parcels, key=lambda p: priority_order.get(p.get("priority", "standard"), 2))
            batches = self._split_by_capacity(sorted_parcels, max_capacity_kg)
            for batch_idx, batch in enumerate(batches):
                total_weight = sum(p.get("weight_kg", 0) for p in batch)
                load_plans.append({
                    "cluster_id": cluster_id, "batch_id": f"batch-{cluster_id}-{batch_idx}",
                    "center_lat": float(center[0]), "center_lng": float(center[1]),
                    "parcels": [p.get("id", f"unknown-{i}") for p in batch],
                    "parcel_count": len(batch), "total_weight_kg": round(total_weight, 2),
                    "capacity_utilization": round(total_weight / max_capacity_kg * 100, 1),
                })
        return {"clusters": load_plans, "summary": {"total_parcels": len(parcels), "num_clusters": n_clusters, "num_batches": len(load_plans)}}

    def _split_by_capacity(self, parcels, max_capacity):
        batches, current_batch, current_weight = [], [], 0.0
        for parcel in parcels:
            weight = parcel.get("weight_kg", 0)
            if current_weight + weight > max_capacity and current_batch:
                batches.append(current_batch)
                current_batch, current_weight = [parcel], weight
            else:
                current_batch.append(parcel)
                current_weight += weight
        if current_batch:
            batches.append(current_batch)
        return batches

_agent = None
def get_aggregation_agent():
    global _agent
    if _agent is None: _agent = AggregationAgent()
    return _agent
