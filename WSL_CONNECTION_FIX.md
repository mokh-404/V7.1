# Fixing Host API Connection Issues

## Problem
The Docker backend container can't connect to the host API running in WSL1.

## Step 1: Verify Host API is Running

In your WSL1 terminal where you started the host API, check:

```bash
# Check if uvicorn process is running
ps aux | grep uvicorn

# Check if port 9000 is listening
netstat -tlnp | grep 9000
# OR
ss -tlnp | grep 9000
```

If you don't see uvicorn running, start it:

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api
uvicorn main:app --host 0.0.0.0 --port 9000
```

## Step 2: Test from WSL1

From WSL1 terminal, test the host API:

```bash
# Test from WSL1 itself
curl http://localhost:9000/api/health
curl http://127.0.0.1:9000/api/health
```

If this works, the host API is running correctly.

## Step 3: Get WSL1 IP Address

Docker containers need to reach WSL1. Get WSL1's IP address:

```bash
# In WSL1 terminal, get your IP
hostname -I
# OR
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
# OR
ifconfig | grep "inet " | grep -v 127.0.0.1
```

This will give you an IP like `172.x.x.x` or `192.168.x.x`

## Step 4: Update docker-compose.yml

Update the `HOST_API_BASE_URL` to use WSL1's IP address instead of `host.docker.internal`.

Option A: Use WSL1 IP directly

```yaml
environment:
  - HOST_API_BASE_URL=http://<WSL1_IP>:9000
```

Option B: Use host network mode for backend (simpler)

```yaml
backend:
  network_mode: "host"
  # Remove ports mapping when using host network
```

## Step 5: Alternative - Use WSL2 Host IP

If you're using WSL2, you might need the Windows host IP. In WSL1:

```bash
# Get Windows host IP (usually the gateway)
ip route show | grep default | awk '{print $3}'
```

Then use that IP in docker-compose.yml.

