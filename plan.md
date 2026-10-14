# Implementation Plan - Milestone 1: Playable Round Prototype

## Objective
Build a lightweight, mobile-first, client-side playable prototype of the single-round core gameplay loop for **Tá pro Brick**, validating the mechanics agreed in `DECISIONS.md`.

---

## Tasks

### 1. Project Scaffolding
- [x] Initialize Vite + React + TypeScript application in root or configured structure.
- [x] Install and configure Tailwind CSS and necessary developer tooling (Vitest for unit tests).
- [x] Ensure build and test scripts are functional and warning-free.

### 2. Domain Types & Configuration Module
- [x] Create `src/types/game.ts`: interfaces for `Challenge`, `Clue`, `Guess`, `AccuracyTier`, `HeatBand`, `RoundState`.
- [x] Create `src/config/gameConfig.ts`: centralize all numeric parameters (margins, floor values, scoring thresholds, unused attempt bonuses).

### 3. Core Business Logic & Unit Tests
- [x] Implement `src/utils/gameLogic.ts`:
  - `evaluateGuess`: heat band detection (Freezing, Warm, Hot, Win, Bullseye, Exact) and direction (Higher/Lower).
  - `calculateScore`: base points + remaining attempt bonus calculation.
  - `determineAccuracyTier`: distinguishes Standard Win, Bullseye, and Exact.
- [x] Implement `src/utils/currency.ts`: format BRL currency strings (`R$ 38.500`) and parse raw input.
- [x] Implement `src/utils/shareText.ts`: generate spoiler-free copyable text with emojis.
- [x] Write Vitest unit tests for all pure logic functions (12/12 passing).

### 4. Mock Data & Assets
- [x] Create `src/data/mockChallenge.json` containing 1 complete realistic Brazilian car listing with 5 structured clues (photos, description, location, time on market) and the secret price.

### 5. UI Components (Mobile-First)
- [x] **Header:** Game title ("Tá pro Brick"), attempt counter badge ("Tentativa X/6"), and help modal trigger.
- [x] **Clue Viewer:** Progressively unlocked clues (Title & Cover -> Gallery -> Description -> Location -> Time).
- [x] **Guess History:** Cards list displaying previous guesses with directional indicators (▲/▼) and color-coded heat bands.
- [x] **Guess Input Bar:** Mobile-friendly currency input with instant R$ formatting, quick increment buttons (+1k, +5k, +10k), and submit action.
- [x] **Round Summary & Victory Modal:**
  - Reveal asking price, full listing details, and score breakdown.
  - Interactive choice: "Encerrar Rodada" vs. "Continuar Tentando" when won with attempts remaining.
  - "Compartilhar Resultado" button with clipboard integration and feedback toast.

### 6. Verification & Testing
- [x] Run test suite (`npm test`) to verify all calculations (12 tests passing).
- [x] Run production build (`npm run build`) to ensure type safety and clean output.
- [ ] Perform manual user testing in browser.
