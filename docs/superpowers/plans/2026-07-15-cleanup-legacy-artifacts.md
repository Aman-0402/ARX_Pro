# Cleanup Legacy Artifacts (Milestone 9) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the artifacts already identified as dead/superseded during earlier milestones'
analysis and pre-approved by the user during brainstorming: the stale `nextjs/nextjspro/`
duplicate, the root-level legacy PHP files with a leaked DB password, and the now-fully-migrated
`nextjs/exam/*.php` standalone exam system.

**Architecture:** Pure deletion + verification that nothing else in the repo references the
removed paths. No code changes to `backend/` or `frontend/` — those are already feature-complete
and independent of these files.

**Tech Stack:** N/A — file removal + grep-based reference checks.

---

## Note on scope

This plan covers ONLY the deletions explicitly pre-approved during this migration's brainstorming
phase (see `docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`):
- `nextjs/nextjspro/` — confirmed stale duplicate, canonical source is `nextjs/` top-level.
- Root `nextjs/contact.php` and `nextjs/verify.php` — confirmed superseded by the ported Django
  endpoints, explicitly approved for deletion (also removes a leaked plaintext DB password).
- `nextjs/exam/*.php` — the standalone PHP exam system, fully ported to Django in Milestones 3
  and 7 (voucher validation, question delivery, scoring, results, admin management all live).

Removing the ENTIRE `nextjs/` directory (the Next.js app itself, now fully superseded by
`backend/`+`frontend/`) is a separate, much larger decision — the design spec calls it out as
"remove `/nextjs` once parity confirmed" but that confirmation hasn't happened yet in this
conversation. That step is NOT part of this plan; it needs an explicit go-ahead after this
plan's smaller, pre-approved deletions land, since it deletes the entire reference implementation
the rest of this migration was built against.

## File Structure

No new files. Deletions only:
```
nextjs/nextjspro/           (entire directory, ~large - own node_modules/.next build)
nextjs/contact.php
nextjs/verify.php
nextjs/exam/                (entire directory - PHP files, database.sql, assets)
```

---

### Task 1: Remove the stale `nextjs/nextjspro/` duplicate

**Files:**
- Delete: `nextjs/nextjspro/` (entire directory)

- [ ] **Step 1: Confirm nothing outside `nextjspro/` references it**

Run: `cd D:\code\GITHUB\ARX_Pro && grep -rl "nextjspro" --include="*.ts" --include="*.tsx" --include="*.py" --include="*.json" backend frontend nextjs/app nextjs/components nextjs/lib 2>/dev/null`
Expected: no output (no references from the canonical `nextjs/` tree, `backend/`, or
`frontend/` — `nextjspro/` is genuinely self-contained and unreferenced).

- [ ] **Step 2: Delete it**

Run: `cd D:\code\GITHUB\ARX_Pro && rm -rf nextjs/nextjspro`

- [ ] **Step 3: Verify the canonical app still builds** (sanity check that nothing was
cross-referencing it)

Run: `cd nextjs && npm run build 2>&1 | tail -30`
Expected: build succeeds or fails only for reasons unrelated to `nextjspro` (e.g. missing env
vars for a fresh checkout) — the goal is confirming no import ever pointed into the deleted
directory. If the build fails with a module-not-found error referencing `nextjspro`, STOP,
restore the directory (`git checkout -- nextjs/nextjspro` if committed, otherwise this indicates
a real dependency that needs investigating before deleting), and report back rather than forcing
the deletion through.

- [ ] **Step 4: Commit**

```bash
cd D:\code\GITHUB\ARX_Pro
git add -A nextjs/nextjspro
git commit -m "Remove stale nextjs/nextjspro duplicate (superseded by nextjs/ top-level)"
git push origin main
```

---

### Task 2: Remove legacy root PHP files

**Files:**
- Delete: `nextjs/contact.php`
- Delete: `nextjs/verify.php`

- [ ] **Step 1: Confirm nothing references these files**

Run: `cd D:\code\GITHUB\ARX_Pro && grep -rln "contact\.php\|verify\.php" nextjs/app nextjs/components nextjs/public frontend backend 2>/dev/null`
Expected: no output, or only matches inside `.html` files that already have equivalent React
routes (`nextjs/contact.html`, `nextjs/index.html` etc. are separate static legacy files, not
part of the Next.js app itself — note any hits here for awareness but they don't block this
deletion, since those static HTML files are themselves out of scope/pre-Next.js artifacts, not
something this migration is porting).

