"""
FastAPI Backend Application

This is the main entrypoint for the system monitoring backend API.
It orchestrates the trusted bash script (system_monitor.sh) and exposes
metrics via a REST API.

The backend NEVER reads /proc directly - all metrics come from the bash script.
"""
import logging
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .metrics_proxy import collect_loop, get_latest_metrics
from .models import MetricsResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Show INFO, WARNING, and ERROR level messages
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="System Monitoring Backend",
    description="Backend API that orchestrates system_monitor.sh for real host metrics",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """
    Start the background metrics proxy thread on application startup.
    
    This thread continuously fetches metrics from the host API (which runs
    system_monitor.sh on the host) and caches them in memory. The thread runs
    as a daemon so it stops when the app shuts down.
    """
    logger.info("Starting metrics proxy background thread...")
    thread = threading.Thread(target=collect_loop, daemon=True)
    thread.start()
    logger.info("Metrics proxy thread started")


@app.get("/", tags=["Root"])
def root():
    """Root endpoint with API information."""
    return {
        "name": "System Monitoring Backend",
        "version": "1.0.0",
        "description": "Backend API orchestrating system_monitor.sh for real host metrics"
    }


@app.get("/api/metrics/current", response_model=MetricsResponse, tags=["Metrics"])
def get_current_metrics():
    """
    Get the most recent metrics snapshot from the host API.
    
    Returns:
        MetricsResponse with the latest metrics fetched from the host API
        
    Note:
        All metrics come from the host API which executes system_monitor.sh on
        the host. This backend container never reads /proc or computes metrics directly.
    """
    latest = get_latest_metrics()
    
    # Convert to response model
    response = MetricsResponse(
        timestamp=latest.get("timestamp", ""),
        data=latest.get("data"),
        error=latest.get("error")
    )
    
    return response


@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    
    Returns basic status information about the backend service.
    """
    latest = get_latest_metrics()
    return {
        "status": "healthy",
        "last_metrics_timestamp": latest.get("timestamp"),
        "has_data": latest.get("data") is not None,
        "has_error": latest.get("error") is not None
    }

