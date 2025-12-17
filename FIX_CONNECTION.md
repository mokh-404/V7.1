# Fix: Backend Can't Connect to Host API

## Problem
Backend container can't reach host API even though it's running in WSL1.

## Solution Options

### Option 1: Use WSL1 IP Address Directly (Most Reliable)

1. **Get your WSL1 IP address:**

In WSL1 terminal:
```bash
hostname -I | awk '{print $1}'
```

This will output something like `172.18.48.1` or `192.168.x.x`

2. **Update docker-compose.yml:**

Edit `docker-compose.yml` and replace the `HOST_API_BASE_URL`:

```yaml
environment:
  - HOST_API_BASE_URL=http://<YOUR_WSL1_IP>:9000
```

For example, if your WSL1 IP is `172.18.48.1`:
```yaml
environment:
  - HOST_API_BASE_URL=http://172.18.48.1:9000
```

3. **Restart containers:**

```bash
docker-compose down
docker-compose up
```

### Option 2: Use Windows Host IP (Gateway)

If Option 1 doesn't work, try the Windows host IP:

1. **Get Windows host IP (gateway):**

In WSL1 terminal:
```bash
ip route show | grep default | awk '{print $3}'
```

2. **Use that IP in docker-compose.yml** (same as Option 1)

### Option 3: Verify Host API Binding

Make sure the host API is binding to `0.0.0.0`, not just `127.0.0.1`:

In WSL1 terminal:
```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api

# Make sure you're using --host 0.0.0.0 (not 127.0.0.1)
uvicorn main:app --host 0.0.0.0 --port 9000
```

### Option 4: Test Connection from Container

Test if the container can reach the host API:

```bash
# Get WSL1 IP first
wsl hostname -I | awk '{print $1}'

# Test from container (replace with your WSL1 IP)
docker-compose exec backend curl http://<WSL1_IP>:9000/api/health
```

## Quick Fix Command Sequence

```bash
# 1. Get WSL1 IP
wsl hostname -I | awk '{print $1}'

# 2. Edit docker-compose.yml and replace HOST_API_BASE_URL with the IP

# 3. Restart
docker-compose down
docker-compose up
```

## Verify It's Working

After fixing, check backend logs:

```bash
docker-compose logs backend | grep "Successfully fetched"
```

You should see:
```
INFO - Successfully fetched metrics from host API
```

Instead of connection errors.

