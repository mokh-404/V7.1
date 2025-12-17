"""
Pydantic models for metric schemas.
Defines the structure of metrics data returned by the API.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class CPUMetrics(BaseModel):
    """CPU metrics model."""
    model: str
    cores: int
    usage: float  # percentage
    load_avg: Optional[str] = None
    temperature: Optional[str] = None  # Can be "N/A" or "XX°C"

class MemoryMetrics(BaseModel):
    """Memory metrics model."""
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float

class PartitionInfo(BaseModel):
    """Details for a single disk partition."""
    path: str
    size: str
    used: str
    avail: str
    percent: float

class DiskMetrics(BaseModel):
    """Disk metrics model."""
    display: Optional[str] = None  # Formatted string (Legacy)
    percent: Optional[float] = None # Primary disk percent
    partitions: Optional[List[PartitionInfo]] = None # List of all partitions

class TrafficStats(BaseModel):
    rx: float
    tx: float

class NetworkStats(BaseModel):
    lan: TrafficStats
    wifi: TrafficStats
    tcp: int

class NetworkMetrics(BaseModel):
    """Network metrics model."""
    data: Optional[str] = None
    stats: Optional[NetworkStats] = None  # Formatted network data string
    # Could be parsed further if needed

class GPUMetrics(BaseModel):
    """GPU metrics model."""
    name: str
    memory: Optional[str] = None
    temperature: Optional[str] = None
    utilization: Optional[str] = None

class SystemMetrics(BaseModel):
    """System info metrics model."""
    uptime: Optional[str] = None
    process_count: Optional[int] = None
    smart_status: Optional[str] = None
    smart_health: Optional[str] = None
    rom_info: Optional[str] = None

class ProcessInfo(BaseModel):
    """Top process information."""
    pid: Optional[str] = None
    user: Optional[str] = None
    memory_percent: Optional[str] = None
    command: Optional[str] = None

class MetricsSnapshot(BaseModel):
    """Complete metrics snapshot from the monitoring script."""
    timestamp: str
    cpu: CPUMetrics
    memory: MemoryMetrics
    disk: DiskMetrics
    network: NetworkMetrics
    gpu: GPUMetrics
    system: SystemMetrics
    top_processes: List[ProcessInfo]
    alerts: Optional[str] = None
    error: Optional[str] = None

class MetricsResponse(BaseModel):
    """API response model for current metrics."""
    timestamp: str
    data: Optional[MetricsSnapshot] = None
    error: Optional[str] = None

