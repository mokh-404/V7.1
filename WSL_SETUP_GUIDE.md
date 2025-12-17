# WSL Setup Guide - Step by Step Commands

This guide provides all the commands you need to run in WSL to set up and run the system monitoring solution.

## Prerequisites Check

First, verify you're in WSL and check your location:

```bash
# Check you're in WSL
uname -a

# Navigate to project root (adjust path as needed)
cd /mnt/z/t5/os/proj/v6/v6.2
# OR if your project is in a different location:
# cd ~/path/to/v6.2
```

## Step 1: Set Up Host API

### 1.1 Navigate to host_api directory

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api
```

### 1.2 Install Python dependencies

**Option A: With Virtual Environment (Recommended)**

```bash
# First, install python3-venv if not already installed
sudo apt update
sudo apt install python3-venv python3-pip

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Option B: System-Wide Installation (If venv fails)**

```bash
# Install packages system-wide
sudo pip3 install fastapi uvicorn[standard] pydantic

# No need to activate venv - skip to step 1.3
```

**If you get network/DNS errors**, see `WSL_TROUBLESHOOTING.md` for solutions.

### 1.3 Make scripts executable

```bash
chmod +x system_monitor.sh
chmod +x collect_metrics.sh
chmod +x gravity_bridge.py
```

### 1.4 Verify scripts exist

```bash
ls -la *.sh *.py
```

You should see:
- `system_monitor.sh`
- `collect_metrics.sh`
- `gravity_bridge.py`
- `main.py`
- `parse.py`

### 1.5 Start the Host API

```bash
# Make sure you're still in host_api directory
pwd  # Should show: .../v6.2/host_api

# If using virtual environment, activate it first:
# source venv/bin/activate

# Start the API server
uvicorn main:app --host 0.0.0.0 --port 9000
# OR if uvicorn is not in PATH:
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000
```

**Keep this terminal open!** The host API must keep running.

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:9000 (Press CTRL+C to quit)
```

### 1.6 Test the Host API (in a new WSL terminal)

Open a **new WSL terminal** and run:

```bash
# Test health endpoint
curl http://localhost:9000/api/health

# Test metrics endpoint
curl http://localhost:9000/api/metrics/current | head -20
```

If you see JSON output, the host API is working!

## Step 2: Start Docker Containers

### 2.1 Navigate to project root

In a **new WSL terminal** (keep the host API running in the first terminal):

```bash
cd /mnt/z/t5/os/proj/v6/v6.2
```

### 2.2 Build Docker images

```bash
docker-compose build
```

This may take a few minutes the first time.

### 2.3 Start containers

```bash
docker-compose up
```

You should see both containers starting:
- `monitoring-backend`
- `monitoring-frontend`

### 2.4 Verify containers are running

In another terminal, check:

```bash
docker-compose ps
```

Both services should show "Up" status.

## Step 3: Access the Dashboard

Open your web browser and go to:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Host API Docs**: http://localhost:9000/docs

## Complete Command Sequence (Copy-Paste Ready)

Here's the complete sequence you can copy-paste:

### Terminal 1: Host API

```bash
# Navigate to project
cd /mnt/z/t5/os/proj/v6/v6.2/host_api

# Install python3-venv if needed
sudo apt update
sudo apt install python3-venv python3-pip

# Option A: With virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Option B: System-wide (if venv fails)
# sudo pip3 install fastapi uvicorn[standard] pydantic

# Make scripts executable
chmod +x system_monitor.sh collect_metrics.sh gravity_bridge.py

# Start host API (keep this running)
uvicorn main:app --host 0.0.0.0 --port 9000
# OR: python3 -m uvicorn main:app --host 0.0.0.0 --port 9000
```

### Terminal 2: Docker Containers

```bash
# Navigate to project root
cd /mnt/z/t5/os/proj/v6/v6.2

# Build and start containers
docker-compose build
docker-compose up
```

### Terminal 3: Testing (Optional)

```bash
# Test host API
curl http://localhost:9000/api/health

# Test backend API
curl http://localhost:8000/api/health

# Check container logs
docker-compose logs backend
docker-compose logs frontend
```

## Stopping Everything

### Stop Docker containers

In Terminal 2 (where docker-compose is running):
```bash
# Press Ctrl+C to stop
# Then run:
docker-compose down
```

### Stop Host API

In Terminal 1 (where host API is running):
```bash
# Press Ctrl+C
```

## Troubleshooting Commands

### Check if host API is running

```bash
curl http://localhost:9000/api/health
```

### Check if backend can reach host API

```bash
docker-compose exec backend curl http://host.docker.internal:9000/api/health
```

### View backend logs

```bash
docker-compose logs -f backend
```

### View frontend logs

```bash
docker-compose logs -f frontend
```

### Rebuild containers after code changes

```bash
cd /mnt/z/t5/os/proj/v6/v6.2
docker-compose build --no-cache
docker-compose up
```

### Check container status

```bash
docker-compose ps
```

### Restart a specific container

```bash
docker-compose restart backend
# or
docker-compose restart frontend
```

## Directory Structure Reference

```
/mnt/z/t5/os/proj/v6/v6.2/          # Project root
├── host_api/                        # Run: uvicorn main:app --host 0.0.0.0 --port 9000
│   ├── main.py
│   ├── parse.py
│   ├── system_monitor.sh
│   ├── collect_metrics.sh
│   └── gravity_bridge.py
├── backend/                         # Built by docker-compose
├── frontend/                        # Built by docker-compose
└── docker-compose.yml              # Run: docker-compose up (from here)
```

## Quick Reference

| Task | Directory | Command |
|------|-----------|---------|
| Start Host API | `host_api/` | `uvicorn main:app --host 0.0.0.0 --port 9000` |
| Build Docker | `v6.2/` (root) | `docker-compose build` |
| Start Docker | `v6.2/` (root) | `docker-compose up` |
| Stop Docker | `v6.2/` (root) | `docker-compose down` |
| View Logs | `v6.2/` (root) | `docker-compose logs -f backend` |

## Notes

- **Host API must run before Docker containers** - the backend needs it to be available
- **Keep Host API terminal open** - it must keep running
- **Use separate terminals** - one for host API, one for Docker
- **Path may vary** - adjust `/mnt/z/t5/os/proj/v6/v6.2` to your actual project path

