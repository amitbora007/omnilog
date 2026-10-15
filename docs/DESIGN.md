# OmniLog — UI/UX Design System & Style Guide

This document defines the design philosophy, design tokens, component anatomy, layout patterns, and accessibility specifications for **OmniLog**.

---

## 1. Design Philosophy

OmniLog is built using the combined principles of **UI/UX Pro Max** and **Frontend Design**:
- **Enterprise SaaS Precision**: High-precision contrast, subtle borders, disciplined depth hierarchy, and purposeful whitespace inspired by products like Linear, Supabase, and Vercel.
- **Content-First Technical Typography**: Dual-font architecture with **Plus Jakarta Sans** for high-comfort reading and UI authority, paired with **JetBrains Mono** for code blocks, syntax highlights, tags, and data metrics.
- **Distraction-Free Reading & Authoring**: Long-form article reading view ergonomically capped at `< 75ch` line-length to reduce eye fatigue; dual-mode writing canvas with real-time word counting, reading time estimates, and dark-theme syntax previews.
- **Zero Layout Shifts**: Fluid shimmer skeleton loaders (`Skeleton.jsx`) across post cards, data tables, and article views eliminate jarring layout shifts on data load.
- **Resilient Media & Accessibility**: Fully accessible with `:focus-visible` keyboard rings, WCAG 2.1 AA compliant text contrast, and defensive image handling (`Avatar.jsx`) preventing broken avatar placeholders.

---

## 2. Design Tokens & Color Palette

OmniLog uses semantic tokens mapped to Tailwind CSS:

### Primary Brand Palette
- **Brand Primary**: Indigo 600 (`#4f46e5`, hover: `#4338ca`, active: `#3730a3`)
- **Brand Accent / Subtitle Gradient**: Indigo to Violet (`#4f46e5` → `#7c3aed`)
- **Success / Live Status**: Emerald 600 (`#059669`, background: `#ecfdf5`, border: `#a7f3d0`)
- **Warning / Draft Status**: Amber 600 (`#d97706`, background: `#fffbeb`, border: `#fde68a`)
- **Danger / Destructive**: Rose 600 (`#e11d48`, hover: `#be123c`, background: `#fff1f2`)

### Neutral Grayscale
- **Background Body**: Slate 50 (`#f8fafc`)
- **Card / Surface**: Pure White (`#ffffff`) with subtle border `#e2e8f0`
- **Text Headings**: Slate 900 (`#0f172a`)
- **Text Body**: Slate 700 (`#334155`, contrast ratio > 7:1)
- **Text Muted / Captions**: Slate 500 (`#64748b`)
- **Borders & Dividers**: Slate 200/80 (`#e2e8f0`)

### Code & Monospace Palette
- **Code Container**: Deep Navy / Slate 950 (`#0b0f19`) with border `#1e293b`
- **Code Text**: Slate 100 (`#f1f5f9`) in `JetBrains Mono`
- **Inline Code**: Background `slate-100` (`#f1f5f9`), Text `indigo-600` (`#4f46e5`), border `slate-200/70`

### Shadows & Elevation
- `shadow-xs`: Subtle card boundary (`0 1px 2px 0 rgba(0, 0, 0, 0.04)`)
- `shadow-card`: Card baseline (`0 1px 3px 0 rgba(15, 23, 42, 0.06)`)
- `shadow-card-hover`: Elevated card on hover (`0 12px 24px -6px rgba(15, 23, 42, 0.08)`)
- `shadow-dropdown`: Floating popovers and toasts (`0 10px 25px -5px rgba(15, 23, 42, 0.1)`)

---

## 3. Typography Scale

| Role | Font Family | Tailwind Classes | Usage |
| :--- | :--- | :--- | :--- |
| **Hero Title / H1** | Plus Jakarta Sans | `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]` | Landing Page Hero |
| **Section Title / H2** | Plus Jakarta Sans | `text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight` | Feed stream, dashboard headers |
| **Card Title / H3** | Plus Jakarta Sans | `text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600` | PostCard titles, modal titles |
| **Body Large** | Plus Jakarta Sans | `text-lg text-slate-600 leading-relaxed` | Hero subtitles, post lead paragraphs |
| **Body Regular** | Plus Jakarta Sans | `text-base text-slate-700 leading-relaxed` | Article body text, descriptive copy |
| **Caption / Labels** | Plus Jakarta Sans | `text-xs font-semibold text-slate-500` | Secondary metadata, button labels |
| **Technical / Code** | JetBrains Mono | `font-mono text-xs sm:text-[13.5px] leading-relaxed` | Code snippets, tags, dates, metric counts |

---

## 4. Reusable Component Anatomy

### 1. Avatar (`Avatar.jsx`)
- **Resilient Image Handling**: Sets `referrerPolicy="no-referrer"` so Google's User Content CDN (`lh3.googleusercontent.com`) does not reject cross-origin requests with HTTP 429/403.
- **Graceful Error Fallback**: Automatically captures `onError` events and smoothly renders a styled initials monogram instead of the browser's broken image icon.
- **Dynamic Gradients**: Applies deterministic pastel gradients (`from-indigo-100 to-indigo-200`, `from-emerald-100 to-emerald-200`, etc.) based on the author's name.

