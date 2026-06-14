# AGENTS.md — ARX Infotech Website

Agent instructions for working in this repository.

---

## Project Overview

**ARX Infotech** — IT services & tech solutions company, Kolkata, India.
Live site: `https://arxinfo.tech`

**Migration status:** Rebuild from static HTML/PHP → Next.js 15 (App Router) + Prisma + MySQL. Complete.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| Runtime | Node.js 22 (ESM) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 (primary) |
| Fonts | Poppins (headings) + Inter (body) via `next/font/google` |
| Animations | Framer Motion 12 + custom IntersectionObserver (`data-arx`) |
| Notifications | SweetAlert2 (confirm dialogs) + Toastr.js (success/error toasts) |
| State | React hooks (useState, useEffect) |
| Forms | React Hook Form 7 |
| DB | MySQL via Prisma 6 ORM |
| Cache | Redis via ioredis (`lib/redis.ts`) |
| Dark mode | next-themes (default: light, persisted via class on `<html>`) |
| Icons | Lucide React |

---

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup: Next.js init, Tailwind, Prisma, layout, global components | ✅ Done |
| 2 | MySQL schema + db push + seed | ✅ Done |
| 3 | Home page (all sections) | ✅ Done |
| 4 | About, Services, Contact, Verify pages + API routes | ✅ Done |
| 5 | Team, Portfolio, Blog pages | ✅ Done |
| 6 | Exam module — integrate external voucher-based exam site | 🔗 External |
| 7 | Exam admin dashboard — part of external exam site | 🔗 External |
| 8 | API routes (contact, verify) | ✅ Done |
| 9 | Final polish: animations, SEO metadata, sitemap, robots, 404, loading | ✅ Done |
| 10 | Admin dashboard — auth + overview + full CRUD for all sections | ✅ Done |

---

## Project Structure

