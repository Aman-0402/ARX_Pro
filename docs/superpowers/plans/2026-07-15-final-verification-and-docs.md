# Final Verification + Documentation (Milestone 10) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run a full, honest verification pass across the whole migrated stack (backend test
suite, frontend typecheck/build, a live end-to-end smoke test) and write the root `README.md`
documenting setup, run, build, and deployment for the new Django + React stack, plus a migration
summary and known limitations — closing out the last item in the original 10-phase migration
request.

**Architecture:** No new application code. This milestone is verification + documentation only.

**Tech Stack:** N/A.

---

## Note on scope

This is the last milestone of the Next.js -> Django/React migration
(`docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`). Milestones
1-9 are complete: 16-model Django backend with content + exam REST APIs, full React/Vite
frontend (public pages, admin CMS, exam flow), error-handling hardening pass, and legacy
artifact cleanup. This milestone verifies the whole thing still works end-to-end and documents
it — it does not add features.

## File Structure

```
README.md    (new, repo root)
```

---

### Task 1: Full-stack verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend test suite**

Run: `cd backend && venv\Scripts\python manage.py test -v 2`
Expected: all tests pass (48 as of Milestone 3, may be higher if any were added since — report
the actual count and confirm 0 failures/errors either way).

- [ ] **Step 2: Run Django system check**

Run: `venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Run frontend typecheck and build**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Live end-to-end smoke test**

Start both servers (Django on a free port, e.g. `manage.py runserver 8010`; Vite via
`npm run dev`). Since no browser is available in this environment, exercise the full stack via
curl with a cookie jar to confirm the systems genuinely talk to each other, not just that each
half builds in isolation:

1. Public content: `curl http://localhost:8010/api/content/services/` — expect `200` and a JSON
   array (empty or populated, either is fine).
2. Contact form: `curl -X POST http://localhost:8010/api/content/contact/ -H "Content-Type: application/json" -d "{\"name\":\"Final Check\",\"email\":\"check@example.com\",\"subject\":\"Verification\",\"message\":\"End to end smoke test\"}"` —
   expect `201`.
3. Admin auth: log in as an existing/newly-created superuser via
   `POST /api/auth/csrf/` -> `POST /api/auth/login/` with a cookie jar, then
   `GET /api/auth/me/` — expect `200` with the user's `is_staff: true`.
4. Admin CRUD: `GET /api/content/services/` while authenticated (same cookie jar) — expect
   `200`, confirming staff sessions see the full (not just active-filtered) list per Milestone
   2's `ActiveFilteredViewSet` logic.
5. Exam flow: if a voucher exists (or create one via the authenticated session from step 3:
   `POST /api/exam/admin/vouchers/` with `{"voucher_code": "FINALCHECK"}`), register a candidate
   with a FRESH cookie jar (`POST /api/exam/register/`), fetch questions
   (`GET /api/exam/questions/`), submit an answer (`POST /api/exam/submit/`), fetch the result
   (`GET /api/exam/result/`) — expect the full chain to succeed with a real score returned.
6. Clean up any test data created during this smoke test (delete the test contact, voucher,
   candidate, result — leave the DB in the state it was found).

Report the exact status codes and response bodies for each step — this is the final proof the
migration actually works end-to-end, not just that individual pieces build.

- [ ] **Step 5: No commit needed for this task** (verification only — proceed to Task 2)

---

### Task 2: Write the root README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# ARX Infotech — Django + React

Company website, admin CMS, and certification exam platform for ARX Infotech. Migrated from a
Next.js + Prisma monolith to a Django REST Framework backend and a React (Vite) frontend.

## Project Structure

```
├── backend/            # Django + Django REST Framework
│   ├── apps/
│   │   ├── content/     # Site CMS models, API, admin (services, blog, team, portfolio, etc.)
│   │   ├── exam/         # Certification exam models, API, admin
│   │   └── accounts/     # Session-based admin authentication
│   ├── config/           # Django project settings, URL routing
│   └── manage.py
├── frontend/            # React 19 + Vite + TypeScript
│   └── src/
│       ├── pages/         # Route-level page components (public, admin, exam)
│       ├── components/    # Shared UI (layout, admin sidebar, PageHero, CTASection)
│       ├── hooks/          # useAuth, useApiData
│       ├── lib/             # Axios API client
│       └── config/          # adminResources.ts (drives the generic admin CRUD system)
├── nextjs/              # Original Next.js app (reference only — superseded by backend/+frontend/)
└── docs/superpowers/    # Migration design spec, implementation plans
```

