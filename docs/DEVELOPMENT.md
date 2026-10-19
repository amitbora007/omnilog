# OmniLog — Developer & Contributor Guide

This document contains everything you need to know to set up, develop, and contribute to **OmniLog**.

---

## 1. Prerequisites

Before running the application locally, ensure you have:
- **Node.js**: `v18.0.0` or higher (tested on `v22.14.0`)
- **npm**: `v9.0.0` or higher (tested on `v10.9.2`)
- **MongoDB**: A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.
- **Google Cloud Console Credentials**: OAuth 2.0 Client ID & Secret for Single Sign-On.
- **Admin Configuration (Optional)**: Comma-separated list of Google account emails in `ADMIN_EMAILS` to grant Super Admin privileges upon login.

> [!NOTE]
> **Node.js 22 Compatibility**: When connecting to MongoDB Atlas on Node.js 22+, modern OpenSSL TLS 1.3 ClientHello extensions can exceed standard MTU packet sizes on certain networks. The project's npm scripts automatically configure `NODE_OPTIONS=--tls-max-v1.2` in `server/package.json` to ensure instant and reliable database connections. If database passwords contain special characters (like `!`, `@`, `#`), ensure they are URL percent-encoded (e.g. `!` becomes `%21`).

---

## 2. Quick Start Setup

### Step 1: Clone & Install Dependencies
OmniLog is configured as an **npm workspace** managing both `client` and `server`. You can install all root, backend, and frontend dependencies with a single command from the root directory:

```bash
# From the repository root
npm install
```

### Step 2: Environment Configuration
Create environment files from the provided templates:

#### 1. Backend Environment (`server/.env`):
```bash
cp server/.env.example server/.env
```
Populate `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/omnilog_dev
JWT_SECRET=super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ADMIN_EMAILS=your.google.email@gmail.com,admin@omnilog.local
```

#### 2. Frontend Environment (`client/.env`):
```bash
cp client/.env.example client/.env
```
Populate `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run the Development Server
You can run both the Node.js API and the React Vite client concurrently:

```bash
# Starts backend on http://localhost:5000 and frontend on http://localhost:5173
npm run dev
```

You can also run packages individually:
```bash
npm run dev:server    # Run only the backend API (with nodemon)
npm run dev:client    # Run only the React frontend (with Vite)
```

---

## 3. Monorepo Scripts Reference

All primary workflows are accessible from the root `package.json`:

| Script | Purpose | Command |
| :--- | :--- | :--- |
| `npm run dev` | Start both API and Client in development mode concurrently | `concurrently "npm:dev:server" "npm:dev:client"` |
| `npm run dev:server` | Start backend API with hot-reload | `npm --prefix server run dev` |
| `npm run dev:client` | Start frontend with Vite HMR | `npm --prefix client run dev` |
| `npm run build` | Build both backend and frontend for production | `npm --prefix client run build` |
| `npm test` | Run all automated test suites | `npm --prefix server test` |
| `npm run lint` | Run code quality linters across packages | `npm --prefix server run lint && npm --prefix client run lint` |

---

## 4. Coding Standards & Conventions

1. **Pure JavaScript End-to-End**:
   - Zero TypeScript in both frontend and backend.
   - Use modern ES6+ syntax: `import/export`, async/await, optional chaining (`?.`), nullish coalescing (`??`), arrow functions, and destructuring.
2. **Backend Coding Style**:
   - Organized by MVC/Feature layers: `controllers/`, `models/`, `routes/`, `middleware/`, `utils/`.
   - Always return consistent JSON payloads `{ success: true, data: ... }` or `{ success: false, error: ... }`.
   - Never expose raw database stack traces in production responses.
3. **Frontend Coding Style**:
   - Component-driven architecture inside `client/src/components/`.
   - Keep presentational components pure and pass handlers via props.
   - Use custom hooks (`useAuth`, `usePosts`) for state and data fetching.
   - Always sanitize HTML using the `sanitizeHtml()` utility before rendering user-generated content.
4. **Syntax Highlighting & Bundle Isolation**:
   - Always import the syntax highlighting utility from `client/src/utils/highlight.js`:
     ```javascript
     import hljs from '../utils/highlight';
     ```
   - **DO NOT** import raw `highlight.js` or `highlight.js/lib/languages/*` directly into React components. Raw imports pull in 190+ languages (950 kB), whereas `utils/highlight.js` registers 16 essential languages and stays tree-shaken inside the 87 kB `vendor-highlight` chunk.
5. **Database Query Performance & Lean Projections**:
   - For all bulk list/feed queries (`GET /api/posts`, `GET /api/posts/my-posts`), always omit the heavyweight rich-text `body` field:
     ```javascript
     .select('-body -__v')
     ```
   - Always chain `.lean()` on read-only bulk queries to bypass Mongoose document hydration overhead and return plain JavaScript objects.
6. **Frontend Render Optimization & Memoization**:
   - Wrap high-frequency list items in `React.memo(Component)` (e.g., `PostCard`) to prevent re-renders when parent states (like filter pills or search inputs) update.
   - Wrap Context Provider values in `useMemo` (`AuthContext`, `ToastContext`) so consumers don't trigger unnecessary re-renders.
   - In 3D physics cards and background canvases, mutate styles via DOM refs inside `requestAnimationFrame` instead of saving mouse coordinates in React state.
7. **Pagination Standards**:
   - Use `DataTablePagination.jsx` for all administrative and user dashboard lists. Provide `page`, `totalPages`, `totalItems`, `itemsPerPage`, and `onPageChange` with dynamic range calculation (`Showing X to Y of Z entries`).
8. **Git Commit Guidelines**:
   - Follow Conventional Commits format:
     - `feat: add tag filtering to public feed`
     - `fix: sanitize rich text before rendering`
     - `perf: optimize highlight.js bundle and lean queries`
     - `docs: update deployment instructions for Vercel`
     - `test: add integration test for post deletion`
