# OmniLog — Testing Strategy & Quality Assurance

This document defines the automated testing strategy, execution instructions, test suites, and quality standards for **OmniLog**.

---

## 1. Testing Pyramid & Principles

OmniLog employs an automated testing strategy designed for rapid feedback and regression prevention:

```
        ▲
       / \         E2E Tests (Playwright / Cypress)
      /   \        - Full browser user flows (Login -> Write -> Publish -> View)
     /─────\
    /       \      Integration Tests (Jest + Supertest)
   /         \     - REST API Endpoints, Auth Guards, Mongoose Queries
  /───────────\
 /             \   Unit Tests (Jest / Vitest)
/               \  - Reading Time Calculator, Tag Sanitizer, Date Formatters
─────────────────
```

- **Integration First**: The primary focus is on API Integration Tests using **Supertest** and an in-memory/test MongoDB instance to verify endpoints, auth guards, ownership validation, and database operations.
- **Pure JavaScript**: All test specifications are written in pure JavaScript (`.test.js`).
- **Deterministic**: Tests do not rely on third-party external networks (Google OAuth is mocked during test runs).

---

## 2. Test Suites Overview (47 Tests Across 5 Suites)

### 1. Health & System Tests (`server/tests/health.test.js`)
- `GET /api/health`: Asserts that the server returns `HTTP 200` with status `OK`, active database connectivity, and uptime telemetry.

### 2. Core Auth & Publication Tests (`server/tests/auth_and_posts.test.js`)
- **Unauthenticated Guards**: Verifies that protected routes return `HTTP 401 Unauthorized` when no token or cookie is supplied.
- **Invalid Tokens**: Verifies that malformed or expired JWTs are rejected.
- **User Profile (`GET /api/auth/me`)**: Validates that passing a valid JWT returns the authenticated user object.
- **Logout (`POST /api/auth/logout`)**: Verifies that the JWT cookie is cleared with appropriate expiration headers.
- **Public Feed & Tag Filtering**: Asserts that public posts are returned, private posts belonging to other authors are excluded, and tag filters operate accurately.
- **Post Author Operations**: Creates, updates, and deletes author posts while preventing unauthorized modification by other authors.

### 3. User Management Tests (`server/tests/user_management.test.js`)
- **Super Admin RBAC Guard**: Verifies that non-admin and unauthenticated requests to `/api/users` are rejected with `HTTP 403 Forbidden` / `HTTP 401 Unauthorized`.
- **List & Filter Users**: Tests pagination, role filter (`admin` vs `user`), status filter (`active` vs `suspended`), and text search across names and emails.
- **Create User**: Verifies manual user account provisioning with required validation.
- **Update Role & Status**: Tests account role promotion/demotion and suspension toggle.
- **Cascade Delete**: Verifies that deleting a user account automatically cascades to delete all posts authored by that user.

### 4. Admin CRUD Overrides & Scope Tests (`server/tests/admin_crud.test.js`)
- **Administrative Override**: Validates that Super Admins can update or delete any publication across the platform regardless of who authored it.
- **Console Scope Query**: Verifies `GET /api/posts/my-posts` behavior:
  - `?scope=mine`: Filters exclusively to posts authored by the admin.
  - `?scope=all` or default: Returns all publications across the entire system.

### 5. Utility Unit Tests (`server/tests/utils.test.js`)
- **Reading Time Calculation**: Verifies accurate words-per-minute estimation.
- **Tag Normalization**: Verifies whitespace trimming, lowercase conversion, and duplicate removal.
- **Excerpt Generation**: Validates clean text extraction without HTML tag leakage.
- **JWT Helper Utilities**: Verifies token signing, verification, and decoding.

---

## 3. Running Automated Tests

### Run Backend API Tests
From the project root:
```bash
# Run all server integration tests
npm test

# Run tests in watch mode
npm --prefix server test -- --watch

# Run tests with code coverage report
npm --prefix server test -- --coverage
```

### Run Client Tests / Build Verification
```bash
# Verify client build succeeds with zero bundle errors
npm run build
```

---

## 4. Test Data Fixtures & Mocking

During integration testing, Google OAuth is mocked using test helper utilities:

```javascript
// server/tests/helpers/authHelper.js
import jwt from 'jsonwebtoken';

export const createTestUser = async (User) => {
  return await User.create({
    googleId: 'test-google-id-12345',
    displayName: 'Test Developer',
    firstName: 'Test',
    lastName: 'Developer',
    email: 'test.developer@example.com',
    image: 'https://example.com/avatar.png'
  });
};

export const generateTestToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'test_secret_key',
    { expiresIn: '1h' }
  );
};
```

---

## 5. Continuous Integration (CI) Standards

A pull request or agent commit is considered verified when:
1. All automated tests pass with `0` failures.
2. The client builds cleanly with `npm run build`.
3. Code formatting adheres to the repository's ESLint standards.
4. No secrets or credentials are hardcoded in test files.
