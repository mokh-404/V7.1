# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Python 3.11+ on the host (WSL1 or native Linux)
- Terminal access to the host system

## Step-by-Step Setup

### 1. Start the Host API

**Open a terminal on the host (WSL1 or Linux)** and run:

```bash
cd host_api

# Install dependencies
pip install -r requirements.txt

# Make scripts executable
chmod +x system_monitor.sh collect_metrics.sh gravity_bridge.py

# Start the host API
uvicorn main:app --host 0.0.0.0 --port 9000
```

**Keep this terminal open** - the host API must keep running.

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:9000
```

Test it:
```bash
curl http://localhost:9000/api/health
```

### 2. Start Docker Containers

**Open a new terminal** and run:

```bash
# From project root
docker-compose build
docker-compose up
```

Wait for both containers to start. You should see:
```
monitoring-backend  | INFO:     Application startup complete.
monitoring-frontend | ...
```

### 3. Access the Dashboard

Open your browser:
- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Host API**: http://localhost:9000/docs

## Stopping

1. Stop Docker containers: `Ctrl+C` in the docker-compose terminal, then `docker-compose down`
2. Stop host API: `Ctrl+C` in the host API terminal

## Troubleshooting

### "Failed to fetch from host API" error

- Make sure the host API is running (Step 1)
- Check that you can access it: `curl http://localhost:9000/api/health`
- On Docker Desktop, `host.docker.internal` should work automatically

### No metrics showing

- Check host API logs - is the script executing?
- Check backend logs: `docker-compose logs backend`
- Verify the script is executable: `ls -la host_api/*.sh host_api/*.py`

## Architecture Summary

1. **Host API** (port 9000) - Runs on host, executes `system_monitor.sh`, returns real metrics
2. **Backend Container** (port 8000) - Proxies requests from frontend to host API
3. **Frontend Container** (port 3000) - React dashboard that displays metrics

All real metrics come from the host API, ensuring accurate host system metrics even when using Docker Desktop on Windows.
