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

---

## Milestone 12: Fullscreen Photo Lightbox with Pinch-to-Zoom & Pan (Mobile UX)
### Objective
Enable mobile and desktop players to inspect vehicle photos in high resolution by opening a dedicated fullscreen Lightbox modal upon tapping the car image or an expand button. Support pinch-to-zoom (touch), double-tap zoom (2.5x), drag/pan to explore details (rust, wheels, badge, interior), and swipe between photos.

### Tasks
- [x] **Photo Lightbox Component (`src/components/PhotoLightboxModal.tsx`)**:
  - Fullscreen dark overlay (`fixed inset-0 z-50 bg-black/95 backdrop-blur-md`).
  - Gesture support:
    - Double tap / Double click: toggle 1x and 2.5x zoom centered on touch position.
    - Pinch-to-zoom (touch): smooth scaling between 1x and 4x.
    - Drag / Pan when zoomed in (> 1x): move around the photo smoothly with boundary clamping.
    - Horizontal swipe when not zoomed (scale === 1): navigate previous/next photos.
  - Controls:
    - Top bar: Photo counter (e.g. `1/7`), micro-hint ("Dê 2 toques ou pince para zoom"), and close button (`✕`).
    - Bottom bar / Floating controls: Zoom In, Zoom Out, Reset, Prev, Next buttons for accessibility and desktop mouse users.
    - Keyboard navigation: ESC to close, Left/Right arrow keys to navigate.
- [x] **Integrate into `ClueViewer.tsx`**:
  - Add tap-to-open interaction on the main photo (`cursor-zoom-in` styling and subtle hint badge "🔍 Toque para ampliar").
  - Connect current photo index and list of unlocked photos to `PhotoLightboxModal`.
  - Maintain active photo index synchronized between card gallery and lightbox.
- [x] **Validation & Verification**:
  - Verify on desktop and mobile viewports.
  - Run `npm test` (39/39 passing) and `npm run build` (clean).
  - Verify touch gestures (pinch, double-tap, pan, swipe).

---

## Milestone 13: Browser Back Navigation Safety & Modal Lifecycle
### Objective
Prevent browser back actions from unintentionally leaving the site or closing newly opened tabs when dismissing modals, ensuring `history.back()` is only dispatched when a user-initiated navigation entry exists in the current session.

### Tasks
- [x] **Safety guard in `useBrowserBackClose.ts`**:
  - Add `isFirstRenderRef` to prevent pushing history states on the initial page mount.
- [x] **Safety checks in `modalHistoryManager.ts`**:
  - Track `hasPushedHistory` per modal entry and verify `window.history.state?.tpbModal === id` before calling `window.history.back()`.
- [x] **Initial state in `App.tsx`**:
  - Initialize `isVictoryModalOpen` to `false` so returning users land directly on the main screen without modal intrusion.
- [x] **Verification**:
  - Unit tests updated (52/52 passing). Real browser CDP automation verified tab stays open.

---

## Milestone 14: Weekly Leaderboard Widget on Main Screen
### Objective
When a player finishes today's daily challenge and returns to the main screen, display a Weekly Leaderboard preview widget below the `DailyCountdown` banner. This gives immediate competitive feedback (weekly rank, top 3 players, countdown to Sunday 00:00 reset) and a quick button to open the full leaderboard.

### Tasks
- [x] **Create `WeeklyLeaderboardWidget.tsx`**:
  - Display current week reset status ("Zera domingo 00h • Xd Yh restantes").
  - Player's current weekly position card (rank, nickname, total points, games played/won).
  - Top 3 leaderboard podium list (gold, silver, bronze medals).
  - "Ver Ranking Completo 🏆" button to open `LeaderboardModal` with the weekly tab preselected.
- [x] **Enhance `LeaderboardModal.tsx`**:
  - Support `initialTab?: 'daily' | 'weekly'` prop to switch to weekly tab when triggered by the widget.
- [x] **Integrate into `App.tsx`**:
  - Render `WeeklyLeaderboardWidget` below `DailyCountdown` when `gameMode === 'daily' && isDailyCompleted`.
  - Pass `onOpenWeeklyLeaderboard` callback to open `LeaderboardModal` with weekly tab.
- [x] **Unit Tests & Verification**:
  - Add unit tests for `WeeklyLeaderboardWidget` in `src/components/__tests__/WeeklyLeaderboardWidget.test.tsx`.
  - Verify `npm test` (54/54 passing) and `npm run build` (clean).
  - Visual verification with browser automation / preview screenshot.

