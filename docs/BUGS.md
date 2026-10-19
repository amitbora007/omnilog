# OmniLog — Bug Tracking & Vulnerability Triage

This document tracks known issues, security vulnerabilities triaged from the legacy application, resolution history, and templates for reporting new bugs.

---

## 1. Legacy Vulnerability & Debt Triage

During the architectural audit of the legacy Handlebars application, the following critical issues were identified and scheduled for remediation in OmniLog:

| Issue ID | Severity | Description in Legacy Codebase | Remediation in OmniLog | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | **Critical** | **Stored Cross-Site Scripting (XSS)**: Handlebars templates rendered raw unescaped HTML (`{{{story.body}}}`) directly from CKEditor without sanitization. | Replaced CKEditor 4 with modern editor; all rendered HTML is sanitized with `DOMPurify` before DOM injection. | **RESOLVED** |
| **SEC-002** | **High** | **Committed Credentials**: Active MongoDB Atlas URI and Google OAuth client credentials were committed to git in `config/config.env`. | Scrubbed credentials; introduced `.env.example` templates; added strict `.gitignore` rules. | **RESOLVED** |
| **SEC-003** | **High** | **Hardcoded Session Secret**: Fallback secret `'first node application'` was hardcoded in `app.js`. | Replaced with cryptographically secure `JWT_SECRET` loaded strictly from environment variables. | **RESOLVED** |
| **SEC-004** | **Medium** | **Lack of Security Headers**: No HTTP security headers were configured on the Express server. | Integrated `helmet` middleware across all routes. | **RESOLVED** |
| **SEC-005** | **Medium** | **Missing Rate Limiting**: Authentication and post creation routes were unprotected against brute-force or spamming. | Implemented `express-rate-limit` on sensitive API endpoints. | **RESOLVED** |
| **DEP-001** | **High** | **Deprecated Mongoose Method**: Used `Story.remove()` which was deprecated and removed in modern Mongoose. | Upgraded to Mongoose 8.x using `findByIdAndDelete()`. | **RESOLVED** |
| **DEP-002** | **Medium** | **End-of-Life CKEditor 4**: Injected from CDN; version 4.16.2 reached official EOL with unpatched vulnerabilities. | Migrated to pure modern JavaScript rich-text and code block editing. | **RESOLVED** |
| **DEP-003** | **Low** | **Deprecated Moment.js**: Legacy helper used `moment` for timestamp formatting. | Replaced with native JavaScript `Intl.DateTimeFormat` and modern lightweight formatting. | **RESOLVED** |
| **NET-001** | **High** | **Atlas ECONNRESET on Node 22**: Node 22 TLS 1.3 ClientHello packet exceeds standard MTU (1507 bytes vs 1500), causing firewalls/proxies to reset socket (`write:errno=104`). | Enforced `NODE_OPTIONS=--tls-max-v1.2` in `server/package.json` and enriched Mongoose error reporting in `db.js`. | **RESOLVED** |
| **UI-001** | **Medium** | **Broken Google Profile Images**: Google User Content CDN (`lh3.googleusercontent.com`) returns 429/403 when receiving localhost/third-party `Referer` headers; missing error handler broke UI. | Created resilient `Avatar.jsx` with `referrerPolicy="no-referrer"` and automatic `onError` fallback to styled initials monogram with deterministic color gradients. | **RESOLVED** |
| **BUG-001** | **High** | **API Route 404 on Vercel**: Client made requests to `/auth/me` and `/posts` instead of `/api/...` because `VITE_API_URL` was configured without the `/api` route prefix. | Documented and configured `VITE_API_URL` with `/api` suffix (`https://omnilog-api.onrender.com/api`). | **RESOLVED** |
| **BUG-002** | **Medium** | **"My Posts Only" Scope Ignored**: Calling `postsApi.getMyPosts('mine')` passed a string instead of `{ scope: 'mine' }`, resulting in query omission and displaying all system posts. | Updated `postsApi.getMyPosts` to accept either string or object option format; added immediate state re-fetching. | **RESOLVED** |
| **BUG-003** | **Low** | **Redundant 401 Console Errors on Guest Load**: `checkAuth()` unconditionally called `GET /api/auth/me` even when unauthenticated guest visitors had no token. | Guarded `checkAuth()` to check `localStorage` first, added token auto-purge on 401, and enabled `{ silent: true }` auth checks. | **RESOLVED** |
| **BUG-004** | **Medium** | **Admin vs Google OAuth Role Discrepancy**: Backend `sendTokenResponse` stripped `role` and `status` from the user response, preventing admin console visibility on mock login. | Added `role` and `status` to `sendTokenResponse`; subsequently cleaned up and unified entire authentication onto Google OAuth 2.0. | **RESOLVED** |
| **BUG-005** | **High** | **Account Deactivation Login Bypass & Missing Alert Banner**: Inactive/suspended user accounts could attempt authentication without clear feedback or redirection. | Enforced 403 Forbidden with support message across backend auth handlers; added high-visibility obsidian alert banner in `Layout.jsx` and URL query sanitization in `AuthContext.jsx`. | **RESOLVED** |
| **BUG-006** | **Medium** | **H2 Heading Underlines & List Revert Failure**: Editor H2 headings had unwanted horizontal divider borders from CSS (`border-b border-white/10`); native `formatBlock '<p>'` could not revert headings nested inside lists or empty blocks. | Removed border styles in `index.css`; implemented range-aware DOM tag analysis (`getSelectedTagElements`) and custom deterministic unwrap engine in `RichTextEditor.jsx`. | **RESOLVED** |
| **BUG-007** | **High** | **Editor Page `ReferenceError: useMemo is not defined`**: Navigating to `/posts/new` or `/posts/edit/:id` threw uncaught ReferenceError because `useMemo` was omitted from React import during dead code cleanup. | Re-imported `useMemo` alongside `{ useState, useEffect, useRef }` in `client/src/pages/EditorPage.jsx`. | **RESOLVED** |
| **BUG-008** | **Medium** | **Editor Format Buttons Inactive & Single Enter Line Collapse**: Bold, Italic, and List buttons had no active highlight state. Typing a single Enter in editor collapsed two lines into one in preview because `'div'` was omitted from DOMPurify's `ALLOWED_TAGS`. | Added dynamic `activeFormats` state tracking `queryCommandState` in `RichTextEditor.jsx`; added `'div'` to `ALLOWED_TAGS` in `sanitize.js`, set `defaultParagraphSeparator` to `'p'`, and styled `.post-content div`. | **RESOLVED** |
| **BUG-009** | **High** | **Contact Form Submission "Objects are not valid as a React child"**: React 18 / 19 version mismatch between client and server packages caused `@react-email/render` to fail on Vercel/Render deployments, returning a 500 error object that broke client UI. | Unified monorepo on `react@18.3.1` and `react-dom@18.3.1`; implemented inline HTML fallback in `ContactEmail.js`; added defensive error string guards in `client.js` and `ContactSection.jsx`. | **RESOLVED** |
| **BUG-010** | **Medium** | **Vite Monolithic Bundle (>500 kB) Build Warning**: Bundling `highlight.js` (950 kB) and all pages synchronously generated a 1,315 kB initial bundle that exceeded Rollup limits and slowed initial load. | Configured Rollup `manualChunks` in `vite.config.js` isolating `vendor-highlight`, `vendor-react`, `vendor-purify`, `vendor-icons`; lazy loaded secondary routes. Shrank entry chunk by 97.8% (to 28 kB). | **RESOLVED** |
| **BUG-011** | **High** | **Critical & High Transitive Dependency CVEs**: `npm audit` flagged critical `proxy-addr` CIDR parsing vulnerability, `passport-oauth2` state bypass, `morgan` log injection, and `braces`/`micromatch` ReDoS. | Added npm `overrides` in root `package.json`; updated Express, Helmet, Morgan, and DOMPurify. Achieved 0 production vulnerabilities (`npm audit --omit=dev`). | **RESOLVED** |
| **BUG-012** | **High** | **Mobile Initial Load Black Screen & High Cellular Latency**: Empty `<div id="root"></div>` left mobile users on cellular connections staring at a pitch-black screen for 3-6s. Google Fonts stylesheet was render-blocking; landing page had double network waterfall; 3D canvas caused GPU/CPU contention. | Implemented instant in-HTML app shell and splash skeleton in `<div id="root">` (< 50ms FCP); converted Google Fonts to non-blocking preload; eagerly imported `LandingPage`; optimized mobile canvas (18 particles, disabled `shadowBlur`). | **RESOLVED** |

---

## 2. Active Bug Register

| Bug ID | Title | Component | Severity | Discovered | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *No active unresolved bugs at this time.* | All systems operational; 6/6 test suites and 53/53 tests passing. | Monorepo | — | 2026-10-19 | **CLEAN** | All reported issues (BUG-001 through BUG-012) resolved. |

---

## 3. Bug Report Template

When a developer or AI agent discovers an issue in OmniLog, record it below using this format:

```markdown
### [BUG-XXX] Short Title

- **Severity**: Critical | High | Medium | Low
- **Component**: `server` | `client` | `docs` | `deployment`
- **Environment**: Local (Node v22) | Render | Vercel | Production
- **Discovered Date**: YYYY-MM-DD
- **Reporter**: [Name / Agent ID]

#### Description
Clear explanation of what went wrong and expected vs actual behavior.

#### Steps to Reproduce
1. Navigate to `/posts/new`
2. Enter title "..."
3. Click Submit without filling body
4. Observe unhandled promise rejection

#### Root Cause
Explain the underlying code flaw (e.g., missing validation check in `postController.js`).

#### Proposed Fix / Resolution
Detail the fix and the test added to prevent regression.
```
