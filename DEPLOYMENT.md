# PharmaShield — Production Deployment & Operations Guide

> **Target Architecture:** Linux (Ubuntu 22.04 / 24.04 LTS) | Windows Server 2022 / Dev Workstation  
> **Database:** PostgreSQL 16 + PostGIS 3.4 (with SQLite 3 zero-dependency fallback)  
> **Runtime:** Python 3.11+ / Node.js 18+ / Docker 24+ & Docker Compose v2

---

## 1. Quick Start: Local Multi-Process Launch

### Windows (Workstation / Hackathon Demo)
The platform includes automated launchers that verify python environments, seed the 9 medical centers across Bihar, West Bengal, and Jharkhand, and boot all 4 services:

```powershell
# From the project root:
.\run_all.ps1

# Or via Command Prompt:
run_all.bat
```

This launches:
- **FastAPI Monolith & WebSocket Bus:** `http://localhost:8000` (API Docs: `/docs`)
- **Portal 1 (Clinical / Doctor-Patient):** `http://localhost:5173`
- **Portal 2 (Pharma Logistics Operations):** `http://localhost:5174`
- **Portal 3 (Cyber Attack & Defense Lab):** `http://localhost:5175`

---

## 2. Docker Compose Production Deployment

The production stack deploys PostgreSQL 16 with PostGIS, the FastAPI core backend, and Nginx serving the three compiled Vite frontends with reverse proxy routing.

### 2.1 Full `docker-compose.yml` Configuration

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:16-3.4
    container_name: pharmashield_postgres
    restart: always
    environment:
      POSTGRES_USER: pharmashield
      POSTGRES_PASSWORD: pharmashield_secret_password
      POSTGRES_DB: pharmashield_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pharmashield -d pharmashield_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: pharmashield_backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://pharmashield:pharmashield_secret_password@db:5432/pharmashield_db
      - SECRET_KEY=prod_super_secret_pharmashield_jwt_key_2026
      - ENVIRONMENT=production
    ports:
      - "8000:8000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: pharmashield_frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2.2 Dockerfiles

#### `Dockerfile.backend`
```dockerfile
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/
ENV PYTHONPATH=/app

CMD ["sh", "-c", "python backend/scripts/seed.py && uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4"]
```

#### `Dockerfile.frontend`
```dockerfile
# Multi-stage build for all 3 Vite portals
FROM node:18-alpine AS builder
WORKDIR /build

# Build Portal 1 (Clinical)
COPY portal-doctor-patient/package*.json ./portal-doctor-patient/
RUN cd portal-doctor-patient && npm ci
COPY portal-doctor-patient/ ./portal-doctor-patient/
RUN cd portal-doctor-patient && npm run build

# Build Portal 2 (Pharma Ops)
COPY portal-pharma-ops/package*.json ./portal-pharma-ops/
RUN cd portal-pharma-ops && npm ci
COPY portal-pharma-ops/ ./portal-pharma-ops/
RUN cd portal-pharma-ops && npm run build

# Build Portal 3 (Cyber Lab)
COPY portal-cyber-lab/package*.json ./portal-cyber-lab/
RUN cd portal-cyber-lab && npm ci
COPY portal-cyber-lab/ ./portal-cyber-lab/
RUN cd portal-cyber-lab && npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/portal-doctor-patient/dist /usr/share/nginx/html/clinical
COPY --from=builder /build/portal-pharma-ops/dist /usr/share/nginx/html/ops
COPY --from=builder /build/portal-cyber-lab/dist /usr/share/nginx/html/cyber
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/pharmashield.conf`:

```nginx
upstream backend_api {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name pharmashield.health.gov.in;
    return 301 https://$host$request-uri;
}

server {
    listen 443 ssl http2;
    server_name pharmashield.health.gov.in;

    ssl_certificate /etc/letsencrypt/live/pharmashield.health.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharmashield.health.gov.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Backend API & Swagger 3D Documentation
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
    }

    # Real-Time WebSocket Event Bus
    location /ws/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Portal 1: Clinical Hub
    location / {
        root /usr/share/nginx/html/clinical;
        try_files $uri $uri/ /index.html;
    }

    # Portal 2: Logistics Operations
    location /ops/ {
        alias /usr/share/nginx/html/ops/;
        try_files $uri $uri/ /ops/index.html;
    }

    # Portal 3: Cyber Security Lab
    location /cyber/ {
        alias /usr/share/nginx/html/cyber/;
        try_files $uri $uri/ /cyber/index.html;
    }
}
```

---

## 4. Linux Systemd Service Template

For deployments without Docker, run the FastAPI backend as a systemd unit:

Create `/etc/systemd/system/pharmashield-backend.service`:

```ini
[Unit]
Description=PharmaShield Central Backend & Cryptographic Ledger
After=network.target postgresql.service

[Service]
Type=simple
User=pharmashield
WorkingDirectory=/opt/pharmashield
Environment="PATH=/opt/pharmashield/backend/venv/bin"
Environment="DATABASE_URL=postgresql://pharmashield:secret@localhost:5432/pharmashield_db"
ExecStart=/opt/pharmashield/backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pharmashield-backend
sudo systemctl status pharmashield-backend
```

---

## 5. Backup, Restore & Cryptographic Key Management

### 5.1 Database Automated Backup
```bash
#!/bin/bash
# Backup PostgreSQL database with timestamp
BACKUP_DIR="/var/backups/pharmashield"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U pharmashield -d pharmashield_db -F c -b -v -f "$BACKUP_DIR/db_$TIMESTAMP.dump"
# Retain last 14 days
find $BACKUP_DIR -type f -mtime +14 -delete
```

### 5.2 Database Restore
```bash
pg_restore -U pharmashield -d pharmashield_db -c -v "/var/backups/pharmashield/db_20261101_000000.dump"
```

### 5.3 Cryptographic Key Rotation Guidelines
1. In PharmaShield, each healthcare facility holds an Ed25519 signing keypair (`ed25519.Ed25519PrivateKey`).
2. When rotating keys, a `KEY_ROTATION` canonical event signed by the *previous* private key must be committed to the hash chain containing:
   - `old_public_key_hex`
   - `new_public_key_hex`
   - `effective_timestamp_utc`
3. Audit verifiers accept historical signatures verified against the public key active at the block's timestamp, preserving 100% audit durability.

