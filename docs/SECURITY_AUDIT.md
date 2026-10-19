# OmniLog — Certified Ethical Hacker (CEH) VAPT Report & Security Hardening Blueprint

**Assessment Type**: Web Application Vulnerability Assessment & Penetration Testing (VAPT)  
**Standard**: OWASP Top 10 (2021), NIST SP 800-115, CEH v12 Methodology  
**Target Application**: OmniLog Platform (React.js SPA + Node.js/Express API + MongoDB Atlas)  
**Evaluation Date**: October 2026  
**Auditor Classification**: Certified Ethical Hacker (CEH) / Application Security Auditor  

---

## 1. Executive Summary

A comprehensive Vulnerability Assessment and Penetration Testing (VAPT) review was conducted against the **OmniLog** blogging and technical publication platform. The evaluation examined the decoupled architecture spanning the client Single Page Application ([`client`](file:///home/amit.bora/Downloads/ai/Omnilog/client)), the Express REST API ([`server`](file:///home/amit.bora/Downloads/ai/Omnilog/server)), database interfaces ([`server/src/models`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/models)), authentication mechanisms (Google OAuth 2.0 / JWT), session handling, and edge deployment configurations ([`vercel.json`](file:///home/amit.bora/Downloads/ai/Omnilog/vercel.json)).

### Overall Security Posture Rating: **MODERATE / REQUIRES HARDENING**
While OmniLog has strong foundations—such as role-based access control with self-demotion guards, client-side HTML sanitization with DOMPurify, secure headers on Vercel, and parameterized Mongoose queries—the audit uncovered **3 High-Severity**, **4 Medium-Severity**, and **4 Low/Informational** vulnerabilities that expose the application to credential leakage, cross-site request forgery, denial of service (ReDoS and type juggling), and token theft via localStorage.

### Vulnerability Severity Breakdown

```
┌────────────────────────────────────────────────────────────┐
│              VAPT Vulnerability Severity Breakdown         │
├────────────────────┬──────────┬────────────────────────────┤
│ Severity Level     │ Count    │ OWASP Top 10 (2021) Scope  │
├────────────────────┼──────────┼────────────────────────────┤
│ 🔴 Critical        │ 0        │ —                          │
│ 🟠 High            │ 3        │ A01, A02, A07              │
│ 🟡 Medium          │ 4        │ A03, A04, A05, A07         │
│ 🔵 Low / Info      │ 4        │ A03, A05, A06              │
├────────────────────┼──────────┼────────────────────────────┤
│ Total Findings     │ 11       │ 100% Remediations Provided │
└────────────────────┴──────────┴────────────────────────────┘
```

---

## 2. Vulnerability Summary Matrix

| Finding ID | Vulnerability Title | Severity | CVSS v3.1 | CWE | OWASP (2021) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **SEC-VAPT-001** | JWT Bearer Token Leakage in URL Query Parameters via OAuth Redirect | **HIGH** | **7.5** | CWE-598 / CWE-200 | A07: Identification & Auth Failures | **ACTION REQUIRED** |
| **SEC-VAPT-002** | Cross-Site Request Forgery (CSRF) via `SameSite=None` Cookies Without Anti-CSRF Token or Origin Enforcement | **HIGH** | **7.4** | CWE-352 | A01: Broken Access Control | **ACTION REQUIRED** |
| **SEC-VAPT-003** | Hardcoded Fallback JWT Secret Allowing Token Forgery Upon Environment Misconfiguration | **HIGH** | **7.5** | CWE-798 / CWE-321 | A02: Cryptographic Failures | **ACTION REQUIRED** |
| **SEC-VAPT-004** | Regular Expression Denial of Service (ReDoS) and Unhandled Syntax Exceptions via Raw User Search | **MEDIUM** | **6.5** | CWE-1333 / CWE-400 | A03: Injection | **ACTION REQUIRED** |
| **SEC-VAPT-005** | API Crash / Denial of Service via Query Parameter Object Injection (Type Juggling) | **MEDIUM** | **5.3** | CWE-704 / CWE-20 | A05: Security Misconfiguration | **ACTION REQUIRED** |
| **SEC-VAPT-006** | Absence of Global API Rate Limiting on Unauthenticated Endpoints | **MEDIUM** | **5.3** | CWE-770 | A04: Insecure Design | **ACTION REQUIRED** |
| **SEC-VAPT-007** | Dual Token Storage: Long-Lived JWT in Browser `localStorage` (XSS Token Exfiltration Vector) | **MEDIUM** | **5.4** | CWE-922 | A07: Identification & Auth Failures | **ACTION REQUIRED** |
| **SEC-VAPT-008** | Absence of Server-Side Rich-Text HTML Sanitization on Write (Defense-in-Depth Gap) | **LOW** | **3.7** | CWE-79 | A03: Injection | **ACTION REQUIRED** |
| **SEC-VAPT-009** | Information Disclosure of Internal Error Strings in Production 500 Responses | **LOW** | **3.1** | CWE-209 | A05: Security Misconfiguration | **ACTION REQUIRED** |
| **SEC-VAPT-010** | Rich Text Editor Link Insertion Protocol Validation & Reverse Tabnabbing Vulnerability | **LOW** | **3.1** | CWE-1022 / CWE-20 | A03: Injection | **ACTION REQUIRED** |
| **SEC-VAPT-011** | Known Supply Chain Dependency Advisory: React Router Open Redirect Bypass (CVE-2025-68470) | **LOW** | **3.1** | CWE-601 | A06: Vulnerable Components | **ACTION REQUIRED** |

---

## 3. Deep-Dive Vulnerability Analysis & Technical Remediations

---

### [SEC-VAPT-001] JWT Bearer Token Leakage in URL Query Parameters via OAuth Redirect

- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N — Base Score: **7.5**)
- **CWE**: [CWE-598](https://cwe.mitre.org/data/definitions/598.html) (Use of GET Request Method With Sensitive Query Strings), [CWE-200](https://cwe.mitre.org/data/definitions/200.html) (Exposure of Sensitive Information)
- **OWASP Category**: A07:2021 — Identification and Authentication Failures
- **Affected File**: [`server/src/controllers/authController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/authController.js#L63)

#### Vulnerability Description & Mechanics
In `authController.googleCallback`:
```javascript
// Line 63 in server/src/controllers/authController.js:
res.redirect(`${clientUrl}/dashboard?token=${token}`);
```
Upon successful Google OAuth 2.0 authentication, the server generates a signed JSON Web Token (valid for 7 days) and appends it directly to the HTTP 302 redirect destination URL query string.

#### Threat Modeling & Attack Scenario
1. **Referer Header Leakage**: If the user visits `/dashboard?token=...` and any third-party asset (image, font, external script, or outgoing link) is loaded, the full URL including the sensitive JWT is transmitted in the plaintext HTTP `Referer` header to external servers.
2. **Web Server & CDN Access Logs**: URL query parameters are logged in plaintext across intermediate proxies, ISP logs, cloud CDNs (Cloudflare, Vercel edge access logs), and browser history.
3. **Shoulder Surfing & Screen Grabber Malware**: Any local process or browser extension with history permissions can harvest the long-lived credential without requiring user privilege escalation.

#### Remediation Patch
The backend already sets an `HttpOnly`, `Secure`, `SameSite=None/Lax`, `Partitioned` cookie named `token`. The token must **never** be transmitted via URL query parameters. Instead:
1. Deliver the token exclusively through the `HttpOnly` cookie or via a short-lived, one-time postMessage handshake.
2. The client should simply redirect to `/dashboard`, where the browser automatically presents the `HttpOnly` cookie to `GET /api/auth/me`.

**Patch in `server/src/controllers/authController.js`**:
```diff
- // Redirect to frontend dashboard with token in query parameter for client storage
- res.redirect(`${clientUrl}/dashboard?token=${token}`);
+ // Redirect securely to frontend dashboard without leaking token in URL
+ res.redirect(`${clientUrl}/dashboard`);
```

**Patch in `client/src/context/AuthContext.jsx`**:
```diff
- const tokenFromUrl = urlParams.get('token');
- if (tokenFromUrl) {
-   localStorage.setItem('omnilog_token', tokenFromUrl);
-   const cleanUrl = window.location.pathname;
-   window.history.replaceState({}, document.title, cleanUrl);
- }
+ // Rely on HttpOnly cookie authentication verified via /api/auth/me
```

---

### [SEC-VAPT-002] Cross-Site Request Forgery (CSRF) via `SameSite=None` Cookies Without Anti-CSRF Token or Origin Enforcement

- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N — Base Score: **7.4**)
- **CWE**: [CWE-352](https://cwe.mitre.org/data/definitions/352.html) (Cross-Site Request Forgery)
- **OWASP Category**: A01:2021 — Broken Access Control
- **Affected Files**: [`server/src/middleware/auth.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/middleware/auth.js#L7-L15), [`server/src/controllers/authController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/authController.js#L58)

#### Vulnerability Description & Mechanics
In `authController.js`:
```javascript
res.cookie('token', token, {
  ...
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
});
```
Because the frontend (`omnilog-one.vercel.app`) and backend (`omnilog-api.onrender.com`) are hosted on distinct top-level domains, `SameSite: 'none'` is configured. 

In `server/src/middleware/auth.js`:
```javascript
export const extractToken = (req) => {
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};
```
Furthermore, `express.urlencoded({ extended: false })` is mounted globally in `app.js`.

#### Threat Modeling & Attack Scenario
1. An authenticated OmniLog author or administrator visits a malicious webpage `attacker.com`.
2. The page submits a standard HTML `<form action="https://omnilog-api.onrender.com/api/posts" method="POST">` with hidden fields `title` and `body`.
3. Because `SameSite: none` is set and the form submission is a simple cross-site POST, the user's browser automatically attaches the `token` cookie.
4. `extractToken(req)` extracts `req.cookies.token`, authenticates the user, and creates a public publication without the user's knowledge or consent.
5. Similarly, `<form action="https://omnilog-api.onrender.com/api/auth/logout" method="POST">` can force a Denial of Service by terminating the user's active session.

#### Remediation Patch
Implement strict Origin / Referer validation middleware for all state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) relying on cookie authentication, or require a custom header (e.g. `X-Requested-With` or `Authorization`) which cannot be forged via standard HTML forms.

**Remediation Middleware (`server/src/middleware/csrf.js`)**:
```javascript
const ALLOWED_ORIGINS = new Set([
  process.env.CLIENT_URL,
  'https://omnilog-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean));

export const verifyCsrf = (req, res, next) => {
  // Safe idempotent methods do not require CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If request uses Bearer token in Authorization header, it cannot be forged by standard HTML forms
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // For cookie-authenticated mutation requests, enforce strict Origin/Referer matching
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({
      success: false,
      error: 'CSRF Protection: Request origin is unauthorized or missing.',
    });
  }

  next();
};
```

---

### [SEC-VAPT-003] Hardcoded Fallback JWT Secret Allowing Token Forgery

- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N — Base Score: **7.5**)
- **CWE**: [CWE-798](https://cwe.mitre.org/data/definitions/798.html) (Use of Hard-coded Credentials), [CWE-321](https://cwe.mitre.org/data/definitions/321.html) (Use of Hard-coded Cryptographic Key)
- **OWASP Category**: A02:2021 — Cryptographic Failures
- **Affected File**: [`server/src/utils/jwt.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/utils/jwt.js#L3-L5)

#### Vulnerability Description & Mechanics
In `server/src/utils/jwt.js`:
```javascript
const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'omnilog_fallback_jwt_secret_key_32chars_min';
};
```
If `JWT_SECRET` is omitted from the environment variables, empty, or misnamed in staging/production, the application silently defaults to the publicly known key `'omnilog_fallback_jwt_secret_key_32chars_min'`.

#### Threat Modeling & Attack Scenario
1. An attacker discovers the repository source code (or reads public commits).
2. The attacker crafts a forged JWT payload `{ id: "<target_admin_mongodb_id>" }` signed with the hardcoded fallback secret.
3. If any cloud deployment, branch preview, or staging container lacks the `JWT_SECRET` environment variable, the server validates the forged token as genuine, giving the attacker instant, full Super Administrator access.

#### Remediation Patch
Fail fast in production: if `JWT_SECRET` is undefined, empty, or equals the fallback template, abort process startup immediately.

**Patch in `server/src/utils/jwt.js`**:
```javascript
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'omnilog_fallback_jwt_secret_key_32chars_min') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing or set to insecure default in production.');
    }
    return 'omnilog_dev_only_jwt_secret_do_not_use_in_production_32char';
  }
  return secret;
};
```

---

### [SEC-VAPT-004] Regular Expression Denial of Service (ReDoS) and Unhandled Syntax Exceptions via Raw User Search

- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H — Base Score: **6.5**)
- **CWE**: [CWE-1333](https://cwe.mitre.org/data/definitions/1333.html) (Inefficient Regular Expression Complexity), [CWE-400](https://cwe.mitre.org/data/definitions/400.html) (Uncontrolled Resource Consumption)
- **OWASP Category**: A03:2021 — Injection
- **Affected Files**: [`server/src/controllers/postController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/postController.js#L30), [`server/src/controllers/userController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/userController.js#L29)

