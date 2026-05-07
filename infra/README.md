# Infrastructure Notes

## Local Development

1. **Without Docker**: Run each service individually:
   ```bash
   # Terminal 1 — AI Engine
   cd ai-engine && pip install -r requirements.txt && python main.py

   # Terminal 2 — Server
   cd server && npm install && npm run dev

   # Terminal 3 — Client
   cd client && npm install && npm run dev
   ```

2. **With Docker**: 
   ```bash
   docker-compose up --build
   ```

## Ports

| Service    | Port | URL                    |
|------------|------|------------------------|
| Client     | 5173 | http://localhost:5173   |
| Server     | 5000 | http://localhost:5000   |
| AI Engine  | 8000 | http://localhost:8000   |

## Production Notes

- Replace in-memory stores with PostgreSQL and Redis
- Set `USE_IN_MEMORY_DB=false` and `USE_IN_MEMORY_REDIS=false`
- Add proper JWT authentication
- Configure Mapbox API key for map features
