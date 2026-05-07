# 🚛 Smart Supply Chain Logistics System

**AI-powered, real-time supply chain optimization for Bangalore**

An intelligent logistics platform with multi-agent decision-making, dynamic route optimization, parcel aggregation, multi-modal transport (road/air/water), and live tracking.

---

## 🏗️ Architecture

```text
React Frontend → Node.js Backend → AI Agent Layer → Python AI Engine
                      ↕                                    ↕
              Socket.IO (real-time)            networkx / scikit-learn
                      ↕
              In-Memory Store / PostgreSQL
```

### Frontend Architecture (React)
- **UI Framework**: React with Vite
- **Styling**: `styled-components` (CSS-in-JS architecture)
- **State Management**: Context API (`AuthContext` & JWT persistence)
- **Design System**: Centralized `theme.js` (tokens for colors, spacing, typography) and `GlobalStyle.js`
- **Routing & Security**: `react-router-dom` with `ProtectedRoute` for Role-Based Access Control (RBAC).

### Security Architecture
- **Authentication**: JWT (JSON Web Tokens) with `HttpOnly` cookies.
- **Authorization**: Role-based access control (RBAC) across 4 roles: `manager`, `driver`, `customer`, and `warehouse`.
- **Database**: PostgreSQL (using `pg` for secure query parameterization and bcrypt password hashing).

### AI Agents (7 autonomous agents)
| Agent | Role |
|-------|------|
| 🤖 Coordinator | Orchestrates all agent decisions |
| 📦 Shipment | Transport mode & route requests |
| 🚛 Vehicle | Fleet feasibility & assignment |
| 🗺️ Route Optimizer | Dijkstra/A* path computation |
| ⚠️ Disruption | Delay detection & risk alerts |
| 📊 Aggregation | KMeans parcel clustering |
| 🏭 Warehouse | Hub capacity & intake/dispatch |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install

# AI Engine
cd ai-engine && pip install -r requirements.txt
```

### 2. Start all services

```bash
# Terminal 1 — AI Engine (Python)
cd ai-engine
python main.py

# Terminal 2 — Backend (Node.js)
cd server
npm run dev

# Terminal 3 — Frontend (React)
cd client
npm run dev
```

### 3. Open browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Engine**: http://localhost:8000

---

## 📁 Project Structure

```
smart-supply-chain/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Map, Shipment, Vehicle, Alerts (with styled SharedStyles)
│       ├── pages/       # Dashboard, Manager, Driver, Customer (+ .styles.js)
│       ├── services/    # API & WebSocket clients
│       ├── store/       # Context API for State Management
│       ├── theme.js     # Global design tokens (colors, radii, spacing)
│       └── GlobalStyle.js # Global styled-components reset & keyframes
├── server/              # Node.js backend (Express)
│   └── src/
│       ├── controllers/ # Shipment, Vehicle, Dashboard
│       ├── services/    # Routing, Aggregation, ETA, Simulation
│       ├── events/      # Event bus & handlers
│       └── sockets/     # Socket.IO real-time handler
├── ai-engine/           # Python AI/ML (FastAPI)
│   ├── models/          # Route optimizer, ETA predictor, RL
│   ├── agents/          # Aggregation, Shipment, Vehicle agents
│   └── environment/     # RL Gymnasium environment
├── agents/              # Node.js agent orchestration layer
│   └── src/
│       ├── base/        # BaseAgent class
│       ├── shipment/    # ShipmentAgent
│       ├── vehicle/     # VehicleAgent
│       ├── warehouse/   # WarehouseAgent
│       ├── aggregation/ # AggregationAgent
│       └── communication/ # Message broker & pub/sub
├── shared/              # Shared constants, utils, logger
├── data/                # Mock data & Bangalore road graph
├── infra/               # Docker configs
└── docs/                # Architecture documentation
```

---

## 🌐 API Reference

### Backend (port 5000)
**Auth endpoints:**
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Validate current session

**Core endpoints:**
- `GET /api/shipments` — List shipments
- `POST /api/shipments` — Create shipment
- `POST /api/shipments/:id/optimize` — AI route optimization
- `GET /api/vehicles` — List vehicles
- `POST /api/vehicles/:id/assign` — Assign shipments
- `GET /api/dashboard` — Dashboard stats
- `GET /api/warehouses` — List warehouses
- `GET /api/agents` — Agent statuses
- `GET /api/health` — Health check

### AI Engine (port 8000)
- `POST /api/v1/optimize-route` — Dijkstra/A* routing
- `POST /api/v1/predict-eta` — ML-based ETA prediction
- `POST /api/v1/aggregate-parcels` — KMeans clustering
- `POST /api/v1/detect-disruption` — Delay detection
- `POST /api/v1/transport-mode` — Mode selection

---

## 🎯 MVP Scope
- Bangalore geography (31 graph nodes, 53 edges)
- 8 vehicles (bike, van, truck, drone)
- 25 initial shipments
- 8 warehouse/hub locations
- Simulated traffic & weather disruptions

---

## 🐳 Docker

```bash
docker-compose up --build
```

---

## ⚙️ Environment Variables

See `.env` file for all configuration options including:
- `AI_ENGINE_URL` — Python AI service URL
- `SIMULATION_ENABLED` — Enable/disable simulation
- `USE_IN_MEMORY_DB` — Use in-memory store (no PostgreSQL needed)
- `MAPBOX_API_KEY` — Optional Mapbox integration
- `WEATHER_API_KEY` — Optional OpenWeather integration
