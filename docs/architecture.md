# Smart Supply Chain Logistics System
## Architecture Documentation

### System Overview

The Smart Supply Chain Logistics System is an AI-powered, event-driven logistics platform
designed for Bangalore operations. It combines multi-agent AI decision-making with
real-time tracking, parcel aggregation, and multi-modal transport optimization.

---

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  React.js Frontend (Dashboard, Manager, Driver, Customer)    │
│  Components: MapView, ShipmentCard, VehicleTracker, Alerts   │
├─────────────────────────────────────────────────────────────┤
│                CORE PROCESSING LAYER                         │
│  Express.js API Gateway + Socket.IO (WebSocket)              │
│  Controllers: Shipment, Vehicle, User/Dashboard              │
│  Services: Routing, Aggregation, ETA, Notification, Sim      │
│  Event Bus: Node.js EventEmitter (event-driven architecture) │
├─────────────────────────────────────────────────────────────┤
│                  AI AGENT LAYER                              │
│  7 Agents: Shipment, Vehicle, Route Optimizer, Disruption,   │
│  Aggregation, Coordinator, Warehouse                         │
│  Communication: Message Broker + Pub/Sub                     │
├─────────────────────────────────────────────────────────────┤
│                    AI ENGINE                                 │
│  FastAPI (Python) — Route Optimizer (Dijkstra/A*), ETA       │
│  Predictor (Ridge Regression), KMeans Clustering,            │
│  RL Model (PPO/Gymnasium), Transport Mode Selection          │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                │
│  In-Memory Store (dev) / PostgreSQL (prod)                   │
│  In-Memory Cache (dev) / Redis (prod)                        │
│  Mock Data: 25 shipments, 8 vehicles, 8 warehouses           │
│  Bangalore Road Graph: 31 nodes, 53 edges                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Event-Driven Data Flow

```
Customer creates parcel
        │
        ▼
  ┌─ parcel_created ──────────────┐
  │                               │
  ▼                               ▼
Shipment Agent              Aggregation Agent
(transport mode)            (batch parcels)
  │                               │
  ▼                               ▼
route_requested             aggregation_complete
  │                               │
  ▼                               ▼
Route Optimization          Coordinator Agent
Agent (Dijkstra/A*)         (final decisions)
  │                               │
  ▼                               ▼
route_generated             assignment_request
  │                               │
  ▼                               ▼
Vehicle Agent               vehicle_assigned
(feasibility check)               │
  │                               ▼
  ▼                         Backend assigns
vehicle_assigned            vehicle + route
        │
        ▼
  Real-time updates ──→ UI (WebSocket)
        │
        ▼
  Disruption Agent ──→ Continuous monitoring
        │
        ▼
  delay_detected ──→ Re-optimize ──→ Notify users
```

---

### AI Models

| Model | Algorithm | Library | Purpose |
|-------|-----------|---------|---------|
| Route Optimizer | Dijkstra + A* | networkx | Optimal path between nodes |
| ETA Predictor | Ridge Regression | scikit-learn | Delivery time estimation |
| Parcel Aggregation | K-Means Clustering | scikit-learn | Batch parcels by destination |
| RL Routing | PPO | stable-baselines3 + gymnasium | Learn optimal routing policies |
| Transport Mode | Rule-based + priority | Custom | Select road/air/water |

---

### API Endpoints

#### Node.js Backend (port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/shipments | List all shipments |
| POST | /api/shipments | Create new shipment |
| POST | /api/shipments/:id/optimize | Optimize route via AI |
| GET | /api/vehicles | List all vehicles |
| POST | /api/vehicles/:id/assign | Assign shipments |
| GET | /api/dashboard | Dashboard statistics |
| GET | /api/warehouses | List warehouses |
| GET | /api/agents | Agent system status |
| GET | /api/health | Health check |

#### Python AI Engine (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/optimize-route | Find optimal route |
| POST | /api/v1/predict-eta | Predict delivery ETA |
| POST | /api/v1/aggregate-parcels | Cluster parcels |
| POST | /api/v1/detect-disruption | Check for delays |
| POST | /api/v1/transport-mode | Select transport mode |
| GET | /api/v1/conditions | Traffic/weather |

---

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Socket.IO Client |
| Backend | Express.js, Socket.IO, Node.js |
| AI Engine | FastAPI, Python 3.10+ |
| ML | scikit-learn, networkx, gymnasium |
| Data | In-Memory / PostgreSQL / Redis |
| Deploy | Docker, Docker Compose |
