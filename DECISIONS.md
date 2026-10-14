# Architecture & Product Decisions (DECISIONS.md)

This document records the architectural and product decisions agreed upon for the development of **Tá pro Brick** (working title: "Chuta a FIPE").

> **Language & Code Convention:** All source code (identifiers, types, functions, file names, documentation, commit messages, and technical comments) must be written in **English (`en-US`)**. End-user facing content, interface copy, and game data are in **Brazilian Portuguese (`pt-BR`)**.

---

## 1. Confirmed Decisions for the Playable Prototype

### 1.1 Clue Progression × Attempts
* Each round consists of **6 attempts** for **5 clue groups**.
* **Progression sequence:**
  * **Attempt 1 (Initial state):** Clue 1 (Listing title and primary cover photo).
  * **Attempt 2 (After 1st miss):** Clue 2 (Gallery with remaining photos).
  * **Attempt 3 (After 2nd miss):** Clue 3 (Full listing description).
  * **Attempt 4 (After 3rd miss):** Clue 4 (Location: city and state).
  * **Attempt 5 (After 4th miss):** Clue 5 (Time elapsed since listing publication).
  * **Attempt 6 (Last chance):** No additional clues revealed. The player uses all accumulated context and directional feedback from previous attempts for their final guess.

### 1.2 Victory Condition & Accuracy Tiers
All tiers count as a "Win" for daily streak maintenance, but grant distinct point bonuses and visual badges:
* **Standard Win:** Guess within a margin of **±5%** of the seller's asking price, with a minimum floor of **R$ 1,000.00** to protect low-value vehicles.
* **Bullseye / "Na Mosca" (High Bonus):** Guess within **±1%** of the asking price.
* **Exact / "Cravou" (Maximum Bonus):** Guess within **R$ 1.00** difference or exact asking price.

### 1.3 Visual Proximity Feedback ("Hot or Cold")
* Every confirmed guess displays:
  * **Direction:** Clear indicator whether the actual asking price is higher (▲) or lower (▼).
  * **Heat Bands (Wordle-style color indicators):**
    * 🔵 **Freezing / Far off:** Error > 50%.
    * 🟡 **Warm / Moderate:** Error between 20% and 50%.
    * 🟠 **Hot / Very close:** Error between 5% and 20%.
    * 🟢 **Win:** Within ±5% (or R$ 1,000 floor).
    * 🟣 / 🟡✨ **Bullseye / Exact:** Within ±1% or within R$ 1.00.
* No exact numeric percentages are displayed on the UI to keep the mystery and challenge intact.

### 1.4 Scoring Mechanics & Risk vs. Reward
* **Base Points by Best Guess Tier Achieved:**
  * *Loss / Close (Orange band):* Up to 3,000 points (proportional to proximity).
  * *Standard Win (±5%):* 6,000 points.
  * *Bullseye (±1%):* 8,500 points.
  * *Exact (Within R$ 1):* 10,000 points.
* **Unused Attempts Bonus:** **+500 points** for each remaining attempt not used.
* **Stop vs. Continue Dilemma:**
  * Upon hitting a standard win (5%), the player can choose to bank their score (securing the unused attempts bonus) or spend remaining attempts to reach "Bullseye" or "Exact".
  * The win status and best result are never lost, but spending attempts without improving tiers consumes the remaining attempt bonus.

### 1.5 Numerical Configuration Isolation
* All numerical constants (tolerances, minimum currency floors, base points, and unused attempt bonuses) must be isolated in a dedicated configuration module (`gameConfig.ts`). This allows rapid balance adjustments without modifying game logic.

### 1.6 Prototype Technical Stack
* **Frontend:** Vite + React + TypeScript + Tailwind CSS.
* **Prototype Architecture:** 100% client-side, zero backend, zero database dependencies.
* **Test Data:** Sourced from a local static mock JSON file (`mock-challenge.json`) accompanied by local sample assets.

---

## 2. Deferred Decisions (Post-Prototype Milestones)

| Topic | Current Status | When to Decide |
| :--- | :--- | :--- |
| **Final Game Name & Branding** | Working title ("Tá pro Brick" / "Chuta a FIPE") | Before public release |
| **Visual Identity & Logo** | Clean, neutral styling for prototype | During MVP validation |
| **Production Architecture & Backend** | Static client prototype | After mechanics are validated with users |
| **Remote Persistence & Database** | Local storage / mock only | During daily calendar implementation |
| **Authentication (Google OAuth)** | Not needed for prototype | Accounts milestone in MVP |
| **Admin Panel & Editorial Flow** | Manual JSON files for prototype | After core loop is proven |
| **Commercial Listing Permissions Pipeline** | Mock/authorized test data | Prior to testing with third-party public listings |
| **Timezone & Daily Reset Cutoff** | Not applicable for prototype | Production daily challenge release |
