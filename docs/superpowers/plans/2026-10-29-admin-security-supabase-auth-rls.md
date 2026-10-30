# Admin Security: Supabase Auth & Production RLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the `/admin` curation portal and Supabase backend by replacing plain client-side passwords with real Supabase Auth (email & password), enforcing strict Row Level Security (RLS) policies (preventing unauthorized challenge creation/deletion and future car leaks), and adding search engine crawler controls (`robots.txt` & `sitemap.xml`).

**Architecture:**
- Frontend: Implement Supabase Auth login (`supabase.auth.signInWithPassword`, `getSession`, `onAuthStateChange`, `signOut`) in `AdminPage.tsx` with offline/local fallback.
- Backend: Provide comprehensive SQL migration `supabase/secure_production_rls.sql` enforcing authenticated role on `challenges` write operations and hiding unreleased challenges from public `anon` queries.
- SEO / Web Security: Add `public/robots.txt` and `public/sitemap.xml` preventing search engines from indexing `/admin`.

**Tech Stack:** TypeScript, React, Supabase Auth JS SDK, PostgreSQL RLS, Vitest.

## Global Constraints
- Core game must continue to function seamlessly without requiring players to log in.
- Offline/local dev mode must remain functional when `isSupabaseConfigured() === false`.
- Do not break existing unit tests.
- All 89+ unit tests must pass (`npm test`).
- Production build must succeed cleanly (`npm run build`).

## Review Focus
1. **Session Persistence:** When refreshing `/admin`, authenticated Supabase sessions must persist without re-prompting for credentials.
2. **Offline Fallback:** If `isSupabaseConfigured()` is false, fall back gracefully to local passkey so offline testing remains functional.
3. **Anti-Leak RLS:** Unauthenticated visitors must never be able to read future unpublished challenges via `select * from challenges`.
4. **Storage Object Protection:** Bucket upload/delete permissions restricted to `authenticated` users while keeping image view public.
5. **Crawler Exclusion:** `robots.txt` properly configured to block indexing of `/admin`.

---

### Task 1: Create Supabase Auth Service & Helpers
**Files:**
- Create: `src/services/authService.ts`
- Test: `src/services/__tests__/authService.test.ts`

**Steps:**
- [ ] Write unit tests for `authService.ts` testing `signInAdmin`, `signOutAdmin`, `getAdminSession`, and `subscribeToAuthChanges`.
- [ ] Implement `signInAdmin(email, password)` wrapping `supabase.auth.signInWithPassword`.
- [ ] Implement `signOutAdmin()` wrapping `supabase.auth.signOut`.
- [ ] Implement `getAdminSession()` and `subscribeToAuthChanges(callback)`.
- [ ] Run `npm test` and verify passing.

---

### Task 2: Update `AdminPage.tsx` with Real Supabase Auth & Session Handling
**Files:**
- Modify: `src/pages/AdminPage.tsx`

**Steps:**
- [ ] Connect `AdminPage` to `authService`:
  - When Supabase is configured: show Email & Password login form.
  - On submit: call `signInAdmin(email, password)` with clean error messages (e.g. "Credenciais inválidas").
  - On mount: check `getAdminSession()` to restore active session automatically.
  - On logout: call `signOutAdmin()`.
  - When Supabase is NOT configured (offline): show developer passkey field as fallback.
- [ ] Run `npm test` and `npm run build`.

---

### Task 3: Production SQL Migration for Strict RLS & Storage
**Files:**
- Create: `supabase/secure_production_rls.sql`

**Steps:**
- [ ] Write `supabase/secure_production_rls.sql`:
  - Enable RLS on `challenges`.
  - Add select policy for `anon`: `is_published = true AND publish_date <= CURRENT_DATE`.
  - Add select policy for `authenticated`: `true` (admins see all past, present, and future challenges).
  - Add insert/update/delete policies for `authenticated`: `true`.
  - Restrict storage uploads and deletions in bucket `challenges` to `auth.role() = 'authenticated'`.
  - Maintain public read on storage objects for `challenges`.

---

### Task 4: Add `robots.txt` and `sitemap.xml`
**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

**Steps:**
- [ ] Create `public/robots.txt` disallowing `/admin` and pointing to sitemap.
- [ ] Create `public/sitemap.xml` with canonical domain `https://taprobrick.com.br/`.

---

### Task 5: Verification, Documentation, and PR Prep
**Files:**
- Modify: `plan.md`
- Create: `docs/pr/PR_ADMIN_SECURITY_SUPABASE_AUTH_RLS.md`

**Steps:**
- [ ] Run full test suite (`npm test`).
- [ ] Run production build (`npm run build`).
- [ ] Visual verification of login screen via CDP screenshot.
- [ ] Update `plan.md` (Milestone 21).
- [ ] Create PR document `docs/pr/PR_ADMIN_SECURITY_SUPABASE_AUTH_RLS.md`.
