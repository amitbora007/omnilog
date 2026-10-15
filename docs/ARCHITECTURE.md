# OmniLog — System Architecture

This document outlines the software architecture, design principles, component diagrams, database models, and API specifications for **OmniLog**.

---

## 1. High-Level Architecture Overview

OmniLog employs a decoupled client-server architecture:
- **Client Tier**: A React.js Single Page Application (SPA) built with Vite and Tailwind CSS. Static assets are served via a high-performance Content Delivery Network (Vercel Edge or Render Static).
- **Application Tier**: A stateless Node.js / Express REST API handling authentication, input validation, post processing, tag categorization, and database persistence.
- **Data Tier**: A managed MongoDB Atlas cluster storing documents for `users` and `posts`.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│               React.js 18/19 SPA (Vite + JSX)               │
│        - Tailwind CSS for responsive styling                │
│        - Rich Text & Code Editor with Syntax Highlighting   │
│        - DOMPurify for secure client-side sanitization      │
│        - Resilient Avatar with no-referrer & error fallback │
│        - React Router for client-side navigation            │
│        Hosted on: Vercel (Edge CDN) or Render Static        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS / JSON REST API
                               │ (JWT in HttpOnly Cookie or Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Tier                       │
│              Node.js + Express REST API (ESM)               │
│                                                             │
│  ├── Security: Helmet, CORS, Express-Rate-Limit             │
│  ├── Auth: Passport Google OAuth 2.0 + Stateless JWT        │
│  ├── Middlewares: authGuard, validate, errorHandler         │
│  ├── Controllers: authController, postController, userController │
│  └── Services: readingTime, excerptGenerator                │
│        Hosted on: Render Web Service (Docker / Node)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Mongoose 8.x (TLS/SSL)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Data Tier                           │
│                  MongoDB Atlas Cluster                      │
│            Collections: `users`, `posts`                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Lifecycle (Stateless JWT)

Unlike the legacy application which stored sessions in a MongoDB `sessions` collection via `connect-mongo`, OmniLog uses **stateless JWT tokens**:

```
[User Browser]             [Node.js API Server]              [Google OAuth]
      │                              │                             │
      │ 1. Click "Login with Google" │                             │
      ├─────────────────────────────►│                             │
      │                              │ 2. Redirect to Google Auth  │
      │                              ├────────────────────────────►│
      │                              │                             │
      │ 3. User grants consent       │                             │
      │◄─────────────────────────────┼─────────────────────────────┤
      │                              │ 4. Callback with Auth Code  │
      │                              │◄────────────────────────────┤
      │                              │ 5. Fetch profile & sync DB  │
      │                              │ 6. Issue signed JWT cookie  │
      │ 7. Redirect to /dashboard    │                             │
      │◄─────────────────────────────┤                             │
      │                              │                             │
      │ 8. GET /api/auth/me (Cookie) │                             │
      ├─────────────────────────────►│ Validate JWT                │
      │◄─────────────────────────────┤ Return user JSON            │
```

### Security Properties of OmniLog Auth
- **HttpOnly Cookie**: Prevents JavaScript on the client from accessing the session token, neutralizing XSS token theft.
- **SameSite=Lax & Secure**: Guards against Cross-Site Request Forgery (CSRF) while ensuring transmission only across HTTPS.
- **Bearer Token Fallback**: External clients or dev environments can pass `Authorization: Bearer <token>`.

---

## 3. Database Schema Models (Mongoose 8)

### Users Collection (`User.js`)
```javascript
{
  googleId: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: '', trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  image: { type: String, default: '' },
  bio: { type: String, default: '', maxLength: 300 },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Posts Collection (`Post.js`)
```javascript
{
  title: { type: String, required: true, trim: true, maxLength: 200 },
  body: { type: String, required: true },
  excerpt: { type: String, default: '' },
  tags: [{ type: String, lowercase: true, trim: true, index: true }],
  status: { type: String, enum: ['public', 'private'], default: 'public', index: true },
  readingTime: { type: Number, default: 1 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 4. REST API Endpoint Specifications

All responses return standard JSON envelopes:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Authentication Endpoints (`/api/auth`)
| Verb | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/google` | Initiates Google OAuth consent flow | Public |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler; syncs user, checks `ADMIN_EMAILS`, sets JWT cookie | Public |
| `GET` | `/api/auth/me` | Returns profile of currently authenticated user | Private (JWT) |
| `POST` | `/api/auth/logout` | Clears authentication cookie and local session | Private (JWT) |

### Post Management Endpoints (`/api/posts`)
| Verb | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | List public posts (supports `?tag=tech&search=react&page=1`) | Public |
| `GET` | `/api/posts/:id` | Retrieve single post by ID (with author details) | Public / Private (if owner) |
| `POST` | `/api/posts` | Create a new post (calculates reading time, extracts excerpt) | Private (JWT) |
| `PUT` | `/api/posts/:id` | Update an existing post (supports author or Super Admin override) | Private (Owner or Super Admin) |
| `DELETE`| `/api/posts/:id` | Delete a post (supports author or Super Admin override) | Private (Owner or Super Admin) |
| `GET` | `/api/posts/my-posts` | List posts for console (supports `?scope=mine` vs `?scope=all` for Super Admins) | Private (JWT) |
| `GET` | `/api/posts/user/:userId` | List all public posts authored by specific user | Public |
| `GET` | `/api/posts/tags/popular` | Retrieve top tags with post counts | Public |

### User Management Endpoints (`/api/users`)
| Verb | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List users with pagination, role/status filtering, and search | Private (Super Admin) |
| `POST` | `/api/users` | Manually provision a new user account with role and status | Private (Super Admin) |
| `GET` | `/api/users/:id` | Retrieve single user account details and post counts | Private (Super Admin) |
| `PUT` | `/api/users/:id` | Update user profile, promote/demote role, or suspend account | Private (Super Admin) |
| `DELETE`| `/api/users/:id` | Delete user with automatic cascade deletion of all authored posts | Private (Super Admin) |

### System & Health Endpoints
| Verb | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server health, DB connection status, uptime | Public |

---

## 5. Security Architecture

1. **Stored XSS Prevention**:
   - Rich-text post bodies are run through `DOMPurify` before rendering to the DOM.
   - Script tags, arbitrary iframes, and `javascript:` URIs are strictly stripped.
2. **HTTP Security Headers**:
   - `helmet` middleware is configured with sensible defaults (HSTS, X-Content-Type-Options, Frameguard).
3. **CORS (Cross-Origin Resource Sharing)**:
   - Configured with strict whitelisted client origins (`http://localhost:5173` in development, production client URL on Vercel/Render).
4. **Rate Limiting**:
   - `express-rate-limit` prevents brute force abuse on auth and mutation routes.