## Prerequisites

- Python 3.12+
- Node.js 22+
- MySQL/MariaDB (the same database the original Next.js/Prisma app used)

## Backend Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
cp .env.example .env    # edit DATABASE_URL, DJANGO_SECRET_KEY, etc.
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py createsuperuser
venv\Scripts\python manage.py runserver
```

Backend runs at `http://localhost:8000` by default.

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql://root@localhost:3306/arx` |
| `DJANGO_SECRET_KEY` | Django secret key | (generate a real one for production) |
| `DJANGO_DEBUG` | Debug mode | `True` (dev) / `False` (production) |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) | `http://localhost:5173` |
| `CSRF_TRUSTED_ORIGINS` | Trusted origin(s) for CSRF | `http://localhost:5173` |

## Frontend Setup

```powershell
cd frontend
npm install
cp .env.example .env    # edit VITE_API_BASE_URL if backend isn't on localhost:8000
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Django backend base URL | `http://localhost:8000` |

## Build Commands

```powershell
# Backend: no separate build step (Django serves directly via runserver/WSGI in production)
cd backend && venv\Scripts\python manage.py check --deploy   # production readiness check

# Frontend: production build
cd frontend && npm run build     # outputs to frontend/dist/
```

## Testing

```powershell
cd backend && venv\Scripts\python manage.py test -v 2
```

## Deployment Considerations

- **Backend**: run behind a production WSGI server (gunicorn/uwsgi) + reverse proxy (nginx),
  not `manage.py runserver`. Set `DJANGO_DEBUG=False`, a real `DJANGO_SECRET_KEY`, and restrict
  `ALLOWED_HOSTS` (currently `["*"]` when `DEBUG=True` — see `backend/config/settings.py`).
- **Frontend**: `npm run build` produces a static `dist/` bundle — serve via any static host/CDN
  or nginx, pointed at the production `VITE_API_BASE_URL`.
- **Database**: both apps point at the same MySQL/MariaDB instance via `DATABASE_URL` — no
  separate migration needed since the Django models were mapped onto the existing schema
  (see migration summary below).
- **Sessions/CORS**: `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` must be updated to the real
  production frontend origin before deploying.

## Migration Summary

This project was migrated from a Next.js 15 + Prisma + MySQL monolith
(preserved for reference in `nextjs/`) to:
- **Backend**: Django 4.2 + Django REST Framework, models mapped directly onto the existing
  MySQL schema (no data migration needed — same tables, same rows).
- **Frontend**: React 19 + Vite + TypeScript + React Router, replacing Next.js's file-based
  routing and server components.
- **Auth**: replaced a single hardcoded admin username/password with a static session-cookie
  secret with real Django `User` accounts and proper session authentication.
- **Exam module**: the standalone PHP proctored-exam system was ported into the same Django/
  React stack (voucher-gated registration, randomized questions, server-side scoring, results).

Full design rationale: `docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`.
Implementation plans for each milestone: `docs/superpowers/plans/`.

## Known Limitations

- **No webcam proctoring**: the original PHP exam system's webcam-based proctoring UI
  (`proctor.js`) was not ported — out of scope for this migration's functional-parity goal.
- **No scroll animations**: framer-motion/AOS animations from the original Next.js site were
  dropped in favor of static layouts — content is fully visible immediately (more accessible,
  less decorative polish).
- **No hero video background**: replaced with a static gradient.
- **Blog content renders as plain paragraphs**, not parsed Markdown — the original's
  `renderMarkdown()` helper wasn't ported; adding a Markdown renderer is a follow-up if rich
  formatting is needed.
- **No automated frontend tests**: the backend has a full Django test suite; the frontend has
  none yet (a gap consistent with the project's current testing posture, not something this
  migration introduced fresh).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add root README with setup, run, build, deployment, and migration docs"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** Matches the design spec's Milestone 10 stated deliverables exactly ("setup
  instructions, run/build commands, deployment guide, migration summary, known limitations").
- **Honesty over polish:** the Known Limitations section lists every scope-adjustment made
  across Milestones 5-7 (dropped animations, video, webcam proctoring, Markdown) rather than
  omitting them — matches this migration's established pattern of calling out trade-offs
  explicitly rather than silently.
- **No placeholders:** every step has complete, runnable commands or finished prose — the
  README template above is the actual file content, not a skeleton to fill in later.
