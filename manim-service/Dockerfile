FROM python:3.10-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    texlive-full \
    texlive-xetex \
    texlive-fonts-extra \
    texlive-latex-extra \
    texlive-plain-generic \
    tipa \
    libpango1.0-dev \
    pkg-config \
    build-essential \
    libffi-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Manim and other Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set the entrypoint
ENTRYPOINT ["python", "app.py"]