---

## Milestone 15: End-Screen Streamlining (Hide Input, Compact Round Result & Native Mobile Share)
### Objective
Streamline the post-game experience on the main screen:
1. Hide the "Quanto o vendedor pediu?" input card once the round is completed since guessing is finished.
2. Directly display a compact, high-impact round result card on the main screen (Asking Price, Best Guess, Difference/Heat band, Total Score, and link to original listing), eliminating the need for a separate "Ver Resultado" button.
3. Integrate the Web Share API (`navigator.share`) so clicking "Compartilhar" on mobile devices opens the native OS share sheet (WhatsApp, Instagram, etc.), with automatic fallback to clipboard copy on desktop.

### Tasks
- [x] **Native Mobile Share Integration (`src/utils/shareText.ts`)**:
  - Implement `shareGameResult({ text, title })` with Web Share API support (`navigator.share`) and graceful clipboard fallback.
  - Unit tests added in `src/utils/__tests__/shareText.test.ts`.
- [x] **Compact Result in `DailyCountdown.tsx`**:
  - Receive score breakdown, asking price, best guess, and original listing URL.
  - Render compact 3-column metrics strip: Preço Real do Anúncio, Seu Melhor Chute (com heat indicator e diferença formatada), Pontuação Final.
  - Link to original ad ("Ver Anúncio Original no Marketplace ↗").
  - Removed redundant "Ver Resultado" button in favor of direct on-screen summary + subtle secondary link for full stats.
- [x] **Hide GuessInput on Completed in `App.tsx`**:
  - Conditionally hide `<GuessInput />` when `currentGameState.status === 'completed'`.
  - Connect `shareGameResult` to `handleShareDaily` and `VictoryModal.tsx`.
  - Fire celebration confetti directly on completion without forcing modal obstruction.
- [x] **Unit Tests & Verification**:
  - Added and updated unit tests for `DailyCountdown` and `shareText`.
  - Verified all 60 tests pass (`npm test`) and production build succeeds (`npm run build`).
  - Mobile viewport screenshot captured and verified.

---

## Milestone 16: Dual Daily & Weekly Ranking Widget on Home Screen
### Objective
Transform the post-game ranking widget on the home screen into a dual daily/weekly ranking hub with an intuitive tab switcher:
1. **Diário (Hoje)**: Displays player's position in today's challenge, score, attempts count, top 3 players of the day, and direct button to open the daily ranking table.
2. **Semanal**: Displays player's position in the weekly leaderboard, total points, countdown to Sunday 00:00 reset, top 3 players of the week, and direct button to open the weekly ranking table.

### Tasks
- [x] **Enhance `WeeklyLeaderboardWidget.tsx` (or `HomeLeaderboardWidget.tsx`)**:
  - Add segment toggle at the top: `[ 📅 Diário #X ] [ 🏆 Semanal ]`.
  - Fetch both `getDailyLeaderboard(challengeId)` and `getWeeklyLeaderboard()` concurrently.
  - Render relevant stats per tab:
    - Daily: shows `#X chutes • HH:mm` for each player, today's top 3, current player's daily position.
    - Weekly: shows `X vitórias • Y rodadas • Zera domingo 00h`, weekly top 3, current player's weekly position.
  - Support `onOpenLeaderboard(tab: 'daily' | 'weekly')` so clicking "Ver tabela completa" or the footer button opens `LeaderboardModal` with that exact active tab.
- [x] **Connect with `App.tsx`**:
  - Pass `challengeId` and `dayNumber` to the widget.
  - Forward `tab` from widget callback to `setLeaderboardInitialTab(tab)` and open `LeaderboardModal`.
- [x] **Unit Tests & Verification**:
  - Updated `src/components/__tests__/WeeklyLeaderboardWidget.test.tsx` to verify tab switching, daily and weekly content rendering, and callbacks.
  - Ran `npm test` (61 tests passing) and `npm run build` (clean).
  - Visual verification with mobile screenshots captured for both Daily and Weekly tabs.

---

## Milestone 17: Instant Challenge Loading & Elimination of Local Mock Flash
### Objective
Prevent the jarring flash where the local mock car (from `mockChallenges.json`) is rendered for a fraction of a second before being abruptly replaced by the live vehicle from Supabase.
1. Implement persistent client-side caching of published challenges (`taprobrick_cached_challenges_v1`) so returning players immediately see the real database challenge with zero latency and zero layout shift.
2. In `App.tsx`, initialize `challenges` synchronously from cache if present.
3. For cold starts (first visit before cache exists) when Supabase is configured, display a sleek, subtle skeleton loader instead of rendering an unrelated mock car that suddenly disappears.
4. If Supabase is unreachable or unconfigured, gracefully fall back to local mock challenges without delay.