#### Vulnerability Description & Mechanics
In `postController.getPublicPosts`:
```javascript
// Line 30 in server/src/controllers/postController.js:
if (req.query.search && req.query.search.trim()) {
  const searchRegex = new RegExp(req.query.search.trim(), 'i');
  query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
}
```
User-supplied input is passed directly to the `RegExp` constructor without escaping regex metacharacters (`(`, `)`, `[`, `]`, `+`, `*`, `?`, `^`, `$`, `|`).

#### Automated Test Verification Output
```json
// Verified via Supertest against /api/posts?search=(
Status: 500
Response: {
  "success": false,
  "error": "Invalid regular expression: /(/i: Unterminated group"
}
```

#### Threat Modeling & Attack Scenario
1. **Uncaught Syntax Crash (500 Error)**: Sending an unclosed parenthesis `?search=(` immediately throws a `SyntaxError` that aborts the request and leaks regex engine internals in the error response.
2. **Catastrophic Backtracking (ReDoS)**: Supplying a regex payload with overlapping repeated groups (e.g. `?search=((a+)+)+$`) triggers exponential backtracking in the V8 engine, locking Node.js event-loop threads and preventing legitimate users from accessing the API.

#### Remediation Patch
Escape all regex control characters before creating `RegExp` instances, enforce a maximum search string length (e.g. 50 characters), and prefer indexed text search.

