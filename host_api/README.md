# Host Metrics API

This is the host-side FastAPI application that executes `system_monitor.sh` on the host (WSL1 or native Linux) and exposes real host metrics via HTTP.

## Why This Exists

Docker containers cannot access the real host's `/proc` and `/sys` filesystems, especially on Windows with Docker Desktop. This host API runs **outside Docker** on the host system, executes the trusted bash script, and exposes metrics via HTTP so Docker containers can access real host metrics.

## Setup

1. **Install dependencies:**

```bash
cd host_api
pip install -r requirements.txt
```

2. **Ensure scripts are executable:**

```bash
chmod +x system_monitor.sh
chmod +x collect_metrics.sh
chmod +x gravity_bridge.py
```

3. **Run the API:**

```bash
uvicorn main:app --host 0.0.0.0 --port 9000
```

The API will be available at `http://localhost:9000`

## API Endpoints

- `GET /` - API information
- `GET /api/metrics/current` - Execute script and return current metrics
- `GET /api/health` - Health check

## Running in Production

For production, you might want to use a process manager like `systemd` or run it in the background:

```bash
nohup uvicorn main:app --host 0.0.0.0 --port 9000 > host_api.log 2>&1 &
```

Or create a systemd service file.

## Notes

- This API must run on the host (WSL1 or native Linux), not inside Docker
- It executes `system_monitor.sh` which reads real host metrics from `/proc`, `/sys`, etc.
- Docker containers can reach it via `http://host.docker.internal:9000` (Docker Desktop) or the host's IP address

