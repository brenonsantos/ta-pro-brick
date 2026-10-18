# PR: Ranking Semanal com Reset no Domingo às 00:00

## Motivação e Objetivo
Adicionar competição semanal ao jogo. Em vez de apenas um placar geral perpétuo, os jogadores disputam o campeonato da semana que se renova periodicamente, aumentando o engajamento diário.

## Solução Implementada
1. **Cálculo de Ciclo Semanal (`src/utils/dailyChallenge.ts`):**
   - Função `getCurrentWeekRange()` calcula o início da semana (Domingo às 00:00:00) e o fim (próximo Domingo às 00:00:00).
   - Formata a contagem regressiva para exibição na UI (`Zera em Xd Yh (domingo 00h)`).
2. **Serviço de Ranking Semanal (`src/services/rankingService.ts`):**
   - Função `getWeeklyLeaderboard()` agrega as pontuações e vitórias obtidas durante a semana corrente.
   - Suporte híbrido: consulta no Supabase filtrando por `completed_at >= startOfWeek` e fallback no `localStorage` com `completedAtIso`.
3. **Modal de Classificação (`src/components/LeaderboardModal.tsx`):**
   - Abas atualizadas para `Hoje (#X)` e `Semana`.
   - Ribbon com contagem regressiva até o reset de domingo.
   - Subtítulos claros indicando vitórias e partidas na semana.
   - Aviso no rodapé sobre o reset semanal no domingo às 00:00.
4. **Script SQL para Supabase (`supabase/weekly_leaderboard.sql`):**
   - View `public.view_leaderboard_weekly` configurada para fuso de Brasília.

## Verificação e Testes
- Adicionados testes de fronteira de data em `src/utils/__tests__/dailyChallenge.test.ts`.
- Adicionados testes de agregação de pontos semanais em `src/services/__tests__/rankingService.test.ts`.
- Suite completa passando: 50/50 testes (`npm test`).
- Build de produção verificado com sucesso (`npm run build`).
