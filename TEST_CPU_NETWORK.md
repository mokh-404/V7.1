# Testing CPU Usage and Network Speed

## The Fix

I've updated `host_api/collect_metrics.sh` to persist state between API calls. This allows:
- **CPU Usage**: Calculated from delta between two readings
- **Network Speed**: Calculated from delta between two readings

## How It Works

1. First API call: Returns 0% CPU and 0 B/s network (no previous state)
2. State is saved to `host_api/../data/metrics_state.txt`
3. Second API call: Loads previous state and calculates deltas
4. CPU usage and network speed are now accurate!

## Testing

1. **Restart the host API** (in WSL1):
   ```bash
   # Stop current host API (Ctrl+C)
   cd /mnt/z/t5/os/proj/v6/v6.2/host_api
   uvicorn main:app --host 0.0.0.0 --port 9000
   ```

2. **Wait 5-10 seconds** for the backend to make 2-3 API calls

3. **Check the metrics**:
   ```bash
   curl http://localhost:8000/api/metrics/current | jq '.data.cpu.usage, .data.network.data'
   ```

   You should see:
   - CPU usage > 0% (not 0.0)
   - Network speed > 0 B/s (not 0 B/s)

4. **Check the state file**:
   ```bash
   cat /mnt/z/t5/os/proj/v6/v6.2/data/metrics_state.txt
   ```

   You should see saved state values.

## Expected Behavior

- **First call**: CPU = 0.0%, Network = 0 B/s (no previous state)
- **Second call onwards**: CPU and Network show real values

The backend polls every 5 seconds, so after ~10 seconds you should see real values.

