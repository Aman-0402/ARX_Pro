# ARX Infotech — Corporate Website

Official website for **ARX Infotech**, an IT services and tech solutions provider based in Kolkata, India.

🌐 **Live:** [arxinfo.tech](https://arxinfo.tech)

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.5 (App Router, Turbopack) |
| Runtime | Node.js 22 (ESM) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Fonts | Poppins + Inter via `next/font/google` |
| Animations | Framer Motion 12 + custom IntersectionObserver |
| Notifications | SweetAlert2 + Toastr.js |
| Forms | React Hook Form 7 |
| DB | MySQL via Prisma 6 ORM |
| Cache | Redis via ioredis |
| Dark mode | next-themes |
| Icons | Lucide React |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero video, services (3), stats, clients, testimonials, CTA |
| `/about` | Who We Are, Vision/Mission, Core Strength, CTA |
| `/services` | All services (DB-driven), What We Deliver, pricing, CTA |
| `/portfolio` | Portfolio items with client-side category filter |
| `/blog` | Published blog listing |
| `/blog/[slug]` | Single post with markdown renderer |
| `/team` | Team cards from DB |
| `/contact` | Contact form + Google Maps |
| `/verify` | Certificate verification portal |
| `/admin` | Admin dashboard (auth-protected) |

---

## Project Structure

```
arxinfo.tech/
├── app/                    # Next.js App Router pages + API routes
│   ├── globals.css         # Tailwind + scroll animation keyframes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── admin/              # Admin dashboard (shell + login)
│   └── api/                # REST API routes
├── components/
│   ├── Navbar.tsx          # Transparent → glassmorphism on scroll
│   ├── PageHero.tsx        # Full-opacity video banner for inner pages
│   ├── admin/              # Admin CRUD table components
│   └── home/               # Home section components
├── lib/
│   ├── db.ts               # Singleton PrismaClient
│   ├── notify.ts           # SweetAlert2 + Toastr helpers
│   └── admin-auth.ts       # Session cookie auth
├── prisma/
│   ├── schema.prisma       # 11 public models (incl. PricingPlan, SiteContact) + exam models
│   └── seed.ts             # DESTRUCTIVE reseed — never run on production
├── public/
│   ├── images/             # logo.png, favicons, og-banner.png
│   └── video/hero.mp4      # Hero background video
├── middleware.ts           # Protects /admin/* routes
├── tailwind.config.ts      # Navy + Gold design tokens
├── .env                    # DATABASE_URL (Prisma CLI — gitignored)
└── .env.local              # DATABASE_URL + ADMIN_* + REDIS_URL (gitignored)
```

---

## Local Development

```powershell
# Install dependencies
npm install

# Set up env files
# .env        → DATABASE_URL=mysql://...
# .env.local  → DATABASE_URL=... + ADMIN_USERNAME + ADMIN_PASSWORD + ADMIN_SESSION_SECRET

# Push schema to DB
npm run db:push

# Seed database (DESTRUCTIVE — dev only)
npm run db:seed

# Start dev server → http://localhost:3000
npm run dev
```

---

## Admin Panel

- URL: `/admin/login`
- Credentials set via `ADMIN_USERNAME` + `ADMIN_PASSWORD` in `.env.local`
- HTTP-only session cookie auth
- Manages: Blog, Services, Pricing Plans, Certificates, Contacts, Team, Portfolio, Stats, Clients, Testimonials, Site Settings (contact info + social media links)

---

## Environment Variables

| Variable | File | Purpose |
|----------|------|---------|
| `DATABASE_URL` | `.env` + `.env.local` | MySQL connection string |
| `ADMIN_USERNAME` | `.env.local` | Admin login username |
| `ADMIN_PASSWORD` | `.env.local` | Admin login password |
| `ADMIN_SESSION_SECRET` | `.env.local` | Session cookie value |
| `REDIS_URL` | `.env.local` | Redis (default: `redis://localhost:6379`) |

Both env files are gitignored — never commit either.

---

## Contact

- **Email:** info@arxinfo.tech
- **Phone:** +91 8317818107
- **Address:** 1st Floor, 150, Panchita, Bongaon-Bagdh Rd, Kolkata 743235, India
