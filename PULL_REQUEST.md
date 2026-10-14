# Pull Request: Milestone 1 — Core Gameplay Playable Prototype

## Summary of Changes
Implements the first interactive, mobile-first playable prototype for **Tá pro Brick**, establishing the core round loop:
- **Project Foundation:** Scaffolding with Vite, React 19, TypeScript, Tailwind CSS, Lucide icons, Canvas Confetti, and Vitest.
- **Rules Configuration Module (`src/config/gameConfig.ts`):** Isolates all numeric parameters (±5% win margin with R$ 1,000 floor, ±1% bullseye, R$ 1 exact tier, heat band thresholds, base points, and unused attempt bonuses).
- **Core Business Logic (`src/utils/gameLogic.ts`):** Pure functions for guess evaluation, directional feedback (▲/▼), heat band classification, and score calculation with 12 comprehensive unit tests.
- **Progressive Clues (`src/components/ClueViewer.tsx`):** Unlocks 5 clue tiers across attempts (Title & Cover -> Photo Gallery -> Seller Description -> Location -> Market Time). Attempt 6 serves as the final guess without new clues.
- **Mobile Guess Input & History (`src/components/GuessInput.tsx`, `src/components/GuessHistory.tsx`):** Currency masked input in BRL (`R$`), mobile quick-increment buttons (+1k, +5k, +10k), and Wordle-style color cards.
- **Victory & Score Dilemma (`src/components/VictoryModal.tsx`):** Interactive choice to stop and bank the unused attempt bonus (+500 pts per attempt) or spend attempts to aim for Bullseye / Exact.
- **Spoiler-Free Sharing (`src/utils/shareText.ts`):** Generates copyable summaries using emojis without leaking the secret price.

## Verification
- Unit Tests: 12 passing in Vitest (`npm test`).
- Production Build: Clean TypeScript compilation and Vite build with zero warnings (`npm run build`).

## Manual Testing Instructions
1. Run `npm run dev` and open the local URL in a browser (or mobile viewport).
2. Clue 1 (Title + Cover Photo) should be immediately visible.
3. Submit a guess below the actual price (e.g. `R$ 30.000`):
   - Verify indicator shows `▲ Maior` and heat band is blue/yellow.
   - Verify Clue 2 (Photo Gallery) unlocks with carousel navigation.
4. Submit subsequent guesses and check progressive unlocking of Description, Location, and Time.
5. Guess near `R$ 48.900` (e.g. `R$ 49.000`) to test the Victory modal, score breakdown, and share button.
