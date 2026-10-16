# OmniLog — System Architecture

This document outlines the software architecture, design principles, component diagrams, database models, and API specifications for **OmniLog**.

---

## 1. High-Level Architecture Overview

OmniLog employs a decoupled client-server architecture:
- **Client Tier**: A React.js Single Page Application (SPA) built with Vite and Tailwind CSS featuring an obsidian 3D spatial design system:
  - **Full-Width 2-Column Responsive Architecture**: Eliminates empty side margins via `max-w-7xl` asymmetric grids across Landing, Feed, Post View, Editor, and Console pages.
  - **Interactive 3D Engine & Parallax**: Native HTML5 Canvas 2D particle physics background with cursor gravity field, celestial z-depth scroll parallax, and battery-saving RAF lifecycle management (`InteractiveBackground.jsx`).
  - **GPU-Accelerated Parallax Layer**: Zero-dependency component compositing elements with `translate3d` across configurable velocity planes (`ParallaxLayer.jsx`).
  - **Specular 3D Perspective Tilt**: Hardware-accelerated CSS 3D tilt cards with cursor-following specular spotlight sheen (`Card3D.jsx`).
  - **Floating Frosted Glass Dock**: Dynamic acrylic navigation dock (`w-full max-w-7xl`) with active route pill indicator (`Navbar.jsx`).
  - **Editorial Reading & Studio Sidebar System**: Sticky reading companion (real-time progress, read time, share/actions) and authoring studio controls (word counter, visibility toggles, taxonomy).
  - **Studio Rich Text Editor & Auto-Formatter**: Dark obsidian editor with syntax highlighting, live word/reading counters, dedicated Indent/Outdent controls, and multi-language code snippet auto-formatter (`codeFormatter.js`).
  - **DOMPurify & Resilient Media**: Client-side sanitization preventing XSS and cross-origin avatar handling (`no-referrer`).
- **Application Tier**: A stateless Node.js / Express REST API handling authentication, input validation, post processing, tag categorization, and database persistence.
- **Data Tier**: A managed MongoDB Atlas cluster storing documents for `users` and `posts`.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│               React.js 18/19 SPA (Vite + JSX)               │
│        - Full-Width 2-Column Responsive System (max-w-7xl)  │
│        - Tailwind CSS + Obsidian Glassmorphism System       │
│        - InteractiveBackground (HTML5 Canvas 2D Parallax)   │
│        - ParallaxLayer (GPU-Composited Multi-Plane Motion)  │
│        - Card3D (CSS 3D Perspective + Specular Sheen)       │
│        - Sticky Editorial & Studio Companion Sidebars       │
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
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Deactivated & Suspended Account Enforcement
- **OAuth Callback Guard**: In `passport.js` and `authController.js`, users with `status === 'suspended'` or `status === 'inactive'` are denied session tokens/cookies and redirected to `${CLIENT_URL}/?error=${encodeURIComponent('Your account is deactivated, please contact customer support.')}`.
- **Middleware & Session Guard**: In `middleware/auth.js` (`protect`) and `authController.getMe`, requests from deactivated/suspended accounts return HTTP 403 Forbidden with `{ success: false, error: 'Your account is deactivated, please contact customer support.' }`.
- **Client Handling**: `AuthContext` captures the URL error query parameter (or 403 API response), purges any stored tokens from `localStorage`, cleans the URL search string via `window.history.replaceState`, and renders both a persistent top notice banner below the navigation dock and an alert toast.

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

---

## 6. Role-Based Navigation & Dashboard Routing Architecture

OmniLog strictly separates user experiences based on the account role (`user` vs `admin`):

| Persona / Role | Primary Console | Desktop / Mobile Nav Link | Dropdown Menu Item | `/dashboard` Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** (`role: 'admin'`) | Super Admin Console (`/admin`) | **Admin Dashboard** (`/admin`) | **Admin Dashboard** (`/admin`) | Redirects to `/admin` |
| **Standard Author** (`role: 'user'`) | Author Cockpit (`/dashboard`) | **Author Dashboard** (`/dashboard`) | **My Dashboard** (`/dashboard`) | Renders Author Console |
| **Guest / Public** | Landing (`/`) / Feed (`/feed`) | *Hidden* | *Hidden* | Redirects to `/` |

### Key Invariants:
1. **Zero Dashboard Duplication**: An authenticated admin is never shown both an Author Dashboard and an Admin Dashboard. Only the **Admin Dashboard** is rendered.
2. **Deterministic Route Guarding**: If an admin types or bookmarks `/dashboard`, `DashboardPage` invokes `<Navigate to="/admin" replace />` alongside an effect-level redirect, immediately forwarding to the Super Admin Console.
3. **Dynamic Studio Exits**: `EditorPage` and `PostViewPage` evaluate `user?.role === 'admin'` to dynamically direct back buttons and discard triggers to `/admin` for administrators and `/dashboard` for standard authors.

---

## 7. Editorial & Engineering Contact Pipeline (Resend + React Email)

OmniLog provides a direct communication dispatch on the Landing Page backed by **Resend** and **React Email**:

```
┌────────────────────────────────┐
│  LandingPage (<ContactSection>)│
│  - 3D Spatial Tilt Card        │
│  - Live Validation & Feedback  │
└───────────────┬────────────────┘
                │ POST /api/contact
                ▼
┌────────────────────────────────┐
│  Express API Rate Limiter      │
│  - max 10 requests / 15 min    │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│  React Email Renderer          │
│  - @react-email/components     │
│  - @react-email/render (HTML)  │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│  Resend API Client             │
│  - resend.emails.send(...)     │
│  - Dev Simulation Fallback     │
└────────────────────────────────┘
```

1. **Client Interaction (`ContactSection.jsx`)**:
   - Integrated into [`LandingPage.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/pages/LandingPage.jsx#L344) with full-width responsive layout and hardware-accelerated 3D spatial card tilt.
   - Real-time client-side validation (name, email format regex, min 10 character message, 2,000 char counter).
   - Seamless transition to success dispatch card with quick reset button and toast notifications.
2. **Rate Limiting & Validation (`routes/contact.js`)**:
   - Protected by `express-rate-limit` (10 dispatches per 15-minute window per IP) to guard against email abuse and spam.
   - Server-side payload validation for name, valid email address, and message length.
3. **React Email Compilation (`emails/ContactEmail.js`)**:
   - Modern HTML email template built using `@react-email/components` (`Html`, `Head`, `Preview`, `Container`, `Section`, `Heading`, `Text`, `Hr`, `Link`).
   - Compliant with strict email client CSS rendering constraints while maintaining OmniLog's dark obsidian technical aesthetic.
   - Compiled to production HTML string via `@react-email/render` inside Node ESM.
4. **Resend Delivery & Dev Simulation (`controllers/contactController.js`)**:
   - When `RESEND_API_KEY` is provided, dispatches authenticated email requests through the official `resend` SDK to the configured destination mailbox (`CONTACT_EMAIL_TO`).
   - If `RESEND_API_KEY` is omitted or unconfigured during local development, automatically operates in non-blocking simulation mode (`simulated: true`), logging message contents and returning success without interrupting local developers.


