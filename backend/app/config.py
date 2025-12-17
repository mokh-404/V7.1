"""
Configuration management for the monitoring backend.
Handles environment variables and default settings.
"""
import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables."""
    
    # Host API URL - this is the API running on the host (WSL1/Linux) outside Docker
    # Docker Desktop provides host.docker.internal to reach the host
    HOST_API_BASE_URL: str = os.getenv("HOST_API_BASE_URL", "http://host.docker.internal:9000")
    
    # Polling interval in seconds (how often to fetch from host API)
    POLL_INTERVAL_SECONDS: int = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))
    
    # Note: Data directories are not needed here since metrics come from host API
    # The host API handles all script execution and data storage

settings = Settings()