- [ ] **Step 2: Delete both files**

Run: `cd D:\code\GITHUB\ARX_Pro && rm -f nextjs/contact.php nextjs/verify.php`

- [ ] **Step 3: Commit**

```bash
git add -A nextjs/contact.php nextjs/verify.php
git commit -m "Remove legacy contact.php/verify.php (superseded by Django content API, removes leaked DB credential)"
git push origin main
```

---

### Task 3: Remove the fully-migrated standalone PHP exam system

**Files:**
- Delete: `nextjs/exam/` (entire directory)

- [ ] **Step 1: Confirm the Django exam API covers everything this PHP system did**

This is a verification step, not new code — cross-check against what's already built:
- `nextjs/exam/candidate/register.php` (voucher validation + candidate creation) ->
  `backend/apps/exam/views.py::RegisterView` (Milestone 3) + `frontend/src/pages/exam/ExamRegisterPage.tsx`
  (Milestone 7).
- `nextjs/exam/candidate/exam.php` (45 random questions) -> `QuestionsView` +
  `frontend/src/pages/exam/ExamPage.tsx`.
- `nextjs/exam/candidate/submit.php` (scoring) -> `SubmitView` + the submit call in `ExamPage.tsx`.
- `nextjs/exam/candidate/result.php` (result display) -> `ResultView` +
  `frontend/src/pages/exam/ExamResultPage.tsx`.
- `nextjs/exam/admin/login.php` + `dashboard.php` (exam-admin auth + question/voucher/result
  management) -> `backend/apps/accounts` session auth + `ExamQuestionAdminViewSet`/
  `ExamVoucherAdminViewSet`/`ExamResultAdminViewSet` + the `exam-questions`/`exam-vouchers`/
  `exam-results` entries in `frontend/src/config/adminResources.ts` (Milestone 6/7).
- `nextjs/exam/assests/proctor.js` (webcam proctoring) -> explicitly NOT ported (documented,
  accepted scope trim in Milestone 7's plan) — this is the one piece of functionality this
  deletion genuinely drops, not just relocates. Confirm this is still an acceptable trade-off
  before deleting (it was already accepted when Milestone 7 was planned, but double-check here
  since deletion is the point of no return for the PHP reference implementation).
- `nextjs/exam/config.php` and `nextjs/exam/database.sql` — legacy DB connection config (with
  ANOTHER hardcoded plaintext password, same class of leak as `verify.php`'s) and the original
  MySQL schema definition. Both fully superseded by `backend/config/settings.py`'s
  `DATABASE_URL`-based config and `backend/apps/exam/models.py`'s migrations.

If any of the above mappings seem wrong or incomplete when you check the actual current code
(not just this plan's description of it), STOP and report back rather than deleting.

- [ ] **Step 2: Confirm nothing references `nextjs/exam/`**

Run: `cd D:\code\GITHUB\ARX_Pro && grep -rln "exam/" nextjs/app nextjs/components nextjs/lib 2>/dev/null`
Expected: no output (the Next.js app's own pages never linked into the standalone PHP exam
system — it was always a separate, unlinked subdirectory, per the original project analysis).

- [ ] **Step 3: Delete it**

Run: `cd D:\code\GITHUB\ARX_Pro && rm -rf nextjs/exam`

- [ ] **Step 4: Commit**

```bash
git add -A nextjs/exam
git commit -m "Remove standalone PHP exam system, fully ported to Django/React (removes another leaked DB credential)"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** Matches exactly the three pre-approved deletions from
  `docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`'s "Milestone 9"
  bullet and the earlier `AskUserQuestion` answers in this conversation (nextjspro = stale
  duplicate; contact.php/verify.php = delete; exam = migrate then the PHP original becomes
  removable). Does NOT include removing all of `/nextjs/` — that's explicitly called out as
  needing separate confirmation, not assumed.
- **Safety:** Every deletion step has a "confirm nothing references it first" step before the
  actual `rm`, and Task 1's build-check step provides an actual runtime safety net, not just a
  grep. Task 3 explicitly reconfirms the webcam-proctoring scope trade-off one more time before
  the point of no return, rather than treating Milestone 7's earlier acceptance as a blank check.
- **No placeholders:** every step has exact, runnable commands.
