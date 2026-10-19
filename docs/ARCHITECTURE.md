# OmniLog — System Architecture

This document outlines the software architecture, design principles, component diagrams, database models, and API specifications for **OmniLog**.

---

## 1. High-Level Architecture Overview

OmniLog employs a decoupled client-server architecture:
- **Client Tier**: A React.js Single Page Application (SPA) built with Vite and Tailwind CSS featuring an obsidian 3D spatial design system:
  - **Full-Width 2-Column Responsive Architecture**: Eliminates empty side margins via `max-w-7xl` asymmetric grids across Landing, Feed, Post View, Editor, and Console pages.
  - **Interactive Hero Showcase (`HeroShowcase.jsx`)**: 3D spatial multi-tab experience with Reader View (live reading progress & code blocks), Author Studio (simulated live typing & format toolbar), and Platform Engine Telemetry with real-time performance indicators.
  - **Dual-Mode Explore Stream & Feed Pagination**: Seamlessly switchable between `IntersectionObserver` Infinite Stream and responsive paginated feed navigation (`FeedPage.jsx`).
  - **Reusable Data Table Pagination (`DataTablePagination.jsx`)**: Unified glassmorphism pagination controls with live item range counters across Admin Console and Author Cockpit.
  - **Modular Syntax Highlighting Engine (`client/src/utils/highlight.js`)**: Lightweight core bundle loading only 16 essential languages, reducing highlight vendor bundle size by 90.8% (87 kB vs 950 kB).
  - **Interactive 3D Engine & Parallax**: Native HTML5 Canvas 2D particle physics background with cursor gravity field, celestial z-depth scroll parallax, and battery-saving RAF lifecycle management (`InteractiveBackground.jsx`).
  - **GPU-Accelerated Parallax Layer**: Zero-dependency component compositing elements with `translate3d` across configurable velocity planes (`ParallaxLayer.jsx`).
  - **Specular 3D Perspective Tilt**: Hardware-accelerated CSS 3D tilt cards with cursor-following specular spotlight sheen (`Card3D.jsx`).
  - **Floating Frosted Glass Dock**: Dynamic acrylic navigation dock (`w-full max-w-7xl`) with active route pill indicator (`Navbar.jsx`).
  - **Editorial Reading & Studio Sidebar System**: Sticky reading companion (real-time progress, read time, share/actions) and authoring studio controls (word counter, visibility toggles, taxonomy).
  - **Studio Rich Text Editor & Auto-Formatter**: Dark obsidian editor with syntax highlighting, live word/reading counters, dedicated Indent/Outdent controls, and multi-language code snippet auto-formatter (`codeFormatter.js`).
  - **DOMPurify & Resilient Media**: Client-side sanitization preventing XSS and cross-origin avatar handling (`no-referrer`).
- **Application Tier**: A stateless Node.js / Express REST API handling authentication, input validation, post processing, tag categorization, and database persistence:
  - **Response Compression**: Gzip/Deflate compression middleware with 1024-byte threshold.
  - **In-Memory Tag Caching**: 60-second TTL cache for `/api/posts/tags/popular` with HTTP `Cache-Control` headers.
  - **Optimized Query Pipelines**: Selective field projection (`.select('-body -__v')`) and `.lean()` document hydration on bulk listings.