### Tasks
- [x] **Challenge Caching in `src/services/challengeService.ts`**:
  - Added `getCachedChallenges()` and `saveCachedChallenges()`.
  - In `loadActiveChallenges()`, persisted Supabase results to localStorage.
  - Added `getInitialChallenges()` helper to synchronously return cached challenges if available.
- [x] **Skeleton / Smooth Loading in `src/App.tsx`**:
  - Initialized `challenges` using `getInitialChallenges()`.
  - Added `isLoadingChallenges` flag when Supabase is configured and no cache is present yet.
  - Rendered a clean skeleton view for the car / clues rather than flashing a local mock car.
- [x] **Unit Tests & Verification**:
  - Added tests for `getCachedChallenges`, `saveCachedChallenges`, `getInitialChallenges`, and `loadActiveChallenges` in `challengeService.test.ts`.
  - Verified all 65 unit tests pass (`npm test`) and build succeeds (`npm run build`).
  - Verified elimination of local car flash on initial page load.

---

## Milestone 18: Daily Ranking Percentile ("Melhor que X% dos jogadores")
### Objective
Update the text showing today's ranking in `WeeklyLeaderboardWidget` (and `LeaderboardModal`) to show the user's percentile ("Melhor que X% dos jogadores hoje" / "Superou X% dos pilotos") instead of generic static copy.

### Tasks
- [x] **Percentile Calculation Logic**:
  - Calculate `percentile` based on total players in today's challenge and the current player's rank:
    - If `totalPlayers <= 1` and player is rank 1: "Melhor que 100% dos jogadores hoje! 🏆"
    - If `totalPlayers > 1`: `percentile = Math.round(((totalPlayers - rank) / (totalPlayers - 1)) * 100)`
    - Formats:
      - 100%: "Melhor que 100% dos jogadores hoje! 🏆"
      - > 0%: `Melhor que ${percentile}% dos jogadores hoje 🔥`
      - 0% (last place): "Você completou o desafio de hoje! 🏁"
- [x] **Update `WeeklyLeaderboardWidget.tsx`**:
  - Replace the generic subtitle `"Classificação dos pilotos no desafio de hoje"` with the dynamic percentile text when the player has a ranking.
  - In player row, display the percentile pill/badge (`"Melhor que X%"`).
- [x] **Update `LeaderboardModal.tsx`**:
  - In the Daily tab, display the dynamic percentile banner when the player has completed today's challenge.
- [x] **Unit Tests & Verification**:
  - Update `WeeklyLeaderboardWidget.test.tsx` and test percentile rendering scenarios (100%, 80%, etc.).
  - Run `npm test` and `npm run build`.
  - Visual verification via mobile browser screenshot.

---

## Milestone 19: Automatic Transfer of Facebook Marketplace Photos to Supabase Storage
### Objective
Prevent broken images caused by Facebook CDN link expiration (`oe=` signed parameters) by automatically downloading photos extracted from Facebook Marketplace and re-hosting them permanently in Supabase Storage.
1. Extend `storageService.ts` with `isExternalPhotoUrl`, `uploadPhotoFromUrl`, and `transferExternalPhotosToStorage`.
2. Add automatic transfer option and progress indicators to `ImportChallengeModal.tsx` upon pasting extracted challenge JSON.
3. In `AdminPage.tsx`, detect external expiring links, display status badges in the photo gallery, and offer a 1-click migration button to convert all external URLs to Supabase Storage URLs.
4. Comprehensive unit tests and visual verification.

### Tasks
- [x] **Storage Service Expansion (`src/services/storageService.ts`)**:
  - Implement `isExternalPhotoUrl(url: string): boolean`.
  - Implement `uploadPhotoFromUrl(imageUrl: string, fileNamePrefix?: string): Promise<UploadPhotoResult>`.
  - Implement `transferExternalPhotosToStorage(photoUrls: string[], titlePrefix?: string, onProgress?: ...): Promise<TransferPhotosResult>`.
- [x] **Automatic Transfer on Import (`src/components/ImportChallengeModal.tsx`)**:
  - Add auto-upload checkbox (checked by default if Supabase is configured).
  - Show real-time transfer progress indicator (`Transferindo foto 2/5 para o Supabase...`).
  - Pass permanent Supabase URLs to `onImport`.
