# Migration Design: Next.js (arxinfo-tech) → Django/DRF + React/Vite

Date: 2026-07-14

## Context

The repo root contains empty scaffolds `/frontend` and `/backend`, and a full Next.js 15 app
at `/nextjs` ("arxinfo-tech" — ARX Infotech marketing site + admin CMS + a separate PHP-based
proctored exam system). Goal: migrate `/nextjs` into `/backend` (Django + DRF) and `/frontend`
(React + Vite), preserving functionality.

## Source of truth

- Canonical source: `nextjs/` top-level (`app/`, `components/`, `lib/`, `prisma/`).
- `nextjs/nextjspro/` is a stale nested duplicate (own `node_modules`, `.next` build, copy of
  everything) — delete, do not migrate from it.
- `nextjs/exam/` — standalone PHP proctored exam system (candidate register/exam/submit/result,
  exam-admin login/dashboard). Matches `Exam*` Prisma models already in `schema.prisma`. In scope
  for migration.
- Root `nextjs/contact.php` and `nextjs/verify.php` — legacy, superseded by
  `app/api/contact` and `app/api/verify`. `verify.php` and `exam/config.php` both contain a
  hardcoded plaintext MySQL password — **credential must be rotated** independent of this
  migration. These PHP files are deleted once ported (not carried forward).

## Data model (from `nextjs/prisma/schema.prisma`)

Site/CMS models: `Contact`, `Certificate`, `BlogPost`, `TeamMember`, `PortfolioItem`, `Stat`,
`Client`, `Testimonial`, `Service`, `PricingPlan`, `SiteContact`, `SocialLink`.

Exam models: `ExamAdmin`, `ExamQuestion`, `ExamCandidate`, `ExamResult`, `ExamVoucher`.

All fields/types/relations to be ported 1:1 into Django ORM models (MySQL backend, same DB
shape as current `DATABASE_URL`).

## Backend architecture (`/backend`)

Django + Django REST Framework, apps split by domain:

- `apps/content` — all site/CMS models above. Public read (list/retrieve) on published/active
  items; write access restricted to authenticated staff. Also owns the `contact` (create) and
  `verify` (certificate lookup by `certificateId`) endpoints, replacing
  `app/api/contact/route.ts` and `app/api/verify/route.ts`.
- `apps/exam` — `ExamQuestion`, `ExamCandidate`, `ExamResult`, `ExamVoucher`. Endpoints:
  validate-voucher + register candidate, fetch randomized question set (45), submit
  answers/score, fetch result. Exam-admin management (questions/vouchers/results CRUD) is
  exposed via the same `apps/exam` API, gated by Django staff auth — no separate exam-admin
  account system (`ExamAdmin` model is superseded by Django `User` + is_staff).
- `apps/accounts` — Django `User`, DRF session or token authentication for the admin panel.
  Replaces `lib/admin-auth.ts` (single hardcoded username/password, static-secret cookie) with
  real hashed-password accounts and proper session/token lifecycle.
- CORS via `django-cors-headers` for local dev (Vite `:5173` → Django `:8000`).

Not carried forward: Redis (`lib/redis.ts` is imported nowhere in `app/`, confirmed via grep —
dead dependency, drop entirely).

## Frontend architecture (`/frontend`)

React 18 + TypeScript + Vite + React Router, Axios for API calls, Tailwind (+ Bootstrap, both
present in current app — keep as-is to avoid re-styling work).

Route tree (mirrors current `app/` structure):

```
/                       home
/about
/services
/portfolio
/team
/blog
/blog/:slug
/contact
/verify                 certificate verification
/exam/register          voucher + candidate registration
/exam                   proctored exam (webcam, timer, 45 Qs)
/exam/result
/admin/login
/admin/*                admin shell: dashboard, blog, certificates, clients, contacts,
                         portfolio, pricing, services, settings, stats, team, testimonials
                         (+ exam question/voucher/result management)
```

`middleware.ts` (Next's route guard on `/admin/:path*`) becomes a client-side route-guard
component checking auth state (from the accounts API) and redirecting to `/admin/login`.

`lib/notify.ts` (toastr + sweetalert2 helpers) ports as-is into `frontend/src/lib/notify.ts`.

## Auth flows

- **Admin**: real Django `User` (hashed password), created via `createsuperuser` or a seed
  script (not hardcoded env credentials). DRF session or token auth; frontend stores/sends
  the token or relies on session cookie with CSRF handling.
- **Exam candidate**: stays passwordless — name + email + voucher code at registration
  (matches original PHP flow and `ExamCandidate` model as-is). Session tracking moves from PHP
  `$_SESSION` to a short-lived token/session issued by the `apps/exam` API at registration time,
  used to authorize the subsequent exam/submit/result calls.

## Out of scope / explicitly deferred

- No new features beyond current functionality (no new candidate account system, no new CMS
  fields).
- No production deployment config beyond documenting run/build commands.

## Milestones

1. Django project scaffold + all models (content + exam) + Django admin registration +
   migrations against existing MySQL schema.
2. DRF serializers/viewsets + `apps/accounts` auth for the content app (incl. contact/verify).
3. `apps/exam` API: voucher validation, registration, question fetch, submit/scoring, results,
   staff-gated question/voucher/result management.
4. Vite scaffold: routing, shared layout (Navbar/Footer/PageHero/Preloader/BackToTop/etc.
   ported from `nextjs/components/`), Axios service layer.
5. Port public marketing pages (home, about, services, portfolio, team, blog, contact, verify).
6. Port admin CMS pages (all `admin/(shell)/*` sections) wired to DRF.
7. Port exam candidate flow (register → proctored exam → submit → result) and exam-admin
   management screens.
8. End-to-end wiring pass: auth, error handling, loading states, form validation against real
   backend.
9. Cleanup: delete `nextjs/nextjspro/`, `nextjs/exam/*.php`, root `contact.php`/`verify.php`,
   drop Redis dependency; remove `/nextjs` once parity confirmed.
10. Test pass (pages, APIs, auth flows, forms, CRUD, nav, build) + documentation (setup, env
    vars, run/build commands, migration summary, known limitations).

## Risks

- Static-secret admin cookie → real auth is a behavior change (login mechanics differ, but
  user-facing login form stays the same).
- Two leaked plaintext DB passwords in PHP files being removed — must be rotated on the DB
  side regardless of migration timing (flagged to user, not blocked on this work).
- Exam proctoring (webcam access, `exam/assests/proctor.js`) needs review during port — browser
  API usage should translate directly to React but needs live testing (webcam permissions,
  timer accuracy).
- MySQL relation/constraint parity between Prisma and Django ORM needs verification per model
  during milestone 1.
