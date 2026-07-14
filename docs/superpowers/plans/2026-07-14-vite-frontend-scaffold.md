# Vite Frontend Scaffold (Milestone 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the React + Vite project in `/frontend` — build tooling, React Router route
tree (stub pages, no real content yet), a shared layout (Navbar/Footer), an Axios API client
wired to the Django backend, and an auth route-guard for `/admin/*`. Real page content ports
happen in Milestones 5-6; this milestone only needs to build, route, and talk to the backend.

**Architecture:** Vite + React 18 + TypeScript, React Router v6 for client routing, Axios with
`withCredentials: true` for session-cookie auth against the Django backend (matches Milestone
2's session/CSRF setup), Tailwind CSS (the styling system the ported pages will actually use —
Bootstrap is also present in the Next.js app but only for a handful of legacy pages/exam
widgets, deferred to whichever later milestone ports those specific pages). A `RequireAuth`
component wraps `/admin/*` routes, replacing `nextjs/middleware.ts`.

**Tech Stack:** Node 22, Vite 5, React 18, TypeScript, react-router-dom v6, axios, Tailwind CSS v3.

---

## Note on scope

Builds on Milestones 1-3 (Django backend, fully done: 16 models, content API, exam API, all
pushed). This milestone does NOT port real page content — `nextjs/app/*/page.tsx` components
stay untouched as reference material for Milestones 5 (public pages) and 6 (admin CMS pages).
Every route in this plan renders a placeholder `<div>` with the page name, proving the route
tree and layout work end-to-end.

## File Structure

```
frontend/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  index.html
  .env.example
  .gitignore
  src/
    main.tsx
    App.tsx
    index.css
    lib/
      api.ts
    hooks/
      useAuth.tsx
    components/
      layout/
        Layout.tsx
        Navbar.tsx
        Footer.tsx
      RequireAuth.tsx
    pages/
      HomePage.tsx
      AboutPage.tsx
      ServicesPage.tsx
      PortfolioPage.tsx
      TeamPage.tsx
      BlogListPage.tsx
      BlogPostPage.tsx
      ContactPage.tsx
      VerifyPage.tsx
      exam/
        ExamRegisterPage.tsx
        ExamPage.tsx
        ExamResultPage.tsx
      admin/
        AdminLoginPage.tsx
        AdminDashboardPage.tsx
      NotFoundPage.tsx
  tailwind.config.js
  postcss.config.js
```

---

### Task 1: Vite project scaffold + tooling

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/.env.example`
- Create: `frontend/.gitignore`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`

- [ ] **Step 1: Scaffold via Vite's official template (non-interactive)**

Run from the repo root:
```bash
cd frontend
npm create vite@latest . -- --template react-ts
```
This generates the baseline `package.json`, `vite.config.ts`, `tsconfig.json`,
`tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, and
`.gitignore`. Some of these get overwritten by later steps in this task — that's expected.

- [ ] **Step 2: Install the extra dependencies this project needs**

Run:
```bash
npm install react-router-dom axios
npm install -D tailwindcss@3 postcss autoprefixer
```

- [ ] **Step 3: Initialize Tailwind config**

Run: `npx tailwindcss init -p`

This creates `frontend/tailwind.config.js` and `frontend/postcss.config.js`. Overwrite
`frontend/tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 4: Replace `frontend/src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Overwrite `frontend/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 6: Create `frontend/.env.example`**

```env
VITE_API_BASE_URL=http://localhost:8000
```

Copy to `.env` for local dev: `cp .env.example .env` (Vite dev server runs on :5173 by default,
matching the `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` defaults already set in
`backend/config/settings.py`).

- [ ] **Step 7: Verify `frontend/.gitignore` excludes build/dependency output**

Confirm it has at least `node_modules`, `dist`, and `.env` (Vite's default template already
includes `node_modules` and `dist` — add `.env` if not already present, keep `.env.example`
tracked).

- [ ] **Step 8: Delete Vite's default template cruft**

Remove the files Vite's template ships that this project doesn't use:
```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```
(These get replaced by this plan's own `App.tsx` in Task 2 and don't need placeholder assets.)

- [ ] **Step 9: Verify the dev server boots**

