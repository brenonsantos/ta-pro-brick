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

---

## Milestone 5: Daily Challenge Mechanics (Local Only)
### Objective
Transition the game into an official daily challenge where all players receive the same vehicle challenge for the day, accompanied by a midnight countdown timer once completed, while maintaining an accessible "Modo Treino / Garagem" for exploratory play. (Changes strictly local, no deployment).

### Tasks
- [x] **Daily Deterministic Scheduler (`src/utils/dailyChallenge.ts`)**:
  - Deterministically map current date (`YYYY-MM-DD`) to an official daily challenge index/ID.
  - Calculate remaining time to next midnight (`00:00:00`).
  - Compute daily challenge number (e.g. `#1`, `#2`, ...).
- [x] **Countdown & Daily Completion Banner (`src/components/DailyCountdown.tsx`)**:
  - Live ticking timer (`HH:MM:SS`) until next daily challenge.
  - Informative banner when today's official challenge is completed.
- [x] **Game Mode Switcher (Desafio Diário vs Modo Treino)**:
  - Default view is today's official challenge (clean, focused, without vehicle selector distraction).
  - Optional toggle to "Modo Treino / Garagem" so users/friends can test any vehicle.
  - Separate daily challenge state so training mode does not corrupt official daily streaks.
- [x] **Update Share Text**:
  - Include official daily challenge number (e.g., `Tá pro Brick #1`).
- [x] **Validation & Local Testing**:
  - Unit tests for date mapping and countdown calculation.
  - Build check and verify in local browser.
  - Keep strictly local on branch `feature/daily-challenge-mode` without deploying.

---

## Milestone 6: Launch Polish & Mascot Branding
### Objective
Finalize gameplay polish, fix edge-case modal dilemmas, streamline header micro-interactions, reveal locked clues on game over, and integrate the official high-resolution mascot brand identity.

### Tasks
- [x] **Post-Game Clue Revelation & UI Refinement**:
  - Automatically reveal all locked clues (photos, description, location, posting date) once round completes (`status !== 'in_progress'`).
  - Add smooth touch swipe support and pagination dots for mobile gallery browsing.
  - Remove redundant "mais fotos liberadas" badge upon changing photos.
- [x] **Dilemma Flow Bugfix (`VictoryModal.tsx`)**:
  - Prevent players from getting stuck in an unresolvable state: close button (`X`) is only rendered once round is fully completed (`gameState.status === 'completed'`), preventing closure during the risk/secure dilemma.
- [x] **Header & Input Streamlining**:
  - Remove attempt counter pill from `Header.tsx`.
  - Embed dynamic attempt status directly on submit button (`CONFIRMAR 1/5` to `5/5`).
- [x] **Official Brand Mascot & Favicon**:
  - Integrated custom "Lasanha no Carrinho de Compras" logo into `public/logo.png` and favicon.
  - Scaled from high-res master with 7x Retina crispness (136 KB).
  - Framed in amber rounded-square badge container in header matching the design aesthetic.
- [x] **Validation & Testing**:
  - All 25 vitest tests passing.
  - Production build clean with zero TypeScript errors.

---

## Milestone 7: Supabase Backend, Ranking por Pontos, Auth & Admin Panel
### Objective
Transition the game from static mocks to a cloud-backed architecture with Supabase:
1. Leaderboard by points (Daily Ranking + All-time Leaderboard) with anti-spoiler protection.
2. Frictionless session management: instant anonymous play + optional Google login to sync progress across devices.
3. Protected `/admin` panel to view the calendar and schedule future vehicle challenges with photos and clues.
4. Resilient offline/local fallback so the app runs smoothly with or without Supabase env credentials.

### Tasks
- [x] **Database & Supabase Architecture (`supabase/schema.sql`, `src/services/supabase.ts`)**:
  - Tables: `challenges`, `players`, `daily_results`.
  - Views / Functions for Leaderboard by Points:
    - Daily ranking ordered by `score DESC`, `attempts_count ASC`, `created_at ASC`.
    - All-time ranking ordered by `total_score DESC`, `streaks DESC`.
  - Row Level Security (RLS) to protect unpublished future challenges and admin operations.
  - Client service with graceful fallback to local storage / mock data if credentials are not configured yet.
