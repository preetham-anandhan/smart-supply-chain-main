"""
Route Optimization Model
Uses Dijkstra and A* algorithms via networkx for optimal path finding.
Supports multi-objective optimization (time vs cost vs risk).
"""

import networkx as nx
from typing import Dict, List, Optional, Tuple
from utils.graph_utils import (
    get_graph,
    find_nearest_node,
    get_path_coordinates,
    get_path_distance,
    get_path_time,
    haversine_distance,
)


class RouteOptimizer:
    """Computes optimal routes using graph algorithms."""

    def __init__(self):
        self.graph = get_graph()

    def optimize(
        self,
        source_lat: float,
        source_lng: float,
        dest_lat: float,
        dest_lng: float,
        traffic_factor: float = 1.0,
        weather_factor: float = 1.0,
        optimization_mode: str = "balanced",
    ) -> Dict:
        """
        Find optimal route between two coordinates.

        Args:
            source_lat, source_lng: Source coordinates
            dest_lat, dest_lng: Destination coordinates
            traffic_factor: Traffic multiplier (1.0 = normal)
            weather_factor: Weather impact multiplier
            optimization_mode: 'fastest', 'shortest', 'cheapest', or 'balanced'

        Returns:
            Route details including path, distance, time, alternatives
        """
        # Find nearest graph nodes
        source_node = find_nearest_node(self.graph, source_lat, source_lng)
        dest_node = find_nearest_node(self.graph, dest_lat, dest_lng)

        if source_node is None or dest_node is None:
            return {"error": "Could not find nodes near the specified coordinates"}

        if source_node == dest_node:
            return self._direct_route(source_lat, source_lng, dest_lat, dest_lng)

        # Set edge weights based on optimization mode
        G = self._prepare_weighted_graph(traffic_factor, weather_factor, optimization_mode)

        try:
            # Primary route - Dijkstra
            primary_path = nx.dijkstra_path(G, source_node, dest_node, weight="opt_weight")
            primary_distance = get_path_distance(self.graph, primary_path)
            primary_time = get_path_time(self.graph, primary_path, traffic_factor * weather_factor)
            primary_coords = get_path_coordinates(self.graph, primary_path)

            # Alternative routes using k-shortest paths
            alternatives = self._find_alternatives(
                G, source_node, dest_node, primary_path, traffic_factor, weather_factor
            )

            # Risk assessment
            combined_factor = traffic_factor * weather_factor
            risk_score = min(1.0, max(0.0, (combined_factor - 1.0) / 2.0))

            return {
                "success": True,
                "source_node": source_node,
                "dest_node": dest_node,
                "primary_route": {
                    "path": primary_path,
                    "coordinates": primary_coords,
                    "distance_km": round(primary_distance, 2),
                    "estimated_time_min": round(primary_time, 1),
                    "hops": len(primary_path) - 1,
                },
                "alternative_routes": alternatives,
                "optimization_mode": optimization_mode,
                "traffic_factor": traffic_factor,
                "weather_factor": weather_factor,
                "risk_score": round(risk_score, 2),
            }

        except nx.NetworkXNoPath:
            return {
                "success": False,
                "error": f"No path found between {source_node} and {dest_node}",
            }

    def _prepare_weighted_graph(
        self, traffic_factor: float, weather_factor: float, mode: str
    ) -> nx.Graph:
        """Create a copy of the graph with optimization-specific weights."""
        G = self.graph.copy()

        for u, v, data in G.edges(data=True):
            distance = data["distance_km"]
            time = data["time_min"] * traffic_factor * weather_factor

            # Cost heuristic based on road type
            road_multiplier = {"highway": 0.8, "main": 1.0, "secondary": 1.3}.get(
                data.get("road_type", "secondary"), 1.0
            )

            if mode == "fastest":
                G[u][v]["opt_weight"] = time
            elif mode == "shortest":
                G[u][v]["opt_weight"] = distance
            elif mode == "cheapest":
                G[u][v]["opt_weight"] = distance * road_multiplier
            else:  # balanced
                G[u][v]["opt_weight"] = (
                    0.4 * distance + 0.4 * time + 0.2 * (distance * road_multiplier)
                )

        return G

    def _find_alternatives(
        self,
        G: nx.Graph,
        source: str,
        dest: str,
        primary_path: List[str],
        traffic_factor: float,
        weather_factor: float,
        max_alternatives: int = 2,
    ) -> List[Dict]:
        """Find alternative routes by removing edges from the primary path."""
        alternatives = []
        seen_paths = {tuple(primary_path)}

        # Try removing each edge in the primary path
        for i in range(len(primary_path) - 1):
            if len(alternatives) >= max_alternatives:
                break

            u, v = primary_path[i], primary_path[i + 1]
            G_temp = G.copy()
            G_temp.remove_edge(u, v)

            try:
                alt_path = nx.dijkstra_path(G_temp, source, dest, weight="opt_weight")
                if tuple(alt_path) not in seen_paths:
                    seen_paths.add(tuple(alt_path))
                    alt_distance = get_path_distance(self.graph, alt_path)
                    alt_time = get_path_time(
                        self.graph, alt_path, traffic_factor * weather_factor
                    )
                    alternatives.append({
                        "path": alt_path,
                        "coordinates": get_path_coordinates(self.graph, alt_path),
                        "distance_km": round(alt_distance, 2),
                        "estimated_time_min": round(alt_time, 1),
                        "hops": len(alt_path) - 1,
                    })
            except (nx.NetworkXNoPath, nx.NetworkXError):
                continue

        return alternatives

    def _direct_route(
        self, src_lat: float, src_lng: float, dst_lat: float, dst_lng: float
    ) -> Dict:
        """Handle same-node case with direct route."""
        distance = haversine_distance(src_lat, src_lng, dst_lat, dst_lng)
        time = distance / 30 * 60  # Assume 30 km/h average speed
        return {
            "success": True,
            "primary_route": {
                "path": ["direct"],
                "coordinates": [
                    {"lat": src_lat, "lng": src_lng, "name": "Source"},
                    {"lat": dst_lat, "lng": dst_lng, "name": "Destination"},
                ],
                "distance_km": round(distance, 2),
                "estimated_time_min": round(time, 1),
                "hops": 0,
            },
            "alternative_routes": [],
            "optimization_mode": "direct",
            "risk_score": 0.0,
        }

    def get_multi_stop_route(
        self, stops: List[Dict], traffic_factor: float = 1.0
    ) -> Dict:
        """Optimize route through multiple stops (TSP-like)."""
        if len(stops) <= 2:
            return self.optimize(
                stops[0]["lat"], stops[0]["lng"],
                stops[-1]["lat"], stops[-1]["lng"],
                traffic_factor,
            )

        # Greedy nearest-neighbor for TSP approximation
        node_ids = []
        for stop in stops:
            node_id = find_nearest_node(self.graph, stop["lat"], stop["lng"])
            node_ids.append(node_id)

        # Find optimal ordering
        visited = [0]
        unvisited = list(range(1, len(node_ids)))
        total_distance = 0
        full_path = []

        current = 0
        while unvisited:
            nearest = None
            nearest_dist = float("inf")
            for idx in unvisited:
                try:
                    path = nx.dijkstra_path(
                        self.graph, node_ids[current], node_ids[idx], weight="weight"
                    )
                    dist = get_path_distance(self.graph, path)
                    if dist < nearest_dist:
                        nearest = idx
                        nearest_dist = dist
                except nx.NetworkXNoPath:
                    continue

            if nearest is not None:
                path = nx.dijkstra_path(
                    self.graph, node_ids[current], node_ids[nearest], weight="weight"
                )
                full_path.extend(path[:-1])
                total_distance += nearest_dist
                visited.append(nearest)
                unvisited.remove(nearest)
                current = nearest
            else:
                break

        if node_ids[current] not in full_path:
            full_path.append(node_ids[current])

        total_time = get_path_time(self.graph, full_path, traffic_factor)

        return {
            "success": True,
            "primary_route": {
                "path": full_path,
                "coordinates": get_path_coordinates(self.graph, full_path),
                "distance_km": round(total_distance, 2),
                "estimated_time_min": round(total_time, 1),
                "hops": len(full_path) - 1,
                "stop_order": visited,
            },
            "alternative_routes": [],
            "optimization_mode": "multi_stop",
            "risk_score": 0.0,
        }


# Singleton instance
_optimizer: Optional[RouteOptimizer] = None


def get_optimizer() -> RouteOptimizer:
    global _optimizer
    if _optimizer is None:
        _optimizer = RouteOptimizer()
    return _optimizer
