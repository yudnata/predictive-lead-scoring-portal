FROM python:3.11-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

# Development Stage
FROM base AS development
RUN pip install --no-cache-dir flask-cors watchdog

ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

CMD ["python", "ml_api.py"]

# Production Stage
FROM base AS production

RUN pip install --no-cache-dir gunicorn

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "--timeout", "120", "--preload", "ml_api:app"]
