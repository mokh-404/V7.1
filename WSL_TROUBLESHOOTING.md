# WSL Troubleshooting Guide

## Issue 1: Virtual Environment Not Created

### Error: `ensurepip is not available`

**Solution:** Install python3-venv package

```bash
sudo apt update
sudo apt install python3.10-venv
# OR if you have a different Python version:
sudo apt install python3-venv
```

Then recreate the virtual environment:

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api
rm -rf venv  # Remove failed venv if it exists
python3 -m venv venv
source venv/bin/activate
```

## Issue 2: Network/DNS Issues (pip can't download packages)

### Error: `Temporary failure in name resolution` or `Failed to establish a new connection`

This means WSL can't resolve DNS or reach the internet. Try these solutions:

### Solution A: Fix DNS Resolution

```bash
# Check current DNS settings
cat /etc/resolv.conf

# If it's empty or wrong, try:
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 8.8.4.4" >> /etc/resolv.conf'

# Test DNS
ping -c 3 google.com
```

### Solution B: Use System-Wide Installation (No Virtual Environment)

If virtual environment and network issues persist, install packages system-wide:

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api

# Install packages system-wide (requires sudo)
sudo pip3 install fastapi uvicorn[standard] pydantic

# Make scripts executable
chmod +x system_monitor.sh collect_metrics.sh gravity_bridge.py

# Run directly (no venv activation needed)
uvicorn main:app --host 0.0.0.0 --port 9000
```

### Solution C: Use pip with --user flag

```bash
cd /mnt/z/t5/os/proj/v6/v6.2/host_api

# Install to user directory (no sudo needed)
pip3 install --user fastapi uvicorn[standard] pydantic

# Add user bin to PATH (add to ~/.bashrc for permanent)
export PATH="$HOME/.local/bin:$PATH"

# Run
uvicorn main:app --host 0.0.0.0 --port 9000
```

## Complete Alternative Setup (No Virtual Environment)

If you're having persistent issues, use this simplified approach:

```bash
# 1. Navigate to host_api
cd /mnt/z/t5/os/proj/v6/v6.2/host_api

# 2. Install python3-venv (if you want venv later)
sudo apt update
sudo apt install python3-venv python3-pip

# 3. Fix DNS if needed
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 8.8.4.4" >> /etc/resolv.conf'

# 4. Install packages system-wide
sudo pip3 install fastapi uvicorn[standard] pydantic

# 5. Make scripts executable
chmod +x system_monitor.sh collect_metrics.sh gravity_bridge.py

# 6. Run the API
uvicorn main:app --host 0.0.0.0 --port 9000
```

## Verify Installation

After installing, verify packages are available:

```bash
# Check if uvicorn is installed
which uvicorn
uvicorn --version

# Check if fastapi is installed
python3 -c "import fastapi; print(fastapi.__version__)"
```

## If Still Having Issues

1. **Check internet connectivity:**
   ```bash
   ping -c 3 8.8.8.8
   curl https://pypi.org
   ```

2. **Check Python version:**
   ```bash
   python3 --version
   ```

3. **Try installing with specific index:**
   ```bash
   pip3 install --index-url https://pypi.org/simple fastapi uvicorn[standard] pydantic
   ```

4. **Check if behind proxy:**
   ```bash
   echo $http_proxy
   echo $https_proxy
   ```

