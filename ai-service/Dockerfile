FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV, MediaPipe, and YOLO
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch and Torchvision to reduce image size and avoid massive CUDA downloads
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY main.py .
COPY app ./app

# Expose port 8000
EXPOSE 8000

# Run FastAPI using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
