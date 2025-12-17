# Project Changes Log

## Overview
This document details the modifications made to the System Monitoring Project (`mokh-404/V7.1`) to enhance functionality, fix bugs, and add new features like historical reporting and visualization graphs.

---

## 1. Host API Repairs & Improvements

### `host_api/main.py`
- **Encoding Fix**: Changed `subprocess.run` to use `encoding='utf-8'` to correctly decode special characters (like the degree symbol `°`) which were previously displaying as artifacts (`Â°`).
- **Timeout Increase**: Increased script execution timeout from 60s/120s to **180 seconds** to prevent "Script execution timed out" errors on slower polls.
- **Windows/WSL Logic**: Added logic to detect Windows OS and execute the bash script via `wsl bash ...`, fixing the `[WinError 2]` (FileNotFound) error.

### `host_api/system_monitor.sh`
- **Uptime Fix**: Added a PowerShell strategy to query the **real Windows host uptime** (`LastBootUpTime`) instead of the WSL instance uptime.
- **Network Bug Fix**: Added missing `METRICS[NET_RAW]` assignment within the Windows `typeperf` block. This fixed the issue where network traffic was showing as "0 B/s".
- **Structured Data**: Refactored Disk and Network collection to output raw, pipe-delimited data for cleaner JSON parsing, eliminating fragile regex on the frontend.

### `host_api/collect_metrics.sh`
- **JSON Parsing**: Added helper functions to parse the new raw data structures into clean JSON objects (`network.stats`, `disk.partitions`).

---

## 2. Backend Enhancements

### `backend/app/metrics_proxy.py`
- **Persistence**: Implemented append-only logging to `history.jsonl`. Every successful metric poll is now saved to this file to support historical reporting.
- **Timeout Sync**: Increased the HTTP client timeout to **180 seconds** to match the Host API.

### `backend/app/main.py`
- **New Endpoint**: Added `GET /api/reports/all` which streams the `history.jsonl` file to the client for download.

### `backend/app/models.py`
- **New Models**: Added Pydantic models (`PartitionInfo`, `NetworkStats`) to strictly type the new structured data fields.

---

## 3. Frontend Features (React)

### `frontend/src/App.tsx`
- **Tabs Architecture**: Refactored the app to support navigation tabs ("Overview" vs "Statistics Graph").
- **State Management**: Added `history` state to store the last 60 polling snapshots for real-time graphing.

### `frontend/src/components/OverviewTab.tsx` (New)
- **Extracted Component**: Moved the original dashboard layout into this new component for modularity.
- **Report Download**: Added a **"Download Report (JSONL)"** button that links to the new backend API endpoint.

### `frontend/src/components/StatisticsTab.tsx` (New)
- **Visualization**: Created a new view using `recharts` to display real-time graphs.
- **Metrics Covered**:
    - CPU Usage (%)
    - Memory Usage (%)
    - Disk Usage (Total %)
    - GPU Utilization (%)
    - LAN Traffic (KB/s, Download/Upload)
    - WiFi Traffic (KB/s, Download/Upload)
- **Fixes**:
    - **Linear Interpolation**: Switched from smooth splines (`monotone`) to sharp lines (`linear`) to prevent graphs from "overshooting" into negative numbers.
    - **Positive Time Axis**: Fixed X-axis labels to show positive seconds (e.g., `60s` instead of `-60s`).

### `frontend/src/components/DiskCard.tsx` & `NetworkCard.tsx`
- **Refactor**: Rewrote these components to consume the new clean JSON data (`metrics.disk.partitions`, `metrics.network.stats`) instead of parsing raw strings with RegEx.

---

## 4. Docker Configuration

### `docker-compose.yml`
- **Networking**: Updated `HOST_API_BASE_URL` to use `http://host.docker.internal:9000` to correctly route traffic from the backend container to the host Windows API.