### 2. Button (`Button.jsx`)
- **Variants**: `primary` (indigo), `secondary` (white slate border), `outline` (clean stroke), `danger` (rose), `ghost` (transparent).
- **Wrapping Protection**: `whitespace-nowrap shrink-0` and explicit `min-h-[...]` bounds ensure button text and icons never wrap or stack into vertical lines.
- **Tactile Feedback**: Micro-interaction scale on press (`active:scale-[0.98]`).
- **Loading State**: Accessible inline spinner with `aria-hidden="true"`.
- **Focus Rings**: `:focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`.

### 3. Google Sign-In Button (`GoogleSignInButton.jsx`)
- **Google Identity Guidelines**: Official 4-color Google "G" SVG (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) on a clean card surface (`#ffffff`) with subtle border (`border-slate-300/90`).
- **Standardized Sizing**: Standard tokens `sm` (32px), `md` (40px), and `lg` (44px) matching Google branding dimensions and typography.
- **Micro-interactions**: Subtle hover state (`hover:bg-slate-50`), border darkening (`hover:border-slate-400`), and tactile press scale (`active:scale-[0.98]`).
- **Accessible State**: Screen-reader accessible loading spinner during authentication redirect.

### 4. Badge (`Badge.jsx`)
- **Variants**: `public` (emerald dot pulse), `private` (amber dot), `tag` (monospace `#` badge), `default` (slate neutral).
- **Interactive**: Supports `onClick` for filter triggers with active scale states.

### 5. Skeleton (`Skeleton.jsx`)
- **Shimmer Animation**: CSS keyframe gradient sweep (`animate-shimmer`).
- **Variants**: `PostCardSkeleton` (cards), `TableRowSkeleton` (dashboard tables), `ArticleSkeleton` (full reading view).

### 6. Toast System (`Toast.jsx`)
- **Context API**: `ToastProvider` and `useToast()` hook.
- **Non-blocking Notifications**: Bottom-right floating toasts with auto-dismiss (3.5s) for copied links, published stories, or errors.

### 7. Modal Dialog (`Modal.jsx`)
- **Accessibility**: Built with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="modal-title"`.
- **Keyboard Interaction**: Dismissible via `Escape` key, click outside backdrop, or dedicated close button.
- **Aesthetic**: `backdrop-blur-sm bg-slate-900/50` overlay.

### 8. Post Card (`PostCard.jsx`)
```
┌─────────────────────────────────────────────────────────────┐
│  [#tech] [#architecture]                            [3m]   │
│  Designing Fault-Tolerant Distributed Consensus             │
│  A deep dive into quorum replication, state machines,       │
│  and leader election in modern distributed databases...     │
│                                                             │
│  [Avatar] Amit Bora · Oct 14, 2026               Read ↗     │
└─────────────────────────────────────────────────────────────┘
```
- **Tag Badges**: Clickable monospace pills linking to filtered feeds.
- **Reading Time**: Clock icon with monospace duration (`~3m`).
- **Interactive Hover**: Card elevation transition (`shadow-card` to `shadow-card-hover`), title color shift, and arrow nudge on hover.

### 9. Rich-Text & Code Editor (`RichTextEditor.jsx`)
- **Grouped Toolbar**: Bold, Italic, H2, H3, Bullet List, Numbered List, Blockquote, Snippet Inserter, Link.
- **Mode Toggle**: Clean toggle between "Write" mode and live "Preview" mode with dark-theme syntax highlighting.
- **Status Bar**: Real-time word counter and estimated reading time calculator.

### 10. Author Console / Dashboard (`DashboardPage.jsx`)
- **Metric Cards**: Total Publications, Public Live, Private Drafts with trend badges.
- **Table Controls**: Search within author's posts, status tabs (All, Public, Drafts).
- **Action Buttons**: View (`ExternalLink`), Edit (`Edit3`), Delete (`Trash2`) with confirmation modal.

### 11. Unified Super Admin Console (`AdminPage.jsx`)
- **Dual Tab Architecture**: URL-synchronized switching (`?tab=posts` ↔ `?tab=users`) supporting deep-linking (`/admin/posts` and `/admin/users`).
- **Live Refresh Controls**: Dedicated table data refresh buttons with animated spinning loading indicators on both the Publications and User Management tabs.
- **Contextual Actions & Metrics**:
  - **Publications Tab**: Global metrics bar (Total Publications, Public Live, Private Drafts based on active scope), scope toggle (All System Posts vs My Posts Only), title/tag/author search, and administrative override actions.
  - **User Management Tab**: Global metrics bar (Total Users, Active Admins, Standard Users, Suspended Accounts), role filter tabs, user search, and `+ Create User` trigger.
- **Administrative Modals**:
  - *Create User Modal*: Manual user account creation with email, display name, role, and bio.
  - *Edit User Modal*: Account role promotion/demotion and suspension toggle with safety guards.
  - *Delete User Modal*: Cascade confirmation warning displaying live count of authored posts scheduled for deletion.
  - *Delete Publication Modal*: Permanent publication removal confirmation.

---

## 5. Accessibility (a11y) Conformance

- **WCAG 2.1 AA Contrast**: All body text maintains a contrast ratio > 4.5:1 against surfaces; primary headings maintain > 7:1.
- **Visible Keyboard Navigation**: Explicit `:focus-visible` outlines applied across all interactive controls (buttons, links, inputs).
- **Reduced Motion Respect**: CSS transitions and animations conform to user preferences.
- **Semantic Structure**: Proper Landmark elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
