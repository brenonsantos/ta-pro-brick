# Auto-Upload Facebook Images to Supabase Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically download images extracted from Facebook Marketplace (`fbcdn.net`) and re-host them permanently in Supabase Storage, preventing broken photos caused by expiring Facebook CDN signatures.

**Architecture:** Extend `storageService.ts` with `uploadPhotoFromUrl`, `isExternalPhotoUrl`, and `transferExternalPhotosToStorage`. Integrate automatic migration directly into `ImportChallengeModal` (with progress bar and toggle) and add a 1-click migration button and photo source badges to `AdminPage`.

**Tech Stack:** React 19, TypeScript, Supabase Storage API, Fetch / Blob API, Vitest.

**Spec:** Requirement from user to prevent Facebook CDN link expiration by automatically storing scraped photos in Supabase Storage.

## Global Constraints
- Core game must remain playable without account.
- If Supabase Storage is not configured, fall back gracefully without blocking challenge import.
- Failed downloads (e.g. already-expired links) must not crash the app or discard the challenge; report errors clearly to curator.
- All tests must pass warning-free (`npm test`).
- Production build must succeed cleanly (`npm run build`).

## Review Focus
1. **Expiring vs Fresh Facebook URLs:** Fresh URLs fetch cleanly; expired URLs (403) must be caught and flagged without breaking the import.
2. **Supabase Not Configured:** Safe fallback if `isSupabaseConfigured() === false`.
3. **Storage Sanitization:** File paths and names in `challenges` bucket must be sanitized to avoid invalid S3/Supabase key errors.
4. **CORS / Network Error Handling:** Catch and report fetch failures gracefully.
5. **UI Responsiveness:** Show upload progress (e.g. "Transferindo 2/5...") so the curator doesn't assume the app is frozen.

---

### Task 1: Add Image Download and Re-hosting Helpers in `storageService.ts`
**Files:**
- Modify: `src/services/storageService.ts`
- Test: `src/services/__tests__/storageService.test.ts`

**Steps:**
- [ ] Create unit tests in `src/services/__tests__/storageService.test.ts` testing `isExternalPhotoUrl`, `uploadPhotoFromUrl`, and `transferExternalPhotosToStorage`.
- [ ] Implement `isExternalPhotoUrl(url: string): boolean` to detect whether a URL points to an external source (such as `fbcdn.net`) vs local `/cars/` or Supabase Storage.
- [ ] Implement `uploadPhotoFromUrl(imageUrl: string, fileNamePrefix?: string): Promise<UploadPhotoResult>` to fetch image blobs and upload to Supabase Storage bucket `challenges`.
- [ ] Implement `transferExternalPhotosToStorage(photoUrls: string[], titlePrefix?: string, onProgress?: ...): Promise<TransferPhotosResult>` to process batches.
- [ ] Run `npm test` and verify tests pass.

---

### Task 2: Integrate Auto-Transfer in `ImportChallengeModal.tsx`
**Files:**
- Modify: `src/components/ImportChallengeModal.tsx`
- Test: `src/components/__tests__/ImportChallengeModal.test.tsx`

**Steps:**
- [ ] Add toggle checkbox: "Salvar fotos no Supabase Storage automaticamente (recomendado)" (default: checked if Supabase configured).
- [ ] Add progress display when transferring photos (e.g. "Salvando fotos no Supabase Storage permanente... (2/5)").
- [ ] Invoke `transferExternalPhotosToStorage` before triggering `onImport`.
- [ ] Add unit test verifying that `ImportChallengeModal` calls the transfer helper and shows progress.
- [ ] Run `npm test` and verify tests pass.

---

### Task 3: Add 1-Click Migration and Visual Badges to `AdminPage.tsx`
**Files:**
- Modify: `src/pages/AdminPage.tsx`

**Steps:**
- [ ] Detect if any URLs in the challenge's photos list are external (`isExternalPhotoUrl`).
- [ ] Display an alert banner when external/expiring URLs are detected: "⚠️ Há X fotos externas (Facebook CDN) que irão expirar. Clique para migrar para o Supabase Storage."
- [ ] Add button "☁️ Migrar fotos para o Supabase Storage" with progress feedback.
- [ ] In the photo thumbnails preview, add visual badge: green "Supabase" vs orange "Facebook / Externo".
- [ ] Run `npm test` and `npm run build`.

---

### Task 4: Documentation, Verification, and PR Preparation
**Files:**
- Modify: `plan.md`
- Create: `docs/pr/PR_AUTO_UPLOAD_FB_IMAGES_STORAGE.md`

**Steps:**
- [ ] Run full test suite (`npm test`).
- [ ] Run production build (`npm run build`).
- [ ] Update `plan.md` with Milestone 19.
- [ ] Create PR document `docs/pr/PR_AUTO_UPLOAD_FB_IMAGES_STORAGE.md`.
- [ ] Visually verify `/admin` and import modal.
