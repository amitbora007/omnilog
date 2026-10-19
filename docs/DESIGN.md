# OmniLog — 3D Spatial UI/UX Design System & Style Guide

This document defines the design philosophy, design tokens, component anatomy, 3D spatial interaction patterns, and accessibility specifications for **OmniLog**.

---

## 1. Design Philosophy

OmniLog is built using the combined principles of **UI/UX Pro Max** and **Frontend Design**, elevated to a **next-generation 3D spatial tech platform**:
- **Obsidian Spatial Depth & Cyberpunk Precision**: An obsidian dark space canvas (`#030712`) enriched with multi-layered acrylic glassmorphism, dynamic glowing gradients, and subtle spatial borders inspired by modern developer platforms like Linear, Vercel, Supabase, and Stripe.
- **Ultra-Performance 3D Interaction (Zero Three.js Bloat)**: Achieves 60–120 FPS high-refresh rate animations via native HTML5 Canvas 2D particle physics and hardware-accelerated CSS 3D transforms (`preserve-3d`, `perspective(1000px)`). No heavy 3D engine bundles; bundle size remains ultra-compact.
- **Content-First Technical Typography**: Dual-font architecture with **Plus Jakarta Sans** for high-comfort reading and UI authority, paired with **JetBrains Mono** for code blocks, syntax highlights, tags, and data telemetry.
- **Distraction-Free Reading & Authoring**: Long-form article reading view ergonomically capped at `< 75ch` line-length with a real-time top scroll reading progress bar and floating interaction dock; studio-grade dual-mode editor canvas with live word counts, reading metrics, and dark syntax previews.
- **Zero Layout Shifts**: Obsidian shimmer skeleton loaders (`Skeleton.jsx`) across post cards, data tables, and article views eliminate jarring layout shifts on data load.
- **Resilient Media & Accessibility**: Fully accessible with `:focus-visible` keyboard rings, WCAG 2.1 AA compliant text contrast, defensive image handling (`Avatar.jsx`), and strict respect for `prefers-reduced-motion` and background tab battery saving (`visibilitychange`).

---

## 2. Design Tokens & Color Palette

OmniLog uses semantic tokens configured in `client/tailwind.config.js` and `client/src/index.css`:

### Primary Brand & Cosmic Palette
- **Cosmic Canvas**: Obsidian Dark `#030712` (Cosmic 950: `#030712`, Cosmic 900: `#080e1e`, Cosmic 800: `#0f172a`)
- **Brand Primary**: Indigo 500 (`#6366f1`, hover: `#4f46e5`, active: `#4338ca`)
- **Cosmic Accents**: Cyan 400 (`#22d3ee`), Violet 500 (`#8b5cf6`), Fuchsia 500 (`#d946ef`)
- **Success / Live Status**: Emerald 400 (`#34d399`, background: `rgba(16, 185, 129, 0.12)`, border: `rgba(16, 185, 129, 0.4)`)
- **Warning / Draft Status**: Amber 400 (`#fbbf24`, background: `rgba(245, 158, 11, 0.12)`, border: `rgba(245, 158, 11, 0.4)`)
- **Danger / Destructive**: Rose 500 (`#f43f5e`, hover: `#e11d48`, background: `rgba(244, 63, 94, 0.12)`)

### Glassmorphism & Depth Tokens
- `.glass-panel`: `background: rgba(15, 23, 42, 0.65)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`
- `.glass-card`: `background: rgba(15, 23, 42, 0.55)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255, 255, 255, 0.07)`
- `.glass-dock`: Floating navigation and action bar with `background: rgba(8, 14, 30, 0.8)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.12)`
- `.glow-indigo`: `box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.35)`
- `.glow-cyan`: `box-shadow: 0 0 40px -10px rgba(34, 211, 238, 0.35)`
- `.glow-violet`: `box-shadow: 0 0 40px -10px rgba(139, 92, 246, 0.35)`
- `.glass-inner`: Inner specular highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`

### Monospace & Code Palette
- **Code Container**: Deep Navy / Slate 950 (`#030712` / `#080e1e`) with border `rgba(255, 255, 255, 0.08)`
- **Code Text**: Slate 100 (`#f1f5f9`) in `JetBrains Mono`
- **Inline Code**: Background `rgba(99, 102, 241, 0.15)`, Text `indigo-300`, border `rgba(99, 102, 241, 0.3)`

