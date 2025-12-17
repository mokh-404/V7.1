"""
Host-side FastAPI application that executes system_monitor.sh.

This API runs directly on the host (WSL1 or native Linux) outside Docker.
It executes the trusted bash script and exposes metrics via HTTP so that
Docker containers can access real host metrics without trying to read /proc
from inside containers.

Run this with:
    cd host_api
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 9000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from parse import parse_stdout
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Host Metrics API",
    description="API that executes system_monitor.sh on the host and exposes real metrics",
    version="1.0.0"
)

# Enable CORS (containers may need this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Script paths (relative to host_api directory)
SCRIPT_DIR = Path(__file__).parent
COLLECT_SCRIPT = SCRIPT_DIR / "collect_metrics.sh"
MONITOR_SCRIPT = SCRIPT_DIR / "system_monitor.sh"


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "Host Metrics API",
        "version": "1.0.0",
        "description": "Executes system_monitor.sh on host and exposes real metrics"
    }


@app.get("/api/metrics/current")
def current_metrics() -> Dict[str, Any]:
    """
    Execute the unified bash monitoring script once and return parsed metrics.
    
    This endpoint runs collect_metrics.sh wrapper script which sources
    system_monitor.sh and outputs JSON with all system metrics.
    
    Returns:
        Dictionary with structure:
        {
            "timestamp": "ISO timestamp",
            "data": {
                "cpu": {...},
                "memory": {...},
                "disk": {...},
                "gpu": {...},
                "network": {...},
                "system": {...},
                "top_processes": [...],
                "alerts": "..."
            },
            "error": null or error message
        }
    """
    # Ensure script exists
    if not COLLECT_SCRIPT.exists():
        error_msg = f"Wrapper script not found at {COLLECT_SCRIPT}"
        logger.error(error_msg)
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }
    
    if not MONITOR_SCRIPT.exists():
        error_msg = f"Monitor script not found at {MONITOR_SCRIPT}"
        logger.error(error_msg)
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }
    
    try:
        # Execute the wrapper script
        # This script sources system_monitor.sh and outputs JSON
        result = subprocess.run(
            ["/bin/bash", str(COLLECT_SCRIPT)],
            capture_output=True,
            text=True,
            timeout=60,  # 60 second timeout
            cwd=str(SCRIPT_DIR),  # Run from script directory
        )
        
        if result.returncode != 0:
            error_msg = f"Script failed with return code {result.returncode}: {result.stderr}"
            logger.error(error_msg)
            logger.debug(f"Script stdout: {result.stdout[:500]}")
            return {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": None,
                "error": error_msg,
            }
        
        # Parse JSON output from stdout
        if not result.stdout.strip():
            logger.warning("Script returned empty output")
            return {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": None,
                "error": "Script returned empty output",
            }
        
        # Parse the JSON output
        try:
            data = parse_stdout(result.stdout)
            return {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": data,
                "error": None,
            }
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse script output: {e}")
            logger.debug(f"Raw output (first 500 chars): {result.stdout[:500]}")
            return {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": None,
                "error": f"Failed to parse script output: {str(e)}",
            }
            
    except subprocess.TimeoutExpired:
        error_msg = "Script execution timed out after 60 seconds"
        logger.error(error_msg)
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }
    except Exception as e:
        error_msg = f"Unexpected error executing script: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": None,
            "error": error_msg,
        }


@app.get("/api/health")
def health_check():
    """
    Health check endpoint.
    
    Returns basic status information about the host API service.
    """
    scripts_exist = COLLECT_SCRIPT.exists() and MONITOR_SCRIPT.exists()
    return {
        "status": "healthy" if scripts_exist else "degraded",
        "scripts_available": scripts_exist,
        "collect_script": str(COLLECT_SCRIPT),
        "monitor_script": str(MONITOR_SCRIPT),
    }

