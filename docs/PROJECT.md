# OmniLog — Project Documentation

Welcome to **OmniLog**, a modern, multi-purpose publishing and knowledge-sharing platform. OmniLog is engineered for all forms of writing—from technical deep-dives, developer changelogs, and coding tutorials with syntax-highlighted code snippets, to personal essays, creative reflections, and private journals.

---

## 1. Project Mission & Vision

The original legacy platform ("Stories") was constrained to single-purpose creative stories and tied to a server-side rendered monolithic template engine.

**OmniLog** broadens this vision into an open, versatile, and high-performance publishing platform:
- **Universal Expression**: Seamlessly format and present complex code snippets alongside rich prose.
- **Categorization & Discovery**: Multi-tag taxonomy (`#tech`, `#devlog`, `#personal`, `#tutorial`, `#notes`) allowing readers and authors to filter content instantly.
- **Decoupled Architecture**: High-speed, responsive React.js frontend connected to a secure, modular Node.js REST API.
- **Cloud Native**: Zero-friction, cost-effective deployments on modern cloud platforms like **Vercel** (Global Edge CDN for React) and **Render** (Containerized/Managed Web Services for Node.js API).

---

## 2. Target Personas & Use Cases

| Persona | Core Needs | Typical Post Types |
| :--- | :--- | :--- |
| **Software Engineers & DevOps** | Clean syntax highlighting, inline code blocks, monospace typography, architectural breakdowns. | Architecture decisions, debugging logs, release notes, system post-mortems, how-to guides. |
| **Technical Writers & Students** | Structured headings, step-by-step formatting, bookmarking, estimated reading times. | In-depth tutorials, study notes, book summaries, framework comparisons. |
| **Personal Bloggers & Journalers** | Clean, distraction-free reading typography, draft management, privacy controls (`public` vs `private`). | Life updates, career reflections, travel diaries, private thoughts. |

---

## 3. Core Domain Entities

### `User`
Represents an authenticated author or reader on the platform:
- **`id`**: Unique MongoDB ObjectID.
- **`googleId`**: Unique Google OAuth subject identifier.
- **`displayName`**: Public-facing name (e.g., "Amit Bora").
- **`firstName` / `lastName`**: Extracted from Google Profile.
- **`email`**: User's verified email address.
- **`avatar`**: URL to user profile picture.
- **`bio`**: Short personal bio or headline.
- **`role`**: Authorization level: `'user'` or `'admin'` (whitelisted via `ADMIN_EMAILS` or managed in admin console).
- **`status`**: Account status: `'active'` or `'suspended'`.
- **`createdAt` / `updatedAt`**: Account creation and modification timestamps.

### `Post`
Represents an article, tutorial, log, or story:
- **`id`**: Unique MongoDB ObjectID.
- **`title`**: Post headline (required, 3-200 characters).
- **`body`**: Rich text HTML content with embedded code blocks, headers, and formatting.
- **`excerpt`**: Automatically generated plain-text snippet for preview cards (~160 chars).
- **`tags`**: Array of lowercase categorization strings (e.g., `["tech", "javascript", "react"]`).
- **`status`**: Visibility state: `'public'` (visible in feed) or `'private'` (visible only to the author).
- **`readingTime`**: Estimated reading time in minutes (calculated dynamically based on word count).
- **`author`**: Reference to the `User` who created the post.
- **`createdAt` / `updatedAt`**: ISO timestamps.

---

## 4. Feature Matrix

| Feature | Legacy Version | OmniLog (Revamp) |
| :--- | :--- | :--- |
| **Frontend Architecture** | Handlebars SSR templates (`.hbs`) | Modern React.js (Vite + JSX + Tailwind CSS) |
| **Backend Architecture** | Express monolith serving HTML | Clean Node.js REST API returning JSON |
| **Content Domain** | "Stories" only | Any content: Technical dev logs, tutorials, personal blogs |
| **Code Highlighting** | None (basic textarea/CKEditor 4) | Native code blocks with syntax highlighting |
| **Categorization** | None | Multi-tag system (`#tech`, `#devlog`, `#personal`, etc.) |
| **Authentication** | Stateful session cookies in MongoDB | Stateless JWT via `HttpOnly` Secure cookies (Single Sign-On with Google) |
| **Administration** | None | Unified Super Admin Console (`/admin`): Publications & User Management with live refresh |
| **Security / XSS** | Vulnerable (unescaped `{{{story.body}}}`) | Strict sanitization with `DOMPurify` + Helmet |
| **Responsive UI** | Materialize CSS 1.0 (legacy) | Custom responsive UI built with Tailwind CSS |
| **Cloud Deployment** | Hard to deploy to static CDNs | Vercel (Frontend) + Render (API & Database) |
| **Documentation** | None | Full in-repo living docs in `/docs` |

---

## 5. Future Roadmap

1. **Phase 1 (Current Scope)**: Full revamp to decoupled React + Node.js REST API, tag filtering, code block highlighting, living docs, Render/Vercel deployment readiness.
2. **Phase 2**: Post bookmarking, author follower system, comment threads on public posts.
3. **Phase 3**: Full Markdown import/export, dark/light theme switcher, image upload to Cloudinary/S3.
4. **Phase 4**: RSS feed generation (`/feed.xml`) and SEO OpenGraph dynamic card generation.
