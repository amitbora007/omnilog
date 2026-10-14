# OmniLog 🚀

> **OmniLog** is a modern, high-performance publishing platform for technical dev logs, coding tutorials, architecture deep-dives, personal essays, and journals.

Built with **React.js** (pure JavaScript with Vite & Tailwind CSS) and **Node.js** (pure JavaScript with Express & Mongoose 8), designed for seamless deployment on **Vercel** and **Render**.

---

## 📚 Living Project Documentation

The project includes a comprehensive, living documentation suite in the [`/docs`](./docs) directory:

| Document | Description |
| :--- | :--- |
| **[Project Overview (`docs/PROJECT.md`)](./docs/PROJECT.md)** | Mission, user personas, core domain models (`Post` and `User`), and future roadmap. |
| **[Architecture Guide (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)** | System diagrams, stateless JWT auth lifecycle, database models, and REST API specification. |
| **[Developer Guide (`docs/DEVELOPMENT.md`)](./docs/DEVELOPMENT.md)** | Prerequisites, local setup, monorepo scripts, and JavaScript coding conventions. |
| **[UI/UX Design System (`docs/DESIGN.md`)](./docs/DESIGN.md)** | Color palette, typography scale, component specs, and WCAG 2.1 AA accessibility standards. |
| **[Testing & QA (`docs/TESTING.md`)](./docs/TESTING.md)** | Testing pyramid, Supertest API integration suites, and running tests. |
| **[Deployment Guide (`docs/DEPLOYMENT.md`)](./docs/DEPLOYMENT.md)** | Step-by-step production setup for **Vercel** and **Render** (`render.yaml`), plus OAuth configuration. |
| **[Bug Tracker & Security (`docs/BUGS.md`)](./docs/BUGS.md)** | Triage register of legacy issues (XSS, secrets, deprecated methods) and bug reporting templates. |
| **[AI Agent Operating Manual (`docs/AGENT_GUIDELINES.md`)](./docs/AGENT_GUIDELINES.md)** | Guidelines, repository landmarks, and verification checklists for future AI coding agents. |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB or MongoDB Atlas URI

### 2. Install Dependencies
```bash
# Installs root, client, and server dependencies
npm install
```

### 3. Configure Environment Variables
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### 4. Start Development Server
```bash
# Runs backend on http://localhost:5000 and frontend on http://localhost:5173
npm run dev
```

---

## 🛠️ Monorepo Scripts Reference

- `npm run dev`: Concurrently start both backend API and frontend Vite client.
- `npm run dev:server`: Start backend API only (with nodemon).
- `npm run dev:client`: Start frontend React client only (with Vite).
- `npm run build`: Build production frontend assets.
- `npm test`: Run backend API integration test suites (Supertest + Jest).

---

## 🚢 Deployment Ready

- **Render**: Uses the included [`render.yaml`](./render.yaml) blueprint to deploy both the API Web Service and the Client Static Site with 1 click.
- **Vercel**: Uses [`vercel.json`](./vercel.json) for automatic SPA routing to `index.html`.

---

## 📄 License
ISC License — Created by Amit Bora