---

## 3. Typography Scale

| Role | Font Family | Tailwind Classes | Usage |
| :--- | :--- | :--- | :--- |
| **Hero Title / H1** | Plus Jakarta Sans | `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white` | Landing Page Hero |
| **Section Title / H2** | Plus Jakarta Sans | `text-2xl sm:text-3xl font-extrabold text-white tracking-tight` | Feed stream, dashboard headers |
| **Card Title / H3** | Plus Jakarta Sans | `text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400` | PostCard titles, modal titles |
| **Body Large** | Plus Jakarta Sans | `text-lg text-slate-300 leading-relaxed` | Hero subtitles, post lead paragraphs |
| **Body Regular** | Plus Jakarta Sans | `text-base text-slate-300 leading-relaxed` | Article body text, descriptive copy |
| **Caption / Labels** | Plus Jakarta Sans | `text-xs font-semibold text-slate-400` | Secondary metadata, button labels |
| **Technical / Code** | JetBrains Mono | `font-mono text-xs sm:text-[13.5px] leading-relaxed` | Code snippets, tags, dates, metric counts |

---

## 4. 3D Spatial & Interactive Architecture

### 1. Interactive Constellation Canvas (`InteractiveBackground.jsx`)
- **Native HTML5 2D Canvas**: Renders a dynamic network of 65 floating particle nodes with simulated 3D z-axis depth scaling (`0.4` to `1.2`).
- **Celestial Scroll Parallax**: Integrates real-time scroll delta tracking. When the user scrolls, each particle translates vertically proportional to its z-depth (`p.y -= scrollDelta * p.z * 0.45`), causing foreground nodes to rush past while distant background stars drift slowly.
- **Ambient Aura Translation**: Background radial gradient glow orbs translate along the Y-axis at differentiated rates (`-0.15x`, `0.1x`, `-0.08x`) to produce atmospheric spatial parallax.
- **Interactive Gravitational Field**: Tracks mouse cursor coordinates; particles within an 80px radius gently pull toward the cursor, creating organic interaction.
- **Proximity Mesh Connections**: Dynamically draws connecting laser filaments with alpha opacity mapped to node distance (`dist < 110px`).
- **Performance Guards**:
  - Automatically queries `window.matchMedia('(prefers-reduced-motion: reduce)')` to render static particles without requestAnimationFrame cycling.
  - Listens to `document.addEventListener('visibilitychange')` to halt RAF loop when the user switches browser tabs, saving CPU and laptop battery.
  - Responsive window resize handling with pixel ratio (`devicePixelRatio`) support.

### 2. GPU-Accelerated Multi-Plane Parallax (`ParallaxLayer.jsx`)
- **Hardware-Accelerated Compositing**: Transforms children via `translate3d(0, y, 0)` with `will-change: transform`, operating strictly on the GPU compositor thread without triggering layout recalcs or paint reflows.
- **Zero Scroll-Jacking**: Adheres strictly to UI/UX Pro Max accessibility rules—native browser scroll mechanics are 100% preserved without artificial momentum hijacking.
- **Direct Style Mutation**: Listens passively to window scroll and updates element style transforms inside `requestAnimationFrame` without React state churn (maintaining 120 FPS).
- **Reduced Motion Fallback**: Detects `prefers-reduced-motion: reduce` and completely suppresses all parallax offsets.

