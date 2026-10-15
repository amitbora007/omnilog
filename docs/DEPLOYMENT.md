# OmniLog — Deployment & Infrastructure Guide

This guide details how to deploy **OmniLog** to production on **Vercel** and **Render**, along with database and OAuth configuration.

---

## 1. Deployment Architecture

OmniLog can be deployed in two battle-tested production configurations:

### Option A: Render Monorepo Blueprint (Recommended)
Both the Node.js API and the React Static SPA are deployed on **Render** via a single infrastructure-as-code specification file (`render.yaml`).
- **Backend**: Render Web Service (`omnilog-api`) running Node.js.
- **Frontend**: Render Static Site (`omnilog-client`) serving the built Vite assets.

### Option B: Decoupled Vercel + Render
- **Frontend**: Deployed on **Vercel** to leverage its global edge CDN network, automatic preview deployments, and instant asset caching.
- **Backend**: Deployed on **Render** as a managed Node.js Web Service.

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     Vercel (React Frontend)     │      │   Render (Node.js REST API)     │
│   https://omnilog.vercel.app    │◄────►│   https://omnilog-api.onrender.com│
└─────────────────────────────────┘      └────────────────┬────────────────┘
                                                          │ Mongoose TLS
                                                          ▼
                                         ┌─────────────────────────────────┐
                                         │      MongoDB Atlas Cluster      │
                                         └─────────────────────────────────┘
```

---

## 2. Deploying to Render via `render.yaml` Blueprint

The root of this repository includes a [`render.yaml`](../render.yaml) file defining both services.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your `omnilog` repository.
5. Render will detect `render.yaml` and prompt you to supply the required secret environment variables:
   - `MONGO_URI`: Your production MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random 64-character string (`openssl rand -hex 32`).
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
6. Click **Apply**. Render will automatically build the client static site and start the backend web service.

---

## 3. Deploying the React Frontend to Vercel

### Steps:
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your `omnilog` repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://your-render-api-url.onrender.com/api`
5. Click **Deploy**. Vercel will build and publish your React application with a global CDN URL.

### SPA Rewrites (`vercel.json`)
The repository includes a root [`vercel.json`](../vercel.json) ensuring all client-side routes (e.g., `/dashboard`, `/posts/123`, `/posts/new`) redirect properly to `index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Google OAuth 2.0 Cloud Console Setup

To enable Google Authentication in production:
1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Select your project and navigate to **Credentials** -> **OAuth 2.0 Client IDs**.
3. Under **Authorized JavaScript origins**, add:
   - Development: `http://localhost:5173`, `http://localhost:5000`
   - Production Frontend: `https://your-app.vercel.app` (or Render client URL)
   - Production Backend: `https://your-api.onrender.com`
4. Under **Authorized redirect URIs**, add:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production Backend: `https://your-api.onrender.com/api/auth/google/callback`
5. Save changes.

---

## 5. MongoDB Atlas Setup & Security

1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Create or select a cluster (the free M0 tier works great for starting out).
3. Under **Database Access**, create a dedicated database user with `readWriteAnyDatabase` privileges.
4. Under **Network Access**, configure IP access:
   - Click **Add IP Address** and add `0.0.0.0/0` (Allow access from anywhere) so that Render's dynamic outbound IPs can connect.
5. In **Database** -> **Connect**, select **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/omnilog?retryWrites=true&w=majority
   ```

---

## 6. Environment Variables Reference

### Backend (`server/`)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | HTTP listening port | `5000` |
| `NODE_ENV` | Yes | Runtime mode (`development` or `production`) | `production` |
| `CLIENT_URL` | Yes | URL of the frontend (for CORS and redirects) | `https://omnilog.vercel.app` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | Cryptographic secret for signing JWTs | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | No | Token validity duration (default: `7d`) | `7d` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth Client Secret | `...` |
| `GOOGLE_CALLBACK_URL` | Yes | Absolute URL for OAuth callback | `https://api.example.com/api/auth/google/callback` |
| `ADMIN_EMAILS` | No | Comma-separated Google emails granted Super Admin privileges | `admin@example.com,dev@gmail.com` |

### Frontend (`client/`)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Yes | Absolute URL of the backend API prefix (must include `/api`) | `https://omnilog-api.onrender.com/api` |

---

## 7. Troubleshooting Production Issues

1. **CORS Error (`Access-Control-Allow-Origin`)**:
   - Ensure `CLIENT_URL` on the backend matches the exact protocol and hostname of your frontend (including or excluding trailing slashes).
2. **Cookies Not Persisting in Browser**:
   - For cross-domain hosting (e.g., frontend on `vercel.app` and backend on `onrender.com`), ensure cookies are configured with `SameSite=None; Secure=true` or use authorization Bearer headers.
3. **Render Cold Start Delay (Free Tier)**:
   - Render free-tier web services spin down after 15 minutes of inactivity. OmniLog includes a lightweight `/api/health` endpoint that can be pinged by UptimeRobot or Cron-job to keep the service warm.
4. **MongoDB Atlas Connection Reset (`ECONNRESET` / MTU on Node 22+)**:
   - On Node 22+, modern TLS 1.3 ClientHello extensions can exceed standard MTU packet sizes. `server/package.json` includes `NODE_OPTIONS=--tls-max-v1.2` to ensure consistent TLS handshakes.
5. **Google OAuth Profile Images Blocked (429/403)**:
   - Google User Content CDN (`lh3.googleusercontent.com`) blocks requests with third-party `Referer` headers. OmniLog's `Avatar.jsx` component includes `referrerPolicy="no-referrer"` to ensure images render reliably.
6. **API Route 404 Errors (`Route not found: /auth/me` or `/posts`)**:
   - Verify that `VITE_API_URL` in your Vercel Project Settings ends with `/api` (e.g. `https://omnilog-api.onrender.com/api`). Express mounts routes under `/api`, so omitting `/api` results in 404 responses.