**Helper in `server/src/utils/helpers.js`**:
```javascript
/**
 * Safely escape characters that have special meaning in regular expressions
 */
export const escapeRegex = (string = '') => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 50);
};
```

**Patch in `postController.js` and `userController.js`**:
```diff
- const searchRegex = new RegExp(req.query.search.trim(), 'i');
+ const safeQuery = escapeRegex(typeof req.query.search === 'string' ? req.query.search.trim() : '');
+ if (safeQuery) {
+   const searchRegex = new RegExp(safeQuery, 'i');
+   query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
+ }
```

---

### [SEC-VAPT-005] API Crash / Denial of Service via Query Parameter Object Injection (Type Juggling)

- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:M — Base Score: **5.3**)
- **CWE**: [CWE-704](https://cwe.mitre.org/data/definitions/704.html) (Incorrect Type Conversion or Cast), [CWE-20](https://cwe.mitre.org/data/definitions/20.html) (Improper Input Validation)
- **OWASP Category**: A05:2021 — Security Misconfiguration
- **Affected Files**: [`server/src/controllers/postController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/postController.js#L24-L30), [`server/src/controllers/userController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/userController.js#L18-L30)

#### Vulnerability Description & Mechanics
In `postController.js`:
```javascript
if (req.query.tag && req.query.tag.trim().toLowerCase() !== 'all') {
  query.tags = req.query.tag.trim().toLowerCase();
}
```
Express query string parsers decode bracket notation `?tag[$ne]=null` into an Object: `{ tag: { '$ne': 'null' } }`.
Because the controller assumes `req.query.tag` is always a primitive String, calling `req.query.tag.trim()` results in an unhandled TypeError: `req.query.tag.trim is not a function`.

#### Automated Test Verification Output
```json
// Verified via Supertest against /api/posts?tag[$ne]=null
Status: 500
Response: {
  "success": false,
  "error": "req.query.tag.trim is not a function"
}
```

#### Remediation Patch
Validate that query parameters are strictly strings before calling string methods or passing them into Mongoose queries.

```javascript
// Sanitized query extraction helper
export const getCleanStringParam = (param, maxLength = 100) => {
  if (typeof param !== 'string') return '';
  return param.trim().slice(0, maxLength);
};
```

---

### [SEC-VAPT-006] Absence of Global API Rate Limiting on Unauthenticated Endpoints

- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:M — Base Score: **5.3**)
- **CWE**: [CWE-770](https://cwe.mitre.org/data/definitions/770.html) (Allocation of Resources Without Limits or Throttling)
- **OWASP Category**: A04:2021 — Insecure Design
- **Affected File**: [`server/src/app.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/app.js)

#### Vulnerability Description & Mechanics
While [`routes/contact.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/routes/contact.js) implements strict rate limiting (10 requests per 15 min), the primary API routes (`/api/posts`, `/api/posts/tags/popular`, `/api/users`, `/api/auth/google`) have **zero rate limiting**. An attacker can issue thousands of database aggregation requests per minute, exhausting connection pools and CPU resources on Render and MongoDB Atlas.

#### Remediation Patch
Attach a global rate limiter to all `/api/` routes in `server/src/app.js`, with stricter throttles for search and authentication.

```javascript
import rateLimit from 'express-rate-limit';

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again later.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

app.use('/api/', globalApiLimiter);
```

---

### [SEC-VAPT-007] Dual Token Storage: Long-Lived JWT in Browser `localStorage`

- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N — Base Score: **5.4**)
- **CWE**: [CWE-922](https://cwe.mitre.org/data/definitions/922.html) (Insecure Storage of Sensitive Information)
- **OWASP Category**: A07:2021 — Identification and Authentication Failures
- **Affected File**: [`client/src/context/AuthContext.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/context/AuthContext.jsx#L55)

#### Vulnerability Description & Mechanics
`AuthContext.jsx` saves the authentication token to `localStorage.setItem('omnilog_token', token)`.
Any script running inside the origin has unrestricted access to `localStorage`. If any third-party script, dependency compromise, or XSS occurs, an attacker can extract the token with `localStorage.getItem('omnilog_token')` and maintain persistent access for 7 days.

#### Remediation Patch
Migrate client authentication to rely strictly on the `HttpOnly`, `Secure` cookie. If an in-memory token is required for `Authorization: Bearer` headers, store it strictly in React state (`useState` / memory) rather than `localStorage`.

---

### [SEC-VAPT-008] Absence of Server-Side Rich-Text HTML Sanitization on Write

- **Severity**: **LOW** (CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:N — Base Score: **3.7**)
- **CWE**: [CWE-79](https://cwe.mitre.org/data/definitions/79.html) (Cross-Site Scripting)
- **OWASP Category**: A03:2021 — Injection
- **Affected File**: [`server/src/controllers/postController.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/controllers/postController.js#L125)

#### Vulnerability Description & Mechanics
In `postController.createPost` and `updatePost`, incoming `body` markup is saved directly to MongoDB without server-side sanitization. While the React client properly calls `DOMPurify.sanitize(post.body)` before rendering, relying exclusively on client-side sanitization violates Defense-in-Depth. If an RSS feed, mobile app, API consumer, or email newsletter consumes raw `post.body`, malicious scripts could execute.

#### Remediation Patch
Sanitize post content on the backend using `sanitize-html` or `dompurify` (via JSDOM) in `server/src/middleware/validate.js` before saving.

---

### [SEC-VAPT-009] Information Disclosure of Internal Error Strings in Production 500 Responses

- **Severity**: **LOW** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N — Base Score: **3.1**)
- **CWE**: [CWE-209](https://cwe.mitre.org/data/definitions/209.html) (Generation of Error Message Containing Sensitive Information)
- **OWASP Category**: A05:2021 — Security Misconfiguration
- **Affected File**: [`server/src/middleware/errorHandler.js`](file:///home/amit.bora/Downloads/ai/Omnilog/server/src/middleware/errorHandler.js#L35)

#### Vulnerability Description & Mechanics
```javascript
// Line 35 in server/src/middleware/errorHandler.js:
res.status(error.statusCode || 500).json({
  success: false,
  error: error.message || 'Internal Server Error',
});
```
When unhandled errors occur (such as database connection timeout details, V8 syntax errors, or stack exceptions), `error.message` is returned to the client in production, aiding attackers during reconnaissance.

#### Remediation Patch
In production, mask generic 500 errors to a sanitized message:
```javascript
const isProduction = process.env.NODE_ENV === 'production';
res.status(error.statusCode || 500).json({
  success: false,
  error: (isProduction && (!error.statusCode || error.statusCode === 500))
    ? 'An unexpected error occurred. Please try again later.'
    : (error.message || 'Internal Server Error'),
});
```

---

### [SEC-VAPT-010] Rich Text Editor Link Insertion Protocol Validation & Reverse Tabnabbing

- **Severity**: **LOW** (CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:N/A:N — Base Score: **3.1**)
- **CWE**: [CWE-1022](https://cwe.mitre.org/data/definitions/1022.html) (Use of Web Link to Untrusted Target with Window.Opener Access)
- **OWASP Category**: A03:2021 — Injection
- **Affected Files**: [`client/src/components/editor/RichTextEditor.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/components/editor/RichTextEditor.jsx#L559), [`client/src/utils/sanitize.js`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/utils/sanitize.js#L18)

#### Vulnerability Description & Mechanics
`insertLink` prompts for a URL and invokes `document.execCommand('createLink', false, url)`. If an author enters an external link, anchor tags must explicitly enforce `rel="noopener noreferrer"` to prevent the target page from accessing `window.opener` (reverse tabnabbing).

#### Remediation Patch
Configure DOMPurify hook in `sanitize.js` to automatically inject `rel="noopener noreferrer"` on all outbound links:
```javascript
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if ('target' in node) {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
```

---

### [SEC-VAPT-011] Supply Chain Dependency Advisory: React Router Open Redirect (CVE-2025-68470)

- **Severity**: **LOW** (CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N — Base Score: **3.1**)
- **CWE**: [CWE-601](https://cwe.mitre.org/data/definitions/601.html) (URL Redirection to Untrusted Site)
- **OWASP Category**: A06:2021 — Vulnerable and Outdated Components
- **Affected File**: [`client/package.json`](file:///home/amit.bora/Downloads/ai/Omnilog/client/package.json#L17) (`react-router-dom@^6.23.1`)

#### Remediation Patch
Update `react-router-dom` in `client/package.json` to the latest non-breaking patch release:
```bash
npm --prefix client install react-router-dom@^6.28.0
```

---

## 4. Hardening Blueprint & Priority Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Remediation Roadmap                             │
├──────────┬─────────────────────────────┬───────────────────────────────┤
│ Priority │ Target Areas                │ Key Actions                   │
├──────────┼─────────────────────────────┼───────────────────────────────┤
│ P0 (Now) │ Auth & Secret Hardening     │ • Remove token from OAuth URL │
│          │                             │ • Throw on missing JWT_SECRET │
│          │                             │ • Enforce CSRF Origin check   │
├──────────┼─────────────────────────────┼───────────────────────────────┤
│ P1 (24h) │ DoS & Input Validation      │ • Regex escaping (ReDoS fix)  │
│          │                             │ • Query param type validation │
│          │                             │ • Global API rate limiting    │
├──────────┼─────────────────────────────┼───────────────────────────────┤
│ P2 (48h) │ Defense-in-Depth & Privacy  │ • Mask prod 500 error strings │
│          │                             │ • Enforce rel="noopener" hook │
│          │                             │ • Update react-router-dom     │
└──────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## 5. Verification & Testing Methodology

All remediations must be verified using the following test suite:
1. **Automated Unit & Integration Tests**: `npm --prefix server test` (all 53 tests must pass).
2. **Security Regression Tests**:
   - Verify `?search=(` returns HTTP 200 with empty array (or 400 validation error), never 500.
   - Verify `?tag[$ne]=null` is treated as a clean string or rejected with 400, never 500.
   - Verify `GET /api/posts` returns rate limiting headers `ratelimit-limit`.
   - Verify unauthenticated Google OAuth callback redirects to `/dashboard` without `?token=`.
   - Verify production startup fails if `JWT_SECRET` is unset or set to weak default.
