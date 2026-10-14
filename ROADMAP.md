# Development Roadmap (ROADMAP.md)

This document defines the development sequence for **Tá pro Brick**, prioritizing rapid validation of the core gameplay mechanics through small, iterative deliverables before committing to heavy infrastructure, authentication, or an administrative panel.

---

## Core Execution Principles

1. **Gameplay Validation Before Infrastructure:** The product's core value rests on whether the daily guessing round is engaging and fun. If guessing car prices isn't intuitive and entertaining, backend systems and admin panels offer no value.
2. **Small, Verifiable Increments:** Each milestone must produce a testable, interactive increment.
3. **English Codebase, Brazilian Portuguese Product:** All source code, types, functions, tests, and technical documentation are written in **English (`en-US`)**, while the user interface and game copy are in **Brazilian Portuguese (`pt-BR`)**.
4. **Configurable Mechanics:** Numerical parameters are isolated in a configuration file to facilitate continuous balancing based on real player feedback.

---

## Milestones

### Milestone 1: Playable Round Prototype (Mocked Core Loop)
* **Goal:** Deliver an interactive, mobile-first single-round experience using local static mock data.
* **Deliverables:**
  * Project scaffolding with Vite + React + TypeScript + Tailwind CSS.
  * Rules and scoring configuration module (`gameConfig.ts`).
  * Challenge data schema and local sample data (`mock-challenge.json` with local test photos).
  * Currency input component with Brazilian Real (`R$`) formatting.
  * Guess feedback display (directional arrows ▲/▼ and Wordle-style heat bands).
  * Progressive clue reveal (clues 1 to 5 revealed across attempts 1 to 5).
  * Victory handling (Standard Win, Bullseye, Exact), stop vs. continue dilemma, and round summary view.
  * Spoiler-free shareable text generator (heat band emojis and status).
* **Acceptance Criteria:** A user can play through a full round on a mobile browser or responsive viewport, inspect progressive clues, make 6 guesses, win/lose, and copy the shareable summary.

---

### Milestone 2: Gameplay Validation & Rules Balancing
* **Goal:** Validate player engagement, difficulty, and fairness with a small circle of testers.
* **Deliverables:**
  * Addition of 3 to 5 diverse test vehicle profiles in the mock dataset (economy car, classic/enthusiast vehicle, luxury/sports car, vehicle with an unconventional price).
  * Testing with 5 to 10 automotive enthusiasts and casual players.
  * Validation of the risk vs. reward scoring mechanic (evaluating whether players understand and enjoy the choice to stop vs. continue).
  * Fine-tuning of percentage tolerances and scoring values in `gameConfig.ts`.
* **Acceptance Criteria:** Qualitative feedback confirming the core loop is fun, intuitive, and balanced.

---

### Milestone 3: Content Pipeline & Legal Rights Strategy
* **Goal:** Resolve image rights and listing authorization workflows prior to backend development.
* **Deliverables:**
  * Identification of viable listing sources (direct partnerships with independent dealerships, car enthusiast YouTube channels, or community submissions).
  * Standardized consent terms and documentation process for photos and listing descriptions.
  * Manual editorial workflow sizing (estimating weekly effort to curate and freeze 7 challenges).
* **Acceptance Criteria:** A verified and repeatable pipeline capable of supplying at least 14 authorized challenges for closed testing.

---

### Milestone 4: Daily Game with Local Persistence (MVP Phase 1)
* **Goal:** Transform the prototype into a functional daily game accessible without requiring user accounts.
* **Deliverables:**
  * Daily calendar scheduler (one deterministic challenge per calendar date).
  * Client-side persistence and player statistics via `localStorage` (challenges completed, win rate, daily streak).
  * Anti-cheat baseline (preventing trivial inspection of the answer in initial payload).
  * Static deployment for continuous testing.
* **Acceptance Criteria:** Players can visit daily, play the single daily challenge, and maintain their streak locally across multiple days.

---

### Milestone 5: Admin Panel, Optional Accounts & Closed Beta (Complete MVP)
* **Goal:** Complete the MVP scope for sustainable manual operations and conduct a closed beta.
* **Deliverables:**
  * Lightweight backend/BaaS selection based on validated operational needs.
  * Optional Google OAuth login for cross-device streak and stats preservation.
  * Secure, lightweight admin panel for weekly challenge uploads, photo management, and consent records.
  * Execution of a 2-to-3-week closed beta test with enthusiasts, monitoring retention and sharing habits.
* **Acceptance Criteria:** Full editorial workflow operates smoothly and closed beta achieves steady daily return rates.