Run: `npm run build`
Expected: builds successfully (will fail at this point only if `src/App.tsx` still references
deleted assets — Task 2 replaces `App.tsx` entirely, so a transient failure here is fine as
long as Task 2 fixes it immediately after; if you prefer, do a quick sanity `npm run dev` and
Ctrl+C instead of a full build, since `App.tsx` isn't rewritten until Task 2).

- [ ] **Step 10: Commit**

```bash
cd D:\code\GITHUB\ARX_Pro
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/tsconfig*.json frontend/index.html frontend/.env.example frontend/.gitignore frontend/src/main.tsx frontend/src/index.css frontend/tailwind.config.js frontend/postcss.config.js
git commit -m "Scaffold Vite + React + TypeScript + Tailwind frontend project"
git push origin main
```

---

### Task 2: API client + auth hook

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/hooks/useAuth.tsx`

- [ ] **Step 1: Write `frontend/src/lib/api.ts`**

```typescript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

export async function ensureCsrfCookie(): Promise<void> {
  await api.get("/api/auth/csrf/");
}
```

- [ ] **Step 2: Write `frontend/src/hooks/useAuth.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ensureCsrfCookie } from "@/lib/api";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await ensureCsrfCookie();
        const response = await api.get<AuthUser>("/api/auth/me/");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    await ensureCsrfCookie();
    const response = await api.post<AuthUser>("/api/auth/login/", { username, password });
    setUser(response.data);
  }

  async function logout() {
    await api.post("/api/auth/logout/");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
```

- [ ] **Step 3: Add the `@/` path alias**

Vite's `react-ts` template doesn't ship a path alias by default. Add one so `@/lib/api` etc.
resolve. Overwrite `frontend/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

And add the matching path to `frontend/tsconfig.json`'s `compilerOptions` (add these two keys
alongside the existing ones, don't remove anything Vite generated):

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 4: Verify it type-checks**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors (there's no `App.tsx` referencing these yet, but the files themselves must
type-check standalone).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/hooks/useAuth.tsx frontend/vite.config.ts frontend/tsconfig.json
git commit -m "Add Axios API client with CSRF handling and auth context"
git push origin main
```

---

### Task 3: Route tree + placeholder pages

**Files:**
- Create: `frontend/src/pages/HomePage.tsx`
- Create: `frontend/src/pages/AboutPage.tsx`
- Create: `frontend/src/pages/ServicesPage.tsx`
- Create: `frontend/src/pages/PortfolioPage.tsx`
- Create: `frontend/src/pages/TeamPage.tsx`
- Create: `frontend/src/pages/BlogListPage.tsx`
- Create: `frontend/src/pages/BlogPostPage.tsx`
- Create: `frontend/src/pages/ContactPage.tsx`
- Create: `frontend/src/pages/VerifyPage.tsx`
- Create: `frontend/src/pages/exam/ExamRegisterPage.tsx`
- Create: `frontend/src/pages/exam/ExamPage.tsx`
- Create: `frontend/src/pages/exam/ExamResultPage.tsx`
- Create: `frontend/src/pages/admin/AdminLoginPage.tsx`
- Create: `frontend/src/pages/admin/AdminDashboardPage.tsx`
- Create: `frontend/src/pages/NotFoundPage.tsx`
- Create: `frontend/src/components/RequireAuth.tsx`
- Overwrite: `frontend/src/App.tsx`

- [ ] **Step 1: Write the 14 placeholder page components**

Each page follows this exact pattern (shown once; repeat for every file below with the matching
name substituted). Example for `frontend/src/pages/HomePage.tsx`:

```tsx
export default function HomePage() {
  return <div className="p-8">HomePage placeholder</div>;
}
```

Create every one of these files with that same pattern, substituting the component name and the
placeholder text to match:

- `frontend/src/pages/HomePage.tsx` — `HomePage`
- `frontend/src/pages/AboutPage.tsx` — `AboutPage`
- `frontend/src/pages/ServicesPage.tsx` — `ServicesPage`
- `frontend/src/pages/PortfolioPage.tsx` — `PortfolioPage`
- `frontend/src/pages/TeamPage.tsx` — `TeamPage`
- `frontend/src/pages/BlogListPage.tsx` — `BlogListPage`
- `frontend/src/pages/ContactPage.tsx` — `ContactPage`
- `frontend/src/pages/VerifyPage.tsx` — `VerifyPage`
- `frontend/src/pages/exam/ExamRegisterPage.tsx` — `ExamRegisterPage`
- `frontend/src/pages/exam/ExamPage.tsx` — `ExamPage`
- `frontend/src/pages/exam/ExamResultPage.tsx` — `ExamResultPage`
- `frontend/src/pages/admin/AdminLoginPage.tsx` — `AdminLoginPage`
- `frontend/src/pages/admin/AdminDashboardPage.tsx` — `AdminDashboardPage`
- `frontend/src/pages/NotFoundPage.tsx` — `NotFoundPage` (text: "404 - Page not found")

`BlogPostPage` is the one exception — it reads the `:slug` route param, to prove dynamic routes
work:

```tsx
// frontend/src/pages/BlogPostPage.tsx
import { useParams } from "react-router-dom";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  return <div className="p-8">BlogPostPage placeholder - slug: {slug}</div>;
}
```

- [ ] **Step 2: Write `frontend/src/components/RequireAuth.tsx`**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || !user.is_staff) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
```

