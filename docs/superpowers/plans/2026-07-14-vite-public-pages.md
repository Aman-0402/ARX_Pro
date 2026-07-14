# Public Marketing Pages Port (Milestone 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 9 placeholder public pages (`frontend/src/pages/*`, excluding `/exam/*` and
`/admin/*`) with real content ported from `nextjs/app/*`, wired to the live Django content API
(Milestone 2) instead of Prisma/server components.

**Architecture:** A shared `useApiData` hook wraps Axios GET calls with loading/error/data state,
used by every data-driven page. `PageHero` and `CTASection` are reusable presentational
components ported from `nextjs/components/PageHero.tsx` and
`nextjs/components/home/CTASection.tsx`. The navy/gold theme and `section-title`/`btn-primary`
utility classes are ported from `nextjs/tailwind.config.ts` and `nextjs/app/globals.css` so pages
look like the original without needing framer-motion or AOS (both dropped — see Scope
Adjustments below).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, lucide-react (icons, matching the
original), axios (already wired via `@/lib/api`).

---

## Scope adjustments (accepted simplifications vs. the Next.js original)

These are deliberate, not oversights — call them out explicitly rather than silently diverging:

1. **No framer-motion / AOS scroll animations.** The original uses `motion.div` and
   `data-arx="fade-up"` scroll-triggered animations throughout. This port uses plain static
   layout — content is fully visible immediately, which is strictly *more* accessible and
   simpler, at the cost of losing the fade-in polish. Can be added back in a later pass if
   wanted.
2. **No hero video background.** `HeroSection.tsx` plays `/video/hero.mp4`. This port uses a
   solid navy gradient background instead — the video asset isn't part of this migration's
   scope (no asset pipeline decision has been made yet for `/uploads/`-style media).
3. **Blog post content renders as plain paragraphs, not parsed Markdown.** The original uses
   `renderMarkdown()` from `nextjs/lib/markdown.tsx`. This port splits `post.content` on double
   newlines into `<p>` tags — safe (no `dangerouslySetInnerHTML`, no XSS surface) and correct
   for plain-text content, but loses Markdown formatting (bold, links, headers) until a Markdown
   library is deliberately added in a later milestone.
4. **Icon-name-to-component mapping is copied verbatim** from `nextjs/app/services/page.tsx`'s
   `ICON_MAP` since `Service.icon` is a plain string column (e.g. `"cloud"`, `"shield"`) — this
   isn't a simplification, it's required either way.

## File Structure

```
frontend/src/
  components/
    PageHero.tsx
    CTASection.tsx
  hooks/
    useApiData.ts
  pages/
    HomePage.tsx           (rewritten)
    AboutPage.tsx           (rewritten)
    ServicesPage.tsx        (rewritten)
    PortfolioPage.tsx       (rewritten)
    TeamPage.tsx             (rewritten)
    BlogListPage.tsx        (rewritten)
    BlogPostPage.tsx        (rewritten)
    ContactPage.tsx          (rewritten)
    VerifyPage.tsx            (rewritten)
tailwind.config.js  (MODIFY: navy/gold theme)
src/index.css        (MODIFY: section-title/btn utility classes)
```

---

### Task 1: Theme, shared UI, and data hook

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Create: `frontend/src/hooks/useApiData.ts`
- Create: `frontend/src/components/PageHero.tsx`
- Create: `frontend/src/components/CTASection.tsx`

- [ ] **Step 1: Install lucide-react**

Run: `cd frontend && npm install lucide-react`

- [ ] **Step 2: Port the navy/gold theme into `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "3.75rem",
      },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1F44",
          50: "#f0f4ff",
          100: "#d9e4ff",
          700: "#1a3366",
          800: "#0d2659",
          900: "#0A1F44",
        },
        gold: {
          DEFAULT: "#C9A84C",
          300: "#d4b96a",
          400: "#C9A84C",
          500: "#b5932f",
          600: "#9e7d20",
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Add utility classes to `frontend/src/index.css`**

Append after the existing `@tailwind` directives:

```css
@layer base {
  body {
    @apply text-gray-800 bg-white;
  }
}

