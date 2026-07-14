# End-to-End Error Handling Pass (Milestone 8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining error-handling/loading-state gaps across the frontend, per the
design spec's Milestone 8 goal ("auth, error handling, loading states, validation... against
real backend"): a global 401 handler that redirects to admin login when a session expires,
field-level validation error surfacing in the admin CRUD form, and the two `HomePage` sections
that currently render nothing on load failure.

**Architecture:** A single Axios response interceptor in `@/lib/api` handles the 401 case
globally (no per-page code needed). `ResourceFormPage` gets a small upgrade to read DRF's
per-field validation error shape instead of a single generic string. `HomePage`'s stats/
testimonials sections get the same loading/error treatment its services section already has.

**Tech Stack:** No new dependencies — Axios interceptors, existing components.

---

## Note on scope

Builds on Milestones 1-7 (full backend + frontend feature-complete). This is a hardening pass,
not new features — every change here is filling a gap already identified during earlier
milestones' code reviews (some flagged and deferred as non-blocking at the time; this milestone
addresses them).

## File Structure

```
frontend/src/
  lib/
    api.ts                          (MODIFY: add 401 response interceptor)
  pages/
    admin/ResourceFormPage.tsx      (MODIFY: surface DRF field errors)
    HomePage.tsx                    (MODIFY: add loading/error UI to stats/testimonials)
```

---

### Task 1: Global 401 handling

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add a response interceptor**

Append to `frontend/src/lib/api.ts` (after the existing request interceptor, before
`ensureCsrfCookie`):

```typescript
const SESSION_EXEMPT_PATHS = ["/api/auth/login/", "/api/auth/me/", "/api/auth/csrf/"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isExempt = SESSION_EXEMPT_PATHS.some((path) => url.includes(path));

    if (status === 401 && !isExempt && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);
```

Why the exemptions: `/api/auth/login/` returning 401 means "wrong password," which the login
form already displays inline — redirecting would create a loop. `/api/auth/me/` returning 401 on
initial page load is the normal "not logged in yet" case that `useAuth`'s own effect already
handles by setting `user: null` — redirecting there too would fight `RequireAuth`'s own logic.
`/api/auth/csrf/` never returns 401 (it's `AllowAny`) but is excluded defensively. The
`window.location.pathname.startsWith("/admin")` guard prevents this from ever firing on public
pages, where a 401 has no meaning (public content endpoints are read-open, and the exam flow
uses 403 via `HasExamSession`, not 401 — verified against `backend/apps/exam/views.py`, which
sets `authentication_classes = []` on session-gated candidate views specifically to get 403, not
401 — so this interceptor cannot misfire on the exam flow).

- [ ] **Step 2: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Manual verification**

Start both servers. Log into `/admin`. In the browser's dev tools (or via the Django admin),
expire the session (delete the session cookie, or delete the corresponding row from
`django_session` table). Trigger any admin API call (e.g. navigate to `/admin/services`).
Confirm it redirects to `/admin/login` instead of showing a raw error or an infinite spinner. If
no browser is available, verify by reading the interceptor logic carefully and confirming (via
curl) that an admin endpoint genuinely returns 401 (not 403) for an unauthenticated request:
`curl -i http://localhost:8010/api/content/services/ -X POST -H "Content-Type: application/json" -d "{}"`
— expect `403` (matches `Force403Mixin` from Milestone 2, not 401, since that's a
staff-permission check for a session-authenticated-but-non-staff OR anonymous request going
through `SessionAuthentication401`). Then confirm `GET /api/exam/admin/questions/` (IsAdminUser,
plain `SessionAuthentication`, per Milestone 3's fix) also returns `403` for anonymous — if
*every* admin-area endpoint actually returns 403 rather than 401 for anonymous access (due to the
Force403Mixin/plain-SessionAuthentication fixes applied in earlier milestones), then 401 only
ever occurs for genuinely-expired-mid-session cases (DRF's session backend finding a stale/
invalid session cookie value, which is a different code path than "no cookie at all") — confirm
this distinction holds and note it clearly in your report, since it affects how meaningful this
interceptor actually is in practice.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "Add global 401 handler redirecting to admin login on session expiry"
git push origin main
```

---

### Task 2: Surface DRF field validation errors in the admin form

**Files:**
- Modify: `frontend/src/pages/admin/ResourceFormPage.tsx`

- [ ] **Step 1: Replace the generic error string with field-level errors**

In `frontend/src/pages/admin/ResourceFormPage.tsx`, change the `error` state from a single
string to a record of field-name -> messages, and read DRF's validation error shape
(`{"field_name": ["This field is required."]}`) from a failed POST/PUT response:

```tsx
const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
const [error, setError] = useState("");
```

Replace the `handleSubmit` function's catch block:

```tsx
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      if (isEditing) {
        await api.put(`${config.endpoint}${id}/`, values);
      } else {
        await api.post(config.endpoint, values);
      }
      navigate(`/admin/${config.key}`);
    } catch (err) {
      const data =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : undefined;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setFieldErrors(data as Record<string, string[]>);
      } else {
        setError("Failed to save. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }
```

Then render per-field errors under each input. Change the field-rendering block's wrapping
`<div key={field.name}>` to also show `fieldErrors[field.name]` right after each input:

```tsx
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {field.label}
            </label>
            {/* ...unchanged input/textarea/checkbox/number/datetime rendering... */}
            {fieldErrors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[field.name].join(" ")}</p>
            )}
          </div>
        ))}
