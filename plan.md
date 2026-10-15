# Implementation Plan - Milestone 2: Multi-Car Prototype & Gameplay Validation

## Objective
Expand the single-round prototype into a 5-car interactive showcase featuring diverse vehicle categories (budget car, classic, premium sedan, 6-cylinder muscle, and absurd collector price). Add a vehicle switcher and seamless next-round flow to allow thorough gameplay testing across different price scales, followed by deployment preparation.

---

## Tasks

### 1. Multi-Vehicle Mock Dataset
- [x] Create `src/data/mockChallenges.json` containing 5 detailed vehicle listings:
  1. **VW Gol GTS 1.8 1988 (R$ 44.900):** Anúncio real OLX (8 fotos locais) — hot hatch clássico.
  2. **Jeep Renegade Longitude 2023 (R$ 91.990):** Anúncio real Facebook Marketplace (13 fotos locais) — SUV moderno flex aut.
  3. **Chevrolet Chevette 1988 (R$ 14.999):** Anúncio real Facebook Marketplace (6 fotos locais) — Clássico acessível, "só pega e andar".
  4. **Fiat Tipo/147 1999 (R$ 2.400):** Anúncio real Facebook Marketplace (7 fotos locais) — Carro barato "só para rodar, documento é tumulto".
  5. **Rodas F1000 aro 16 (R$ 1.000):** Anúncio real Facebook Marketplace (2 fotos locais) — Peças / rodas usadas com ferrugem ("dá para salvar").

### 2. Vehicle Selector & Round Flow in UI
- [x] Add responsive vehicle selector navigation in `src/components/VehicleSelector.tsx` (quick switcher tabs: "1. Gol GTS", "2. Uno", "3. BMW", "4. Opala", "5. Fusca") with completed indicators.
- [x] Update `App.tsx` to handle multi-challenge state:
  - Preserves round state individually for each challenge across switching.
  - In `VictoryModal.tsx`, added "Jogar Próximo Carro de Teste" action button to advance sequentially through cars.

### 3. Verification & Testing
- [x] Run test suite (`npm test`) to ensure unit tests continue to pass (12/12 passing).
- [x] Run production build (`npm run build`) with zero TypeScript errors or warnings.
- [x] Verify in local browser.

### 4. Deployment Readiness (Option B Preparation)
- [x] Create `vercel.json` for zero-config SPA deployment on Vercel or similar static hosts.
- [x] Deployed live on Vercel (`https://ta-pro-brick.vercel.app`).

---

## Milestone 3: UX & Microcopy Streamlining
### Objective
Radically simplify on-screen text, particularly in onboarding (`HelpModal`) and game resolution/victory (`VictoryModal`), making the experience fast, visual, and mobile-friendly without overwhelming users with text.

### Tasks
- [x] **Simplify Onboarding (`HelpModal.tsx`)**:
  - Replace 4 walls of text (clue schedules, exact percentage formulas, risk math) with 3 punchy, visual bullet points (Objetivo, Pistas, Dicas).
  - Clean, compact single-view layout requiring minimal or zero scrolling.
- [x] **Simplify Victory & End-of-Round (`VictoryModal.tsx`)**:
  - Make headers and victory announcements punchy.
  - Simplify risk dilemma to a clean visual badge (+bonus points) and direct action buttons ("Garantir Vitória" vs "Tentar Cravar").
  - Streamline score breakdown into a sleek summary card (Preço Real, Seu Chute, Pontuação).
  - Shorten button labels.
- [x] **Validation & Testing**:
  - Run `npm test` and `npm run build`.
  - Verify UI on local dev and deploy to test on mobile.

---

## Milestone 4: Local Persistence & Player Statistics (Option 1)
### Objective
Ensure players never lose their in-progress guesses upon page refresh and maintain lifetime player statistics (games played, win percentage, daily streaks, and guess distribution) stored locally in `localStorage` without requiring an account.

### Tasks
- [x] **Data Model & Logic (`src/utils/statsManager.ts`)**:
  - Define `PlayerStats` (gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution, completedChallenges, lastPlayedDate).
  - Functions: `loadPlayerStats()`, `recordGameResult()`, `loadSavedGameStates()`, `saveGameStates()`.
  - Handle date calculations for streaks (consecutive days increment streak, missed days reset streak).
  - Deduplicate to prevent counting the same vehicle/challenge multiple times in stats.
- [x] **Stats UI & Visuals (`src/components/StatsModal.tsx`)**:
  - Clean modal matching Wordle styling: 4 stats counters (Jogados, % Vitórias, Sequência Atual, Melhor Sequência).
  - Guess distribution bar chart (Tentativas 1 a 5 com barras proporcionais).
- [x] **Integration in Header & Victory Modal**:
  - Add stats button (`BarChart2`) in `Header.tsx` to view stats anytime.
  - In `VictoryModal.tsx`, show quick stats pills or button to open full stats.
  - Integrate `loadSavedGameStates` and `saveGameStates` in `App.tsx` state management.
- [x] **Unit Tests**:
  - Test streak calculation, win/loss stats recording, and deduplication logic in `src/utils/__tests__/statsManager.test.ts`.
- [x] **Validation & Verification**:
  - Run `npm test` and `npm run build`.
  - Test locally and deploy to Vercel for mobile review.
