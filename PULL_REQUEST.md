# Pull Request: Milestone 2 — Multi-Car Prototype & Gameplay Validation

## Summary of Changes
Expands the playable prototype from a single vehicle into a multi-car testing suite with 5 distinct vehicles, validating game balance, tolerances, and scoring across widely differing market price tiers:

- **5 Diverse Vehicle Challenges (`src/data/mockChallenges.json`):**
  1. **VW Gol GTS 1.8 1993 (R$ 48.900):** Iconic 90s hot hatch.
  2. **Fiat Uno Mille Fire 2002 (R$ 13.500):** Budget daily driver (validates the R$ 1,000 floor tolerance).
  3. **BMW 320i M Sport 2021 (R$ 219.000):** Modern premium sedan (validates 5% = ~R$ 11,000 absolute margin).
  4. **Chevrolet Opala Comodoro 4.1 1988 (R$ 78.000):** Classic Brazilian 6-cylinder collector car.
  5. **VW Fusca Itamar 1994 (R$ 95.000):** Overpriced collector novelty ("relíquia de garagem") to test market humor.
- **Vehicle Selector Navigation (`src/components/VehicleSelector.tsx`):**
  - Horizontal quick-switcher bar showing car names and completion checkmarks.
  - Independent round state preservation across switching between cars.
- **Round Advancement Flow (`src/components/VictoryModal.tsx`):**
  - Added "Jogar Próximo Carro de Teste 🚗" button upon round completion to cycle through the challenges.
- **Deployment Configuration (`vercel.json`):**
  - Added static routing and SPA rewrite configuration for instant one-click hosting on Vercel or similar platforms.

## Verification
- Unit Tests: 12 passing in Vitest (`npm test`).
- Production Build: Clean TypeScript compilation and Vite build with zero warnings (`npm run build`).

## Manual Testing Instructions
1. Open http://localhost:5173/ in browser.
2. Observe the top vehicle bar with all 5 cars.
3. Switch between cars (e.g. from Gol GTS to Uno Mille) and verify clues, photos, and state adapt dynamically.
4. Play through a car, finish the round, and use "Jogar Próximo Carro de Teste" to verify sequential progression.
