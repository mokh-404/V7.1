# System Monitoring Solution - Dockerized API & Frontend

This project wraps the existing `system_monitor.sh` bash script in a host-side FastAPI that executes on the host (WSL1 or native Linux), with Docker containers acting as a proxy backend and modern React frontend dashboard.

## Architecture

```
Host (WSL1 or native Linux)
└── host_api/ (FastAPI running on port 9000)
    └── Executes system_monitor.sh (tested, real metrics)
    └── Reads from /proc, /sys, lsblk, etc. (REAL host metrics)

Docker Desktop / Docker Engine
└── backend container (port 8000)
    └── Proxies requests to host API via HTTP
    └── Fetches metrics from http://host.docker.internal:9000
    └── Exposes REST API: /api/metrics/current

└── frontend container (port 3000)
    └── React SPA with Vite
    └── Polls backend's JSON API over Docker network
    └── Renders live dashboard (charts, gauges, tables)
```

**Key Point**: All metric computation happens on the host. Docker containers only transport and visualize the metrics. The backend container **never reads /proc directly** - it only proxies HTTP requests to the host API.

## Project Structure

```
.
├── host_api/                    # Host-side API (runs on host, outside Docker)
│   ├── main.py                  # FastAPI that executes system_monitor.sh
│   ├── parse.py                 # JSON parsing helpers
│   ├── requirements.txt
│   ├── system_monitor.sh        # Original tested script
│   ├── gravity_bridge.py        # CPU temp helper
│   └── collect_metrics.sh       # Wrapper that outputs JSON
│
├── backend/                     # Backend container (proxy only)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI entrypoint (proxy)
│       ├── metrics_proxy.py     # Fetches from host API
│       ├── models.py            # Pydantic schemas
│       └── config.py            # Environment variables
│
├── frontend/                    # Frontend container
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── api/client.ts
│       └── components/          # React components
│
└── docker-compose.yml
```

## Prerequisites

- Docker and Docker Compose installed
- Python 3.11+ on the host (WSL1 or native Linux)
- The host API must run on the host system (not in Docker)

## Setup and Running

### Step 1: Start the Host API

The host API must run on the host (WSL1 or native Linux), outside Docker:

```bash
cd host_api
pip install -r requirements.txt

# Make scripts executable
chmod +x system_monitor.sh collect_metrics.sh gravity_bridge.py

# Run the API
uvicorn main:app --host 0.0.0.0 --port 9000
```

The host API will be available at `http://localhost:9000` and will execute `system_monitor.sh` to get real host metrics.

**Note**: Keep this running in a separate terminal. The Docker containers will connect to it.

### Step 2: Start Docker Containers

In a separate terminal, from the project root:

```bash
docker-compose build
docker-compose up
```

### Step 3: Access the Dashboard

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs
- **Host API**: http://localhost:9000 (host API docs)

## How It Works

### Data Flow

1. **Host API** (`host_api/main.py`):
   - Runs on the host (WSL1/Linux), outside Docker
   - On each request, executes `collect_metrics.sh` which runs `system_monitor.sh`
   - Script reads real host metrics from `/proc`, `/sys`, etc.
   - Returns JSON with all metrics

2. **Backend Container** (`backend/app/metrics_proxy.py`):
   - Runs inside Docker
   - Background thread periodically fetches from `http://host.docker.internal:9000/api/metrics/current`
   - Caches metrics in memory
   - Exposes `/api/metrics/current` endpoint for frontend

3. **Frontend Container**:
   - React SPA that polls backend every 5 seconds
   - Displays metrics in modern dashboard with charts and cards

### Why This Architecture?

- **Windows/Docker Desktop Limitation**: Docker Desktop runs containers in a Linux VM, so containers cannot access the Windows host's `/proc` and `/sys` filesystems.
- **Solution**: Run the script on the host (WSL1 or Linux) where it can access real metrics, then expose via HTTP API.
- **Backend as Proxy**: The backend container acts purely as a proxy/adapter, never trying to read `/proc` directly.

## Environment Variables

### Host API
- None required (uses default port 9000)

### Backend Container
- `HOST_API_BASE_URL`: URL of host API (default: `http://host.docker.internal:9000`)
- `POLL_INTERVAL_SECONDS`: How often to fetch from host API (default: `5`)

### Frontend Container
- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:8000`)

## API Endpoints

### Host API (port 9000)
- `GET /` - API information
- `GET /api/metrics/current` - Execute script and return current metrics
- `GET /api/health` - Health check

### Backend API (port 8000)
- `GET /` - API information
- `GET /api/metrics/current` - Get latest metrics (fetched from host API)
- `GET /api/health` - Health check
- `GET /docs` - Interactive API documentation

## Troubleshooting

### Backend shows "Failed to fetch from host API"

1. Ensure the host API is running: `curl http://localhost:9000/api/health`
2. Check that Docker can reach the host:
   - On Docker Desktop: Use `host.docker.internal`
   - On native Linux: Use the host's IP address or `host.docker.internal` if available
3. Check backend logs: `docker-compose logs backend`

### Host API can't find scripts

1. Ensure you're running from the `host_api` directory
2. Check that `system_monitor.sh`, `collect_metrics.sh`, and `gravity_bridge.py` exist
3. Ensure scripts are executable: `chmod +x *.sh *.py`

### Frontend shows "Backend Error"

1. Check backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify backend can reach host API: `docker-compose exec backend curl http://host.docker.internal:9000/api/health`

## Development

### Host API Development

```bash
cd host_api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 9000
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8000` in `.env` for local development.

## Notes

- The host API must be running before starting Docker containers
- All real metrics come from the trusted bash script running on the host
- The backend container is a pure proxy - it never executes scripts or reads `/proc`
- This architecture ensures real host metrics even on Windows/Docker Desktop

## License

Educational project for Arab Academy 12th Project.