- [x] **Admin Panel Enhancements (`src/pages/AdminPage.tsx`)**:
  - Display expiration warning banner when Facebook/external URLs are detected.
  - Add 1-click button "☁️ Migrar fotos para o Supabase Storage".
  - Add visual badges to thumbnails (Green "Supabase" vs Orange "Facebook/Externo").
- [x] **Unit Tests & Verification**:
  - Create `src/services/__tests__/storageService.test.ts`.
  - Create `src/components/__tests__/ImportChallengeModal.test.tsx`.
  - Run full test suite (`npm test`) and production build (`npm run build`).
  - Capture UI screenshot and verify workflow.

---

## Milestone 20: Auto-Fill Next Available Publish Date in Admin Panel
### Objective
Automatically calculate and pre-fill the next available (unoccupied) date in the Admin challenge creation form, preventing date collisions and saving the curator from checking calendars manually.
1. Implement pure helper `getNextAvailablePublishDate` in `src/utils/publishDate.ts`.
2. Connect to `AdminPage.tsx` so the date field defaults to the earliest unoccupied date >= today.
3. Add collision warning badge when a date is already occupied, plus a 1-click "⚡ Próxima livre" shortcut.
4. Comprehensive unit tests and visual verification.

### Tasks
- [x] **Utility Implementation (`src/utils/publishDate.ts`)**:
  - Implement `getNextAvailablePublishDate(challenges, baseDate?)`.
  - Add comprehensive unit tests in `src/utils/__tests__/publishDate.test.ts` (7 tests).
- [x] **Admin Page Integration (`src/pages/AdminPage.tsx`)**:
  - Auto-set `publishDate` on initial load and form reset for new challenges.
  - Display collision warning if selected date is already assigned.
  - Add "⚡ Próxima livre" shortcut chip next to date label.
- [x] **Verification & PR**:
  - Run `npm test` (89/89 passing) and `npm run build` (clean).
  - Capture screenshot of Admin form with auto-filled date and collision indicator.
  - Create `docs/pr/PR_ADMIN_NEXT_FREE_PUBLISH_DATE.md`.

---

## Milestone 21: Admin Security (Supabase Auth, Strict RLS & Search Crawler Protection)
### Objective
Protect the application for real public production by securing the `/admin` portal with Supabase Auth (Email & Password), enforcing strict database and storage Row Level Security (RLS) rules (preventing tampering and hiding unreleased challenges from public queries), and blocking search crawlers via `robots.txt`.
1. Implement `authService.ts` for real Supabase session management and authentication.
2. Upgrade `AdminPage.tsx` to authenticate against Supabase Auth with smooth session persistence and offline fallback.
3. Write `supabase/secure_production_rls.sql` with hardened RLS policies for `challenges` and storage bucket.
4. Add `public/robots.txt` and `public/sitemap.xml`.
5. Unit tests, production build, and PR documentation.

### Tasks
- [x] **Auth Service (`src/services/authService.ts`)**:
  - Implement `signInAdmin`, `signOutAdmin`, `getAdminSession`, `subscribeToAuthChanges`, `isUserAdmin`.
  - Add unit tests in `src/services/__tests__/authService.test.ts` (11 tests) including tests for `is_admin` validation and non-admin sign-out.
- [x] **Admin Portal Security (`src/pages/AdminPage.tsx`)**:
  - Implement email/password form powered by Supabase Auth with persistent session restore.
  - Maintain offline developer fallback when Supabase is not configured.
- [x] **Production SQL RLS Migration (`supabase/secure_production_rls.sql`)**:
  - Add `public.is_admin()` function checking `app_metadata` / `user_metadata` for `is_admin: true`.
  - Restrict `INSERT`, `UPDATE`, `DELETE` on `challenges` to `public.is_admin()` only.
  - Restrict `SELECT` on `challenges` for `anon` to published challenges on or before current date; admins see all.
  - Restrict storage modifications in bucket `challenges` to `public.is_admin()` only.
  - Provide SQL snippet to promote existing users: `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb WHERE email = '...';`.
- [x] **SEO & Crawler Protection**:
  - Create `public/robots.txt` (disallow `/admin`).
  - Create `public/sitemap.xml`.
- [x] **Verification & PR**:
  - Run full test suite (`npm test`, 100/100 passing) and build (`npm run build`).
  - Capture visual verification of authenticated login.
  - Create `docs/pr/PR_ADMIN_SECURITY_SUPABASE_AUTH_RLS.md`.







