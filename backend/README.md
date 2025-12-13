# Medin Connect - Backend API

Professional healthcare appointment management system backend built with Node.js, Express, and Prisma.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.21.1 or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **PostgreSQL**: v14 or higher ([Download](https://www.postgresql.org/download/))
- **Docker** (optional, for containerized deployment): v20.x or higher ([Download](https://www.docker.com/))
- **nvm** (recommended for Node version management): ([Install Guide](https://github.com/nvm-sh/nvm))

### Verify Installation

```bash
node --version  # Should show v22.21.1 or higher
npm --version   # Should show v10.x or higher
psql --version  # Should show PostgreSQL 14 or higher
```

---

## 🛠 Technology Stack

- **Runtime**: Node.js 22.21.1
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston with daily log rotation
- **Code Obfuscation**: JavaScript Obfuscator (production builds)
- **Testing**: Jest
- **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mediconnect/backend
```

### 2. Install Node.js 22 (using nvm)

```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 22
nvm install 22
nvm use 22
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mediconnect;

# Exit psql
\q
```

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/mediconnect?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:3001
```

### 6. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 7. Initialize & Seed Database (Admin Setup) 🔐

This step creates the default **Admin User**.

```bash
# Run Migrations
npx prisma migrate dev --name init

# Seed Database (Creates Admin)
npx prisma db seed
# Output: ✅ Default Admin created: admin@mediconnect.com
```

> **Default Credentials**:  
> Email: `admin@mediconnect.com`  
> Password: `admin123`  
> *(Change these in `.env` for production!)*

### 8. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript → JavaScript + Obfuscation) |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run prisma:studio` | Open Prisma Studio (Database GUI) |
| `npm run prisma:migrate` | Create new database migration |
| `npm run lint` | Run ESLint |

### Development Workflow

1. **Make Changes**: Edit files in `src/`
2. **Auto-Reload**: Server automatically restarts on file changes
3. **Check Logs**: View logs in `logs/` directory
4. **Test**: Run `npm test` before committing

### Database Management

```bash
# View database in GUI
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts
```

### Test Structure

```
src/
├── services/
│   └── __tests__/
│       └── auth.service.test.ts
├── controllers/
│   └── __tests__/
│       └── auth.controller.test.ts
```

### Writing Tests

Example test file:

```typescript
import { describe, it, expect } from '@jest/globals';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await AuthService.register({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result).toBeDefined();
  });
});
```

---

## 🐳 Docker Deployment

### Prerequisites

- Docker installed and running
- Docker Compose installed

### Build and Run with Docker

#### Development Mode

```bash
# From project root
docker-compose up -d
```

#### Production Mode

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Build and Start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# First Time Setup (Required)
docker exec -it mediconnect_backend_prod npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs mediconnect-backend -f

# Access container shell
docker exec -it mediconnect-backend sh

# Rebuild image
docker-compose build --no-cache backend

# Remove all containers and volumes
docker-compose down -v
```

### Production Deployment Checklist

- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable automatic backups
- [ ] Review and update CORS origins

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` (7 days) |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_FILE_SIZE` | Max upload size | `5mb` |
| `RATE_LIMIT_WINDOW` | Rate limit window | `15m` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## 📚 API Documentation

### Interactive Swagger UI

The backend provides full interactive API documentation using Swagger UI.

**Access it here:** http://localhost:3000/api-docs

Features:
- 🔍 Explore all endpoints
- 🔓 Authenticate with your JWT token
- 🧪 Test APIs directly in the browser
- 📝 View request/response schemas

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

#### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/available-slots` - Get available slots
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule appointment
- `POST /api/appointments/:id/notes` - Add note

#### Doctors
- `GET /api/doctors` - List all doctors

---

## 📊 Monitoring & Observability

Medin Connect includes a complete observability stack using OpenTelemetry and Prometheus.

### Metrics Endpoint

The application exposes Prometheus-compatible metrics at:
`http://localhost:9464/metrics`

### Frontend Logging

The backend receives logs from the frontend at `POST /api/logs`. These are processed by `LogController` and stored in the backend logs (Winston), effectively centralizing full-stack logs.

### Local Prometheus Instance

A pre-configured Prometheus instance is available via Docker Compose.

**Start Monitoring:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

**Access Dashboard:**
http://localhost:9091

**Key Metrics to Watch:**
- `http_request_duration_seconds` - API Latency
- `prisma_client_queries_total` - Database Hits
- `process_cpu_seconds_total` - CPU Usage
- `nodejs_heap_size_used_bytes` - Memory Usage

See [monitoring/QUERIES.md](../monitoring/QUERIES.md) for useful PromQL queries and alert rules.

### Example Request

```bash
# Register a new patient
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "securepassword",
    "role": "PATIENT",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "Male"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "securepassword"
  }'
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── decorators/      # Custom decorators (logging, etc.)
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── logs/                # Application logs
├── dist/                # Compiled JavaScript (production)
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Error: Port 3000 is already in use

# Solution: Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### 2. Database Connection Failed

```bash
# Error: Can't reach database server

# Solution: Check PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Verify connection
psql -U postgres -d mediconnect
```

#### 3. Prisma Client Not Generated

```bash
# Error: Cannot find module '@prisma/client'

# Solution: Generate Prisma Client
npx prisma generate
```

#### 4. Migration Failed

```bash
# Error: Migration failed

# Solution: Reset database and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

#### 5. Node Version Mismatch

```bash
# Error: Unsupported Node.js version

# Solution: Use nvm to switch to Node 22
nvm use 22
```

### Logs

Check application logs for detailed error information:

```bash
# View latest logs
tail -f logs/application-*.log

# View error logs
tail -f logs/error-*.log
```

### Getting Help

- Check existing issues in the repository
- Review API documentation
- Check Prisma documentation: https://www.prisma.io/docs
- Check Express documentation: https://expressjs.com

---

## 📝 License

## 👥 Contributors
Prashant Chaubey

---

**Need Help?** Open an issue or contact the development team.
prashanttchaubey@gmail.com
