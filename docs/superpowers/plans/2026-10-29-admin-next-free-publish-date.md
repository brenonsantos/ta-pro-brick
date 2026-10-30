# Admin Auto-Fill Next Available Publish Date Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically calculate and pre-fill the next available (unoccupied) publication date in the Admin challenge creation form, avoiding date collisions and manual calendar checks.

**Architecture:** Create pure utility function `getNextAvailablePublishDate` in `src/utils/dateUtils.ts` (or `src/utils/dailyChallenge.ts`), thoroughly unit-tested. Integrate into `AdminPage.tsx` so when challenges load or when the form resets, `publishDate` is automatically populated with the earliest unoccupied date $\ge$ today. Add conflict indicators and a 1-click "Próxima data livre" button next to the date input.

**Tech Stack:** TypeScript, React, Vitest.

## Global Constraints
- Do not overwrite `publishDate` when editing an existing challenge (`editingId !== null`).
- Date format must remain standard ISO `YYYY-MM-DD` compatible with `<input type="date">`.
- Unit tests must not depend on external services or network.
- All 82+ tests must pass warning-free (`npm test`).
- Production build must succeed cleanly (`npm run build`).

## Review Focus
1. **Timezone consistency:** Use local date components (`getFullYear`, `getMonth() + 1`, `getDate`) to avoid off-by-one errors from UTC conversion.
2. **Empty / Gap handling:** If today is free, pick today; if today and tomorrow are filled, pick the day after; if there is a gap in between, pick the earliest free day.
3. **Collision Warning:** Inform curator if they manually select a date that already has a challenge scheduled.
4. **Clean Reset:** When saving or clearing the form, recalculate the next free date based on updated challenges list.

---

### Task 1: Create `getNextAvailablePublishDate` Utility
**Files:**
- Create: `src/utils/publishDate.ts`
- Test: `src/utils/__tests__/publishDate.test.ts`

**Steps:**
- [ ] Write unit tests in `src/utils/__tests__/publishDate.test.ts` testing:
  - When no challenges exist, returns today.
  - When today has a challenge, returns tomorrow.
  - When today, tomorrow, and day+2 have challenges, returns day+3.
  - When there is a gap (e.g. today and day+2 filled, but tomorrow free), returns tomorrow.
  - Handles disordered lists and duplicate challenge dates correctly.
- [ ] Implement `getNextAvailablePublishDate(challenges: { publishDate: string }[], baseDate?: Date): string` in `src/utils/publishDate.ts`.
- [ ] Run `npm test` and verify all tests pass.

---

### Task 2: Integrate into `AdminPage.tsx`
**Files:**
- Modify: `src/pages/AdminPage.tsx`

**Steps:**
- [ ] Update form state initialization and `loadChallengesList`: automatically set `publishDate` to `getNextAvailablePublishDate(list)` when creating a new challenge.
- [ ] Update `handleResetForm` to use `getNextAvailablePublishDate(challenges)`.
- [ ] Add collision detection: if `challenges.some(c => c.publishDate === publishDate && c.id !== editingId)`, display a warning badge below the date input showing the existing car title.
- [ ] Add 1-click helper button/chip: `"⚡ Próxima livre"` to instantly jump to the next unoccupied date.
- [ ] Run `npm test` and `npm run build`.

---

### Task 3: Verification, Documentation, and PR Prep
**Files:**
- Modify: `plan.md`
- Create: `docs/pr/PR_ADMIN_NEXT_FREE_PUBLISH_DATE.md`

**Steps:**
- [ ] Visual verification with screenshot via CDP script.
- [ ] Update `plan.md` (Milestone 20).
- [ ] Create `docs/pr/PR_ADMIN_NEXT_FREE_PUBLISH_DATE.md`.
