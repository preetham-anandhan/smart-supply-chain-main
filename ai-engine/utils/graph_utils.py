"""
Graph Utilities for Bangalore Road Network
Loads and manipulates the road network graph using networkx.
"""

import json
import os
import networkx as nx
import math
from typing import Dict, List, Tuple, Optional


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points using Haversine formula (km)."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def load_bangalore_graph(graph_path: Optional[str] = None) -> nx.Graph:
    """Load the Bangalore road network as a networkx graph."""
    if graph_path is None:
        # Try multiple paths
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "data", "graph_data.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "maps", "bangalore_graph.json"),
        ]
        for p in candidates:
            if os.path.exists(p):
                graph_path = p
                break

    if graph_path is None or not os.path.exists(graph_path):
        raise FileNotFoundError("Bangalore graph data not found")

    with open(graph_path, "r") as f:
        data = json.load(f)

    G = nx.Graph()

    # Add nodes with position attributes
    for node_id, attrs in data["nodes"].items():
        G.add_node(
            node_id,
            name=attrs["name"],
            lat=attrs["lat"],
            lng=attrs["lng"],
            type=attrs.get("type", "junction"),
            pos=(attrs["lng"], attrs["lat"]),
        )

    # Add edges with weight attributes
    for edge in data["edges"]:
        G.add_edge(
            edge["from"],
            edge["to"],
            distance_km=edge["distance_km"],
            time_min=edge["time_min"],
            road_type=edge.get("road_type", "secondary"),
            weight=edge["distance_km"],  # Default weight is distance
        )

    return G


def find_nearest_node(G: nx.Graph, lat: float, lng: float) -> str:
    """Find the graph node nearest to given coordinates."""
    min_dist = float("inf")
    nearest = None
    for node_id, attrs in G.nodes(data=True):
        d = haversine_distance(lat, lng, attrs["lat"], attrs["lng"])
        if d < min_dist:
            min_dist = d
            nearest = node_id
    return nearest


def get_path_coordinates(G: nx.Graph, path: List[str]) -> List[Dict]:
    """Convert a list of node IDs to coordinate list."""
    coords = []
    for node_id in path:
        attrs = G.nodes[node_id]
        coords.append({
            "id": node_id,
            "name": attrs["name"],
            "lat": attrs["lat"],
            "lng": attrs["lng"],
        })
    return coords


def get_path_distance(G: nx.Graph, path: List[str]) -> float:
    """Calculate total distance along a path."""
    total = 0.0
    for i in range(len(path) - 1):
        edge_data = G.edges[path[i], path[i + 1]]
        total += edge_data["distance_km"]
    return total


def get_path_time(G: nx.Graph, path: List[str], traffic_factor: float = 1.0) -> float:
    """Calculate total travel time along a path (minutes)."""
    total = 0.0
    for i in range(len(path) - 1):
        edge_data = G.edges[path[i], path[i + 1]]
        total += edge_data["time_min"] * traffic_factor
    return total


# Pre-load the graph as a module-level singleton
_graph: Optional[nx.Graph] = None


def get_graph() -> nx.Graph:
    """Get the singleton graph instance."""
    global _graph
    if _graph is None:
        _graph = load_bangalore_graph()
    return _graph
