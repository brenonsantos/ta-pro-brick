# Implementation Plan - Milestone 2: Multi-Car Prototype & Gameplay Validation

## Objective
Expand the single-round prototype into a 5-car interactive showcase featuring diverse vehicle categories (budget car, classic, premium sedan, 6-cylinder muscle, and absurd collector price). Add a vehicle switcher and seamless next-round flow to allow thorough gameplay testing across different price scales, followed by deployment preparation.

---

## Tasks

### 1. Multi-Vehicle Mock Dataset
- [x] Create `src/data/mockChallenges.json` containing 5 detailed vehicle listings:
  1. **VW Gol GTS 1.8 1993 (R$ 48.900):** Iconic 90s hot hatch.
  2. **Fiat Uno Mille Fire 2002 (R$ 13.500):** Budget workhorse (tests the R$ 1,000 minimum floor margin).
  3. **BMW 320i M Sport 2021 (R$ 219.000):** Modern premium sedan (tests higher absolute tolerance).
  4. **Chevrolet Opala Comodoro 4.1 1988 (R$ 78.000):** Classic Brazilian 6-cylinder.
  5. **VW Fusca Itamar 1994 (R$ 95.000):** Overpriced collector novelty ("relíquia de garagem").

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
- [ ] User testing and review of multi-car experience before final deployment.
