#!/bin/bash
################################################################################
# Metrics Collection Wrapper
# 
# This script sources the main system_monitor.sh and runs one collection cycle,
# then outputs metrics in JSON format for the backend API to parse.
#
# This wrapper does NOT modify the core script logic - it only orchestrates
# a single collection run and formats the output.
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the main monitoring script to get all functions
# Note: If running in Docker, /proc and /sys should be mounted from the host
# (read-only) so the script reads real host metrics instead of container metrics
# The script will set its own SCRIPT_DIR and derive DATA_DIR, LOG_DIR, REPORT_DIR from it
if [ -f "${SCRIPT_DIR}/system_monitor.sh" ]; then
    # Source the script but prevent main() from running
    source "${SCRIPT_DIR}/system_monitor.sh" 2>/dev/null || true
else
    echo "{\"error\": \"system_monitor.sh not found\"}" >&2
    exit 1
fi

# Override directory paths if environment variables are set
# This allows Docker to control where data is written
if [ -n "${DATA_DIR}" ]; then
    DATA_DIR="${DATA_DIR}"
    CSV_FILE="${DATA_DIR}/metrics.csv"
fi
if [ -n "${LOG_DIR}" ]; then
    LOG_DIR="${LOG_DIR}"
    LOG_FILE="${LOG_DIR}/system_monitor.log"
fi
if [ -n "${REPORT_DIR}" ]; then
    REPORT_DIR="${REPORT_DIR}"
    HTML_REPORT="${REPORT_DIR}/report.html"
fi

# Initialize directories with potentially overridden paths
setup_directories 2>/dev/null || mkdir -p "$DATA_DIR" "$LOG_DIR" "$REPORT_DIR" 2>/dev/null

# Initialize global state (required for delta calculations)
PREV_CPU_TOTAL=0
PREV_CPU_IDLE=0
PREV_NET_TIME=0
declare -A PREV_NET_RX
declare -A PREV_NET_TX

# Initialize METRICS array
declare -A METRICS

# Run one collection cycle (mimics what main() does but only once)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Collect all metrics
collect_rom_metrics 2>/dev/null
collect_cpu_metrics 2>/dev/null
collect_memory_metrics 2>/dev/null
collect_network_metrics 2>/dev/null
collect_load_metrics 2>/dev/null
collect_top_processes 2>/dev/null
collect_gpu_metrics 2>/dev/null
collect_disk_metrics 2>/dev/null
collect_smart_status 2>/dev/null
check_alerts 2>/dev/null

# Output JSON format
# Escape JSON strings properly
escape_json() {
    echo "$1" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\r/\\r/g'
}

# Parse top processes
parse_top_processes() {
    local procs="${METRICS[TOP_PROCS]}"
    echo "["
    if [ -n "$procs" ]; then
        IFS=';' read -ra PROC_ARRAY <<< "$procs"
        local first=1
        for proc in "${PROC_ARRAY[@]}"; do
            [ -z "$proc" ] && continue
            [ "$first" -eq 1 ] && first=0 || echo ","
            
            # Parse: "PID USER MEM% CMD"
            local pid=$(echo "$proc" | awk '{print $1}')
            local user=$(echo "$proc" | awk '{print $2}')
            local mem=$(echo "$proc" | awk '{print $3}')
            local cmd=$(echo "$proc" | cut -d' ' -f4-)
            
            echo -n "  {"
            echo -n "\"pid\": \"$(escape_json "$pid")\","
            echo -n "\"user\": \"$(escape_json "$user")\","
            echo -n "\"memory_percent\": \"$(escape_json "$mem")\","
            echo -n "\"command\": \"$(escape_json "$cmd")\""
            echo -n "}"
        done
    fi
    echo ""
    echo "]"
}

# Output JSON
echo "{"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S%z")\","
echo "  \"cpu\": {"
echo "    \"model\": \"$(escape_json "${METRICS[CPU_MODEL]:-Unknown}")\","
echo "    \"cores\": ${METRICS[CPU_CORES]:-0},"
echo "    \"usage\": ${METRICS[CPU_USAGE]:-0},"
echo "    \"load_avg\": \"$(escape_json "${METRICS[LOAD_AVG]:-N/A}")\","
echo "    \"temperature\": \"$(escape_json "${METRICS[TEMP]:-N/A}")\""
echo "  },"
echo "  \"memory\": {"
echo "    \"total_gb\": ${METRICS[MEM_TOTAL]:-0},"
echo "    \"used_gb\": ${METRICS[MEM_USED]:-0},"
echo "    \"free_gb\": ${METRICS[MEM_FREE]:-0},"
echo "    \"percent\": ${METRICS[MEM_PERCENT]:-0}"
echo "  },"
echo "  \"disk\": {"
echo "    \"display\": \"$(escape_json "${METRICS[DISK_DISPLAY]:-N/A}")\","
echo "    \"percent\": ${METRICS[DISK_PERCENT]:-0},"
echo "    \"info\": \"$(escape_json "${METRICS[DISK_INFO]:-N/A}")\""
echo "  },"
echo "  \"network\": {"
echo "    \"data\": \"$(escape_json "${METRICS[NET_DATA]:-N/A}")\""
echo "  },"
echo "  \"gpu\": {"
echo "    \"name\": \"$(escape_json "${METRICS[GPU_NAME]:-N/A}")\","
echo "    \"memory\": \"$(escape_json "${METRICS[GPU_MEM]:-N/A}")\","
echo "    \"temperature\": \"$(escape_json "${METRICS[GPU_TEMP]:-N/A}")\","
echo "    \"utilization\": \"$(escape_json "${METRICS[GPU_UTIL]:-N/A}")\""
echo "  },"
echo "  \"system\": {"
echo "    \"uptime\": \"$(escape_json "${METRICS[UPTIME]:-N/A}")\","
echo "    \"process_count\": ${METRICS[PROC_COUNT]:-0},"
echo "    \"smart_status\": \"$(escape_json "${METRICS[SMART_STATUS]:-N/A}")\","
echo "    \"smart_health\": \"$(escape_json "${METRICS[SMART_HEALTH]:-N/A}")\","
echo "    \"rom_info\": \"$(escape_json "${METRICS[ROM_INFO]:-N/A}")\""
echo "  },"
echo "  \"top_processes\": $(parse_top_processes),"
echo "  \"alerts\": \"$(escape_json "${METRICS[ALERTS]:-No alerts.}")\""
echo "}"

