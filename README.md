# ActivityHub

ActivityHub is a full-stack web platform for discovering, creating, and joining activities, with built-in profiles, notifications, and real-time chat.

This repository contains:
- **backend/**: NestJS (TypeScript) API + WebSockets
- **frontend/**: React (TypeScript) web app (Vite) served by Nginx over HTTPS (self-signed cert in Docker)
- **monitoring/**: Prometheus config for scraping backend metrics
- **docker-compose.yml**: Local development stack (PostgreSQL, Redis, Backend, Frontend, Prometheus, Grafana)

---

## Tech Stack

### Backend
- NestJS (TypeScript)
- TypeORM + PostgreSQL
- Redis (caching / storage)
- Authentication:
  - JWT (stored in **httpOnly cookies**)
  - Google OAuth (Passport)
- WebSockets: Socket.IO (NestJS platform-socket.io)
- Metrics: Prometheus (endpoint exposed at `/api/metrics`)

### Frontend
- React + TypeScript + Vite
- React Router
- TanStack React Query
- TailwindCSS
- Socket.IO client

### DevOps / Monitoring
- Docker + Docker Compose
- Prometheus + Grafana

---

## Project Structure

```txt
.
├── backend/
├── frontend/
├── monitoring/
└── docker-compose.yml
```

---

## Quick Start (Docker)

### 1) Requirements
- Docker + Docker Compose

### 2) Configure environment variables
`docker-compose.yml` expects database variables:
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

And the backend reads (at least):
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- (Google OAuth env vars if enabled in your config)

Create a backend env file:
```bash
cp backend/.env.example backend/.env
```

> Note: If your repo does not include `.env.example`, create `backend/.env` manually with the variables above.

### 3) Run
```bash
docker compose up --build
```

### 4) Services / Ports
- Frontend (Nginx HTTPS): **https://localhost** (port **443**)
- Backend API: **http://localhost:3000/api**
- Prometheus: **http://localhost:9090**
- Grafana: **http://localhost:3100**
- Postgres: **localhost:5432**
- Redis: **localhost:6381** (mapped to container 6379)

---

## Running Without Docker (Local Dev)

### Backend
```bash
cd backend
npm install
npm run start:dev
```

Backend uses a global prefix:
- API base path: `/api`
- Example: `http://localhost:3000/api/...`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Authentication Notes

- Login issues JWT cookies:
  - `access_token` (httpOnly cookie)
  - `refresh_token` (httpOnly cookie, scoped to `/auth/refresh`)
- If the frontend receives `401 TOKEN_EXPIRED`, it should call:
  - `POST /api/auth/refresh`

There is also Google OAuth support:
- `GET /api/auth/google/login`
- `GET /api/auth/google/callback`

---

## Chat / Realtime

The app includes chat endpoints (REST) and Socket.IO usage on the frontend.
You can find chat routes under:
- `GET /api/chat`
- `GET /api/chat/:id`
- `GET /api/chat/:id/messages`
- etc.

---

## Monitoring (Prometheus / Grafana)

Prometheus is configured in `monitoring/prometheus.yml` to scrape:
- `backend:3000/api/metrics`

Grafana is included via Docker Compose and depends on Prometheus.

---

## License

No license file is currently defined in the repository. Add a `LICENSE` file if you want this project to be open-source.

---
## Contributing

1. Fork the project
2. Create a feature branch
3. Commit changes
4. Open a Pull Request
