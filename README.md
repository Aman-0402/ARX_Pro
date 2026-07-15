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
