# KaushalAI Virtual Labs Application

This repository contains the standalone **KaushalAI Virtual Labs** application, which provides interactive code execution and assessment sandboxes for learners completing courses on the main KaushalAI platform.

> **Architecture Note:**
> This is an **independent, separately deployed application** from the main KaushalAI website. It maintains its own frontend and backend services and connects to an isolated MongoDB database (`kaushalai_labs`) to guarantee sandbox stability and clean separation of concerns.

---

## Project Structure

```
labs/
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── pages/              # LabsHome.jsx (/), LabRunner.jsx (/lab/:labId)
│   │   ├── components/         # Branded Header, live health indicators
│   │   ├── services/           # Axios client configured with VITE_LABS_API_URL
│   │   ├── styles/             # tokens.css & index.css (KaushalAI Gov-Tech theme)
│   │   ├── utils/              # Helper utilities
│   │   ├── App.jsx             # React Router routing
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── routes/             # health.routes.js (GET /health), index.routes.js (GET /)
│   │   ├── controllers/        # Lab controllers (Parts 3-5)
│   │   ├── models/             # Lab database models (isolated data)
│   │   ├── middleware/         # Restricted CORS & security middleware
│   │   └── config/             # Mongoose connection to kaushalai_labs DB
│   ├── package.json
│   └── server.js
├── .env.example                # Reference environment configuration
├── .gitignore
└── README.md
```

---

## Required Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Virtual Labs API server | `5001` |
| `MONGODB_URI` | Isolated MongoDB database URI for labs | `mongodb://localhost:27017/kaushalai_labs` |
| `JWT_SHARED_SECRET` | Secret key matching the main platform for SSO verification | `shared_secret_string` |
| `MAIN_APP_API_URL` | Base API URL of main KaushalAI backend for webhooks | `http://localhost:5000/api` |
| `ALLOWED_ORIGIN` | Allowed origin for CORS (main frontend domain) | `http://localhost:3000` |

### Frontend (`client/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_LABS_API_URL` | Base URL of the Virtual Labs backend API | `http://localhost:5001` |

---

## Local Development Instructions

### 1. Backend Server
```bash
cd labs/server
npm install
npm run dev
```
- Server runs on: `http://localhost:5001`
- Root info check: `GET http://localhost:5001/`
- Health check: `GET http://localhost:5001/health`

### 2. Frontend Client
```bash
cd labs/client
npm install
npm run dev
```
- Client runs on: `http://localhost:5174` (or `5173`)
- Labs Home: `http://localhost:5174/`
- Lab Runner sandbox: `http://localhost:5174/lab/:labId` (e.g. `/lab/lab-python-basics`)

---

## Deployment Instructions (Render / Production)

1. **Dedicated Database**:
   - Provision a MongoDB cluster (or database) specifically named `kaushalai_labs`. Do not point to the main platform's application database.

2. **Server Deployment (Web Service)**:
   - Create a Web Service on Render pointing to `labs/server`.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set environment variables (`PORT`, `MONGODB_URI`, `JWT_SHARED_SECRET`, `MAIN_APP_API_URL`, `ALLOWED_ORIGIN`).

3. **Client Deployment (Static Site)**:
   - Create a Static Site on Render pointing to `labs/client`.
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Set environment variable `VITE_LABS_API_URL` to your deployed backend URL.

4. **Main Site Integration (Part 7)**:
   - In Part 7, the deployed URL of this Virtual Labs client (`https://your-labs.onrender.com`) will be added to the main KaushalAI platform's environment variables (`VIRTUAL_LABS_URL`), enabling the redirect button upon course & quiz completion.

---

## Verification Checklist (Part 1)
- [x] Backend responds on `GET /health` with `{ status: "ok", service: "kaushalai-labs-backend" }`.
- [x] Backend root `GET /` returns service metadata avoiding 404 on root deployments.
- [x] CORS restricts requests to `ALLOWED_ORIGIN` and dev origins.
- [x] Frontend routes `/` and `/lab/:labId` render with KaushalAI Gov-Tech design tokens.
- [x] Frontend API service connects to `VITE_LABS_API_URL` and indicates live backend status.
