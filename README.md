# 🏥 Medin Connect - Enterprise Healthcare Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-90%25-green)
![License](https://img.shields.io/badge/license-Proprietary-blue)

> **Enterprise-grade, HIPAA-compliant scheduling system with Microservice Architecture.**

## 📖 Documentation Index
- [**Architecture Guide (ARCH.md)**](./ARCH.md): High-level system design and request flow.
- [**Backend Deep Dive (backend/UNDERSTAND.md)**](./backend/UNDERSTAND.md): Technical implementation details (Circuit Breaker, Correlations).
- [**Frontend Deep Dive (frontend/UNDERSTAND.md)**](./frontend/UNDERSTAND.md): UI architecture and state management.
- [**API Documentation**](./backend/README.md): Swagger/OpenAPI details.

---

## ⚡ Quick Start (Local Deployment)

The easiest way to run the full stack (Frontend + Backend + DB + Monitoring) is via Docker.

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local dev)

### 1️⃣ Run with Docker Compose
This command spins up **Pulse** (Backend), **Portal** (Frontend), **PostgreSQL**, and **Prometheus**.

```bash
# Clone the repo
git clone <repository_url>
cd mediconnect

# Start Production Build
docker-compose -f docker-compose.prod.yml up --build -d
```

### 2️⃣ Seed Database (Initial Setup)
Once the containers are running, you must create the default Admin user.

```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```
> **Default Admin Credentials:** `admin@mediconnect.com` / `admin123`

### 3️⃣ Access the System

| Service | URL | Usage |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3001` | Main User Interface (Login/Register) |
| **Backend API** | `http://localhost:3000` | REST API Endpoints |
| **Swagger Docs** | `http://localhost:3000/api-docs` | API Schema & Testing |
| **Prometheus** | `http://localhost:9091` | Metrics Dashboard |

---

## ☁️ Cloud Deployment Blueprint (AWS ECS)

This project is "Cloud Native" ready. Follow this blueprint to deploy on AWS.

1.  **Build Images**:
    ```bash
    docker build -t my-reg/backend ./backend
    docker build -t my-reg/frontend ./frontend
    ```
2.  **Infrastructure**:
    -   **ECS Fargate**: For Serverless Containers.
    -   **RDS (Postgres 15)**: Managed Database.
    -   **ALB (Load Balancer)**: Routes `/api/*` to Backend, `/*` to Frontend.

---

## 🔄 CI/CD Pipeline
We use **GitHub Actions** for automation (`.github/workflows/ci.yml`).
-   **Lint**: Enforces code style.
-   **Test**: Runs Unit specs (Jest).
-   **Build**: Verifies compilation.

---

## 🐙 Contributing & Git Guide

**What to upload?**
-   ✅ `src/`, `app/`, `package.json`, `tsconfig.json`
-   ✅ `Dockerfile`, `docker-compose.yml`

**What to ignore?**
-   ❌ `node_modules/` (Dependencies)
-   ❌ `.env` (Secrets)
-   ❌ `.next/`, `dist/` (Builds)

*(We have a `.gitignore` configured to handle this automatically.)*

---

## 🛡️ Enterprise Features
1.  **Resilience**: Circuit Breaker implemented for external APIs.
2.  **Observability**: Correlation IDs for distributed tracing.
3.  **Security**: RBAC (Admin/Doctor/Patient), JWT Auth, Input Validation.

---

### ©️ Medin Connect Engineering Team

**Lead Developer**: Prashant Chaubey  
**Contact**: prashanttchaubey@gmail.com