### 3. Specular 3D Tilt Card (`Card3D.jsx`)
- **Hardware-Accelerated Perspective**: Wraps elements in `transform-style: preserve-3d; perspective: 1000px`.
- **Dynamic Tilt Physics**: Maps mouse position on the card to `rotateX` and `rotateY` angles (default max `10deg`).
- **Specular Spotlight Overlay**: Dynamically renders a radial gradient specular highlight (`rgba(255, 255, 255, 0.08)`) that tracks the cursor point across the card surface.
- **Zero React Re-render Overhead**: Bypasses React state by directly updating DOM element transforms inside RAF and mouse events, ensuring stutter-free 120 FPS rendering.

### 4. Floating Frosted Navigation Dock (`Navbar.jsx`)
- **Floating Pill Dock**: Anchored at `top-4 inset-x-0 mx-auto max-w-7xl` with `backdrop-blur-xl bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-glass`.
- **Cosmic Brand Mark**: Glowing indigo-cyan gradient icon with pulse effect.
- **Active Route Highlighting**: Active tabs highlighted with glowing pill indicators and hover neon accents.
- **Dark Profile Dropdown**: Frosted acrylic user profile dropdown with administrative badges, direct console deep-links, and clean logout triggers.

### 5. Multi-Plane Hero & Asymmetric 2-Column Split (`LandingPage.jsx`)
- **Elimination of Side Void via 2-Column Grid (`lg:grid-cols-12 max-w-7xl`)**:
  - **Left Column (`lg:col-span-6`)**: Contains the left-aligned hero headline, descriptive value proposition copy, Google OAuth / Feed CTAs, and performance telemetry pill badges.
  - **Right Column (`lg:col-span-6`)**: Hosts the interactive 3D Hero Showcase ([`HeroShowcase.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/components/landing/HeroShowcase.jsx)) inside a specular tilt card (`Card3D`). Features 3 interactive tabs:
    - **Reader Experience**: Live article reading simulation with dynamic scroll progress bar (78%), author metadata badge, syntax-highlighted code block with line numbers, and interactive tag chips.
    - **Author Studio**: Live animated simulated typing into an obsidian editor canvas with dynamic word counts and floating formatting pills (`H2`, `Code`, `Quote`).
    - **Engine Telemetry**: Live performance telemetry cards displaying sub-50ms FCP, 87.5 kB modular highlight bundle (-90.8%), 53/53 tests passing, TLS 1.2 security, and Gzip response compression.
- **Layered Parallax Hierarchy**:
  - Cosmic ambient auroras: `speed: -0.2` (atmospheric counter-drift).
  - Main headline and subtitle: `speed: 0.05` (smooth float).
  - Floating tech telemetry badges: `speed: -0.05` (subtle counter-balance).
  - Synchronized Value Pillars: Unified row parallax (`speed: 0.04`) and `items-stretch` CSS grid enforcing 100% equalized card heights, widths, and seamless vertical alignment across all viewports.
- **Progressive Batch Publication Feed**:
  - Landing page renders an initial batch of 3 featured publications followed by a dynamic "Load More" action button with live remaining count indicator.

### 6. Wide Responsive Feed Stream & Sticky Community Sidebar (`FeedPage.jsx`)
- **2-Column Responsive Layout (`max-w-7xl mx-auto`)**:
  - **Main Stream Column (`lg:col-span-8`)**:
    - Full-width glass search and tag filter bar with active tag removal chip.
    - **Dual-Mode Feed View**: Readers can toggle between:
      - **Infinite Stream**: Seamless continuous scroll powered by an `IntersectionObserver` sentinel, loading successive pages as the reader approaches the viewport bottom.
      - **Paginated Feed**: Discrete page-by-page browsing with numbered page pills (`[1] [2]...`), Previous/Next buttons, live range display, and instant smooth scroll-to-top on page change.
    - Balanced 2-column card grid (`sm:grid-cols-2`) with `React.memo(PostCard)` memoization for high-framerate rendering during filter operations.
  - **Right Sticky Sidebar (`lg:col-span-4`)**:
    - **Community Spotlight Card**: 3D tilt card encouraging engineering contributions with fast CTAs.
    - **Featured Topics Cloud**: Interactive pill badges with real-time tag filtering.
    - **Platform Engine Specifications**: Monospace live telemetry showing core stack (React 18, DOMPurify, CSS 3D Shaders, OAuth 2.0).

### 7. Editorial Reading View with Sticky Companion (`PostViewPage.jsx`)
- **Full-Width 2-Column Reading Experience (`max-w-7xl`)**:
  - **Left Reading Column (`lg:col-span-8`)**: Back link to publications, article header with author metadata, sanitized article content (`.post-content`), and bottom author bio card.
  - **Right Sticky Companion Sidebar (`lg:col-span-4 hidden lg:block`)**:
    - **Reading Status Widget**: Real-time numerical and visual scroll progress meter (`% completed`), estimated read time, and direct share action button.
    - **Author Spotlight Widget**: Author profile image, name, email, and bio.
    - **Security & Sanitization Verification**: DOMPurify XSS protection, Highlight.js shading, and WCAG 2.1 AA indicators.
- **Top Reading Progress Bar**: Fixed top horizontal progress bar (`h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500`) calculating live scroll position.

### 8. Authoring Studio Workspace (`EditorPage.jsx` & `RichTextEditor.jsx`)
- **2-Column Studio Layout (`max-w-7xl`)**:
  - **Writing Canvas (`lg:col-span-8`)**: Prominent publication title input and expansive RichTextEditor canvas supporting rich text, code snippets, and markdown.
    - **Clean Heading Typography**: Removed bottom border lines (`border-b border-white/10`) from `.post-content h2`, providing clean, modern heading typography without horizontal divider lines appearing across the canvas or on empty lines.
    - **Robust Reversible Formatting Toggles**: `H2`, `H3`, and `Blockquote` tools feature intelligent DOM-aware 2-way toggle states (`toggleFormatBlock`). Powered by `getSelectedTagElements`, the system accurately detects single blocks, selections spanning multiple headings, and list items. Clicking an active heading or blockquote cleanly unwraps lists without corruption and converts all headings (including empty lines) back into standard `<p>` paragraphs. Active toolbar buttons highlight dynamically with `bg-indigo-600 text-white shadow-glow-indigo`.
    - **Normal Font Content Indentation & Outdentation**: Dedicated `Indent` (`>≡`) and `Outdent` (`<≡`) tools adjust structural indentation via direct `margin-left` styling, strictly maintaining standard upright (non-italic) font styles without polluting text with unintended blockquote italic styling.
    - **Snippet Tools Section**: Cohesive toolbar group with `Snippet` inserter and `Format` auto-formatter.
    - **Contextual Snippet Floating Badge**: Floating `[ Snippet ] [ Format Code ]` quick-action badge attached directly to active code blocks in the canvas for instant one-click beautification.
    - **Multi-Language Auto-Formatter (`codeFormatter.js`)**: Automatically parses, cleans, and indents code blocks across JavaScript, TypeScript, JSON, HTML/XML, CSS, and Python without modifying surrounding text.
  - **Right Studio Sidebar (`lg:col-span-4`)**:
    - **Publishing Controls Card**: Primary "Publish / Save" button with loading spinner, status indicator, and exit trigger.
    - **Visibility Selector**: Glowing emerald "Public Live" vs amber "Private Draft" selector cards.
    - **Taxonomy Tags Card**: Tag input with one-click suggested tag chips (`+architecture`, `+backend`, `+redis`).
    - **Live Writing Telemetry**: Real-time word count calculation and estimated read time.

### 9. Author Cockpit (`DashboardPage.jsx`)
- **Author-Exclusive Access**: Dedicated strictly to standard authors. If an authenticated administrator navigates to `/dashboard`, they are automatically redirected to the centralized Super Admin Console (`/admin`).
- **KPI Metrics Deck**: 3 glowing cards (Total Publications, Public Live, Private Drafts) with custom gradient iconography spanning `max-w-7xl`.
- **Frosted Glass Table**: Dark obsidian data table with search filtering, status tabs, and action icons.
- **Integrated Table Pagination (`DataTablePagination.jsx`)**: 10 items per page with live range indicator (`Showing X to Y of Z entries`), numbered page buttons, and Previous/Next bounds handling.
- **Delete Modal Confirmation**: Glassmorphism confirmation dialog preventing accidental publication loss.

### 10. Unified Super Admin Console (`AdminPage.jsx`) & Role-Exclusive Navigation
- **Role-Exclusive Navigation Architecture**:
  - **Administrators**: The navigation dock (`Navbar.jsx`), user avatar dropdown, and mobile navigation drawer exclusively display **Admin Dashboard** (`/admin`). The separate "Author Dashboard" / "My Dashboard" is hidden for admins to avoid duplication.
  - **Standard Authors**: Display **Author Dashboard** (`/dashboard`) in desktop/mobile navigation and **My Dashboard** in the user dropdown.
  - **Contextual Post Authoring**: In [`EditorPage.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/pages/EditorPage.jsx) and [`PostViewPage.jsx`](file:///home/amit.bora/Downloads/ai/Omnilog/client/src/pages/PostViewPage.jsx), back links and post deletion redirects dynamically navigate to `/admin` for administrators and `/dashboard` for standard authors.
- **Dual Tab Deep-Linking**: URL-synchronized switching (`?tab=posts` ↔ `?tab=users`) supporting `/admin/posts` and `/admin/users` across `max-w-7xl`.
- **Dual Table Pagination (`DataTablePagination.jsx`)**:
  - **Publications Table**: Responsive pagination handling large story catalogs with real-time scope switching (`All Posts` vs `My Posts Only`).
  - **User Accounts Table**: Paginated user management table with role and status badges, search filtering, and instant page resetting on query changes.
- **Live Data Refresh Controls**: Frosted glass refresh buttons with animated spinning loading indicators for real-time data sync without full page reload.
- **System Metrics Deck**: Live system statistics across publications and registered users.
- **Obsidian Administrative Modals**: Create User, Edit User, Delete User (with cascade deletion warning count), and Delete Publication modals styled in acrylic obsidian glass.

### 11. Authentication Feedback & Deactivated Account Notice System
- **Acrylic Obsidian Alert Banner (`Layout.jsx`)**:
  - Rendered directly beneath the navigation dock across the standard `max-w-7xl` container.
  - Styled in dark obsidian rose acrylic (`bg-rose-950/40 border-rose-500/30 text-rose-200`) with subtle backdrop-blur and glowing AlertCircle icon.
  - Displays the exact customer support notice: `"Your account is deactivated, please contact customer support."`.
  - Includes a sleek dismiss (X) button with smooth interactive transitions.
- **Dual-Surface Feedback via Toasts (`Toast.jsx`)**:
  - Automatically triggers a high-visibility, 7-second persistent error toast notification on initial load.
- **Seamless URL State Sanitation**:
  - When the OAuth callback redirects to `/?error=...`, `AuthContext` parses and decodes the message, stores it in state, and promptly sanitizes the browser address bar via `window.history.replaceState({}, document.title, window.location.pathname)`. This prevents error messages from sticking or re-appearing on manual page refreshes.

---

## 5. Accessibility (a11y) & Performance Conformance

- **WCAG 2.1 AA Contrast**: All body text maintains a contrast ratio > 4.5:1 against surfaces; primary headings maintain > 7:1.
- **Visible Keyboard Navigation**: Explicit `:focus-visible:ring-2 focus-visible:ring-indigo-500` outlines applied across all interactive controls (buttons, links, inputs).
- **Reduced Motion Respect**: Automatically detects `prefers-reduced-motion: reduce` across canvas, CSS animations, and Card3D tilt physics.
- **Tab Inactivity Pause**: Background HTML5 canvas loop pauses immediately when tab visibility changes (`document.hidden`), conserving CPU and battery life.
- **Zero Heavy 3D Dependencies**: Zero Three.js or WebGL bloat; pure native HTML5 Canvas 2D + CSS 3D transforms.
