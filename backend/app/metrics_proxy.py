"""
Metrics Proxy Module

This module acts as a proxy/adapter between the Docker backend container and
the host-side API that executes system_monitor.sh.

The backend container NEVER reads /proc directly - it only fetches metrics
from the host API which runs the trusted bash script on the host.
"""
import requests
import time
import logging
import json
from pathlib import Path

# ... (imports)

HISTORY_FILE = Path("history.jsonl")

# Initialize persistent storage (reset on startup)
if HISTORY_FILE.exists():
    try:
        HISTORY_FILE.unlink()
    except OSError:
        pass # Ignore if open

# Global storage for latest metrics fetched from host API
LATEST: Dict[str, Any] = {
# ...
}


def collect_from_host_api():
    """
    Fetch metrics from the host API and update LATEST.
    Also appends the data to the persistent history file.
    """
    global LATEST
    
    url = f"{settings.HOST_API_BASE_URL}/api/metrics/current"
    
    try:
        logger.debug(f"Fetching metrics from host API: {url}")
        r = requests.get(url, timeout=180)
        r.raise_for_status()
        payload = r.json()
        
        # Normalize: expect host API to return {timestamp, data, error}
        current_data = {
            "timestamp": payload.get("timestamp", datetime.utcnow().isoformat() + "Z"),
            "data": payload.get("data"),
            "error": payload.get("error"),
        }
        
        LATEST = current_data
        
        # Append to history file if data is valid
        if not LATEST.get("error") and LATEST.get("data"):
            try:
                with open(HISTORY_FILE, "a", encoding="utf-8") as f:
                    json.dump(LATEST, f)
                    f.write("\n")
            except Exception as e:
                logger.error(f"Failed to write to history file: {e}")
        
        if LATEST.get("error"):
            logger.warning(f"Host API returned error: {LATEST['error']}")
        else:
            logger.debug(f"Successfully fetched metrics from host API")
            
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to fetch from host API: {str(e)}"
        logger.error(error_msg)
        LATEST = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }
    except Exception as e:
        error_msg = f"Unexpected error fetching from host API: {str(e)}"
        logger.error(error_msg, exc_info=True)
        LATEST = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }


def collect_loop():
    """
    Background loop that periodically fetches metrics from the host API.
    
    This function runs in a background thread and continuously polls the
    host API for the latest metrics.
    """
    global LATEST
    
    logger.info(f"Starting metrics proxy loop (interval: {settings.POLL_INTERVAL_SECONDS}s)")
    logger.info(f"Host API URL: {settings.HOST_API_BASE_URL}")
    
    while True:
        try:
            collect_from_host_api()
        except Exception as e:
            logger.error(f"Error in metrics proxy loop: {e}", exc_info=True)
            LATEST = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": None,
                "error": str(e),
            }
        
        # Wait before next fetch
        time.sleep(settings.POLL_INTERVAL_SECONDS)


def get_latest_metrics() -> Dict[str, Any]:
    """
    Get the latest metrics fetched from the host API.
    
    Returns:
        Dictionary with timestamp, data, and error fields
    """
    # Return a copy to avoid race conditions
    return LATEST.copy()