```
arxinfo.tech/
├── app/
│   ├── globals.css                    # Tailwind base + custom utilities + data-arx keyframe animation CSS
│   ├── layout.tsx                     # Root layout — fonts, JSON-LD, AOSInit, Navbar, ConditionalFooter
│   ├── page.tsx                       # Home page — 8 section components
│   ├── not-found.tsx                  # Custom 404: navy bg, gold 404, back-home + contact
│   ├── loading.tsx                    # Global loading: gold spinner
│   ├── sitemap.ts                     # Dynamic sitemap: static routes + published blog slugs
│   ├── robots.ts                      # robots.txt: allow all, disallow /api/
│   ├── about/page.tsx                 # Who We Are, Vision/Mission, Core Strength, CTA
│   ├── services/page.tsx              # DB-driven: all active service cards + DB-driven pricing plans (PricingPlan model), What We Deliver, CTA
│   ├── contact/page.tsx               # async, contact info from DB (SiteContact) with fallback, ContactForm, Google Maps embed
│   ├── verify/page.tsx                # Trust badge + VerifyForm
│   ├── team/page.tsx                  # Team cards from DB (initials avatar + LinkedIn)
│   ├── portfolio/page.tsx             # Portfolio items with client-side category filter
│   ├── blog/page.tsx                  # Published blog listing
│   ├── blog/[slug]/page.tsx           # Single post + markdown renderer + generateMetadata
│   ├── admin/
│   │   ├── layout.tsx                 # Pass-through root layout (metadata + robots:noindex)
│   │   ├── login/page.tsx             # Standalone login form — no AdminShell wrapper
│   │   └── (shell)/
│   │       ├── layout.tsx             # AdminShell wrapper (sidebar + topbar)
│   │       ├── page.tsx               # Dashboard: stat cards + recent contacts table
│   │       ├── blog/page.tsx
│   │       ├── certificates/page.tsx
│   │       ├── contacts/page.tsx
│   │       ├── team/page.tsx
│   │       ├── portfolio/page.tsx
│   │       ├── services/page.tsx
│   │       ├── stats/page.tsx
│   │       ├── clients/page.tsx
│   │       ├── testimonials/page.tsx
│   │       ├── pricing/page.tsx
│   │       └── settings/page.tsx      # Site Settings: SiteContactForm + SocialLinksForm (two sections)
│   └── api/
│       ├── contact/route.ts           # POST → prisma.contact.create()
│       ├── verify/route.ts            # GET ?id= → prisma.certificate.findUnique()
│       └── admin/
│           ├── login/route.ts         # POST: verify env creds → set HTTP-only session cookie
│           ├── logout/route.ts        # POST: clear session cookie
│           ├── blog/route.ts + [id]/route.ts
│           ├── certificates/route.ts + [id]/route.ts
│           ├── contacts/[id]/route.ts
│           ├── team/route.ts + [id]/route.ts
│           ├── portfolio/route.ts + [id]/route.ts
│           ├── services/route.ts + [id]/route.ts
│           ├── stats/route.ts + [id]/route.ts
│           ├── clients/route.ts + [id]/route.ts
│           ├── testimonials/route.ts + [id]/route.ts
│           ├── pricing/route.ts + [id]/route.ts
│           ├── contact-info/route.ts  # GET + PUT (upsert id=1) for SiteContact
│           └── social-links/route.ts + [id]/route.ts  # CRUD for SocialLink — drives footer icons
├── components/
│   ├── Navbar.tsx                     # Fixed nav, transparent default, glassmorphism on scroll, links right-aligned, hidden on /admin/*
│   ├── Footer.tsx                     # async server component, 4-col footer, contact info from DB (SiteContact) with fallback; social icons from DB (SocialLink) with fallback to 4 defaults; data-platform attr drives hover colors via globals.css
│   ├── ConditionalFooter.tsx          # Client wrapper — hides Footer on /admin/* routes
│   ├── Preloader.tsx                  # Navy screen + logo.png + spinning gold arc + glow rings + bottom progress bar, fades at 1.8s
│   ├── WhatsAppButton.tsx             # Floating WhatsApp (bottom-right), hidden on /admin/*
│   ├── BackToTop.tsx                  # Gold chevron, appears after 400px scroll
│   ├── DarkModeToggle.tsx             # Sun/Moon toggle via next-themes
│   ├── AOSInit.tsx                    # Custom IntersectionObserver scroll reveal (no AOS lib)
│   ├── providers.tsx                  # ThemeProvider wrapper
│   ├── PageHero.tsx                   # Reusable page banner: full-opacity video bg, directional gradient overlay, tall (pt-48 pb-32), title+subtitle
│   ├── admin/
│   │   ├── AdminShell.tsx             # "use client", fixed sidebar nav + topbar + logout
│   │   ├── AdminModal.tsx             # Shared modal wrapper (wide prop for large forms)
│   │   ├── BlogTable.tsx              # Blog CRUD: slug auto-gen, markdown textarea, publish toggle
│   │   ├── CertificatesTable.tsx      # Cert CRUD: inline valid/revoke toggle
│   │   ├── ContactsTable.tsx          # Read-only inbox: expandable rows, delete
│   │   ├── TeamTable.tsx              # Team CRUD: initials avatar, order, active toggle
│   │   ├── PortfolioTable.tsx         # Portfolio CRUD: category select, featured toggle
│   │   ├── ServicesTable.tsx          # Services CRUD: icon select, image preview, active toggle
│   │   ├── StatsTable.tsx             # Stats CRUD: icon, target, suffix, label
│   │   ├── ClientsTable.tsx           # Clients CRUD: logo image or initials badge, marquee toggle
│   │   ├── TestimonialsTable.tsx      # Testimonials CRUD: star rating, avatar, active toggle
│   │   ├── PricingTable.tsx           # Pricing CRUD: name, tagline, price, period, badge label + color, highlight toggle, features (newline textarea → JSON), button label, order, active
│   │   ├── SiteContactForm.tsx        # "use client" form: address, phone, email, whatsapp, mapEmbed → PUT /api/admin/contact-info
│   │   └── SocialLinksForm.tsx        # "use client" CRUD table: platform select, label, URL, order, active → social-links API; "Load Defaults" seeds FB/Twitter/LinkedIn/Instagram
│   ├── contact/
│   │   └── ContactForm.tsx            # React Hook Form → POST /api/contact
│   ├── verify/
│   │   └── VerifyForm.tsx             # Certificate lookup → GET /api/verify?id=
│   ├── portfolio/
│   │   └── PortfolioGrid.tsx          # "use client", category filter tabs + project cards
│   └── home/
│       ├── HeroSection.tsx            # Full-screen full-opacity video bg, directional gradient overlay, Framer Motion entry, 2 CTAs. Badge text: "Trusted IT Partner" (no location suffix)
│       ├── WhyChooseSection.tsx        # Checklist left + navy stat box right
│       ├── ServicesSection.tsx         # DB-driven: first 3 services (take:3), image cards, icon badge overlay, "View All" → /services
│       ├── StatsCounter.tsx            # Server wrapper — fetches from DB, passes to client
│       ├── StatsCounterClient.tsx      # "use client" — animated counters (Framer useInView)
│       ├── WhatWeDeliverSection.tsx    # 2-col: IT Infra card + Dev/Automation card
│       ├── ClientsMarquee.tsx          # DB-driven: dual-row marquee, gradient fades, logo/initials
│       ├── TestimonialsSection.tsx     # DB-driven: quote icon, avatar/initials, hover effects
│       └── CTASection.tsx              # Navy rounded box, 2 action buttons
├── lib/
│   ├── db.ts                          # Singleton PrismaClient
│   ├── redis.ts                       # Singleton ioredis client (lazyConnect, REDIS_URL)
│   ├── utils.ts                       # cn() helper (clsx + tailwind-merge)
│   ├── markdown.tsx                   # renderMarkdown(): line-by-line MD→JSX
│   ├── admin-auth.ts                  # verifyCredentials(), getSessionSecret(), cookie constants
│   ├── admin-api-guard.ts             # isAdminAuthenticated(req) — used by all admin API routes
│   └── notify.ts                      # toast() (Toastr) + confirmDelete() + confirmAction() (SweetAlert2)
├── middleware.ts                      # Protects /admin/* → redirect to /admin/login (Edge-safe)
├── prisma/
│   ├── schema.prisma                  # 16 models: Contact, Certificate, BlogPost, TeamMember,
│   │                                  # PortfolioItem, Service, Stat, Client, Testimonial, PricingPlan,
│   │                                  # SiteContact, SocialLink, ExamAdmin, ExamQuestion, ExamCandidate, ExamResult, ExamVoucher
│   ├── seed.ts                        # Full reseed (DESTRUCTIVE) — never run on production
│   ├── seed-services.ts               # One-shot: seeds 6 services
│   └── seed-content.ts                # One-shot: seeds stats, clients, testimonials
├── public/
│   ├── images/                        # logo.png (used in Navbar + Preloader + Footer), favicons, og-banner.png
│   └── video/hero.mp4                 # Hero background video
├── next.config.ts                     # remotePatterns: allow all https images
├── tailwind.config.ts                 # Navy + Gold colors, font vars, marquee keyframes, container padding (1rem→1.5rem→3.75rem responsive)
├── tsconfig.json                      # strict, @/* alias → ./
├── postcss.config.mjs
├── .env                               # DATABASE_URL — read by Prisma CLI only (gitignored)
├── .env.local                         # DATABASE_URL + ADMIN_* + REDIS_URL (gitignored)
└── package.json
```