@layer components {
  .section-title {
    @apply font-bold text-3xl md:text-4xl text-navy-900;
  }

  .section-subtitle {
    @apply text-gray-500 text-lg max-w-2xl mx-auto;
  }

  .btn-primary {
    @apply inline-flex items-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold rounded transition-colors duration-200;
  }

  .btn-outline {
    @apply inline-flex items-center gap-2 px-6 py-3 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-navy-900 font-bold rounded transition-colors duration-200;
  }
}
```

- [ ] **Step 4: Write `frontend/src/hooks/useApiData.ts`**

```typescript
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiData<T>(url: string | null): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    loading: url !== null,
    error: null,
  });

  useEffect(() => {
    if (url === null) return;

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    api
      .get<T>(url)
      .then((response) => {
        if (!cancelled) setState({ data: response.data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load data";
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

- [ ] **Step 5: Write `frontend/src/components/PageHero.tsx`**

Ported from `nextjs/components/PageHero.tsx`'s content, simplified (no AOS):

```tsx
export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-navy-900 pt-32 pb-16 text-center">
      <div className="container mx-auto px-4">
        <h1 className="font-bold text-3xl md:text-5xl text-white mb-4">{title}</h1>
        {subtitle && (
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Write `frontend/src/components/CTASection.tsx`**

Ported from `nextjs/components/home/CTASection.tsx`'s copy, simplified (no AOS):

```tsx
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="bg-navy-900 py-16 text-center">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-white mb-4">Ready to Transform Your Business?</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          Let's discuss how ARX Infotech can help you achieve your technology goals.
        </p>
        <Link to="/contact" className="btn-primary">
          Get in Touch
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/tailwind.config.js frontend/src/index.css frontend/src/hooks/useApiData.ts frontend/src/components/PageHero.tsx frontend/src/components/CTASection.tsx frontend/package.json frontend/package-lock.json
git commit -m "Add navy/gold theme, PageHero/CTASection, and useApiData hook"
git push origin main
```

---

### Task 2: HomePage

**Files:**
- Overwrite: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/HomePage.tsx`**

Content ported from `nextjs/app/page.tsx` + its section components
(`HeroSection`/`WhyChooseSection`/`ServicesSection`/`StatsCounter`/`TestimonialsSection`), data
sections wired to the Django API instead of Prisma:

```tsx
import { Link } from "react-router-dom";
import { Cog, ShieldCheck, Cloud, TrendingUp, Zap, Users } from "lucide-react";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Stat {
  id: number;
  target: number;
  suffix: string;
  label: string;
}

interface Testimonial {
  id: number;
  name: string;
  company: string;
  text: string;
  stars: number;
}

const WHY_CHOOSE = [
  { icon: ShieldCheck, title: "Security-First", text: "Every solution is built with security baked in from day one." },
  { icon: Cloud, title: "Cloud-Ready", text: "Scalable, modern infrastructure ready for growth." },
  { icon: Zap, title: "Fast Delivery", text: "Structured workflows with clear milestones and on-time delivery." },
];

export default function HomePage() {
  const services = useApiData<Service[]>("/api/content/services/");
  const stats = useApiData<Stat[]>("/api/content/stats/");
  const testimonials = useApiData<Testimonial[]>("/api/content/testimonials/");

  return (
    <>
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full" />
              Trusted IT Partner
            </div>
            <h1 className="font-bold text-4xl md:text-6xl text-white leading-tight mb-6">
              IT Services & <span className="text-gold-400">Modern Tech Solutions</span> for
              Businesses
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              ARX Infotech delivers scalable IT services, software development, cloud migration,
              and academic automation solutions to help organizations grow faster.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="btn-primary">
                <Cog size={18} />
                Explore Services
              </Link>
              <Link to="/contact" className="btn-outline">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Why Choose Us
            </p>
            <h2 className="section-title">Built for Reliability</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {WHY_CHOOSE.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 shadow-sm text-center">
                <item.icon className="text-gold-400 mx-auto mb-4" size={36} />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Services
            </p>
            <h2 className="section-title">What We Offer</h2>
          </div>
          {services.loading && <p className="text-center text-gray-500">Loading services...</p>}
          {services.error && <p className="text-center text-red-500">{services.error}</p>}
          {services.data && (
            <div className="grid md:grid-cols-3 gap-8">
              {services.data.map((service) => (
                <div key={service.id} className="bg-gray-50 rounded-xl p-8 shadow-sm">
                  <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-gray-500">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-navy-900">
        <div className="container mx-auto px-4">
          {stats.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.data.map((stat) => (
                <div key={stat.id}>
                  <div className="text-4xl font-bold text-gold-400 mb-2">
                    {stat.target}
                    {stat.suffix}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          {testimonials.data && (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.data.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-sm">
                  <p className="text-gray-600 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.company}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "Port HomePage with live services/stats/testimonials from Django API"
git push origin main
```

---

### Task 3: AboutPage + ServicesPage

**Files:**
- Overwrite: `frontend/src/pages/AboutPage.tsx`
- Overwrite: `frontend/src/pages/ServicesPage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/AboutPage.tsx`**

Content condensed from `nextjs/app/about/page.tsx` (static copy, no DB dependency in the
original either):

```tsx
import { Globe, Lock, Zap } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

const STRENGTHS = [
  {
    icon: Globe,
    title: "Global Service Capability",
    description:
      "Remote and on-site support models for businesses and academic institutions across India and globally.",
  },
  {
    icon: Lock,
    title: "Security-First Development",
    description:
      "Strong security practices baked into every solution - from code to infrastructure deployment.",
  },
  {
    icon: Zap,
    title: "Fast & Professional Delivery",
    description:
      "Structured project workflows with clear milestones ensuring quality delivery on time, every time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About ARX Infotech"
        subtitle="A technology-driven organization delivering secure, scalable, and future-ready IT solutions."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Story
            </p>
            <h2 className="section-title mb-5">Who We Are</h2>
            <p className="section-subtitle">
              ARX Infotech is a technology-driven organization delivering end-to-end IT services,
              custom software, and modern digital solutions for businesses and institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STRENGTHS.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 shadow-sm">
                <item.icon className="text-gold-400 mb-4" size={32} />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 2: Write `frontend/src/pages/ServicesPage.tsx`**

Data-driven, ported from `nextjs/app/services/page.tsx`, `ICON_MAP` copied to keep behavior
identical:

```tsx
import {
  Globe, Smartphone, Briefcase, Cloud, TrendingUp, GraduationCap, Code, Shield, Database,
  Settings, Server, Laptop2, Wrench,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  globe: Globe,
  smartphone: Smartphone,
  briefcase: Briefcase,
  cloud: Cloud,
  trending: TrendingUp,
  graduation: GraduationCap,
  code: Code,
  shield: Shield,
  database: Database,
  settings: Settings,
  server: Server,
  laptop: Laptop2,
};

export default function ServicesPage() {
  const services = useApiData<Service[]>("/api/content/services/");

  return (
    <>
      <PageHero
        title="Our Services"
        subtitle="Managed IT services, cloud migration, custom software development, cybersecurity, and more."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {services.loading && <p className="text-center text-gray-500">Loading services...</p>}
          {services.error && <p className="text-center text-red-500">{services.error}</p>}
          {services.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.data.map((service) => {
                const Icon = ICON_MAP[service.icon] ?? Wrench;
                return (
                  <div key={service.id} className="bg-white rounded-xl p-8 shadow-sm">
                    <Icon className="text-gold-400 mb-4" size={32} />
                    <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                    <p className="text-gray-500">{service.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/AboutPage.tsx frontend/src/pages/ServicesPage.tsx
git commit -m "Port AboutPage and ServicesPage"
git push origin main
```

---

### Task 4: PortfolioPage + TeamPage

**Files:**
- Overwrite: `frontend/src/pages/PortfolioPage.tsx`
- Overwrite: `frontend/src/pages/TeamPage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/PortfolioPage.tsx`**

Ported from `nextjs/app/portfolio/page.tsx`:

```tsx
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  client_name: string | null;
  live_url: string | null;
  featured: boolean;
}

export default function PortfolioPage() {
  const items = useApiData<PortfolioItem[]>("/api/content/portfolio/");

  return (
    <>
      <PageHero
        title="Our Portfolio"
        subtitle="Real projects. Real results. Explore what we've built for our clients."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {items.loading && <p className="text-center text-gray-500">Loading portfolio...</p>}
          {items.error && <p className="text-center text-red-500">{items.error}</p>}
          {items.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.data.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    {item.category}
                  </p>
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-500 mb-3">{item.description}</p>
                  {item.client_name && (
                    <p className="text-sm text-gray-400">Client: {item.client_name}</p>
                  )}
                  {item.live_url && (
                    <a
                      href={item.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-400 text-sm font-semibold mt-2 inline-block"
                    >
                      View Live →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 2: Write `frontend/src/pages/TeamPage.tsx`**

Ported from `nextjs/app/team/page.tsx`:

```tsx
import { Linkedin, Twitter } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  linkedin: string | null;
  twitter: string | null;
}

export default function TeamPage() {
  const members = useApiData<TeamMember[]>("/api/content/team/");

  return (
    <>
      <PageHero
        title="Meet Our Team"
        subtitle="The experienced professionals powering ARX Infotech's success."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {members.loading && <p className="text-center text-gray-500">Loading team...</p>}
          {members.error && <p className="text-center text-red-500">{members.error}</p>}
          {members.data && (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {members.data.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-gold-400 text-sm font-semibold mb-3">{member.role}</p>
                  {member.bio && <p className="text-gray-500 text-sm mb-4">{member.bio}</p>}
                  <div className="flex justify-center gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer">
                        <Linkedin size={18} className="text-gray-400 hover:text-gold-400" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer">
                        <Twitter size={18} className="text-gray-400 hover:text-gold-400" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PortfolioPage.tsx frontend/src/pages/TeamPage.tsx
git commit -m "Port PortfolioPage and TeamPage"
git push origin main
```

---

### Task 5: BlogListPage + BlogPostPage

**Files:**
- Overwrite: `frontend/src/pages/BlogListPage.tsx`
- Overwrite: `frontend/src/pages/BlogPostPage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/BlogListPage.tsx`**

Ported from `nextjs/app/blog/page.tsx`:

```tsx
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string | null;
}

export default function BlogListPage() {
  const posts = useApiData<BlogPost[]>("/api/content/blog/");

  return (
    <>
      <PageHero
        title="Our Blog"
        subtitle="Expert insights on IT, cloud computing, cybersecurity, and digital transformation."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {posts.loading && <p className="text-center text-gray-500">Loading posts...</p>}
          {posts.error && <p className="text-center text-red-500">{posts.error}</p>}
          {posts.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.data.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                  <p className="text-gray-500 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {post.author}
                    </span>
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Write `frontend/src/pages/BlogPostPage.tsx`**

Ported from `nextjs/app/blog/[slug]/page.tsx`. Fetches the full post list and finds the matching
slug client-side (the content API doesn't have a slug-lookup endpoint — it uses DRF's default
integer-PK routing, not slug routing, so filtering client-side is correct here rather than
guessing at a URL shape that doesn't exist):

```tsx
import { Link, useParams } from "react-router-dom";
import { Calendar, User, ChevronLeft } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  category: string;
  author: string;
  published_at: string | null;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = useApiData<BlogPost[]>("/api/content/blog/");

  if (posts.loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (posts.error) return <div className="p-8 text-center text-red-500">{posts.error}</div>;

  const post = posts.data?.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link to="/blog" className="text-gold-400 font-semibold">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={post.title} subtitle={post.category} />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-400 mb-8"
            >
              <ChevronLeft size={16} />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-1">
                <User size={14} /> {post.author}
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(post.published_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              {post.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/BlogListPage.tsx frontend/src/pages/BlogPostPage.tsx
git commit -m "Port BlogListPage and BlogPostPage"
git push origin main
```

---

### Task 6: ContactPage + VerifyPage

**Files:**
- Overwrite: `frontend/src/pages/ContactPage.tsx`
- Overwrite: `frontend/src/pages/VerifyPage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/ContactPage.tsx`**

Ported from `nextjs/app/contact/page.tsx` + `nextjs/components/contact/ContactForm.tsx`'s
behavior, posting to the Django `contact` endpoint from Milestone 2
(`apps.content.views.ContactCreateView`, `POST /api/content/contact/`):

```tsx
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";

interface SiteContact {
  address: string;
  phone: string;
  email: string;
}

const FALLBACK: SiteContact = {
  address: "1st Floor, 150, Panchita\nBongaon-Bagdh Rd, Kolkata\nWest Bengal 743235, India",
  phone: "+91 8317818107",
  email: "info@arxinfo.tech",
};

export default function ContactPage() {
  const siteContact = useApiData<SiteContact[]>("/api/content/site-contact/");
  const contact = siteContact.data?.[0] ?? FALLBACK;

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      await api.post("/api/content/contact/", form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with ARX Infotech for IT services, software development, and digital transformation."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-gold-400 shrink-0" size={20} />
                <p className="text-gray-600 whitespace-pre-line">{contact.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gold-400 shrink-0" size={20} />
                <a href={`tel:${contact.phone}`} className="text-gray-600">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gold-400 shrink-0" size={20} />
                <a href={`mailto:${contact.email}`} className="text-gray-600">
                  {contact.email}
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-xl p-8 shadow-sm space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded px-4 py-2"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border rounded px-4 py-2"
                />
              </div>
              <input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <input
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <textarea
                required
                placeholder="Message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <button type="submit" disabled={status === "submitting"} className="btn-primary">
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
              {status === "success" && (
                <p className="text-green-600 text-sm">Message sent! We'll be in touch soon.</p>
              )}
              {status === "error" && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Write `frontend/src/pages/VerifyPage.tsx`**

Ported from `nextjs/app/verify/page.tsx` + `nextjs/components/verify/VerifyForm.tsx`'s behavior,
querying the Django `verify` endpoint (`GET /api/content/verify/?id=...`):

```tsx
import { useState, type FormEvent } from "react";
import { ShieldCheck, Search } from "lucide-react";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";

interface Certificate {
  certificate_id: string;
  holder_name: string;
  course_name: string;
  issue_date: string;
  expiry_date: string | null;
  is_valid: boolean;
}

export default function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setCertificate(null);
    try {
      const response = await api.get<{ certificate: Certificate }>("/api/content/verify/", {
        params: { id: certId },
      });
      setCertificate(response.data.certificate);
      setStatus("found");
    } catch (err) {
      setStatus("not-found");
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErrorMessage(message ?? "Certificate not found. Please check the ID and try again.");
    }
  }

  return (
    <>
      <PageHero
        title="Certificate Verification"
        subtitle="Verify the authenticity of ARX Infotech issued certificates and documents."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-2 bg-white border rounded-full px-5 py-2.5 shadow-sm text-sm text-gray-600">
              <ShieldCheck size={16} className="text-gold-400" />
              All certificates are stored in ARX Infotech's secure database
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 mb-10">
            <input
              required
              placeholder="Enter Certificate ID"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="border rounded px-4 py-2 flex-1"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary">
              <Search size={16} />
              Verify
            </button>
          </form>

          {status === "not-found" && (
            <p className="text-center text-red-500">{errorMessage}</p>
          )}

          {status === "found" && certificate && (
            <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-green-600">Certificate Valid</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Certificate ID</dt>
                  <dd className="font-semibold">{certificate.certificate_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Holder Name</dt>
                  <dd className="font-semibold">{certificate.holder_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Course</dt>
                  <dd className="font-semibold">{certificate.course_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Issue Date</dt>
                  <dd className="font-semibold">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Manual smoke test**

Start both servers: Django (`cd backend && venv\Scripts\python manage.py runserver`) and Vite
(`cd frontend && npm run dev`). Visit `/services`, `/portfolio`, `/team`, `/blog` in a browser —
confirm each either renders live data from the Django API (if seed data exists) or shows an
empty grid with no console errors (if the DB has no rows yet — that's fine, it proves the
fetch/render path works either way). Submit the contact form on `/contact` with test data,
confirm success message and a new row in the `contacts` table (verify via
`python manage.py shell` or the Django admin). Try `/verify` with a bogus ID, confirm the
"not found" error renders. Stop both servers after checking.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ContactPage.tsx frontend/src/pages/VerifyPage.tsx
git commit -m "Port ContactPage and VerifyPage with live form submission"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** All 9 public routes from the design spec's route tree
  (`/`, `/about`, `/services`, `/portfolio`, `/team`, `/blog`, `/blog/:slug`, `/contact`,
  `/verify`) get real content wired to the exact Milestone 2 API endpoints
  (`/api/content/services/`, `/stats/`, `/testimonials/`, `/portfolio/`, `/team/`, `/blog/`,
  `/contact/`, `/verify/`, `/site-contact/`) — verified against `backend/apps/content/urls.py`'s
  router registrations.
- **Type/name consistency:** Every page's TypeScript interface field names (snake_case:
  `client_name`, `live_url`, `published_at`, `certificate_id`, etc.) match the Django
  serializers' output exactly (DRF serializes model fields as-is, no camelCase conversion) —
  cross-checked against `backend/apps/content/serializers.py`.
- **No placeholders:** every step has complete, runnable code. Scope adjustments (no
  framer-motion/AOS/video/Markdown) are explicitly documented above, not silently dropped.
