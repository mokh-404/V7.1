"""
Metrics Runner Module (Simple version using wrapper script)

This module executes the trusted bash script (system_monitor.sh) via subprocess
and parses its output. The backend NEVER reads /proc directly - all metrics
authority stays in the bash script.

The script is executed via a wrapper that collects metrics once and outputs JSON.
"""
import subprocess
import threading
import time
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

from .config import settings

logger = logging.getLogger(__name__)

# Global storage for latest metrics
latest_metrics: Dict[str, Any] = {
    "timestamp": None,
    "data": None,
    "error": None,
}

# Thread lock for safe concurrent access
metrics_lock = threading.Lock()


def parse_script_json(json_output: str) -> Dict[str, Any]:
    """
    Parse JSON output from the metrics collection wrapper script.
    
    Args:
        json_output: JSON string from the wrapper script
        
    Returns:
        Parsed metrics dictionary
    """
    try:
        data = json.loads(json_output)
        return data
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from script: {e}")
        logger.debug(f"Raw output: {json_output[:500]}")  # Log first 500 chars
        raise


def collect_metrics_once() -> Optional[Dict[str, Any]]:
    """
    Execute the metrics collection wrapper script once and return parsed metrics.
    
    This function runs the wrapper script as a subprocess. The wrapper script
    sources system_monitor.sh and runs one collection cycle, outputting JSON.
    
    NOTE: On Windows/Docker Desktop, this will show Docker VM metrics, not Windows
    host metrics. For real host metrics, use native Linux or WSL1 with Docker in WSL1.
    
    Returns:
        Parsed metrics dictionary, or None on error
    """
    wrapper_script = Path(settings.SCRIPT_DIR) / "collect_metrics.sh"
    
    if not wrapper_script.exists():
        error_msg = f"Wrapper script not found at {wrapper_script}"
        logger.error(error_msg)
        return None
    
    try:
        # Execute the wrapper script
        # The script sources system_monitor.sh internally, so all the trusted
        # metric collection logic is executed here
        result = subprocess.run(
            ["/bin/bash", str(wrapper_script)],
            capture_output=True,
            text=True,
            timeout=30,  # 30 second timeout for safety
            cwd=settings.SCRIPT_DIR,  # Run from script directory
        )
        
        if result.returncode != 0:
            error_msg = f"Script failed with return code {result.returncode}: {result.stderr}"
            logger.error(error_msg)
            logger.error(f"Script stdout: {result.stdout[:500]}")
            return None
        
        # Parse JSON output from stdout
        if not result.stdout.strip():
            logger.warning("Script returned empty output")
            logger.debug(f"Script stderr: {result.stderr}")
            return None
            
        metrics = parse_script_json(result.stdout)
        return metrics
        
    except subprocess.TimeoutExpired:
        logger.error("Script execution timed out after 30 seconds")
        return None
    except Exception as e:
        logger.error(f"Unexpected error executing script: {e}", exc_info=True)
        return None


def collect_metrics_loop():
    """
    Background thread function that continuously collects metrics.
    
    Runs in a loop, executing the metrics collection script every
    POLL_INTERVAL_SECONDS and updating the global latest_metrics.
    """
    global latest_metrics
    
    logger.info(f"Starting metrics collection loop (interval: {settings.POLL_INTERVAL_SECONDS}s)")
    
    while True:
        try:
            # Collect metrics via the trusted bash script
            metrics_data = collect_metrics_once()
            
            with metrics_lock:
                if metrics_data:
                    latest_metrics = {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "data": metrics_data,
                        "error": None,
                    }
                    logger.debug(f"Metrics updated successfully at {latest_metrics['timestamp']}")
                else:
                    latest_metrics = {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "data": None,
                        "error": "Failed to collect metrics from script",
                    }
                    logger.warning("Metrics collection returned None")
                    
        except Exception as e:
            logger.error(f"Error in metrics collection loop: {e}", exc_info=True)
            with metrics_lock:
                latest_metrics = {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "data": None,
                    "error": str(e),
                }
        
        # Wait before next collection
        time.sleep(settings.POLL_INTERVAL_SECONDS)


def get_latest_metrics() -> Dict[str, Any]:
    """
    Get the latest metrics snapshot (thread-safe).
    
    Returns:
        Dictionary with timestamp, data, and error fields
    """
    with metrics_lock:
        # Return a copy to avoid race conditions
        return latest_metrics.copy()