---

## Admin Dashboard

### Auth
- Middleware (`middleware.ts`) protects all `/admin/*` except `/admin/login`
- Session = HTTP-only cookie `arx_admin_session` whose value === `ADMIN_SESSION_SECRET`
- Login: POST `/api/admin/login` → verify username+password from env → set cookie
- Logout: POST `/api/admin/logout` → clear cookie

### Route structure
- `/admin/login` → `app/admin/login/page.tsx` — no shell (pass-through root layout)
- `/admin/*` → `app/admin/(shell)/<section>/page.tsx` — wrapped by AdminShell
- AdminShell is `fixed` sidebar; main content has `lg:pl-64` offset

### AdminShell sidebar nav
| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /admin | LayoutDashboard |
| Blog Posts | /admin/blog | FileText |
| Services | /admin/services | Layers |
| Certificates | /admin/certificates | BadgeCheck |
| Contacts | /admin/contacts | Mail |
| Team Members | /admin/team | Users |
| Portfolio | /admin/portfolio | Briefcase |
| Stats Counter | /admin/stats | BarChart3 |
| Clients | /admin/clients | Building2 |
| Testimonials | /admin/testimonials | MessageSquare |
| Pricing Plans | /admin/pricing | DollarSign |
| Site Settings | /admin/settings | Settings |

