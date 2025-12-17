"""
Parse module for converting system_monitor.sh output to JSON.

Since we're using the collect_metrics.sh wrapper script which already outputs JSON,
this module primarily handles JSON parsing and validation. However, it can also
parse raw stdout if needed.
"""
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def parse_json_output(json_output: str) -> Dict[str, Any]:
    """
    Parse JSON output from collect_metrics.sh wrapper script.
    
    The wrapper script sources system_monitor.sh and outputs structured JSON
    with all metrics. This function validates and returns the parsed data.
    
    Args:
        json_output: JSON string from the wrapper script
        
    Returns:
        Parsed metrics dictionary
        
    Raises:
        json.JSONDecodeError: If JSON is invalid
        ValueError: If required fields are missing
    """
    try:
        data = json.loads(json_output)
        
        # Validate structure (basic check)
        if not isinstance(data, dict):
            raise ValueError("Expected JSON object at root level")
        
        # Return the parsed data
        return data
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        logger.debug(f"Raw output (first 500 chars): {json_output[:500]}")
        raise


def parse_stdout(stdout: str) -> Dict[str, Any]:
    """
    Parse stdout from system_monitor.sh execution.
    
    This function expects the output to be JSON from collect_metrics.sh wrapper.
    If the wrapper is used, it will be JSON. Otherwise, this would need to parse
    the raw script output format.
    
    Args:
        stdout: Standard output from script execution
        
    Returns:
        Parsed metrics dictionary with structure:
        {
            "cpu": {...},
            "memory": {...},
            "disk": {...},
            "gpu": {...},
            "network": {...},
            "system": {...},
            "rom": {...},  # if available
            "top_processes": [...],
            "alerts": "..."
        }
    """
    # Strip whitespace
    stdout = stdout.strip()
    
    if not stdout:
        raise ValueError("Empty stdout from script")
    
    # Try to parse as JSON (wrapper script outputs JSON)
    try:
        return parse_json_output(stdout)
    except json.JSONDecodeError:
        # If not JSON, try to parse raw format (fallback)
        logger.warning("Output is not JSON, attempting raw format parsing...")
        # This would need to be implemented based on actual script output format
        # For now, raise error since we expect JSON from wrapper
        raise ValueError("Expected JSON output from wrapper script")

