# Backend Dockerfile
# 
# This container runs a FastAPI backend that acts as a proxy/adapter.
# It fetches metrics from the host API (running on the host outside Docker)
# and exposes them to the frontend. The backend NEVER reads /proc or executes
# scripts - it only proxies HTTP requests to the host API.

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Expose FastAPI port
EXPOSE 8000

# Run uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

