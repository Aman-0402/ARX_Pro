# Admin CMS Pages (Milestone 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two admin placeholder pages (`AdminLoginPage`, `AdminDashboardPage`) with a
real login flow and a full CRUD admin panel covering all 12 content models
(blog/certificates/clients/contacts/portfolio/pricing/services/stats/team/testimonials/
site-contact/social-links), authenticated against the Django `apps.accounts` session API
(Milestone 2).

**Architecture:** Instead of hand-writing 12 near-identical table+form page pairs (as the
original Next.js app does with 12 separate `*Table.tsx` components), this milestone builds ONE
generic, config-driven CRUD system: a `resources.ts` config array (endpoint + field definitions
per model) drives two generic components — `ResourceListPage` (table + delete) and
`ResourceFormPage` (create/edit form) — reused across all 12 resources via a single dynamic
route (`/admin/:resource`, `/admin/:resource/new`, `/admin/:resource/:id`). `Contact` is
list+delete only (no create/edit form — matches the original's read-only inbox behavior).
`SiteContact` is a singleton settings form, not a list.

**Tech Stack:** React 19, TypeScript, React Router v6 (nested/dynamic routes), Tailwind, the
existing `@/lib/api` Axios client and `@/hooks/useAuth` context from Milestone 4.

---

## Note on scope

Builds on Milestones 1-5 (backend complete, public pages complete). This milestone only touches
`/admin/*`. `RequireAuth` (Milestone 4) already gates `/admin` — this plan expands that single
route into a full nested admin section, all still behind the same guard.

## File Structure

```
frontend/src/
  pages/admin/
    AdminLoginPage.tsx       (rewritten)
    AdminDashboardPage.tsx   (rewritten -> becomes the admin index/sidebar shell)
    ResourceListPage.tsx     (new, generic)
    ResourceFormPage.tsx     (new, generic)
    SettingsPage.tsx          (new, SiteContact singleton form)
  config/
    adminResources.ts        (new, per-model field/endpoint config)
  components/
    admin/
      AdminSidebar.tsx        (new)
```

---

### Task 1: Real admin login + logout

**Files:**
- Overwrite: `frontend/src/pages/admin/AdminLoginPage.tsx`

- [ ] **Step 1: Write `frontend/src/pages/admin/AdminLoginPage.tsx`**

```tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user?.is_staff) {
    navigate("/admin", { replace: true });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-lg">
        <h1 className="font-bold text-2xl text-navy-900 text-center mb-6">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <User size={18} className="text-gray-400" />
            <input
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <Lock size={18} className="text-gray-400" />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/admin/AdminLoginPage.tsx
git commit -m "Add real admin login page wired to session auth"
git push origin main
```

---

### Task 2: Resource config + generic list/form pages

**Files:**
- Create: `frontend/src/config/adminResources.ts`
- Create: `frontend/src/pages/admin/ResourceListPage.tsx`
- Create: `frontend/src/pages/admin/ResourceFormPage.tsx`

- [ ] **Step 1: Write `frontend/src/config/adminResources.ts`**

```typescript
export type FieldType = "text" | "textarea" | "number" | "checkbox" | "date" | "datetime";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ResourceConfig {
  key: string;
  label: string;
  endpoint: string;
  columns: string[];
  fields: FieldConfig[];
  readOnly?: boolean;
}

export const ADMIN_RESOURCES: ResourceConfig[] = [
  {
    key: "blog",
    label: "Blog Posts",
    endpoint: "/api/content/blog/",
    columns: ["title", "category", "author", "published"],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "cover_image", label: "Cover Image URL", type: "text" },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "tags", label: "Tags", type: "text" },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "published_at", label: "Published At", type: "datetime" },
    ],
  },
  {
    key: "certificates",
    label: "Certificates",
    endpoint: "/api/content/certificates/",
    columns: ["certificate_id", "holder_name", "course_name", "is_valid"],
    fields: [
      { name: "certificate_id", label: "Certificate ID", type: "text", required: true },
      { name: "holder_name", label: "Holder Name", type: "text", required: true },
      { name: "course_name", label: "Course Name", type: "text", required: true },
      { name: "issue_date", label: "Issue Date", type: "datetime", required: true },
      { name: "expiry_date", label: "Expiry Date", type: "datetime" },
      { name: "is_valid", label: "Valid", type: "checkbox" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    endpoint: "/api/content/clients/",
    columns: ["name", "website", "order", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo", label: "Logo URL", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "contacts",
    label: "Contact Submissions",
    endpoint: "/api/content/contacts/",
    columns: ["name", "email", "subject", "created_at"],
    fields: [],
    readOnly: true,
  },
  {
    key: "portfolio",
    label: "Portfolio",
    endpoint: "/api/content/portfolio/",
    columns: ["title", "category", "featured", "order"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "content", label: "Content", type: "textarea" },
      { name: "image", label: "Image URL", type: "text" },
      { name: "tags", label: "Tags", type: "text" },
      { name: "client_name", label: "Client Name", type: "text" },
      { name: "live_url", label: "Live URL", type: "text" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    key: "pricing",
    label: "Pricing Plans",
    endpoint: "/api/content/pricing/",
    columns: ["name", "price", "highlight", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text", required: true },
      { name: "price", label: "Price", type: "text", required: true },
      { name: "period", label: "Period", type: "text", required: true },
      { name: "badge", label: "Badge", type: "text" },
      { name: "badge_variant", label: "Badge Variant", type: "text" },
      { name: "highlight", label: "Highlight", type: "checkbox" },
      { name: "features", label: "Features", type: "textarea", required: true },
      { name: "button_label", label: "Button Label", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "services",
    label: "Services",
    endpoint: "/api/content/services/",
    columns: ["title", "icon", "order", "active"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "icon", label: "Icon Key", type: "text" },
      { name: "image", label: "Image URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    endpoint: "/api/content/stats/",
    columns: ["label", "target", "suffix", "order"],
    fields: [
      { name: "icon", label: "Icon Key", type: "text" },
      { name: "target", label: "Target", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "team",
    label: "Team Members",
    endpoint: "/api/content/team/",
    columns: ["name", "role", "order", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photo", label: "Photo URL", type: "text" },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
      { name: "twitter", label: "Twitter URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    endpoint: "/api/content/testimonials/",
    columns: ["name", "company", "stars", "order"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "text", label: "Testimonial Text", type: "textarea", required: true },
      { name: "stars", label: "Stars", type: "number" },
      { name: "avatar", label: "Avatar URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "social-links",
    label: "Social Links",
    endpoint: "/api/content/social-links/",
    columns: ["platform", "label", "order", "active"],
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
];

export function getResourceConfig(key: string): ResourceConfig | undefined {
  return ADMIN_RESOURCES.find((resource) => resource.key === key);
}
```

- [ ] **Step 2: Write `frontend/src/pages/admin/ResourceListPage.tsx`**

```tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getResourceConfig } from "@/config/adminResources";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";

export default function ResourceListPage() {
  const { resource } = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const config = resource ? getResourceConfig(resource) : undefined;
  const items = useApiData<Record<string, unknown>[]>(config ? config.endpoint : null);

  if (!config) {
    return <div className="p-8">Unknown resource.</div>;
  }

  async function handleDelete(id: number) {
    if (!config) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    await api.delete(`${config.endpoint}${id}/`);
    navigate(0);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl">{config.label}</h1>
        {!config.readOnly && (
          <Link to={`/admin/${config.key}/new`} className="btn-primary">
            <Plus size={16} />
            New
          </Link>
        )}
      </div>

      {items.loading && <p className="text-gray-500">Loading...</p>}
      {items.error && <p className="text-red-500">{items.error}</p>}
      {items.data && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                {config.columns.map((column) => (
                  <th key={column} className="px-4 py-3 capitalize">
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.map((item) => (
                <tr key={String(item.id)} className="border-b last:border-0">
                  {config.columns.map((column) => (
                    <td key={column} className="px-4 py-3">
                      {String(item[column] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 flex gap-3">
                    {!config.readOnly && (
                      <Link to={`/admin/${config.key}/${item.id}`}>
                        <Pencil size={16} className="text-gray-400 hover:text-gold-400" />
                      </Link>
                    )}
                    <button type="button" onClick={() => handleDelete(item.id as number)}>
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.data.length === 0 && (
            <p className="text-center text-gray-400 py-8">No items yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `frontend/src/pages/admin/ResourceFormPage.tsx`**

```tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResourceConfig, type FieldConfig } from "@/config/adminResources";
import { api } from "@/lib/api";

