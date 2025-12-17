/**
 * API Client for System Monitoring Backend
 * 
 * Handles all HTTP requests to the backend API.
 */

// API base URL from environment variable (set in docker-compose)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface MetricsResponse {
  timestamp: string;
  data: MetricsSnapshot | null;
  error: string | null;
}

export interface MetricsSnapshot {
  timestamp: string;
  cpu: {
    model: string;
    cores: number;
    usage: number;
    load_avg?: string;
    temperature?: string;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  disk: {
    display?: string;
    percent?: number;
    partitions?: Array<{
      path: string;
      size: string;
      used: string;
      avail: string;
      percent: number;
    }>;
  };
  network: {
    data?: string;
    stats?: {
      lan: { rx: number; tx: number };
      wifi: { rx: number; tx: number };
      tcp: number;
    };
  };
  gpu: {
    name: string;
    memory?: string;
    temperature?: string;
    utilization?: string;
  };
  system: {
    uptime?: string;
    process_count?: number;
    smart_status?: string;
    smart_health?: string;
    rom_info?: string;
  };
  top_processes: Array<{
    pid?: string;
    user?: string;
    memory_percent?: string;
    command?: string;
  }>;
  alerts?: string;
}

/**
 * Fetch the current metrics from the backend API.
 * 
 * @returns Promise resolving to the current metrics snapshot
 * @throws Error if the request fails
 */
export async function fetchCurrentMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE}/api/metrics/current`);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Parse temperature string (e.g., "45.5°C" or "N/A") to number or null.
 */
export function parseTemperature(tempStr?: string): number | null {
  if (!tempStr || tempStr === "N/A") return null;
  const match = tempStr.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Get color for temperature display (green <70°C, orange <85°C, red otherwise).
 */
export function getTemperatureColor(temp: number | null): string {
  if (temp === null) return "#666";
  if (temp < 70) return "#4caf50";  // green
  if (temp < 85) return "#ff9800";  // orange
  return "#f44336";  // red
}

