# Visual Parity Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the visual gaps between the migrated React frontend and the original Next.js
site that the user spotted via screenshot comparison: real logo image (not text), hero video
background, "Verify" nav link, and a chat widget button. Assets (`logo.png`, `hero.mp4`, favicons)
already copied into `frontend/public/`.

**Architecture:** Pure presentational changes to existing components — `Navbar`, `PageHero`
(hero section lives inline in `HomePage.tsx`), no new pages/routes/API calls.

**Tech Stack:** No new dependencies — native `<video>` tag, static asset references.

---

## File Structure

```
frontend/public/
  images/{logo.png, ARX.png, favicon*.png, favicon.ico, apple-touch-icon.png}   (already copied)
  video/hero.mp4                                                                (already copied)
frontend/src/
  components/layout/Navbar.tsx    (MODIFY: logo image, Verify link)
  pages/HomePage.tsx              (MODIFY: video background in hero section)
  components/ChatWidget.tsx       (NEW: floating chat button, matches nextjs/components/WhatsAppButton.tsx)
  App.tsx                          (MODIFY: mount ChatWidget globally)
  index.html                       (MODIFY: favicon links)
```

---

### Task 1: Logo + Verify nav link + favicon

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx`
- Modify: `frontend/index.html`

- [ ] **Step 1: Replace the text logo with the real logo image in `Navbar.tsx`**

Replace:
```tsx
        <Link to="/" className="text-lg font-bold">
          ARX Infotech
        </Link>
```
with:
```tsx
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="ARX Infotech" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block font-bold text-navy-900">ARX INFOTECH</span>
            <span className="block text-[10px] text-gray-500 tracking-wide">
              AI Powered Smart Innovation Company
            </span>
          </span>
        </Link>
```

- [ ] **Step 2: Add "Verify" as a standalone highlighted link in `Navbar.tsx`**

The `NAV_LINKS` array stays as the regular nav items. Add a separate Verify button after the
`<ul>` (desktop) closing tag, inside the same flex container as the logo/menu-button row:

```tsx
        <Link
          to="/verify"
          className="hidden md:inline-block bg-gold-400 text-navy-900 text-sm font-bold px-4 py-2 rounded hover:bg-gold-500"
        >
          Verify
        </Link>
```

Add `{ to: "/verify", label: "Verify" }` to the mobile menu's `<ul>` rendering too (the
`menuOpen &&` block) so mobile users can reach it — either add it to `NAV_LINKS` conditionally
or just add one more `<li>` in that block matching the existing pattern.

- [ ] **Step 3: Wire up the favicon in `frontend/index.html`**

Replace the default Vite favicon `<link>` with:
```html
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
    <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
```

- [ ] **Step 4: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/Navbar.tsx frontend/index.html
git commit -m "Add real logo image, Verify nav link, and favicon to Navbar"
git push origin main
```

---

### Task 2: Hero video background

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Replace the hero section's gradient background with a video background**

Change the hero `<section>` from:
```tsx
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="container mx-auto px-4 py-24">
```
to:
```tsx
      <section className="relative min-h-[80vh] flex items-center bg-navy-900 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/20" />
        <div className="relative z-10 container mx-auto px-4 py-24">
```

(Only the opening `<section>`/wrapper markup changes — the `<div className="max-w-3xl">` and
everything inside it stays exactly as-is, just now sitting inside the new `relative z-10`
wrapper instead of the old plain container div.)

- [ ] **Step 2: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Manual verification**

Start Vite (`npm run dev`), visit `/`, confirm the hero section now shows the video playing
behind the text (muted, looping, autoplay) instead of a flat gradient. If no browser is
available, at minimum confirm the built `dist/` output references `/video/hero.mp4` correctly
and that the file is served (`curl -I http://localhost:5173/video/hero.mp4` should return `200`
with `Content-Type: video/mp4`).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "Add hero video background to HomePage, matching original site"
git push origin main
```

---

### Task 3: Chat widget button

**Files:**
- Create: `frontend/src/components/ChatWidget.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write `frontend/src/components/ChatWidget.tsx`**

A floating WhatsApp-style button, matching `nextjs/components/WhatsAppButton.tsx`'s visible
behavior (fixed bottom-right circular button linking to WhatsApp), hidden on `/admin/*` and
`/exam/*` routes:

```tsx
import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const WHATSAPP_NUMBER = "918317818107";

export default function ChatWidget() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/exam")) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
```

- [ ] **Step 2: Mount it globally in `frontend/src/App.tsx`**

Add the import:
```tsx
import ChatWidget from "@/components/ChatWidget";
```

Render it as a sibling of `<Layout>`, inside `<AuthProvider>`:
```tsx
    <AuthProvider>
      <Layout>
        <Routes>
          {/* ...unchanged... */}
        </Routes>
      </Layout>
      <ChatWidget />
    </AuthProvider>
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ChatWidget.tsx frontend/src/App.tsx
git commit -m "Add floating WhatsApp chat widget button"
git push origin main
```

---

## Self-Review Notes

- **Scope:** Purely presentational — no new routes, no new API calls, no backend changes.
  Matches exactly the 4 gaps the user pointed out from their screenshot comparison (logo, Verify
  nav link, hero video, chat widget) — nothing more, nothing less.
- **Assets:** `logo.png`, `ARX.png`, favicons, and `hero.mp4` already copied from
  `nextjs/public/` into `frontend/public/` before this plan was written — verified present at
  `frontend/public/images/` and `frontend/public/video/`.
- **No placeholders:** every step has complete, runnable code.