type FormValues = Record<string, string | number | boolean>;

function defaultValueFor(field: FieldConfig): string | number | boolean {
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  return "";
}

export default function ResourceFormPage() {
  const { resource, id } = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const config = resource ? getResourceConfig(resource) : undefined;
  const isEditing = Boolean(id);

  const [values, setValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!config) return;
    if (!isEditing) {
      const initial: FormValues = {};
      config.fields.forEach((field) => {
        initial[field.name] = defaultValueFor(field);
      });
      setValues(initial);
      return;
    }
    api.get<FormValues>(`${config.endpoint}${id}/`).then((response) => {
      setValues(response.data);
      setLoading(false);
    });
  }, [config, id, isEditing]);

  if (!config) return <div className="p-8">Unknown resource.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  function updateField(name: string, value: string | number | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;
    setSubmitting(true);
    setError("");
    try {
      if (isEditing) {
        await api.put(`${config.endpoint}${id}/`, values);
      } else {
        await api.post(config.endpoint, values);
      }
      navigate(`/admin/${config.key}`);
    } catch {
      setError("Failed to save. Check required fields.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-bold text-2xl mb-6">
        {isEditing ? `Edit ${config.label}` : `New ${config.label}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-8 shadow-sm">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                required={field.required}
                rows={4}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(e) => updateField(field.name, e.target.checked)}
              />
            ) : field.type === "number" ? (
              <input
                type="number"
                required={field.required}
                value={Number(values[field.name] ?? 0)}
                onChange={(e) => updateField(field.name, Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
              />
            ) : field.type === "datetime" ? (
              <input
                type="datetime-local"
                required={field.required}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            ) : (
              <input
                type="text"
                required={field.required}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            )}
          </div>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/config/adminResources.ts frontend/src/pages/admin/ResourceListPage.tsx frontend/src/pages/admin/ResourceFormPage.tsx
git commit -m "Add generic config-driven admin CRUD list/form pages for all content resources"
git push origin main
```

---

### Task 3: Admin dashboard shell + settings page + routing

**Files:**
- Create: `frontend/src/components/admin/AdminSidebar.tsx`
- Overwrite: `frontend/src/pages/admin/AdminDashboardPage.tsx`
- Create: `frontend/src/pages/admin/SettingsPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write `frontend/src/components/admin/AdminSidebar.tsx`**

```tsx
import { NavLink } from "react-router-dom";
import { ADMIN_RESOURCES } from "@/config/adminResources";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-navy-900 min-h-screen p-6 flex flex-col">
      <h2 className="text-white font-bold text-lg mb-8">ARX Admin</h2>

      <nav className="flex-1 space-y-1">
        {ADMIN_RESOURCES.map((resource) => (
          <NavLink
            key={resource.key}
            to={`/admin/${resource.key}`}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${
                isActive ? "bg-gold-400 text-navy-900 font-semibold" : "text-gray-300 hover:bg-navy-800"
              }`
            }
          >
            {resource.label}
          </NavLink>
        ))}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `block px-3 py-2 rounded text-sm ${
              isActive ? "bg-gold-400 text-navy-900 font-semibold" : "text-gray-300 hover:bg-navy-800"
            }`
          }
        >
          Settings
        </NavLink>
      </nav>

      <button
        type="button"
        onClick={() => logout()}
        className="text-gray-400 hover:text-white text-sm text-left mt-6"
      >
        Log Out
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Overwrite `frontend/src/pages/admin/AdminDashboardPage.tsx`**

Becomes the admin layout shell wrapping nested routes via `<Outlet />`:

```tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `frontend/src/pages/admin/SettingsPage.tsx`**

Singleton `SiteContact` edit form (the site's one contact-info row, id known via a GET on the
list endpoint since DRF's router doesn't expose a "get the singleton" shortcut):

```tsx
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";

interface SiteContact {
  id: number;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  map_embed: string;
}

export default function SettingsPage() {
  const [contact, setContact] = useState<SiteContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<SiteContact[]>("/api/content/site-contact/").then((response) => {
      setContact(response.data[0] ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!contact) return;
    setSubmitting(true);
    setSaved(false);
    await api.put(`/api/content/site-contact/${contact.id}/`, contact);
    setSubmitting(false);
    setSaved(true);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!contact) return <div className="p-8">No site contact record found.</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-bold text-2xl mb-6">Site Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-8 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
          <textarea
            rows={3}
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
          <input
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
          <input
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp</label>
          <input
            value={contact.whatsapp}
            onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Map Embed URL</label>
          <textarea
            rows={2}
            value={contact.map_embed}
            onChange={(e) => setContact({ ...contact, map_embed: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {saved && <p className="text-green-600 text-sm">Saved.</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Wire nested admin routes into `frontend/src/App.tsx`**

Replace the existing single `<Route path="/admin" element={<AdminDashboardPage />} />` (nested
inside `RequireAuth`) with a nested route tree, and add the new page imports:

```tsx
import ResourceListPage from "@/pages/admin/ResourceListPage";
import ResourceFormPage from "@/pages/admin/ResourceFormPage";
import SettingsPage from "@/pages/admin/SettingsPage";
```

```tsx
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminDashboardPage />}>
            <Route index element={<ResourceListPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path=":resource" element={<ResourceListPage />} />
            <Route path=":resource/new" element={<ResourceFormPage />} />
            <Route path=":resource/:id" element={<ResourceFormPage />} />
          </Route>
        </Route>
```

Note: the bare `index` route re-renders `ResourceListPage` with `resource` undefined, which
correctly falls into its "Unknown resource" branch — acceptable as a bare `/admin` landing
state; a nicer default (e.g. redirect to the first resource) is a cheap follow-up, not required
for this milestone's functional-parity goal.

- [ ] **Step 5: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 6: Manual smoke test**

Start both servers. Log in at `/admin/login` with real Django credentials (create one first if
none exist: `cd backend && venv\Scripts\python manage.py createsuperuser`). Confirm redirect to
`/admin`. Click through the sidebar to `/admin/services` — confirm the table renders (empty or
populated). Click "New", fill the form, submit — confirm it POSTs and redirects back to the
list with the new row visible. Click the pencil icon on a row — confirm the edit form
pre-fills and PUT updates correctly. Click the trash icon — confirm the confirm-dialog and
DELETE work. Visit `/admin/contacts` — confirm no "New"/edit controls render (read-only). Visit
`/admin/settings` — confirm the site-contact form loads and saves. Log out via the sidebar
button — confirm redirect/guard sends you back to `/admin/login` on next `/admin` visit. If no
browser is available, do what curl-based verification is possible against the backend
endpoints directly and note the limitation.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/admin/AdminSidebar.tsx frontend/src/pages/admin/AdminDashboardPage.tsx frontend/src/pages/admin/SettingsPage.tsx frontend/src/App.tsx
git commit -m "Add admin dashboard shell, settings page, and nested CRUD routing"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** All 12 content models from the design spec's admin-CMS milestone
  ("admin CMS pages (all `admin/(shell)/*` sections)") are reachable and manageable: 10 via the
  generic list/form pair (blog, certificates, clients, portfolio, pricing, services, stats,
  team, testimonials, social-links), `contacts` as read-only list+delete, `site-contact` as a
  dedicated singleton settings form. Auth flow replaces `lib/admin-auth.ts`'s static-cookie hack
  with the real session login built in Milestone 2 — matches the design spec's stated auth
  change exactly.
- **Type/name consistency:** `ResourceConfig.endpoint` values match `backend/apps/content/urls.py`'s
  router registrations exactly (`/api/content/blog/`, `/certificates/`, `/clients/`,
  `/contacts/`, `/portfolio/`, `/pricing/`, `/services/`, `/stats/`, `/team/`, `/testimonials/`,
  `/social-links/`, `/site-contact/`). Field names in each `ResourceConfig.fields` array match
  the Django model field names verified against `backend/apps/content/models.py` (snake_case,
  no renaming, consistent with DRF's default serialization already relied upon in Milestone 5).
- **No placeholders:** every step has complete, runnable code. The generic CRUD approach is a
  deliberate architecture choice (not a shortcut) — documented in the Architecture section above.
