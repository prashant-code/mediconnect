# 🏥 Medin Connect - Enterprise Healthcare Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-90%25-green)
![License](https://img.shields.io/badge/license-Proprietary-blue)


> **Enterprise-grade, HIPAA-compliant scheduling system with Microservice Architecture.**

## 📖 Documentation Index
- [**Architecture Guide (ARCH.md)**](./ARCH.md): High-level system design and request flow.
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

### 2️⃣ Access the System

3.  **Seed Database (Create Default Admin)**:
    ```bash
    docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
    ```
    *Creates Default Admin: `admin@mediconnect.com` / `admin123`*

4.  **Open in Browser**:
| Service | URL | Credentials |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3001` | Register a new user |
| **Backend API** | `http://localhost:3000` | - |
| **Swagger Docs** | `http://localhost:3000/api-docs` | - |
| **Prometheus** | `http://localhost:9091` | - |
| **Metrics Endpoint** | `http://localhost:9464/metrics` | - |

---

## ☁️ Cloud Deployment Blueprint (AWS ECS)

This project is "Cloud Native" ready. Follow this blueprint to deploy on AWS.

### Infrastructure Requirements
- **AWS ECS (Elastic Container Service)**: Fargate (Serverless).
- **AWS RDS**: PostgreSQL 15.
- **AWS ALB**: Application Load Balancer.

### Deployment Steps
1.  **Build Images**:
    ```bash
    docker build -t my-registry/mediconnect-backend ./backend
    docker build -t my-registry/mediconnect-frontend ./frontend
    docker push my-registry/mediconnect-backend
    docker push my-registry/mediconnect-frontend
    ```
2.  **Configure Task Definitions**:
    - **Backend Task**:
        - Env Vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=3000`.
        - Health Check: `/health`.
    - **Frontend Task**:
        - Env Vars: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`.
3.  **Networking**:
    - **ALB Rules**:
        - Path `/api/*` -> Target Group: Backend (Port 3000).
        - Default `*` -> Target Group: Frontend (Port 3000).

---

## 🔄 CI/CD Pipeline
We use **GitHub Actions** for automation.
- **Config**: `.github/workflows/ci.yml`
- **Triggers**: Push to `main`, Pull Requests.
- **Jobs**:
    - `Lint`: Code quality check (`eslint`).
    - `Test`: Unit tests with **90% Coverage Enforcement**.
    - `Build`: Verifies Docker build compatibility.

---

## 🛡️ Enterprise Features
1.  **Resilience**: Circuit Breaker implemented for dependent APIs (Insurance Verification).
2.  **Observability**: Full Distributed Tracing via `x-correlation-id`.
3.  **Security**: Zod Input Validation, Helmet Headers, Rate Limiting ready.
4.  **UI/UX**: Sonner Toasts, Visual Validation, and Responsive Dashboards.

---

### ©️ Medin Connect Engineering Team

**Lead Developer**: Prashant Chaubey  
**Contact**: prashanttchaubey@gmail.com