- [x] **Player Identity & Anonymous Sessions (`src/services/playerService.ts`)**:
  - Automatically manage anonymous player UUID and nickname ("Piloto #123").
  - Allow player to customize their nickname in the Leaderboard modal.
  - Optional Google sign-in integration to link anonymous identity to an authenticated account.
- [x] **Ranking por Pontos Component (`src/components/LeaderboardModal.tsx`)**:
  - Trophy icon button in `Header.tsx` to view ranking anytime.
  - Shortcut button directly in `VictoryModal.tsx` ("Ver Ranking").
  - Tabs: "Hoje (Desafio Diário)" e "Geral (Pontuação Acumulada)".
  - Displays Rank (#1, #2...), Nickname, Pontos, Chutes e Medalhas.
  - Anti-spoiler banner for players who haven't completed today's challenge.
- [x] **Admin Panel (`src/pages/AdminPage.tsx`, `src/services/adminService.ts`)**:
  - Accessible via URL hash/route (e.g. `?admin` or `/#admin`).
  - Passcode protection (`adminbrick` / `VITE_ADMIN_PASSWORD`).
  - Calendar/list view of published vs upcoming scheduled challenges.
  - Challenge editor form: date, vehicle title, announced price, photo URLs, description, location, time posted, permissions.
- [x] **Validation & Verification**:
  - 29 unit tests passing (`npm test`).
  - Production build clean with zero TypeScript errors (`npm run build`).

---

## Milestone 8: Contato, Sugestões/Remoção, LGPD/Cookies & Ads Não-Intrusivo
### Objective
Implement essential legal, community, and monetization-ready foundations:
1. Contact & Community Modal: submit car listing suggestions, request listing removal (DMCA/direitos), and developer/Instagram contacts.
2. LGPD-compliant Cookie Consent Banner stored in local storage.
3. Non-intrusive ad slot displayed only after game completion.

### Tasks
- [x] **Contact Modal (`src/components/ContactModal.tsx`)**:
  - Tabs: "Sugerir Anúncio", "Pedir Remoção" e "Contato / Redes".
  - Pre-fills mailto or community form for easy submission without friction.
  - Links to Instagram (@taprobrick) and contact email.
- [x] **Cookie Consent Banner (`src/components/CookieBanner.tsx`)**:
  - Discrete bottom banner for LGPD/cookies compliance.
  - "Entendi" button storing choice in localStorage.
- [x] **Non-Intrusive Ad Slot (`src/components/AdBannerSlot.tsx`)**:
  - Appears only when the round is completed (`status === 'completed'`).
  - Subtle label "Publicidade" with placeholder / Google AdSense container.
- [x] **Footer & Navigation Integration (`src/App.tsx`, `src/components/Header.tsx`)**:
  - Links in footer for "Sugerir Anúncio", "Remover Anúncio", "Contato & Redes" e "Curadoria".
- [x] **Validation & Verification**:
  - 35 unit tests passing (`npm test`).
  - Production build clean with zero TypeScript errors (`npm run build`).

---

## Milestone 9: Desativação Temporária de Ads, Treino/Arquivo & Limpeza do Rodapé
### Objective
Refine the UI per user instruction:
1. Temporarily disable the ad banner slot until officially approved/needed.
2. Hide the "Curadoria" link from the public footer (keeping direct `/admin` and `/#admin` access intact for admins).
3. Remove emojis from footer links ("Sugerir Anúncio", "Remover Anúncio", "Contato").
4. Temporarily disable "Modo Treino" (saving it to be relaunched in the future as "Arquivo").

### Tasks
- [x] **Disable Ad Banner in `App.tsx`**:
  - Remove/guard `<AdBannerSlot />` with flag so no ad placeholder renders.
- [x] **Clean Footer in `App.tsx`**:
  - Remove emojis: "Sugerir Anúncio", "Remover Anúncio", "Contato".
  - Hide "Curadoria" button and separator dot from the footer.
- [x] **Disable Training Mode & Prepare Future "Arquivo"**:
  - Hide toggle button in `Header.tsx` by not passing toggle handler.
  - Hide "Modo Treino" button in `DailyCountdown.tsx`.
  - Disable vehicle switcher and multi-car next round in `VictoryModal.tsx`.
  - Document that the future re-introduction will be named "Arquivo".
- [x] **Validation & Verification**:
  - Verify all 36 tests pass with `npm test`.
  - Verify production build with `npm run build`.

---

## Milestone 10: Limpeza de Mocks do Ranking & Envio via Instagram nas Abas de Contato
### Objective
1. Remove all mock/simulated pilot entries from the local leaderboard so only real player entries appear.
2. Provide elegant empty states in `LeaderboardModal` when no player has logged a score yet.
3. In `ContactModal`, add direct Instagram action buttons in "Sugerir Anúncio" and "Remover Anúncio", pre-formatting the message and launching Instagram Direct.

### Tasks
- [x] **Clean Mock Pilots from `rankingService.ts`**:
  - Remove `getSimulatedDailyEntries` and hardcoded `baseMocks`.
  - Local leaderboard only returns entries actually recorded in the store.
- [x] **Empty States in `LeaderboardModal.tsx`**:
  - Add friendly empty states when `dailyEntries.length === 0` or `allTimeEntries.length === 0`.
- [x] **Instagram Direct Action in `ContactModal.tsx`**:
  - Add "Enviar por Instagram" in Tab 1 (Sugerir Anúncio).
  - Add "Solicitar via Instagram" in Tab 2 (Remover Anúncio).
- [x] **Validation & Verification**:
  - Update unit tests in `rankingService.test.ts` and `ContactAndCookies.test.tsx`.
  - Run `npm test` (36/36 passing) and `npm run build` (0 errors).

---

## Milestone 11: Brand & Contact Updates and Hybrid Facebook Marketplace Extractor
### Objective
1. Update contact email to `taprobrick.jogo@gmail.com` and Instagram handle to `@taprobrick.jogo` across the application and tests.
2. Standardize canonical game domain links to `https://taprobrick.com.br` across meta tags, share texts, and documentation.
3. Develop a hybrid browser extractor tool (bookmarklet / console script / helper) that enables curators to extract listing details (title, price, description, location, time on market, high-res photos, and source URL) directly from Facebook Marketplace listings in their authenticated browser, with one-click export into Tá pro Brick's admin curation panel.
4. Add an "Importar Dados do Anúncio (JSON/Texto)" feature in the Admin Panel (`/admin`) to paste extracted data and populate all fields in 1 click.

### Tasks
- [x] **Brand & Contact Information Updates**:
  - Update `CONTACT_EMAIL` default to `taprobrick.jogo@gmail.com` in `ContactModal.tsx`.
  - Update `INSTAGRAM_HANDLE` default to `taprobrick.jogo` in `ContactModal.tsx`.
  - Update `index.html` Open Graph and canonical links to `https://taprobrick.com.br`.
  - Update any existing unit tests expecting old contact info.
- [x] **Hybrid Facebook Marketplace Extractor Tool**:
  - Create `scripts/fb-marketplace-extractor.js`:
    - Robust DOM extraction logic targeting Facebook Marketplace listing structure (title, price, photos, description, location, time posted, source URL).
    - Can be executed directly in DevTools Console or as a Bookmarklet.
    - Copies formatted Tá pro Brick JSON to clipboard and displays an on-screen preview modal with copy confirmation.
- [x] **Admin Import Feature (`AdminPage.tsx`)**:
  - Add an "Importar Anúncio (JSON)" button/modal in `/admin` to load extracted marketplace data in 1 click.
- [x] **Validation & Verification**:
  - Run `npm test` and ensure all tests pass.
  - Run `npm run build` with zero TypeScript errors.