```

Keep the existing generic `{error && <p className="text-red-500 text-sm">{error}</p>}` line for
non-field errors (e.g. network failures, 500s, or a `{"detail": "..."}` shaped error that isn't
per-field).

- [ ] **Step 2: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Manual verification**

Start both servers, log in, go to `/admin/services/new`, submit with the required `title` field
left empty. Confirm the form now shows "This field is required." (or similar, whatever DRF's
actual message text is) directly under the Title field, instead of (or in addition to) the
generic "Failed to save" message. If no browser is available, verify via curl what DRF actually
returns for a validation failure (`curl -i -X POST http://localhost:8010/api/content/services/ -H "Content-Type: application/json" -d "{}"` while authenticated with a staff session cookie) and confirm the response body shape matches what the new code parses.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/admin/ResourceFormPage.tsx
git commit -m "Surface DRF field-level validation errors in the admin CRUD form"
git push origin main
```

---

### Task 3: HomePage loading/error states for stats and testimonials

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Add loading/error branches to the stats section**

In `frontend/src/pages/HomePage.tsx`, the stats section currently only renders
`{stats.data && (...)}`. Add sibling branches matching the pattern already used in the services
section directly above it:

```tsx
          {stats.loading && (
            <p className="text-center text-gray-400">Loading stats...</p>
          )}
          {stats.error && <p className="text-center text-red-400">{stats.error}</p>}
          {stats.data && (
```

(Only the two new lines are added; the existing `{stats.data && (...)}` block and its contents
are unchanged — just make sure the JSX still closes correctly with the three sibling
conditionals inside the same `<div className="container mx-auto px-4">`.)

- [ ] **Step 2: Add the same to the testimonials section**

```tsx
          {testimonials.loading && (
            <p className="text-center text-gray-500">Loading testimonials...</p>
          )}
          {testimonials.error && (
            <p className="text-center text-red-500">{testimonials.error}</p>
          )}
          {testimonials.data && (
```

- [ ] **Step 3: Verify it builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "Add loading/error states to HomePage stats and testimonials sections"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** Directly addresses the design spec's Milestone 8 stated scope ("auth, error
  handling, loading states, form validation... against real backend").
- **Type/name consistency:** `fieldErrors` typed as `Record<string, string[]>` matches DRF's
  actual validation error response shape (a dict of field name to list of message strings) —
  this is DRF's default `ValidationError` serialization, not a guess.
- **No placeholders:** every step has complete, runnable code, and each task's manual
  verification step includes a curl-based fallback for the no-browser-available case that's been
  standard practice throughout this migration.
- **Risk called out honestly:** Task 1's own Step 3 asks the implementer to verify whether the
  interceptor is even reachable in practice (since most admin 401s in this codebase were already
  converted to 403 in earlier milestones) rather than assuming it "just works" — this is
  deliberately not glossed over.