- **Data Tier**: A managed MongoDB Atlas cluster storing documents for `users` and `posts` with compound indexes for high-throughput querying.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│               React.js 18/19 SPA (Vite + JSX)               │
│        - Full-Width 2-Column Responsive System (max-w-7xl)  │
│        - HeroShowcase (Reader, Author Studio, Telemetry)    │
│        - Dual-Mode Feed (Infinite Stream + Paginated)       │
│        - DataTablePagination Component (Admin + Author)     │
│        - Modular Highlight.js Engine (16 Languages, 87 kB)  │
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
                               │ HTTPS / JSON REST API (Compressed Gzip/Deflate)
                               │ (JWT in HttpOnly Cookie or Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Tier                       │
│              Node.js + Express REST API (ESM)               │
│                                                             │
│  ├── Middleware: Compression (1KB+), Helmet, CORS, Limiter  │
│  ├── In-Memory Caching: 60s TTL popular tags cache          │
│  ├── Auth: Passport Google OAuth 2.0 + Stateless JWT        │
│  ├── Middlewares: authGuard, validate, errorHandler         │
│  ├── Controllers: authController, postController, user...   │
│  ├── Services: readingTime, excerptGenerator                │
│  └── Query Opt: .select('-body -__v').lean() projections    │
│        Hosted on: Render Web Service (Docker / Node)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Mongoose 8.x (TLS/SSL + Compound Indexes)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Data Tier                           │
│                  MongoDB Atlas Cluster                      │
│            Collections: `users`, `posts`                    │
│            Compound Indexes: { role: 1, status: 1, ... }    │
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

---

## 8. Modular Syntax Highlighting Architecture

In previous revisions, importing monolithic `highlight.js` introduced a **950 kB** bundle overhead by bundling over 190 obscure languages synchronously.

OmniLog uses a centralized, modular syntax highlighting engine in [`client/src/utils/highlight.js`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/utils/highlight.js):

```
┌────────────────────────────────────────────────────────┐
│             client/src/utils/highlight.js              │
│                                                        │
│  import hljs from 'highlight.js/lib/core';             │
│                                                        │
│  ├── Core Languages Registered (16 Essential):        │
│  │   javascript, typescript, python, bash, json,       │
│  │   html, css, markdown, sql, rust, go, java,         │
│  │   cpp, yaml, dockerfile, csharp                     │
│  │                                                     │
│  ├── Centralized hljs.highlightElement() Utility       │
│  └── Bundled Vendor Footprint: 87.5 kB (90.8% Savings) │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ RichTextEditor│   │ PostViewPage  │   │ HeroShowcase  │
│ (Live Studio) │   │ (Read Canvas) │   │ (Hero Demo)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Highlights:
- **Tree-Shaking**: Uses `highlight.js/lib/core` and registers only the top 16 programming and configuration languages.
- **Rollup Chunk Isolation**: Configured in `client/vite.config.js` via `manualChunks`:
  ```javascript
  if (id.includes('highlight.js')) return 'vendor-highlight';
  ```
- **Consistent Code Highlighting**: Reusable across `RichTextEditor.jsx`, `PostViewPage.jsx`, and `HeroShowcase.jsx` with automatic CSS class injection (`hljs language-*`).

---

## 9. Full-Stack Performance & Optimization Architecture

OmniLog incorporates rigorous performance optimizations across every tier:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     OmniLog Performance Pipelines                       │
├────────────────────────────────┬────────────────────────────────────────┤
│ Application / Database Tier    │ Client / Rendering Tier                │
├────────────────────────────────┼────────────────────────────────────────┤
│ • Gzip/Deflate Compression     │ • Modular Highlight.js (-90.8% bundle) │
│ • Lean Queries (.lean())       │ • React.memo(PostCard) memoization     │
│ • Field Projection (-body)     │ • AuthContext & ToastContext useMemo   │
│ • In-Memory Tag Caching (60s)  │ • Canvas O(N²) Squared Distance Math   │
│ • Compound Database Indexes    │ • Instant App Shell (< 50ms FCP)       │
└────────────────────────────────┴────────────────────────────────────────┘
```

### 1. HTTP Response Compression (`compression`)
- Express uses the standard `compression` middleware configured with a `threshold: 1024` bytes.
- Large JSON arrays (such as post feeds, user tables, and tags) are automatically compressed using Gzip or Deflate over WAN connections, reducing payload sizes by 60%–80%.

### 2. High-Throughput Database Query Projections & Lean Serialization
- **Field Stripping**: Bulk post queries (`GET /api/posts` and `GET /api/posts/my-posts`) selectively exclude the large rich-text `body` field (`.select('-body -__v')`), since cards only require metadata, title, and the lightweight 160-character `excerpt`.
- **Mongoose Lean Hydration**: Bulk read queries invoke `.lean()`, bypassing Mongoose document wrapping, change-tracking, and getters, returning raw JavaScript objects that serialize rapidly to JSON.

### 3. In-Memory Popular Tag Caching
- `postController.getPopularTags` uses an in-memory cache with a 60-second Time-To-Live (TTL).
- Subsequent requests within the TTL window bypass the MongoDB `$unwind` and `$group` aggregation pipeline entirely.
- Includes HTTP response header: `Cache-Control: public, max-age=60, stale-while-revalidate=30`.

### 4. Database Compound Indexing
- In addition to single-field indexes, `UserSchema` provides compound indexing:
  ```javascript
  UserSchema.index({ role: 1, status: 1, createdAt: -1 });
  ```
  This guarantees index coverage for admin console filtering operations by role, status, and registration recency.

### 5. Client Render Stabilization & Memoization
- **`React.memo(PostCard)`**: Prevents re-rendering unchanged post cards during tag filter changes or search query typing.
- **Context Value Memoization**: Context values in `AuthContext.jsx` and `Toast.jsx` are wrapped in `useMemo`, preventing full-tree render churn on unrelated component updates.
- **Direct DOM Mutation in 3D Card**: `Card3D.jsx` updates transforms and specular sheen directly via DOM refs and `requestAnimationFrame`, eliminating React state updates from mousemove handlers.

### 6. Canvas 2D Particle Engine Optimization ($O(N^2)$ Euclidean Math)
- In [`InteractiveBackground.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/components/common/InteractiveBackground.jsx), particle distance calculations inside the inner connection loop previously used `Math.hypot(dx, dy)`.
- Optimized to compare squared Euclidean distances directly ($dx^2 + dy^2 < r^2$), eliminating thousands of expensive square root computations per animation frame at 120 FPS.

---

## 10. Pagination & Dual-Mode Feed Architecture

To prevent unbounded publication loading and maintain snappy frame rates, OmniLog provides responsive pagination across all data surfaces:

### 1. Reusable Data Table Pagination (`DataTablePagination.jsx`)
- Built for tabular and list interfaces in [`DashboardPage.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/pages/DashboardPage.jsx) (Author Publications) and [`AdminPage.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/pages/AdminPage.jsx) (System Publications and User Accounts).
- **Features**:
  - Live range indicator: `"Showing 1 to 10 of 42 entries"`.
  - Responsive layout: Stacked on mobile screens (`< sm`), inline layout on tablet and desktop.
  - Numbered page pills (`[1] [2] [3]`) with active glowing indicator.
  - Previous / Next buttons with defensive disabled bounds checking.

### 2. Dual-Mode Explore Feed (`FeedPage.jsx`)
- **Mode Toggle**: Readers can switch between **Infinite Stream** and **Paginated Feed**.
- **Infinite Stream**: Employs an `IntersectionObserver` sentinel target at the bottom of the feed to seamlessly request the next batch of posts as the reader approaches the footer.
- **Paginated Mode**: Provides discrete numbered navigation pills with smooth scroll-to-top on page change.
- **Pagination Guard Ref**: Uses an `isFirstRender` ref to prevent skipping Page 1 re-fetches when navigating back from Page 2 to Page 1.

---

## 11. Landing Page Hero Showcase Architecture (`HeroShowcase.jsx`)

Replacing static code snippets, the Hero section integrates a live interactive showcase ([`HeroShowcase.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/components/landing/HeroShowcase.jsx)) hosted inside a 3D specular tilt container:

```
┌────────────────────────────────────────────────────────┐
│                Interactive Hero Showcase               │
├────────────────────────────────────────────────────────┤
│ [📖 Reader Experience] [✍️ Author Studio] [⚡ Telemetry] │
├────────────────────────────────────────────────────────┤
│  Tab 1: Reader View                                    │
│  - Live scroll reading progress meter (78% completed)  │
│  - Author metadata badge with status indicator         │
│  - Syntax-highlighted code block with line numbers     │
│  - Interactive topic taxonomy tags                     │
│                                                        │
│  Tab 2: Author Studio                                  │
│  - Live simulated typing animation into active canvas   │
│  - Word count & reading time telemetry                 │
│  - Floating obsidian format pills (H2, Code, Quote)    │
│                                                        │
│  Tab 3: Platform Telemetry                             │
│  - Real-time engine benchmarks:                        │
│    • First Contentful Paint: < 50ms                    │
│    • Highlight.js Vendor Footprint: 87.5 kB            │
│    • Automated Test Suite: 53/53 Passing               │
│    • TLS Protocol: TLS 1.2 Encrypted                   │
│    • Network Compression: Gzip / Deflate Enabled       │
└────────────────────────────────────────────────────────┘
```