### Admin sections status
| Section | Features | Status |
|---------|----------|--------|
| Auth + login | env-var credentials, HTTP-only cookie | ✅ Done |
| Dashboard overview | stat cards + recent contacts table | ✅ Done |
| Blog posts | CRUD, slug auto-gen, markdown editor, publish/draft | ✅ Done |
| Certificates | CRUD, inline valid/revoke toggle | ✅ Done |
| Contacts | Read-only inbox, expandable rows, delete | ✅ Done |
| Team members | CRUD, initials avatar, order, active toggle | ✅ Done |
| Portfolio | CRUD, category select, featured toggle, auto-slug | ✅ Done |
| Services | CRUD, icon select, image URL + preview, active toggle | ✅ Done |
| Stats Counter | CRUD, icon, target number, suffix, label | ✅ Done |
| Clients (marquee) | CRUD, logo URL or initials badge, show/hide | ✅ Done |
| Testimonials | CRUD, star rating (0.5 step), avatar, role | ✅ Done |
| Pricing Plans | CRUD, badge label + color variant, highlight (navy card), features textarea, button label, order, active | ✅ Done |
| Site Settings | Single-record form: address, phone, email, whatsapp, mapEmbed — drives footer + contact page | ✅ Done |
| Social Media Links | CRUD table: platform (select), label, URL, order, active toggle; "Load Defaults" seeds FB/Twitter/LinkedIn/Instagram; footer reads active links ordered, falls back to defaults if DB empty | ✅ Done |

### Admin API guard
All admin API routes use `isAdminAuthenticated(req)` from `lib/admin-api-guard.ts`.
Returns 401 if cookie missing or doesn't match `ADMIN_SESSION_SECRET`.

---

## Scroll Animations

AOS library removed — replaced with custom solution to avoid SSR hydration mismatches.

**Attributes:**
- `data-arx="fade-up|fade-down|fade-left|fade-right"` — animation direction
- `data-arx-delay="100"` — delay in milliseconds

**How it works (`AOSInit.tsx`):**
1. `requestAnimationFrame` + `setTimeout(fn, 50)` — runs after React fully commits
2. `IntersectionObserver` observes all `[data-arx]` elements; fires immediately for in-viewport elements
3. On intersect: adds `arx-in` class (with optional `data-arx-delay` ms delay), then unobserves
4. Runs on every `pathname` change (re-scans on navigation)
5. `suppressHydrationWarning` on every `data-arx` element — browser extension may add `arx-in` before hydration

**No `js-ready` gate.** Elements are always visible. `arx-in` triggers a `@keyframes` animation that starts from `opacity:0` — content never hidden, no black sections on first load.

