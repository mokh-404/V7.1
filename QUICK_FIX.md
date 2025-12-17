# Quick Fix for Connection Issue

## The Problem
Backend container can't reach host API at `host.docker.internal:9000` in WSL1.

## The Solution
I've updated `docker-compose.yml` to use `network_mode: "host"` for the backend, so it can access `localhost:9000` directly.

## Steps to Fix

### 1. Verify Host API is Running

In your WSL1 terminal, check:

```bash
# Check if host API is running
curl http://localhost:9000/api/health
```

If it's not running, start it:

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api
uvicorn main:app --host 0.0.0.0 --port 9000
```

### 2. Restart Docker Containers

In your Windows terminal (where docker-compose is running):

```bash
cd Z:\t5\os\proj\v6\v6.2

# Stop containers
docker-compose down

# Rebuild and start (to pick up docker-compose.yml changes)
docker-compose up --build
```

### 3. Verify Connection

Check backend logs - you should see:

```
INFO - Successfully fetched metrics from host API
```

Instead of connection errors.

## Alternative: If Host Network Mode Doesn't Work

If you still have issues, use WSL1's IP address directly:

1. Get WSL1 IP:
```bash
# In WSL1 terminal
hostname -I | awk '{print $1}'
```

2. Update docker-compose.yml:
```yaml
environment:
  - HOST_API_BASE_URL=http://<WSL1_IP>:9000
```

3. Remove `network_mode: "host"` and restore normal networking.

