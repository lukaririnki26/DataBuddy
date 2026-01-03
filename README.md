# DataBuddy - Data Management Platform

DataBuddy is a modern, reactive data processing platform designed for building, executing, and monitoring complex data pipelines.
**Latest Version: 1.8.0 (Pipeline History & Production Ready)**
It provides a highly interactive, glassmorphic interface for managing complex data workflows with ease.

## ✨ Key Features

- **Futuristic UI/UX**: Unified glassmorphic design system with deep 32px blurs and high-contrast typography.
- **Pipeline Architecture**: Modular drag-and-drop pipeline builder for data transformation and validation.
- **Real-time Monitoring**: Mission-critical dashboard for system health and data throughput.
- **SPA Experience**: Seamless navigation and persistent system state through Single Page Application architecture.
- **Secure by Design**: Integrated JWT authentication and role-based access control (RBAC).

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (port 5432)
- Redis (port 6379)

### Installation & Setup

1. **Prerequisites:**
   - PostgreSQL running on port 5432 (username: postgres, password: postgres)
   - Redis running on port 6379
   - Node.js v18+ and npm

2. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd DataBuddy
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Database Setup:**
   ```bash
   cd backend
   # Create database (if using local PostgreSQL)
   createdb databuddy
   # Run migrations and seed data
   npm run setup:db
   ```

4. **Start Services:**
   ```bash
   # Terminal 1: Backend (port 3001)
   cd backend && npm run start:dev

   # Terminal 2: Frontend (port 3000)
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

### Default Login Credentials

After running the database setup, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@databuddy.com | admin123 |
| Editor | editor@databuddy.com | editor123 |
| Viewer | viewer@databuddy.com | viewer123 |

## 📋 Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Vite) | 3000 | React 18 + TypeScript + Redux Toolkit + Material UI 5 |
| Backend (NestJS) | 3001 | API server + WebSocket Gateway |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & Queues |

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=/api
VITE_WS_URL=/
VITE_PORT=3000
VITE_BACKEND_URL=http://127.0.0.1:3001
```

**Backend (.env):**
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=databuddy
DB_SCHEMA=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### Troubleshooting

**Common Issues:**

1. **Port already in use:**
   ```bash
   # Kill processes using ports 3000, 3001
   fuser -k 3000/tcp 3001/tcp
   ```

2. **Database connection issues:**
   - Ensure PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database exists: `psql -U postgres -l`
   - Reset database: `cd backend && npm run db:setup`

3. **Login not working:**
   - Run database seeder: `cd backend && npm run seed:run`
   - Ensure `JWT_SECRET` is set in `.env`

## 🛠 Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm run start:dev    # Start dev server (port 3001)
npm run build        # Build for production
npm run start:prod   # Start production server
```

## 📁 Project Structure

```
DataBuddy/
├── frontend/         # React + Vite (port 3000)
│   ├── src/
│   ├── public/
│   └── vite.config.ts
├── backend/          # NestJS (port 3001)
│   ├── src/
│   ├── dist/
│   └── tsconfig.json
└── README.md
```