**CSS (`globals.css`):**
```css
@keyframes arx-fade-up    { from { opacity: 0; transform: translateY(30px); }  to { opacity: 1; transform: none; } }
@keyframes arx-fade-down  { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: none; } }
@keyframes arx-fade-right { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: none; } }
@keyframes arx-fade-left  { from { opacity: 0; transform: translateX(30px); }  to { opacity: 1; transform: none; } }

[data-arx="fade-up"].arx-in    { animation: arx-fade-up    0.7s cubic-bezier(0.215, 0.61, 0.355, 1) both; }
[data-arx="fade-down"].arx-in  { animation: arx-fade-down  0.7s cubic-bezier(0.215, 0.61, 0.355, 1) both; }
[data-arx="fade-right"].arx-in { animation: arx-fade-right 0.7s cubic-bezier(0.215, 0.61, 0.355, 1) both; }
[data-arx="fade-left"].arx-in  { animation: arx-fade-left  0.7s cubic-bezier(0.215, 0.61, 0.355, 1) both; }
```

**Note:** Attribute renamed twice due to browser extension interference:
- `data-aos` → `data-reveal` → `data-arx` (extension targeted each prior name)
- Class: `aos-animate` → `reveal-animate` → `arx-in`
- Never use `data-aos`, `data-reveal`, `aos-animate`, or `reveal-animate` — extension will add the class before React hydrates, causing mismatch.

---

## DB Models (Prisma)

| Model | Table | Key fields |
|-------|-------|------------|
| Contact | contacts | name, email, phone, subject, message |
| Certificate | certificates | certificateId (unique), holderName, courseName, issueDate, isValid |
| BlogPost | blog_posts | slug (unique), title, content, category, published, publishedAt |
| TeamMember | team_members | name, role, bio, photo, linkedin, order, active |
| PortfolioItem | portfolio_items | slug (unique), title, category, image, featured, order |
| Service | services | title, description, icon, image, order, active |
| Stat | stats | icon, target, suffix, label, order, active |
| Client | clients | name, logo, website, order, active |
| Testimonial | testimonials | name, company, role, text, stars, avatar, order, active |
| PricingPlan | pricing_plans | name, tagline, price, period, badge, badgeVariant, highlight, features (JSON string), buttonLabel, order, active |
| SiteContact | site_contact | address, phone, email, whatsapp, mapEmbed — single row (id=1), upserted from admin |
| SocialLink | social_links | platform, label, url, order, active — drives footer social icons |
| ExamAdmin | exam_admins | username, password (bcrypt) |
| ExamQuestion | exam_questions | question, optionA–D, correctOption |
| ExamCandidate | exam_candidates | name, email |
| ExamResult | exam_results | candidateId, score, total, passed |
| ExamVoucher | exam_vouchers | voucherCode (unique), isActive |

---

## Design System

| Token | Value | Tailwind class |
|-------|-------|----------------|
| Primary navy | `#0A1F44` | `bg-navy-900`, `text-navy-900` |
| Accent gold | `#C9A84C` | `bg-gold-400`, `text-gold-400` |
| Gold hover | `#b5932f` | `bg-gold-500` |
| Background | `#FFFFFF` / `gray-950` (dark) | `bg-white dark:bg-gray-950` |
| Body font | Inter | `font-inter` |
| Heading font | Poppins | `font-poppins` |

**Section heading pattern:**
```tsx
<p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
  Small Label
</p>
<h2 className="section-title mb-4">Main Heading</h2>
<p className="section-subtitle">Descriptive text below heading.</p>
```

**Navbar:** fixed top, hidden on `/admin/*`. Default: `bg-transparent`. On scroll >50px: `bg-navy-900/70 backdrop-blur-xl` (glassmorphism) + border + shadow. Nav links right-aligned (`ml-auto`), `gap-3`. No dark mode toggle. Logo `h-8 md:h-12`, natural dims `445×102`. No brand text beside logo.
**Buttons:** `.btn-primary` (gold bg, navy text) / `.btn-outline` (gold border).
**Footer:** always navy-900, hidden on `/admin/*` via `ConditionalFooter`.
**WhatsApp button:** bottom-right `right-6 bottom-24`, hidden on `/admin/*`.
**Back-to-top:** bottom-right `right-6 bottom-6`, gold, appears after 400px scroll.