- [ ] **Step 3: Overwrite `frontend/src/App.tsx`**

```tsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import TeamPage from "@/pages/TeamPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import VerifyPage from "@/pages/VerifyPage";
import ExamRegisterPage from "@/pages/exam/ExamRegisterPage";
import ExamPage from "@/pages/exam/ExamPage";
import ExamResultPage from "@/pages/exam/ExamResultPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/exam/register" element={<ExamRegisterPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/exam/result" element={<ExamResultPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Verify it builds and type-checks**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev` (starts on :5173)

In a browser (or via `curl http://localhost:5173/`, `curl http://localhost:5173/about`, etc. —
note client-side routing means curl only validates the server responds with the SPA shell, not
the actual rendered route; a real browser check is more meaningful here), visit a few routes:
`/`, `/about`, `/blog/hello-world`, `/admin` (should redirect to `/admin/login` since not
authenticated), `/nonexistent` (should show the 404 page). Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages frontend/src/components/RequireAuth.tsx frontend/src/App.tsx
git commit -m "Add route tree with placeholder pages and admin auth guard"
git push origin main
```

---

### Task 4: Shared layout (Navbar/Footer)

**Files:**
- Create: `frontend/src/components/layout/Navbar.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/components/layout/Layout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write `frontend/src/components/layout/Navbar.tsx`**

A minimal, functional nav — not the final styled version (that's a Milestone 5/6 concern once
real content/assets are ported), but real enough to prove active-route highlighting and mobile
toggle work:

```tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/blog", label: "Blog" },
  { to: "/team", label: "Team" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          ARX Infotech
        </Link>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <ul className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={
                  location.pathname === link.to ? "font-semibold text-blue-600" : "text-gray-700"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {menuOpen && (
        <ul className="flex flex-col gap-2 px-4 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Write `frontend/src/components/layout/Footer.tsx`**

```tsx
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t bg-gray-50 py-8 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} ARX Infotech. All rights reserved.</p>
    </footer>
  );
}
```

- [ ] **Step 3: Write `frontend/src/components/layout/Layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Wire `Layout` into `App.tsx`**

Modify `frontend/src/App.tsx`: import `Layout` from `@/components/layout/Layout`, and wrap the
`<Routes>` element with it, inside `<AuthProvider>`:

```tsx
import Layout from "@/components/layout/Layout";
```

```tsx
    <AuthProvider>
      <Layout>
        <Routes>
          {/* ...unchanged route list from Task 3... */}
        </Routes>
      </Layout>
    </AuthProvider>
```

- [ ] **Step 5: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev`. Visit `/` and `/about` in a browser — confirm the navbar renders with links,
clicking a link navigates without a full page reload, and the footer renders below the page
content. Visit `/admin/login` — confirm neither navbar nor footer render (both hide on
`/admin/*`, matching the original Next.js `Navbar`'s `pathname.startsWith("/admin")` check).
Stop the dev server after checking.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout frontend/src/App.tsx
git commit -m "Add shared Navbar/Footer layout with admin-route hiding"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** Matches the design spec's frontend architecture section — Vite + React 18 +
  TS + React Router + Axios, route tree mirroring `nextjs/app/`'s structure exactly (including
  `/exam/*` and `/admin/*`), route-guard replacing `middleware.ts`. Tailwind chosen as the
  primary styling system per the spec's note that both Tailwind and Bootstrap are present in the
  original app — this milestone doesn't need Bootstrap since no real page content (which is
  where Bootstrap classes actually appear, e.g. in the exam PHP pages) is ported yet.
- **Type/name consistency:** `useAuth()`'s `AuthUser` shape (`id`, `username`, `email`,
  `is_staff`) matches `apps.accounts.views._user_payload()`'s exact response shape from
  Milestone 2 — verified against `backend/apps/accounts/views.py`. `ensureCsrfCookie()` hits
  `/api/auth/csrf/`, matching Milestone 2's `CsrfView`. Login/logout/me paths
  (`/api/auth/login/`, `/api/auth/logout/`, `/api/auth/me/`) match Milestone 2's
  `apps/accounts/urls.py` route names exactly.
- **No placeholders in the "no placeholders" sense:** the *pages* are intentionally placeholder
  content (that's this milestone's explicit, stated scope — proving routing/layout/auth work,
  not porting real content), but every step has complete, runnable code — no TBDs, no
  hand-waved implementation.
