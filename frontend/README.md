# Medin Connect - Frontend

Modern healthcare appointment management system frontend built with Next.js 16, React 19, and TailwindCSS.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Styling Guide](#styling-guide)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.21.1 or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Docker** (optional, for containerized deployment): v20.x or higher ([Download](https://www.docker.com/))
- **nvm** (recommended for Node version management): ([Install Guide](https://github.com/nvm-sh/nvm))

### Verify Installation

```bash
node --version  # Should show v22.21.1 or higher
npm --version   # Should show v10.x or higher
```

---

## 🛠 Technology Stack

- **Framework**: Next.js 16 (Canary)
- **React**: React 19 RC
- **Language**: TypeScript
- **Styling**: TailwindCSS with European Health Theme
- **State Management**: React Query (@tanstack/react-query)
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mediconnect/frontend
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
npm install --force
```

> **Note**: We use `--force` because we're using bleeding-edge versions (Next.js 16 canary, React 19 RC) which may have peer dependency warnings.

### 4. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Disable Next.js telemetry (optional)
NEXT_TELEMETRY_DISABLED=1
```

### 5. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3001`

### Backend Integration

The frontend connects to the backend API running at `http://localhost:3000`.

**API Documentation:**
For a full list of available API endpoints and data schemas, please refer to the **Backend Swagger Documentation**:
👉 http://localhost:3000/api-docs

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server (after build) |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

### Development Workflow

1. **Make Changes**: Edit files in `app/` or `src/`
2. **Auto-Reload**: Browser automatically refreshes on file changes
3. **Type Check**: Run `npm run type-check` to catch TypeScript errors
4. **Lint**: Run `npm run lint` before committing

### Hot Reload

Next.js supports Fast Refresh, which means:
- ✅ Component state is preserved during edits
- ✅ Changes appear instantly in the browser
- ✅ No full page reload needed

---

## 🏗 Building for Production

### Build the Application

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Build Output

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── standalone/      # Standalone deployment files
```

### Production Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Run `npm run build` to verify no build errors
- [ ] Test production build locally with `npm start`
- [ ] Enable caching headers
- [ ] Set up CDN for static assets
- [ ] Configure monitoring and analytics

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
docker-compose -f docker-compose.prod.yml build frontend

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs mediconnect-frontend -f

# Access container shell
docker exec -it mediconnect-frontend sh

# Rebuild image
docker-compose build --no-cache frontend

# Remove all containers and volumes
docker-compose down -v
```

### Dockerfile Explanation

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
# Install dependencies only

# Stage 2: Builder
FROM node:22-alpine AS builder
# Build the application

# Stage 3: Runner
FROM node:22-alpine AS runner
# Run the production server
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000/api` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

### Environment Variable Naming

- **`NEXT_PUBLIC_*`**: Exposed to the browser (client-side)
- **Without prefix**: Server-side only (not exposed to browser)

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── dashboard/
│   │   ├── patient/         # Patient dashboard
│   │   └── doctor/          # Doctor dashboard
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles + theme
├── src/
│   ├── components/          # Reusable components
│   ├── context/             # React contexts (Auth, etc.)
│   ├── lib/                 # Utilities (API client, etc.)
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 🎨 Styling Guide

### European Health Theme

The application uses a custom European Health Theme with the following colors:

```css
/* Primary Colors */
--primary: #0F4C5C;        /* Deep Teal */
--secondary: #98C1D9;      /* Soft Sage Blue */
--accent: #E07A5F;         /* Terra Cotta */

/* Neutral Colors */
--background: #F7F9F9;     /* Cream */
--surface: #FFFFFF;        /* White */
--foreground: #1A1A1A;     /* Dark Gray */

/* Borders & Muted */
--border: #E5E7EB;
--muted: #F3F4F6;
```

### Using Theme Colors

```tsx
// In your components
<div className="bg-primary text-primary-foreground">
  Primary Button
</div>

<div className="bg-surface border border-border">
  Card Component
</div>

<p className="text-foreground/60">
  Muted text
</p>
```

### TailwindCSS Classes

```tsx
// Spacing
className="p-4 m-2 gap-3"

// Layout
className="flex items-center justify-between"

// Colors
className="bg-primary text-white"

// Borders & Shadows
className="border border-border rounded-lg shadow-sm"

// Hover & Transitions
className="hover:bg-primary/90 transition-all"
```

className="hover:bg-primary/90 transition-all"
```

---

## 📡 Logging System

The frontend includes a built-in logging system that automatically sends logs to the backend.

- **Startup**: Logs "Application Mounted" when loaded.
- **Errors**: Logs unhandled promise rejections and boundary errors.
- **Transports**: Logs are sent to `POST /api/logs` and aggregated in the backend.

---

## 🔄 State Management

### React Query

Used for server state management (API calls):

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['appointments'],
  queryFn: async () => {
    const response = await api.get('/appointments');
    return response.data;
  }
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (data) => {
    await api.post('/appointments', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['appointments']);
  }
});
```

### Context API

Used for global state (authentication):

```tsx
import { useAuth } from '@/src/context/AuthContext';

function Component() {
  const { user, login, logout } = useAuth();
  
  return <div>Welcome, {user?.email}</div>;
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Error: Port 3001 is already in use

# Solution: Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

#### 2. Peer Dependency Warnings

```bash
# Warning: Peer dependency conflicts

# Solution: Use --force flag
npm install --force
```

#### 3. Build Errors

```bash
# Error: Build failed

# Solution: Clear cache and rebuild
rm -rf .next
npm run build
```

#### 4. API Connection Failed

```bash
# Error: Failed to fetch from API

# Solution: Check backend is running
curl http://localhost:3000/api/health

# Verify NEXT_PUBLIC_API_URL in .env.local
```

#### 5. Node Version Mismatch

```bash
# Error: Unsupported Node.js version

# Solution: Use nvm to switch to Node 22
nvm use 22
```

### Development Tips

1. **Clear Browser Cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. **Check Console**: Open browser DevTools (F12) for errors
3. **Verify Environment Variables**: Restart dev server after changing `.env.local`
4. **Type Errors**: Run `npm run type-check` to see all TypeScript errors

---

## 📱 Features

### Patient Dashboard
- ✅ View appointments (Card & Table view)
- ✅ Book new appointments with calendar-based slot selection
- ✅ Cancel appointments with reason
- ✅ 1-hour appointment slots with 15-min buffer
- ✅ Real-time slot availability

### Doctor Dashboard
- ✅ View patient appointments
- ✅ Add clinical notes
- ✅ Manage appointment status

### Authentication
- ✅ Secure login/register
- ✅ JWT-based authentication
- ✅ Role-based access (Patient/Doctor)

### UI/UX
- ✅ European Health Theme
- ✅ Responsive design (mobile-first)
- ✅ Professional animations
- ✅ Loading states & error handling

---

## 👥 Contributors

Prashant Chaubey

---

**Need Help?** Open an issue or contact the development team.
prashanttchaubey@gmail.com