---

## Key Conventions

- **Imports:** `@/*` alias maps to repo root
- **Client components:** `"use client"` only when using hooks, browser APIs, or motion
- **Dark mode:** Tailwind `dark:` prefix. ThemeProvider `attribute="class"` on `<html>`
- **No inline `style={{}}`** — Tailwind classes only
- **No styled-components** — pure Tailwind only
- **Routing:** Next.js App Router file-system routing. No React Router.
- **API routes:** `app/api/**/route.ts` with named exports (`GET`, `POST`, `PUT`, `DELETE`)
- **DB access:** always via `prisma` from `@/lib/db`
- **Redis access:** always via `redis` from `@/lib/redis`
- **Admin pages:** go inside `app/admin/(shell)/` to get the AdminShell sidebar wrapper
- **Admin API routes:** must call `isAdminAuthenticated(req)` from `@/lib/admin-api-guard`
- **Schema changes:** edit `prisma/schema.prisma` → run `npm run db:push` then `npm run db:generate`
- **After schema change with dev server running:** run `db:push --skip-generate`, stop server, run `db:generate`, restart
- **Scroll animations:** use `data-arx="fade-up"` and `data-arx-delay="100"` — never `data-aos` or `data-reveal`
- **Notifications:** use `toast()` and `confirmDelete()` from `@/lib/notify` — never native `alert()`/`confirm()`
- **Images:** use `next/image` for local; `<img>` tags acceptable for admin-managed external URLs
- **Section containers:** use `container mx-auto` — do NOT add `px-4`; responsive padding comes from `tailwind.config.ts` container config (16px→24px→60px)

---

## Shell Commands

```powershell
npm run dev          # Next.js dev server (Turbopack) → http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Sync Prisma schema → MySQL
npm run db:seed      # Reseed database — DESTRUCTIVE, never run on production
npm run db:studio    # Prisma Studio GUI → http://localhost:5555
npm run db:generate  # Regenerate Prisma client after schema change
```

---

## Environment Variables

| Variable | File | Purpose |
|----------|------|---------|
| `DATABASE_URL` | `.env` + `.env.local` | MySQL connection string |
| `ADMIN_USERNAME` | `.env.local` | Admin panel login username |
| `ADMIN_PASSWORD` | `.env.local` | Admin panel login password |
| `ADMIN_SESSION_SECRET` | `.env.local` | HTTP-only session cookie value |
| `REDIS_URL` | `.env.local` | Redis connection string (default: `redis://localhost:6379`) |

Both `.env` and `.env.local` are gitignored — never commit either.
Keep `DATABASE_URL` in sync across both files.

---

## Contact Info (public)

- **Email:** info@arxinfo.tech
- **Phone:** +91 8317818107
- **WhatsApp:** wa.me/918317818107
- **Address:** 1st Floor, 150, Panchita, Bongaon-Bagdh Rd, Kolkata 743235, India

---

## What NOT To Do

- Do not edit legacy `.html` / `.php` files — reference only
- Do not add inline `style={{}}` props — use Tailwind
- Do not hardcode `DATABASE_URL` — always use `process.env.DATABASE_URL`
- Do not commit `.env` or `.env.local` — both are gitignored
- Do not generate Prisma migration files — use `db push` only
- Do not use React Router — App Router file-system routing only
- Do not duplicate Prisma client — import from `@/lib/db` only
- Do not duplicate Redis client — import from `@/lib/redis` only
- Do not place new admin pages outside `app/admin/(shell)/` — they will miss the AdminShell wrapper
- Do not use `data-aos` or `data-reveal` attributes — use `data-arx` (both prior names targeted by browser extension)
- Do not use native `alert()` or `confirm()` — use `toast()`/`confirmDelete()` from `@/lib/notify`
- `db:seed` deletes all rows before inserting — never run on production
- Prisma CLI reads `.env`; Next.js runtime reads `.env.local` — keep both in sync
