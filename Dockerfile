FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY sleepwell_api.py .
COPY sleepwell_models/ sleepwell_models/

# Expose port 7860 (HF Spaces default)
EXPOSE 7860

# Run the API
CMD ["uvicorn", "sleepwell_api:app", "--host", "0.0.0.0", "--port", "7860"]
