# OmniLog — AI Agent Operational Guidelines

This document serves as an authoritative operating manual for any **AI coding agent** (Google Antigravity, Claude Code, Cursor, GitHub Copilot, etc.) working on the **OmniLog** codebase.

---

## 1. Prime Directives & Constraints

Any AI agent interacting with this repository MUST adhere to these strict constraints:

1. **Pure JavaScript Only (Zero TypeScript)**:
   - **Frontend**: React.js with pure JavaScript JSX (`.jsx` and `.js`).
   - **Backend**: Node.js + Express with pure JavaScript (`.js` using ES Modules).
   - **DO NOT** introduce TypeScript (`.ts`, `.tsx`), `tsconfig.json`, or TypeScript compiler dependencies.
2. **Never Commit Secrets or Plaintext Credentials**:
   - Never write real API keys, passwords, or connection strings into git-tracked files.
   - Use `.env.example` templates; read values exclusively from `process.env` (backend) or `import.meta.env` (frontend).
3. **Always Update Documentation After Every Operation (Strict Rule)**:
   - Documentation integrity is a first-class requirement. Never finish an operation without updating the corresponding living documents in `/docs`:
     - If you add, alter, or remove an API endpoint, update [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).
     - If you add or modify environment variables or setup steps, update [`docs/DEVELOPMENT.md`](./DEVELOPMENT.md) and [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md).
     - If you add, remove, or modify UI components, layout structures, or pages, update [`docs/DESIGN.md`](./DESIGN.md).
     - If you modify test suites or add test coverage, update [`docs/TESTING.md`](./TESTING.md).
     - If you fix a bug or resolve an issue, record the resolution in [`docs/BUGS.md`](./BUGS.md).
     - If domain entities, feature matrices, or roadmap scope change, update [`docs/PROJECT.md`](./PROJECT.md).
4. **Mandatory Security Hygiene**:
   - Always sanitize any rendered HTML using `DOMPurify`.
   - Always validate incoming payload bodies on the backend.
   - Check post ownership (`req.user._id.toString() === post.author.toString()`) or Super Admin privileges (`req.user.role === 'admin'`) before permitting updates or deletes.

---

## 2. Repository Landmarks

```
omnilog/
├── client/                     # Frontend (React.js + Vite + JSX)
│   ├── src/
│   │   ├── api/                # Network requests (fetch / axios)
│   │   ├── components/         # Reusable React components (.jsx)
│   │   ├── context/            # React context providers (AuthContext.jsx)
│   │   ├── pages/              # Route view pages (.jsx)
│   │   ├── utils/              # Sanitization & formatters (.js)
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # Entry DOM mounting
│   ├── index.html
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express + ESM)
│   ├── src/
│   │   ├── config/             # DB & Passport setup (.js)
│   │   ├── controllers/        # Express route handlers (.js)
│   │   ├── middleware/         # Auth guards, error handlers (.js)
│   │   ├── models/             # Mongoose 8 models (.js)
│   │   ├── routes/             # API route definitions (.js)
│   │   ├── utils/              # Helpers & JWT (.js)
│   │   └── app.js              # Express app initialization (.js)
│   └── tests/                  # Integration test suites (.test.js)
├── docs/                       # Living Documentation Suite
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── DESIGN.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── BUGS.md
│   └── AGENT_GUIDELINES.md     # THIS FILE
├── render.yaml                 # Render Blueprint specification
├── vercel.json                 # Vercel SPA routing rules
└── package.json                # Root monorepo workspace orchestration
```

---

## 3. Required Verification Checklist for AI Agents

Before finishing any task, the agent MUST run and verify the following commands:

```bash
# 1. Verify backend tests pass with 0 errors
npm test

# 2. Verify frontend builds cleanly with 0 errors
npm run build

# 3. Check git status to ensure no unintended files or secrets were modified
git status

# 4. Verify that corresponding documentation in /docs has been updated to reflect code changes
```

---

## 4. Common Agent Pitfalls to Avoid

- **Do NOT re-introduce Handlebars or SSR**: The legacy `.hbs` templates in `views/` are preserved only for historical reference during the migration. All new development takes place in `client/` and `server/`.
- **Do NOT use `Story.remove()`**: Modern Mongoose uses `Post.findByIdAndDelete()` or `Post.deleteOne()`.
- **Do NOT bypass CORS or Helmet**: Keep security headers active; configure allowed origins rather than disabling CORS.
- **Do NOT use synchronous blocking file operations in server endpoints**: Use asynchronous methods (`async/await`) for all database and I/O tasks.
